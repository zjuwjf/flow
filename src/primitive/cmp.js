const equals = require('./equals.js')
module.exports = {
    gte: (a, b) => a >= b,
    gt: (a, b) => a > b,
    lte: (a, b) => a <= b,
    lt: (a, b) => a < b,
    equals
}
