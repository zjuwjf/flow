import toString = require('./toString')

export = function log(...args) {
    const date = new Date()
    const time = date.toLocaleTimeString()
    const mills = date.getMilliseconds()
    const n = args.length
    const text = [].map.call(args, toString).join('\t')
    console.log(`Logger${n} ${time} ${mills}: ${text}`)
}
