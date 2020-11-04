# nine-nine-six

基于proxy，fibers，puppeteer把对vue自动化测试的代码提取了一遍

##安装
npm i -s nine-nine-six

##登录执行例子
```
const {run} = require('nine-nine-six')

run({
  url:'http://localhost:8080',
  chromeUrl:'C:\\Users\\chrome.exe'
},function ({window,page,route,router,store}) {
  let login = page.findVueNode({
    tag:'Login'
  })
  let form =  login.form 
  form.userName = 'xx' 
  form.password = 'xx' 
  login.login() 
})
```
