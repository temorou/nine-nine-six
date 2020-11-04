const puppeteer = require('puppeteer');
const config = require('../libs/config');
const initPageGlobalFunctions = require('../libs/pageGlobalFunction');
const {findVueNodes,findVueNode,getProp,waitForResponse,getAsyncMethodResult,buildFiberObject} = require('../libs/util');
const {buildProxy} = require('../proxy/proxyUtil')
const Fiber = require('fibers');
class Page {
  constructor ({ page }) {
    let urls = []
    this.page = page
    page.urls = urls
    page.on('request',request=>{
      let url = request.url()
      if(!config.requestUrlRegexp.test(url)){
        return
      }
      urls.push(url)
    })
    page.on('requestfailed',request=>{
      let url = request.url()
      if(!config.requestUrlRegexp.test(url)){
        return
      }
      urls.splice(urls.lastIndexOf(url) -1,1)
    })
    page.on('requestfinished',request=>{
      let url = request.url()
      if(!config.requestUrlRegexp.test(url)){
        return
      }
      urls.splice(urls.lastIndexOf(url) -1,1)
    })
  }

  /**
   * 功能：等待接口全部调用完成
   * @returns {Promise<void>}
   */
  waitForResponse(){
    waitForResponse(this.page)
  }

  /**
   *
   * @param url
   * @param chromeUrl
   * @returns {Promise<Page>}
   */
  static async build(obj={}){
    Object.keys(obj).forEach(key=>{
      config[key] = obj[key]
    })
    let {url,chromeUrl} = config
    let browser = await puppeteer.launch({
      executablePath: chromeUrl,
      headless:false,
      defaultViewport:null,
      args: ['--start-maximized',]
    })
    let page = await browser.newPage();
    page.on('load',()=>{
      page.evaluate(initPageGlobalFunctions)
    })
    let that = new Page({page})
    page.__cacheMethod = {}
    await page.goto(url)
    await page.exposeFunction('__callCacheMethod',(name,...args)=>{
      let res ;
      Fiber(function() {
        args = args.map(arg=>that.getCache(arg))
        res =  page.__cacheMethod[name]&&page.__cacheMethod[name](...args)
      }).run()
      return res
    })
    return that
  }

  clearCache(){
    this.page.__cacheMethod = {}
  }

  async goto(url){
    this.clearCache()
    await this.page.goto(url)
//    getAsyncMethodResult(this.page.goto,url,this.page)
  }
  /**
   *
   * @returns window
   */
  getGlobal(){
    let {value,type,jsHandle} = getAsyncMethodResult(getProp,{page:this.page})
    return buildProxy({value,type,jsHandle,page:this.page})
  }

  getCommonComponent(){
    let g = this.getGlobal()
    return g.__initPageGlobalFunctions.getCommonComponent()
  }
  /**
   * 处理nodejs传给页面的业类型参数
   * @param name
   * @returns {*}
   */
  getCache(name){
    if(/^__serialize__[\d]+__Object__$/.test(name)){
      let window = this.getGlobal()
      return window.__cacheObject[name]
    }
    return name
  }
  /**
   *
   * @param tag
   * @param css
   * @param prop
   * @param pNode
   * @returns vueNodeInstances
   */
  findVueNodes({tag,css,prop,pNode}){
    let {value,type,jsHandle} = getAsyncMethodResult(findVueNodes,{page:this.page,pNode,tag,css,prop})
    return buildProxy({value,type,jsHandle,page:this.page})
  }

  /**
   *
   * @param tag
   * @param css
   * @param prop
   * @param pNode
   * @returns vueNodeInstance
   */
  findVueNode({tag,css,prop,pNode}){
    let {value,type,jsHandle} = getAsyncMethodResult(findVueNode,{page:this.page,pNode,tag,css,prop})
    return buildProxy({value,type,jsHandle,page:this.page})
  }

}
buildFiberObject(Page)
module.exports = Page
