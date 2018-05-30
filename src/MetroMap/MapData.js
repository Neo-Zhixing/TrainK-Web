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
    if (this.configuration) {
      return new Promise((resolve, reject) => {
        resolve(this.configuration)
      })
    }

    return this.server.get('info')
      .then(response => {
        this.configuration = response.data
        const frame = this.configuration.frame
        this.configuration.frame = models.Rect.fromFrame(
          frame.minX,
          frame.minY,
          frame.maxX,
          frame.maxY,
        ).scale(this.configuration.spacing)
        return this.configuration
      })
  }

  getIconForStationLevel (level) {
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
    return this.getConfiguration()
      .then(config => {
        return this.server.get(
          rect.scale(1 / config.spacing).toString(),
        )
      })
      .then(response => {
        response.data.nodes
          .forEach(value => {
            Object.setPrototypeOf(value, models.Node.prototype)
            Object.setPrototypeOf(value.position, models.Point.prototype)
            value.position.scale(this.configuration.spacing)
          })
        response.data.stations
          .forEach(value => {
            Object.setPrototypeOf(value, models.Station.prototype)
            Object.setPrototypeOf(value.position, models.Point.prototype)
            value.position.scale(this.configuration.spacing)
          })
        this.nodes = this.nodes.concat(response.data.nodes)
        this.stations = this.stations.concat(response.data.stations)
      })
  }
  nodesInRect (rect) {
    return this.nodes.concat(this.stations)
  }
  stationsInRect (rect) {
    return this.stations
  }
}
