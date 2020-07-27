const importNewItems = require('./importNewItems')
const updateItems = require('./updateItems')

importNewItems()
updateItems()

setInterval(updateItems, 25000)
