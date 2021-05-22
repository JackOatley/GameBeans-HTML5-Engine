import Canvas from "./Canvas.js";
import { start } from "./main.js";
import { drawTotalReset } from "./draw.js";
import { instanceArray } from "./instance.js";
import Input from "./inputs/input.js";
import { Camera } from "./camera.js";

/**
 * Sets the cursor to use when the mouse is in the game window.
 * @param {string} cursor Same as the CSS cursor property.
 * See {@link https://developer.mozilla.org/en-US/docs/Web/CSS/cursor}
 */
export const setCursor = cursor => {
	Canvas.main.style.cursor = cursor;
}

/**
 * @return {void}
 */
export const restart = () => {
	Canvas.main.unsetMain();
	Canvas.array = [];
	Canvas.main = null;
	Canvas.dom = null;
	drawTotalReset();
	instanceArray.length = 0;
	Input.clear();
	Camera.destroyAll();
	start();
}
