/**
 * @module generator
 */

//
export default {
	
	/**
	 * @param {function} constructor Constructor function.
	 */
	functionFromConstructor: (constructor) => {
		return function(...a) { return new constructor(...a); }
	},

	/**
	 * @param {function} method
	 */
	functionFromMethod: (method) => {
		return function(...a) { return method.call(...a); }
	}
	
}