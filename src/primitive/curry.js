const _ = {} // placeholder

function concatArrayLike(array, arrayLike) {
    let i = 0
    return [...array.map((t) => (t === _ && i < arrayLike.length) ? arrayLike[i++] : t), ...[].slice.call(arrayLike, i)]
}

function subCurry(f, args) {
    return args.length < f.length || args.indexOf(_) !== -1
        ? function() {
            return subCurry(f, concatArrayLike(args, arguments))
        }
        : f.apply(this, args)
}

const curry = (f) => subCurry(f, [])

module.exports = {
    _, curry
}
