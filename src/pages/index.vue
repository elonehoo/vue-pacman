<script setup lang="ts">
import { onMounted } from 'vue'
import {CANVAS_WIDTH,CANVAS_HEIGHT,MAP_DATA} from '~/util/Constant'
import {GlobalEnv} from '~/util/Interfaces'
import {getCanvasElementById,getCanvasRenderingContext2D} from '~/util/Utils'
import {Stage,SplashStage,GameStage,EndStage} from '~/methods/Stage'
import { Map,BaseMap,BeanMap } from '~/methods/Map'
import { Item,LogoItem,NameItem,ScoreLevelItem,StatusItem,LifeItem,PlayerItem,NpcItem} from '~/methods/Item'

const $canvas = ref()
const $context = ref()
const WIDTH = ref(CANVAS_WIDTH)
const HEIGHT = ref(CANVAS_HEIGHT)
const stages = ref()
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

onMounted(()=>{
  initCanvas()
  initStages()
})

function initCanvas(){
  $canvas.value = getCanvasElementById('canvas')
  $canvas.value.width = WIDTH.value
  $canvas.value.height = HEIGHT.value
  $context.value = getCanvasRenderingContext2D($canvas.value)
}

function initStages(){
  initSplashStage()
  initMainStage()
  initEndStage()
  window.addEventListener('keydown',(e)=>{
    switch(e.keyCode){
      case 13: //enter
      case 32: //space
        if(currentIndex.value === 0){
          nextStage()
        }else if(currentIndex.value === stages.value.length - 1){
          globalObj.value.SCORE = 0
          globalObj.value.LIFE = 5
          nextStage()
        }else{
          const STATUS = stages.value[currentIndex.value].status
          stages.value[currentIndex.value].status = STATUS === 2 ? 1 : 2
        }
        break
      case 39: //right
        stages.value[currentIndex.value].PLAYER.control = {orientation:0}
        break
      case 40: //down
        stages.value[currentIndex.value].PLAYER.control = {orientation:1}
        break
      case 37: //left
        stages.value[currentIndex.value].PLAYER.control = {orientation:2}
        break
      case 38: //up
        stages.value[currentIndex.value].PLAYER.control = {orientation:3}
        break
    }
    e.preventDefault()
  })
}


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

