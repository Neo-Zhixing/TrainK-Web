export class Point {
  constructor (x, y) {
    this.x = x || 0
    this.y = y || 0
  }
  scale (value) {
    this.x *= value
    this.y *= value
    return this
  }
}

export class Size {
  constructor (width, height) {
    this.width = width || 0
    this.height = height || 0
  }
  scale (value) {
    this.width *= value
    this.height *= value
    return this
  }
}

export class Rect {
  static fromFrame (minX, minY, maxX, maxY) {
    return new Rect(
      new Point(minX, minY),
      new Size(maxX - minX, maxY - minY),
    )
  }
  constructor (origin, size) {
    this.origin = origin || new Point()
    this.size = size || new Size()
  }
  get minX () {
    return this.origin.x
  }
  set minX (value) {
    this.size.width += this.origin.x - value
    this.origin.x = value
  }

  get minY () {
    return this.origin.y
  }
  set minY (value) {
    this.size.height += this.origin.y - value
    this.origin.y = value
  }

  get maxX () {
    return this.origin.x + this.size.width
  }
  set maxX (value) {
    this.size.width = value - this.origin.x
  }

  get maxY () {
    return this.origin.y + this.size.width
  }
  set maxY (value) {
    this.size.height = value - this.origin.y
  }

  containsPoint (point) {
    return point.x >= this.minX && point.x <= this.maxX &&
      point.y >= this.minY && point.y <= this.maxY
  }

  toString () {
    return [this.minX, this.minY, this.maxX, this.maxY]
      .map(value => value.toFixed(2))
      .join('-')
  }

  scale (value) {
    this.origin.scale(value)
    this.size.scale(value)
    return this
  }
}

export class Node {
  constructor (id, position) {
    this.id = id
    this.position = position
  }
}

export const StationLevel = Object.freeze({
  Minor: 0,
  Major: 1,
  Interchange: 2,
  Intercity: 3,
})

export class Station extends Node {
  constructor (id, position, name = '', level = StationLevel.Minor) {
    super(id, position)
    this.name = name
    this.level = level
  }
}

export const SegmentShape = Object.freeze({
  Square: 0,
  Triangle: 1,
  Curve: 2,
  Parallel: 3,
  Straight: 4,
})

export class Segment {
  constructor (from, to, shape = SegmentShape.Triangle) {
    this.from = from
    this.to = to
    this.shape = shape
  }
}

export class Line {
  constructor (id, name = '', segments = []) {
    this.id = id
    this.name = name
    this.segments = segments
  }
}
