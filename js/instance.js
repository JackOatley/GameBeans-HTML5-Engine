import * as math from "./math.js";
import { mouse, triggerEvents } from "./inputs/input.js";
import { GameObject } from "./object.js";
import sprite from "./sprite.js";
import * as Draw from "./draw.js";
import Room from "./room.js";

const INSTANCE_HARD_LIMIT = 10000;

//
export const instanceArray = [];
const otherStack = [];
let uniqueId = 1;
let doDepthSort = false;
let currentEvent = "";

export const setDepthSort = x  => doDepthSort = x;

/**
 * Create a new instance of an object.
 * @param {string|Object} obj
 * @param {number} x
 * @param {number} y
 * @return {?Object}
 */
export function create(obj, x, y, triggerEvent = true) {

	var o = GameObject.get(obj);

	if (o === null) {
		window.addConsoleText("#F00", "Instance creation failed! No such object as " + obj + ".");
		return null;
	}

	if (instanceArray.length >= INSTANCE_HARD_LIMIT) {
		window.addConsoleText("#F00", "instance number hard limit reached:", INSTANCE_HARD_LIMIT);
		return null;
	}

	const i = new o(x, y);
	if (triggerEvent) executeEvent(i, "create");
	return i;

}

/**
 * @type {function(Object, number, number, number, number):Object}
 */
export function createMoving(obj, x, y, speed, direction) {
	const i = create(obj, x, y, false);
	i.speed = speed;
	i.direction = direction;
	executeEvent(i, "create");
	return i;
}

/**
 *
 */
export function setup(inst, o, x, y) {

	inst.id = uniqueId++;
	inst.exists = true;
	inst.speed = 0;
	inst.object = o;
	inst.objectName = o.objectName;
	inst.assetType = "instance";
	inst.x = Number(x);
	inst.y = Number(y);
	inst.startX = inst.x;
	inst.startY = inst.y;
	inst.previousX = inst.x;
	inst.previousY = inst.y;
	inst.boxCollision = {};

	//
	const spr = sprite.get(inst.sprite);
	if (spr) {
		inst.boxCollision.x = spr.originX;
		inst.boxCollision.y = spr.originY;
		inst.boxCollision.width = spr.width;
		inst.boxCollision.height = spr.height;
	}

	//
	addToArray(inst);
	updateBoundingBox(inst);
	updateCollisionBox(inst);
}

/**
 * Finds instance n of the given object.
 * @type {function(Object, number=):Object}
 */
export function find(obj, n=0) {
	if (typeof obj === "function") obj = obj.objectName;
	const length = instanceArray.length;
	for (let i = 0, c = 0; i<length; i++) {
		const inst = instanceArray[i];
		if (inst.objectName === obj && c++ === n) {
			return inst;
		}
	}
	return null;
}

/**
 * @type {function(Object!string):Object}
 */
export function findRandom(obj) {
	if (typeof obj === "function") obj = obj.objectName;
	const n = math.randomInt(0, count(obj) - 1);
	return find(obj, n);
}

/**
 * Find the nearest instance of an object to a point.
 * @type {function(number, number, Object!string):Object}
 */
export function nearest(x, y, obj) {

	var all = [];
	if (!Array.isArray(obj)) {
		all.push(...(GameObject.get(obj).instances));
	} else {
		obj.forEach(o => {
			all.push(...(GameObject.get(o).instances));
		});
	}

	if (all.length === 0) { return null; }
	if (all.length === 1) { return all[0]; }
	let nrst, dist = 1e9, newDist;
	for (const inst of all) {
		newDist = math.pointDistance(x, y, inst.x, inst.y);
		if (newDist < dist) {
			nrst = inst;
			dist = newDist;
		}
	}
	return nrst;
}

/**
 * Find the furthest instance of an object from a point.
 * @type {function(number, number, Object!string):Object}
 */
export function furthest(x, y, obj) {
	const all = GameObject.get(obj).instances;
	if (all.length === 0) return null;
	if (all.length === 1) return all[0];
	let frst, dist = 0, newDist;
	for (const inst of all) {
		newDist = math.pointDistance(x, y, inst.x, inst.y);
		if (newDist > dist) {
			frst = inst;
			dist = newDist;
		}
	}
	return frst;
}

/**
 * Returns the number of instances of a given object.
 * @type {function(Object!string):number}
 */
export function count(obj) {
	return GameObject.get(obj)?.instances.length ?? 0;
}

/**
 * @type {function(number, boolean):void}
 */
export function setRotation(rotation, relative) {
	this.rotation = (relative) ? this.rotation + rotation : rotation;
}

/**
 * @type {function(number, boolean):void}
 */
export function setDirection(direction, relative) {
	this.direction = (relative) ? this.direction + direction : direction;
}

/** */
export function moveFree(speed, direction) {
	this.speed = speed;
	this.direction = direction;
}

/** Start moving in the direction of a given point. */
export function moveTowardsPoint(x, y, spd) {
	this.direction = math.pointDirection(this.x, this.y, x, y);
	this.speed = spd;
}

/** Step towards the given point */
export function stepTowardsPoint(x, y, spd) {
	let dir = math.pointDirection(this.x, this.y, x, y);
	let vec = math.lengthDir(spd, dir);
	this.x += vec[0];
	this.y += vec[1];
}

/**
 * @type {function(Object, number, number):number}
 */
export function distanceToPoint(x, y) {
	return math.pointDistance(this.x, this.y, x, y);
}

/**
 * @type {function(Object, Object):number}
 */
export function distanceToInstance(i1, i2) {
	return math.pointDistance(i1.x, i1.y, i2.x, i2.y);
}

/** */
export function position(x, y, obj) {
	const all = GameObject.get(obj).instances;
	for (const inst of all) {
		if (pointOn(x, y, inst)) {
			return inst;
		}
	}
	return null;
}

/** Returns whether the given point is over the given instance. */
export function pointOn(x, y, inst) {
	return !(inst.boxTop > y - Draw.offsetY
	|| inst.boxBottom < y - Draw.offsetY
	|| inst.boxLeft > x - Draw.offsetX
	|| inst.boxRight < x - Draw.offsetX);
}

/** */
export function mouseOn(i) {
	return pointOn(mouse.x, mouse.y, i);
}

/**
 * Execute step event.
 * @param {Object} inst
 * @return {void}
 */
export function step(inst) {

	// Step events.
	executeEvent(inst, "step");
	updateAnimation(inst);
	updatePosition(inst);
	updateBoundingBox(inst);
	updateCollisionBox(inst);

	// Outside room.
	if (inst.events["outsideroom"]) {
		if (inst.boxBottom < 0
		||  inst.boxRight < 0
		||  inst.boxTop > Room.current.height
		||  inst.boxLeft > Room.current.width) {
			executeEvent(inst, "outsideroom");
		}
	}

	// Event listeners.
	instanceExecuteListeners(inst);

	// Input events.
	triggerEvents.forEach(event => {
		executeEvent(inst, event);
	});

}

/** */
export function destroy(inst) {
	executeEvent(inst, "destroy");
	inst.exists = false;
}

/** */
export function uninstantiate(inst) {
	inst.exists = false;
	let arr = inst.object.instances;
	let index = arr.indexOf(inst);
	if (index >= 0) {
		arr[index] = arr[arr.length-1];
		arr.length -= 1;
	}
}

/** */
export function draw(inst) {
	if (!inst.visible) return;
	(inst.events["draw"])
		? executeEvent(inst, "draw")
		: drawSelf(inst);
}

/**
 * @param {Object} inst Instance to draw.
 * @param {Object} [opts] Options object.
 */
export function drawSelf(inst, opts) {
	if (inst.sprite === null) return;
	Draw.drawSprite(
		inst.sprite,
		inst.index,
		inst.x, inst.y,
		inst.scaleX, inst.scaleY,
		inst.rotation,
		opts
	);
}

/** */
export function drawDebug(inst) {
	let box = inst.boxCollision;
	Draw.shape.rectangle(
		box.left,
		box.top,
		box.right - box.left,
		box.bottom - box.top, {
			color: "rgba(255,0,0,0.5)"
		}
	);
}

/** */
export function changeSprite(sprite, index = 0, speed = 1) {
	this.sprite = sprite;
	this.index = index;
	this.imageSpeed = speed;
}

/**
 * Execute a particular event for all current instances.
 * @type {function(string, Object):void}
 */
export function executeEventAll(event, otherInst) {
	for (const i of instanceArray)
		executeEvent(i, event, otherInst);
}

/** */
export function stepAll() {
	newStep();
	let arr = instanceArray.slice();
	arr.forEach(inst => executeEvent(inst, "stepBegin"));
	arr.forEach(step);
	arr.forEach(inst => executeEvent(inst, "stepEnd"));
	clearDestroyed();
}

/** */
export function drawAll() {
	if (doDepthSort) instanceArray.sort(sortFunction);
	instanceArray.forEach(draw);
}

/** */
export function drawGuiAll() {
	for (const i of instanceArray)
		executeEvent(i, "drawGUI");
}

/**
 *
 */
export function directionToPoint(x, y, s) {
	const to = math.pointDirection(this.x, this.y, x, y);
	const diff = math.angleDifference(this.direction, to);
	const max = Math.min(s, Math.abs(diff));
	this.direction += max * Math.sign(diff);
}

/** Resets some instance variables/states. */
function newStep(i) {
	for (const i of instanceArray) {
		i.previousX = i.x;
		i.previousY = i.y;
	}
}

/** */
function updatePosition(inst) {

	// if the instance is already falling at terminal velocity then we no longer apply gravity
	let gravVector = {
		x: math.lengthDirX(inst.terminal, inst.gravityDirection),
		y: math.lengthDirY(inst.terminal, inst.gravityDirection)
	};

	if (gravVector.x > 0 && inst.speedX <= gravVector.x
	|| gravVector.x < 0 && inst.speedX >= gravVector.x) {
		inst.speedX += math.lengthDirX(inst.gravity, inst.gravityDirection);
	}

	if (gravVector.y > 0 && inst.speedY <= gravVector.y
	|| gravVector.y < 0 && inst.speedY >= gravVector.y) {
		inst.speedY += math.lengthDirY(inst.gravity, inst.gravityDirection);
	}

	// move instance
	inst.x += inst.speedX;
	inst.y += inst.speedY;

}

/**
 * Update the instance's bounding box.
 * @param {Object} i Instance.
 * @return {void}
 */
function updateBoundingBox(i) {
	const spr = sprite.get(i.sprite);
	if (!spr) return;
	i.boxTop = i.y - spr.originY * i.scaleY;
	i.boxLeft = i.x - spr.originX * i.scaleX;
	i.boxBottom = i.boxTop + spr.height * i.scaleY;
	i.boxRight = i.boxLeft + spr.width * i.scaleX;
}

/**
 * Update the instance's collision box.
 * @param {Object} i Instance.
 * @return {void}
 */
function updateCollisionBox(i) {
	const box = i.boxCollision;
	box.top = i.y - box.y * i.scaleY;
	box.left = i.x - box.x * i.scaleX;
	box.bottom = box.top + box.height * i.scaleY;
	box.right = box.left + box.width * i.scaleX;
}

/**
 * Update the instance's animation.
 * @param {Object} inst Instance.
 * @return {void}
 */
function updateAnimation(inst) {

	inst.index += inst.imageSpeed;
	let spr = sprite.get(inst.sprite);
	if (spr) {
		let length = spr.images.length;
		if (inst.index >= length) {

			let behavior = inst.animationBehavior;
			let type = typeof behavior;

			//
			if (type === "string") {

				//
				if (behavior === "loop") {
					inst.index -= length;
				}
				else if (behavior === "stop") {
					inst.index = length - 1;
					inst.imageSpeed = 0;
				}

			}

			//
			else if (type === "function") {
				behavior.call(inst);
			}

		}
	}

}

/**
 * @param {Object} inst Instance.
 * @return {void}
 */
function addToArray(inst) {
	const length = instanceArray.length;
	for (var i=0; i<length; i++) {
		if (inst.depth > instanceArray[i].depth) {
			instanceArray.splice(i, 0, inst);
			return;
		}
	}
	instanceArray.push(inst);
}

/**
 * Returns all instances set as "solid".
 * @return {Array<Object>}
 */
function getAllSolid() {
	var arr = [];
	var i, n = instanceArray.length;
	while (i = instanceArray[--n]) {
		if (i.solid) {
			arr.push(i);
		}
	}
	return arr;
}

/**
 * Remove isntances that have been requested to be destroyed.
 * @return {void}
 */
function clearDestroyed() {
	var l = instanceArray.length;
	var i, n = l;
	while (i = instanceArray[--n]) {
		if (!i.exists) {
			uninstantiate(i)
			i.object.pool.release(i);
			instanceArray[n] = instanceArray[--l];
		}
	}
	instanceArray.length = l;
}

/**
 * The function used for instance depth ordering. Sorts by ID is depth same.
 * @param {Object} a Instance.
 * @param {Object} b Instance.
 * @return {number} 0, -1 or 1.
 */
const sortFunction = (a, b) =>
	(a.depth === b.depth) ? a.id - b.id : a.depth - b.depth;

/**
 * @param {Object} inst Instance.
 * @return {void}
 */
function instanceExecuteListeners(inst) {
	for (const l of inst.listeners) {
		switch (l.type) {
			case ("outsideroom"): outsideRoom(inst); break;
			case ("collision"): instanceCollisionInstance(inst, l.target); break;
		}
	}
}

/**
 * Execute an event for the given instance only.
 * TODO: This try catch setup has got to be slow, right?
 * @type {function(Object, Object, Object):return}
 */
function executeEvent(inst, event, otherInst) {

	// Set the current "other" instance.
	otherStack.push(window.other);
	window.other = otherInst;
	currentEvent = event;

	//
	try {
		if (inst.exists) {
			const actions = inst.events[event];
			if (actions) {
				executeActions(inst, actions, otherInst);
			}
		}
	}
	catch (err) {
		console.error(err);
		window.addConsoleText("#F00", "Failed to execute event [" + event + "]" + " of object [" + inst.objectName + "]" + " with error: " + err);
		return window._GB_stop();
	}

	// Restore previous "other" instance.
	window.other = otherStack.pop();

}

/**
 * @type {function(Object, Object|string):void}
 */
function instanceCollisionInstance(inst, target) {
	if (!inst.exists) return;
	const box1 = inst.boxCollision;
	const arr = getInstancesObject(target);
	for (const targ of arr) {
		if (targ.exists								// Target doesn't exist.
		&& inst !== targ							// Same instance.
		&& boxOverlapBox(box1, targ.boxCollision))	// No collision.
			executeEvent(inst, "collision_" + target, targ);
	}
}

/**
 * @type {function(Object):void}
 */
export const outsideRoom = i => {
	if (i.boxBottom < 0
	||  i.boxRight < 0
	||  i.boxTop > Room.current.height
	||  i.boxLeft > Room.current.width)
		executeEvent(i, "outsideroom");
}

/**
 *
 */
export const checkCollision = (i, x, y, obj) => {
	if (!i.exists) return false;
	const box1 = i.boxCollision;
	const arr = getInstancesObject(obj);
	for (const targ of arr) {
		if (targ.exists && i !== targ) {
			if (boxOverlapBox(box1, targ.boxCollision, x, y)) {
				return true;
			}
		}
	}
	return false;
}

/**
 *
 */
export const checkCollisionPoint = (obj, x, y) => {
	let arr = [obj];
	if (obj.assetType !== "instance")
		arr = getInstancesObject(obj);
	for (let n = 0; n < arr.length; n++) {
		const targ = arr[n];
		if (targ.exists) {
			if (pointInBox(x, y, targ.boxCollision)) {
				return true;
			}
		}
	}
	return false;
}

/**
 * Returns an array of instances of the given object. If the object provided is
 * is a string constaining "solid", all instances of solid objects are returned.
 * @type {function(Object|string):Array}
 */
const getInstancesObject = obj => {
	if (obj === "solid") return getAllSolid();
	return GameObject.get(obj).instances;
}

/**
 * @type {function(Object, Object):boolean}
 */
const boxOverlapBox = (b1, b2, x1=0, y1=0) => {
	return (!((x1 + b1.left) > b2.right
	|| (x1 + b1.right) < b2.left
	|| (y1 + b1.top) > b2.bottom
	|| (y1 + b1.bottom) < b2.top));
}

/**
 * @type {function(Object, Object):boolean}
 */
const pointInBox = (x, y, b) => {
	return (!(x > b.right || x < b.left || y > b.bottom || y < b.top));
}

/**
 * @type {function(Object, Array, Object):void}
 */
function executeActions(inst, actions, otherInst) {
	const steps = [];
	var condition = true;
	var executeIfElse = [false];
	var scope = 0;
	var len = actions.length;

	for (const action of actions) {

		switch (action.flow) {

			// regular action
			case (""):
				if (!condition) break;
				const newCondition = action.cache.call(inst);
				if (newCondition === true || newCondition === false)  {
					executeIfElse[scope] = false;
					condition = newCondition;
					steps[scope] = 0;
					if (condition === false) {
						executeIfElse[scope] = true;
					}
				}
				break;

			// control actions
			case ("ifElse"):
				if (executeIfElse[scope]) {
					steps[scope] = 0;
					condition = true;
				} else {
					condition = false;
				}
			break;
			case ("blockBegin"): scope++; break;
			case ("blockEnd"): scope--; break;
			case ("exitEvent"): if (condition) return false;

		}

		// exit from a single statement after an expression not contained in a block
		if (steps[scope]++ === 1) {
			condition = true;
		}

	}

}
