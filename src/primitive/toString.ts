import typof = require('./typof')
export = function toString(v: any): string {
    const type = typof(v)
    if (type === 'object' || type === 'array') {
        return JSON.stringify(v)
    } else {
        return String(v)
    }
}
