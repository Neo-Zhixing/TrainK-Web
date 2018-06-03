import MapComp from '.'

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
    ])
      .then(values => {
        const [fromNode, toNode, line] = values
        console.log(values)
        return this.container.path()
          .id('segment-' + this.segment.id)
          .M(...fromNode.getPosition())
          .L(...toNode.getPosition())
          .attr(line.attrs)
      })
  }
}
