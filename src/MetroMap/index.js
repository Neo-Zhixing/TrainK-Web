import * as SVG from 'svg.js'
import 'svg.path.js/svg.path.js'
import { DefaultDataLoader } from './models/DataLoader'

import Station from './components/Station'
import Segment from './components/Segment'

export default class MetroMap {
  constructor (container) {
    this.dataloader = new DefaultDataLoader('http://localhost:8000/metromap/')
    this.container = SVG(container).id('metromap')
    this.container.defs().id(null)
    this.container.attr({'preserveAspectRatio': 'xMidYMid slice'})
    this.groups = {}
    this.drawers = {}
    for (const key of ['stations', 'segments']) {
      this.drawers[key] = new Map()
      this.groups[key] = this.container.group().id(key)
    }

    this.stationIconSymbols = this.container.group().id('station-icons')
    this.dataloader.getConfiguration()
      .then(config => {
        this.visibleRect = config.frame
        this.container.rect()
          .move(...this.visibleRect.origin)
          .size(...this.visibleRect.size)
          .attr({'fill': 'none', 'stroke-width': 10})
        this.updateViewbox()
        if (config.styles)
          this.container.element('style')
            .id(null)
            .attr({type: 'text/css'})
            .words(config.styles)
        for (const key of ['title', 'desc', 'metadata'])
          if (config[key]) this.container.element(key).id(null).words(config[key])
        this.loadMap()
      })
  }

  loadMap () {
    const drawerConstructorMappings = {
      stations: Station,
      segments: Segment
    }
    this.dataloader.loadMap(this.visibleRect)
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

  updateViewbox () {
    const rect = this.visibleRect
    this.container.viewbox({
      x: rect.origin.x,
      y: rect.origin.y,
      width: rect.size.width,
      height: rect.size.height,
    })
  }
  zoom (scale, point) {
    if (!scale && !point) return this.container.viewbox().zoom
    point = this.container.point(point.x, point.y)
    this.visibleRect.scaleAboutPoint(scale, point)
    this.updateViewbox()
  }
  startMoving (from) {
    this.movingOrigin = this.container.point(from.x, from.y)
  }
  moveTo (to) {
    to = this.container.point(to.x, to.y)
    this.visibleRect.origin.x += this.movingOrigin.x - to.x
    this.visibleRect.origin.y += this.movingOrigin.y - to.y
    this.updateViewbox()
  }
}
