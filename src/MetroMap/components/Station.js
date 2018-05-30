import MapComp from '.'

export default class StationComp extends MapComp {
  constructor (map, station) {
    super(map)
    this.station = station
  }
  draw () {
    this.map.mapData.getIconForStationLevel(this.station.level)
      .then((svgStr) => {
        const group = this.map.container.group()
        group.svg(svgStr)
          .move(this.station.position.x, this.station.position.y)
        this.element = group
      })
  }
}
