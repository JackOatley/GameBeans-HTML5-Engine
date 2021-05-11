import * as math from "./math.js";
import { mouse, triggerEvents } from "./inputs/input.js";
import object from "./object.js";
import sprite from "./sprite.js";
import * as Draw from "./draw.js";

const INSTANCE_HARD_LIMIT = 10000;

//
const instanceArray = [];
const otherStack = [];
var uniqueId = 1;
var doDepthSort = false;
var currentEvent = "";

//
class instance {

	static get instanceArray() { return instanceArray; }
	static set doDepthSort(x) { doDepthSort = x; }

	/**
	 * Create a new instance of an object.
	 * @param {string|Object} obj
	 * @param {number} x
	 * @param {number} y
	 * @return {?Object}
	 */
	static create(obj, x, y) {

		var o = object.get(obj);

		if (o === null) {
			window.addConsoleText("#F00", "Instance creation failed! No such object as " + obj + ".");
			return null;
		}

		if (instanceArray.length >= INSTANCE_HARD_LIMIT) {
			window.addConsoleText("#F00", "instance number hard limit reached:", INSTANCE_HARD_LIMIT);
			return null;
		}

		return new o(x, y);

	}

	/**
	 * @type {function(Object, number, number, number, number):Object}
	 */
	static createMoving(obj, x, y, speed, direction) {
		const newInst = instance.create(obj, x, y);
		newInst.speed = speed;
		newInst.direction = direction;
		return newInst;
	}

	/**
	 *
	 */
	static setup(inst, o, x, y) {

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
		executeEvent(inst, "create");
	}

	/**
	 * Finds instance n of the given object.
	 * @type {function(Object, number=):Object}
	 */
	static find(obj, n=0) {
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
	static findRandom(obj) {
		if (typeof obj === "function") obj = obj.objectName;
		const n = math.randomInt(0, count(obj) - 1);
		return find(obj, n);
	}

	/**
	 * Find the nearest instance of an object to a point.
	 * @type {function(number, number, Object!string):Object}
	 */
	static nearest(x, y, obj) {

		var all = [];
		if (!Array.isArray(obj)) {
			all.push(...(object.get(obj).getAllInstances()));
		} else {
			obj.forEach(o => {
				all.push(...(object.get(o).getAllInstances()));
			});
		}

		if (all.length === 0) { return null; }
		if (all.length === 1) { return all[0]; }
		let nrst, dist = 1e9, newDist;
		all.forEach(inst => {
			newDist = math.pointDistance(x, y, inst.x, inst.y);
			if (newDist < dist) {
				nrst = inst;
				dist = newDist;
			}
		});
		return nrst;
	}

	/**
	 * Find the furthest instance of an object from a point.
	 * @type {function(number, number, Object!string):Object}
	 */
	static furthest(x, y, obj) {
		let all = object.get(obj).getAllInstances();
		if (all.length === 0) return null;
		if (all.length === 1) return all[0];
		let frst, dist = 0, newDist;
		all.forEach(inst => {
			newDist = math.pointDistance(x, y, inst.x, inst.y);
			if (newDist > dist) {
				frst = inst;
				dist = newDist;
			}
		});
		return frst;
	}

	/**
	 * Returns the number of instances of a given object.
	 * @type {function(Object!string):number}
	 */
	static count(obj) {
		const name = object.get(obj).objectName;
		const length = instanceArray.length;
		let c = 0;
		for (let n = 0; n < length; n++) {
			c += (instanceArray[n].objectName === name);
		}
		return c;
	}

	/**
	 * @type {function(number, boolean):void}
	 */
	static setRotation(rotation, relative) {
		this.rotation = (relative) ? this.rotation + rotation : rotation;
	}

	/**
	 * @type {function(number, boolean):void}
	 */
	static setDirection(direction, relative) {
		this.direction = (relative) ? this.direction + direction : direction;
	}

	/** */
	static moveFree(speed, direction) {
		this.speed = speed;
		this.direction = direction;
	}

	/** Start moving in the direction of a given point. */
	static moveTowardsPoint(inst, x, y, spd) {
		inst.direction = math.pointDirection(inst.x, inst.y, x, y);
		inst.speed = spd;
	}

	/** Step towards the given point */
	static stepTowardsPoint(inst, x, y, spd) {
		let dir = math.pointDirection(inst.x, inst.y, x, y);
		let vec = math.lengthDir(spd, dir);
		inst.x += vec[0];
		inst.y += vec[1];
	}

	/**
	 * @type {function(Object, number, number):number}
	 */
	static distanceToPoint(inst, x, y) {
		return math.pointDistance(inst.x, inst.y, x, y);
	}

	/**
	 * @type {function(Object, Object):number}
	 */
	static distanceToInstance(inst1, inst2) {
		return math.pointDistance(inst1.x, inst1.y, inst2.x, inst2.y);
	}

	/** */
	static position(x, y, obj) {
		const all = object.get(obj).getAllInstances();
		const length = all.length;
		for (var n=0; n<length; n++) {
			const inst = all[n];
			if (instance.pointOn(x, y, inst)) {
				return inst;
			}
		}
		return null;
	}

	/** Returns whether the given point is over the given instance. */
	static pointOn(x, y, inst) {
		return !(inst.boxTop > y - Draw.offsetY
		|| inst.boxBottom < y - Draw.offsetY
		|| inst.boxLeft > x - Draw.offsetX
		|| inst.boxRight < x - Draw.offsetX);
	}

	/** */
	static mouseOn(inst) {
		return instance.pointOn(mouse.x, mouse.y, inst);
	}

	/**
	 * Execute step event.
	 * @param {Object} inst
	 * @return {void}
	 */
	static step(inst) {

		// Step events.
		executeEvent(inst, "step");
		updateAnimation(inst);
		updatePosition(inst);
		updateBoundingBox(inst);
		updateCollisionBox(inst);

		// Collision events.
		instanceExecuteListeners(inst);

		// Input events.
		triggerEvents.forEach(event => {
			executeEvent(inst, event);
		});

	}

	/** */
	static destroy(inst) {
		executeEvent(inst, "destroy");
		inst.exists = false;
	}

	/** */
	static uninstantiate(inst) {
		inst.exists = false;
		let arr = inst.object.instances;
		let index = arr.indexOf(inst);
		if (index >= 0) {
			arr[index] = arr[arr.length-1];
			arr.length -= 1;
		}
	}

	/** */
	static draw(inst) {
		if (!inst.visible) return;
		(inst.events["draw"])
			? executeEvent(inst, "draw")
			: instance.drawSelf(inst);
	}

	/**
	 * @param {Object} inst Instance to draw.
	 * @param {Object} [opts] Options object.
	 */
	static drawSelf(inst, opts) {
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
	static drawDebug(inst) {
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
	static changeSprite(sprite) {
		this.sprite = sprite;
	}

	/**
	 * Execute a particular event for all current instances.
	 * @param {string} event The event to execute.
	 * @param {Object} otherInst
	 * @return {void}
	 */
	static executeEventAll(event, otherInst) {
		var n = instanceArray.length;
		while (n--) {
			executeEvent(instanceArray[n], event, otherInst);
		}
	}

	/** */
	static stepAll() {
		newStep();
		let arr = instanceArray.slice();
		arr.forEach(function(inst) { executeEvent(inst, "stepBegin"); });
		arr.forEach(instance.step);
		arr.forEach(function(inst) { executeEvent(inst, "stepEnd"); });
		clearDestroyed();
	}

	/** */
	static drawAll() {
		if (doDepthSort) {
			instanceArray.sort(sortFunction);
		}
		instanceArray.forEach(instance.draw);
	}

	/** */
	static drawGuiAll() {
		var n = instanceArray.length;
		while (n--) {
			executeEvent(instanceArray[n], "drawGUI");
		}
	}

}

/** Resets some instance variables/states. */
function newStep() {
	let arr = instanceArray.slice();
	let i, n = arr.length;
	while (n--) {
		i = arr[n];
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
			instance.uninstantiate(i)
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
	inst.listeners.forEach((listener) => {
		if (listener.type === "collision") {
			instanceCollisionInstance(inst, listener.target);
		}
	});
}

/**
 * Execute an event for the given instance only.
 * @param {Object} inst
 * @param {event} event
 * @param {Object} otherInst The other instance, in collisions for example.
 * @return {void}
 */
function executeEvent(inst, event, otherInst) {

	// Set the current "other" instance.
	otherStack.push(window.other);
	window.other = otherInst;
	currentEvent = event;

	//
	try {
		if (inst.exists) {
			let actions = inst.events[event];
			if (actions) {
				executeActions(inst, actions, otherInst);
			}
		}
	}
	catch (err) {
		console.error(err);
		window.addConsoleText("#F00", "Failed to execute event [" + event + "]" + " of object [" + inst.objectName + "]" + " with error: " + err);
		window._GB_stop();
		return;
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
	for (let n = 0; n < arr.length; n++) {

		// If target doesn't exist, or is same instance
		const targ = arr[n];
		if (!targ.exists || inst === targ)
			continue;

		// No collision, boxes do not overlap.
		if (!boxOverlapBox(box1, targ.boxCollision))
			continue;

		executeEvent(inst, "collision_" + target, targ);

	}
}

/**
 *
 */
export const checkCollision = (inst, x, y, obj) => {
	if (!inst.exists) return false;
	const box1 = inst.boxCollision;
	const arr = getInstancesObject(obj);
	for (let n = 0; n < arr.length; n++) {
		const targ = arr[n];
		if (targ.exists && inst !== targ) {
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
	const arr = getInstancesObject(obj);
	for (let n = 0; n < arr.length; n++) {
		const targ = arr[n];
		if (targ.exists) {
			if (pointInBox(x, y, targ.boxCollision,)) {
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
	if (obj === "solid") return getAllSolid(obj);
	return object.getAllInstances(obj);
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

	for (var a=0; a<len; a++) {

		var action = actions[a];
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

// Fix this stuff
instance.checkCollision = checkCollision;
instance.checkCollisionPoint = checkCollisionPoint;

export default instance;
