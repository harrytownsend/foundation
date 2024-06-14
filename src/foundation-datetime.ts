class fDate extends Date {

	private _months: readonly string[] = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	];

	private _daysOfWeek: readonly string[] = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	];

	constructor(...args: ConstructorParameters<typeof Date>) {
		super(...args);
	}

	public clone(): fDate {
		return new fDate(this);
	}

	private _formatSegment(format: string): string {
		/*
			D    - The suffix appropriate to the date. (e.g. st, nd, rd, ...)
			H    - The hour in 24-hour time format. No leading zeroes.
			HH   - The hour in 24-hour time format. Includes leading zero if 1 digit.
			M    - The month. No leading zeroes.
			MM   - The month. Includes leading zero if 1 digit.
			MMM  - The month's short name. (e.g. Jan, Feb, Mar, ...)
			MMMM - The month's full name. (e.g. January, February, March, ...)
			P    - Shows whether the time is "AM" or "PM". (upper case)
			d    - The day. No leading zeroes.
			dd   - The day. Includes leading zero if 1 digit.
			f    - Tenths of a second.
			ff   - Hundredths of a second.
			fff  - Thousandths of a second.
			h    - The hour in 12-hour time format. No leading zeroes.
			hh   - The hour in 12 hour time format. Includes leading zero if 1 digit.
			m    - The minute. No leading zeroes.
			mm   - The minute. Includes leading zero if 1 digit.
			p    - Shows whether the time is "am" or "pm". (lower case)
			s    - The second. No leading zeroes.
			ss   - The second. Includes leading zero if 1 digit.
			y    - Last 1 digit of the year.
			yy   - Last 2 digits of the year.
			yyy  - Last 3 digits of the year.
			yyyy - The full year.
		*/

		let output: string = "";
		switch(format) {
			case "D":
				// Suffix depends on the last digit of the day of the month.
				const date: number = this.getDate();
				const lastDigit: number = date % 10;
				if(lastDigit == 1 && date != 11) {
					output = "st";
				} else if(lastDigit == 2 && date != 12) {
					output = "nd";
				} else if(lastDigit == 3 && date != 13) {
					output = "rd";
				} else {
					output = "th";
				}
				break;
			case "H":
				output = this.getHours().toString();
				break;
			case "HH":
				output = this.getHours().toString().padStart(2, "0");
				break;
			case "M":
				output = (this.getMonth() + 1).toString();
				break;
			case "MM":
				output = (this.getMonth() + 1).toString().padStart(2, "0");
				break;
			case "MMM":
				output = this._months[this.getMonth()].substring(0, 3);
				break;
			case "MMMM":
				output = this._months[this.getMonth()];
				break;
			case "P":
				output = (this.getHours() < 12) ? "AM" : "PM";
				break;
			case "d":
				output = (this.getDate()).toString();
				break;
			case "dd":
				output = (this.getDate()).toString().padStart(2, "0");
				break;
			case "ddd":
				output = this._daysOfWeek[this.getDay()].substring(0,3);
				break;
			case "dddd":
				output = this._daysOfWeek[this.getDay()];
				break;
			case "f":
				output = Math.floor(this.getMilliseconds() / 100).toString();
				break;
			case "ff":
				output = Math.floor(this.getMilliseconds() / 10).toString().padStart(2, "0");
				break;
			case "fff":
				output = this.getMilliseconds().toString().padStart(3, "0");
				break;
			case "h":
				output = (this.getHours() % 12).toString();
				break;
			case "hh":
				output = (this.getHours() % 12).toString().padStart(2, "0");
				break;
			case "m":
				output = this.getMinutes().toString();
				break;
			case "mm":
				output = this.getMinutes().toString().padStart(2, "0");
				break;
			case "p":
				output = (this.getHours() < 12) ? "am" : "pm";
				break;
			case "s":
				output = this.getSeconds().toString();
				break;
			case "ss":
				output = this.getSeconds().toString().padStart(2, "0");
				break;
			case "y":
				output = (this.getFullYear() % 10).toString();
				break;
			case "yy":
				output = (this.getFullYear() % 100).toString().padStart(2, "0");
				break;
			case "yyy":
				output = (this.getFullYear() % 1000).toString().padStart(3, "0");
				break;
			case "yyyy":
				output = this.getFullYear().toString().padStart(4, "0");
				break;
			default:
				throw "Unexpected format sequence (" + format + ").";
		}

		return output;
	}

	public format(format: string): string {
		const formatCharacters: string[] = ['D', 'H', 'M', 'd', 'f', 'h', 'm', 'p', 's', 'y'];
		const output: string[] = [];

		let i: number = 0;
		while(i < format.length) {
			let start: number = i;

			if(formatCharacters.indexOf(format[i]) >= 0) {
				while(i < format.length && format[i] == format[start]) {
					i++;
				}
				output.push(this._formatSegment(format.substring(start, i)));
			} else {
				while(i < format.length && formatCharacters.indexOf(format[i]) < 0) {
					i++;
				}
				output.push(format.substring(start, i));
			}
		}

		return output.join("");
	}
}