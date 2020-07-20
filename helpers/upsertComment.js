const queryHackerDaily = require('./queryHackerDaily')
const fetchAscendants = require('./fetchAscendants')
const unixToIsoString = require('./unixToIsoString')

const query = `
  mutation ($comment: comments_insert_input!) {
    insert_comment(object: $comment, on_conflict: {constraint: comments_pkey, update_columns: [text, user_id, story_id, parent_comment_id, ]}) {
      id
    }
  }
`

/**
  * upsertComment - Create or update a comment in the HackerDaily back-end
  *
  * @param {object} comment Comment that gets created/updated
  *
  * @return {void}
  */
module.exports = async ({ id, by, text, parent, time }) => {
  const { story, parentComment } = await fetchAscendants(parent)
  if (!story) return

  const comment = {
    id,
    text,
    user_id: by,
    story_id: story,
    parent_comment_id: parentComment,
    posted_at: unixToIsoString(time)
  }

  await queryHackerDaily(query, { comment })
}
