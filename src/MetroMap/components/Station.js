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
          .group()
          .id('station-' + this.station.id)

        group.use(symbol)
          .id(null)
          .move(...this.station.getPosition())

        group.plain(this.station.name)
          .id(null)
          .move(...this.station.getPosition())
        return group
      })
  }
}
