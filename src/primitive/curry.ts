const _ = {} // placeholder

function concatArrayLike(array, arrayLike): any[] {
    let i = 0
    return [...array.map((t) => (t === _ && i < arrayLike.length) ? arrayLike[i++] : t), ...[].slice.call(arrayLike, i)]
}

function subCurry(f: (...vs: any[]) => any, args: any[]) {
    return args.length < f.length || args.indexOf(_) !== -1
        // tslint:disable-next-line:only-arrow-functions
        ? function () {
            return subCurry(f, concatArrayLike(args, arguments))
        }
        : f.apply(this, args)
}

function curry(f: (...vs: any[]) => any) {
    return subCurry(f, [])
}

export = {
    _, curry,
}
