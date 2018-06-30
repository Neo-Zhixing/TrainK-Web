<template>
  <div id="metromap-container">
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
      <embed
        v-if="selection.station && selection.station.metadata.layout_map"
        :src="selection.station.metadata.layout_map"
        type="application/pdf" width="100%" height="600px"/>
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
import ScrollController from '@/MetroMap/controllers/ViewBoxScrollController'
import Popper from 'popper.js'

export default {
  data () {
    return {
      map: null,
      scrollController: null,
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
    this.map.container.on('mousedown', event => {
      // Clicking the empty area
      if (event.target === this.map.container.node)
        this.unselectAll()
    })
    this.map.container.on('wheel', this.unselectAll)
    this.scrollController = new ScrollController(this.map)
  },
  methods: {
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
