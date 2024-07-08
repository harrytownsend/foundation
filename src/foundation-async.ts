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

	public get locked(): boolean { return this._queue.length > 0 }
	public get queue(): number { return this._queue.length; }

	public async release(): Promise<void> {
		const current: fMutexWaiting = this._queue.shift()!;
		if(this.locked) {
			this._queue[0].resolve!();
		}
	}
}