import typof = require('./typof.js')
export = function filter(f: (v?: any, i?: any, o?: object) => any, target: any) {
    const type = typof(target)
    if (type === 'array') {
        return target.filter(f)
    } else if (type === 'object') {
        return Object.keys(target).reduce((pre, cur) => {
            if (f(target[cur], cur)) { pre[cur] = target[cur] }
            return pre
        }, {})
    } else {
        return target
    }
}
