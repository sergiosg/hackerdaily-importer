const queryHackerDaily = require('./queryHackerDaily')
const upsertArticle = require('./upsertArticle')
const unixToIsoString = require('./unixToIsoString')

const upsertWebpageQuery = `
  mutation ($url: String!) {
    insert_webpage(object: {url: $url}, on_conflict: {constraint: webpages_pkey, update_columns: [url]}) {
      url
    }
  }
`

const storyQuery = `
  mutation ($story: stories_insert_input!) {
    insert_story(object: $story, on_conflict: {constraint: stories_pkey, update_columns: [user_id, title, text, url, score, descendants, dead]}) {
      id
    }
  }
`

/**
  * upsertStory - Create or update a story in the HackerDaily back-end
  *
  * @param {Object} item Story that gets created/updated
  *
  * @return {void}
  */
module.exports = async ({ id, by, title, text, url = null, score, descendants, dead, time }) => {
  // Create or update the webpage item if the item has a URL
  if (url) {
    await queryHackerDaily(upsertWebpageQuery, { url })
    if (score > 40) await upsertArticle(url)
  }

  const story = {
    id,
    user_id: by,
    title,
    text,
    url,
    score,
    descendants,
    dead,
    posted_at: unixToIsoString(time)
  }

  await queryHackerDaily(storyQuery, { story })
}
