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
		Object.keys(keyboard.keyboard.down).forEach((key) => {
			if (keyValues.includes(key)) {
				if (keyboard.keyboard.down[key]) triggers.push(key);
				if (keyboard.keyboard.press[key]) triggers.push(key + "Press");
				if (keyboard.keyboard.release[key]) triggers.push(key + "Release");
			} else {
				console.warn( "input key not supported: ", key );
				delete keyboard.keyboard.down[key];
			}
		});

		// Mouse events.
		for(var n=0; n<3; n++) {
			if (mouse.mouse.down[n]) triggers.push(__mouseMap[n] + "Down");
			if (mouse.mouse.press[n]) triggers.push(__mouseMap[n] + "Press");
			if (mouse.mouse.release[n]) triggers.push(__mouseMap[n] + "Release");
		}

		if (mouse.mouse.wheelUp) triggers.push("WheelUp");
		if (mouse.mouse.wheelDown) triggers.push("WheelDown");

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