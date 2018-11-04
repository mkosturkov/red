<template>
  <div @click="$emit('click')" :class="['tile', tileClass]"></div>
</template>

<script>
  import RedGame from '@/game-logic/red-game'

  export default {
    name: 'Tile',
    props: ['value'],
    computed: {
      tileClass () {
        let style = false
        switch (this.value) {
          case RedGame.Tiles.NORMAL_1:
            style = 'blue'
            break

          case RedGame.Tiles.NORMAL_2:
            style = 'green'
            break

          case RedGame.Tiles.NORMAL_3:
            style = 'yellow'
            break

          case RedGame.Tiles.NORMAL_4:
            style = 'purple'
            break

          case RedGame.Tiles.NORMAL_5:
            style = 'navy'
            break

          case RedGame.Tiles.NORMAL_6:
            style = 'orange'
            break

          case RedGame.Tiles.PLAYER_DROPPED:
            style = 'red'
            break
        }
        return style
      }
    }
  }
</script>

<style lang="scss" scoped>
  @mixin visible-tile($class, $color) {
    &.#{$class}::before {
      visibility: visible;
      background: $color;
    }
  }

  .tile::before {
    $size: 70%;
    position: relative;
    top: (100% - $size) / 2;
    margin: auto;

    display: block;
    content: " ";
    width: $size;
    height: $size;
    border-radius: $size;

    box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.5);
    visibility: hidden;
  }

  $types: (red, blue, green, yellow, purple, navy, orange);
  @each $color in $types {
    @include visible-tile($color, $color)
  }
</style>