const typof = require('./typof.js')

module.exports = function wrap(obj) {
    const type = typof(obj)
    if (type === 'array' || type === 'object') {
        const newObj = type === 'array' ? [] : {}
        for (let key in obj) {
            const value = obj[key]
            const wrapValue = wrap(value) 
            if(typof(value) !== typof(wrapValue)) {
                Object.defineProperty(newObj, key, wrapValue)
            } else {
                newObj[key] = wrapValue
            }
        }
        return newObj
    } else if (type === 'function') {
        var _v = obj
        return { 
            enumerable: false,
            configurable: false, 
            get: function () {
                return _v
            },
            set: function (newVal) {
                _v = newVal
            }
        }
    } else {
        return obj
    }
}
