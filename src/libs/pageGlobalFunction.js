
function initPageGlobalFunctions(){
  if(window.__initPageGlobalFunctions){
    return
  }

  /**
   * 传参临时缓存，处理puppeteer传参不支持对象或数组嵌套业类型情况
   * @type {*|{}}
   * @private
   */
  window.__cacheObject = window.__cacheObject||{}

  function random() {
    return `${Date.now()%86400000}${parseInt(Math.random()*10**8)}`
  }
  /**
   *
   * @param filename
   * @returns {string}
   * @private
   */
  function _basename (filename) {
    let path = filename.replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/')
    let lastPathIndex = path.lastIndexOf('/')
    let fileName = path.substring(lastPathIndex+1)
    return fileName.replace('.vue','')
  }

  /**
   *
   * @returns {boolean}
   */
  function isNewVue() {
    return [].slice.call(document.body.querySelectorAll('*')||[]).some(e=>e.__vue_app__&&/^3/.test(e.__vue_app__.version))
  }

  /**
   *
   * @param com
   * @returns {string|*}
   */
  function getComponentName (com) {
    let options = com.$options
    const name = options.name || options._componentTag
    if (name) {
      return name
    }
    const file = options.__file // injected by vue-loader
    if (file) {
      let classifyRE = /(?:^|[-_/])(\w)/g
      let filename = _basename(file)
      let upperName = filename.replace(classifyRE, (_, c)=>{
        return c ? c.toUpperCase() : ''
      })
      return upperName
    }
  }

  /**
   *
   * @param jsHandle
   * @param props
   * @returns {*}
   */
  function getProp(jsHandle,props){
    props.forEach(key => {
      jsHandle = jsHandle[key]
    })
    return jsHandle
  }

  function getSerializeObject(arg) {
    let cacheObject = window.__cacheObject
    let keys = Object.keys(cacheObject)
    for(let key of keys){
      if(cacheObject[key]===arg){
        return key
      }
    }
    let serializeName = `__serialize__${random()}__Object__`
    cacheObject[serializeName] = arg
    return serializeName
  }
  /**
   * 将作为参数的函数,对象，转成按标识
   * @param page
   * @param value
   * @returns {string|*}
   */
  function serializeObject(arg){
    if(['function','object'].includes(typeof arg)){
      return getSerializeObject(arg)
    }
    return arg
  }
  let cacheMethodNumber = 0
  /**
   *
   * @param value
   * @returns {Function|*}
   */
  function deserializeFunction(value){
    if(typeof value==='object'){
      for(let i in value){
        value[i] = deserializeFunction(value[i])
      }
    }
    if(/^__serialize__[\d]+__function__$/.test(value)){
      return async function (...args) {
        cacheMethodNumber++
        args = args.map(arg=>serializeObject(arg))
        let res = await __callCacheMethod(value,...args)
        cacheMethodNumber--
        return res
      }
    }
    if(/^__serialize__[\d]+__Object__$/.test(value)){
      return window.__cacheObject[value]
    }
    return value
  }

  let tId = null
  function __clearCacheObject() {
    if(cacheMethodNumber<=0){
      clearTimeout(tId)
      tId = setTimeout(function(){
        window.__cacheObject ={}
      },3000)
    }
  }
  /**
   *
   * @param jsHandle
   * @param props
   * @param value
   * @returns {Function|*}
   */
  function setProp(jsHandle,props,value){
    value = deserializeFunction(value)
    let len = props.length
    props.forEach((key,index) => {
      if(index == len-1){
        jsHandle[key] = value
      }else{
        jsHandle = jsHandle[key]
      }
    })
    return value
  }

  /**
   *
   * @param jsHandle
   * @param props
   * @param arg
   * @param parentHandle
   * @returns {*}
   */
  function doMethod(jsHandle,props,arg,parentHandle){
    arg = deserializeFunction(arg)
    props.forEach(key => {
      jsHandle = jsHandle[key]
    })
    return jsHandle.apply(parentHandle,arg)
  }

  function initOldVue() {

    /**
     *
     * @param obj
     * @returns {null|Element|*}
     */
    function getElement(obj){
      if(!obj){
        return null
      }
      if(obj instanceof Element){
        return obj
      }
      if(obj._isVue){
        return obj.$el
      }
      return null
    }

    /**
     *
     * @param obj
     * @returns {null|*}
     */
    function getComponentInstance(obj){
      if(!obj){
        return null
      }
      if(obj._isVue||obj._component){
        return obj
      }
      for(let key of ['__vue_app__','__vue__']){
        if(obj[key]){
          return obj[key]
        }
      }
      return null
    }

    function getCommonComponent(){
      let el = [].slice.call(document.body.querySelectorAll('*')).find(v=>v.__vue__)
      if(!el){
        return {}
      }
      let vNode = el.__vue__
      return {
        route:vNode.$route,
        router:vNode.$router,
        store:vNode.$store
      }
    }

    window.__initPageGlobalFunctions = {
      getComponentName,
      getComponentInstance,
      getElement,
      getProp,
      setProp,
      serializeObject,
      getCommonComponent,
      doMethod
    }
  }

  function initNewVue() {
    function getElement(obj){
      if(!obj){
        return null
      }
      if(obj instanceof Element){
        return obj
      }
      let el = obj.$el
      if(el instanceof Element){
        return el
      }
      if(el.nextElementSibling instanceof Element){
        return el.nextElementSibling
      }
      if(el.nextSibling instanceof Element){
        return el.nextElementSibling
      }
      return null
    }

    function getComponentInstance(obj){
      if(!obj){
        return null
      }
      if(obj.proxy){
        return obj.proxy
      }
      if(obj.__vueParentComponent){
        return obj.__vueParentComponent.proxy
      }
      return null
    }

    function getCommonComponent(){
      let el = [].slice.call(document.body.querySelectorAll('*')).find(v=>v.__vueParentComponent)
      if(!el){
        return {}
      }
      let vNode = el.__vueParentComponent.proxy
      return {
        route:vNode.$route,
        router:vNode.$router,
        store:vNode.$store
      }
    }
    window.__initPageGlobalFunctions = {
      getComponentName,
      getComponentInstance,
      getElement,
      getProp,
      setProp,
      serializeObject,
      getCommonComponent,
      doMethod
    }
  }



  if(isNewVue()){
    initNewVue()
  }else {
    initOldVue()
  }
}

module.exports = initPageGlobalFunctions
