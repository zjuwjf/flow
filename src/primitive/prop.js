module.exports = function prop(key, target) {
    key = String(key)
    return key === '_'
            ? target
            : key.split('.').reduce((pre, cur) => pre && pre[cur], target)
}
