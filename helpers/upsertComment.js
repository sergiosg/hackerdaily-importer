const Sentiment = require('sentiment')
const queryHackerDaily = require('./queryHackerDaily')
const fetchAscendants = require('./fetchAscendants')
const unixToIsoString = require('./unixToIsoString')

var sentiment = new Sentiment()

const query = `
  mutation ($comment: comments_insert_input!) {
    insert_comment(object: $comment, on_conflict: {constraint: comments_pkey, update_columns: [text, user_id, story_id, parent_comment_id, sentiment]}) {
      id
    }
  }
`

/**
 * measureSentiment - Estimate the amount of positivity in a comment
 *
 * @param {String} text The text of the comment
 *
 * @return {Number} The amount of positivite sentiment
 */
const measureSentiment = (text) => {
  if (!text) return null

  // Remove quotes since they're not written by the commenter
  const cleanedText = text
    .split('<p>')
    .filter(sentence => !sentence.startsWith('&gt;'))
    .join(' ')
    .replace(/&#x27;/g, '\'')

  const { comparative } = sentiment.analyze(cleanedText)
  return Math.min(Math.max(comparative + 1, 0.5), 1.5)
}

/**
  * upsertComment - Create or update a comment in the HackerDaily back-end
  *
  * @param {object} comment Comment that gets created/updated
  *
  * @return {void}
  */
module.exports = async ({ id, by, text, parent, time, deleted = false, dead = false }) => {
  const { story, parentComment } = await fetchAscendants(parent)
  if (!story) return

  const comment = {
    id,
    text,
    deleted,
    dead,
    length: text ? text.split(' ').length : null,
    sentiment: measureSentiment(text),
    user_id: by,
    story_id: story,
    parent_comment_id: parentComment,
    posted_at: unixToIsoString(time)
  }

  await queryHackerDaily(query, { comment })
}
