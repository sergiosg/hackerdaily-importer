const fetchItemsToFetch = require('./helpers/fetchItemsToFetch')
const upsertItem = require('./helpers/upsertItem')

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
    const item = await upsertItem(itemId)

    // Update to the console
    const itemType = item ? item.type : 'null'
    const percentageDone = ((itemId - itemsToFetch[0]) / itemsToFetch.length * 100).toFixed(3)
    console.log(`${itemType.padEnd(7)} - ${item.id} (${percentageDone}%)`)
  }
  console.log('Finished!')
}
