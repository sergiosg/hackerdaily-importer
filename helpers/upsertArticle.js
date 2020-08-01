const queryHackerDaily = require('./queryHackerDaily')
const queryScrapinghub = require('./queryScrapinghub')

const findWebpageQuery = `
  query ($url: String!) {
    webpage(url: $url) {
      url
      article_id
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
  if (webpage && !webpage.article_id) {
    // Scrape the article from Scrapinghub
    const [{ article }] = await queryScrapinghub(url)

    // If the Scrapinghub api returned an article, add it to the HackerDaily database
    if (article) {
      // Strip the article tags from the HTML
      const strippedHtml = article.articleBodyHtml
        ? article.articleBodyHtml.replace(/^<article>/, '').replace(/<\/article>$/, '')
        : ''

      const articleFields = {
        canonical_url: article.canonicalUrl || '',
        headline: article.headline || '',
        published_at: article.datePublished,
        modified_at: article.dateModified,
        author: article.author,
        language: article.inLanguage || '',
        main_image: article.mainImage,
        description: article.description,
        text: article.articleBody || '',
        html: strippedHtml,
        probability: article.probability,
        length: article.articleBody ? article.articleBody.split(' ').length : null
      }

      const response = await queryHackerDaily(upsertArticleQuery, { article: articleFields })

      // If the article was succesfully added, add the ID to the webpage
      if (response && response.insert_article && response.insert_article.id) {
        await queryHackerDaily(updateWebpageQuery, { url, article: response.insert_article.id })
      }
    }
  }
}
