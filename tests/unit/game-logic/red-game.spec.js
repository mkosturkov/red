import RedGame from '@/game-logic/red-game'
import { range } from '@/lib'

describe('RedGame', () => {
  const leftRightDiagonal = idx => [idx, idx]

  const rightLeftDiagonal = idx => [idx, game.board.sideSize - idx - 1]

  const horizontal = idx => [idx, 4]

  const vertical = idx => [4, idx]

  const drawLine = (type, start, length, tile) => {
    tile = tile || RedGame.Tiles.PLAYER_DROPPED
    return range(length, start).map(idx => {
      const position = game.board.getPosition(...type(idx))
      position.value = tile
      return position
    })
  }

  const fill = (type, length) => {
    game.board.getAllPositions().slice(0, length).forEach(p => {
      p.value = type
    })
  }

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
    const makeLine = (tile, length) => {
      tile = tile || game.getDropableTiles()[0]
      length = length || game.minLineLength
      return range(length).fill({ value: tile })
    }

    it('should know points for values', () => {
      RedGame.getDropableTiles().forEach(tile => {
        expect(game.calculateScore([[{ value: tile }]], 0)).toBe(2)
      })
      expect(game.calculateScore([[{ value: RedGame.Tiles.PLAYER_DROPPED }]], 0)).toBe(4)
    })

    it('should sum score in lines', () => {
      const lines = Object.values(RedGame.getDropableTiles())
        .map(tile => makeLine(tile))
        .concat([makeLine(RedGame.Tiles.PLAYER_DROPPED)])
      expect(game.calculateScore(lines, 0)).toBe(80)
    })

    it('should add to previous score', () => {
      expect(game.calculateScore([[{ value: RedGame.Tiles.PLAYER_DROPPED }]], 1)).toBe(5)
    })

    it('should add the points above the minimum twice', () => {
      const lines = [makeLine(RedGame.Tiles.NORMAL_1, game.minLineLength + 3)]
      expect(game.calculateScore(lines, 0)).toBe(22)
    })
  })

  describe('Tiles moving', () => {
    let from, to
    beforeEach(() => {
      from = game.board.getPosition(0, 0)
      to = game.board.getPosition(8, 8)
    })

    it('should report allowed move when not blocked', () => {
      expect(game.canMoveTile(from, to)).toBe(true)
    })

    it('should report forbidden move when blocked horizontally', () => {
      drawLine(horizontal, 0, game.board.sideSize)
      expect(game.canMoveTile(from, to)).toBe(false)
    })

    it('should report forbidden move when blocked vertically', () => {
      drawLine(vertical, 0, game.board.sideSize)
      expect(game.canMoveTile(from, to)).toBe(false)
    })

    it('should report forbidden move when moving to same spot', () => {
      const position = game.board.getPosition(0, 0)
      expect(game.canMoveTile(position, position)).toBe(false)
    })

    it('should report forbidden move when blocked diagonally', () => {
      drawLine(rightLeftDiagonal, 0, game.board.sideSize)
      expect(game.canMoveTile(from, to)).toBe(false)
    })

    it('should move when allowed', () => {
      from.value = RedGame.Tiles.NORMAL_1
      game.moveTile(from, to)
      expect(from.value).toBe(undefined)
      expect(to.value).toBe(RedGame.Tiles.NORMAL_1)
    })

    it('should not move when not allowed', () => {
      from.value = RedGame.Tiles.NORMAL_1
      drawLine(horizontal, 0, game.board.sideSize)
      game.moveTile(from, to)
      expect(from.value).toBe(RedGame.Tiles.NORMAL_1)
      expect(to.value).toBe(undefined)
    })
  })

  describe('Game play', () => {
    const getFilledPositions = () => game.board.getAllPositions().filter(p => p.value !== undefined)
    const getFromTo = () => {
      const from = game.board.getPosition(0, 0)
      const to = game.board.getPosition(4, 4)
      from.value = RedGame.Tiles.NORMAL_1
      return [from, to]
    }

    it('should drop tiles after player drop and not add score', () => {
      game.dropPlayerTile(game.board.getPosition(1, 1))
      expect(getFilledPositions()).toHaveLength(game.tilesToDropCount + 1)
      expect(game.score).toBe(0)
    })

    it('should clear lines after player drop and update score', () => {
      drawLine(horizontal, 0, game.minLineLength - 1)
      game.dropPlayerTile(game.board.getPosition(4, 4))
      expect(getFilledPositions()).toHaveLength(0)
      expect(game.score).toBe(20)
    })

    it('should drop tiles after tile move and not add score', () => {
      game.moveTile(...getFromTo())
      expect(getFilledPositions()).toHaveLength(game.tilesToDropCount + 1)
      expect(game.score).toBe(0)
    })

    it('should clear lines after tile move and update score', () => {
      drawLine(horizontal, 0, game.minLineLength - 1, RedGame.Tiles.NORMAL_1)
      game.moveTile(...getFromTo())
      expect(getFilledPositions()).toHaveLength(0)
      expect(game.score).toBe(10)
    })

    it('should score and clear for each of the dropped tiles', () => {
      game.scoreAndClear = jest.fn(game.scoreAndClear)
      game.dropTiles()
      expect(game.scoreAndClear).toHaveBeenCalledTimes(game.tilesToDropCount)
    })

    it('should initialize with no game over', () => {
      expect(game.gameOver).toBe(false)
    })

    it('should end game when tries to drop, but no more positions are available', () => {
      const tileToFill = Symbol('tile-to-fill')
      fill(tileToFill, game.board.getAllPositions().length)
      game.dropTiles()
      expect(game.gameOver).toBe(true)
    })

    it('should end game when player can not make a move', () => {
      const tileToFill = Symbol('tile-to-fill')
      fill(tileToFill, game.board.getAllPositions().length - game.tilesToDropCount)
      game.dropTiles()
      expect(game.gameOver).toBe(true)
    })
  })

  describe('Observable events', () => {
    it('should fire tile move event with route', () => {
      let steps, tile
      game.events.onMoveMade = (movedTile, madeSteps) => {
        tile = movedTile
        steps = madeSteps
      }

      const from = game.board.getPosition(0, 0)
      const to = game.board.getPosition(3, 3)

      game.dropPlayerTile(from)
      game.moveTile(from, to)

      expect(tile).toBe(RedGame.Tiles.PLAYER_DROPPED)
      expect(steps.length).toBeGreaterThan(0)
      steps.forEach(step => {
        expect(step.x).not.toBe(undefined)
        expect(step.y).not.toBe(undefined)
      })
    })

    it('should fire lines clear event with the lines', () => {
      let clearedLines
      game.events.onLinesCleared = jest.fn(lines => {
        clearedLines = lines
      })

      drawLine(horizontal, 0, game.minLineLength - 1, RedGame.Tiles.PLAYER_DROPPED)
      game.dropPlayerTile(game.board.getPosition(4, 4))

      expect(clearedLines).toHaveLength(1)
      expect(clearedLines[0]).toHaveLength(game.minLineLength)
      clearedLines[0].forEach((p, idx) => {
        expect(p.x).toBe(idx)
        expect(p.y).toBe(4)
      })
    })

    it('should fire tile drop events', () => {
      const positions = []
      game.events.onTileDropped = position => {
        positions.push(position)
      }
      const dropPosition = game.board.getPosition(0, 0)
      game.dropPlayerTile(dropPosition)

      expect(positions).toHaveLength(game.tilesToDropCount + 1)
      expect(positions[0]).toBe(dropPosition)
    })

    it('should fire game over event on player drop', () => {
      game.events.onGameOver = jest.fn()
      fill(RedGame.Tiles.NORMAL_1, game.board.getAllPositions().length - 1)
      game.dropPlayerTile(game.board.getPosition(8, 8))
      expect(game.events.onGameOver).toHaveBeenCalledTimes(1)
    })

    it('should fire game over event on computer drop', () => {
      game.events.onGameOver = jest.fn()
      fill(Symbol('test-type'), game.board.getAllPositions().length - game.tilesToDropCount - 1)
      game.dropPlayerTile(game.board.getPosition(8, 8))
      expect(game.events.onGameOver).toHaveBeenCalledTimes(1)
    })
  })
})
