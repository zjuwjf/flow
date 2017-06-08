const cast = require('./cast.js')
const exception = require('./exception.js')
const pred = require('./pred.js')

function Match() {
    this._values = arguments.length > 0
        ? [].slice.call(arguments, 0).map(cast.toValue)
        : undefined
    this._cases = []
    this._strategy = 'strict'
}

/**
 * @param {strict|loose} strategy strategy
 * @return {Match} this
 */
Match.prototype.strategy = function(strategy) {
    this._strategy = strategy
    return this
}

Match.prototype.case = function (condition, action) {
    const conditionF = cast.toPred(condition, this._strategy)
    const actionF = arguments.length <= 1 ? undefined : cast.toFunction(action)
    this._cases.push([conditionF, actionF])
    return this
}

Match.prototype.default = function (action) {
    this.case(pred.T, action)
    return this.invoke()
}

Match.prototype.invoke = function () {
    const args = this._values || arguments

    let matched = false
    for (let i = 0; i < this._cases.length; i++) {
        const aCase = this._cases[i]
        if (matched || aCase[0].apply(this, args)) {
            matched = true
            if (aCase[1]) {
                return aCase[1].apply(this, args)
            }
        }
    }

    throw exception('NoMatchError')
}

module.exports = function match() {
    return new Match(...[].slice.call(arguments, 0))
}
