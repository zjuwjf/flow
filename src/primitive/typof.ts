export = function typof(v: any): string {
    const s = Object.prototype.toString.call(v)
    return s.substring(8, s.length - 1).toLowerCase()
}
