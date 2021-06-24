import * as math from "./math.js";
import {mouse, triggerEvents} from "./inputs/input.js";
import * as Draw from "./draw.js";
import {currentRoom} from "./room.js";

const INSTANCE_HARD_LIMIT = 10000;

//
export const instanceArray = [];
const otherStack = [];
let uniqueId = 1;
let doDepthSort = false;
let currentEvent = "";

export const setDepthSort = x  => doDepthSort = x;

/*
 * Create a new instance of an object.
 */
export function create(o, x, y, opts = {})
{
	if (instanceArray.length >= INSTANCE_HARD_LIMIT) {
		window._gbide_error("instance number hard limit reached:", INSTANCE_HARD_LIMIT);
		return undefined;
	}

	return new o(x, y, opts);
}

/*
 *
 */
export function createMoving(obj, x, y, speed, direction)
{
	return create(obj, x, y, {speed, direction});
}

/*
 *
 */
export function createRandom(o1, o2, o3, o4, x, y)
{
	if (!o1 && !o2 && !o3 && !o4) {
		window._gbide_error("Create Random action needs at least one possible object to create.");
		return undefined;
	}

	let o;
	while (!o)
		o = math.choose(o1, o2, o3, o4);
	return create(o, x, y);
}

/*
 *
 */
export function setup(inst, o, x, y, opts)
{
	inst.direction = 0;
	inst.rotation = 0;
	inst.scaleX = 1;
	inst.scaleY = 1;
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
	inst.wasInRoomBounds = false;
	inst.inRoomBounds = false;
	inst.boxCollision = {};
	Object.assign(inst, opts);

	//
	const spr = inst.sprite;
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

/*
 * Finds instance n of the given object.
 */
export function find(obj, n=0)
{
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

/*
 * Find and return a random instance of the given object.
 */
export function findRandom(obj)
{
	if (typeof obj === "function") obj = obj.objectName;
	const n = math.randomInt(0, count(obj) - 1);
	return find(obj, n);
}

/*
 * Find the nearest instance of an object to a point.
 */
export function nearest(x, y, obj)
{
	const all = [];
	if (!Array.isArray(obj)) {
		all.push(...obj.instances);
	} else {
		obj.forEach(o => {
			all.push(...o.instances);
		});
	}

	if (all.length === 0) return undefined;
	if (all.length === 1) return all[0];
	let nrst, dist = 1e9;
	for (const inst of all) {
		const newDist = math.pointDistance(x, y, inst.x, inst.y);
		if (newDist < dist) {
			nrst = inst;
			dist = newDist;
		}
	}
	return nrst;
}

/*
 * Find the furthest instance of an object from a point.
 */
export function furthest(x, y, obj)
{
	const all = obj.instances;
	if (all.length === 0) return undefined;
	if (all.length === 1) return all[0];
	let frst, dist = -1;
	for (const inst of all) {
		const newDist = math.pointDistance(x, y, inst.x, inst.y);
		if (newDist > dist) {
			frst = inst;
			dist = newDist;
		}
	}
	return frst;
}

/*
 * Returns the number of instances of a given object.
 */
export function count(obj)
{
	return obj?.instances.length ?? 0;
}

//
export function setRotation(rotation, relative)
{
	this.rotation = relative ? this.rotation + rotation : rotation;
}

//
export function setDirection(direction, relative)
{
	this.direction = relative ? this.direction + direction : direction;
}

//
export function moveFree(speed, direction)
{
	this.speed = speed;
	this.direction = direction;
}

// Start moving in the direction of a given point.
export function moveTowardsPoint(x, y, spd)
{
	this.direction = math.pointDirection(this.x, this.y, x, y);
	this.speed = spd;
}

// Step towards the given point.
export function stepTowardsPoint(x, y, spd)
{
	let dir = math.pointDirection(this.x, this.y, x, y);
	let vec = math.lengthDir(spd, dir);
	this.x += vec[0];
	this.y += vec[1];
}

//
export function distanceToPoint(x, y)
{
	return math.pointDistance(this.x, this.y, x, y);
}

//
export function distanceToInstance(i1, i2)
{
	return math.pointDistance(i1.x, i1.y, i2.x, i2.y);
}

//
export function position(x, y, obj)
{
	for (const inst of obj.instances)
		if (pointOn(x, y, inst))
			return inst;
	return undefined;
}

// Returns whether the given point is over the given instance.
export function pointOn(x, y, inst)
{
	return !(inst.boxTop > y - Draw.offsetY
	|| inst.boxBottom < y - Draw.offsetY
	|| inst.boxLeft > x - Draw.offsetX
	|| inst.boxRight < x - Draw.offsetX);
}

//
export function mouseOn(i)
{
	return pointOn(mouse.x, mouse.y, i);
}

//
export function stepBegin(i)
{
	executeEvent(i, "stepBegin");
}

/*
 * Execute step event.
 */
export function step(inst)
{
	if (!inst.exists) return;

	// Step events.
	executeEvent(inst, "step");
	updateAnimation(inst);
	updatePosition(inst);
	updateBoundingBox(inst);
	updateCollisionBox(inst);

	// Outside room.
	inst.inRoomBounds = getInRoomBounds(inst);
	if (!inst.inRoomBounds && inst.events["outsideroom"])
		executeEvent(inst, "outsideroom");

	if (!inst.inRoomBounds && inst.wasInRoomBounds)
		executeEvent(inst, "leaveroombounds");

	instanceExecuteListeners(inst);

	// Input events.
	triggerEvents.forEach(event => {
		executeEvent(inst, event);
	});
}

//
export function stepEnd(i)
{
	executeEvent(i, "stepEnd");
}

//
export function destroy(inst)
{
	executeEvent(inst, "destroy");
	inst.exists = false;
}

/*
 * Remove the instance without triggering the destroy event.
 */
export function uninstantiate(inst)
{
	inst.exists = false;
	const arr = inst.object.instances;
	const index = arr.indexOf(inst);
	if (index >= 0) {
		arr[index] = arr[arr.length-1];
		arr.length -= 1;
	}
}

/*
 * Draw the given instance if it's visible. If the draw eveny is defined then
 * that is used, otherwise the instance is drawn using it's own settings (see
 * drawSelf).
 */
export function draw(inst)
{
	if (!inst.visible) return;
	if (!inst.events["draw"]) return drawSelf(inst);
	executeEvent(inst, "draw");
}

/*
 * Draw the given instance with it's own settings.
 */
export function drawSelf(inst, opts)
{
	if (!inst.sprite) return;
	Draw.drawSprite(
		inst.sprite,
		inst.index,
		inst.x, inst.y,
		inst.scaleX, inst.scaleY,
		inst.rotation,
		opts
	);
}

/*
 * Draw collision information for the given instance.
 */
export function drawDebug(inst)
{
	const {left, top, right, bottom} = inst.boxCollision;
	const width = right - left;
	const height = bottom - top;
	const color = "rgba(255,0,0,0.5)";
	Draw.shape.rectangle(left, top, width, height, {color});
}

/*
 * Align the instance to a grid with the given cell width and height.
 */
export function gridAlign(w, h)
{
	this.x = Math.round(this.x / w) * w;
	this.y = Math.round(this.y / h) * h;
}

/*
 * Check if the instance is aligned to a grid with the given cell width and
 * height.
 */
export function checkGridAlign(w, h)
{
	const xa = this.x === Math.round(this.x / w) * w;
	const ya = this.y === Math.round(this.y / h) * h;
	return xa && ya;
}

/*
 *
 */
export function changeSprite(sprite, index = 0, speed = 1)
{
	this.sprite = sprite;
	this.index = index;
	this.imageSpeed = speed;
}

/*
 *
 */
export function transformSprite(scaleX = 1, scaleY = 1, rotation = 0)
{
	this.scaleX = scaleX;
	this.scaleY = scaleY;
	this.rotation = rotation;
}

/*
 * Execute a particular event for all current instances.
 */
export function executeEventAll(e, other)
{
	for (const i of instanceArray)
		executeEvent(i, e, other);
}

/*
 * A new array is created so that if any instances are created during any of the
 * step events then they are not included in the next event until a fresh tick.
 */
export function stepAll()
{
	newStep();
	const arr = instanceArray.slice();
	arr.forEach(stepBegin);
	arr.forEach(step);
	arr.forEach(stepEnd);
	clearDestroyed();
}

/*
 *
 */
export function drawAll()
{
	if (doDepthSort)
		instanceArray.sort(sortFunction);
	instanceArray.forEach(draw);
}

/*
 *
 */
export function drawGuiAll()
{
	for (const i of instanceArray)
		executeEvent(i, "drawGUI");
}

/*
 *
 */
export function directionToPoint(x, y, s)
{
	const to = math.pointDirection(this.x, this.y, x, y);
	const diff = math.angleDifference(this.direction, to);
	const max = Math.min(s, Math.abs(diff));
	this.direction += max * Math.sign(diff);
}

/*
 * Resets some instance variables/states.
 */
function newStep(i)
{
	for (const i of instanceArray) {
		i.wasInRoomBounds = i.inRoomBounds;
		i.previousX = i.x;
		i.previousY = i.y;
	}
}

/*
 *
 */
function updatePosition(inst)
{
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

	inst.x += inst.speedX;
	inst.y += inst.speedY;
}

/*
 * Update the instance's bounding box.
 */
function updateBoundingBox(i)
{
	const spr = i.sprite;
	if (!spr) {
		i.boxTop = i.y;
		i.boxLeft = i.x;
		i.boxBottom = i.y;
		i.boxRight = i.x;
	} else {
		i.boxTop = i.y - spr.originY * i.scaleY;
		i.boxLeft = i.x - spr.originX * i.scaleX;
		i.boxBottom = i.boxTop + spr.height * i.scaleY;
		i.boxRight = i.boxLeft + spr.width * i.scaleX;
	}
}

/*
 * Update the instance's collision box.
 */
function updateCollisionBox(i)
{
	const box = i.boxCollision;
	box.top = i.y - box.y * i.scaleY;
	box.left = i.x - box.x * i.scaleX;
	box.bottom = box.top + box.height * i.scaleY;
	box.right = box.left + box.width * i.scaleX;
}

/*
 * Update the instance's animation.
 */
function updateAnimation(inst)
{
	inst.index += inst.imageSpeed;
	let spr = inst.sprite;
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

/*
 *
 */
function addToArray(inst)
{
	const length = instanceArray.length;
	for (var i=0; i<length; i++) {
		if (inst.depth > instanceArray[i].depth) {
			instanceArray.splice(i, 0, inst);
			return;
		}
	}
	instanceArray.push(inst);
}

/*
 * Returns all instances.
 */
function getAll()
{
	return instanceArray.filter(i => true);
}

/*
 * Returns all instances set as "solid".
 */
function getAllSolid()
{
	return instanceArray.filter(i => i.solid);
}

/*
 * Remove isntances that have been requested to be destroyed.
 */
function clearDestroyed()
{
	var l = instanceArray.length;
	var i, n = l;
	while (i = instanceArray[--n]) {
		if (i.exists) continue;
		uninstantiate(i)
		i.object.pool.release(i);
		instanceArray[n] = instanceArray[--l];
	}
	instanceArray.length = l;
}

/*
 * The function used for instance depth ordering. Sorts by ID if depth same.
 * Returns a number of 0, -1 or 1.
 */
function sortFunction(a, b)
{
	return (a.depth === b.depth) ? a.id - b.id : a.depth - b.depth;
}

/*
 *
 */
function instanceExecuteListeners(inst)
{
	for (const l of inst.listeners) {
		switch (l.type) {
		case ("outsideroom"): outsideRoom(inst); break;
		case ("collision"): instanceCollisionInstance(inst, l.target); break;
		}
	}
}

/*
 * Execute an event for the given instance only.
 */
function executeEvent(inst, event, otherInst)
{
	otherStack.push(window.other);
	window.other = otherInst;
	currentEvent = event;

	//
	breakTo: try {
		if (!inst.exists) break breakTo;
		const actions = inst.events[event];
		if (actions) executeActions(inst, actions);
	}
	catch (err) {
		console.error(err);
		window._gbide_error("Failed to execute event [" + event + "]" + " of object [" + inst.objectName + "]" + " with error: " + err);
		return window._GB_stop();
	}

	// Restore previous "other" instance.
	window.other = otherStack.pop();
}

/*
 *
 */
function instanceCollisionInstance(inst, target)
{
	if (!inst.exists) return;
	const box1 = inst.boxCollision;
	const arr = getInstancesObject(target);
	for (const targ of arr) {
		if (targ.exists
		&& inst !== targ
		&& boxOverlapBox(box1, targ.boxCollision)) {
			const name = target.objectName ?? target;
			executeEvent(inst, "collision_" + name, targ);
		}
	}
}

/*
 *
 */
export function outsideRoom(i)
{
	if (i.boxBottom < 0
	||  i.boxRight < 0
	||  i.boxTop > currentRoom.height
	||  i.boxLeft > currentRoom.width)
		executeEvent(i, "outsideroom");
}

/*
 *
 */
export function checkCollision(i, x, y, obj, not = false)
{
	not = not == true; /** TODO: Remove the need for this conversion */
	if (!i.exists) return not;
	const box1 = i.boxCollision;
	const arr = getInstancesObject(obj);
	for (const targ of arr) {
		if (targ.exists && i !== targ) {
			if (boxOverlapBox(box1, targ.boxCollision, x, y)) {
				return !not;
			}
		}
	}
	return not;
}

/*
 *
 */
export function checkCollisionPoint(obj, x, y, not = false)
{
	not = not == true; /** TODO: Remove the need for this conversion */
	let arr = [obj];
	if (obj.assetType !== "instance")
		arr = getInstancesObject(obj);
	for (const targ of arr) {
		if (targ.exists) {
			if (pointInBox(x, y, targ.boxCollision)) {
				return !not;
			}
		}
	}
	return not;
}

/*
 * Returns an array of instances of the given object. If the object provided is
 * is a string constaining "solid", all instances of solid objects are returned.
 */
function getInstancesObject(obj)
{
	if (obj === "all") return getAll();
	if (obj === "solid") return getAllSolid();
	return obj.instances;
}

/*
 *
 */
function boxOverlapBox(b1, b2, x1=0, y1=0)
{
	if (isNaN(b2.right)) return false;
	return (!((x1 + b1.left) > b2.right
	|| (x1 + b1.right) < b2.left
	|| (y1 + b1.top) > b2.bottom
	|| (y1 + b1.bottom) < b2.top));
}

/*
 *
 */
function pointInBox(x, y, b)
{
	return (!(x > b.right || x < b.left || y > b.bottom || y < b.top));
}

/*
 *
 */
function getInRoomBounds(i)
{
	return !(i.boxBottom < 0 ||  i.boxRight < 0
	||  i.boxTop > currentRoom.height ||  i.boxLeft > currentRoom.width);
}

//
function executeActions(inst, actions)
{
	for (const action of actions)
		action.cache.call(inst);
}
