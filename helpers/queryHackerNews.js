const fetch = require('node-fetch')
require('dotenv').config()

/**
 * queryHackerNews - Fetch data from the HN API
 *
 * @param {String!} query The query for the HN API
 *
 * @return {Object} The data from the Hacker News server
 */
module.exports = async query => {
  try {
    const response = await fetch(`${process.env.HN_URL}/${query}.json`)
    const json = await response.json()
    return json
  } catch (error) {
    console.error(error)
  }
}
