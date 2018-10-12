import { range } from '@/lib'
import SquareBoard from '@/game-logic/square-board'

describe('SquareBoard', () => {
  const sideSize = 9

  let board
  beforeEach(() => {
    board = new SquareBoard(sideSize)
  })

  it('should copy the positions with getAllPositions()', () => {
    expect(board.positions).not.toBe(board.getAllPositions())
    expect(board.positions).toEqual(board.getAllPositions())
  })

  it('should return correct positions', () => {
    forAllCoords((x, y) => {
      const position = board.getPosition(x, y)
      expect(position.x).toBe(x)
      expect(position.y).toBe(y)
    })
  })

  it('should return the same positions every time', () => {
    forAllCoords((x, y) => {
      const p1 = board.getPosition(x, y)
      const p2 = board.getPosition(x, y)
      expect(p1).toBe(p2)
    })
  })

  it('should have positions aware of their top-left-down-right diagonal', () => {
    const diag = board.getPosition(3, 3).tbDiagonal
    expect(diag.length).toBe(sideSize)
    diag.forEach((position, idx) => {
      expect(position.x).toBe(idx)
      expect(position.y).toBe(idx)
    })
  })

  it('should have positions aware of their bottom-left-top-right diagonal', () => {
    const diag = board.getPosition(7, 1).btDiagonal
    expect(diag.length).toBe(sideSize)
    diag.forEach((position, idx) => {
      expect(position.x).toBe(idx)
      expect(position.y).toBe(sideSize - idx - 1)
    })
  })

  it('should have positions aware of their horizontal', () => {
    const horizontal = board.getPosition(2, 5).horizontal
    expect(horizontal.length).toBe(sideSize)
    range(sideSize).forEach((idx) => {
      expect(horizontal[idx].x).toBe(idx)
      expect(horizontal[idx].y).toBe(5)
    })
  })

  it('should have positions aware of their vertical', () => {
    const vertical = board.getPosition(5, 2).vertical
    expect(vertical.length).toBe(sideSize)
    range(sideSize).forEach((idx) => {
      expect(vertical[idx].x).toBe(5)
      expect(vertical[idx].y).toBe(idx)
    })
  })

  it('should have positions aware of their neighbours', () => {
    const inner = board.getPosition(4, 4).neighbours.map(({ x, y }) => [x, y])
    const expectedInner = [[3, 3], [4, 3], [5, 3], [3, 4], [5, 4], [3, 5], [4, 5], [5, 5]]
    expect(inner).toEqual(expectedInner)

    const outer = board.getPosition(0, 0).neighbours.map(({ x, y }) => [x, y])
    const expectedOuter = [[1, 0], [0, 1], [1, 1]]
    expect(outer).toEqual(expectedOuter)
  })

  function forAllCoords (cb) {
    range(sideSize).forEach(x => range(sideSize).forEach(y => cb(x, y)))
  }
})
