import Canvas from "../Canvas.js";

export const mouse = {
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
export const init = () => {

	document.addEventListener("mousedown", e => {
		e.preventDefault();
		if (!mouse.press[e.button]) window.focus();
		mouse.press[e.button] = true;
		mouse.down[e.button] = true;
	});

	document.addEventListener("mouseup", e => {
		e.preventDefault();
		mouse.press[e.button] = false;
		mouse.release[e.button] = true;
		mouse.down[e.button] = false;
	});

	document.addEventListener("mousemove", e => {
		const canv = Canvas.main.domElement;
		const rect = canv.getBoundingClientRect();
		const hs = canv.width / rect.width;
		const vs = canv.height / rect.height;
		mouse.rawX = ~~(e.clientX - rect.left);
		mouse.rawY = ~~(e.clientY - rect.top);
		mouse.x = ~~(mouse.rawX * hs);
		mouse.y = ~~(mouse.rawY * vs);
	});

	document.addEventListener("mousewheel", e => {
		e.preventDefault();
		const delta = Math.sign(e.wheelDelta);
		mouse.wheelUp = delta > 0;
		mouse.wheelDown = delta < 0;
	}, { passive: false });

}

/**
 *
 */
export const update = () => {
	mouse.wheelUp = false;
	mouse.wheelDown = false;
	for (let n = 0; n < mouse.down.length; n++) {
		mouse.press[n] = false;
		mouse.release[n] = false;
	}
}
