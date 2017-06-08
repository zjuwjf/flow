//ECMA-262 message & name
function Exception(code, msg, data) {
    Error.call(this, msg || code)
    this.code = code
    this.msg = msg
    this.data = data
}

Object.keys(Error.prototype).filter((v) => v !== 'constructor').reduce((pre, cur) => {
    pre[cur] = Error.prototype[cur]
    return pre
}, Exception.prototype)

module.exports = function exception(code, msg, data) {
    return new Exception(code, msg, data)
}
