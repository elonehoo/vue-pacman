import { GlobalEnv } from '~/util/Interfaces'
import {
  Map,
  BaseMap,
  BeanMap
} from './Map'
import {
  Item,
  LogoItem,
  NameItem,
  ScoreLevelItem,
  StatusItem,
  LifeItem,
  PlayerItem,
  NpcItem,
  OverItem,
  FinalScoreItem
} from './Item'

export class Stage {
  _params: any
  index: number = 0                                              // 布景索引
  status: number = 0		                                         // 布景状态, 0表示未激活/结束, 1表示正常, 2表示暂停, 3表示临时状态
  timeout: number = 0				           	                         // 倒计时(用于过程动画状态判断)
  CONFIG: any = {}                                               // 地图基础数据
  maps: Map[] = []                                               // 地图队列
  BaseMap!: Map                                                  // 基础地图
  BeanMap!: Map                                                  // Bean地图
  items: Item[] = []                                             // 对象队列
  NPCs: Item[] = []                                              // NPC对象队列
  PLAYER!: Item                                                  // 玩家对象
  constructor(params: any = {}) {
    this._params = params
    Object.assign(this, this._params)
  }
  update: (globalObj: GlobalEnv) => boolean | void = () => { }   // 嗅探,处理布局下不同对象的相对关系
  // 添加对象
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
  // 重置物体位置
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
  // 添加地图
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
  // 重置地图
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
  // 重置布景
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
        // 当没有物品的时候，进入下一关
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
