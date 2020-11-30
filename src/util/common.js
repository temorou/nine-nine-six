const Fiber = require('fibers')

Date.prototype.Format = function (fmt= 'yyyy-MM-dd') {
	const o = {
		'M+': this.getMonth() + 1,
		'd+': this.getDate(),
		'H+': this.getHours(),
		'm+': this.getMinutes(),
		's+': this.getSeconds(),
		'S+': this.getMilliseconds()
	}
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
	}
	for (let k in o) {
		if (new RegExp('(' + k + ')').test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(String(o[k]).length)))
		}
	}
	return fmt
}

function sleep(time) {
	let f = Fiber.current
	setTimeout(()=>{
		f.run()
	},time)
	Fiber.yield()
}

/**
 *
 * @param code
 * @param millisec
 * @param args
 * @private
 */
function _setInterval(code,millisec,...args){
	setInterval(()=>{
		Fiber(function(){
			code(...args)
		}).run()
	},millisec)
}

/**
 *
 * @param code
 * @param millisec
 * @param args
 * @private
 */
function _setTimeout(code,millisec,...args){
	setTimeout(()=>{
		Fiber(function(){
			code(...args)
		}).run()
	},millisec)
}

function random() {
	return `${Date.now()%86400000}${parseInt(Math.random()*10**8)}`
}
module.exports = {
	sleep,
	_setInterval,
	_setTimeout,
	random
}
