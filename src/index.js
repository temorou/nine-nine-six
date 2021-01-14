const Page = require('./instance/page')
const Fiber = require('fibers')
const util = require('./util')

/**
 *
 * @param config
 * @param callback
 */
function run(config={},callback){
	Fiber(function(){
		let page =Page.build(config)
		let self = page.getGlobal()
		let {
			route,
			router,
			store
		} = self.__initPageGlobalFunctions.getCommonComponent()
		callback.call(self,{page,window:self,route,router,store})
	}).run()
}
function initMocha(){
	['describe','it','before','after','beforeEach','afterEach'].forEach(key=>{
		let buffer = global[key]
		Object.defineProperty(global, key, {
			get(){
				return function (...args) {
					args = args.map(arg=>{
						if(typeof arg==='function'){
							return async function (...a) {
								let that = this
								return await new Promise(function (resolve, reject) {
									Fiber(function () {
										let res
										try {
											res = arg.apply(that,a)
											resolve(res)
										}catch (e) {
											reject(e)
										}
									}).run()
								})
							}
						}
						return arg
					})
					buffer.apply(this,args)
				}
			},
			set(v) {
				buffer = v
			}
		})
	})
}
if(global.describe){
	initMocha()
}

module.exports = {run,Fiber,...util}

