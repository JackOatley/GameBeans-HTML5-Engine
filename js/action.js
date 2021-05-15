import Room from "./room.js";
import Sound from "./Sound.js";
import * as draw from "./draw.js";
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
 * @type {function(string, *, boolean, boolean):void}
 */
function set(varName, value, relative, global) {
	const target = global ? window.global : this;
	if (relative) return target[varName] += value;
	target[varName] = value;
}

/**
 * Set the variable with the given name.
 * @type {function(Object, string, *, boolean):void}
 */
function setProperty(object, property, value, relative) {
	if (relative) return object[property] += value;
	object[property] = value;
}

/**
 * Intended to be equivalent to an if statement.
 * @type {function(string, string, *, boolean):boolean}
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
 * @type {function(number):void}
 */
function setGravity(value) {
	this.gravity = value;
}

/**
 * Instantly sets the instance's x and y values to a random position within
 * the current room.
 * @type {function(number, number, boolean):void}
 */
function jump(x, y, relative) {
	if (!relative) return [this.x, this.y] [Number(x), Number(y)];
	this.x += Number(x);
	this.y += Number(y);
}

/**
 * Instantly sets the instance's x and y values to a random position within
 * the current room.
 * @type {function():number}
 */
function jumpRandom() {
	const x1 = 0, y1 = 0, x2 = Room.current.width, y2 = Room.current.height;
	this.x = Math.floor(Math.random() * (x2 - x1)) + x1;
	this.y = Math.floor(Math.random() * (y2 - y1)) + y1;
}

/**
 * Instantly sets the instance's x and y values to a random position within
 * the current room.
 * @type {function(number, number):void}
 */
function moveDirect(x, y) {
	this.x += x * main.dt;
	this.y += y * main.dt;
}

/**
 * @type {function(number):void}
 */
function moveSpeedX(speed) {
	this.speedX = Number(speed);
}

/**
 * @type {function(number):void}
 */
function moveSpeedY(speed) {
	this.speedY = Number(speed);
}

/**
 * @type {function():void}
 */
function moveReverseX() {
	this.speedX = -this.speedX;
}

/**
 * @type {function():void}
 */
function moveReverseY() {
	this.speedY = -this.speedY;
}

/**
 * Wraps the instance back into the room when it leaves.
 * @type {function():void}
 */
function actionWrap() {
	const w = this.boxRight - this.boxLeft;
	const h = this.boxBottom - this.boxTop;
	const rw = Room.current.width;
	const rh = Room.current.height;
	if (this.boxRight < 0) this.x += rw + w;
	if (this.boxBottom < 0) this.y += rh + h;
	if (this.boxLeft > rw) this.x -= rw + w;
	if (this.boxTop > rh) this.y -= rh + h;
}

/**
 * Wraps the instance back into the room when it leaves.
 * @type {function():void}
 */
function actionConfine() {
	const w = this.boxRight - this.boxLeft;
	const h = this.boxBottom - this.boxTop;
	const rw = Room.current.width;
	const rh = Room.current.height;
	if (this.boxLeft < 0) this.x = this.x - this.boxLeft;
	if (this.boxTop < 0) this.y = this.y - this.boxTop;
	if (this.boxRight > rw) this.x = rw - w + this.x - this.boxLeft;
	if (this.boxBottom > rh) this.y = rh - h + this.y - this.boxTop;
}

/**
 * Executes the given function with variable arguments on the instance.
 * @type {function(function, ...*):void}
 */
function actionFunc(func, ...args) {
	func.apply(this, args);
}

/**
 * Executes the given Script with an array of arguments.
 * @type {function(string, Array):void}
 */
function script(s, args) {
	if (typeof s === "string") return window[s].apply(this, args);
	s.apply(this, args);
}

/**
 * Shows the value of the given variable of the instance, in the console.
 * @type {function(...*):void}
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
	draw: {
		setTarget: draw.setTarget,
		resetTarget: draw.resetTarget,
		getTarget: draw.getTarget,
		getContext: draw.getContext,
		clear: draw.clear,
		save: draw.save,
		restore: draw.restore,
		reset: draw.reset,
		setImageSmoothing: draw.setImageSmoothing,
		setColor: draw.setColor,
		sprite: draw.drawSprite,
		lives: draw.lives,
		spriteTiled: draw.spriteTiled,
		drawCanvas: draw.drawCanvas,
		setFont: draw.setFont,
		text: draw.text,
		transform: draw.transform,
		self: instance.drawSelf,
		debug: instance.drawDebug
	},
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
	chance = math.chance,
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
	instanceCheckCollision = instance.checkCollision,
	instanceCheckCollisionPoint = instance.checkCollisionPoint,
	message = args => console.log(args),
	alert = (m) => window.alert(m),
	confirm = (m) => window.confirm(m),
	drawSetColor = draw.setColor,
	drawSetFont = draw.setFont,
	drawSetFontSize = draw.setFontSize,
	drawText = draw.text,
	drawRectangle = draw.shape.rectangle,
	drawEllipse = draw.shape.ellipse,
	drawSelf = instance.drawSelf,
	drawSprite = draw.sprite,
	drawLives = draw.lives,
	soundPlay = (snd, loop) => Sound.play(snd, {loop: loop}),
	soundStop = Sound.stop;

//
export {
	chance,
	instanceCreate,
	instanceCreateMoving,
	instanceDestroy,
	instanceSetRotation,
	instanceSetDirection,
	instanceCheckCollision,
	instanceCheckCollisionPoint,
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
	drawLives,
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
