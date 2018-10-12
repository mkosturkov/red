import RedGame from '@/game-logic/red-game'
import { range } from '@/lib'

describe('RedGame', () => {
  let game
  beforeEach(() => {
    game = new RedGame()
  })

  describe('Tiles dropping', () => {
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
  })

  describe('Finding lines', () => {
    const positionId = position => [position.x, position.y].join('-')

    const center = () => Math.floor(game.board.sideSize / 2)

    const centerPosition = () => game.board.getPosition(center(), center())

    const leftRightDiagonal = idx => [idx, idx]

    const rightLeftDiagonal = idx => [idx, game.board.sideSize - idx - 1]

    const horizontal = idx => [idx, 4]

    const vertical = idx => [4, idx]

    const drawLine = (type, start, length) => {
      return range(length, start).map(idx => {
        const position = game.board.getPosition(...type(idx))
        position.value = RedGame.Tiles.PLAYER_DROPPED
        return position
      })
    }

    const drawStar = length => {
      const start = center() - Math.floor(length / 2)
      return [
        drawLine(leftRightDiagonal, start, length),
        drawLine(rightLeftDiagonal, start, length),
        drawLine(horizontal, start, length),
        drawLine(vertical, start, length)
      ]
    }

    it('should find all the lines a tile is in', () => {
      const expectedLines = drawStar(game.minLineLength).map(line => line.map(p => positionId(p)))
      const actualLines = game.getLinesForPosition(centerPosition()).map(line => line.map(p => positionId(p)))
      expect(actualLines).toEqual(expectedLines)
    })

    it('should not find lines shorter than the minimum', () => {
      drawStar(game.minLineLength - 1)
      const lines = game.getLinesForPosition(centerPosition())
      expect(lines).toHaveLength(0)
    })

    it('should consider spaces between incomplete lines', () => {
      drawLine(horizontal, 0, 3)
      drawLine(horizontal, 5, 3)
      const position = game.board.getPosition(7, 4)
      const lines = game.getLinesForPosition(position)
      expect(lines).toHaveLength(0)
    })
  })

  describe('Calculating score', () => {
    it('should know points for values', () => {
      RedGame.getDropableTiles().forEach(tile => {
        expect(game.calculateScore([[tile]], 0)).toBe(1)
      })
      expect(game.calculateScore([[RedGame.Tiles.PLAYER_DROPPED]], 0)).toBe(2)
    })

    it('should sum score in lines', () => {
      const lines = Object.values(RedGame.getDropableTiles())
        .map(tile => range(3).fill(tile))
        .concat([range(3).fill(RedGame.Tiles.PLAYER_DROPPED)])
      expect(game.calculateScore(lines, 0)).toBe(15)
    })

    it('should add to previos score', () => {
      expect(game.calculateScore([[RedGame.Tiles.PLAYER_DROPPED]], 1)).toBe(3)
    })
  })
})
