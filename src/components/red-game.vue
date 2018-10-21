<template>
  <div class="red-game-holder">
    <div class="controls-holder">
      <button class="new-game-btn" @click="newGame">New Game</button>
      <div class="srore-display">Score: {{ game.score }}</div>
      <div class="next-tiles-holder">
        Next tiles:
        <span
          v-for="(tile, idx) in game.nextTilesToDrop"
          :key="[idx, getTileStyle(tile)].join('-')"
          :class="['next-tile', getTileStyle(tile)]"
        ></span>
      </div>
      <button class="drop-tiles-btn" @click="dropTiles">Drop 'em</button>
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

  .controls-holder {
    display: flex;
  }

  .board-holder {
    width: 100vw;
    height: 100vw;
    max-width: 800px;
    max-height: 800px;

    border-top: 1px solid black;
    border-left: 1px solid black;

    display: flex;
    flex-wrap: wrap;
  }

  .next-tiles-holder {
    width: 50%;

    .next-tile {
      display: inline-block;
      width: calc(100% / 5);
      height: 20px;
      margin-right: 10px
    }
  }

  .position {
    width: calc(100% / 9);
    height: calc(100% / 9);
    border-right: 1px solid black;
    border-bottom: 1px solid black;

    &.selected {
      opacity: 0.5;
    }
  }

  .position, .next-tile {
    &.red {
      background: red;
    }

    &.blue {
      background: blue;
    }

    &.green {
      background: green;
    }

    &.yellow {
      background: yellow;
    }
  }
</style>
