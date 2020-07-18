const queryHackerNews = require('./queryHackerNews')
const queryHackerDaily = require('./queryHackerDaily')

const maxStoryAndCommentQuery = `
  {
    stories_aggregate {
      aggregate {
        max {
          id
        }
      }
    }
    comments_aggregate {
      aggregate {
        max {
          id
        }
      }
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

  const response = await queryHackerDaily(maxStoryAndCommentQuery)

  const maxStory = response.stories_aggregate.aggregate.max.id
  const maxComment = response.comments_aggregate.aggregate.max.id

  const maxSavedItem = Math.max(maxStory, maxComment) || maxNewItem - 10000

  // Return an array with all item IDs that need to be fetched
  return Array(maxNewItem - maxSavedItem).fill().map((_, index) => maxSavedItem + index + 1)
}
