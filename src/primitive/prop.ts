export = function prop(key: any, target: object): any {
    key = String(key)
    return key === '_'
        ? target
        : key.split('.').reduce((pre, cur) => pre && pre[cur], target)
}
