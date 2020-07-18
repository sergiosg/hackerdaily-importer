const { GraphQLClient } = require('graphql-request')
require('dotenv').config()

const client = new GraphQLClient(process.env.BACKEND_URL, {
  headers: {
    'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET
  }
})

/**
 * queryHackerDaily - Fetch or mutate data on the HackerDaily server
 *
 * @param {GQL String!} query GQL query
 * @param {Object} variables Optional object with GQL variables
 *
 * @return {Object} The data from the HackerDaily server
 */
const hackerDaily = async (query, variables) => {
  try {
    const response = await client.request(query, variables)
    return response
  } catch (error) {
    // If there was a 'FetchError', try again, otherwise return undefined
    if (error.name === 'FetchError') {
      console.error('There was a fetch error')
      return await hackerDaily(query, variables)
    }
    console.error(error)
  }
}

module.exports = hackerDaily
