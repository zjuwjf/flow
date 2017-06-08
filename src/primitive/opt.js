module.exports = function opt(left, right, cond) {
    if (arguments.length === 0) return opt
    else if (arguments.length === 1) return (target) => target ? target : left
    else if (arguments.length === 2) return (target) => target ? left : right
    else return cond ? left : right
}
