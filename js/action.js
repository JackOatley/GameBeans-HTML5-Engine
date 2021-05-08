import Room from "./room.js";
import Sound from "./Sound.js";
import draw from "./draw.js";
import instance from "./instance.js";
import input from "./inputs/input.js";
import * as math from "./math.js";
import Sprite from "./sprite.js";
import Canvas from "./Canvas.js";
import Color from "./Color.js";
import main from "./main.js";
import Camera from "./camera.js";
import * as App from "./App.js";
import Grid from "./data/grid.js";
import Tilemap from "./tilemap.js";
import tween from "./tween.js";
import Transition from "./transition.js";
import Font from "./font.js";
import GameObject from "./object.js";
import Primitive from "./drawing/primitive.js";
import Vector2 from "./Vector2.js";

/**
 * Set the variable with the given name.
 * @param {string} varName
 * @param {*} value
 * @param {boolean} relative
 * @param {boolean} global
 * @return {void}
 */
function set(varName, value, relative, global) {
	const target = global ? window.global : this;
	if (relative) return target[varName] += value;
	target[varName] = value;
}

/**
 * Set the variable with the given name.
 * @param {string} varName
 * @param {*} value
 * @param {boolean} relative
 * @param {boolean} global
 * @return {void}
 */
function setProperty(object, property, value, relative) {
	//console.log(object, property);
	if (relative) return object[property] += value;
	object[property] = value;
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
	if (!relative) return [this.x, this.y] [Number(x), Number(y)];
	this.x += Number(x);
	this.y += Number(y);
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
	const width = this.boxRight - this.boxLeft;
	const height = this.boxBottom - this.boxTop;
	const roomW = Room.current.width;
	const roomH = Room.current.height;
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
	if (this.boxLeft < 0) this.x = this.x - this.boxLeft;
	if (this.boxTop < 0) this.y = this.y - this.boxTop;
	if (this.boxRight > roomW) this.x = roomW - width + this.x - this.boxLeft;
	if (this.boxBottom > roomH) this.y = roomH - height + this.y - this.boxTop;
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
	if (typeof s === "string") return window[s].apply(this, args);
	s.apply(this, args);
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
	App: App,
	Camera: Camera,
	Canvas: Canvas,
	Color: Color,
	main: {
		setGameSpeed: main.setGameSpeed
	},
	instance: instance,
	draw: Object.assign(draw, {
		self: instance.drawSelf,
		debug: instance.drawDebug
	}),
	Room: Room,
	sprite: Sprite,
	Sound: Sound,
	input: {
		keyboard: input.keyboard,
		mouse: input.mouse,
		touch: input.touch
	},
	math: math,
	Font: Font,
	Grid: Grid,
	Tilemap: Tilemap,
	tween: tween,
	Transition: Transition,
	Object: GameObject,
	Primitive: Primitive,
	Vector2: Vector2
}

//
let blockBegin = "blockBegin",
	blockEnd = "blockEnd",
	exitEvent = "exitEvent",
	ifElse = "ifElse",
	roomEnter = Room.enter,
	roomNext = Room.next,
	roomPrevious = Room.previous,
	instanceCreate = instance.create,
	instanceCreateMoving = instance.createMoving,
	moveFree = instance.moveFree,
	instanceDestroy = instance.destroy,
	changeSprite = instance.changeSprite,
	instanceSetRotation = instance.setRotation,
	instanceSetDirection = instance.setDirection,
	message = args => console.log(args),
	alert = function(m) { window.alert(m) },
	confirm = function(m) { return window.confirm(m) },
	drawSetColor = draw.setColor,
	drawSetFont = draw.setFont,
	drawSetFontSize = draw.setFontSize,
	drawText = draw.text,
	drawRectangle = draw.shape.rectangle,
	drawEllipse = draw.shape.ellipse,
	drawSelf = instance.drawSelf,
	drawSprite = draw.sprite,
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
	drawRectangle,
	drawEllipse,
	drawSelf,
	drawSelf as instanceDrawSelf,
	drawSprite,
	roomEnter, roomNext, roomPrevious,
	blockBegin, blockEnd, ifElse,
	exitEvent,
	set,
	get,
	setProperty,
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
