function range (length, start) {
  start = start || 0
  return [...(new Array(length + start)).keys()].slice(start)
}

function random (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomValue (thing) {
  const values = Object.values(thing)
  return values[random(0, values.length - 1)]
}

export {
  range,
  random,
  randomValue
}
