<template>
    <input type="text" :value="modelValue" @input="update">
</template>

<script>
  export default {
    name: "Input",
    props:{
      modelValue: {
        default: ''
      }
    },
    methods:{
      update(e){
        this.$emit('update:modelValue',e.target.value)
      }
    }
  }
</script>

<style scoped>

</style>
