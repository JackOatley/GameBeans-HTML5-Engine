/**
 * @module generator
 */

//
let generator = {
	
	/**
	 * @param {function} constructor
	 */
	functionFromConstructor: function( constructor ) {
		return function( ...a ) { return new constructor( ...a ) }
	},

	/**
	 * @param {function} method
	 */
	functionFromMethod: function( method ) {
		return function( ...a ) { return method.call( ...a ) }
	}
	
}

//
export default generator;