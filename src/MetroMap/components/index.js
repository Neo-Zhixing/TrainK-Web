export default class MapComp {
  constructor (map, container) {
    this.map = map
    this.container = container
  }
  get display () {
    return this.drawTask !== undefined
  }
  set display (value) {
    if (value && !this.drawTask)
      this.drawTask = this.draw()
    else if (!value && this.drawTask)
      this.drawTask.then(element => {
        element.remove()
        delete this.drawTask
      })
  }
  draw () {
    return null
  }

  mapDidZoom (scale) {
    this.display = true
  }
}
