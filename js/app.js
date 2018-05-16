/**
 * @module app
 */
 
//
import canvas from "./canvas.js";
 
//
let app = {
	
	/**
	 *
	 */
	setCursor: function( cursor ) {
		canvas.main.style.cursor = cursor;
	}
	
}

//
export default app;
