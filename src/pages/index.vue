<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { CANVAS_HEIGHT, CANVAS_WIDTH, MAP_DATA } from '~/util/Constant'
import { GlobalEnv } from '~/util/Interfaces'
import { getCanvasElementById, getCanvasRenderingContext2D } from '~/util/Utils'
import type { Stage } from '~/methods/Stage'
import { EndStage, GameStage, SplashStage } from '~/methods/Stage'
import type { Map } from '~/methods/Map'
import { BaseMap, BeanMap } from '~/methods/Map'
import type { Item } from '~/methods/Item'
import { LifeItem, LogoItem, NameItem, NpcItem, PlayerItem, ScoreLevelItem, StatusItem } from '~/methods/Item'

const $canvas = ref()
const $context = ref()
const WIDTH = ref(CANVAS_WIDTH)
const HEIGHT = ref(CANVAS_HEIGHT)
const stages: Stage[] = reactive([])
const currentIndex = ref(0)
// animation variable
const currentFrame = ref(0)
const handler = ref(0)
// global variable
const globalObj = ref({
  COLOR: ['#F00', '#F93', '#0CF', '#F9C'], // NPC color
  COS: [1, 0, -1, 0],
  SIN: [0, 1, 0, -1],
  SCORE: 0,
  LIFE: 5,
  NPC_COUNT: 4,
})

onMounted(() => {
  initCanvas()
  initStages()
  startAnimate()
})

function initCanvas() {
  $canvas.value = getCanvasElementById('canvas')
  $canvas.value.width = WIDTH.value
  $canvas.value.height = HEIGHT.value
  $context.value = getCanvasRenderingContext2D($canvas.value)
}

function initStages() {
  initSplashStage()
  initMainStage()
  initEndStage()
  window.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
      case 13: // enter
      case 32: // space
        if (currentIndex.value === 0) {
          nextStage()
        }
        else if (currentIndex.value === stages.length - 1) {
          globalObj.value.SCORE = 0
          globalObj.value.LIFE = 5
          nextStage()
        }
        else {
          const STATUS = stages[currentIndex.value].status
          stages[currentIndex.value].status = STATUS === 2 ? 1 : 2
        }
        break
      case 39: // right
        stages[currentIndex.value].PLAYER.control = { orientation: 0 }
        break
      case 40: // down
        stages[currentIndex.value].PLAYER.control = { orientation: 1 }
        break
      case 37: // left
        stages[currentIndex.value].PLAYER.control = { orientation: 2 }
        break
      case 38: // up
        stages[currentIndex.value].PLAYER.control = { orientation: 3 }
        break
    }
    e.preventDefault()
  })
}
function initSplashStage() {
  const stage = new SplashStage({
    index: stages ? stages.length : 0,
  })
  stage.createItem('logo', {
    x: WIDTH.value / 2,
    y: HEIGHT.value * 0.45,
    width: 100,
    height: 100,
    frames: 3,
  })
  stage.createItem('name', {
    x: WIDTH.value / 2,
    y: HEIGHT.value * 0.6,
  })
  stages.push(stage)
}
function initMainStage() {
  MAP_DATA.forEach((config: any) => {
    const stage = new GameStage({
      index: stages.length,
      CONFIG: config,
    })
    stage.BaseMap = stage.createMap('base', {
      x: 60,
      y: 10,
      data: config.map,
      cache: true,
    })
    stage.BeanMap = stage.createMap('bean', {
      x: 60,
      y: 10,
      data: config.map,
      frames: 8,
    })
    stage.createItem('score_level', {
      x: 690,
      y: 80,
    })
    stage.createItem('status', {
      x: 690,
      y: 285,
      frames: 25,
    })
    stage.createItem('life', {
      x: 705,
      y: 510,
      width: 30,
      height: 30,
    })
    for (let i = 0; i < globalObj.value.NPC_COUNT; i++) {
      const npcItem = stage.createItem('npc', {
        width: 30,
        height: 30,
        color: globalObj.value.COLOR[i],
        location: stage.BeanMap,
        coord: { x: 12 + i, y: 14 },
        vector: { x: 12 + i, y: 14 },
        orientation: 3,
        type: 2,
        speed: 1,
        frames: 10,
        timeout: Math.floor(Math.random() * 120),
      })
      stage.NPCs.push(npcItem)
    }
    stage.PLAYER = stage.createItem('player', {
      width: 30,
      height: 30,
      location: stage.BaseMap,
      coord: { x: 13.5, y: 23 },
      orientation: 2,
      type: 1,
      speed: 2,
      frames: 10,
    })
    stages.push(stage)
  })
}

function initEndStage() {
  const stage = new SplashStage({
    index: stages.length,
  })
  stage.createItem('over', {
    x: WIDTH.value / 2,
    y: HEIGHT.value * 0.35,
  })
  stage.createItem('final_score', {
    x: WIDTH.value / 2,
    y: HEIGHT.value * 0.5,
  })
  stages.push(stage)
}
function setStage(index: number) {
  currentIndex.value = index
  stages[index].reset()
}
function nextStage() {
  if (currentIndex.value < stages.length)
    setStage(++currentIndex.value)

  else
    setStage(0)
}
function startAnimate() {
  const stage: Stage = stages[currentIndex.value]
  drawCanvas()
  currentFrame.value++
  if (stage.timeout) {
    stage.timeout--
  }
  const result = stage.update(globalObj.value)
  if (result !== false) {
    if (result)
      nextStage()

    stage.maps.forEach((map: Map) => {
      if (!(currentFrame.value % map.frames))
        map.times = currentFrame.value / map.frames

      if (map.cache) {
        if (!map.imageData) {
          $context.value.save()
          map.draw($context.value, globalObj.value)
          map.imageData = $context.value.getImageData(0, 0, WIDTH.value, HEIGHT.value)
          $context.value.restore()
        }
        else {
          $context.value.putImageData(map.imageData, 0, 0)
        }
      }
      else {
        map.draw($context.value, globalObj.value)
      }
    })
    stage.items.forEach((item: Item) => {
      if (!(currentFrame.value % item.frames))
        item.times = currentFrame.value / item.frames

      if (stage.status === 1 && item.status !== 2) {
        if (item.location)
          item.coord = item.location.position2coord(item.x, item.y)

        if (item.timeout) {
          item.timeout--
        }
        item.update(globalObj.value)
      }
      item.draw($context.value, globalObj.value)
    })
  }
  else {
    gameOver()
  }
  handler.value = requestAnimationFrame(startAnimate)
}
function drawCanvas() {
  $context.value.clearRect(0, 0, WIDTH.value, HEIGHT.value)
  $context.value.fillStyle = '#000'
  $context.value.fillRect(0, 0, WIDTH.value, HEIGHT.value)
}
function stopAnimate() {
  if (handler.value) cancelAnimationFrame(handler.value)
}
function gameOver() {
  setStage(stages.length - 1)
  stopAnimate()
}
</script>

<template>
  <div class="wrapper">
			<div class="mod-game">
				<canvas id="canvas" class="canvas" width="960" height="640">不支持画布</canvas>
				<div class="info">
					<p>Press [space/enter] to pause or continue</p>
          <p>[←↑↓→] to move</p>
				</div>
			</div>
		</div>
</template>

<style scoped lang="scss">
*{padding:0;margin:0;}
			.wrapper{
				width: 960px;
				margin:0 auto;
				color:#999;
			}
			canvas{display:block;background: #000;}
			.mod-game .info{
				padding: 10px 0;
				margin-bottom: 5px;
				line-height: 20px;
				text-align: center;
				color: #666;
			}
			.mod-game .info p{
				line-height: 20px;
				font-size: 14px;
				color: #666;
			}
			.mod-game .intro{
				padding: 10px 15px;
				background: #f8f8f8;
				border-radius: 5px;
			}
			.mod-game .intro p{
				line-height: 22px;
				text-indent: 2em;
				font-size: 14px;
				color: #666;
			}
</style>
