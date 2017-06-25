import typof = require('./typof.js')
export = function reduce(f, init, target) {
    const type = typof(target)
    if (type === 'array') {
        return target.reduce(f, init)
    } else if (type === 'object') {
        return Object.keys(target).reduce((pre, cur) => f(pre, target[cur], cur), init)
    } else {
        return target
    }
}
