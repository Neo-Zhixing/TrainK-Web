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
  min-width: 100vh;
}
#app{
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
