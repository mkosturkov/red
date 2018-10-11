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
      const linesToClear = this.getLinesToClear()
      this.updateScore(linesToClear)
      this.clearLines(linesToClear)
      this.dropTiles()
    }
  }

  clearLines (lines) {
    lines.forEach(line => line.forEach(position => delete position.value))
  }

  dropTiles () {
    const emptyPositions = this.board.getAllPositions().filter(this.canDropTileOn)
    this.nextTilesToDrop.forEach(tile => {
      const idx = random(0, emptyPositions.length - 1)
      const position = emptyPositions.splice(idx, 1)[0]
      position.value = tile
    })
    this.nextTilesToDrop = this.getTilesToDrop()
  }

  getLinesToClear () {
    return [range(5).map(idx => this.board.getPosition(0, idx))]
  }

  updateScore (linesToScore) {
    this.score += linesToScore.reduce((acc, line) => acc + line.length * 2, 0)
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
