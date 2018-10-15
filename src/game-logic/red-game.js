import SquareBoard from '@/game-logic/square-board'
import { random, randomValue, range } from '@/lib'

class RedGame {
  constructor () {
    this.board = new SquareBoard(9)
    this.minLineLength = 5
    this.tilesToDropCount = 3

    this.score = 0
    this.nextTilesToDrop = this.getTilesToDrop()
  }

  canDropTileOn (position) {
    return position.value === undefined
  }

  dropPlayerTile (position) {
    if (this.canDropTileOn(position)) {
      position.value = RedGame.Tiles.PLAYER_DROPPED
      if (!this.scoreAndClear(position)) {
        this.dropTiles()
      }
    }
  }

  canMoveTile (from, to) {
    const visited = []
    const reached = position => position === to
    const wasNotVisited = position => visited.indexOf(position) < 0
    const isNotBlocked = position => position.value === undefined
    const hasPath = position => {
      if (reached(position)) {
        return true
      }

      visited.push(position)
      const nonBlocked = position.neighbours.filter(isNotBlocked)
      for (let i = 0; i < nonBlocked.length; i++) {
        if (wasNotVisited(nonBlocked[i]) && hasPath(nonBlocked[i])) {
          return true
        }
      }
      return false
    }
    return !reached(from, to) && hasPath(from)
  }

  moveTile (from, to) {
    if (this.canMoveTile(from, to)) {
      to.value = from.value
      delete from.value
      if (!this.scoreAndClear(to)) {
        this.dropTiles()
      }
    }
  }

  dropTiles () {
    const emptyPositions = this.board.getAllPositions().filter(this.canDropTileOn)
    this.nextTilesToDrop.forEach(tile => {
      const idx = random(0, emptyPositions.length - 1)
      const position = emptyPositions.splice(idx, 1)[0]
      position.value = tile
      this.scoreAndClear(position)
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
    const tileScore = tile => tile === RedGame.Tiles.PLAYER_DROPPED ? 2 : 1
    return linesToScore.reduce((acc, line) => tileScore(line[0].value) * line.length + acc, previousScore)
  }

  scoreAndClear (position) {
    const linesToClear = this.getLinesForPosition(position)
    this.score = this.calculateScore(linesToClear, this.score)
    linesToClear.forEach(line => line.forEach(position => delete position.value))
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
  NORMAL_3: Symbol('normal-tile-3')
}

RedGame.getDropableTiles = () => {
  const dropable = Object.assign({}, RedGame.Tiles)
  delete dropable.PLAYER_DROPPED
  return Object.values(dropable)
}

export default RedGame
