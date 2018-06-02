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
        return this.container
          .use(symbol)
          .id('station-' + this.station.id)
          .move(this.station.position.x, this.station.position.y)
      })
  }
}
