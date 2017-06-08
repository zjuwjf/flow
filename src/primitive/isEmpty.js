const typof = require('./typof.js')

module.exports = function isEmpty(v) {
    if (v === null || v === undefined) return true
    const type = typof(v)
    return type === 'object'
        ? Object.keys(v).length === 0
        : type === 'array' || type === 'string'
            ? v.length === 0
            : false
}
