import { GlobalEnv } from '~/util/Interfaces'
import { Map,BaseMap,BeanMap } from './Map'
import { Item, LogoItem,NameItem,ScoreLevelItem,StatusItem,LifeItem,PlayerItem,NpcItem,OverItem,FinalScoreItem} from './Item'

export class Stage {
  _params: any
  index: number = 0                                              // Scene Index
  status: number = 0		                                         // Scene state, 0 means inactive/finished, 1 means normal, 2 means paused, 3 means temporary state
  timeout: number = 0				           	                         // Countdown (for process animation state judgment)
  CONFIG: any = {}                                               // map base data
  maps: Map[] = []                                               // map queue
  BaseMap!: Map                                                  // base map
  BeanMap!: Map                                                  // Bean map
  items: Item[] = []                                             // object queue
  NPCs: Item[] = []                                              // NPC object queue
  PLAYER!: Item                                                  // player object
  constructor(params: any = {}) {
    this._params = params
    Object.assign(this, this._params)
  }
  update: (globalObj: GlobalEnv) => boolean | void = () => { }   // Sniffing, processing the relative relationship of different objects under the layout
  // add object
  createItem(type: string, options: any) {
    let item: Item = new Item(options)
    if (type === 'logo') { item = new LogoItem(options) }
    if (type === 'name') { item = new NameItem(options) }
    if (type === 'score_level') { item = new ScoreLevelItem(options) }
    if (type === 'status') { item = new StatusItem(options) }
    if (type === 'life') { item = new LifeItem(options) }
    if (type === 'npc') { item = new NpcItem(options) }
    if (type === 'player') { item = new PlayerItem(options) }
    if (type === 'over') { item = new OverItem(options) }
    if (type === 'final_score') { item = new FinalScoreItem(options) }
    if (item.location) {
      const position = item.location.coord2position(item.coord.x, item.coord.y)
      item.x = position.x
      item.y = position.y
    }
    item._stage = this
    item._id = this.items.length
    this.items.push(item)
    return item
  }
  // reset object position
  resetItems() {
    this.status = 1
    this.items.forEach((item) => {
      Object.assign(item, item._params)
      if (item.location) {
        const position = item.location.coord2position(item.coord.x, item.coord.y)
        item.x = position.x
        item.y = position.y
      }
    })
  }
  // Add map
  createMap(type: string, options: any) {
    let map: Map = new Map(options)
    if (type === 'base') { map = new BaseMap(options) }
    if (type === 'bean') { map = new BeanMap(options) }
    map.data = JSON.parse(JSON.stringify(map.data))
    map.yLength = map.data.length
    map.xLength = map.data[0].length
    map._stage = this
    this.maps.push(map)
    return map
  }
  // reset map
  resetMaps() {
    this.status = 1
    this.maps.forEach((map) => {
      Object.assign(map, map._params)
      map.data = JSON.parse(JSON.stringify(map.data))
      map.yLength = map.data.length
      map.xLength = map.data[0].length
      map.imageData = null
    })
  }
  // reset the scene
  reset() {
    Object.assign(this, this._params)
    this.resetItems()
    this.resetMaps()
  }
}

export class SplashStage extends Stage {
  constructor(options: {}) {
    super(options)
  }
}

export class GameStage extends Stage {
  constructor(options: {}) {
    super(options)
    this.update = (globalObj: GlobalEnv) => {
      if (this.status === 1) {
        this.NPCs.forEach((item) => {
          if (this.BaseMap
            && !this.BaseMap.get(item.coord.x, item.coord.y)
            && !this.BaseMap.get(this.PLAYER.coord.x, this.PLAYER.coord.y)) {
            const dx = item.x - this.PLAYER.x
            const dy = item.y - this.PLAYER.y
            // 物体检测
            if (dx * dx + dy * dy < 750 && item.status !== 4) {
              if (item.status === 3) {
                item.status = 4
                globalObj.SCORE += 10
              } else {
                this.status = 3
                this.timeout = 30
              }
            }
          }
        })
        // When there are no items, go to the next level
        if (JSON.stringify(this.BeanMap.data).indexOf('0') < 0) {
          return true
        }
      } else if (this.status === 3 && !this.timeout) {
        globalObj.LIFE--
        if (globalObj.LIFE > 0) {
          this.resetItems()
        } else {
          return false
        }
      }
    }
  }
}

export class EndStage extends Stage {
  constructor(options: {}) {
    super(options)
  }
}
