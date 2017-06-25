export class Looper {
    private _run: (...vs: any[]) => any
    private _mills: number
    private _id: number = undefined
    private _arguments: any[] = undefined

    constructor(run, mills) {
        this._run = run
        this._mills = mills
    }

    public start(): void {
        this._arguments = [].slice.call(arguments, 0)
        this.restart()
    }

    public restart(): void {
        if (!this._id) {
            this._id = setInterval(() => {
                if (this._run) {
                    this._run.apply(this, this._arguments)
                }
            }, this._mills)
        }
    }

    public stop(): void {
        if (this._id) {
            clearInterval(this._id)
            this._id = undefined
        }
    }

    public isRunning(): boolean {
        return !!this._id
    }
}
