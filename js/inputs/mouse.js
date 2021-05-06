
const mouse = {
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

/**
 *
 */
export function init() {

	function handleMouseDown(e) {
		e.preventDefault();
		if (!mouse.press[e.button]) window.focus();
		mouse.press[e.button] = true;
		mouse.down[e.button] = true;
	}

	function handleMouseUp(e) {
		e.preventDefault();
		mouse.press[e.button] = false;
		mouse.release[e.button] = true;
		mouse.down[e.button] = false;
	}

	function handleMouseMove(e) {
		const canv = Canvas.main.domElement;
		const rect = canv.getBoundingClientRect();
		const hs = canv.width / rect.width;
		const vs = canv.height / rect.height;
		mouse.rawX = ~~(e.clientX - rect.left);
		mouse.rawY = ~~(e.clientY - rect.top);
		mouse.x = ~~(mouse.rawX * hs);
		mouse.y = ~~(mouse.rawY * vs);
	}

	function handleMouseWheel(e) {
		e.preventDefault();
		const delta = Math.sign(e.wheelDelta);
		mouse.wheelUp = delta > 0;
		mouse.wheelDown = delta < 0;
	}

	document.addEventListener("mousedown", handleMouseDown);
	document.addEventListener("mouseup", handleMouseUp);
	document.addEventListener("mousemove", handleMouseMove);
	document.addEventListener("mousewheel", handleMouseWheel);
}

/**
 *
 */
export function update() {
	mouse.wheelUp = false;
	mouse.wheelDown = false;
	Object.keys(mouse.down).forEach((button) => {
		mouse.press[button] = false;
		mouse.release[button] = false;
	});
}
