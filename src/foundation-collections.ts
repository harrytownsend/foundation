export class fList<T> {
	private _list: T[];

	constructor(list: T[] | fList<T>) {
		if(typeof list === "undefined") {
			this._list = [];
		} else if(list instanceof fList) {
			this._list = list.list;
		} else if(list instanceof Array) {
			this._list = [...list];
		} else {
			console.error("Unknown list type.", list);
			throw "Unknown list type ${typeof list} is not allowed.";
		}
	}

	public add(item: T, position: number = this.size()): void {
		if(position < 0 || position > this.size()) {
			throw "Insert location ($position) is out of range.";
		}

		this._list.splice(position, 0, item);
	}

	public addAll(itemList: T[] | fList<T>, position: number = this.size()): void {
		if(position < 0 || position > this.size()) {
			throw "Insert location ($position) is out of range.";
		}

		const list: T[] = (itemList instanceof fList) ? itemList.list : itemList;
		const head: T[] = this._list.slice(0, position);
		const shift: T[] = this._list.slice(position);

		head.splice(position, 0, ...list);
		head.splice(position + list.length, 0, ...shift);

		this._list = head;
	}

	public clone(): fList<T> {
		return new fList<T>(this.list);
	}

	public contains(item: T): boolean {
		return this._list.indexOf(item) >= 0;
	}

	public count(item: T): number {
		let count: number = 0;
		this._list.forEach((listItem: T) => {
			if(listItem == item) {
				count++;
			}
		});

		return count;
	}

	public empty(): void {
		this._list = [];
	}

	public get(position: number = 0): T {
		if(position < 0 || position > this.size()) {
			throw "Get location ($position) is out of range.";
		}

		return this._list[position];
	}

	public getAll(start: number = 0, end: number = this.size()) {
		if(start < 0 || start > this.size()) {
			throw "Start location ($start) is out of range.";
		}
		if(end < 0 || end > this.size()) {
			throw "End location ($end) is out of range.";
		}

		return this._list.slice(start, end);
	}

	public indexOf(item: T, start: number = 0): number {
		if(start < 0 || start > this.size()) {
			throw "Start location ($start) is out of range.";
		}

		return this._list.indexOf(item, start);
	}

	public lastIndexOf(item: T, start: number): number {
		if(start < 0 || start > this.size()) {
			throw "Start location ($start) is out of range.";
		}

		return this._list.lastIndexOf(item, start);
	}

	public get list(): T[] {
		return [...this._list];
	}

	public pop(): T {
		if(this.size() == 0) {
			throw "No items remaining to be popped.";
		}

		return this.removeAt(this.size() - 1);
	}

	public push(item: T): void {
		this.add(item);
	}

	public remove(item: T, all: boolean = false): number {
		let removed:number = 0;

		let position: number = 0;
		while((all || removed < 1) && (position = this.indexOf(item, position)) >= 0) {
			// Check for consecutive items to replace in order to potentially reduce the number of array manipulation operations.
			let count: number = 1;
			while(all && position + count < this.size() && this._list[position + count] == item) {
				count++;
			}

			this._list.splice(position, count);
			removed++;
		}

		return removed;
	}

	public removeAll(itemList: T[], all: boolean = false): number {
		let removed: number = 0;

		itemList.forEach((item: T) => {
			removed += this.remove(item, all);
		});

		return removed;
	}

	public removeAt(position: number): T {
		if(position < 0 || position > this.size()) {
			throw "Remove location ($position) is out of range.";
		}

		return this._list.splice(position, 1)[0];
	}

	public removeAllAt(start: number = 0, end: number = this.size()): T[] {
		if(start < 0 || start > this.size()) {
			throw "Start location ($start) is out of range.";
		}
		if(end < 0 || end > this.size()) {
			throw "End location ($end) is out of range.";
		}

		return this._list.splice(start, end - start);
	}

	public size(): number {
		return this._list.length;
	}

	public sort(fnCompare: (item1: T, item2: T) => number): void {
		this._list.sort(fnCompare);
	}
}