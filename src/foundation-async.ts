interface fMutexWaiting {
	resolve?: Function,
	reject?: Function,
	promise?: Promise<void>,
	complete: boolean
}

export class fMutex {
	private _queue: fMutexWaiting[] = [];

	public async acquire(timeout: number = -1): Promise<Function | null> {
		let success;

		const waiting: fMutexWaiting = {
			complete: false
		};
		waiting.promise = new Promise((resolve, reject) => {
			waiting.resolve = resolve;
			waiting.reject = reject;
			this._queue.push(waiting);
		}).then(
			() => { success = true; },
			() => { success = false; }
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
			waiting.complete = true;
			return null;
		}
	}

	public get locked() { return this._queue.length > 0 }
	public get queue() { return this._queue.length; }

	public async release(): Promise<void> {
		const current: fMutexWaiting = this._queue.shift()!;

		while(this.locked) {
			const next: fMutexWaiting = this._queue[0];
			if(next.complete) {
				this._queue.shift();
			} else {
				next.resolve!();
				return;
			}
		}
	}
}