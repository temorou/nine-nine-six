const Page = require('./instance/page')
const Fiber = require('fibers')
const common = require('./libs/common')

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

module.exports = {run,...common,Fiber}

