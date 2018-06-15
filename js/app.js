import canvas from "./canvas.js";
 
/**
 *
 */
export default class App {
	
	/**
	 * Sets the cursor to use when the mouse is in the game window.
	 * @param {string} cursor Same as the CSS cursor property.
	 * See {@link https://developer.mozilla.org/en-US/docs/Web/CSS/cursor}
	 */
	static setCursor(cursor) {
		canvas.main.style.cursor = cursor;
	}
	
}