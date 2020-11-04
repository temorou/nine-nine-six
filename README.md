# nine-nine-six

用proxy，fibers对自动化测试工具puppeteer封装

#执行例子

const {run} = require('../../src')
const fs = require('fs')

run({
  url:'http://localhost:8080',
  chromeUrl:'C:\\Users\\username\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
},function ({page,route,router,store}) {
  const win = page.getGlobal()
  win.document.body.onclick=(e)=>{
    win.console.log(e,{e},win)
    router.push({
      name: 'Login'
    })
  }
  let login = page.findVueNode({
    tag:'Login'
  })
  let form =  login.form
  form.userName = 'xx'
  form.password = 'xx'
  console.log(form)

  let input = login.findVueNode({
    css:'Input'
  })

  console.log(input.modelValue)
  login.handleSubmit()
  console.log(login.loginError)
  if(login.loginError){
    fs.writeFile('./examples/test/test.log', 'loginError',()=>{})
  }else{
    fs.writeFile('./examples/test/test.log','loginSuccess',()=>{})
  }
})
