const {getAsyncMethodResult} = require('../libs/util')

const arrayMethods ={
	forEach(fn, context=this) {
		for(let i = 0; i < this.length; i++) {
			getAsyncMethodResult(fn,[this[i],i,this],context)
		}
	},
	some(fn, context=this) {
		for(let i = 0; i < this.length; i++) {
			let result = getAsyncMethodResult(fn,[this[i],i,this],context)
			if(result){
				return true
			}
		}
		return false
	},
	every(fn, context=this) {
		for(let i = 0; i < this.length; i++) {
			let result = getAsyncMethodResult(fn,[this[i],i,this],context)
			if(!result){
				return false
			}
		}
		return true
	},
	map(fn, context=this) {
		let result = []
		for(let i = 0; i < this.length; i++) {
			result.push(getAsyncMethodResult(fn,[this[i],i,this],context))
		}
		return result
	},
	filter(fn, context=this) {
		let result = []
		console.log('res',this.length)
		for(let i = 0; i < this.length; i++) {
			let res = getAsyncMethodResult(fn,[this[i],i,this],context)
			if(res){
				result.push(this[i])
			}
		}
		return result
	},
	reduce(fn,val=0) {
		for(let i = 0; i < this.length; i++) {
			val = getAsyncMethodResult(fn,[val,this[i],i,this],this)
		}
		return val
	},
	find(fn, context=this) {
		for(let i = 0; i < this.length; i++) {
			if(getAsyncMethodResult(fn,[this[i],i,this],context)){
				return this[i]
			}
		}
	},
	findIndex(fn, context=this) {
		for(let i = 0; i < this.length; i++) {
			if(getAsyncMethodResult(fn,[this[i],i,this],context)){
				return i
			}
		}
	}
}

module.exports = arrayMethods
