const typof = require('./typof.js')
module.exports = function map(f, target) {
    const type = typof(target)
    if (type === 'array') return target.map(f)
    else if (type === 'object')
        return Object.keys(target).reduce(function (pre, cur) {
            pre[cur] = f(target[cur], cur)
            return pre
        }, {})
    else return target
}
