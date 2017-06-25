export = function equalsLoose(a: any, b: any): boolean {
    return a == b
        ? true
        : typeof a === 'string' && typeof b === 'string'
            ? a.toLowerCase() === b.toLowerCase()
            : false
}
