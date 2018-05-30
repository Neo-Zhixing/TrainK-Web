import * as SVG from 'svg.js'
import { RemoteMapData } from './MapData'

import Station from './components/Station'

export default class Map {
  constructor (container) {
    this.mapData = new RemoteMapData('http://localhost:8000/metromap/')
    this.container = SVG(container)
    this.mapData.getConfiguration()
      .then(config => {
        this.container.size(config.frame.maxX, config.frame.maxY)
      })
  }

  drawMap (rect) {
    this.mapData.loadMap(rect)
      .then(() => {
        for (const node of this.mapData.stationsInRect(rect)) {
          const stationDrawer = new Station(this, node)
          stationDrawer.draw()
        }
      })
  }
}
