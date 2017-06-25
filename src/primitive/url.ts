import { Exception } from './Exception'
import typof = require('./typof.js')

export function stringify(rootObj, ifEncodeURI?) {
    const travel = (object, parentKey, pairs, travelStack) => {
        // fix circular reference
        if (travelStack.indexOf(object) !== -1) {
            return new Exception('CircularStructureError')
        }
        travelStack.push(object)

        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                const value = object[key]
                const type = typof(value)

                if (['number', 'string', 'boolean'].indexOf(type) !== -1) {
                    pairs.push(parentKey + key + '=' + value)
                } else if (value !== null && ['object', 'array'].indexOf(type) !== -1) {
                    travel(value, parentKey + key + '.', pairs, travelStack)
                } // ignore { function | undefined }
            }

        }
        return pairs
    }

    const type = typof(rootObj)
    if (type === 'string') {
        return rootObj
    } else if (['object', 'array'].indexOf(type) === -1) {
        return ''
    }

    const str = travel(rootObj, '', [], []).join('&')
    return ifEncodeURI ? encodeURI(str) : str
}

export function parse(url: string, ifDecodeURI?: boolean) {
    const createContainer = (key) => {
        const index = parseInt(key, 0)
        const isArray = (!isNaN(index) && key == index)
        return isArray ? [] : {}
    }

    let target
    const index = url.indexOf('?')
    const str = index === -1 ? url : url.substr(index + 1)
    const pairs = str.split('&')

    for (let i = 0; pairs && i < pairs.length; i++) {
        const kv = pairs[i].split('=')
        const k = ifDecodeURI ? decodeURI(kv[0]) : kv[0]
        const v = ifDecodeURI ? decodeURI(kv[1]) : kv[1]
        const ks = k.split('.') // keyStack: a.b.0 -> [ a, b, 0]
        target = target || createContainer(ks && ks.length > 0 && ks[0])

        for (let deep = 0, cur = target; ks && deep < ks.length; deep++) {
            const curKey = ks[deep]
            if (deep === ks.length - 1) {
                cur[curKey] = v
            } else {
                cur[curKey] = cur[curKey] || createContainer(ks[deep + 1])
                cur = cur[curKey]
            }
        }
    }

    return target
}

export function join(...args) {
    return args.map(stringify).join('&').replace(/[?|&]+/g, '&').replace('&', '?')
}
