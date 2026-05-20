// @ts-nocheck
import Paper from 'paper'

type MetaBlobOptions = {
  bounds: paper.Rectangle
  center: paper.Point
  size: paper.Size
  color?: string
  scaleFactor?: number
  scalingMaxWidth?: number
  centerRadius?: number
  radiusRandom?: number
  radiusMin?: number
  offsetXProportion?: number
  offsetYProportion?: number
  sinRandom?: number
  sinMin?: number
  offsetXVariant?: number
  offsetYVariant?: number
  sineVariant?: number
  deltaModifierX?: number
  deltaModifierY?: number
  handle_len_rate?: number
  blobDistanceFactor?: number
  blobRadiusFactor?: number
  scope: paper.PaperScope
}

export class MetaBlobScope {
  metaBalls: paper.Group
  originals: paper.Group

  // store the current scale
  // updated on resize
  resizeTimer: any
  startWidth: number
  currentScale: number

  // circle variables
  circles
  numberOfCircles
  radiusRandom: number
  radiusMin: number
  offsetXProportion: number
  offsetYProportion: number
  offSetXRandom: number = 0
  offSetYRandom: number = 0
  offSetXMin: number = 0
  offSetYMin: number = 0
  sinRandom: number
  sinMin: number
  offsetXVariant: number
  offsetYVariant: number
  sineVariant: number
  scaleFactor: number
  scalingMaxWidth: number
  strokeWidth: number

  // colours
  planetColour: paper.Color
  moonColour: paper.Color
  connectorColour: paper.Color

  //sizes
  largeMobileSize: number = 500
  tabletSize: number = 768
  desktopSize: number = 950
  widescreenSize: number = 1280

  // mouseposition
  deltaModifierX: number
  deltaModifierY: number

  // metaballs
  connections: paper.Group
  handle_len_rate: number
  blobDistance: number
  blobDistanceFactor: number
  blobRadiusFactor: number

  bounds: paper.Rectangle
  center: paper.Point
  size: paper.Size

  group: paper.Group
  scope: paper.PaperScope

  constructor(opts: MetaBlobOptions) {
    this.bounds = opts.bounds
    this.center = opts.center
    this.size = opts.size
    this.scope = opts.scope
    this.metaBalls = new this.scope.Group()

    // metaballs
    this.connections = new this.scope.Group({
      parent: this.metaBalls,
    })

    // dont put originals in the dom
    this.originals = new this.scope.Group({
      parent: this.metaBalls,
    })

    this.group = new this.scope.Group([
      this.metaBalls,
      this.originals,
      this.connections,
    ])

    // colours
    this.planetColour = new this.scope.Color(opts.color || 'black')
    this.moonColour = new this.scope.Color(opts.color || 'black')
    this.connectorColour = new this.scope.Color(opts.color || 'black')
    this.circles = []
    this.numberOfCircles = Math.ceil(Math.random() * 3) + 1
    // vary this to change distance moved by blobs:
    this.radiusRandom = opts.radiusRandom || 120
    this.radiusMin = opts.radiusMin || 50
    this.offsetXProportion = opts.offsetXProportion || 0.28
    this.offsetYProportion = opts.offsetYProportion || 0.48
    this.sinRandom = opts.sinRandom || 275
    this.sinMin = opts.sinMin || 115
    this.offsetXVariant = opts.offsetXVariant || 1.5
    this.offsetYVariant = opts.offsetYVariant || 1.9
    this.sineVariant = opts.sineVariant || 1.5
    this.deltaModifierX = opts.deltaModifierX || 464
    this.deltaModifierY = opts.deltaModifierY || 466.203125
    this.handle_len_rate = opts.handle_len_rate || 17.2
    this.blobDistanceFactor = opts.blobDistanceFactor || 7.7
    this.blobRadiusFactor = opts.blobRadiusFactor || 2
    this.setOffsetRandom()
    // for varying moon rotation
    // scaling
    this.scaleFactor = opts.scaleFactor || 1
    this.scalingMaxWidth = opts.scalingMaxWidth || 1200
    this.startWidth = this.bounds.width
    this.strokeWidth = this.size.width > this.tabletSize ? 1 : 2
    // this.deltaModifierX = this.size.width / 2
    // this.deltaModifierY = this.size.height / 4
    this.blobDistance = this.size.width / this.blobDistanceFactor
    this.center = opts.center || this.scope.view.center
    this.currentScale = (this.bounds.width / this.scalingMaxWidth) * this.scaleFactor

    const centerBall = new this.scope.Path.Circle({
      center: this.center,
      radius: opts.centerRadius || 20,
      parent: this.group,
      fillColor: this.planetColour,
    })

    this.group.addChild(centerBall)
    
    for (var i = 0; i < this.numberOfCircles; i++) {
      var circleRadius =
        (Math.floor(Math.random() * this.radiusRandom) + this.radiusMin) * this.currentScale
      var offsetRandomSeed = [Math.random(), Math.random()]

      var circle = new this.scope.Path.Circle({
        center: this.center.add(
          new this.scope.Point(
            Math.floor(Math.random() * this.offSetXRandom) - this.offSetXMin,
            Math.floor(Math.random() * this.offSetYRandom) - this.offSetYMin
          )
        ),
        // center: this.center,
        radius: circleRadius,
        parent: this.originals,
        moon: true,
        fillColor: this.moonColour,
        // fillColor: 'black',
        originalRadius: circleRadius,
        // selected: true,
        // selected: !isMoon,
        offsetRandomSeed: offsetRandomSeed,
        sine: [
          Math.floor(Math.random() * this.sinRandom) + this.sinMin,
          Math.floor(Math.random() * this.sinRandom) + this.sinMin,
        ],
      })
      // @ts-ignore
      circle.offset = this.createCircleOffset(circle)
      // @ts-ignore
      circle.orginalBounds = circle.bounds
      this.circles.push(circle)
    }
  }

  generateConnections(paths) {
    // Remove the last connection paths:
    if (this.connections) {
      this.connections.children = []
      for (var i = 0, l = paths.length; i < l; i++) {
        for (var j = i - 1; j >= 0; j--) {
          var path = this.metaball(
            paths[i],
            paths[j],
            0.7,
            this.handle_len_rate,
            this.blobDistance
          )
          if (path) {
            this.connections.addChild(path)
          }
        }
      }
    }
  }

  getScale() {
    clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(() => {
      this.resize()
    }, 200)
  }

  resize() {
    // change the offset and rescale circles
    for (var i = 0; i < this.circles.length; i++) {
      this.circles[i].offset = this.createCircleOffset(this.circles[i])
      this.circles[i].fitBounds(this.circles[i].orginalBounds)
      this.circles[i].scale(this.currentScale)
    }
  }

  setOffsetRandom() {
    this.offSetXRandom =
      this.bounds.width > this.bounds.height
        ? this.bounds.height * this.offsetXProportion
        : this.bounds.width * this.offsetXProportion
    this.offSetXMin = this.offSetXRandom / 2
    this.offSetYRandom =
      this.bounds.width > this.bounds.height
        ? this.bounds.height * this.offsetYProportion
        : this.bounds.width * this.offsetYProportion
    this.offSetYMin = this.offSetYRandom / 2
  }

  createCircleOffset(circle) {
    // @ts-ignore
    // return this.scope.Point.random().multiply(this.bounds.size.add(this.bounds.center /2))
    this.setOffsetRandom()
    var offset = new this.scope.Point(
      Math.floor(circle.offsetRandomSeed[0] * this.offSetXRandom) - this.offSetXMin,
      Math.floor(circle.offsetRandomSeed[1] * this.offSetYRandom) - this.offSetYMin
    )
    return offset
  }

  move(count) {
    for (let i = 0; i < this.circles.length; i++) {
      this.moveCircles(count, i)
    }
    this.generateConnections(this.circles)
  }

  moveCircles(count, i) {
    if (!this.circles[i].moon) {
      return
    }
    // var centerX = this.circles[i].moon
    //   ? this.circles[i - 1].position.x
    //   : this.center.x
    // var centerY = this.circles[i].moon
    //   ? this.circles[i - 1].position.y
    //   : this.center.y
    const centerX = this.center.x
    const centerY = this.center.y
    var parentPoint = new this.scope.Point(centerX, centerY)

    var offsetX = this.circles[i].offset.x / this.offsetXVariant
    var offsetY = this.circles[i].offset.y / this.offsetYVariant
    var sin0 = this.circles[i].sine[0] / this.sineVariant
    var sin1 = this.circles[i].sine[1] / this.sineVariant

    var spinX = offsetX * Math.sin(count / sin0)
    var spinY = offsetY * Math.sin(count / sin1)
    var deltaX
    var deltaY
    deltaX = (this.center.x - centerX) / (i + 2)
    // deltaX = (this.deltaModifierX - centerX) / (i + 2)
    // deltaY = (this.deltaModifierY - centerY) / (i + 2)
    deltaY = (this.center.y - centerY) / (i + 2)
    spinX += deltaX
    spinY += deltaY
    var point = new this.scope.Point(spinX, spinY)

    this.circles[i].position = parentPoint.add(point)
  }

  // ---------------------------------------------
  metaball(ball1, ball2, v, handle_len_rate, maxDistance) {
    var center1 = ball1.position
    var center2 = ball2.position
    var radius1 = ball1.bounds.width / 2
    var radius2 = ball2.bounds.width / 2

    var newMaxDistance = ((radius1 + radius2) / 2) * this.blobRadiusFactor
    var pi2 = Math.PI / 2
    var d = center1.getDistance(center2)
    var u1, u2
    if (radius1 === 0 || radius2 === 0) return
    if (d > newMaxDistance || d <= Math.abs(radius1 - radius2)) {
      return
    } else if (d < radius1 + radius2) {
      // case circles are overlapping
      u1 = Math.acos(
        (radius1 * radius1 + d * d - radius2 * radius2) / (2 * radius1 * d)
      )
      u2 = Math.acos(
        (radius2 * radius2 + d * d - radius1 * radius1) / (2 * radius2 * d)
      )
    } else {
      u1 = 0
      u2 = 0
    }

    var angle1 = center2.subtract(center1).getAngleInRadians()
    var angle2 = Math.acos((radius1 - radius2) / d)
    var angle1a = angle1 + u1 + (angle2 - u1) * v
    var angle1b = angle1 - u1 - (angle2 - u1) * v
    var angle2a = angle1 + Math.PI - u2 - (Math.PI - u2 - angle2) * v
    var angle2b = angle1 - Math.PI + u2 + (Math.PI - u2 - angle2) * v
    var p1a = center1.add(this.getVector(angle1a, radius1))
    var p1b = center1.add(this.getVector(angle1b, radius1))
    var p2a = center2.add(this.getVector(angle2a, radius2))
    var p2b = center2.add(this.getVector(angle2b, radius2))

    // define handle length by the distance between
    // both ends of the curve to draw
    var totalRadius = radius1 + radius2
    var d2 = Math.min(
      v * handle_len_rate,
      p1a.subtract(p2a).length / totalRadius
    )

    // case circles are overlapping:
    d2 *= Math.min(1, (d * 2) / (radius1 + radius2))

    radius1 *= d2
    radius2 *= d2

    var path = new this.scope.Path({
      segments: [p1b, p2b, p2a, p1a],
      fillColor: this.connectorColour,
      closed: true,
      // selected: true,
    })
    var segments = path.segments
    segments[0].handleOut = this.getVector(angle1b + pi2, radius1)
    segments[1].handleIn = this.getVector(angle2b - pi2, radius2)
    segments[2].handleOut = this.getVector(angle2a + pi2, radius2)
    segments[3].handleIn = this.getVector(angle1a - pi2, radius1)
    return path
  }

  // ------------------------------------------------
  getVector(radians, length) {
    return new this.scope.Point({
      // Convert radians to degrees:
      angle: (radians * 180) / Math.PI,
      length: length,
    })
  }

}
