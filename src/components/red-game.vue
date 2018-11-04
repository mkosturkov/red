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
          <Tile
            v-for="(tile, idx) in game.nextTilesToDrop"
            :value="tile"
            :key="[idx, tile.toString()].join('-')"
            :class="['next-tile']"
          ></Tile>
        </div>
      </div>
    </div>
    <div class="board-holder">
      <Position
        v-for="position in game.board.getAllPositions()"
        :position="position"
        :selectedPosition="selected"
        :game="game"
        :key="getPositionKey(position)"
        @click="handleClick(position)"
        class="position"
      >
      </Position>
    </div>

  </div>
</template>

<script>
import RedGame from '@/game-logic/red-game'
import Tile from './tile.vue'
import Position from './position.vue'

export default {
  name: 'RedGame',
  components: { Tile, Position },

  data () {
    return {
      game: new RedGame(),
      selected: null
    }
  },

  methods: {

    getPositionKey (position) {
      return [
        position.x,
        position.y,
        position.value ? position.value.toString() : ''
      ].join('-')
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
  }

  .next-tile {
    position: relative;
    height: 100%;
  }
</style>
