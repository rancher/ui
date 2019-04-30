function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

function isArrayOrObject(val) {
  return Object(val) === val
}

function isEmptyObject(val) {
  return Object.keys(val).length === 0
}

function shouldRecurse(obj, key) {
  if (  isArrayOrObject(obj[key]) &&
        ( ( isObject(obj[key]) && !isEmptyObject(obj[key]) ) ||
          ( Array.isArray(obj[key]) && obj[key].length !== 0) ))  {
    return true;
  }

  return false;
}

export default function flatMap(obj, tgt, path, wasArray) {
  tgt = tgt || {}
  path = path || []
  Object.keys(obj).forEach((key) => {
    if (shouldRecurse(obj, key)) {
      if ( Array.isArray(obj[key]) && (obj[key].length !== 0) ) {
        return flatMap(obj[key], tgt, path.concat(key), true)
      } else {
        return flatMap(obj[key], tgt, path.concat((wasArray ? `[${ key }]` : key)))
      }
    } else {
      tgt[path.concat((wasArray ? `[${ key }]` : key)).join('.').replace( /\.\[/g, '[')] = obj[key]
    }
  })

  return tgt
}
