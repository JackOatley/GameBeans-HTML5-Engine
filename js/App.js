import Canvas from "./Canvas";
import main from "./main.js";
import Draw from "./draw.js";
import instance from "./instance.js";
import Input from "./input.js";
import Camera from "./camera.js";

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
		Canvas.main.style.cursor = cursor;
	}

	/**
	 * @return {void}
	 */
	static restart() {
		Canvas.main.unsetMain();
		Canvas.array = [];
		Canvas.main = null;
		Canvas.dom = null;
		Draw.target = null;
		Draw.context = null;
		Draw.targetStack = [];
		Draw.offsetX = 0;
		Draw.offsetY = 0;
		instance.instanceArray.length = 0;
		Input.clear();
		Camera.destroyAll();
		main.start();
	}

}
