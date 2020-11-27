const texts = '江南一点雨年月日阅读关注篇干货手把教你通系列前后整了文章是时候告个段落这两天松哥抽空该的理下做成索引方便小伙伴们查找程地址如对应面国外服务器果响慢只需要即可不我多说吧内虽然已经买加速但度好像还般所以末也给出微信公众号按照排顺序练级挖大坑开搞带入门别再问密码怎么解定制中表单登录端分离咱就页跳转统交互授权操作原来简何将用户数据存库强联安全管有更实现自动功能风险控在项目比哪义认证逻辑种式高玩法快看等息踢掉配置防火墙都知道己什会话固攻击御集群化部署处共享学透彻源析姿势为体习资放行策略千万错第三案接默太丑办测试口请求头携跨域场景总结四限老破旧合利神奇象样被容到底异常机写代回见竟同过滤链想从子线获取深花没盘框架八典设计模初始流梳使期和家捋诡题让上拥投票与决区吗细粒例演示超最型又发秘聊很相技绕扯怕跟官明白死磕套令牌越溜起愉耍近构思路钟网站返懂易份十半业余间耗真受感觉浪费搜档妨哦谭光志版打包言克隆新件得疼少脚本崩溃消心退而其次载才左右品足够正必须它介绍语字符串树复类则含句节每标识块详情者于主些进封装里生收他函切调依赖记递归支持格帮助继续仔释根或否当往直顶止此循环图具步首先径去值导填述由二变量遍历父层属性组保断并且因名添换却呢匹提失败报额移除重命避免冲突质拼束尾兴趣删减术播优之完络涉及拉视频普音幕意渲染痛平践几率帧卡顿占急监雾水靠运气杂况握非状态工拆确建较善畅显圈验损害巨吐槽卸长均衡指条走画基无另误终任阶致缓硬约软刷连省预规创极造那独立向送局既举针编特嗅探检着双毕升片议压缩辨降低边效传随五丢推客严甚至住锯齿清晰弱腻替绘纹'

const commonType = {
	mobile:{
		type: 'number',
		len: 11
	},
	email:{
		type: 'number',
		len: 11,
		after: '@qq.com'
	},
	tel:{
		type: 'number',
		len: 11
	},
	IDCard:{
		type: 'number',
		len: 18
	}
}

const itemKeyName = {
	type:'type',
	minLen:'minLen',
	maxLen:'maxLen',
	len:'len',
	min:'min',
	max:'max',
	float:'float'
}

function itemKeyRename(arg){
	for(let key in arg){
		itemKeyName[key] = arg[key]
	}
}

function getItemKeys(item){
	let obj = {}
	Object.keys(itemKeyName).forEach(key=>{
		let keyNames = itemKeyName[key]
		if(Array.isArray(keyNames)){
			for(let name of keyNames){
				if(item[name]){
					obj[key] = item[name]
					return
				}
			}
		}
		obj[key] = item[keyNames]
	})
	return obj
}

const randomUtil = {
	word(){
		return String.fromCharCode(parseInt(Math.random()*(35000 - 20000) + 20000))
	},
	commonWord(){
		return texts[parseInt(Math.random()*texts.length)]
	},
	char(){
		if(Math.random()>0.5){
			return String.fromCharCode(
				parseInt(Math.random()*(122 - 97) + 97)
			)
		}else{
			return String.fromCharCode(
				parseInt(Math.random()*(90 - 65) + 65)
			)
		}
	},
	number(){
		return parseInt(Math.random()*10)
	},
	any(){
		let ran = Math.random()
		if(ran<0.333){
			return randomUtil.commonWord()
		}
		if(ran<0.666){
			return randomUtil.char()
		}
		return randomUtil.number()
	},
	randomBaseValue({type='any',len=1}){
		if(!['word','commonWord','char','number','any'].includes(type)){
			type = 'any'
		}
		let value = ''
		while (len>0){
			let randomValue = randomUtil[type]()
			value = `${value}${randomValue}`
			len--
		}
		return value
	},
	randomValue(item){
		let {type,minLen,maxLen,len,min,max,float} = getItemKeys(item)
		if(commonType[type]){
			return `${commonType[type].before||''}${randomUtil.randomBaseValue(commonType[type])}${commonType[type].after||''}`
		}
		if(float){
			type = 'float'
		}
		let randomLen,value =''
		if(len){
			randomLen = len
		}
		if(minLen){
			if(randomLen&&randomLen>minLen){
			}else{
				randomLen = minLen
			}
		}
		if(maxLen){
			if(randomLen){
				randomLen = Math.round(randomLen+(maxLen-randomLen)*Math.random())
			}else{
				randomLen = Math.ceil(maxLen*Math.random())
			}
		}
		if(min||max){
			min = min||0
			max = max||10000000
			value = min+(max-min)*Math.random()
			type = ['number','float'].includes(type)?type:'number'
		}
		if(['float'].includes(type)){
			if(value){
				value = value.toFixed(float||2)
			}else{
				randomLen = randomLen||2
				value = (10**randomLen*Math.random()).toFixed(float||2)
			}
		}else if(['number'].includes(type)){
			if(value){
				value = parseInt(value)
			}else{
				randomLen = randomLen||2
				value = parseInt(10**randomLen*Math.random())
			}
		}else{
			value = randomUtil.randomBaseValue({type,len:randomLen})
		}
		return value
	}
}


module.exports = {
	...randomUtil,
	itemKeyRename
}
