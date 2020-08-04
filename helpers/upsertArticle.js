const getUrls = require('get-urls')
const parse = require('url-parse')
const queryHackerDaily = require('./queryHackerDaily')
const queryScrapinghub = require('./queryScrapinghub')

const findWebpageQuery = `
  query ($url: String!) {
    webpage(url: $url) {
      url
      article_id
      not_an_article
    }
  }
`

const upsertArticleQuery = `
  mutation ($article: articles_insert_input!) {
    insert_article (object: $article, on_conflict: {constraint: articles_canonical_url_key, update_columns: []}) {
      id
    }
  }
`

const updateWebpageQuery = `
  mutation ($url: String!, $article: Int!) {
    update_webpage(pk_columns: {url: $url}, _set: {article_id: $article}) {
      url
      article_id
    }
  }
`

const notAnArticleQuery = `
  mutation ($url: String!) {
    update_webpage(pk_columns: {url: $url}, _set: {not_an_article: true}) {
      url
    }
  }
`

/**
 * checkIfMainImageUnique - Check if the main image is not also used in the article
 *
 * @param {String!} html The HTML of the article
 * @param {String!} mainImageUrl The URL of the image
 *
 * @return {Boolean!} Whether or not the image is in the article
 */
const checkIfMainImageUnique = (html, mainImageUrl) => {
  if (!mainImageUrl || typeof mainImageUrl !== 'string') return false

  // Get the path of the main image
  const parsedMainImage = parse(mainImageUrl)
  const mainImagePath = parsedMainImage.hostname + parsedMainImage.pathname

  // Get an array with all urls in the article
  const urlsInArticle = Array.from(getUrls(html))

  // Check if any of the URL's are equal to the of main image
  const mainImageIsInArticle = urlsInArticle.some(url => {
    const parsedImage = parse(url)
    const imagePath = parsedImage.hostname + parsedImage.pathname
    return imagePath === mainImagePath
  })

  return !mainImageIsInArticle
}

/**
 * checkIfValidArticle - Check if the article looks valid enough
 *
 * @param {Object} article The article object from Scrapinghub
 *
 * @return {Boolean} Whether or not it is a valid article
 */
const checkIfValidArticle = (article) => {
  if (!article) return false

  const requiredFields = ['headline', 'inLanguage', 'articleBody', 'articleBodyHtml', 'probability']
  const containsAllRequiredFields = requiredFields.every(field => article[field] !== undefined)

  return containsAllRequiredFields && article.probability > 0.05
}

/**
* upsertArticle - Insert or update an article
*
* @param {String} url The URL of the article
*
* @return {void}
*/
module.exports = async (url) => {
  // Fetch the webpage from HackerDaily
  const { webpage } = await queryHackerDaily(findWebpageQuery, { url })

  // Check if the webpage exists but does not yet have an article
  if (webpage && !webpage.article_id && !webpage.not_an_article) {
    // Scrape the article from Scrapinghub
    const [{ article }] = await queryScrapinghub(url)

    // If it is a valid article, add it to the HackerDaily database,
    // otherwise set not_an_article to true
    if (checkIfValidArticle(article)) {
      // Strip the article tags from the HTML
      const strippedHtml = article.articleBodyHtml
        ? article.articleBodyHtml.replace(/^<article>/, '').replace(/<\/article>$/, '')
        : ''

      const articleFields = {
        canonical_url: article.canonicalUrl || url,
        headline: article.headline,
        published_at: article.datePublished,
        modified_at: article.dateModified,
        author: article.author,
        language: article.inLanguage,
        main_image: article.mainImage,
        main_image_unique: checkIfMainImageUnique(strippedHtml, article.mainImage),
        description: article.description,
        text: article.articleBody,
        html: strippedHtml,
        probability: article.probability,
        length: article.articleBody ? article.articleBody.split(' ').length : null
      }

      const response = await queryHackerDaily(upsertArticleQuery, { article: articleFields })

      // If the article was succesfully added, add the ID to the webpage
      if (response && response.insert_article && response.insert_article.id) {
        await queryHackerDaily(updateWebpageQuery, { url, article: response.insert_article.id })
      }
    } else {
      await queryHackerDaily(notAnArticleQuery, { url })
    }
  }
}
