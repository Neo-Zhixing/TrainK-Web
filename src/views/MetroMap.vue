<template>
  <div id="metromap-container"
    @scroll="scrolled"
    @mousedown="mousedown"
    @mouseup="mouseup"
    @mousemove="(dragging ? dragged:moved)($event)"
    @wheel.prevent="wheel"
  />
</template>

<script>
import MetroMap from '@/MetroMap'

function pointForEvent (event) {
  return { x: event.clientX, y: event.clientY }
}

export default {
  data () {
    return {
      map: null,
      dragging: false,
    }
  },
  mounted () {
    this.map = new MetroMap(this.$el)
  },
  methods: {
    mouseup (event) {
      if (this.dragging) this.map.loadMap()
      this.dragging = false
    },
    mousedown (event) {
      this.dragging = true
      this.map.startMoving(pointForEvent(event))
    },
    wheel (event) {
      let scale = event.deltaY * 0.001
      if (event.deltaMode === 1)
        scale *= 20 // For compatibility issues on Firefox
      scale += 1
      if (scale < 0.1) scale = 0.1
      this.map.zoom(scale, pointForEvent(event))
    },
    scrolled (event) {
      // Load the map on a displacement-based interval
    },
    moved (event) {
      // Don't have an idea about what to do with it for now.
    },
    dragged (event) {
      this.map.moveTo(pointForEvent(event))
    },
  },
}
</script>

<style>
body {
  height: 100vh;
}
#app {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
#metromap-container{
  flex: 1;
  overflow: hidden;
}
</style>
