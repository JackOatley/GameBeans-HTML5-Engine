import Canvas from "./canvas";
import room from "./room";
import input from "./input";
import instance from "./instance";
import global from "./global";
import draw from "./draw";
import Camera from "./camera";
import Transition from "./transition";

let lastTick = performance.now(),
	tickLength = 1000 / 60,
	dt = 0,
	last = 0;
	
//
let main = {
	
	/**
	 *
	 */
	get dt() {
		return dt;
	},
	
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
	setGameSpeed: function( speed ) {
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
			numTicks = Math.floor( timeSinceTick / tickLength );
		}
		
		//
		input.getTriggerEvents();
		queueUpdates(numTicks);
		gameDraw();
		
		//
		if ( numTicks ) {
			input.update();
		}
		
	} catch (err) {
		window.addConsoleText("#F00", "Error: " + err);
		window._GB_stop();
	}
	
}

/**
 * @param {number} ticks
 */
function queueUpdates(ticks) {
	let i;
	for(i=0; i<ticks; i++) {
		lastTick = lastTick + tickLength;
		dt = 1;
		gameUpdate(1);
	}
}

/**
 * @param {number} dt Delta Time.
 */
function gameUpdate(dt) {
	instance.stepAll(dt);
	instance.clearDestroyed();
	Transition.updateAll();
}

/**
 *
 */
function gameDraw() {
	draw.reset();
	Canvas.main.fill("#000000");
	room.draw(room.current);
	Camera.updateAll();
	instance.drawAll();
	Transition.drawAll();
}

/**
 *
 */
function handleResizeEvent() {
	instance.executeEventAll("resize");
}

// attach event listerners
window.addEventListener("resize", handleResizeEvent);

//
export default main;
