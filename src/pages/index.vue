<script setup lang="ts">

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

