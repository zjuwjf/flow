function Moment() {
    this._ts = new Date()
}

Moment.prototype.mark = function () {
    const now = new Date()
    const mills = now.getTime() - this._ts.getTime()
    this._ts = now
    return mills
}

module.exports = Moment
