import Room from "./room";
import Sound from "./Sound";
import draw from "./draw";
import instance from "./instance";
import input from "./input";
import math from "./math";
import Sprite from "./sprite";
import Canvas from "./canvas";
import color from "./color";
import main from "./main";
import Camera from "./camera";
import App from "./App";
import Grid from "./data/grid";
import Tilemap from "./tilemap";
import tween from "./tween";
import Transition from "./transition";
import GameObject from "./object";
import Primitive from "./drawing/primitive";
import Vector2 from "./Vector2";

/*******************************************************************************
 * @param {string} varName
 * @param {*} value
 * @param {boolean} relative
 * @param {void}
 */
function actionSet(varName, value, relative) {
	if (relative) {
		this[varName] += value
	} else {
		this[varName] = value;
	}
}

/**
 * @param {string} varName
 * @param {string} op Operation.
 * @param {value} value Value to check against.
 */
function actionTest(varName, op, value) {
	switch (op) {
		case("!=="): return this[varName] !== value;
		case("==="): return this[varName] === value;
		case("!="): return this[varName] != value;
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
 * Executes the given Script with an array of arguments.
 * @param {script} func
 * @param {array} args
 */
function script(s, args) {
	console.log(window[s], args);
	window[s].apply(this, args);
}

/**
 * Executes the given function with variable arguments on the instance.
 * @param {string} code
 */
function code(code) {
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
	Canvas: Canvas,
	color: color,
	sprite: Sprite,
	Sound: Sound,
	Room: Room,
	input: {
		keyboard: input.keyboard,
		mouse: input.mouse,
		touch: input.touch
	},
	math: math,
	Camera: Camera,
	App: App,
	Grid: Grid,
	Tilemap: Tilemap,
	tween: tween,
	Transition: Transition,
	Object: GameObject,
	Primitive: Primitive,
	Vector2: Vector2
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
	message               = (args) => console.log(args),
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
	script,
	code,
	message,
	alert,
	confirm,
	GAME
}
