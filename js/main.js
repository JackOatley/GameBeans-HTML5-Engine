import Canvas from "./Canvas";
import room from "./room";
import input from "./input";
import Instance from "./instance";
import global from "./global";
import draw from "./draw";
import Camera from "./camera";
import Transition from "./transition";
import NOOP from "./utils/noop";

let lastTick = performance.now(),
	tickLength = 1000 / 60,
	last = 0;

//
window.addConsoleText = window.addConsoleText || console.log;
window._GB_stop = window._GB_stop || NOOP;

//
let main = {

	/**
	 *
	 */
	start: function(opts = {}) {

		// Basic site-locking
		if (opts.host !== undefined && opts.host !== "") {
			let loc = (window.parent) ? window.parent.location : window.location;
			let host = loc.hostname;
			let arr = opts.host.split(" ").join("").split(",");
			if (!opts.host.includes(host))
				return;
		}

		//
		let canv = new Canvas({
			width: room.current.width,
			height: room.current.height,
			crisp2D: true,
			application: true
		});

		// selectively enable input methods
		if (opts.enableMouse) input.initMouse();
		if (opts.enableKeyboard) input.initKeyboard();
		if (opts.enableTouch) input.initTouch();
		if (opts.hideCursor) canv.domElement.style.cursor = "none";

		//
		room.enter(room.current);
		tick(performance.now());

	},

	/**
	 *
	 */
	setGameSpeed: function(speed) {
		tickLength = 1000 / speed;
	}

}

/**
 *
 */
function tick(timestamp) {

	try {

		// exit game with Esc key
		if (window._GB_stop && input.triggerEvents.includes("EscapePressed"))
			window._GB_stop();

		// request the next frame
		window.requestAnimationFrame(tick);
		let nextTick = lastTick + tickLength;
		let numTicks = 0;
		global.fps = 1000 / (timestamp - last);
		global.dt = timestamp - last;
		last = timestamp;

		//
		if ( timestamp > nextTick ) {
			let timeSinceTick = timestamp - lastTick;
			let maxTicks = Math.floor(timeSinceTick / tickLength);
			lastTick = lastTick + tickLength * maxTicks;
			numTicks = Math.min(maxTicks, 60);
		}

		//
		input.getTriggerEvents();
		queueUpdates(numTicks);
		gameDraw();

		//
		if (numTicks) {
			input.update();
		}

	} catch (err) {
		console.error(err);
		window.addConsoleText("#F00", "Error: " + err);
		window._GB_stop();
	}

}

/**
 * @param {number} ticks
 * @return {void}
 */
function queueUpdates(ticks) {
	while (ticks--) {
		gameUpdate();
	}
}

/**
 * Update sequence.
 * @return {void}
 */
function gameUpdate() {
	Instance.stepAll();
	Transition.updateAll();
}

/**
 *
 */
function gameDraw() {
	draw.reset();
	Canvas.main.fill("#000");
	room.draw(room.current);
	Camera.updateAll();
	Instance.drawAll();
	draw.reset();
	Instance.drawGuiAll();
	Transition.drawAll();
}

/**
 *
 */
function handleResizeEvent() {
	Instance.executeEventAll("resize");
}

// attach event listerners
window.addEventListener("resize", handleResizeEvent);

//
export default main;
