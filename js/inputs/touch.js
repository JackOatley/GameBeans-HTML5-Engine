
// Touch object
export const start = [];
export const held = [];
export const move = [];
export const end = [];
export const cancel = [];
export const x = [];
export const y = [];

/**
 *
 */
export function init() {

	function handleTouchStart(e) {
		e.preventDefault();
		(!start[0]) && window.focus();
		start[0] = true;
		held[0] = true;
	}

	function handleTouchEnd(e) {
		e.preventDefault();
		start[0] = false;
		end[0] = true;
		held[0] = false;
	}

	function handleTouchMove(e) {
		e.preventDefault();
		let touches = e.changedTouches;
		x[0] = touches[0].pageX;
		y[0] = touches[0].pageY;
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
	Object.keys(held).forEach((button) => {
		start[button] = false;
		end[button] = false;
		held[button] = false;
	});
}
