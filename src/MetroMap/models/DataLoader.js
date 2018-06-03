import axios from 'axios'
import * as models from '.'

export class DefaultDataLoader {
  constructor (URL) {
    this.server = axios.create({
      baseURL: URL,
    })
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
    // TODO: Determining the icon to use based on config fetched from server
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
    // TODO: Never load cached data.
    // Maintain a loaded-area map; only request not-yet-loaded data
    let spacing = null
    return this.getConfiguration()
      .then(config => {
        spacing = config.spacing
        return this.server.get(
          rect.scale(1 / config.spacing).toString(),
        )
      })
      .then(response => {
        for (const key of ['nodes', 'stations'])
          response.data[key].forEach(value => {
            Object.setPrototypeOf(value.position, models.Point.prototype)
            value.position.scale(spacing)
          })

        for (const key in models.Mapping) {
          const cls = models.Mapping[key]
          response.data[key]
            .forEach(value => Object.setPrototypeOf(value, cls.prototype))
          cls.objects.bulkPut(response.data[key])
        }
        return response.data
      })
  }
}
