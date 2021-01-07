const queryHackerNews = require('./queryHackerNews')
const queryHackerDaily = require('./queryHackerDaily')

const allStoryAndCommentIds = `
{
  stories {
    id
  }
  comments {
    id
  }
}
`

/**
 * fetchItemsToFetch - Return the items between the last item in the HackerDaily backend and the newest item on Hacker News
 *
 * @return {Array} Array with all new post IDs
 */
module.exports = async () => {
  const maxNewItem = await queryHackerNews('maxitem')

  if (!maxNewItem || typeof maxNewItem !== 'number') {
    throw new Error('Max item on HN is not defined')
  }

  const { stories, comments } = await queryHackerDaily(allStoryAndCommentIds)
  const items = [...stories.map(({ id }) => id), ...comments.map(({ id }) => id)].sort()

  const firstItemToFetch = Math.max(items[0], maxNewItem - 10000)

  const itemsToFetch = []
  for (let i = firstItemToFetch; i <= maxNewItem; i++) {
    if (!items.includes(i)) itemsToFetch.push(i)
  }

  return itemsToFetch
}
