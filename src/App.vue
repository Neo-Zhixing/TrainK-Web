<template>
  <div id="app">
    <NavBar/>
    <router-view/>
  </div>
</template>

<script>
import NavBar from '@/views/NavBar'
export default {
  components: {
    NavBar
  }
}
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
@import '~bootstrap-vue/dist/bootstrap-vue.css';
body{
  min-height: 100vh;
  width: 100vw;
}
</style>
