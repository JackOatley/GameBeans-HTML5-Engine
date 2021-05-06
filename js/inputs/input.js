import Canvas from "../Canvas.js";
import keyValues from "../keyvalues.js";
import * as keyboard from "./keyboard.js";
import * as mouse from "./mouse.js";
import * as touch from "./touch.js";

// Mouse object
let __mouseMap = ["Left", "Middle", "Right"];

/**
 * @author Jack Oatley
 */
class Input {

	static initMouse() {
		mouse.init();
	}

	static initKeyboard() {
		keyboard.init();
	}

	static initTouch() {
		touch.init();
	}

	/**
	 *
	 */
	static getTriggerEvents() {

		// Reset.
		let triggers = Input.triggerEvents;
		triggers.length = 0;

		// Keyboard events.
		Object.keys(__keyboard.down).forEach((key) => {
			if (keyValues.includes(key)) {
				if (__keyboard.down[key]) triggers.push(key);
				if (__keyboard.press[key]) triggers.push(key + "Press");
				if (__keyboard.release[key]) triggers.push(key + "Release");
			} else {
				console.warn( "input key not supported: ", key );
				delete __keyboard.down[key];
			}
		});

		// Mouse events.
		for(var n=0; n<3; n++) {
			if (__mouse.down[n]) triggers.push(__mouseMap[n] + "Down");
			if (__mouse.press[n]) triggers.push(__mouseMap[n] + "Press");
			if (__mouse.release[n]) triggers.push(__mouseMap[n] + "Release");
		}

		if (__mouse.wheelUp) triggers.push("WheelUp");
		if (__mouse.wheelDown) triggers.push("WheelDown");

	}

	/**
	 *
	 */
	static update() {
		keyboard.update();
		mouse.update();
		touch.update();
	}

	/**
	 *
	 */
	static clear() {
		keyboard.clear();
	}

}

Input.element = document;
Input.triggerEvents = [];
Input.mouse = mouse;
Input.keyboard = keyboard;
Input.touch = touch;

export default Input;
