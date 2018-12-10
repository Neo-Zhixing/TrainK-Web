export default class MapComp {
  constructor (map, container) {
    this.map = map
    this.container = container
  }
  render () {
    if (this.shouldRender && !this.drawTask) {
      this.drawTask = this.draw()
      return this.drawTask
    } else if (!this.shouldRender && this.drawTask)
      this.drawTask.then(element => {
        element.remove()
        delete this.drawTask
      })
  }
  draw () {
    return null
  }

  get shouldRender () {
    return true
  }
}
