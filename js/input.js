import Canvas from "./canvas";
import keyValues from "./keyvalues";

// Mouse object
let __mouse = {
	pressed: [false, false, false],
	down: [false, false, false],
	released: [false, false, false],
	wheelUp: false,
	wheelDown: false,
	rawX: 0,
	rawY: 0,
	x: 0,
	y: 0
}

// Keyboard object
let __keyboard = {
	pressed: {},
	down: {},
	released: {}
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
export default class Input {
	
	/**
	 *
	 */
	static init() {
		Input.initMouse();
		Input.initKeyboard();
		Input.initTouch();
		Input.element.addEventListener("contextmenu",
			(e) => e.preventDefault()
		);
	}
	
	/**
	 *
	 */
	static initMouse() {
		
		//
		let handleMouseDown = (e) => {
			e.preventDefault();
			if (!__mouse.pressed[e.button]) window.focus();
			__mouse.pressed[e.button] = true;
			__mouse.down[e.button] = true;
		}
		
		//
		let handleMouseUp = (e) => {
			e.preventDefault();
			__mouse.pressed[e.button] = false;
			__mouse.released[e.button] = true;
			__mouse.down[e.button] = false;
		}
		
		//
		let handleMouseMove = (e) => {
			const canv = Canvas.main.domElement;
			const rect = canv.getBoundingClientRect();
			const hs = canv.width / rect.width;
			const vs = canv.height / rect.height;
			__mouse.rawX = e.clientX - rect.left;
			__mouse.rawY = e.clientY - rect.top;
			__mouse.x = __mouse.rawX * hs;
			__mouse.y = __mouse.rawY * vs;
		}
		
		//
		let handleMouseWheel = (e) => {
			e.preventDefault();
			let delta = Math.max(-1, Math.min(1, e.wheelDelta));
			__mouse.wheelUp = delta > 0;
			__mouse.wheelDown = delta < 0;
		}
		
		//
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
			__keyboard.pressed[key] = false;
			__keyboard.down[key] = false;
			__keyboard.released[key] = false;
		});
		
		//
		let handleKeyDown = (e) => {
			e.preventDefault();
			const code = e.code || e.key;
			if (!__keyboard.down[code]) {
				__keyboard.pressed[code] = true;
				__keyboard.down[code] = true;
			}
		}
		
		//
		let handleKeyUp = (e) => {
			e.preventDefault();
			const code = e.code || e.key;
			__keyboard.released[code] = true;
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
		let handleTouchStart = (e) => {
			e.preventDefault();
			(!__touch.start[0]) && window.focus();
			__touch.start[0] = true;
			__touch.held[0] = true;
		}
		
		//
		let handleTouchEnd = (e) => {
			e.preventDefault();
			__touch.start[0] = false;
			__touch.end[0] = true;
			__touch.held[0] = false;
		}
		
		//
		let handleTouchMove = (e) => {
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
		let triggers = Input.triggerEvents;
		triggers.length = 0;
		Object.keys(__keyboard.down).forEach((key) => {
			if (keyValues.includes(key)) {
				if (__keyboard.down[key]) triggers.push(key);
				if (__keyboard.pressed[key]) triggers.push(key + "Pressed");
				if (__keyboard.released[key]) triggers.push(key + "Released");
			} else {
				console.warn( "input key not supported: ", key );
				delete __keyboard.down[key];
			}
		});
		
		// mouse events
		let mouseMap = ["Left", "Middle", "Right"];
		for(var n=0; n<3; n++) {
			if (__mouse.down[n]) triggers.push(mouseMap[n] + "Down");
			if (__mouse.pressed[n]) triggers.push(mouseMap[n] + "Pressed");
			if (__mouse.released[n]) triggers.push(mouseMap[n] + "Released");
		}
		
		if (__mouse.wheelUp) triggers.push("WheelUp");
		if (__mouse.wheelDown) triggers.push("WheelDown");
		
	}

	/**
	 *
	 */
	static update() {
		
		Object.keys(__keyboard.down).forEach((key) => {
			__keyboard.pressed[key] = false;
			__keyboard.released[key] = false;
		});

		Object.keys(__mouse.down).forEach((button) => {
			__mouse.pressed[button] = false;
			__mouse.released[button] = false;
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