/**
 * @module Compiler
 */

//
import global from "./global.js";
import object from "./object.js";
import sprite from "./sprite.js";
import sound from "./sound.js";
 
//
export default class Compiler {
	
	/**
	 * @param {string} exp
	 */
	static actionExpression(exp) {
		
		if (!isNaN(Number(exp)))
			return Number(exp);
		
		if (Compiler.isBoolean(exp)) {
			return exp === true || exp === "true";
		}
		
		if (Compiler.isFunction(exp)
		||  Compiler.isOperator(exp)
		||  Compiler.isResource(exp)
		||  Compiler.isCss(exp))
			return exp;
			
		if (Compiler.isString(exp)) {
			return exp.slice(1, -1);
		}
		
		if (typeof exp === "string") {
		
			let n,
				string = "",
				sIndex = -1,
				newArr = [];
				
			for (n = 0; n < exp.length; n++) {
				
				let c = exp.charAt(n);
				switch (c) {
					
					case ("'"):
						if (sIndex === -1) {
							sIndex = n + 1
						} else {
							newArr.push("'" + exp.slice(sIndex, n) + "'");
							sIndex = -1;
						}
						break;
						
					default:
						if (sIndex === -1 && c !== " ") {
							if (Compiler.splitCharacters.includes(c)) {
								if (string !== "") {
									newArr.push(string);
									string = "";
								}
								newArr.push(c);
							} else {
								string += c;
							}
						}
						
				}
				
			}
			
			if (string !== "") {
				newArr.push(string);
				string = "";
			}
			
			let y = "";
			
			newArr.forEach((word) => {
				let num = parseInt(word);
				if (isNaN(num)) {
					let c = word.charAt(0);
					if (c === "'") {
						y += word;
					} else if (Compiler.splitCharacters.includes(c)) {
						y += word;
					} else {
						if (word === "fps")
							y += global.fps;
						else {
							if (!Compiler.isResource(word)
							&&  Compiler.isSingleWord(word)) {
								y += "this." + word;
								//this[word] = this[word] || word;
							} else {
								y += word;
							}
						}
					}
				} else {
					y += word;
				}
			} );
			
			return eval(y);
			
		}
		
		return exp;

	}
	
	/** */
	static isResource(x) {
		return object.names.includes(x)
			|| sprite.names.includes(x)
			|| sound.names.includes(x);
	}
	
	/** */
	static isString(x) {
		return x.charAt(0) === "\"";
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

Compiler.booleans = [true, false, "true", "false"];
Compiler.assignmentOperators = ["<", ">", "<=", ">=", "==", "===", "!=", "!=="];
Compiler.splitCharacters = ["+", "-", "=", "!"];