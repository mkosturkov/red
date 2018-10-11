import RedGame from '@/game-logic/red-game'
import { range } from '@/lib'

describe('RedGame', () => {
  let game
  beforeEach(() => {
    game = new RedGame()
  })

  it('should have initial score of zero', () => {
    expect(game.score).toBe(0)
  })

  function shouldHavePreparedTilesToDrop () {
    expect(game.nextTilesToDrop).toHaveLength(game.tilesToDropCount)
    game.nextTilesToDrop.forEach(tile => {
      expect(RedGame.getDropableTiles()).toContain(tile)
    })
  }
  it('should have prepared tiles to drop', shouldHavePreparedTilesToDrop)

  it('should report correctly if position is available for drop', () => {
    const position = game.board.getPosition(5, 5)
    expect(game.canDropTileOn(position)).toBe(true)

    position.value = RedGame.Tiles.NORMAL_1
    expect(game.canDropTileOn(position)).toBe(false)
  })

  it('should drop player tile only if position is available', () => {
    const position = game.board.getPosition(5, 5)
    const takenPosition = game.board.getPosition(6, 6)
    takenPosition.value = RedGame.Tiles.NORMAL_1
    game.dropPlayerTile(position)
    game.dropPlayerTile(takenPosition)

    expect(position.value).toBe(RedGame.Tiles.PLAYER_DROPPED)
    expect(takenPosition.value).toBe(RedGame.Tiles.NORMAL_1)
  })

  it('should clear lines after player drop', () => {
    makeLineWithPlayerDrop()
    range(game.minLineLength).forEach(idx => {
      expect(game.board.getPosition(0, idx).value).toBe(undefined)
    })
  })

  it('should update the score after player drop', () => {
    makeLineWithPlayerDrop()
    expect(game.score).toBe(10)
  })

  it('should drop prepared tiles and prepare new ones', () => {
    const preparedTiles = game.nextTilesToDrop

    game.dropTiles()
    const droppedTiles = game.board.getAllPositions()
      .filter(position => position.value !== undefined)
      .map(position => position.value)

    const countTiles = (tiles) => {
      return tiles.reduce((acc, tile) => {
        if (acc[tile] === undefined) {
          acc[tile] = 1
        } else {
          acc[tile]++
        }
        return acc
      }, {})
    }
    expect(countTiles(droppedTiles)).toEqual(countTiles(preparedTiles))
    shouldHavePreparedTilesToDrop()
  })

  it('should drop tiles only on free spots', () => {
    const testTileToDrop = Symbol('test-tile-to-drop')
    const tileToFill = Symbol('test-tile-to-fill')
    const tilesToDrop = [testTileToDrop, testTileToDrop, testTileToDrop]

    game.nextTilesToDrop = tilesToDrop
    const allPositions = game.board.getAllPositions()
    allPositions.slice(tilesToDrop.length).forEach(position => {
      position.value = tileToFill
    })
    game.dropTiles()
    const dropped = allPositions
      .slice(0, tilesToDrop.length)
      .map(position => position.value)

    expect(dropped).toEqual(tilesToDrop)
  })

  it('should drop tiles after player drop', () => {
    const preparedTilesCount = game.nextTilesToDrop.length
    game.dropPlayerTile(game.board.getPosition(6, 6))
    const filledPositionsCounts = game.board.getAllPositions()
      .filter(position => position.value !== undefined)
      .length
    expect(filledPositionsCounts).toBe(preparedTilesCount + 1)
  })

  function makeLineWithPlayerDrop () {
    const positions = range(game.minLineLength - 1).map(idx => game.board.getPosition(0, idx))
    positions.forEach(position => {
      position.value = RedGame.Tiles.PLAYER_DROPPED
    })
    positions.push(game.board.getPosition(0, game.minLineLength - 1))
    game.dropPlayerTile(positions[game.minLineLength - 1])
  }
})
