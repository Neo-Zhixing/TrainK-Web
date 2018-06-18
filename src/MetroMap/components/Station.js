import MapComp from '.'
import * as models from '../models'

export default class StationComp extends MapComp {
  constructor (map, container, station) {
    super(map, container)
    this.station = station
    this.takenDirs = new Set()
  }
  drawStationIcon (container) {
    if (this.station.level === models.StationLevel.Minor)
      return this.station.getLines()
        .then(lines => lines.first())
        .then(line => {
          if (!line) return
          const lineWidth = line.attrs['width']
          const stationWidth = 0.7
          const stationHeight = 0.4
          let dir = 0
          for (let i of this.takenDirs)
            if (i > dir) dir = i

          this.icon = container
            .rect(lineWidth * stationWidth, lineWidth * stationHeight)
            .id(null)
            .fill('white')
            .move((0.5 - stationWidth) * lineWidth, -0.5 * lineWidth * stationHeight)
            .rotate(dir * 45 + 90, 0, 0)
          return this.icon
        })
    return this.map.getStationIconSymbolForLevel(this.station.level)
      .then(symbol => {
        // Use the symbol
        this.icon = container.use(symbol).id(null)
        const iconBox = this.icon.bbox()
        return this.icon.move(-iconBox.cx, -iconBox.cy)
      })
  }
  draw () {
    const stationContainer = this.container
      .group()
      .id('station-' + this.station.id)
      .move(...this.station.getPosition())

    return this.drawStationIcon(stationContainer)
      .then(icon => {
        const iconBox = icon.bbox()
        // Setting up animations
        let timeout = null
        stationContainer.on('mouseenter', () => {
          clearTimeout(timeout)
          timeout = setTimeout(
            () => stationContainer
              .animate(100, '>')
              .scale(2, iconBox.cx, iconBox.cy),
            75
          )
        })
        stationContainer.on('mouseleave', () => {
          clearTimeout(timeout)
          timeout = setTimeout(
            () => stationContainer
              .animate(100, '>')
              .scale(1, iconBox.cx, iconBox.cy),
            75
          )
        })
        // Draw the label
        this.label = stationContainer.plain(this.station.name).id(null)
        return stationContainer
      })
  }
  get shouldRender () {
    return this.map.zoom() > (3 - this.station.level) * 0.1
  }
}
