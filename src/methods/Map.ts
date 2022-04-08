import { GlobalEnv, Vector } from '~/util/Interfaces'
import { Stage } from './Stage'

export class Map {
  _params: any
  _stage!: Stage
  x: number = 0				           	                                // The coordinates of the starting point of the map
  y: number = 0					                                          // The coordinates of the starting point of the map
  size: number = 20       				                                // width of map cells
  data: any[] = []                                                // map data
  xLength: number = 0				                                      // 2D array x-axis length
  yLength: number = 0			      	                                // 2D array y-axis length
  // layout related
  frames: number = 1				                                      // Speed level, how many frames change in internal calculator times
  times: number = 0				                                        // Refresh canvas count (for loop animation state judgment)
  cache: boolean = false		                                      // Whether it is static (if static, set the cache)
  imageData!: ImageData | null
  constructor(params: {} = {}) {
    this._params = params
    Object.assign(this, this._params)
  }
  update: () => void = () => { } 	                                // Update map data
  draw: (context: any, globalObj: GlobalEnv) => void = () => { }  // draw
  get(px: number, py: number) {
    if (this.data[py] && typeof this.data[py][px] !== 'undefined') {
      return this.data[py][px]
    }
    return -1
  }
  set(x: number, y: number, value: number) {
    if (this.data[y]) { this.data[y][x] = value }
  }
  coord2position(cx: number, cy: number) {
    return {
      x: this.x + cx * this.size + this.size / 2,
      y: this.y + cy * this.size + this.size / 2
    }
  }
  position2coord(x: number, y: number) {
    const fx = Math.abs(x - this.x) % this.size - this.size / 2
    const fy = Math.abs(y - this.y) % this.size - this.size / 2
    return {
      x: Math.floor((x - this.x) / this.size),
      y: Math.floor((y - this.y) / this.size),
      offset: Math.sqrt(fx * fx + fy * fy)
    }
  }
  finder(params: any) {
    const defaults = {
      map: null,
      start: {},
      end: {},
      type: 'path'
    }
    const options = Object.assign({}, defaults, params)
    // When the start or end point is set on the wall
    if (options.map[options.start.y][options.start.x] || options.map[options.end.y][options.end.x]) {
      return []
    }
    let finded = false
    const result: Vector[] = []
    const yLength: number = options.map.length
    const xLength: number = options.map[0].length

    // map of steps
    const steps: Vector[][] = []
    for (let y = yLength; y--;) {
      steps[y] = new Array(xLength).fill(0)
    }
    // Get the value on the map
    const _getValue = (x: number, y: number) => {
      if (options.map[y] && typeof options.map[y][x] !== 'undefined') {
        return options.map[y][x]
      }
      return -1
    }
    // Determine if you can walk, you can put it into the list
    const _next = (to: Vector) => {
      const value = _getValue(to.x, to.y)
      if (value < 1) {
        if (value === -1) {
          to.x = (to.x + xLength) % xLength
          to.y = (to.y + yLength) % yLength
          to.change = 1
        }
        if (!steps[to.y][to.x]) {
          result.push(to)
        }
      }
    }
    // find the line
    const _render = (list: Vector[]) => {
      const newList: Vector[] = []
      const next = (from: Vector, to: Vector) => {
        const value = _getValue(to.x, to.y)
        // Is it possible to go to the current point
        if (value < 1) {
          if (value === -1) {
            to.x = (to.x + xLength) % xLength
            to.y = (to.y + yLength) % yLength
            to.change = 1
          }
          if (to.x === options.end.x && to.y === options.end.y) {
            steps[to.y][to.x] = from
            finded = true
          } else if (!steps[to.y][to.x]) {
            steps[to.y][to.x] = from
            newList.push(to)
          }
        }
      }
      list.forEach((current: Vector) => {
        next(current, { y: current.y + 1, x: current.x })
        next(current, { y: current.y, x: current.x + 1 })
        next(current, { y: current.y - 1, x: current.x })
        next(current, { y: current.y, x: current.x - 1 })
      })
      if (!finded && newList.length) {
        _render(newList)
      }
    }
    _render([options.start])
    if (finded) {
      let current = options.end
      if (options.type === 'path') {
        while (current.x !== options.start.x || current.y !== options.start.y) {
          result.unshift(current)
          current = steps[current.y][current.x]
        }
      } else if (options.type === 'next') {
        _next({ x: current.x + 1, y: current.y })
        _next({ x: current.x, y: current.y + 1 })
        _next({ x: current.x - 1, y: current.y })
        _next({ x: current.x, y: current.y - 1 })
      }
    }
    return result
  }
}

export class BaseMap extends Map {
  constructor(options: {}) {
    super(options)
    this.draw = (context: any, globalObj: GlobalEnv) => {
      context.lineWidth = 2
      for (let j = 0; j < this.yLength; j++) {
        for (let i = 0; i < this.xLength; i++) {
          const value = this.get(i, j)
          if (value) {
            const code = [0, 0, 0, 0]
            if (this.get(i + 1, j) && !(this.get(i + 1, j - 1) && this.get(i + 1, j + 1) && this.get(i, j - 1) && this.get(i, j + 1))) {
              code[0] = 1
            }
            if (this.get(i, j + 1) && !(this.get(i - 1, j + 1) && this.get(i + 1, j + 1) && this.get(i - 1, j) && this.get(i + 1, j))) {
              code[1] = 1
            }
            if (this.get(i - 1, j) && !(this.get(i - 1, j - 1) && this.get(i - 1, j + 1) && this.get(i, j - 1) && this.get(i, j + 1))) {
              code[2] = 1
            }
            if (this.get(i, j - 1) && !(this.get(i - 1, j - 1) && this.get(i + 1, j - 1) && this.get(i - 1, j) && this.get(i + 1, j))) {
              code[3] = 1
            }
            if (code.includes(1)) {
              context.strokeStyle = value === 2 ? '#FFF' : this._stage.CONFIG.wall_color
              const pos = this.coord2position(i, j)
              switch (code.join('')) {
                case '1100':
                  context.beginPath()
                  context.arc(pos.x + this.size / 2, pos.y + this.size / 2, this.size / 2, Math.PI, 1.5 * Math.PI, false)
                  context.stroke()
                  context.closePath()
                  break
                case '0110':
                  context.beginPath()
                  context.arc(pos.x - this.size / 2, pos.y + this.size / 2, this.size / 2, 1.5 * Math.PI, 2 * Math.PI, false)
                  context.stroke()
                  context.closePath()
                  break
                case '0011':
                  context.beginPath()
                  context.arc(pos.x - this.size / 2, pos.y - this.size / 2, this.size / 2, 0, .5 * Math.PI, false)
                  context.stroke()
                  context.closePath()
                  break
                case '1001':
                  context.beginPath()
                  context.arc(pos.x + this.size / 2, pos.y - this.size / 2, this.size / 2, .5 * Math.PI, 1 * Math.PI, false)
                  context.stroke()
                  context.closePath()
                  break
                default:
                  const dist = this.size / 2
                  code.forEach((v, index) => {
                    if (v) {
                      context.beginPath()
                      context.moveTo(pos.x, pos.y)
                      context.lineTo(pos.x - globalObj.COS[index] * dist, pos.y - globalObj.SIN[index] * dist)
                      context.stroke()
                      context.closePath()
                    }
                  })
              }
            }
          }
        }
      }
    }
  }
}

export class BeanMap extends Map {
  constructor(options: {}) {
    super(options)
    this.draw = (context: any, globalObj: GlobalEnv) => {
      for (let j = 0; j < this.yLength; j++) {
        for (let i = 0; i < this.xLength; i++) {
          if (!this.get(i, j)) {
            const pos = this.coord2position(i, j)
            context.fillStyle = '#F5F5DC'
            if (this._stage.CONFIG.goods.includes(`${i},${j}`)) {
              context.beginPath()
              context.arc(pos.x, pos.y, 3 + this.times % 2, 0, 2 * Math.PI, true)
              context.fill()
              context.closePath()
            } else {
              context.fillRect(pos.x - 2, pos.y - 2, 4, 4)
            }
          }
        }
      }
    }
  }
}
