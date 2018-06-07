import MapComp from '.'

export default class StationComp extends MapComp {
  constructor (map, container, station) {
    super(map, container)
    this.station = station
  }
  draw () {
    return this.map
      .getStationIconSymbolForLevel(this.station.level)
      .then(symbol => {
        const group = this.container
          .nested()
          .id('station-' + this.station.id)
          .attr({'style': null})
          .move(...this.station.getPosition())

        this.icon = group.use(symbol)
          .id(null)
        const iconBox = this.icon.bbox()
        console.log(iconBox)
        this.icon
          .move(-iconBox.cx, -iconBox.cy)
        this.label = group.plain(this.station.name)
          .id(null)
        return group
      })
  }
}
