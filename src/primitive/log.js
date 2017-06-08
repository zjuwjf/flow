const toString = require('./toString.js')

module.exports = function log() {
    const date = new Date()
    const time = date.toLocaleTimeString()
    const mills = date.getMilliseconds()
    const n = arguments.length
    const text = [].map.call(arguments, (v) => toString(v)).join('\t')
    console.log(`Logger${n} ${time} ${mills}: ${text}`)
}
