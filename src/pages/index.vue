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
  startAnimate()
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
function initSplashStage(){
  const stage = new SplashStage({
    index: stages.value.length
  })
  stage.createItem('logo',{
    x: WIDTH.value / 2,
    y: HEIGHT.value * .45,
    width: 100,
    height:100,
    frames: 3
  })
  stage.createItem('name',{
    x: WIDTH.value / 2,
    y: HEIGHT.value * .6
  })
  stages.value.push(stage)
}
function initMainStage(){
  MAP_DATA.forEach((config:any)=>{
    const stage = new GameStage({
      index: stages.value.length,
      CONFIG:config
    })
    stage.BaseMap = stage.createMap('base',{
      x: 60,
      y: 10,
      data:config.map,
      cache: true
    })
    stage.BeanMap = stage.createMap('bean',{
      x: 60,
      y: 10,
      data:config.map,
      frames: 8
    })
    stage.createItem('score_level', {
      x: 690,
      y: 80
    })
    stage.createItem('status', {
      x: 690,
      y: 285,
      frames: 25
    })
    stage.createItem('life', {
      x: 705,
      y: 510,
      width: 30,
      height: 30
    })
    for(let i = 0 ; i < globalObj.value.NPC_COUNT; i++){
      const npcItem = stage.createItem('npc',{
        width: 30,
        height:30,
        color: globalObj.value.COLOR[i],
        location: stage.BeanMap,
        coord:{x: 12 + i,y: 14},
        vector:{ x: 12 + i, y: 14 },
        orientation: 3,
        type: 2,
        speed: 1,
        frames: 10,
        timeout: Math.floor(Math.random() * 120)
      })
      stage.NPCs.push(npcItem)
    }
    stage.PLAYER = stage.createItem('player',{
      width: 30,
      height: 30,
      location: stage.BaseMap,
      coord: { x: 13.5, y: 23 },
      orientation: 2,
      type: 1,
      speed: 2,
      frames: 10
    })
    stages.value.push(stage)
  })
}

function initEndStage(){
  const stage = new SplashStage({
    index: stages.value.length
  })
  stage.createItem('over',{
    x: WIDTH.value / 2,
    y: HEIGHT.value * .35
  })
  stage.createItem('final_score',{
    x: WIDTH.value / 2,
    y: HEIGHT.value * .5
  })
  stages.value.push(stage)
}
function setStage(index:number){
  currentIndex.value = index
  stages.value[index].reset()
}
function nextStage(){
  if(currentIndex.value < stages.value.length){
    setStage(++currentIndex.value)
  }else{
    setStage(0)
  }
}
function startAnimate(){
  const stage = stages.value[currentIndex.value]
  drawCanvas()
  currentFrame.value++
  if(stage.timeout){
    stage.timeout--
  }
  const result = stage.update(globalObj.value)
  if(result !== false){
    if(result){
      nextStage()
    }
    stage.maps.foreach((map:Map)=>{
      if(!(currentFrame.value % map.frames)){
        map.times = currentFrame.value / map.frames
      }
      if(map.cache){
        if(!map.imageData){
          $context.value.save()
          map.draw($context.value,globalObj.value)
          map.imageData = $context.value.getImageData(0,0,WIDTH.value,HEIGHT.value)
          $context.value.restore()
        }else{
          $context.value.putImageData(map.imageData, 0, 0)
        }
      }else{
        map.draw($context.value, globalObj.value)
      }
    })
    stage.items.foreach((item:Item)=>{
      if(!(currentFrame.value % item.frames)){
        item.times = currentFrame.value / item.frames
      }
      if(stage.status === 1 && item.status !== 2){
        if(item.location){
          item.coord = item.location.position2coord(item.x, item.y)
        }
        if(item.timeout){
          item.timeout--
        }
        item.update(globalObj.value)
      }
      item.draw($context.value, globalObj.value)
    })
  }else{
    gameOver()
  }
  handler.value = requestAnimationFrame(startAnimate)
}
function drawCanvas(){
  $context.value.clearRect(0,0,WIDTH.value,HEIGHT.value)
  $context.value.fillStyle = '#000'
  $context.value.fillRect(0,0,WIDTH.value,HEIGHT.value)
}
function stopAnimate(){
  if (handler.value) { cancelAnimationFrame(handler.value) }
}
function gameOver(){
  setStage(stages.value.length - 1)
  stopAnimate()
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

