import typof = require('./typof.js')

export = function isType(type, v) {
    return typof(v) === type
}
