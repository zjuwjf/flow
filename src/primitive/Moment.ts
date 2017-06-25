export class Moment {
    private _ts: Date
    constructor() {
        this._ts = new Date()
    }

    public mark() {
        const now = new Date()
        const mills = now.getTime() - this._ts.getTime()
        this._ts = now
        return mills
    }
}
