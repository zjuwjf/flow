import { Match } from './Match'
import pred = require('./pred')
import toString = require('./toString')

export class Matcher {
    private _match: Match
    private _cache
    private _defaultReturn

    constructor() {
        this._match = new Match()
        this._cache = undefined
        this._defaultReturn = this
    }

    public cacheEnabled() {
        this._cache = {}
        return this
    }

    public strategy(strategy: string) {
        this._match.strategy(strategy)
        return this
    }

    public case(cond, tap?) {
        this._match.case.apply(this._match, arguments)
        return this
    }

    public default(tap) {
        this.case(pred.T, tap)
        return this._defaultReturn
    }

    public setDefaultReturn(defaultReturn) {
        return this._defaultReturn = defaultReturn
    }

    public invoke(...args) {
        if (this._cache) {
            const key = toString(args)
            let cache = this._cache[key]
            if (!cache) {
                cache = [this._match.invoke.apply(this._match, args)]
                this._cache[key] = cache
            }
            return cache[0]
        } else {
            return this._match.invoke.apply(this._match, args)
        }
    }
}

export function matcher() {
    return new Matcher()
}
