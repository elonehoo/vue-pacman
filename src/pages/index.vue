<script setup lang="ts">
import {CANVAS_WIDTH,CANVAS_HEIGHT,MAP_DATA} from '~/util/Constant'
import {GlobalEnv} from '~/util/Interfaces'
import {getCanvasElementById,getCanvasRenderingContext2D} from '~/util/Utils'
import {Stage,SplashStage,GameStage,EndStage} from '~/methods/Stage'
import { Map,BaseMap,BeanMap } from '~/methods/Map'
import { Item,LogoItem,NameItem,ScoreLevelItem,StatusItem,LifeItem,PlayerItem,NpcItem} from '~/methods/Item'

const $canvas! = ref(null)
const $context! = ref(null)
const WIDTH = ref(CANVAS_WIDTH)
const HEIGHT = ref(CANVAS_HEIGHT)
const stages = ref([])
const currentIndex = ref(0)
  // 动画变量
const currentFrame = ref(0)
const handler = ref(0)
  // 全局变量
const globalObj = ref({
  COLOR: ['#F00', '#F93', '#0CF', '#F9C'],  // NPC 颜色
  COS: [1, 0, -1, 0],
  SIN: [0, 1, 0, -1],
  SCORE: 0,
  LIFE: 5,
  NPC_COUNT: 4
})
</script>

<template>
  <div class="pac-man">
    <canvas id="canvas" class="canvas"></canvas>
  </div>
</template>

<style scoped lang="scss">
.pac-man {
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.btn {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 50px;
  z-index: 10;
  background: #14517a;
  font-size: 30px;
  color: #fff;
}
</style>

