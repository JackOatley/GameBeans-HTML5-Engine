import Canvas from "./Canvas";
import room from "./room";
import input from "./input";
import Instance from "./instance";
import global from "./global";
import draw from "./draw";
import Camera from "./camera";
import Transition from "./transition";
import NOOP from "./utils/noop";

var fpsFrames = 0;
var fpsTime = 0;
var lastTick = performance.now();
var tickLength = 1000 / 60;
var last = 0;
var frameRequest = null;

//
window.addConsoleText = window.addConsoleText || console.log;
window._GB_stop = window._GB_stop || NOOP;

//
var main = {

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
		var canv = new Canvas({
			width: room.current.width,
			height: room.current.height,
			crisp2D: true,
			application: true,
			context: opts.defaultContext || "2d"
		});

		// selectively enable input methods
		if (opts.enableMouse) input.initMouse();
		if (opts.enableKeyboard) input.initKeyboard();
		if (opts.enableTouch) input.initTouch();
		if (opts.hideCursor) canv.domElement.style.cursor = "none";

		//
		this.stop();
		room.enter(room.current);
		tick(performance.now());

	},

	/**
	 * @return {void}
	 */
	stop: function() {
		if (frameRequest) {
			window.cancelAnimationFrame(frameRequest);
		}
	},

	/**
	 * @param {number} speed
	 * @return {void}
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

		// Exit game with Esc key.
		if (window._GB_stop && input.triggerEvents.includes("EscapePress"))
			window._GB_stop();

		// request the next frame
		frameRequest = window.requestAnimationFrame(tick);
		let nextTick = lastTick + tickLength;
		let numTicks = 0;
		global.fpsNow = 1000 / (timestamp - last);
		global.dt = timestamp - last;
		fpsFrames += 1;
		fpsTime += global.dt;
		while (fpsTime >= 1000) {
			global.fps = fpsFrames;
			fpsFrames = 0;
			fpsTime -= 1000;
		}
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
 * @return {void}
 */
function gameDraw() {
	draw.reset();
	Canvas.main.fill("#000");
	Camera.updateAll();
	draw.reset();
	Instance.drawGuiAll();
	Transition.drawAll();
}

/**
 * @return {void}
 */
function handleResizeEvent() {
	Instance.executeEventAll("resize");
}

// attach event listerners
window.addEventListener("resize", handleResizeEvent);

//
export default main;
