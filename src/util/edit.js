const base =  {
	setValue(com,value){
		com.$emit('input',value)
	},
	getValue(com){
		return com.value
	},
	clear(com){
		com.$emit('input','')
	},
	getOptions:null,
	setRandomValue:null,
	level: 10
}

const edit = {}

const DEFAULT_FORMATS = {
	date: 'yyyy-MM-dd',
	month: 'yyyy-MM',
	year: 'yyyy',
	datetime: 'yyyy-MM-dd HH:mm:ss',
	time: 'HH:mm:ss',
	timerange: 'HH:mm:ss',
	daterange: 'yyyy-MM-dd',
	datetimerange: 'yyyy-MM-dd HH:mm:ss'
};
function extend(...args){
	args.forEach(arg=>{
		if(Array.isArray(arg)){
			extend(...arg)
			return
		}
		if(typeof arg==='string'){
			edit[arg] = base
			return
		}
		if(typeof arg==='object'){
			Object.keys(arg).forEach(name=>{
				edit[name] = {}
				if(['string','number'].includes(typeof arg[name])){
					edit[name] = {
						...base,
						level: Number(arg[name])
					}
					return
				}
				if(typeof arg[name]==='object'){
					Object.keys(base).forEach(key=>{
						edit[name][key] = arg[name][key]||base[key]
					})
				}
			})
		}
	})
}

extend({'Input':1},{
	'Select':{
		getOptions(com){
			let options = {}
			com.options&&com.options.forEach&&com.options.forEach(r => {
				options[r.value] = r.label
			})
			return options
		}
	},
	'CheckboxGroup':{
		getOptions(com){
			let options = {}
			let checkboxs = com.findVueNodes('Checkbox');
			(checkboxs||[]).forEach(checkbox => {
				let label =checkbox.label
				options[label] = label
			})
			return options
		}
	},
	'RadioGroup':{
		getOptions(com){
			let options = {}
			let radios = com.findVueNodes('Radio');
			(radios||[]).forEach(radio => {
				let label =radio.label
				options[label] = label
			})
			return options
		}
	},
	'Radio': {
		getOptions(com) {
			return {
				[com['trueValue']]: '是',
				[com['falseValue']]: '否'
			}
		},
		level: 5
	},
	'Checkbox':{
		getOptions(com){
			return {
				[com['trueValue']]: '是',
				[com['falseValue']]: '否'
			}
		},
		level: 5
	},
	'DatePicker':{
		setRandomValue(com){
			let format = com.format
			let type = com.type
			format = format?format:DEFAULT_FORMATS[type]
			let value = new Date().Format(format)
			com.$emit('input',value)
			return value
		},
	}
})

function getEditTypes(){
	return Object.keys(edit).sort((a,b)=>edit[b].level - edit[a].level)
}

function getChildEdit(parent){
	let types = getEditTypes()
	for(let i = 0,len = types.length;i<len;i++){
		let type = types[i]
		let child = parent.findVueNode({
			tag:type
		})
		if(child){
			return {
				type,
				child
			}
		}
	}
}

module.exports = {
	edit,
	extend,
	getEditTypes,
	getChildEdit
}
