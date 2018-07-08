class ScrollController {
  constructor (container, target) {
    for (const eventname of [
      'mousemove',
      'wheel',
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel',
      'gesturestart',
      'gesturechange',
      'gestureend',
    ])
      if (this[eventname])
        container.addEventListener(eventname, event => this[eventname](event))
    this.container = container
    this.target = target
    this.origin = {}
  }

  // Pan
  mousemove (event) {
    if (event.buttons !== 1) return
    this.container.scrollLeft -= event.movementX
    this.container.scrollTop -= event.movementY
  }

  // Zoom
  gesturestart (event) {
    event.preventDefault()
    this.scale = event.scale
  }
  gesturechange (event) {
    event.preventDefault()
    const scale = event.scale / this.scale
    this.target.width(this.target.width() * scale)
    this.target.height(this.target.height() * scale)

    const containerRect = this.container.getBoundingClientRect()
    this.container.scrollLeft -= (event.clientX - containerRect.left + this.container.scrollLeft) * (1 - scale)
    this.container.scrollTop -= (event.clientY - containerRect.top + this.container.scrollTop) * (1 - scale)
    this.scale = event.scale
  }
  gestureend (event) {
    event.preventDefault()
    this.scale *= event.scale
  }
}

export default ScrollController
