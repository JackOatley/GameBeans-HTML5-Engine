import Canvas from "./Canvas.js";
import room from "./room.js";
import input from "./inputs/input.js";
import * as Instance from "./instance.js";
import global from "./global.js";
import * as draw from "./draw.js";
import { allCameras, updateAllCameras } from "./camera.js";
import Transition from "./transition.js";
import { NOOP } from "./constants.js";

var fpsFrames = 0;
var fpsTime = 0;
var lastTick = performance.now();
var tickLength = 1000 / 60;
var last = 0;
var frameRequest = null;

//
window.addConsoleText = window.addConsoleText || console.log;
window._GB_stop = window._GB_stop || NOOP;

/**
 *
 */
export function start(opts = {}) {

	console.log("STARTING");

	// Basic site-locking
	if (opts.host !== undefined && opts.host !== "") {
		let loc = (window.parent) ? window.parent.location : window.location;
		let host = loc.hostname;
		let arr = opts.host.split(" ").join("").split(",");
		if (!opts.host.includes(host))
			return;
	}

	console.log(room.current);

	//
	var canv = new Canvas({
		width: room.current.width,
		height: room.current.height,
		crisp2D: true,
		application: true,
		context: opts.defaultContext ?? "2d"
	});

	// selectively enable input methods
	if (opts.enableMouse ?? true) input.initMouse();
	if (opts.enableKeyboard ?? true) input.initKeyboard();
	if (opts.enableTouch) input.initTouch();
	if (opts.hideCursor) canv.domElement.style.cursor = "none";

	//
	stop();
	room.enter(room.current);
	requestAnimationFrame(tick);

}

/**
 * @return {void}
 */
export const stop = () => {
	if (frameRequest) window.cancelAnimationFrame(frameRequest);
}

/**
 * @type {function(number):void}
 */
export const setGameSpeed = speed => {
	tickLength = 1000 / speed;
}

/**
 *
 */
function tick(timestamp) {

	try {

		// Exit game with Esc key.
		if (window._GB_stop && input.triggerEvents.includes("EscapePress"))
			window._GB_stop();

		// Account for the first frame.
		if (!last) last = timestamp = performance.now();

		// request the next frame
		frameRequest = requestAnimationFrame(tick);
		global.fpsNow = 1000 / (timestamp - last);
		global.dt = timestamp - last;

		fpsFrames += 1;
		fpsTime += global.dt;
		while (fpsTime >= tickLength) {
			global.fps = fpsFrames;
			fpsFrames = 0;
			fpsTime -= tickLength;

			input.getTriggerEvents();
			gameUpdate();
			gameDraw();
			input.update();
		}
		last = timestamp;

	} catch (err) {
		console.error(err);
		window.addConsoleText("#F00", "Error: " + err);
		window._GB_stop();
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
	room.current.draw();
	if (allCameras.length) {
		updateAllCameras();
	} else {
		Instance.drawAll();
	}
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
