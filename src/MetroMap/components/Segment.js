import MapComp from '.'
import SegmentDrawer from './SegmentDrawer'

// Radian = direction * (1/4) * pi
// Degree = direction * 45
export const Direction = Object.freeze({
  Right: 0,
  RightDown: 1,
  Down: 2,
  LeftDown: 3,
  Left: 4,
  LeftUp: 5,
  Up: 6,
  RightUp: 7,
})
export function DirectionFromInt (value) {
  while (value < 0 || value >= 8) {
    if (value < 0) value += 8
    if (value >= 8) value -= 8
  }
  return value
}
export default class SegmentComp extends MapComp {
  constructor (map, container, segment) {
    super(map, container)
    this.segment = segment
  }
  draw () {
    return Promise.all([
      this.map.dataloader.getConfiguration(),
      this.segment.fromNode(),
      this.segment.toNode(),
      this.segment.getLine(),
    ])
      .then(values => {
        const [config, fromNode, toNode, line] = values
        const path = this.container.path()
          .id('segment-' + this.segment.id)
        const drawer = new SegmentDrawer(
          fromNode.getPosition(),
          toNode.getPosition(),
          this.segment.shape,
          config.cornerRadius,
        )
        drawer.draw(path)

        // Based on the assumption that the first segment
        // drawing action is always M, the absolute move.
        const dirs = drawer.direction()
        const stationDrawers = this.map.drawers.stations
        for (const key of ['from', 'to']) {
          const nodeID = this.segment[key]
          if (stationDrawers.has(nodeID))
            stationDrawers.get(nodeID).takenDirs.add(DirectionFromInt(dirs[key]))
        }
        // Generating line attributes
        const attrs = line.attrs
        function rename (object, key, newname) {
          const value = object[key] || object[newname]
          if (value) object[newname] = value
          delete object[key]
        }
        rename(attrs, 'color', 'stroke')
        rename(attrs, 'width', 'stroke-width')
        return path.drawAnimated({
          duration: 200,
        }).attr(attrs)
          .attr('from', dirs.from)
          .attr('to', dirs.to)
      })
  }
}
