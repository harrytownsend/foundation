enum DateFormatSegmentType {
	Format,
	Literal
}

interface DateFormatSegmentMap {
	[key: string]: DateFormatSegment
}

interface DateFormatSegment {
	type: DateFormatSegmentType
	isExplicit?: boolean,
	isNumeric?: boolean,
	text: string
}

interface DateInfo {
	year: number,
	month: number,
	date: number,
	hours: number,
	isHour24: boolean,
	isHourAM: boolean,
	minutes: number,
	seconds: number,
	milliseconds: number
}

class fDate extends Date {

	private static _months: readonly string[] = [
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

	private static _daysOfWeek: readonly string[] = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	];

	private static _formatCharacters: readonly string[] = ['D', 'H', 'M', 'd', 'f', 'h', 'm', 'p', 's', 'y'];
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

	private static _dateFormatSegmentMap: DateFormatSegmentMap = {
		"D":    { type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: false, text: "D"	},
		"H":    { type: DateFormatSegmentType.Format, isExplicit: false, isNumeric: true , text: "H"	},
		"HH":   { type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: true , text: "HH"	},
		"M":	{ type: DateFormatSegmentType.Format, isExplicit: false, isNumeric: true , text: "M"	},
		"MM":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: true , text: "MM"	},
		"MMM":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: false, text: "MMM"	},
		"MMMM":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: false, text: "MMMM"	},
		"P":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: false, text: "P"	},
		"d":	{ type: DateFormatSegmentType.Format, isExplicit: false, isNumeric: true , text: "d"	},
		"dd":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: true , text: "dd"	},
		"f":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: true , text: "f"	},
		"ff":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: true , text: "ff"	},
		"fff":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: true , text: "fff"	},
		"h":	{ type: DateFormatSegmentType.Format, isExplicit: false, isNumeric: true , text: "h"	},
		"hh":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: true , text: "hh"	},
		"m":	{ type: DateFormatSegmentType.Format, isExplicit: false, isNumeric: true , text: "m"	},
		"mm":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: true , text: "mm"	},
		"p":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: false, text: "p"	},
		"s":	{ type: DateFormatSegmentType.Format, isExplicit: false, isNumeric: true , text: "s"	},
		"ss":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: true , text: "ss"	},
		"y":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: true , text: "y"	},
		"yy":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: true , text: "yy"	},
		"yyy":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: true , text: "yyy"	},
		"yyyy":	{ type: DateFormatSegmentType.Format, isExplicit: true , isNumeric: true , text: "yyyy"	},
	};

	constructor(...args: ConstructorParameters<typeof Date>) {
		super(...args);
	}

	public addDays(days: number): fDate {
		this.setDate(this.getDate() + days);
		return this;
	}

	public addHours(hours: number): fDate {
		this.setHours(this.getHours() + hours);
		return this;
	}

	public addMilliseconds(milliseconds: number): fDate {
		this.setMilliseconds(this.getMilliseconds() + milliseconds);
		return this;
	}

	public addMinutes(minutes: number): fDate {
		this.setMinutes(this.getMinutes() + minutes);
		return this;
	}

	public addMonths(months: number): fDate {
		this.setMonth(this.getMonth() + months);
		return this;
	}

	public addSeconds(seconds: number): fDate {
		this.setSeconds(this.getSeconds() + seconds);
		return this;
	}

	public addYears(years: number): fDate {
		this.setFullYear(this.getFullYear() + years);
		return this;
	}

	public clone(): fDate {
		return new fDate(this);
	}

	public format(format: string): string {
		const output: string[] = [];

		let i: number = 0;
		while(i < format.length) {
			let start: number = i;

			if(fDate._formatCharacters.indexOf(format[i]) >= 0) {
				while(i < format.length && format[i] == format[start]) {
					i++;
				}
				output.push(this._formatSegment(format.substring(start, i)));
			} else {
				while(i < format.length && fDate._formatCharacters.indexOf(format[i]) < 0) {
					i++;
				}
				output.push(format.substring(start, i));
			}
		}

		return output.join("");
	}

	private _formatSegment(format: string): string {
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
				output = fDate._months[this.getMonth()].substring(0, 3);
				break;
			case "MMMM":
				output = fDate._months[this.getMonth()];
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
				output = fDate._daysOfWeek[this.getDay()].substring(0,3);
				break;
			case "dddd":
				output = fDate._daysOfWeek[this.getDay()];
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

	private static _isDigit(char: string): boolean {
		return char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 57;
	};

	public static parseString(date: string, format: string): fDate {
		const dateInfo: DateInfo = {
			year: 1970,
			month: 0,
			date: 1,
			hours: 0,
			isHour24: true,
			isHourAM: true,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		};
		let formatPosition: number = 0;
		let datePosition: number = 0;

		let lastSegment: DateFormatSegment | null = null;
		while(formatPosition < format.length && datePosition < date.length) {
			const formatStart: number = formatPosition;
			if(fDate._formatCharacters.indexOf(format[formatPosition]) >= 0) {
				while(formatPosition < format.length && format[formatPosition] == format[formatStart]) {
					formatPosition++;
				}

				// Check if the date format sequence is valid.
				const formatSegment: string = format.substring(formatStart, formatPosition);
				if(!(formatSegment in this._dateFormatSegmentMap)) {
					throw "Unrecognised date format sequence (" + formatSegment + ").";
				}

				// Ensure there aren't ambiguous date format segments next to each other.
				// - Don't allow a number after a number of unknown length.
				const currentSegment: DateFormatSegment = this._dateFormatSegmentMap[formatSegment];
				if(lastSegment != null) {
					lastSegment = lastSegment!;
					if(lastSegment.type == DateFormatSegmentType.Format && !lastSegment.isExplicit && lastSegment.isNumeric && currentSegment.isNumeric) {
						throw "A date format cannot have format symbols (" + lastSegment.text + ") and (" + currentSegment.text + ") next to each other due to ambiguity.";
					}
				}

				// Decode the segment.
				let dateText: string;
				switch(formatSegment) {
					case "D":
						datePosition += 2;
						break;
					case "H":
					case "HH":
						dateText = fDate._parseSegmentNumber(date, datePosition, formatSegment.length, 2);
						dateInfo.isHour24 = true;
						dateInfo.hours = parseInt(dateText);
						datePosition += dateText.length;
						break;
					case "M":
					case "MM":
						dateText = fDate._parseSegmentNumber(date, datePosition, formatSegment.length, 2);
						dateInfo.month = parseInt(dateText) - 1;
						datePosition += dateText.length;
						break;
					case "MMM":
						dateInfo.month = fDate._parseSegmentMonth(date, datePosition, true);
						datePosition += 3;
						break;
					case "MMMM":
						dateInfo.month = fDate._parseSegmentMonth(date, datePosition, false);
						datePosition += fDate._months[dateInfo.month].length;
						break;
					case "P":
						datePosition += 2;
						break;
					case "d":
					case "dd":
						dateText = fDate._parseSegmentNumber(date, datePosition, formatSegment.length, 2);
						dateInfo.date = parseInt(dateText);
						datePosition += dateText.length;
						break;
					case "f":
					case "ff":
					case "fff":
						dateText = fDate._parseSegmentNumber(date, datePosition, formatSegment.length, formatSegment.length);
						dateInfo.milliseconds = parseInt(dateText.padEnd(3, "0"));
						datePosition += formatSegment.length;
						break;
					case "h":
					case "hh":
						dateText = fDate._parseSegmentNumber(date, datePosition, formatSegment.length, 2);
						dateInfo.isHour24 = false;
						dateInfo.hours = parseInt(dateText);
						datePosition += dateText.length;
						break;
					case "m":
					case "mm":
						dateText = fDate._parseSegmentNumber(date, datePosition, formatSegment.length, 2);
						dateInfo.minutes = parseInt(dateText);
						datePosition += dateText.length;
						break;
					case "p":
						datePosition += 2;
						break;
					case "s":
					case "ss":
						dateText = fDate._parseSegmentNumber(date, datePosition, formatSegment.length, 2);
						dateInfo.seconds = parseInt(dateText);
						datePosition += dateText.length;
						break;
					case "y":
					case "yy":
					case "yyy":
					case "yyyy":
						dateText = fDate._parseSegmentNumber(date, datePosition, formatSegment.length, formatSegment.length);
						dateInfo.year = fDate._parseYear(dateText);
						datePosition += formatSegment.length;
						break;
					default:
						throw "Unrecognised date format symbol (" + formatSegment + ").";
						break;
				}

				lastSegment = currentSegment;
			} else {
				const dateStart: number = datePosition;
				let formatChar: string;
				while(formatPosition < format.length && this._formatCharacters.indexOf(formatChar = format[formatPosition]) < 0) {
					if(formatChar != date[datePosition] && formatChar != "#") {
						throw "Character (" + formatChar + ") at position " + formatPosition.toString() + " in the format string did not match character (" + date[datePosition] + ") at position " + datePosition.toString() + " in the date string.";
					}

					formatPosition++;
					datePosition++;
				}

				// Ensure there aren't ambiguous date format segments next to each other.
				// - Don't allow a number after a number of unknown length.
				if(lastSegment != null) {
					lastSegment = lastSegment!;
					if(lastSegment.type == DateFormatSegmentType.Format && !lastSegment.isExplicit && lastSegment.isNumeric && this._isDigit(format[formatPosition - 1])) {
						throw "A date format cannot have literal digits immediately after format symbol (" + lastSegment.text + ").";
					}
				}

				lastSegment = {
					type: DateFormatSegmentType.Literal,
					text: date.substring(dateStart, datePosition)
				}
			}
		}

		const output: fDate = new fDate(new Date());
		output.setFullYear(dateInfo.year);
		output.setMonth(dateInfo.month);
		output.setDate(dateInfo.date);
		if(dateInfo.isHour24) {
			output.setHours(dateInfo.hours);
		} else {
			output.setHours((dateInfo.isHourAM) ? dateInfo.hours : dateInfo.hours + 12);
		}
		output.setMinutes(dateInfo.minutes);
		output.setSeconds(dateInfo.seconds);
		output.setMilliseconds(dateInfo.milliseconds);

		return output;
	}

	private static _parseSegmentMonth(text: string, start: number, short: boolean): number {
		for(let i: number = 0; i < 12; i++) {
			let name: string = ((short) ? this._months[i].substring(0, 3) : this._months[i]).toLowerCase();
			if(start + name.length < text.length && name == text.substring(start, start + name.length).toLowerCase()) {
				return i;
			}
		}

		throw "Unable identify a month at location (" + start + ") in the date string.";
	}

	private static _parseSegmentNumber(text: string, start: number, min: number, max: number): string {
		let count: number = 0;
		while(count < max && fDate._isDigit(text[start + count])) {
			count++;
		}

		if(count < min) {
			throw "Expected between " + min + " and " + max + " digits but found " + count + " at position " + start + " in the date string.";
		}

		return text.substring(start, start + count);
	}

	private static _parseYear(year: string): number {
		return parseInt((new Date()).getFullYear().toString().substring(0, 4 - year.length) + year);
	}
}