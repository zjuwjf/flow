import typof = require('./typof.js')
export = function map(f, target) {
    const type = typof(target)
    if (type === 'array') {
        return target.map(f)
    } else if (type === 'object') {
        return Object.keys(target).reduce((pre, cur) => {
            pre[cur] = f(target[cur], cur)
            return pre
        }, {})
    } else {
        return target
    }
}
