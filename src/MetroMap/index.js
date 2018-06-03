import * as SVG from 'svg.js'
import 'svg.path.js/svg.path.js'
import { DefaultDataLoader } from './models/DataLoader'

import Station from './components/Station'
import Segment from './components/Segment'

export default class MetroMap {
  constructor (container) {
    this.dataloader = new DefaultDataLoader('http://localhost:8000/metromap/')
    this.container = SVG(container).id('metromap')
    this.groups = {}
    this.drawers = {}
    for (const key of ['stations', 'segments']) {
      this.drawers[key] = new Map()
      this.groups[key] = this.container.group().id(key)
    }

    this.stationIconSymbols = this.container.group().id('station-icons')
    this.dataloader.getConfiguration()
      .then(config => {
        this.container.size(config.frame.maxX, config.frame.maxY)
      })
  }

  loadMap (rect) {
    const drawerConstructorMappings = {
      stations: Station,
      segments: Segment
    }
    this.dataloader.loadMap(rect)
      .then(data => {
        for (const key in this.groups)
          for (const element of data[key]) {
            const drawer = this.drawers[key].get(element.id) ||
              new (drawerConstructorMappings[key])(this, this.groups[key], element)
            drawer.display = true
            this.drawers[key].set(element.id, drawer)
          }
      })
  }

  getStationIconSymbolForLevel (level) {
    if (!this.stationIconPromises) this.stationIconPromises = new Map()
    let symbolPromise = this.stationIconPromises.get(level)
    if (symbolPromise) return symbolPromise
    symbolPromise = this.dataloader.getStationIconForLevel(level)
      .then(svgStr => this.stationIconSymbols
        .symbol()
        .id('station-icon-ref-' + level)
        .svg(svgStr)
      )

    this.stationIconPromises.set(level, symbolPromise)
    return symbolPromise
  }
}
