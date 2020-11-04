const Fiber = require('fibers');

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
