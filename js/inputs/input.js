import keyValues from "../keyvalues.js";
import * as keyboard from "./keyboard.js";
import * as mouse from "./mouse.js";
import * as touch from "./touch.js";
export * as keyboard from "./keyboard.js";
export * as mouse from "./mouse.js";
export * as touch from "./touch.js";

//
const MOUSE_MAP = ["Left", "Middle", "Right"];

//
export const element = document;
export const triggerEvents = [];

export function initMouse()
{
	mouse.init();
}

export function initKeyboard()
{
	keyboard.init();
}

export function initTouch()
{
	touch.init();
}

export function getTriggerEvents()
{
	// Reset.
	triggerEvents.length = 0;

	// Keyboard events.
	Object.keys(keyboard.down).forEach((key) => {
		if (keyValues.includes(key)) {
			if (keyboard.down[key]) triggerEvents.push(key);
			if (keyboard.press[key]) triggerEvents.push(key + "Press");
			if (keyboard.release[key]) triggerEvents.push(key + "Release");
		} else {
			console.warn( "input key not supported: ", key );
			delete keyboard.down[key];
		}
	});

	// Mouse events.
	for(var n=0; n<3; n++) {
		if (mouse.down[n]) triggerEvents.push(MOUSE_MAP[n] + "Down");
		if (mouse.press[n]) triggerEvents.push(MOUSE_MAP[n] + "Press");
		if (mouse.release[n]) triggerEvents.push(MOUSE_MAP[n] + "Release");
	}

	if (mouse.wheelUp) triggerEvents.push("WheelUp");
	if (mouse.wheelDown) triggerEvents.push("WheelDown");
}

export function update()
{
	keyboard.update();
	mouse.update();
	touch.update();
}

export function clear()
{
	keyboard.clear();
}
