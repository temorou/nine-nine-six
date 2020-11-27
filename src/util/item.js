const {edit,getChildEdit} = require('./edit')
const {randomValue} = require('./random')

function getItemValue(item){
	let {type,child} = getChildEdit(item)||{}
	if(type){
		let editUtil = edit[type]
		return editUtil.getValue(child)
	}
}

function setItemRandomValue(item){
	let {type,child} = getChildEdit(item)||{}
	if(type){
		let editUtil = edit[type]
		if(editUtil.setRandomValue){
			return editUtil.setRandomValue(child)
		}
		let op = editUtil.getOptions&&editUtil.getOptions(child)
		if(op){
			let enumValues = Object.keys(op)
			let value = enumValues[parseInt(Math.random()*enumValues.length)]
			editUtil.setValue(child,value)
			return value
		}
		let value = randomValue(item)
		editUtil.setValue(child,value)
	}
}

function setItemValue(item,value){
	let {type,child} = getChildEdit(item)||{}
	if(type){
		let editUtil = edit[type]
		return editUtil.setValue(child,value)
	}
}

function clearItemValue(item){
	let {type,child} = getChildEdit(item)||{}
	if(type){
		let editUtil = edit[type]
		return editUtil.clear(child)
	}
}

module.exports = {
	getItemValue,
	setItemRandomValue,
	setItemValue,
	clearItemValue
}
