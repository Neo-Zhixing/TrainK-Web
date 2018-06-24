import MapComp from '.'
import SegmentDrawer from './SegmentDrawer'
import { Point } from '../models'
// Radian = direction * (1/4) * pi
// Degree = direction * 45
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
        this.line = line
        this.drawer = new SegmentDrawer(
          fromNode.getPosition(),
          toNode.getPosition(),
          this.segment.shape,
          config.cornerRadius,
        )

        this.dirs = this.drawer.direction()
        const stationDrawers = this.map.drawers.stations
        const segmentDrawers = this.map.drawers.segments
        const offsets = ['from', 'to'].map(key => {
          // Tell the stations drawers that the direction was taken
          const nodeID = this.segment[key]
          const dir = this.dirs[key]
          if (stationDrawers.has(nodeID))
            stationDrawers.get(nodeID).takenDirs.add(DirectionFromInt(dir))

          // Drawn segments with common direction on the same node
          const cmdDirDrawers = [...segmentDrawers.values()].filter(d => {
            if (
              !d.dirs || // Excluding not-yet-drawn segments
              d === this || // Excluding this segment
              d.line.id === this.line.id // Excluding segments on the same line
            )
              return false
            if (d.segment.from === nodeID && d.dirs.from === dir)
              return true
            if (d.segment.to === nodeID && d.dirs.to === dir)
              return true
            return false
          })
          const offset = new Point()
          for (const drawer of cmdDirDrawers) {
            const deltaOffset = new Point(
              Math.sin(dir * (1 / 4) * -Math.PI),
              Math.cos(dir * (1 / 4) * -Math.PI)
            )
            if (key === 'to')
              deltaOffset.multiply(-1)
            deltaOffset.multiply(drawer.line.attrs.width)
            offset.add(deltaOffset)
          }
          return offset
        })
        const path = this.container.path()
          .id('segment-' + this.segment.id)
        this.drawer = new SegmentDrawer(
          this.drawer.from.add(offsets[0]),
          this.drawer.to.add(offsets[1]),
          this.drawer.shape,
          this.drawer.radius
        )

        this.drawer.draw(path)

        // Generating line attributes
        const attrs = Object.assign({}, this.line.attrs)
        new Map([
          ['color', 'stroke'],
          ['width', 'stroke-width']
        ]).forEach((newname, key) => {
          const value = attrs[key] || attrs[newname]
          if (value) attrs[newname] = value
          delete attrs[key]
        })
        return path.drawAnimated({
          duration: 200,
        }).attr(attrs)
      })
  }
}
