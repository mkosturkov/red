<template>
  <div class="red-game-holder">
    <div class="controls-holder">
      <div class="row">
        <button class="new-game-btn" @click="newGame">New Game</button>
        <button class="drop-tiles-btn" @click="dropTiles">Drop 'em</button>
      </div>
      <div class="row">
        <div class="srore-display">Score: {{ game.score }}</div>
        <div class="next-tiles-holder">
          <div
            v-for="(tile, idx) in game.nextTilesToDrop"
            :key="[idx, getTileStyle(tile)].join('-')"
            :class="['next-tile', getTileStyle(tile)]"
          ></div>
        </div>
      </div>
    </div>
    <div class="board-holder">
      <div
        v-for="position in game.board.getAllPositions()"
        :class="['position', getTileStyle(position.value), {selected: isSelected(position)}]"
        :key="getPositionKey(position)"
        @click="handleClick(position)"
      >
      </div>
    </div>

  </div>
</template>

<script>
import RedGame from '@/game-logic/red-game'

export default {
  name: 'RedGame',

  data () {
    return {
      game: new RedGame(),
      selected: null
    }
  },

  methods: {

    getPositionKey (position) {
      return [position.x, position.y, this.getTileStyle(position.value)].join('-')
    },

    getTileStyle (tile) {
      let style = false
      switch (tile) {
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
    },

    isSelected (position) {
      return this.selected === position
    },

    handleClick (position) {
      if (this.selected) {
        this.game.moveTile(this.selected, position)
        this.selected = null
      } else if (position.value) {
        this.selected = position
      } else {
        this.game.dropPlayerTile(position)
        this.selected = null
      }
    },

    dropTiles () {
      this.game.dropTiles()
    },

    newGame () {
      this.game = new RedGame()
    }
  }
}
</script>

<style lang="scss" scoped>

  $positions-count: 9;
  $board-size: 100vw;
  $board-max-size: 800px;

  @mixin visible-tile($class, $color) {
    &.#{$class}::before {
      visibility: visible;
      background: $color;
    }
  }

  @mixin tile() {
    &::before {
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
  }

  .controls-holder {

    font-family: sans-serif;
    font-size: 1.5em;

    .row {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .new-game-btn, .drop-tiles-btn {
      font-size: 1.2em;
      padding: 5px 20px;
    }

    .next-tiles-holder {
      display: flex;
      align-content: center;

      .label {
        line-height: 1.8em;
      }

      .next-tile {
        display: inline-block;
        width: calc(#{$board-size} / #{$positions-count} / 2);
        height: calc(#{$board-size} / #{$positions-count} / 2);
        max-width: calc(#{$board-max-size} / #{$positions-count} / 2);
        max-height: calc(#{$board-max-size} / #{$positions-count} / 2);
        margin-right: 10px
      }
    }
  }

  .board-holder {
    width: $board-size;
    height: $board-size;
    max-width: $board-max-size;
    max-height: $board-max-size;

    $border: 1px solid black;
    border-top: $border;
    border-left: $border;

    display: flex;
    flex-wrap: wrap;
  }

  .position {
    width: calc(100% / #{$positions-count});
    height: calc(100% / #{$positions-count});
    border-right: 1px solid black;
    border-bottom: 1px solid black;

    &.selected {
      opacity: 0.5;
    }

    @include tile();
  }

  .next-tile {
    position: relative;
    height: 100%;
    @include tile()
  }
</style>
