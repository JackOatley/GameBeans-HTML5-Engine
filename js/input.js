import Canvas from "./canvas";
import keyValues from "./keyvalues";

// Mouse object
let __mouseMap = ["Left", "Middle", "Right"];
let __mouse = {
	press: [false, false, false],
	down: [false, false, false],
	release: [false, false, false],
	wheelUp: false,
	wheelDown: false,
	rawX: 0,
	rawY: 0,
	x: 0,
	y: 0
}

// Keyboard object
let __keyboard = {
	press: {},
	down: {},
	release: {}
}

// Touch object
let __touch = {
	start: [],
	held: [],
	move: [],
	end: [],
	cancel: [],
	x: [],
	y: []
}

/**
 * @author Jack Oatley
 */
class Input {

	/**
	 *
	 */
	static initMouse() {

		function handleMouseDown(e) {
			e.preventDefault();
			if (!__mouse.press[e.button]) window.focus();
			__mouse.press[e.button] = true;
			__mouse.down[e.button] = true;
		}

		function handleMouseUp(e) {
			e.preventDefault();
			__mouse.press[e.button] = false;
			__mouse.release[e.button] = true;
			__mouse.down[e.button] = false;
		}

		function handleMouseMove(e) {
			const canv = Canvas.main.domElement;
			const rect = canv.getBoundingClientRect();
			const hs = canv.width / rect.width;
			const vs = canv.height / rect.height;
			__mouse.rawX = ~~(e.clientX - rect.left);
			__mouse.rawY = ~~(e.clientY - rect.top);
			__mouse.x = ~~(__mouse.rawX * hs);
			__mouse.y = ~~(__mouse.rawY * vs);
		}

		function handleMouseWheel(e) {
			e.preventDefault();
			const delta = Math.sign(e.wheelDelta);
			__mouse.wheelUp = delta > 0;
			__mouse.wheelDown = delta < 0;
		}

		Input.element.addEventListener("mousedown", handleMouseDown);
		Input.element.addEventListener("mouseup", handleMouseUp);
		Input.element.addEventListener("mousemove", handleMouseMove);
		Input.element.addEventListener("mousewheel", handleMouseWheel);
	}

	/**
	 *
	 */
	static initKeyboard() {

		//
		keyValues.forEach((key) => {
			__keyboard.press[key] = false;
			__keyboard.down[key] = false;
			__keyboard.release[key] = false;
		});

		//
		function handleKeyDown(e) {
			e.preventDefault();
			const code = e.code || e.key;
			if (!__keyboard.down[code]) {
				__keyboard.press[code] = true;
				__keyboard.down[code] = true;
			}
		}

		//
		function handleKeyUp(e) {
			e.preventDefault();
			const code = e.code || e.key;
			__keyboard.release[code] = true;
			__keyboard.down[code] = false;
		}

		//
		Input.element.addEventListener("keydown", handleKeyDown);
		Input.element.addEventListener("keyup", handleKeyUp);
	}

	/**
	 *
	 */
	static initTouch() {

		//
		function handleTouchStart(e) {
			e.preventDefault();
			(!__touch.start[0]) && window.focus();
			__touch.start[0] = true;
			__touch.held[0] = true;
		}

		//
		function handleTouchEnd(e) {
			e.preventDefault();
			__touch.start[0] = false;
			__touch.end[0] = true;
			__touch.held[0] = false;
		}

		//
		function handleTouchMove(e) {
			e.preventDefault();
			let touches = e.changedTouches;
			__touch.x[0] = touches[0].pageX;
			__touch.y[0] = touches[0].pageY;
		}

		//
		Input.element.addEventListener("touchstart", handleTouchStart);
		Input.element.addEventListener("touchend", handleTouchEnd);
		Input.element.addEventListener("touchcancel", handleTouchEnd);
		Input.element.addEventListener("touchmove", handleTouchMove);
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

		Object.keys(__keyboard.down).forEach((key) => {
			__keyboard.press[key] = false;
			__keyboard.release[key] = false;
		});

		Object.keys(__mouse.down).forEach((button) => {
			__mouse.press[button] = false;
			__mouse.release[button] = false;
		});

		Object.keys(__touch.held).forEach((button) => {
			__touch.start[button] = false;
			__touch.end[button] = false;
			__touch.held[button] = false;
		});

		__mouse.wheelUp = false;
		__mouse.wheelDown = false;

	}

}

Input.element = document;
Input.triggerEvents = [];
Input.mouse = __mouse;
Input.keyboard = __keyboard;
Input.touch = __touch;

export default Input;
