/**
 * 
 * @param {function} run a handler to run
 * @param {number} mills timeout in mills for setInterval
 * @return {Looper} The Looper
 */
function Looper(run, mills) {
    this._run = run
    this._mills = mills || 100
    this._id = undefined
    this._arguments = undefined
}

Looper.prototype.start = function () {
    this._arguments = [].slice.call(arguments, 0)
    this.restart()
}

Looper.prototype.restart = function () {
    if (!this._id) {
        this._id = setInterval(() => {
            this._run && this._run.apply(this, this._arguments)
        }, this._mills)
    }
}

Looper.prototype.stop = function () {
    if (this._id) {
        clearInterval(this._id)
        this._id = undefined
    }
}

Looper.prototype.isRunning = function () {
    return this._id ? true : false
}

module.exports = Looper
