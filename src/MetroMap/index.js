import * as SVG from 'svg.js'
import 'svg.path.js/svg.path.js'
import { DefaultDataLoader } from './models/DataLoader'

import Station from './components/Station'
import Segment from './components/Segment'

import './style.css'

export default class MetroMap {
  constructor (container) {
    this.dataloader = new DefaultDataLoader('http://192.168.1.101:8000/metromap/')
    this.container = SVG(container)
      .id('metromap')
      .attr({'preserveAspectRatio': 'xMidYMid slice'})
      .addClass('metromap')
    this.container.defs().id(null)
    this.groups = {}
    this.drawers = {}
    for (const key of ['segments', 'stations']) {
      this.drawers[key] = new Map()
      this.groups[key] = this.container.group().id(key)
    }

    this.stationIconSymbols = this.container.group().id('station-icons')
    this.dataloader.getConfiguration()
      .then(config => {
        this.visibleRect = config.frame
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
        const currentScale = this.container.viewbox().zoom
        for (const key in this.groups)
          for (const element of data[key]) {
            const drawers = this.drawers[key]
            if (drawers.has(element.id)) continue
            const drawer = new (drawerConstructorMappings[key])(this, this.groups[key], element)
            drawer.mapDidZoom(currentScale)
            drawers.set(element.id, drawer)
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
    const newScale = this.container.viewbox().zoom
    for (const key in this.drawers)
      this.drawers[key].forEach(drawer => drawer.mapDidZoom(newScale))
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
