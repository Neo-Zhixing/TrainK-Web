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
  constructor (x = 0, y = 0) {
    this.x = x
    this.y = y
  }
  scale (value) {
    this.x *= value
    this.y *= value
    return this
  }
  [Symbol.iterator] () {
    return [this.x, this.y].values()
  }
  copy () {
    return new Point(this.x, this.y)
  }
  add (value) {
    this.x += value.x
    this.y += value.y
    return this
  }
  multiply (value) {
    this.x *= value
    this.y *= value
    return this
  }
  distanceTo (point = {x: 0, y: 0}) {
    const x = this.x - point.x
    const y = this.y - point.x
    const sign = Math.abs(y) < Math.pow(1, -10) ? Math.sign(x) : Math.sign(y)
    return Math.sqrt(x * x + y * y) * sign
  }
}

export class Size {
  constructor (width = 0, height = 0) {
    this.width = width
    this.height = height
  }
  scale (value) {
    this.width *= value
    this.height *= value
    return this
  }
  [Symbol.iterator] () {
    return [this.width, this.height].values()
  }
  copy () {
    return new Size(this.width, this.height)
  }
}

export class Rect {
  static FromFrame (value) {
    return new Rect(
      new Point(value.minX, value.minY),
      new Size(value.maxX - value.minX, value.maxY - value.minY),
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
      .join(':')
  }
  copy () {
    return new Rect(this.origin.copy(), this.size.copy())
  }
  scale (value) {
    this.origin.scale(value)
    this.size.scale(value)
  }
  scaled (value) {
    const newRect = this.copy()
    newRect.scale(value)
    return newRect
  }
  scaleAboutPoint (scale, point) {
    this.size.scale(scale)
    this.origin.x += (this.origin.x - point.x) * (scale - 1)
    this.origin.y += (this.origin.y - point.y) * (scale - 1)
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
  getSegments () {
    return Segment.objects
      .where('from').equals(this.id)
      .or('to').equals(this.id) // For all the segments containing this node
  }
  getLines () {
    // All the lines containing this node
    // TODO: Optimizations
    const lines = new Set()
    return this.getSegments()
      .each(segment => lines.add(segment.line))
      .then(() => Line.objects.filter(line => lines.has(line.id)))
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
