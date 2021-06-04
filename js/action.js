import * as App from "./App.js";
import Room from "./room.js";
import {Sound} from "./Sound.js";
import * as draw from "./draw.js";
import * as instance from "./instance.js";
import * as input from "./inputs/input.js";
import * as math from "./math.js";
import {Sprite} from "./sprite.js";
import Canvas from "./Canvas.js";
import * as Color from "./Color.js";
import * as main from "./main.js";
import {Camera} from "./camera.js";
import Grid from "./data/grid.js";
import Tilemap from "./tilemap.js";
import tween from "./tween.js";
import Transition from "./transition.js";
import Font from "./font.js";
import {GameObject} from "./object.js";
import Primitive from "./drawing/primitive.js";
import Vector2 from "./Vector2.js";

// Set the variable with the given name.
export function set(varName, value, relative, global) {
	const target = global ? window.global : this;
	if (relative) return target[varName] += value;
	target[varName] = value;
}

// Set the variable with the given name.
export function setProperty(object, property, value, relative) {
	if (relative) return object[property] += value;
	object[property] = value;
}

// Intended to be equivalent to an if statement.
export function test(varName, op, value, global) {
	const target = global ? window.global : this;
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

// Sets the instance's gravity to the given value.
export function setGravity(value) {
	this.gravity = value;
}

// Instantly sets the instance's x and y values to a random position within
// the current room.
export function jump(x, y, relative) {
	if (!relative) return [this.x, this.y] [Number(x), Number(y)];
	this.x += Number(x);
	this.y += Number(y);
}

// Instantly sets the instance's x and y values to a random position within
// the current room.
export function jumpRandom() {
	const x1 = 0, y1 = 0, x2 = Room.current.width, y2 = Room.current.height;
	this.x = Math.floor(Math.random() * (x2 - x1)) + x1;
	this.y = Math.floor(Math.random() * (y2 - y1)) + y1;
}

//
export function moveSpeedX(speed) {
	this.speedX = Number(speed);
}

//
export function moveSpeedY(speed) {
	this.speedY = Number(speed);
}

//
export function moveReverseX() {
	this.speedX = -this.speedX;
}

//
export function moveReverseY() {
	this.speedY = -this.speedY;
}

// Wraps the instance back into the room when it leaves.
export function wrap() {
	const w = this.boxRight - this.boxLeft;
	const h = this.boxBottom - this.boxTop;
	const rw = Room.current.width;
	const rh = Room.current.height;
	if (this.boxRight < 0) this.x += rw + w;
	if (this.boxBottom < 0) this.y += rh + h;
	if (this.boxLeft > rw) this.x -= rw + w;
	if (this.boxTop > rh) this.y -= rh + h;
}

// Wraps the instance back into the room when it leaves.
export function confine() {
	const w = this.boxRight - this.boxLeft;
	const h = this.boxBottom - this.boxTop;
	const rw = Room.current.width;
	const rh = Room.current.height;
	if (this.boxLeft < 0) this.x = this.x - this.boxLeft;
	if (this.boxTop < 0) this.y = this.y - this.boxTop;
	if (this.boxRight > rw) this.x = rw - w + this.x - this.boxLeft;
	if (this.boxBottom > rh) this.y = rh - h + this.y - this.boxTop;
}

// Executes the given function with variable arguments on the instance.
export function func(f, ...args) {
	f.apply(this, args);
}

// Executes the given Script with an array of arguments.
export function script(s, args)
{
	if (typeof s === "string")
		return window[s].apply(this, args);
	return s.apply(this, args);
}

// Shows the value of the given variable of the instance, in the console.
export function get(...args) {
	console.log(this[args].toFixed(2));
}

// Fucntions for use in code.
export const GAME = {
	App,
	Camera,
	Canvas,
	Color,
	main: {
		start: main.start,
		setGameSpeed: main.setGameSpeed
	},
	instance: instance,
	draw: {
		shape: {
			rectangle: draw.shape.rectangle,
			ellipse: draw.shape.ellipse,
			healthBar: draw.shape.healthBar
		},
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
		scale: draw.scale,
		rotate: draw.rotate,
		translate: draw.translate,
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
	math,
	Font: Font,
	Grid: Grid,
	Tilemap: Tilemap,
	tween: tween,
	Transition: Transition,
	Object: GameObject,
	Primitive: Primitive,
	Vector2: Vector2
}

// Control actions.
export const blockBegin = "blockBegin";
export const blockEnd = "blockEnd";
export const exitEvent = "exitEvent";
export const ifElse = "ifElse";
export const chance = math.chance;
export const roomEnter = Room.enter;
export const roomNext = Room.next;
export const roomPrevious = Room.previous;
export const setGameSpeed = main.setGameSpeed;
export const restart = App.restart;
export const setCursor = App.setCursor;

// Debug actions.
export const message = args => console.log(args);
export const alert = m => window.alert(m);
export const confirm = m => window.confirm(m);

// Instance actions.
export const instanceCreate = instance.create;
export const instanceCreateMoving = instance.createMoving;
export const moveFree = instance.moveFree;
export const instanceDestroy = instance.destroy;
export const changeSprite = instance.changeSprite;
export const instanceSetRotation = instance.setRotation;
export const instanceSetDirection = instance.setDirection;
export const instanceCheckCollision = instance.checkCollision;
export const instanceCheckCollisionPoint = instance.checkCollisionPoint;
export const directionToPoint = instance.directionToPoint;
export const drawSelf = instance.drawSelf;
export const drawDebug = instance.drawDebug;

// Drawing actions.
export const drawSetColor = draw.setColor;
export const drawSetFont = draw.setFont;
export const drawSetFontSize = draw.setFontSize;
export const drawText = draw.text;
export const drawRectangle = draw.shape.rectangle;
export const drawHealthBar = draw.shape.healthBar;
export const drawEllipse = draw.shape.ellipse;
export const drawSprite = draw.drawSprite;
export const drawSetShadow = draw.setShadow;
export const drawLives = draw.lives;

// Sound actions.
export const soundPlay = (snd, loop) => Sound.play(snd, {loop: loop});
export const soundStop = Sound.stop;
