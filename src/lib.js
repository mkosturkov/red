function range (length) {
  return [...(new Array(length)).keys()]
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
