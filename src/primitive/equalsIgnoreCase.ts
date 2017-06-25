import identical = require('./identical.js')
export = function equalsIgnoreCase(a, b): boolean {
    return typeof a === 'string' && typeof b === 'string'
        ? a.toLowerCase() === b.toLowerCase()
        : identical(a, b)
}
