<template>
  <Tile
    :value="position.value"
    :class="{ selected }"
    @click="$emit('click')"
  ></Tile>
</template>

<script>
  import Tile from './tile.vue'

  export default {
    name: 'Position',
    components: { Tile },
    props: ['position', 'selectedPosition'],
    computed: {
      selected () {
        return this.position === this.selectedPosition
      }
    }
  }
</script>

<style lang="scss" scoped>
  .selected {
    opacity: 0.5;
  }
</style>