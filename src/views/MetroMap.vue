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
import * as models from '@/MetroMap/models'

export default {
  data () {
    return {
      map: null,
      dragging: false,
      scale: 1,
    }
  },
  mounted () {
    this.map = new MetroMap(this.$el)
    this.loadMap()
  },
  watch: {
    scale (newValue) {
      this.map.zoom(newValue)
    }
  },
  methods: {
    mouseup (event) {
      if (this.dragging) this.loadMap()
      this.dragging = false
    },
    mousedown (event) {
      this.dragging = true
    },
    wheel (event) {
      this.scale += event.deltaY * 0.01
    },
    scrolled (event) {
      // Load the map on a displacement-based interval
    },
    moved (event) {
      // Don't have an idea about what to do with it for now.
    },
    dragged (event) {
      this.$el.scrollTop -= event.movementY
      this.$el.scrollLeft -= event.movementX
    },
    loadMap () {
      this.map.loadMap(new models.Rect(
        new models.Point(this.$el.scrollLeft, this.$el.scrollTop),
        new models.Size(this.$el.offsetWidth, this.$el.offsetHeight),
      ))
    }
  },
}
</script>

<style>
#metromap-container{
  overflow: scroll;
  cursor: grab;
  flex: 1;
}
#metromap-container > svg > * {
  cursor: pointer;
}
</style>
