const queryHackerNews = require('./helpers/queryHackerNews')
const upsertUser = require('./helpers/upsertUser')
const upsertItem = require('./helpers/upsertItem')

let previousUpdates

/**
  * updateItems - Update all updated items that already exist in the HackerDaily back-end
  *
  * @return {void}
  */
module.exports = async () => {
  const updates = await queryHackerNews('updates')
  if (!updates || JSON.stringify(updates) === previousUpdates) return

  await Promise.all(updates.profiles.map(upsertUser))
  await Promise.all(updates.items.map(upsertItem))

  previousUpdates = JSON.stringify(updates)
  console.log(`Updated ${updates.items.length} items and ${updates.profiles.length} users`)
}
