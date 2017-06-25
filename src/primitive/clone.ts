import typof = require('./typof.js')

export = function clone(v) {
    if (Array.isArray(v)) {
        return v.map(clone)
    } else if (typof(v) === 'object') {
        const newV = {}
        for (const key in v) {
            if (v.hasOwnProperty(key)) {
                newV[key] = clone(v[key])
            }
        }
        return newV
    } else {
        return v
    }
}
