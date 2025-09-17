export function getType(val) {
  return Object.prototype.toString.call(val).slice(8, -1)
}

export function isFunction(val) {
  return getType(val) === 'Function'
}

export function isString(val) {
  return getType(val) === 'String'
}

export function isNumber(val) {
  return getType(val) === 'Number'
}
