/**
 * The format is similar with C#'s format to use.
 *
 * @param {string} fmt , 格式化模板
 * @param {*} arg , 格式化参数
 *
 * 格式化模板里形如{keys:method,param}，会被替换。
 * (1) keys:
 *      keys 有如下的几种形式：
 *          (a) _代表arg 自身.
 *          (b) 0,1,2... 代表数组的index, 如 {1} => arg[1]
 *          (c) key代表键值.如{a} => arg[a]
 *          (d) keys 代表一个键值组，如{key1.key2.key3} => arg[key1][key2][key3]
 *
 * (2) method & param
 *      方法和参数， 方法和参数都是可选项。
 *      支持的方法：
 *          (a) C 代表对数字进行千分位转化。参数表示保留几位小数， 默认为2.
 *          (b) N 代表对数字的转化。参数形如 ##.##, 00.00等. #表示可缺省数字，0表示如果没有数字用0补位。
 *          (c) D 代表对日期的转化。参数形如 yyyy-MM-dd hh：mm：ss
 *          (d) F 代表对数字的转化。参数表示保留几位小数， 默认为2.
 *          (e) P 代表对数字百分位转化。参数表示保留几位小数， 默认为2.
 *
 */
import { Matcher } from './Matcher'
import prop = require('./prop')

const DefaultPoints = 2

const opt = (v, def) => {
    return v === undefined
        ? def
        : v
}

const comma = (v, fractionDigits: number) =>
    `${(Number(v).toFixed(opt(fractionDigits, DefaultPoints)))}`.replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,')

const toFixed = (v, fractionDigits: number) =>
    Number(v).toFixed(opt(fractionDigits, DefaultPoints))

const percent = (v, fractionDigits: number) =>
    `${(Number(v) * 100).toFixed(opt(fractionDigits, DefaultPoints))}%`

const repeat = (s: string, n: number) => new Array(n + 1).join(s)

const decimal = (v, fmt) => {
    const reg1 = /(#*)(0*)\.?(0*)(#*)/
    reg1.test(fmt)

    // const f1 = RegExp.$1.length
    const f2 = RegExp.$2.length
    const f3 = RegExp.$3.length
    const f4 = RegExp.$4.length

    const reg2 = /(-?)(\d*)(\.?)(\d*)/
    const text = String(Number(v).toFixed(f3 + f4))
    reg2.test(text)

    const t2 = RegExp.$2.length
    const t3 = RegExp.$3.length
    const t4 = RegExp.$4.length

    const integers = repeat('0', Math.max(f2 - t2, 0)) + RegExp.$2
    const decimals = RegExp.$4 + (t3 === 0 ? '' : repeat('0', Math.max(f3 - t4, 0)))

    for (let i = decimals.length - 1; i >= f3; i--) {
        if (decimals.charAt(i) !== '0') {
            return RegExp.$1 + integers + RegExp.$3 + decimals.substring(0, i + 1)
        }
    }

    return f3
        ? RegExp.$1 + integers + RegExp.$3 + decimals.substring(0, f3)
        : RegExp.$1 + integers
}

const dateFormat = (v, fmt) => {
    const date = new Date(v)
    const o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        'S': date.getMilliseconds(),
    }

    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length))
    }

    for (const k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : (`00${o[k]}`).substr((`${o[k]}`).length))
        }
    }

    return fmt
}

const tenThousandsFormat = (v, fractionDigits) => {
    const n = Number(v)
    return n >= 10000 && n % 10000 === 0
        ? `${comma(n / 10000, 0)}万`
        : comma(v, opt(fractionDigits, DefaultPoints))
}

const formatMatcher = new Matcher().strategy('loose')
    .case('C', () => comma) // 千分位(逗号)+保留几位小数
    .case('N', () => decimal) // 00.00,  ##.##
    .case('F', () => toFixed) // 保留几位小数
    .case('P', () => percent) // 百分比+保留几位小数
    .case('D', () => dateFormat) // 日期格式化
    .case('W', () => tenThousandsFormat) // 万
    .default((v) => { throw new Error(`UnsupportedFormat, ${v} is not supported in format.`) })

const evalBracket = (bracket: string, arg: any): string => {
    const meet = bracket.substring(1, bracket.length - 1)
    const colonIndex = meet.indexOf(':')
    if (colonIndex === -1) { return prop(meet, arg) }

    const key = meet.substring(0, colonIndex)
    const remain = meet.substring(colonIndex + 1)
    const commaIndex = remain.indexOf(',')
    const methodName = commaIndex !== -1 ? (remain.substring(0, commaIndex)).trim() : remain
    const param = commaIndex !== -1 ? remain.substring(commaIndex + 1) : undefined

    return formatMatcher.invoke(methodName)(prop(key, arg), param)
}

export = function format(formatString: string, arg: any) {
    const array = formatString.match(/\{[^{}]*\}/g)
    return Array.isArray(array)
        ? array.reduce((pre, cur) => pre.replace(cur, evalBracket(cur, arg)), formatString)
        : formatString
}
