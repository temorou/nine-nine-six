const {isWaitForResponse} = require("../libs/config");

const {doMethod,getProp,setProp,findVueNodes,findVueNode,getAsyncMethodResult,waitForResponse} = require('../libs/util');

/**
 * 功能：判断是否不需要proxy的类型
 * @param type
 * @returns {boolean}
 */
function isNormalType(type) {
  return ['number','string','undefined','boolean'].includes(type.toLowerCase())
}

/**
 * 功能：proxy函数
 * @param page
 * @param jsHandle
 * @param parentHandle
 * @returns {Function}
 */
function createMethodHandle(page,jsHandle,parentHandle) {
  let res =  function(...arg){
    isWaitForResponse&&waitForResponse(page)
    return buildProxy(getAsyncMethodResult(doMethod,{page,jsHandle,arg,parentHandle}))
  }
  res.getJsHandle =injectMethods.getJsHandle({page,jsHandle})
  return res
}


const injectMethods= {
  /**
   *
   * @param page
   * @param jsHandle
   * @returns {Function}
   */
  findVueNodes({page,jsHandle}){
    let pNode = jsHandle
    return function ({tag,css,prop}) {
      let {value,type,jsHandle} = getAsyncMethodResult(findVueNodes,{page,pNode,tag,css,prop})
      return buildProxy({value,type,jsHandle,page})
    }
  },
  /**
   *
   * @param page
   * @param jsHandle
   * @returns {Function}
   */
  findVueNode({page,jsHandle}){
    let pNode = jsHandle
    return function ({tag,css,prop}) {
      let {value,type,jsHandle} = getAsyncMethodResult(findVueNode,{page,pNode,tag,css,prop})
      return buildProxy({value,type,jsHandle,page})
    }
  },
  getJsHandle({page,jsHandle}){
    return function () {
      let value = getAsyncMethodResult(async function() {
        return page.evaluate(jsHandle => {
          return __initPageGlobalFunctions.serializeObject(jsHandle)
        }, jsHandle)
      })
      return value
    }
  }
}

/**
 * 创建被proxy的对象
 * @param type
 * @param value
 * @param page
 * @param jsHandle
 * @param parentHandle
 * @returns {Function}
 */
function createValue({type,value,page,jsHandle,parentHandle}) {
  if(isNormalType(type)){
    return value
  }
  if(type == 'function'){
    return createMethodHandle(page,jsHandle,parentHandle)
  }
  if(type == 'object'){
    let proto = Array.isArray(value)?[]:{};
    Object.keys(injectMethods).forEach(key=>{
      if(proto[key]){
        return
      }
      proto[key] = injectMethods[key]({page,jsHandle})
    });
    let res =  value||{};
    res.__proto__ = proto
    return res
  }
  return value
}

/**
 * 创建proxy的get方法
 * @param page
 * @param jsHandle
 * @returns {Function}
 */
function createGetHandler({page,jsHandle}) {
  return function (target,prop) {
    if(target[prop]&&typeof target[prop]==='function'){
      return target[prop]
    }
    isWaitForResponse&&waitForResponse(page)
    return buildProxy({...getAsyncMethodResult(getProp,{page,jsHandle,prop}),parentHandle:jsHandle})
  }
}

/**
 * 创建proxy的set方法
 * @param page
 * @param jsHandle
 * @returns {Function}
 */
function createSetHandler({page,jsHandle}) {
  return function (target,prop, value) {
    if(prop in target){
      target[prop] = value
    }
    isWaitForResponse&&waitForResponse(page)
    return getAsyncMethodResult(setProp,{page,jsHandle,prop, value})
  }
}

/**
 * 代理对象和函数
 * @param type
 * @param value
 * @param page
 * @param jsHandle
 * @param parentHandle
 * @returns {Function}
 */
function buildProxy({type,value,page,jsHandle,parentHandle}){
  let target = createValue({type,value,page,jsHandle,parentHandle})
  if(type!='object'){
    return target
  }
  return new Proxy(target,{
    get:createGetHandler({page,jsHandle}),
    set:createSetHandler({page,jsHandle})
  })
}

module.exports = {
  buildProxy
}
