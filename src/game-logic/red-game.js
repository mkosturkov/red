import SquareBoard from '@/game-logic/square-board'
import { random, randomValue, range } from '@/lib'

class RedGame {
  constructor () {
    this.board = new SquareBoard(9)
    this.minLineLength = 5
    this.tilesToDropCount = 3

    this.score = 0
    this.nextTilesToDrop = this.getTilesToDrop()

    this.events = {
      onMoveMade (tile, path) {},
      onLinesCleared (lines) {},
      onTileDropped (position) {},
      onGameOver () {}
    }
  }

  get gameOver () {
    return this.emptyPositions.length === 0
  }

  get emptyPositions () {
    return this.board.getAllPositions().filter(this.canDropTileOn)
  }

  canDropTileOn (position) {
    return position.value === undefined
  }

  dropPlayerTile (position) {
    if (this.canDropTileOn(position)) {
      position.value = RedGame.Tiles.PLAYER_DROPPED
      this.events.onTileDropped(position)
      if (!this.scoreAndClear(position)) {
        this.dropTiles()
      }
    }
  }

  canMoveTile (from, to) {
    return !!this.getPath(from, to)
  }

  getPath (from, to) {
    const visited = []
    const path = []
    const reached = position => position === to
    const wasNotVisited = position => visited.indexOf(position) < 0
    const isNotBlocked = position => position.value === undefined
    const hasPath = position => {
      if (reached(position)) {
        path.push(position)
        return true
      }

      visited.push(position)
      const nonBlocked = position.neighbours.filter(isNotBlocked)
      for (let i = 0; i < nonBlocked.length; i++) {
        if (wasNotVisited(nonBlocked[i]) && hasPath(nonBlocked[i])) {
          path.push(position)
          return true
        }
      }
      return false
    }
    return !reached(from, to) && hasPath(from) && path.reverse()
  }

  moveTile (from, to) {
    const path = this.getPath(from, to)
    if (path) {
      this.events.onMoveMade(from.value, path)
      to.value = from.value
      delete from.value
      if (!this.scoreAndClear(to)) {
        this.dropTiles()
      }
    }
  }

  dropTiles () {
    this.nextTilesToDrop.every(tile => {
      if (this.gameOver) {
        this.events.onGameOver()
        return false
      }
      const emptyPositions = this.emptyPositions
      const idx = random(0, emptyPositions.length - 1)
      const position = emptyPositions.splice(idx, 1)[0]
      position.value = tile
      this.events.onTileDropped(position)
      this.scoreAndClear(position)
      if (this.gameOver) {
        this.events.onGameOver()
        return false
      }
      return true
    })
    this.nextTilesToDrop = this.getTilesToDrop()
  }

  getLinesForPosition (position) {
    const findTileLine = boardLine => {
      return boardLine.reduce(
        (acc, current) => {
          if (current.value === position.value) {
            return acc.concat([current])
          }
          if (acc.length < this.minLineLength) {
            return []
          }
          return acc
        },
        []
      )
    }
    return [
      findTileLine(position.tbDiagonal),
      findTileLine(position.btDiagonal),
      findTileLine(position.horizontal),
      findTileLine(position.vertical)
    ].filter(line => line.length >= this.minLineLength)
  }

  calculateScore (linesToScore, previousScore) {
    const tileScore = tile => tile === RedGame.Tiles.PLAYER_DROPPED ? 4 : 2
    return linesToScore.reduce((acc, line) => {
      const ts = tileScore(line[0].value)
      return acc +
        ts * line.length +
        ts * Math.max(0, line.length - this.minLineLength)
    }, previousScore)
  }

  scoreAndClear (position) {
    const linesToClear = this.getLinesForPosition(position)
    this.score = this.calculateScore(linesToClear, this.score)
    linesToClear.forEach(line => line.forEach(position => delete position.value))
    this.events.onLinesCleared(linesToClear)
    return linesToClear.length > 0
  }

  getTilesToDrop () {
    const dropable = RedGame.getDropableTiles()
    return range(this.tilesToDropCount).map(() => randomValue(dropable))
  }
}

RedGame.Tiles = {
  PLAYER_DROPPED: Symbol('player-dropped-tile'),
  NORMAL_1: Symbol('normal-tile-1'),
  NORMAL_2: Symbol('normal-tile-2'),
  NORMAL_3: Symbol('normal-tile-3'),
  NORMAL_4: Symbol('normal-tile-4'),
  NORMAL_5: Symbol('normal-tile-5'),
  NORMAL_6: Symbol('normal-tile-6')
}

RedGame.getDropableTiles = () => {
  return Object.values(RedGame.Tiles)
}

export default RedGame
