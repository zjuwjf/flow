import identical = require('./identical')
import typof = require('./typof')

export = function equals(a, b): boolean {
    if (identical(a, b)) {
        return true
    }

    const typeA = typof(a)
    const typeB = typof(b)

    if (typeA !== typeB) { return false }
    if (a == null || b == null) { return false }

    switch (typeA) {
        case 'object':
            const aKeys = Object.keys(a)
            const bKeys = Object.keys(b)
            if (aKeys.length !== bKeys.length) { return false }
            for (const k in a) { if (!equals(a[k], b[k])) { return false } }
            return true
        case 'array':
            if (a.length !== b.length) { return false }
            for (const i in a) { if (!equals(a[i], b[i])) { return false } }
            return true
        default: return false
    }
}
