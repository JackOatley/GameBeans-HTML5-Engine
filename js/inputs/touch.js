
// Touch object
export const touch = {
	start: [],
	held: [],
	move: [],
	end: [],
	cancel: [],
	x: [],
	y: []
}

/**
 *
 */
export function init() {

	function handleTouchStart(e) {
		e.preventDefault();
		(!touch.start[0]) && window.focus();
		touch.start[0] = true;
		touch.held[0] = true;
	}

	function handleTouchEnd(e) {
		e.preventDefault();
		touch.start[0] = false;
		touch.end[0] = true;
		touch.held[0] = false;
	}

	function handleTouchMove(e) {
		e.preventDefault();
		let touches = e.changedTouches;
		touch.x[0] = touches[0].pageX;
		touch.y[0] = touches[0].pageY;
	}

	document.addEventListener("touchstart", handleTouchStart);
	document.addEventListener("touchend", handleTouchEnd);
	document.addEventListener("touchcancel", handleTouchEnd);
	document.addEventListener("touchmove", handleTouchMove);

}

/**
 *
 */
export function update() {
	Object.keys(touch.held).forEach((button) => {
		touch.start[button] = false;
		touch.end[button] = false;
		touch.held[button] = false;
	});
}
