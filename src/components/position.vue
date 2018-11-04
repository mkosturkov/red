<template>
  <div
    :class="{ selected, isAllowedMove, isNotAllowedMove }"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <Tile :value="position.value" />
  </div>
</template>

<script>
  import Tile from './tile.vue'

  export default {
    name: 'Position',
    components: { Tile },
    props: [
      'position',
      'selectedPosition',
      'game'
    ],
    data () {
      return {
        isAllowedMove: false,
        isNotAllowedMove: false
      }
    },
    computed: {
      selected () {
        return this.position === this.selectedPosition
      }
    },
    methods: {
      hasSelected () {
        return !!this.selectedPosition
      },
      handleMouseEnter () {
        this.isAllowedMove = this.hasSelected()
          && this.game.canMoveTile(
            this.selectedPosition,
            this.position
          )
        this.isNotAllowedMove = this.hasSelected() && !this.isAllowedMove
      },
      handleMouseLeave () {
        this.isAllowedMove = false
        this.isNotAllowedMove = false
      },
      handleClick () {
        if (this.isNotAllowedMove) {
          setTimeout(() => {
            this.isNotAllowedMove = false
            this.$emit('click')
          }, 250)
        } else {
          this.$emit('click')
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .selected {
    opacity: 0.5;
  }
  .isAllowedMove {
    background: rgba(green, 0.5);
  }
  .isNotAllowedMove {
    background: rgba(red, 0.5);
  }
</style>