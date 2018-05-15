/**
 * @module compile
 */

//
import global from "./global.js";
 
//
let compile = {

	/**
	 *
	 */
	actionExpression: function( x ) {
		
		// x is an expression written as a string
		if ( typeof x === "string"
		&&   x.charCodeAt( 0 ) === 64 ) {
			
			let n,
				string = "",
				sIndex = -1,
				newArr = [];
				
			for ( n = 1; n < x.length; n++ ) {
				
				let c = x.charAt( n );
				switch ( c ) {
					
					case ( "'" ):
						if ( sIndex === -1 ) {
							sIndex = n + 1
						} else {
							newArr.push( "'" + x.slice( sIndex, n ) + "'" );
							sIndex = -1;
						}
						break;
						
					default:
						if ( sIndex === -1 && c !== " " ) {
							if ( c === "+" || c === "-" || c === "=" ) {
								if ( string !== "" ) {
									newArr.push( string );
									string = "";
								}
								newArr.push( c );
							} else {
								string += c;
							}
						}
						
				}
				
			}
			
			if ( string !== "" ) {
				newArr.push( string );
				string = "";
			}
			
			let y = "";
			
			newArr.forEach( word => {
				let num = parseInt( word );
				if ( isNaN( num ) ) {
					let c = word.charAt( 0 );
					if ( c === "'" ) {
						y += word;
					} else if ( c === "+" ) {
						y += word;
					} else {
						if ( word === "fps" )
							y += global.fps;
						else {
							if ( this[word] !== undefined ) {
								y += "this." + word;
							} else {
								y += word;
							}
						}
					}
				} else {
					y += word;
				}
			} );
			
			return eval( y );
			
		}
		
		return x;

	}

}

//
export default compile;