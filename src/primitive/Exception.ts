// ECMA-262 message & name
// Error is uninheritable on IOS.
export class Exception  {
    constructor(public code: string, public msg?: string, public data?: any) {
        // super()
    }
}

export function exception(code: string, msg?: string, data?: any) {
    return new Exception(code, msg, data)
}
