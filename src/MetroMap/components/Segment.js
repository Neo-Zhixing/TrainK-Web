import MapComp from '.'
import { SegmentShape } from '../models'

// Radian = direction * (1/4) * pi
// Degree = direction * 45
export const Direction = Object.freeze({
  Right: 0,
  RightUp: 1,
  Up: 2,
  LeftUp: 3,
  Left: 4,
  LeftDown: 5,
  Down: 6,
  RightDown: 7,
})

// The direction
function directionForSegment (segment, origin) {
  // Origin is (0,0) for relative drawings
  // TODO: BUGFIX
  if (segment.type === segment.type.toLowerCase())
    origin = [0, 0]
  switch (segment.type.toLowerCase()) {
    case 'h':
      return segment.coords[0] > origin[0] ? Direction.Right : Direction.Left
    case 'v':
      return segment.coords[0] > origin[0] ? Direction.Up : Direction.Down
    case 'l':
      const radian = Math.atan2(
        segment.coords[1] - origin[1],
        segment.coords[0] - origin[0]
      )
      let result = Math.round(4 * radian / Math.PI)
      if (result < 0) result += 8
      if (result >= 8) result -= 8
      return result
  }
}
function rename (object, key, newname) {
  const value = object[key] || object[newname]
  if (value) object[newname] = value
  delete object[key]
}

export default class SegmentComp extends MapComp {
  constructor (map, container, segment) {
    super(map, container)
    this.segment = segment
  }
  draw () {
    return this.map.dataloader.getConfiguration()
      .then(config => {
        const path = this.container.path()
          .id('segment-' + this.segment.id)
        return Promise.all([
          this.drawSegment(
            path,
            config.cornerRadius,
          ),
          this.segment.getLine(),
        ])
      })
      .then(values => {
        const [path, line] = values
        // Based on the assumption that the first segment
        // drawing action is always M, the absolute move.
        const segmentCount = path.getSegmentCount()
        let coords = [0, 0]
        for (let i = 0; i < segmentCount - 1; i++) {
          const pathSegment = path.getSegment(i)
          switch (pathSegment.type) {
            case 'v':
              coords[1] += pathSegment.coords[0]
              break
            case 'V':
              coords[1] = pathSegment.coords[0]
              break
            case 'h':
              coords[0] += pathSegment.coords[0]
              break
            case 'H':
              coords[0] += pathSegment.coords[0]
              break
            case 'l':
            case 'm':
              coords[0] += pathSegment.coords[0]
              coords[1] += pathSegment.coords[1]
              break
            case 'L':
            case 'M':
              coords = pathSegment.coords
              break
            case 'q':
              coords[0] += pathSegment.coords[2]
              coords[1] += pathSegment.coords[3]
              break
            case 'Q':
              coords = [pathSegment.coords[2], pathSegment.coords[3]]
              break
          }
        }
        const dirs = {
          from: directionForSegment(
            path.getSegment(1),
            path.getSegment(0).coords
          ),
          to: directionForSegment(
            path.getSegment(segmentCount - 1),
            coords
          ),
        }
        const stationDrawers = this.map.drawers.stations
        for (const key of ['from', 'to']) {
          const nodeID = this.segment[key]
          if (stationDrawers.has(nodeID))
            stationDrawers.get(nodeID).takenDirs.add(dirs[key])
        }
        // Generating line attributes
        const attrs = line.attrs
        rename(attrs, 'color', 'stroke')
        rename(attrs, 'width', 'stroke-width')
        return path.drawAnimated({
          duration: 200,
        }).attr(attrs)
      })
  }
  drawSegment (path, radius) {
    return Promise.all([this.segment.fromNode(), this.segment.toNode()])
      .then(values => {
        const [fromNode, toNode] = values
        const from = fromNode.getPosition()
        const to = toNode.getPosition()
        path = path.M(from)
        const sqrt2 = Math.sqrt(2)
        const width = to.x - from.x
        const height = to.y - from.y
        const absWidth = Math.abs(width)
        const absHeight = Math.abs(height)
        const dir = value => value > 0 ? 1 : -1
        const dirX = dir(width)
        const dirY = dir(height)
        const curveLeft = {
          x: 0.5 * sqrt2 * radius * dirX + radius * dirX,
          y: 0.5 * sqrt2 * radius * dirY
        }
        const curveLeftPoint = {x: radius * dirX, y: 0}
        const curveRight = {
          x: 0.5 * sqrt2 * radius * dirX,
          y: 0.5 * sqrt2 * radius * dirY + radius * dirY
        }
        const curveRightPoint = {x: 0, y: radius * dirY}

        switch (this.segment.shape) {
          case SegmentShape.Straight:
            return path.L(to)
          case SegmentShape.Triangle:
            if (absWidth > absHeight)
              return path
                .h(width - (absHeight + radius) * dirX)
                .q(curveLeftPoint, curveLeft)
                .L(to)
            else
              return path
                .v(height - (absWidth + radius) * dirY)
                .q(curveRightPoint, curveRight)
                .L(to)
          case SegmentShape.Square:
            const targetPoint = {x: radius * dirX, y: radius * dirY}
            if (absWidth > absHeight)
              return path
                .h(width - radius * dirX)
                .q(
                  curveLeftPoint,
                  targetPoint
                )
                .L(to)
            else
              return path
                .v(height - radius * dirY)
                .q(curveRightPoint, targetPoint)
                .L(to)
          case SegmentShape.Parallel:
            if (absWidth > absHeight)
              return path
                .h((width - absHeight * dirX) / 2 - radius * dirX)
                .q(curveLeftPoint, curveLeft)
                .l({x: (absHeight - sqrt2 * radius) * dirX, y: height - sqrt2 * radius * dirY})
                .q({x: 0.5 * sqrt2 * radius * dirX, y: 0.5 * sqrt2 * radius * dirY}, curveLeft)
                .L(to)
            else
              return path
                .v((height - absWidth * dirY) / 2 - radius * dirY)
                .q(curveRightPoint, curveRight)
                .l({x: (absWidth - sqrt2 * radius) * dirY, y: width - sqrt2 * radius * dirX})
                .q({x: 0.5 * sqrt2 * radius * dirY, y: 0.5 * sqrt2 * radius * dirX}, curveRight)
                .L(to)
          default:
            return path
        }
      })
  }
}
