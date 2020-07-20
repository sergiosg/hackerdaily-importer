const fetchItemsToFetch = require('./helpers/fetchItemsToFetch')
const queryHackerNews = require('./helpers/queryHackerNews')
const upsertUser = require('./helpers/upsertUser')
const upsertStory = require('./helpers/upsertStory')
const upsertComment = require('./helpers/upsertComment')

/**
  * fetchNewItems - Fetch all items that have been added since the last update
  *
  * @return {void}
  */
module.exports = async () => {
  // Fetch an array of all new items
  const itemsToFetch = await fetchItemsToFetch()
  console.log(`${itemsToFetch.length} new items`)

  // Loop over all new item IDs
  for (const itemId of itemsToFetch) {
    // Fetch the item and skip if the item is null
    const item = await queryHackerNews(`item/${itemId}`)
    if (item === null) continue

    // Create the user if it doesn't exist yet
    if (item.by) await upsertUser(item.by)

    // Create the story or comment
    if (item.type === 'story') upsertStory(item)
    else if (item.type === 'comment') upsertComment(item)

    // Update to the console
    const percentageDone = ((itemId - itemsToFetch[0]) / itemsToFetch.length * 100).toFixed(3)
    console.log(`${item.type.padEnd(7)} - ${item.id} (${percentageDone}%)`)
  }
  console.log('Finished!')
}
