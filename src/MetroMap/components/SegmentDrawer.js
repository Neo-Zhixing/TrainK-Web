import { SegmentShape } from '../models'

export default function draw (from, to, shape, radius) {
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

  const segmentDirs = {
    [SegmentShape.Straight] () {
      const radian = Math.atan2(height, width)
      this.from = Math.round(4 * radian / Math.PI)
      this.to = this.from + 4
    },
    [SegmentShape.Triangle] () {
      this.from = absWidth > absHeight ? 2 - dirX * 2 : dirY * 2
      this.to = -dirY * (2 + dirX)
    },
    [SegmentShape.Square] () {
      this.from = 2 - dirX * 2
      this.to = -dirY * 2
    },
    [SegmentShape.Parallel] () {
      this.from = absWidth > absHeight ? 2 - dirX * 2 : dirY * 2
      this.to = this.from + 4
    },
  }
  const drawingFuncs = {
    [SegmentShape.Straight] () {
      this.path.L(to)
    },
    [SegmentShape.Triangle] () {
      if (absWidth > absHeight)
        this.path
          .h(width - (absHeight + radius) * dirX)
          .q(curveLeftPoint, curveLeft)
          .L(to)
      else
        this.path
          .v(height - (absWidth + radius) * dirY)
          .q(curveRightPoint, curveRight)
          .L(to)
    },
    [SegmentShape.Square] () {
      this.path
        .h(width - radius * dirX)
        .q(
          curveLeftPoint,
          {x: curveLeftPoint.x, y: curveRightPoint.y}
        )
        .L(to)
    },
    [SegmentShape.Parallel] () {
      if (absWidth > absHeight)
        this.path
          .h((width - absHeight * dirX) / 2 - radius * dirX)
          .q(curveLeftPoint, curveLeft)
          .l({x: (absHeight - sqrt2 * radius) * dirX, y: height - sqrt2 * radius * dirY})
          .q({x: 0.5 * sqrt2 * radius * dirX, y: 0.5 * sqrt2 * radius * dirY}, curveLeft)
          .L(to)
      else
        this.path
          .v((height - absWidth * dirY) / 2 - radius * dirY)
          .q(curveRightPoint, curveRight)
          .l({x: (absWidth - sqrt2 * radius) * dirY, y: width - sqrt2 * radius * dirX})
          .q({x: 0.5 * sqrt2 * radius * dirY, y: 0.5 * sqrt2 * radius * dirX}, curveRight)
          .L(to)
    },
  }
  this.draw = function (path) {
    drawingFuncs.path = path.M(from)
    drawingFuncs[shape]()
    return path
  }
  this.direction = function () {
    const dirs = {}
    segmentDirs[shape].call(dirs)
    return dirs
  }
  return this
}
