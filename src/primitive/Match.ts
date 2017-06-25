import cast = require('./cast')
import { Exception } from './Exception'
import pred = require('./pred')

export class Match {
    private _values
    private _cases
    private _strategy: string

    constructor(...args) {
        this._values = arguments.length > 0
            ? [].slice.call(arguments, 0).map(cast.toValue)
            : undefined
        this._cases = []
        this._strategy = 'strict'
    }

    /***
    * @param {strict|loose} strategy strategy
    * @return {Match} this
    */
    public strategy(strategy: string): Match {
        this._strategy = strategy
        return this
    }

    public case(condition, action) {
        const conditionF = cast.toPred(condition, this._strategy)
        const actionF = arguments.length <= 1 ? undefined : cast.toFunction(action)
        this._cases.push([conditionF, actionF])
        return this
    }

    public default(action) {
        this.case(pred.T, action)
        return this.invoke()
    }

    public invoke() {
        const args = this._values || arguments
        let matched = false
        for (const aCase of this._cases) {
            if (matched || aCase[0].apply(this, args)) {
                matched = true
                if (aCase[1]) {
                    return aCase[1].apply(this, args)
                }
            }
        }

        throw new Exception('NoMatchError')
    }
}

export function match(...args) {
    return new Match(...args)
}
