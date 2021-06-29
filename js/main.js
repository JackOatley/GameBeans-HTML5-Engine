import Canvas, * as canvas from "./Canvas.js";
import * as room from "./room.js";
import * as input from "./inputs/input.js";
import * as Instance from "./instance.js";
import global from "./global.js";
import * as draw from "./draw.js";
import {allCameras, updateAllCameras} from "./camera.js";
import {Transition} from "./transitions/transition.js";
import {NOOP} from "./constants.js";

var fpsFrames = 0;
var fpsTime = 0;
var lastTick = performance.now();
var tickLength = 1000 / 60;
var last = 0;
var frameRequest = null;

//
window.addConsoleText = window.addConsoleText ?? console.log;
window._GB_stop = window._GB_stop ?? NOOP;

/**
 *
 */
export function start(opts = {})
{
	if (siteLocked(opts)) return;

	//
	const canv = new Canvas({
		width: room.currentRoom.width,
		height: room.currentRoom.height,
		crisp2D: true,
		context: opts.defaultContext ?? "2d"
	});
	draw.setTarget(canv);
	canvas.setMain(canv);

	// selectively enable input methods
	if (opts.enableMouse ?? true) input.initMouse();
	if (opts.enableKeyboard ?? true) input.initKeyboard();
	if (opts.enableTouch) input.initTouch();
	if (opts.hideCursor) canv.domElement.style.cursor = "none";

	//
	stop();
	room.enter(room.currentRoom);
	requestAnimationFrame(tick);
}

/**
 *
 */
function siteLocked({host})
{
	if (host === undefined || host === "") return false;
	const loc = window.parent ? window.parent.location : window.location;
	const name = loc.hostname;
	const arr = name.split(" ").join("").split(",");
	if (!name.includes(host)) return true;
}

/**
 *
 */
export function stop()
{
	if (frameRequest)
		window.cancelAnimationFrame(frameRequest);
}

/**
 *
 */
export function setGameSpeed(speed)
{
	tickLength = 1000 / speed;
}

/**
 *
 */
function tick(timestamp)
{
	try {

		// Exit game with Esc key.
		if (window._GB_stop && input.triggerEvents.includes("EscapePress"))
			window._GB_stop();

		frameRequest = requestAnimationFrame(tick);

		// Account for the first frame.
		if (!last) last = timestamp = performance.now();
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
			input.update();
		}
		gameDraw();
		last = timestamp;

	} catch (err) {
		console.error(err);
		window.addConsoleText("#F00", "Error: " + err);
		window._GB_stop();
	}

}

/**
 * Update sequence.
 */
function gameUpdate()
{
	Instance.stepAll();
	Transition.updateAll();
}

/**
 *
 */
function gameDraw()
{
	draw.reset();
	draw.clear(room.currentRoom.backgroundColor, room.currentRoom.backgroundAlpha);
	if (allCameras.length) {
		updateAllCameras();
	} else {
		room.currentRoom.draw();
		Instance.drawAll();
	}
	draw.reset();
	Instance.drawGuiAll();
	Transition.drawAll();
}

/**
 *
 */
function handleResizeEvent()
{
	Instance.executeEventAll("resize");
}
window.addEventListener("resize", handleResizeEvent);
