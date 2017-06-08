const typof = require('./typof.js')
module.exports = function filter(f, target) {
    const type = typof(target)
    if (type === 'array') return target.filter(f)
    else if (type === 'object')
        return Object.keys(target).reduce(function (pre, cur) {
            if (f(target[cur], cur)) pre[cur] = target[cur]
            return pre
        }, {})
    else return target
}
