/**
 * @author Jack Oatley
 */
export default class Compiler {

	/***************************************************************************
	 * @param {string} exp
	 * @return {*}
	 */
	static actionExpressionEval(exp) {

		let isActionParam = false;
		if (exp instanceof String) {
			isActionParam = true;
			exp = String(exp);
		}

		if (exp === "self") return this;
		if (exp === "other") return window.other;

		if (!isNaN(Number(exp)))
			return Number(exp);

		if (Compiler.isBoolean(exp))
			return exp === true || exp === "true";

		if (Compiler.isFunction(exp)
		||  Compiler.isOperator(exp)
		||  Compiler.isResource(exp)
		||  Compiler.isCss(exp)
		||  (!isActionParam && typeof exp === "string")) {
			return exp;
		}

		if (typeof exp === "string") {
			let words = Compiler.getWords(exp);
			let expression = Compiler.joinWords(words);
			return eval(expression);
		}

		return exp;

	}

	/**
	 * Done it like this so Compiler doesn't have module dependencies.
	 * @param {Object} eng The GameBeans engine module.
	 * @return {void}
	 */
	static setEngine(eng) {
		Compiler.engine = eng;
	}

	/**
	 * @param {string} exp
	 * @return {*}
	 */
	static actionExpression(exp) {

		let isActionParam = false;
		if (exp instanceof String) {
			isActionParam = true;
			exp = String(exp);
		}

		if (exp === "self") return "this";
		if (exp === "other") return "window.other";

		if (!isNaN(Number(exp)))
			return Number(exp);

		if (Compiler.isBoolean(exp))
			return (exp === true || exp === "true");// ? "true" : "false";

		if (Compiler.isOperator(exp)
		||  Compiler.isCss(exp))
			return "'" + exp + "'";

		if (Compiler.isFunction(exp)
		||  Compiler.isResource(exp)
		||  (!isActionParam && typeof exp === "string")) {
			return exp;
		}

		if (typeof exp === "string") {
			let words = Compiler.getWords(exp);
			let expression = Compiler.joinWords(words);
			return expression;
		}

		return exp;

	}

	/**
	 *
	 */
	static getWords(exp) {
		let n;
		let string = "";
		let sIndex = -1;
		let sType = "";
		let newArr = [];

		for (n = 0; n < exp.length; n++) {

			let c = exp.charAt(n);

			if (c === "'" || c === "\"") {
				if (sIndex === -1) {
					sType = c;
					sIndex = n + 1;
				} else if (sType === c) {
					newArr.push("'" + exp.slice(sIndex, n) + "'");
					sIndex = -1;
				}
			}

			else if (sIndex === -1) {
				if (c !== " ") {
					if (Compiler.splitCharacters.includes(c)) {
						if (string !== "") {
							newArr.push(string);
							string = "";
						}
						newArr.push(c);
					} else {
						string += c;
					}
				} else {
					string += c;
				}
			}

		}

		if (string !== "") {
			newArr.push(string);
			string = "";
		}

		return newArr;
	}

	/**
	 *
	 */
	static joinWords(words) {
		let y = "";
		words.forEach((word) => {
			let num = parseInt(word);
			if (isNaN(num)) {
				let c = word.charAt(0);
				if (c === "'" || c === " ") {
					y += word;
				} else if (Compiler.splitCharacters.includes(c)) {
					y += word;
				} else {
					if (word === "fps")
						y += "global.fps";
					else {
						if (!Compiler.isResource(word)
						&&  Compiler.isSingleWord(word)
						&&  !Compiler.isString(word)
						&&  !Compiler.isArray(word)
						&& word !== "this") {
							y += "this." + word;
						} else {
							y += word;
						}
					}
				}
			} else {
				y += word;
			}
		});
		return y;
	}

	/** */
	static isResource(x) {
		return Compiler.engine.object.names.includes(x)
			|| Compiler.engine.sprite.names.includes(x)
			|| Compiler.engine.Sound.names.includes(x)
			|| Compiler.engine.Room.names.includes(x)
			|| Compiler.engine.Font.names.includes(x)
			|| Compiler.engine.Script.names.includes(x);
	}

	/** */
	static isArray(x) {
		return x.charAt(0) === "[";
	}

	/** */
	static isString(x) {
		return (x.charAt(0) === "\"" && x.charAt(x.length-1) === "\"")
			|| (x.charAt(0) === "'" && x.charAt(x.length-1) === "'");
	}

	/** */
	static isSingleWord(x) {
		return !x.includes(".");
	}

	/** */
	static isFunction(x) {
		return typeof x === "function";
	}

	/** */
	static isBoolean(x) {
		return Compiler.booleans.includes(x);
	}

	/** */
	static isOperator(x) {
		return Compiler.assignmentOperators.includes(x);
	}

	/** */
	static isCss(x) {
		return x.charAt(0) === "#";
	}

}

Compiler.engine = {};
Compiler.keywords = ["self", "other"];
Compiler.booleans = [true, false, "true", "false"];
Compiler.assignmentOperators = ["<", ">", "<=", ">=", "==", "===", "!=", "!=="];
Compiler.splitCharacters = ["+", "-", "=", "!"];
