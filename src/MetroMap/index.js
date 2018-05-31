import * as SVG from 'svg.js'
import { RemoteMapData } from './MapData'

import Station from './components/Station'

export default class MetroMap {
  constructor (container) {
    this.mapData = new RemoteMapData('http://localhost:8000/metromap/')
    this.container = SVG(container).id('metromap')
    this.groups = {
      station: this.container.group().id('stations-group'),
      stationIconSymbols: this.container.group().id('station-icons'),
    }
    this.mapData.getConfiguration()
      .then(config => {
        this.container.size(config.frame.maxX, config.frame.maxY)
      })
  }

  loadMap (rect) {
    if (!this._stationDrawers) this._stationDrawers = new Map()
    this.mapData.loadMap(rect)
      .then(() => {
        for (const node of this.mapData.stationsInRect(rect)) {
          let stationDrawer = this._stationDrawers.get(node.id) || new Station(this, this.groups.station, node)
          stationDrawer.display = true
          this._stationDrawers.set(node.id, stationDrawer)
        }
      })
  }

  getStationIconSymbolForLevel (level) {
    if (!this._stationIconSymbols) this._stationIconSymbols = new Map()
    let symbolPromise = this._stationIconSymbols.get(level)
    if (symbolPromise) return symbolPromise
    symbolPromise = this.mapData.getStationIconForLevel(level)
      .then(svgStr => {
        return this.groups.stationIconSymbols
          .symbol()
          .id('station-icon-ref-' + level)
          .svg(svgStr)
      })

    this._stationIconSymbols.set(level, symbolPromise)
    return symbolPromise
  }
}
