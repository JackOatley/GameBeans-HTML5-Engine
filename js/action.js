/**
 * @module actions
 */

import Room from "./room.js";
import Sound from "./sound.js";
import draw from "./draw.js";
import instance from "./instance.js";
import input from "./input.js";
import math from "./math.js";
import sprite from "./sprite.js";
import canvas from "./canvas.js";
import color from "./color.js";
import main from "./main.js";
import Camera from "./camera.js";
import app from "./app.js";
import Grid from "./data/grid";
import Tilemap from "./tilemap.js";
import tween from "./tween.js";
import Transition from "./transition.js";
import Primitive from "./drawing/primitive.js";
 
/**
 * @param {string} varName
 * @param {value} value
 */
function actionSet(varName, value, relative) {
	(relative)
		? this[varName] += value
		: this[varName] = value;
}

/**
 * @param {string} varName
 * @param {string} op Operation.
 * @param {value} value Value to check against.
 */
function actionTest(varName, op, value) {
	switch (op) {
		case("=="): return this[varName] == value;
		case("<"): return this[varName] < value;
		case(">"): return this[varName] > value;
		case("<="): return this[varName] <= value;
		case(">="): return this[varName] >= value;
		default: return false;
	}
}

/**
 * Sets the instance's gravity to the given value.
 * @param {number} value The gravity strength.
 */
function setGravity(value) {
	this.gravity = value;
}

/**
 * Instantly sets the instance's x and y values to a random position within
 * the current room.
 * @param {number} x
 * @param {number} y
 * @param {boolean} relative
 */
function actionJump(x, y, relative) {
	if (relative) {
		this.x += Number(x);
		this.y += Number(y);
	} else {
		this.x = Number(x);
		this.y = Number(y);
	}
}

/**
 * Instantly sets the instance's x and y values to a random position within
 * the current room.
 */
function actionJumpRandom() {
	let x1 = 0, y1 = 0, x2 = 640, y2 = 480;
	this.x = Math.floor(Math.random() * (x2 - x1 + 1)) + x1;
	this.y = Math.floor(Math.random() * (y2 - y1 + 1)) + y1;
}

/**
 *
 */
function moveFree(speed, direction) {
	this.speed = speed;
	this.direction = direction;
}

/**
 * Instantly sets the instance's x and y values to a random position within
 * the current room.
 * @param {number} x
 * @param {number} y
 */
function moveDirect(x, y) {
	this.x += x * main.dt;
	this.y += y * main.dt;
}

/**
 *
 */
function moveSpeedX(speed) { this.speedX = Number(speed); }
function moveSpeedY(speed) { this.speedY = Number(speed); }
function moveReverseX() { this.speedX = -this.speedX; }
function moveReverseY() { this.speedY = -this.speedY; }

/**
 * Wraps the instance back into the room when it leaves.
 */
function actionWrap() {
	let width = this.boxRight - this.boxLeft;
	let height = this.boxBottom - this.boxTop;
	let thisRoom = Room.current;
	let roomW = thisRoom.width;
	let roomH = thisRoom.height;
	if (this.boxRight < 0) this.x += roomW + width;
	if (this.boxBottom < 0) this.y += roomH + height;
	if (this.boxLeft > roomW) this.x -= roomW + width;
	if (this.boxTop > roomH) this.y -= roomH + height;
}

/**
 * Wraps the instance back into the room when it leaves.
 */
function actionConfine() {
	let width = this.boxRight - this.boxLeft;
	let height = this.boxBottom - this.boxTop;
	let thisRoom = Room.current;
	let roomW = thisRoom.width;
	let roomH = thisRoom.height;
	if (this.boxLeft < 0) this.x = 0;
	if (this.boxTop < 0) this.y = 0;
	if (this.boxRight > roomW) this.x = roomW - width;
	if (this.boxBottom > roomH) this.y = roomH - height;
}

/**
 * Executes the given function with variable arguments on the instance.
 * @param {function} func
 * @param {...*} args
 */
function actionFunc(func, ...args) {
	func.apply(this, args);
}

/**
 * Executes the given function with variable arguments on the instance.
 * @param {string} code
 */
function runCode(code) {
	if (typeof code === "string") {
		try {
			eval(code);
		}
		catch(err) {
			console.error(err.message);
		}
	} else {
		console.error("runCode(code); code must be a string!");
	}
}

/**
 * Shows the value of the given variable of the instance, in the console.
 * @param {...*} args
 */
function actionGet(...args) {
	console.log(this[args].toFixed(2));
}

// Fucntions for use in code.
let GAME = {
	main: {
		setGameSpeed: main.setGameSpeed
	},
	instance: {
		create: instance.create,
		createMoving: instance.createMoving,
		destroy: instance.destroy,
		find: instance.find,
		findRandom: instance.findRandom,
		count: instance.count,
		mouseOn: instance.mouseOn
	},
	draw: Object.assign( draw, {
		self: instance.drawSelf,
		debug: instance.drawDebug
	} ),
	canvas: {
		getMain: canvas.getMain,
		create: canvas.create
	},
	color: color,
	sprite: {
		create: sprite.create,
		addFrame: sprite.addFrame,
		tint: sprite.tint,
		get: sprite.get,
		cache: sprite.cache
	},
	Sound: {
		play: Sound.play,
		stop: Sound.stop,
		get: Sound.get
	},
	Room: Room,
	input: {
		keyboard: input.keyboard,
		mouse: input.mouse,
		touch: input.touch
	},
	math: math,
	Camera: Camera,
	app: app,
	Grid: Grid,
	Tilemap: Tilemap,
	tween: tween,
	Transition: Transition,
	Primitive: Primitive
}

//
let blockBegin            = "blockBegin",
	blockEnd        	  = "blockEnd",
	exitEvent        	  = "exitEvent",
	roomEnter             = Room.enter,
	roomNext              = Room.next,
	roomPrevious          = Room.previous,
	instanceCreate    	  = instance.create,
	instanceCreateMoving  = instance.createMoving,
	instanceDestroy       = instance.destroy,
	changeSprite  		  = instance.changeSprite,
	instanceSetRotation   = instance.setRotation,
	instanceSetDirection  = instance.setDirection,
	message               = console.log,
	alert                 = function(m) { window.alert(m) },
	confirm               = function(m) { return window.confirm(m) },
	drawSetColor          = draw.setColor,
	drawSetFont           = draw.setFont,
	drawSetFontSize       = draw.setFontSize,
	drawText              = draw.text,
	drawSelf              = instance.drawSelf,
	drawSprite            = draw.sprite,
	soundPlay = function(snd, loop) {Sound.play(snd, {loop: loop})},
	soundStop = Sound.stop;

//
export {
	instanceCreate,
	instanceCreateMoving,
	instanceDestroy,
	instanceSetRotation,
	instanceSetDirection,
	changeSprite,
	changeSprite as instanceChangeSprite,
	soundPlay, soundStop,
	drawSetColor,
	drawSetFont,
	drawSetFontSize,
	drawText,
	drawSelf,
	drawSelf as instanceDrawSelf,
	drawSprite,
	roomEnter, roomNext, roomPrevious,
	blockBegin, blockEnd,
	exitEvent,
	actionSet        as set,
	actionGet        as get,
	actionTest       as test,
	actionTest,
	setGravity,
	actionJump       as jump,
	actionJumpRandom as jumpRandom,
	moveFree,
	moveDirect,
	moveSpeedX,
	moveSpeedY,
	moveReverseX,
	moveReverseY,
	actionWrap,
	actionConfine,
	actionWrap       as wrap,
	actionConfine    as confine,
	actionFunc       as func,	// DEPRECATE?
	runCode          as code,
	message,
	alert,
	confirm,
	GAME
}
