# nine-nine-six

基于proxy，fibers，puppeteer把对vue自动化测试的代码提取了一遍

##安装
node>=12

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

##调用增删改查
```
const {setItemRandomValue,clearItemValue,setItemValue} = require('nine-nine-six')
module.exports = function (page) {
	let list = page.findVueNode({
		tag:'List'
	})
	search(list)
	add(page,list)
	remove(list)
}
```


###新增
```

function add(page,list){
	//调用新增按钮对应方法
	list.add()
	//获取详情组件
	let info = page.findVueNode({
		tag:'Info'
	})
	let form = info.$refs.form
	//获取所有FormItem组件
	let items = form.findVueNodes({
		tag:'FormItem'
	})
	for(let i=0,len=items.length;i<len;i++){
		let item = items[i]
		/*
		遍历所有FormItem组件对其中的Input，Select，CheckboxGroup，DatePicker等组件随机赋值
		根据FormItem的type,minLen,maxLen,len,min,max,float属性赋值
		* */
		setItemRandomValue(item)
	}
	//调用保存按钮对应方法
	info.save()
	//调用关闭按钮对应方法
	info.cancel()
}
```

###删除
```
function remove(list){
	//调用删除按钮对应方法
	list.remove(list.data[0])
	//查找删除对应确定的弹窗，如果弹窗的元素挂载在body而不是list上，要在page上查找
	let modal = list.findVueNode({
		tag:'Modal',
		prop:{
			visible:true
		}
	})
	//调用删除弹窗的确定对应方法
	modal.$parent.ok()
}
```


###查询
```

function search(list){
	//获取列表的columns
	let columns = list.columns
	//获取列表的FormItem
	let items = list.findVueNodes({
		tag:'FormItem'
	})
	/*遍历列表的FormItem，逐个赋值，调用查询，
	数组的forEach,find等函数重写，支持异步，
	所有操作看似同步，其实全是在纤程异步调用*/
	items.forEach(item=>{
		let label = item.label
		let column = columns.find(c=>c.title===label)||{}
		let key = column.key
		let data = list.data
		let value
		if(data.length&&key){
			value = data[0][key]
		}
		//value取列表名和搜索项名相同的列的第一个row,对应的值，没有就随机
		if(value){
			//FormItem指定赋值
			setItemValue(item,value)
		}else{
			//FormItem随机赋值
			value = setItemRandomValue(item)
		}
		//调用搜索方法
		list.getData(1)
		//列表名和搜索项名有相同的，遍历判断结果，是否一致
		if(key){
			let data = list.data
			data.some(d=>{
				if(d[key]!==value){
					console.log()
					return true
				}
			})
		}
		//清除FormItem的值
		clearItemValue(item)
	})
}

```
