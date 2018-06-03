import Dexie from 'dexie'

const db = new Dexie('MetroMap')
db.version(1)
  .stores({
    nodes: 'id++, position.x, position.y',
    stations: 'id++, position.x, position.y, name, level',
    lines: 'id++, name',
    segments: 'id++, from, to, line',
  })

export const Database = db

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
  [Symbol.iterator] () {
    return [this.x, this.y].values()
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

export class Model {
  static get objects () {
    return db[this.dbName]
  }
  save () {
    return this.constructor.objects.put(this)
  }
}

export class Node extends Model {
  static get dbName () { return 'nodes' }
  constructor (id, position) {
    super()
    this.id = id
    this.position = position
  }
  getPosition () {
    if (Object.getPrototypeOf(this.position) !== Point.prototype)
      Object.setPrototypeOf(this.position, Point.prototype)
    return this.position
  }
}

export const StationLevel = Object.freeze({
  Minor: 0,
  Major: 1,
  Interchange: 2,
  Intercity: 3,
})

export class Station extends Node {
  static get dbName () { return 'stations' }
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

export class Segment extends Model {
  static get dbName () { return 'segments' }
  constructor (from, to, length = 1, shape = SegmentShape.Triangle) {
    super()
    this.from = from
    this.to = to
    this.length = length
    this.shape = shape
  }
  getNodes (id) {
    return Station.objects.get(id)
      .then(result => {
        if (!result)
          return Node.objects.get(id)
        return result
      })
  }
  fromNode () {
    return this.getNodes(this.from)
  }
  toNode () {
    return this.getNodes(this.to)
  }
  getLine () {
    return Line.objects.get(this.line)
  }
}

export class Line extends Model {
  static get dbName () { return 'lines' }
  constructor (id, name = '', attrs = {}) {
    super()
    this.id = id
    this.name = name
    this.attrs = attrs
  }
}

export const Mapping = {}
for (const cls of [Node, Station, Line, Segment]) {
  db[cls.dbName].mapToClass(cls)
  Mapping[cls.dbName] = cls
}
