<template>
  <div id="metromap-container"
    @scroll="scrolled"
    @mousedown="mousedown"
    @mouseup="mouseup"
    @mousemove="(dragging ? dragged:moved)($event)"
    @wheel.prevent="wheel"
  >
    <div
      id="station-popover"
      class="popover"
      :class="selection.popoverPlacement ? 'bs-popover-' + selection.popoverPlacement : ''"
      :hidden="selection.popover === null"
      role="tooltip"
      ref="station-popover"
    >
      <div class="arrow" ref="station-popover-arrow"></div>
      <h3 class="popover-header text-center">
        {{ selection.station ? selection.station.name : '' }}
      </h3>
      <div class="popover-body">
        <b-list-group class="my-1">
          <b-list-group-item
            v-for="line in selection.linesForStation"
            :key="line.id">
            <b-badge
              class="mr-2"
              :style="{'background-color': line.attrs.color || '#000000'}">
              New
            </b-badge>
            {{line.name}}
          </b-list-group-item>
        </b-list-group>
        <b-button-group class="my-1 btn-block">
          <b-button class="col" size="sm" variant="primary">Departure</b-button>
          <b-button class="col" size="sm" variant="outline-primary">Arrival</b-button>
        </b-button-group>
        <b-button
          block
          size="sm"
          variant="info"
          v-b-modal="'station-details-modal'">Details</b-button>
      </div>
    </div>
    <b-modal
      id="station-details-modal"
      :title="selection.station ? selection.station.name : ''"
      @show="removePopover">
      <b-list-group-item
        v-for="line in selection.linesForStation"
        :key="line.id">
        <b-badge
          class="mr-2"
          :style="{'background-color': line.attrs.color || '#000000'}">
          New
        </b-badge>
        {{line.name}}
      </b-list-group-item>
      <div slot="modal-footer">
        <b-button-group>
          <b-button variant="primary">Departure</b-button>
          <b-button variant="outline-primary">Arrival</b-button>
        </b-button-group>
      </div>
    </b-modal>
  </div>
</template>

<script>
import MetroMap from '@/MetroMap'
import Popper from 'popper.js'

function pointForEvent (event) {
  return { x: event.clientX, y: event.clientY }
}

export default {
  data () {
    return {
      map: null,
      dragging: false,
      selection: {
        linesForStation: null,
        station: null,
        popover: null,
        popoverPlacement: null
      }
    }
  },
  mounted () {
    this.map = new MetroMap(this.$el)
    this.map.delegate = this
  },
  methods: {
    mouseup (event) {
      if (this.dragging) this.map.loadMap()
      this.dragging = false
    },
    mousedown (event) {
      if (event.target === this.map.container.node)
        this.unselectAll()
      this.dragging = true
      this.map.startMoving(pointForEvent(event))
    },
    wheel (event) {
      this.unselectAll()
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
    // Delegate Handlers
    selectStation (station, event) {
      if (this.selection.popover &&
        this.selection.popover.reference.origin === event.target)
        return
      this.removePopover()
      const referenceObj = {
        get clientHeight () {
          return this.bbox.width
        },
        get clientWidth () {
          return this.bbox.height
        },
        getBoundingClientRect () {
          return {
            x: this.rbox.x,
            y: this.rbox.y,
            width: this.bbox.width,
            height: this.bbox.height,
            top: this.rbox.top,
            left: this.rbox.left,
            bottom: this.rbox.top + this.bbox.height,
            right: this.rbox.left + this.bbox.width,
          }
        }
      }
      referenceObj.bbox = event.target.getBBox()
      referenceObj.rbox = event.target.getBoundingClientRect()
      referenceObj.origin = event.target
      station.getLines()
        .then(lines => lines.toArray())
        .then(lines => {
          this.selection.linesForStation = lines
          this.selection.station = station
          this.selection.popover = new Popper(
            referenceObj,
            this.$refs['station-popover'],
            {
              placement: 'right',
              modifiers: {
                arrow: {
                  element: '.arrow'
                },
                applyArrowStyle: {
                  enabled: true,
                  order: 900,
                  fn: data => {
                    this.selection.popoverPlacement = data.placement
                  }
                }
              },
            }
          )
        })
    },
    unselectAll () {
      this.selection.linesForStation = null
      this.selection.station = null
      this.removePopover()
    },
    removePopover () {
      this.selection.popover = null
    }
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
