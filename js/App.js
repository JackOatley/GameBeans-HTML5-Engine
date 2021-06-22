import Canvas from "./Canvas.js";
import {start} from "./main.js";
import {drawTotalReset} from "./draw.js";
import {instanceArray} from "./instance.js";
import * as Input from "./inputs/input.js";
import {Camera} from "./camera.js";

/**
 * Sets the cursor to use when the mouse is in the game window.
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
 */
export function setCursor(cursor)
{
	Canvas.main.style.cursor = cursor;
}

/**
 *
 */
export function restart()
{
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
