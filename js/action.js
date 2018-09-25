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

/**
 * Set the variable with the given name.
 * @param {string} varName
 * @param {*} value
 * @param {boolean} relative
 * @param {boolean} global
 * @return {void}
 */
function set(varName, value, relative, global) {
	let target = global ? window.global : this;
	if (relative) {
		target[varName] += value
	} else {
		target[varName] = value;
	}
}

/**
 * @param {string} varName
 * @param {string} op Operation.
 * @param {value} value Value to check against.
 * @param {boolean} global
 * @return {boolean}
 */
function test(varName, op, value, global) {
	let target = global ? window.global : this;
	switch (op) {
		case("!=="): return target[varName] !== value;
		case("==="): return target[varName] === value;
		case("!="): return target[varName] != value;
		case("=="): return target[varName] == value;
		case("<"): return target[varName] < value;
		case(">"): return target[varName] > value;
		case("<="): return target[varName] <= value;
		case(">="): return target[varName] >= value;
		default: return false;
	}
}

/**
 * Sets the instance's gravity to the given value.
 * @param {number} value The gravity strength.
 * @return {void}
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
 * @return {void}
 */
function jump(x, y, relative) {
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
 * @return {void}
 */
function jumpRandom() {
	let x1 = 0, y1 = 0, x2 = 640, y2 = 480;
	this.x = Math.floor(Math.random() * (x2 - x1 + 1)) + x1;
	this.y = Math.floor(Math.random() * (y2 - y1 + 1)) + y1;
}

/**
 * @param {number} speed
 * @param {number} direction
 * @return {void}
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
 * @return {void}
 */
function moveDirect(x, y) {
	this.x += x * main.dt;
	this.y += y * main.dt;
}

/**
 * @param  {type} speed
 * @return {void}
 */
function moveSpeedX(speed) {
	this.speedX = Number(speed);
}

/**
 * @param  {type} speed
 * @return {void}
 */
function moveSpeedY(speed) {
	this.speedY = Number(speed);
}

/**
 * @return {void}
 */
function moveReverseX() {
	this.speedX = -this.speedX;
}

/**
 * @return {void}
 */
function moveReverseY() {
	this.speedY = -this.speedY;
}

/**
 * Wraps the instance back into the room when it leaves.
 * @return {void}
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
 * @return {void}
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
 * @return {void}
 */
function actionFunc(func, ...args) {
	func.apply(this, args);
}

/**
 * Executes the given Script with an array of arguments.
 * @param {script} func
 * @param {array} args
 * @return {void}
 */
function script(s, args) {
	window[s].apply(this, args);
}

/**
 * Shows the value of the given variable of the instance, in the console.
 * @param {...*} args
 * @return {void}
 */
function get(...args) {
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
	set,
	get,
	test,
	setGravity,
	jump,
	jumpRandom,
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
	message,
	alert,
	confirm,
	GAME
}
