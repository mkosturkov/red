<template>
  <div class="red-game-holder">
    <div class="controls-holder">
      <button class="new-game-btn" @click="newGame">New Game</button>
      <div class="srore-display">Score: {{ score }}</div>
      <div class="next-tiles-holder"></div>
      <button class="drop-tiles-btn" @click="dropTiles">Drop 'em</button>
    </div>
    <div class="board-holder">
      <div
        v-for="position in positions"
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

  let game = new RedGame()

  export default {
    name: 'RedGame',

    data () {
      return this.update({})
    },

    methods: {
      update (target) {
        target = target || this
        target.score = game.score
        target.positions = game.board.getAllPositions()
        target.selected = false
        return target
      },

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
          game.moveTile(this.selected, position)
          this.update()
        } else if (position.value) {
          this.selected = position
        } else {
          game.dropPlayerTile(position)
          this.update()
        }
      },

      dropTiles () {
        game.dropTiles()
        this.update()
      },

      newGame () {
        game = new RedGame()
        this.update()
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

  .position {
    width: calc(100% / 9);
    height: calc(100% / 9);
    border-right: 1px solid black;
    border-bottom: 1px solid black;

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

    &.selected {
      opacity: 0.5;
    }
  }
</style>