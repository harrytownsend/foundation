export enum fCookieSameSite {
	lax = "lax",
	strict = "strict",
	none = "none"
}

export interface CookieOptions {
	domain?: string,
	expires?: Date,
	maxAge?: number,
	partitioned?: boolean,
	path?: string,
	sameSite?: string,
	secure?: boolean
}

export class fCookie {

	public static reserved: readonly string[] = [
		"domain",
		"expires",
		"max-age",
		"paritioned",
		"path",
		"samesite",
		"secure"
	];

	private static _domain: string | null = null;
	private static _expires: Date | null = null;
	private static _maxAge: number | null = null;
	private static _partitioned: boolean = false;
	private static _path: string = "/";
	private static _sameSite: string | null = null;
	private static _secure: boolean = false;

	public static get domain(): string | null { return this._domain; }
	public static get expires(): Date | null { return this._expires; }
	public static get maxAge(): number | null { return this._maxAge; }
	public static get partitioned(): boolean { return this._partitioned; }
	public static get path(): string { return this._path; }
	public static get sameSite(): string | null { return this._sameSite; }
	public static get secure(): boolean { return this._secure; }

	public static get options(): CookieOptions {
		let options: CookieOptions = {};
		if(this.domain != null) {
			options.domain = this.domain;
		}
		if(this.expires != null) {
			options.expires = this.expires;
		}
		if(this.maxAge != null) {
			options.maxAge = this.maxAge;
		}
		if(this.partitioned != null) {
			options.partitioned = this.partitioned;
		}
		if(this.path != null) {
			options.path = this.path;
		}
		if(this.sameSite != null) {
			options.sameSite = this.sameSite;
		}
		if(this.secure != null) {
			options.secure = this.secure;
		}

		return options;
	}

	public static set domain(domain: string | null) { this._domain = domain; }
	public static set expires(expires: Date | null) { this._expires = expires; }
	public static set maxAge(maxAge: number | null) { this._maxAge = maxAge; }
	public static set partitioned(partitioned: boolean) { this._partitioned = partitioned; }
	public static set path(path: string) { this._path = path; }
	public static set sameSite(sameSite: string | null) {
		let sameSiteLower: string | null = sameSite;
		if(sameSiteLower != null) {
			sameSiteLower = sameSiteLower.toLowerCase();
			if(sameSiteLower != fCookieSameSite.lax && sameSiteLower != fCookieSameSite.none && sameSiteLower != fCookieSameSite.strict) {
				throw "Invalid 'sameSite' value (" + sameSite + "). Valid values are '" + fCookieSameSite.lax + "', '" + fCookieSameSite.none + "', '" + fCookieSameSite.strict + "'.";
			}
		}

		this._sameSite = sameSiteLower;
	}
	public static set secure(secure: boolean) { this._secure = secure; }

	public static set options(options: CookieOptions) {
		this._validateOptions(options);

		if(options.domain != undefined) {
			this.domain = options.domain;
		}
		if(options.expires != undefined) {
			this.expires = options.expires;
		}
		if(options.maxAge != undefined) {
			this.maxAge = options.maxAge;
		}
		if(options.partitioned != undefined) {
			this.partitioned = options.partitioned;
		}
		if(options.path != undefined) {
			this.path = options.path;
		}
		if(options.sameSite != undefined) {
			this.sameSite = options.sameSite;
		}
		if(options.secure != undefined) {
			this.secure = options.secure;
		}
	}

	public static count(): number {
		return this.getAll().size;
	}

	public static exists(name: string): boolean {
		return this.getAll().has(name);
	}

	public static get(name: string): string | null {
		const map: Map<string, string> = this.getAll();
		if(map.has(name)) {
			return map.get(name)!;
		} else {
			return null;
		}
	}

	public static getAll(): Map<string, string> {
		const map: Map<string, string> = new Map();
		
		const cookie: string = document.cookie;
		if(cookie.trim().length > 0) {
			cookie.split(";").forEach((pair: string) => {
				const parts: string[] = pair.split("=");
				let name: string = decodeURIComponent(parts[0].trim());
				let value: string = "";
				if(parts.length == 2) {
					value = decodeURIComponent(parts[1].trim());
				}

				map.set(name, value);
			});
		}

		return map;
	}

	private static _getHeader(options?: CookieOptions): string {
		if(options != undefined) {
			this._validateOptions(options);
		}

		let header: string = "";

		if(options != undefined && options.domain != undefined) {
			header += "; domain=" + encodeURIComponent(options.domain);
		} else if(this.domain != null) {
			header += "; domain=" + encodeURIComponent(this.domain);
		}

		if(options != undefined && options.expires != undefined) {
			header += "; expires=" + options.expires.toUTCString();
		} else if(this.expires != null) {
			header += "; expires=" + this.expires.toUTCString();
		}

		if(options != undefined && options.maxAge != undefined) {
			header += "; max-age=" + options.maxAge.toString();
		} else if(this.maxAge != null) {
			header += "; max-age=" + this.maxAge.toString();
		}

		if(options != undefined && options.partitioned != undefined) {
			if(options.partitioned) {
				header += "; partitioned";
			}
		} else if(this.partitioned) {
			header += "; partitioned";
		}

		if(options != undefined && options.path != undefined) {
			header += "; path=" + options.path;
		} else if(this.path != null) {
			header += "; path=" + this.path;
		}

		if(options != undefined && options.sameSite != undefined) {
			header += "; samesite=" + encodeURIComponent(options.sameSite);
		} else if(this.sameSite != null) {
			header += "; samesite=" + encodeURIComponent(this.sameSite);
		}

		if(options != undefined && options.secure != undefined) {
			if(options.secure) {
				header += "; secure";
			}
		} else if(this.secure) {
			header += "; secure";
		}

		return header;
	}

	public static remove(name: string): string | null {
		if(this.reserved.indexOf(name) >= 0) {
			throw "Cookie name '" + name + "' is reserved.";
		}

		const map: Map<string, string> = this.getAll();
		if(map.has(name)) {
			this.set(name, "", {
				expires: new Date("Thu, 01 Jan 1970 00:00:00 UTC"),
				maxAge: 0
			});
			return map.get(name)!;
		} else {
			return null;
		}
	}

	public static removeAll(): Map<string, string> {
		const map: Map<string, string> = this.getAll();
		map.forEach((value: string, name: string) => {
			this.remove(name);
		});

		return map;
	}

	public static set(name: string, value: string, options?: CookieOptions): void {
		if(this.reserved.indexOf(name) >= 0) {
			throw "Cookie name '" + name + "' is reserved.";
		}

		document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + this._getHeader(options);
	}

	public static setAll(map: Map<string, string>, options?: CookieOptions): void {
		map.forEach((value: string, name: string) => {
			this.set(name, value);
		});
	}

	private static _validateOptions(options: CookieOptions): void {
		if(options.domain != undefined && typeof options.domain != "string") {
			throw "The 'domain' attribute, if specified, must be a string.";
		}

		if(options.expires != undefined && !(options.expires instanceof Date)) {
			throw "The 'expires' attribute, if specified, must be a Date.";
		}

		if(options.maxAge != undefined && (typeof options.maxAge != "number" || options.maxAge < 0)) {
			throw "The 'maxAge' attribute, if specified, must be a positive number.";
		}

		if(options.partitioned != undefined && typeof options.partitioned != "boolean") {
			throw "The 'partitioned' attribute, if specified, must be boolean.";
		}

		if(options.path != undefined && typeof options.path != "string") {
			throw "The 'path' attribute, if specified, must be a string.";
		}

		if(options.sameSite != undefined && (typeof options.sameSite != "string" || !(options.sameSite == fCookieSameSite.lax || options.sameSite == fCookieSameSite.none || options.sameSite == fCookieSameSite.strict))) {
			throw "The 'sameSite' attribute, if specified, must be one of: '" + fCookieSameSite.lax + "', '" + fCookieSameSite.none + "', '" + fCookieSameSite.strict + "'.";
		}

		if(options.secure != undefined && typeof options.secure != "boolean") {
			throw "The 'secure' attribute, if specified, must be boolean.";
		}
	}
}