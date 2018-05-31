import axios from 'axios'
import * as models from './models'

export class RemoteMapData {
  constructor (URL) {
    this.server = axios.create({
      baseURL: URL,
    })
    this.nodes = []
    this.stations = []
  }
  getConfiguration () {
    if (!this._configuration)
      this._configuration = this.server.get('info')
        .then(response => {
          const config = response.data
          config.frame = models.Rect.fromFrame(
            config.frame.minX,
            config.frame.minY,
            config.frame.maxX,
            config.frame.maxY,
          ).scale(config.spacing)
          return config
        })
    return this._configuration
  }

  getStationIconForLevel (level) {
    const iconURLs = {
      [models.StationLevel.Intercity]: require('@/assets/intercity.svg'),
      [models.StationLevel.Interchange]: require('@/assets/interchange.svg'),
      [models.StationLevel.Major]: require('@/assets/major.svg'),
      [models.StationLevel.Minor]: require('@/assets/minor.svg'),
    }
    return axios.get(iconURLs[level])
      .then(response => {
        return response.data
      })
  }
  loadMap (rect) {
    let spacing = null
    return this.getConfiguration()
      .then(config => {
        spacing = config.spacing
        return this.server.get(
          rect.scale(1 / config.spacing).toString(),
        )
      })
      .then(response => {
        response.data.nodes
          .forEach(value => {
            Object.setPrototypeOf(value, models.Node.prototype)
            Object.setPrototypeOf(value.position, models.Point.prototype)
            value.position.scale(spacing)
          })
        response.data.stations
          .forEach(value => {
            Object.setPrototypeOf(value, models.Station.prototype)
            Object.setPrototypeOf(value.position, models.Point.prototype)
            value.position.scale(spacing)
          })
        this.nodes = response.data.nodes
        this.stations = response.data.stations
      })
  }
  nodesInRect (rect) {
    return this.nodes.concat(this.stations)
  }
  stationsInRect (rect) {
    return this.stations
  }
}
