<template>
  <div>
    <span v-show="loginError">LoginError</span>
    <Input type="text" v-model="form.userName"/>
    <Input type="password" v-model="form.password"/>
    <button @click="handleSubmit"></button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import  Input  from './Input.vue';

export default defineComponent({
  name: 'Login',
  components:{
    Input
  },
  data(){
      return {
          loginError: false,
          form:{
              userName: '',
              password: ''
          }
      }
  },
  methods:{
    handleSubmit(){
      if(this.form.userName == 'xx'){
          this.loginError = false
          this.$router.push({
              name: 'Home'
          })
      }else {
          this.loginError = true
      }
    }
  }
});
</script>
