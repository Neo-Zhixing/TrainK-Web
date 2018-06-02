import * as SVG from 'svg.js'
import { DefaultDataLoader } from './models/DataLoader'

import Station from './components/Station'
// import Segment from './components/Segment'

export default class MetroMap {
  constructor (container) {
    this.dataloader = new DefaultDataLoader('http://localhost:8000/metromap/')
    this.container = SVG(container).id('metromap')
    this.groups = {
      station: this.container.group().id('stations-group'),
      stationIconSymbols: this.container.group().id('station-icons'),
      segment: this.container.group().id('segments-group')
    }
    this.dataloader.getConfiguration()
      .then(config => {
        this.container.size(config.frame.maxX, config.frame.maxY)
      })
  }

  loadMap (rect) {
    if (!this.stationDrawers) this.stationDrawers = new Map()
    this.dataloader.loadMap(rect)
      .then(data => {
        for (const node of data.stations) {
          const stationDrawer = this.stationDrawers.get(node.id) || new Station(this, this.groups.station, node)
          stationDrawer.display = true
          this.stationDrawers.set(node.id, stationDrawer)
        }
        // for (const segment of data.segments) {
        //   const segmentDrawer = this.segmentDrawers.get(segment.id) || new Segment(this.this.groups.segment, segment)
        // }
      })
  }

  getStationIconSymbolForLevel (level) {
    if (!this.stationIconSymbols) this.stationIconSymbols = new Map()
    let symbolPromise = this.stationIconSymbols.get(level)
    if (symbolPromise) return symbolPromise
    symbolPromise = this.dataloader.getStationIconForLevel(level)
      .then(svgStr => {
        return this.groups.stationIconSymbols
          .symbol()
          .id('station-icon-ref-' + level)
          .svg(svgStr)
      })

    this.stationIconSymbols.set(level, symbolPromise)
    return symbolPromise
  }
}
