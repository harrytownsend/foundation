function signatureMatch(args: object[], signature: string[]): boolean {
	let optional: boolean = false;

	if(signature.length == 0 && args.length > 0) {
		return false;
	}

	for(let i = 0; i < signature.length; i++) {
		let type: string = signature[i];
		let remaining: boolean = false;

		if(typeof type != "string") {
			throw "Signatures must be an array of type names as strings.";
		}

		if(type.startsWith("?")) {
			type = type.substring(1);
			optional = true;
		} else if(optional) {
			throw "A signature cannot have mandatory arguments after optional ones.";
		}

		if(type.endsWith("...")) {
			if(i + 1 != signature.length) {
				throw "Remainder arguments must appear at the end of the signature.";
			}

			type = type.substring(0, type.length - 3);
			remaining = true;
		}

		if(i + 1 == signature.length && !remaining && signature.length < args.length) {
			return false;
		}

		if(i >= args.length) {
			if(!optional) {
				return false;
			}
		} else if(type != "any") {
			if(remaining) {
				for(let j = i; j < args.length; j++) {
					if(typeof args[j] != type) {
						return false;
					}
				}
			} else {
				if(typeof args[i] != type) {
					return false;
				}
			}
		}
	}

	return true;
}

export function overload(args: object[]): void {
	let match: boolean = false;

	for(let i = 1; i < arguments.length; i++) {
		let argument = arguments[i];
		if(typeof argument == "function") {
			if(match || (i + 1 == arguments.length && ((arguments.length == 2) || (arguments.length >= 3 && typeof arguments[i - 1] == "function")))) {
				argument(...args);
				return;
			}
		} else if(typeof argument == "object" && argument instanceof Array) {
			if(!match) {
				match = signatureMatch(args, argument);
			}
		} else {
			throw "Unexpected parameter at position " + i;
		}
	}
}