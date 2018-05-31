export default class MapComp {
  constructor (map, container) {
    this.map = map
    this.container = container
    this.element = null
  }
  get display () {
    return this.element !== null
  }
  set display (value) {
    if (value && (this.element == null))
      this.draw()
        .then(element => {
          this.element = element
        })
    else if (!value && (this.element != null)) {
      this.element.remove()
      this.elememt = null
    }
  }
  draw () {
    return null
  }
}
