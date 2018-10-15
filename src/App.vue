<template>
  <div class="root-wrapper">
    <red-game />
  </div>
</template>

<script>
import RedGame from '@/components/red-game.vue'

export default {
  name: 'app',
  components: {
    RedGame
  }
}
</script>

<style lang="scss">
  * {
    position: relative;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body, .root-wrapper {
    position: relative;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
