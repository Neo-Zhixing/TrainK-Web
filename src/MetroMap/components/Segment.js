import MapComp from '.'
import { SegmentShape } from '../models'

export default class SegmentComp extends MapComp {
  constructor (map, container, segment) {
    super(map, container)
    this.segment = segment
  }
  draw () {
    return Promise.all([
      this.segment.fromNode(),
      this.segment.toNode(),
      this.segment.getLine(),
      this.map.dataloader.getConfiguration(),
    ])
      .then(values => {
        const [fromNode, toNode, line, config] = values
        const path = this.container.path()
          .id('segment-' + this.segment.id)
          .attr(Object.assign({
            'stroke': '#333333',
            'stroke-width': 5,
            'fill': 'none',
          }, line.attrs))
        return this.drawSegment(
          path,
          fromNode.getPosition(),
          toNode.getPosition(),
          config,
        )
      })
  }
  drawSegment (path, from, to, config) {
    path = path.M(from)
    const sqrt2 = Math.sqrt(2)
    const width = to.x - from.x
    const height = to.y - from.y
    const absWidth = Math.abs(width)
    const absHeight = Math.abs(height)
    const dir = value => value > 0 ? 1 : -1
    const dirX = dir(width)
    const dirY = dir(height)
    const radius = config.cornerRadius
    switch (this.segment.shape) {
      case SegmentShape.Straight:
        return path.L(to)
      case SegmentShape.Triangle:
        if (absWidth > absHeight)
          return path
            .h(width - (absHeight + radius) * dirX)
            .q(
              {x: radius * dirX, y: 0},
              {
                x: 0.5 * sqrt2 * radius * dirX + radius * dirX,
                y: 0.5 * sqrt2 * radius * dirY
              }
            )
            .L(to)
        else
          return path
            .v(height - (absWidth + radius) * dirY)
            .q(
              {x: 0, y: radius * dirY},
              {
                x: 0.5 * sqrt2 * radius * dirX,
                y: 0.5 * sqrt2 * radius * dirY + radius * dirY
              }
            )
            .L(to)
      case SegmentShape.Square:
        const targetPoint = {x: radius * dirX, y: radius * dirY}
        if (absWidth > absHeight)
          return path
            .h(width - radius * dirX)
            .q(
              {x: radius * dirX, y: 0},
              targetPoint
            )
            .L(to)
        else
          return path
            .v(height - radius * dirY)
            .q(
              {x: 0, y: radius * dirY},
              targetPoint
            )
            .L(to)
      default:
        return path
    }
  }
}
