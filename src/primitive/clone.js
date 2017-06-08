const typof = require('./typof.js')

module.exports = function clone(v) {
    if (Array.isArray(v)) {
        return v.map((child) => clone(child))
    } else if (typof(v) === 'object') {
        const newV = {}
        for (let key in v) {
            newV[key] = clone(v[key])
        }
        return newV
    } else {
        return v
    }
}
