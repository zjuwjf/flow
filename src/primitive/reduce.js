const typof = require('./typof.js')
module.exports = function reduce(f, init, target) {
    const type = typof(target)
    if (type === 'array') return target.reduce(f, init)
    else if (type === 'object')
        return Object.keys(target).reduce(function (pre, cur) {
            return f(pre, target[cur], cur)
        }, init)
    else return target
}
