const fetch = require('node-fetch')
require('dotenv').config()

module.exports = async url => {
  const params = {
    method: 'POST',
    body: JSON.stringify([{ pageType: 'article', url }]),
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${process.env.SCRAPINGHUB_KEY}`
    }
  }

  try {
    const response = await fetch(process.env.SCRAPINGHUB_URL, params)
    const json = await response.json()
    return json
  } catch (error) {
    console.error(error)
  }
}
