export = function opt(left?, right?, cond?) {
    const length = arguments.length
    if (length === 0) {
        return opt
    } else if (length === 1) {
        return (target) => target ? target : left
    } else if (length === 2) {
        return (target) => target ? left : right
    } else {
        return cond ? left : right
    }
}
