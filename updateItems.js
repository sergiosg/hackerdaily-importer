const queryHackerNews = require('./helpers/queryHackerNews')
const fetchOldestSavedItem = require('./helpers/fetchOldestSavedItem')
const upsertUser = require('./helpers/upsertUser')
const upsertItem = require('./helpers/upsertItem')

/**
 * randomTimeout - Wait a random amount of time before executing the function
 * to decrease the peak load on the back-end
 *
 * @param {Function} fn Function to call after timeout
 * @param {*} variable Variables for function
 *
 * @return {Result of fn} The invoked function
 */
const randomTimeout = async (fn, variable) => {
  const time = Math.random() * 20000
  await new Promise(resolve => setTimeout(resolve, time))
  return fn(variable)
}

let previousUpdates

/**
  * updateItems - Update all updated items that already exist in the HackerDaily back-end
  *
  * @return {void}
  */
module.exports = async () => {
  const updates = await queryHackerNews('updates')

  // Check if the updates have already been processed
  if (!updates || JSON.stringify(updates) === previousUpdates) return
  previousUpdates = JSON.stringify(updates)

  const oldestSavedItem = await fetchOldestSavedItem()
  const relevantItems = updates.items.filter(itemId => itemId >= oldestSavedItem)

  await Promise.all([
    ...updates.profiles.map(profile => randomTimeout(upsertUser, profile)),
    ...relevantItems.map(item => randomTimeout(upsertItem, item))
  ])

  console.log(`Updated ${updates.items.length} items and ${updates.profiles.length} users`)
}
