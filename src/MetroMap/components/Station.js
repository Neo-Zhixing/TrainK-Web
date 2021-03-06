import MapComp from '.'
import * as models from '../models'
import { DirectionFromInt } from './Segment'

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
          const dir = Math.max(...this.takenDirs)

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
        icon.on('mouseenter', () => {
          clearTimeout(timeout)
          timeout = setTimeout(
            () => stationContainer
              .animate(100, '>')
              .scale(2, iconBox.cx, iconBox.cy),
            75
          )
        })
        icon.on('mouseleave', () => {
          clearTimeout(timeout)
          timeout = setTimeout(
            () => stationContainer
              .animate(100, '>')
              .scale(1, iconBox.cx, iconBox.cy),
            75
          )
        })
        icon.click(event => {
          this.map.container.fire('stationClicked', {
            station: this.station,
            target: event.target,
          })
        })
        // Draw the label
        this.label = stationContainer
          .text(add => {
            add.tspan(this.station.name).id(null)
          })
          .id(null)
          .font({
            family: null,
          })
        // Automatically adjusting label position
        if (this.takenDirs.size !== 8) {
          // Label Placement Priority List
          let maxDir = Math.max(...this.takenDirs)
          const candidateDirs = [...this.takenDirs]
            .map(value => {
              if (value < maxDir - 4) value += 8
              if (value > maxDir) maxDir = value
              return value
            })
          const averageDir = candidateDirs
            .reduce((sum, value) => sum + value) /
            candidateDirs.length
          const labelDir = DirectionFromInt(Math.round(averageDir) + 4)
          let offsetX = 0
          let offsetY = 0
          if (labelDir >= 1 && labelDir <= 3)
            offsetY = 1
          else if (labelDir >= 5 && labelDir <= 7)
            offsetY = -1
          if (labelDir >= 3 && labelDir <= 5)
            offsetX = -1
          else if (labelDir === 7 || labelDir === 0 || labelDir === 1)
            offsetX = 1

          const labelBox = this.label.bbox()
          offsetX *= 1.2 * (labelBox.width + iconBox.width) / 2
          offsetY *= 1.2 * (labelBox.height + iconBox.height) / 2
          this.label.attr({
            x: offsetX,
            y: offsetY,
            caa: candidateDirs,
            dir: labelDir
          })
        }

        return stationContainer
      })
  }
  get shouldRender () {
    return true
    // return this.map.zoom() > (3 - this.station.level) * 0.1
  }
}
