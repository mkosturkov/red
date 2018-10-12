import { range } from '@/lib'

class Position {
  constructor (x, y, board) {
    this.x = x
    this.y = y
    this.board = board
  }

  get tbDiagonal () {
    const diag = []
    let { x, y } = this
    while (--x >= 0 && --y >= 0) {
      diag.unshift(this.board.getPosition(x, y))
    }
    diag.push(this)
    x = this.x
    y = this.y
    while (++x < this.board.sideSize && ++y < this.board.sideSize) {
      diag.push(this.board.getPosition(x, y))
    }
    return diag
  }

  get btDiagonal () {
    const diag = []
    let { x, y } = this
    while (--x >= 0 && ++y < this.board.sideSize) {
      diag.unshift(this.board.getPosition(x, y))
    }
    diag.push(this)
    x = this.x
    y = this.y
    while (++x < this.board.sideSize && --y >= 0) {
      diag.push(this.board.getPosition(x, y))
    }
    return diag
  }

  get horizontal () {
    return range(this.board.sideSize).map(x => this.board.getPosition(x, this.y))
  }

  get vertical () {
    return range(this.board.sideSize).map(y => this.board.getPosition(this.x, y))
  }

  get neighbours () {
    const offsets = [-1, 0, 1]
    const makeOffsetCouple = idx => [offsets[idx % offsets.length], offsets[Math.floor(idx / offsets.length)]]
    const makeCoords = ([offsetX, offsetY]) => [this.x + offsetX, this.y + offsetY]
    const isNotSelf = ([x, y]) => this.x !== x || this.y !== y
    const isInbound = ([x, y]) => x >= 0 && y >= 0 && x < this.board.sideSize && y < this.board.sideSize
    return range(9)
      .map(makeOffsetCouple)
      .map(makeCoords)
      .filter(isInbound)
      .filter(isNotSelf)
      .map(coords => this.board.getPosition(...coords))
  }
}

class SquareBoard {
  constructor (sideSize) {
    this.sideSize = sideSize
    this.positions = range(Math.pow(sideSize, 2))
      .map(idx => new Position(idx % sideSize, Math.floor(idx / sideSize), this))
  }

  getPosition (x, y) {
    return this.positions[y * this.sideSize + x]
  }

  getAllPositions () {
    return Array.from(this.positions)
  }
}

export default SquareBoard
