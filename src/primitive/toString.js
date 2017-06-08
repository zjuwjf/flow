const typof = require('./typof.js')
module.exports = function toString(v) {
    const type = typof(v)
    if (type === 'object' || type === 'array') return JSON.stringify(v)
    else return String(v)
}
