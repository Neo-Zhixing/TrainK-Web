function pointForEvent (event) {
  return { x: event.clientX, y: event.clientY }
}

export default class ViewBoxScrollController {
  constructor (map) {
    this.scrolling = false
    this.map = map
    // Registering Events
    for (const eventname of [
      'mouseup',
      'mousedown',
      'wheel',
      'scrolled',
      'mousemove',
      'dragged'
    ])
      map.container.on(eventname, event => this[eventname](event))
  }
  mouseup (event) {
    if (this.dragging) this.map.loadMap()
    this.dragging = false
  }
  mousedown (event) {
    console.log('mousedown')
    this.dragging = true
    this.map.startMoving(pointForEvent(event))
  }
  wheel (event) {
    let scale = event.deltaY * 0.001
    if (event.deltaMode === 1)
      scale *= 20 // For compatibility issues on Firefox
    scale += 1
    if (scale < 0.1) scale = 0.1
    this.map.zoom(scale, pointForEvent(event))
  }
  scrolled (event) {
    // Load the map on a displacement-based interval
  }
  mousemove (event) {
    if (this.dragging)
      this.dragged(event)
    else
      this.moved(event)
  }
  moved (event) {
    // Don't have an idea about what to do with it for now.
  }
  dragged (event) {
    this.map.moveTo(pointForEvent(event))
  }
}
