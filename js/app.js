/**
 * @module app
 */
 
//
import canvas from "./canvas.js";
 
//
let app = {
	
	/**
	 * @param {string} cursor Same as the CSS cursor property.
	 * See {@link https://developer.mozilla.org/en-US/docs/Web/CSS/cursor}
	 */
	setCursor: function(cursor) {
		canvas.main.style.cursor = cursor;
	}
	
}

//
export default app;
