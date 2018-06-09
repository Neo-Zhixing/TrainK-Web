import MapComp from '.'
import * as models from '../models'

export default class StationComp extends MapComp {
  constructor (map, container, station) {
    super(map, container)
    this.station = station
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
          this.icon = container.rect(lineWidth * stationWidth, lineWidth * stationHeight)
          const bbox = this.icon.bbox()
          return this.icon
            .fill('white')
            .move((0.5 - stationWidth) * lineWidth, -bbox.cy)
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
        stationContainer.on('mouseenter', () => {
          stationContainer.animate(100, '>').scale(2, iconBox.cx, iconBox.cy)
        })
        stationContainer.on('mouseleave', () => {
          stationContainer.animate(100, '>').scale(1, iconBox.cx, iconBox.cy)
        })
        // Draw the label
        this.label = stationContainer.plain(this.station.name).id(null)
        return stationContainer
      })
  }
}
