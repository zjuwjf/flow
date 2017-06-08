const match = require('./match.js')
const pred = require('./pred.js')
const toString = require('./toString.js')

function Matcher() {
    this.match = match()
    this.cache = undefined
    this.defaultReturn = this
}

Matcher.prototype.cacheEnabled = function () {
    this.cache = {}
    return this
}

Matcher.prototype.strategy = function (strategy) {
    this.match.strategy(strategy)
    return this
}

Matcher.prototype.case = function () {
    this.match.case.apply(this.match, arguments)
    return this
}

Matcher.prototype.default = function (tap) {
    this.case(pred.T, tap)
    return this.defaultReturn
}

Matcher.prototype.setDefaultReturn = function (defaultReturn) {
    return this.defaultReturn = defaultReturn
}

Matcher.prototype.invoke = function () {
    if (this.cache) {
        const key = toString(arguments)
        let cache = this.cache[key]
        if (!cache) {
            cache = [this.match.invoke.apply(this.match, arguments)]
            this.cache[key] = cache
        }
        return cache[0]
    } else {
        return this.match.invoke.apply(this.match, arguments)
    }
}

module.exports = function matcher(strategy) {
    return new Matcher().strategy(strategy)
}
