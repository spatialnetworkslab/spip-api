export function isEmptyObject (obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

// helper function for knex to select fields 'as' different fieldname
export function selectAs (input, output) {
  return input + ' as ' + output
}

export function flatten (arr) {
  return Array.prototype.concat(...arr)
}
