interface fMutexWaiting {
	resolve?: Function,
	reject?: Function,
	promise?: Promise<void>
}

export class fMutex {
	private _queue: fMutexWaiting[] = [];

	public async acquire(timeout: number = -1): Promise<Function | null> {
		let success;

		const waiting: fMutexWaiting = {};
		waiting.promise = new Promise((resolve, reject) => {
			waiting.resolve = resolve;
			waiting.reject = reject;
			this._queue.push(waiting);
		}).then(
			() => {
				success = true;
			},
			() => {
				success = false;

				const i = this._queue.indexOf(waiting);
				if(i >= 0) {
					this._queue.splice(i, 1);
				}
			}
		);

		if(this.queue == 1) {
			this._queue[0].resolve!();
		} else {
			if(timeout > 0) {
				setTimeout(() => {
					waiting.reject!();
				}, timeout);
			}
		}

		await waiting.promise;
		if(success) {
			return () => {
				this.release();
			};
		} else {
			return null;
		}
	}

	public async acquireWith(success: Function | null, failure: Function | null, timeout: number =-1): Promise<void> {
		const mutex: Function | null = await this.acquire(timeout);

		if(mutex) {
			if(typeof success == "function") {
				await success();
			}
			mutex();
		} else {
			if(typeof failure == "function") {
				await failure();
			}
		}
	}

	public get locked(): boolean { return this._queue.length > 0 }
	public get queue(): number { return this._queue.length; }

	public async release(): Promise<void> {
		const current: fMutexWaiting = this._queue.shift()!;
		if(this.locked) {
			this._queue[0].resolve!();
		}
	}
}

export class fInterval {
	private _active: boolean = false;
	private _locked: boolean = false;
	private _lastTick: Date = new Date();

	private _callback: Function;
	private _interval: number;
	private _remaining: number = 0;
	private _serial: boolean;
	private _spaced: boolean;

	constructor(callback: Function, interval: number, serial: boolean = true, spaced: boolean = true) {
		this._callback = callback;
		this._interval = interval;
		this._serial = serial;
		this._spaced = spaced;
	}

	public get active(): boolean { return this._active; }
	public get callback(): Function { return this._callback; }
	public get interval(): number { return this._interval; }
	public get locked(): boolean { return this._locked; }
	public get lastTick(): Date { return new Date(this._lastTick); }
	public get remaining(): number { return this._remaining; }
	public get serial(): boolean { return this._serial; }
	public get spaced(): boolean { return this._spaced; }

	public start(count: number = 0): fInterval {
		this._active = true;
		this._remaining = count;

		if(!this._locked) {
			this._tick();
		}

		return this;
	}

	public stop(): void {
		this._active = false;
	}

	private async _tick(): Promise<void> {
		this._locked = true;

		while(this._active) {
			this._lastTick = new Date();

			if(this._serial) {
				await this._callback();
			} else {
				(async () => {
					this.callback();
				})();
			}

			// If we are running for a specific number of times, reduce the count by 1. If we reach 0, stop.
			if(this._remaining > 0) {
				this._remaining--;
				if(this._remaining == 0) {
					this._active = false;
				}
			}
			
			if(this._active) {
				if(this._spaced) {
					await this._sleep(this._interval);
				} else {
					const millis = (new Date()).getTime() - this._lastTick.getTime();
					if(millis < this._interval) {
						await this._sleep(this._interval - millis);
					}
				}
			}
		}

		this._locked = false;
	}

	private async _sleep(millis: number): Promise<void> {
		await new Promise((resolve: Function, reject: Function) => {
			setTimeout(() => { resolve(); }, millis);
		});
	}
}