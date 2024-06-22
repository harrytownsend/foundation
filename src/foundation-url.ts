export class fURL {

	private _directory: string[] = [];
	private _domain: string[] = [];
	private _file: string | null = null;
	private _port: number | null = null;
	private _protocol: string | null = null;
	private _query: Map<string, string | null> = new Map<string, string | null>();

	public get directory(): string[] { return this._directory; }
	public get domain(): string[] { return this._domain; }
	public get file(): string | null { return this._file; }
	public get port(): number | null { return this._port; }
	public get protocol(): string | null { return this._protocol; }
	public get query(): Map<string, string | null> { return this._query; }

	public get url(): string {
		return this._buildURL();
	}

	public set directory(directory: string[]) { this._directory = directory; }
	public set domain(domain: string[]) { this._domain = domain; }
	public set file(file: string | null) { this._file = file; }
	public set port(port: number | null) { this._port = port; }
	public set protocol(protocol: string | null) { this._protocol = protocol; }
	public set query(query: Map<string, string | null>) { this._query = query; }

	public set url(url: string) {
		this._parseURL(url);
	}

	constructor(url: string | null = null) {
		if(url != null) {
			this._parseURL(url);
		}
	}

	public clear(): void {
		this.directory = [];
		this.domain = [];
		this.file = null;
		this.port = null;
		this.protocol = null;
		this.query = new Map<string, string | null>();
	}

	private _buildURL(): string {
		if(!this.isValid()) {
			throw "Unable to build a URL as one or more values were either not specified or were invalid.";
		}

		const segments: string[] = [];

		if(this.protocol != null) {
			segments.push(this.protocol + "://");
		}

		if(this.domain.length > 0) {
			segments.push(this.domain.join("."));
		}

		if(this.port != null) {
			segments.push(":" + this.port.toString());
		}

		if(this.directory.length > 0) {
			this.directory.forEach((value: string) => {
				segments.push("/" + encodeURIComponent(value));
			});
		}

		if(this.file != null) {
			segments.push("/" + encodeURIComponent(this.file));
		}

		if(this._query.size > 0) {
			segments.push("?");

			const querySegments: string[] = [];
			this.query.forEach((value: string | null, name: string) => {
				if(value != null) {
					querySegments.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
				} else {
					querySegments.push(encodeURIComponent(name));
				}
			});

			segments.push(querySegments.join("&"));
		}

		return segments.join("");
	}

	public isValid(): boolean {
		try {
			if(
				   (this.protocol == null || !fURL.isValidProtocolName(this.protocol))
				|| (this.domain.length == 0 || !fURL.isValidDomainPath(this.domain))
				|| (this.port != null && !fURL.isValidPortNumber(this.port))
				|| (this.directory.length != 0 && !fURL.isValidFilePath(this.directory))
				|| (this.file != null && !fURL.isValidFileName(this.file))
			) {
				return false;
			} else {
				return true;
			}
		} catch(e) {
			return false;
		}
	}

	public static isValidProtocolName(protocol: string): boolean {
		if(typeof protocol != "string" || protocol.length == 0) {
			return false;
		}

		return fURL.isValidStringContent(protocol, false, true, true, ['+', '.', '-']);	
	}

	public static isValidDomainName(domain: string): boolean {
		if(typeof domain != "string" || domain.length == 0) {
			return false;
		}

		return fURL.isValidStringContent(domain, false, true, false, ['-']);
	}

	public static isValidDomainPath(domainPath: string | string[]): boolean {
		const pathSegments: string[] = (typeof domainPath == "string") ? domainPath.split('.') : domainPath;
		for(let i: number = 0; i < pathSegments.length; i++) {
			if(!fURL.isValidDomainName(pathSegments[i])) {
				return false;
			}
		}

		return true;
	}

	public static isValidPortNumber(port: number): boolean {
		if(typeof port != "number") {
			return false;
		}

		return port > 0 && port <= 65535;
	}

	public static isValidFileName(file: string): boolean {
		if(typeof file != "string" || file.length == 0) {
			return false;
		}

		return fURL.isValidStringContent(file, true, true, true, ['.', '_', '-']);
	}

	public static isValidFilePath(filePath: string | string[]): boolean {
		const pathSegments: string[] = (typeof filePath == "string") ? filePath.split('/') : filePath;
		for(let i: number = 0; i < pathSegments.length; i++) {
			if(!fURL.isValidFileName(pathSegments[i])) {
				return false;
			}
		}

		return true;
	}

	private static isValidStringContent(input: string, allowAlphaUpper: boolean, allowAlphaLower: boolean, allowNum: boolean, allowChars: string[]): boolean {
		for(let i: number = 0; i < input.length; i++) {
			const char = input.charAt(i);
			const charCode = input.charCodeAt(i);
			if(!(
				   (allowAlphaUpper && charCode >= 65 && charCode <= 90)
				|| (allowAlphaLower && charCode >= 97 && charCode <= 122)
				|| (allowNum && charCode >= 48 && charCode <= 57)
				|| allowChars.indexOf(char) >= 0
			)) {
				return false;
			}
		}

		return true;
	}

	private _parseURL(url: string): void {
		this.clear();

		let endOfProtocol: number;
		let startOfDomain: number;
		let endOfDomain: number
		let startOfPort: number;
		let endOfPort: number;
		let startOfDirectory: number;
		let endOfFile: number;
		let startOfQuery: number;

		endOfProtocol = url.indexOf("://");
		if(endOfProtocol >= 0) {
			this.protocol = url.substring(0, endOfProtocol);
			startOfDomain = endOfProtocol + 3;
		} else {
			startOfDomain = 0;
		}

		startOfQuery = url.indexOf("?", startOfDomain);
		if(startOfQuery >= 0) {
			endOfFile = startOfQuery;

			// Parse the query string.
			const pairSeparator: string = (url.indexOf("&", startOfQuery) >= 0) ? "&" : ";";
			url.substring(startOfQuery + 1).split(pairSeparator).forEach((pair: string) => {
				const parts: string[] = pair.split("=");
				const name: string = decodeURIComponent(parts[0]);
				const value: string | null = (parts.length > 1) ? decodeURIComponent(parts[1]) : null;

				this.query.set(name, value);
			});

		} else {
			endOfFile = url.length;
		}

		startOfDirectory = url.indexOf("/", startOfDomain);
		if(startOfDirectory >= 0) {
			const parts: string[] = url.substring(startOfDirectory + 1, endOfFile).split("/");
			this.directory = parts.slice(0, parts.length - 1);
			
			const file: string = parts[parts.length - 1];
			this.file = (file.length > 0) ? file : null;

			endOfPort = startOfDirectory;
		} else {
			endOfPort = (startOfQuery >= 0) ? startOfQuery : url.length;
		}

		startOfPort = url.indexOf(":", startOfDomain);
		if(startOfPort >= 0 && startOfPort < endOfPort - 1) {
			this.port = parseInt(url.substring(startOfPort + 1, endOfPort));
			endOfDomain = startOfPort;
		} else {
			endOfDomain = endOfPort;
		}

		if(startOfDomain != endOfDomain) {
			this.domain = url.substring(startOfDomain, endOfDomain).split(".");
		}
	}
}