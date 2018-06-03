/**
 * @module generator
 */

//
export default {
	
	/**
	 * @param {function} constructor Constructor function.
	 */
	functionFromConstructor: c => (...a) => new c(...a),

	/**
	 * @param {function} method Prototype method.
	 */
	functionFromMethod: m => (...a) => m.call(...a)
	
}