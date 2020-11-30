const edit = require('./edit')
const item = require('./item')
const random = require('./random')
const common = require('./common')

module.exports = {
	...edit,
	...item,
	...random,
	...common
}
