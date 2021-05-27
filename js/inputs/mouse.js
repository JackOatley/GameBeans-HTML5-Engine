import Canvas from "../Canvas.js";

export const press = [false, false, false];
export const down = [false, false, false];
export const release = [false, false, false];
export let wheelUp = false;
export let wheelDown = false;
export let rawX = 0;
export let rawY = 0;
export let x = 0;
export let y = 0;

/**
 * @type {function():void}
 */
export const init = () => {

	document.addEventListener("mousedown", e => {
		e.preventDefault();
		if (!press[e.button]) window.focus();
		press[e.button] = true;
		down[e.button] = true;
	});

	document.addEventListener("mouseup", e => {
		e.preventDefault();
		press[e.button] = false;
		release[e.button] = true;
		down[e.button] = false;
	});

	document.addEventListener("mousemove", e => {
		const canv = Canvas.main.domElement;
		const rect = canv.getBoundingClientRect();
		const scale = Math.min(rect.height / canv.height, rect.width / canv.width);
		const offsetX = (rect.width - canv.width * scale) / 2;
		const offsetY = (rect.height - canv.height * scale) / 2;
		rawX = ~~(e.clientX - rect.left) - offsetX;
		rawY = ~~(e.clientY - rect.top) - offsetY;
		x = ~~(rawX / scale);
		y = ~~(rawY / scale);
	});

	document.addEventListener("mousewheel", e => {
		e.preventDefault();
		const delta = Math.sign(e.wheelDelta);
		wheelUp = delta > 0;
		wheelDown = delta < 0;
	}, { passive: false });

}

/**
 * @type {function():void}
 */
export const update = () => {
	wheelUp = false;
	wheelDown = false;
	for (let n = 0; n < down.length; n++) {
		press[n] = false;
		release[n] = false;
	}
}
