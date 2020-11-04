const Fiber = require('fibers');
const {JSHandle} = require('puppeteer/lib/cjs/puppeteer/common/JSHandle.js')
const {sleep,random} = require('./common')
const {timeout} = require('./config')

/**
 * 将CLASS的async转到Fiber，防止在async调用纤程
 * @param cls
 */
function buildFiberObject(cls){
  [cls,cls.prototype].forEach(target=>{
    Object.getOwnPropertyNames(target).forEach(prop=>{
      if(Object.prototype.toString.call(target[prop]) != '[object AsyncFunction]'){
        return
      }
      let fun = target[prop]
      target[prop]= function(...args){
        return getAsyncMethodResult(fun,args,this)
      }
    })
  })
}

const getSerializeFunction = (function(){
  const serializeFunctionCache = {}
  return function(page,fun) {
    let keys = Object.keys(serializeFunctionCache)
    for(let key of keys){
      if(serializeFunctionCache[key]===fun){
        return key
      }
    }
    let serializeName = `__serialize__${random()}__function__`
    page.__cacheMethod[serializeName] = (...args)=>{
      Fiber(function(){
        fun(...args)
      }).run()
    }
    serializeFunctionCache[serializeName]=fun
    return serializeName
  }
})()

/**
 * 将作为参数的函数，缓存，转成按缓存标识调用
 * @param page
 * @param value
 * @returns {string|*}
 */
function serializeFunction(page,value){
  if(value instanceof JSHandle){
    return value
  }
  if(typeof value==='function'){
    return getSerializeFunction(page,value)
  }
  if(typeof value==='object'){
    for(let i in value){
      value[i] = serializeFunction(page,value[i])
    }
  }
  return value
}

/**
 * 查找vue节点
 * @param page
 * @param pNode
 * @param tag
 * @param css
 * @param prop
 * @returns {Promise<{jsHandle: *, page: *, type: *, value: *}>}
 */
async function findVueNodes({page,pNode,tag,css,prop}){
  let jsHandle = await page.evaluateHandle(async (pNode,{tag,css,prop}) => {
    let el = __initPageGlobalFunctions.getElement(pNode)||document.body
    let elment = null
    if(css){
      elment =  el.querySelectorAll(css)
    }else{
      elment =  el.querySelectorAll('*')
    }
    elment = [].slice.call(elment).map(e=>{
      return  __initPageGlobalFunctions.getComponentInstance(e)
    }).filter(e=>e)
    elment = Array.from(new Set(elment))
    if(tag){
      let newArr = []
      for(let e of elment){
        if(__initPageGlobalFunctions.getComponentName(e)===tag){
          newArr.push(e)
        }
      }
      elment = newArr
    }
    return elment
  }, pNode,{tag,css,prop})
  let {value,type} = await getHandleValue(page,jsHandle)
  return {value,type,jsHandle,page}
}

/**
 * 查找vue节点
 * @param page
 * @param pNode
 * @param tag
 * @param css
 * @param prop
 * @returns {Promise<{jsHandle: *, page: *, type: *, value: *}>}
 */
async function findVueNode(...args){
  let {jsHandle} = await findVueNodes(...args)
  let {page} = args[0]
  let singleHandle = await page.evaluateHandle( jsHandle => {
    return jsHandle[0]
  }, jsHandle)
  let {value,type} = await getHandleValue(page,singleHandle)
  return {value,type,jsHandle:singleHandle,page}
}

async function getLength({page,jsHandle,prop}){
  let value = await page.evaluate(async (jsHandle,prop) => {
    prop = Array.isArray(prop)?prop:[prop]
    if(prop.length==0){
      return Array.isArray(jsHandle)?jsHandle.length:1
    }
    if(!jsHandle||!prop){
      return 0
    }
    let arr =  __initPageGlobalFunctions.getProp(vInstance,prop)
    return arr&&arr.length
  }, jsHandle,prop)
  return value
}

async function getHandleValue(page,handle){
  return await page.evaluate((handle) => {
    let type = typeof handle
    if(['number','string','undefined','boolean'].includes(type)){
      return {
        value:handle,
        type,
      }
    }
    try {
      let value = JSON.parse(JSON.stringify(handle))
      return {
        value,
        type,
      }
    }catch (e) {
      return {
        type
      }
    }
  }, handle)
}

/**
 *
 * @param page
 * @param jsHandle
 * @param prop
 * @returns {Promise<{jsHandle: *, page: *, type: *, value: *}>}
 */
async function getProp({page,jsHandle,prop}){
  let handle = await page.evaluateHandle((jsHandle,prop) => {
    prop = prop||[]
    prop = Array.isArray(prop)?prop:[prop]
    jsHandle = jsHandle||window
    return __initPageGlobalFunctions.getProp(jsHandle,prop)
  }, jsHandle,prop)
  let {value,type} = await getHandleValue(page,handle)
  return {value,type,jsHandle:handle,page}
}

/**
 *
 * @param fun
 * @param args
 * @param target
 * @returns {*}
 */
function getAsyncMethodResult(fun,args,target){
  args = args||[]
  if(!Array.isArray(args)){
    args = [args]
  }
  if(Object.prototype.toString.call(fun) != '[object AsyncFunction]'){
    return fun.apply(target,args)
  }
  let res
  let f = Fiber.current
  fun.apply(target,args).then(data=>{
    res = data
    f.run()
  })
  Fiber.yield()
  return res
}

/**
 *
 * @param obj
 * @returns {*}
 */
function typeOf(obj) {
  const toString = Object.prototype.toString;
  const map = {
    '[object Boolean]'  : 'boolean',
    '[object Number]'   : 'number',
    '[object String]'   : 'string',
    '[object Function]' : 'function',
    '[object Array]'    : 'array',
    '[object Date]'     : 'date',
    '[object RegExp]'   : 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]'     : 'null',
    '[object Object]'   : 'object'
  };
  return map[toString.call(obj)];
}

/**
 *
 * @param data
 * @returns {{}|*}
 */
function deepCopy(data) {
  const t = typeOf(data);
  let o;

  let jsHandle = data&&data.getJsHandle&&data.getJsHandle()
  if(jsHandle){
    return jsHandle
  }
  if (t === 'array') {
    o = [];
  } else if ( t === 'object') {
    o = {};
  } else {
    return data;
  }

  if (t === 'array') {
    for (let i = 0; i < data.length; i++) {
      o.push(deepCopy(data[i]));
    }
  } else if ( t === 'object') {
    for (let i in data) {
      o[i] = deepCopy(data[i]);
    }
  }
  return o;
}

/**
 *
 * @param page
 * @param jsHandle
 * @param prop
 * @param value
 * @returns {Promise<*>}
 */
async function setProp({page,jsHandle,prop,value}){
  let serializeValue = serializeFunction(page,deepCopy(value))
  await page.evaluate(async (jsHandle,prop,value) => {
    prop = prop||[]
    prop = Array.isArray(prop)?prop:[prop]
    jsHandle = jsHandle||window
    __initPageGlobalFunctions.setProp(jsHandle,prop,value)
  }, jsHandle,prop,serializeValue)
  return value
}

/**
 *
 * @param page
 * @param jsHandle
 * @param prop
 * @param arg
 * @param parentHandle
 * @returns {Promise<{jsHandle: *, page: *, type: *, value: *}>}
 */
async function doMethod({page,jsHandle,prop,arg,parentHandle}){
  let serializeArg = serializeFunction(page,deepCopy(arg))
  let handle = await page.evaluateHandle(async (jsHandle,prop,parentHandle,...arg) => {
    prop = prop||[]
    prop = Array.isArray(prop)?prop:[prop]
    jsHandle = jsHandle||window
    return await __initPageGlobalFunctions.doMethod(jsHandle,prop,arg,parentHandle)
  }, jsHandle,prop,parentHandle,...serializeArg)
  let {value,type} = await getHandleValue(page,handle)
  return {value,type,jsHandle:handle,page}
}

/**
 *
 * @param page
 * @returns {Promise<void>}
 */
function waitForResponse(page){
  if(page&&page.waitFor&&page.urls){
    let tId = setTimeout(()=>{
      page.urls = []
    },timeout)
    while (page.urls.length){
      sleep(1)
    }
    clearTimeout(tId)
  }
}

/**
 *
 * @param item
 * @returns {Promise<*>}
 */
async function getValue(item){
  try {
    return await item.valueOf()
  }catch (e) {
    return item
  }
}

/**
 *
 * @param fn
 * @param context
 * @param i
 * @param arr
 * @returns {Promise<*>}
 */
async function callFn(fn,context,i,arr) {
  let item = await getValue(arr[i])
  return await fn.call(context,item, i,await getValue(arr));
}

module.exports = {
  findVueNodes,
  getProp,
  setProp,
  doMethod,
  getLength,
  getValue,
  findVueNode,
  callFn,
  getAsyncMethodResult,
  buildFiberObject,
  waitForResponse
}
