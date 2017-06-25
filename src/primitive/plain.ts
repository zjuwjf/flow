import typof = require('./typof')

export = function wrap(obj) {
    const type = typof(obj)
    if (type === 'array' || type === 'object') {
        const newObj = type === 'array' ? [] : {}
        for (const key in obj) {
            const value = obj[key]
            const wrapValue = wrap(value)
            if (typof(value) !== typof(wrapValue)) {
                Object.defineProperty(newObj, key, wrapValue)
            } else {
                newObj[key] = wrapValue
            }
        }
        return newObj
    } else if (type === 'function') {
        let _v = obj
        return {
            enumerable: false,
            configurable: false,
            get: () => _v,
            set: (newVal) => _v = newVal,
        }
    } else {
        return obj
    }
}
