const queryHackerNews = require('./queryHackerNews')
const queryHackerDaily = require('./queryHackerDaily')
const unixToIsoString = require('./unixToIsoString')

const fetchUserQuery = `
  query ($user: String!) {
    user(id: $user) {
      id
    }
  }
`

const createUserQuery = `
  mutation ($id: String!, $about: String, $karma: Int!, $joinedAt: timestamptz!) {
    insert_user(object: {id: $id, about: $about, karma: $karma, joined_at: $joinedAt}) {
      id
      about
      karma
      joined_at
    }
  }
`

/**
 * fetchOrCreateUser - Check if the user exists and if not create a new user
 *
 * @param {String} userId The username
 *
 * @return {void}
 */
module.exports = async userId => {
  const { user } = await queryHackerDaily(fetchUserQuery, { user: userId })
  if (user) return

  if (!user) {
    const newUser = await queryHackerNews(`user/${userId}`)

    if (newUser) {
      const { id, about, karma, created } = newUser
      const joinedAt = unixToIsoString(created)

      await queryHackerDaily(createUserQuery, { id, about, karma, joinedAt })
    }
  }
}
