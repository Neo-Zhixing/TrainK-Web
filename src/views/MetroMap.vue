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
      hide-backdrop
      id="station-details-modal"
      size="lg"
      :title="selection.station ? selection.station.name : ''"
      @show="removePopover">
      <b-card no-body>
        <b-list-group flush>
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
        <b-card-body>
          <a target="metromap-station-map"
            v-if="selection.station && selection.station.metadata.layout_map"
            :href="selection.station.metadata.layout_map">
            Station Layout
          </a>
          <a target="metromap-station-map"
            v-if="selection.station && selection.station.metadata.neighborhood_map"
            :href="selection.station.metadata.neighborhood_map">
            Neighborhood
          </a>
        </b-card-body>
      </b-card>
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
import ScrollController from '@/controllers/ScrollController'
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
    this.map.container.on('stationClicked', this.selectStation)
    this.map.container.on('mousedown', this.unselectAll)
    this.scrollController = new ScrollController(this.$el, this.map.container)
  },
  methods: {
    // Delegate Handlers
    selectStation (event) {
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
      const target = event.detail.target
      const station = event.detail.station
      referenceObj.bbox = target.getBBox()
      referenceObj.rbox = target.getBoundingClientRect()
      referenceObj.origin = target
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
#app {
  display: flex;
  flex-direction: column;
}
#app > nav.navbar {
  flex: 0 0 auto;
}
#metromap-container {
  flex: 1 1 auto;
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
}
</style>
