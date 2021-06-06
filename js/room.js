import { Camera } from "./camera.js";
import Generator from "./generator.js";
import Transition from "./transition.js";
import * as instance from "./instance.js";
import * as drawing from "./draw.js";

//
export let currentRoom = null;
export let transition = false;

/**
 *
 */
export class Room {

	/**
	 * @param {string} name
	 * @param {number} width
	 * @param {number} height
	 */
	constructor(name, width, height) {
		this.name = name;
		this.width = Number(width);
		this.height = Number(height);
		this.background = null;
		this.backgroundX = 0;
		this.backgroundY = 0;
		this.backgroundFrame = 0;
		this.backgroundAnimate = false;
		this.backgroundAnimateSpeed = 1;
		this.backgroundMethod = "no-repeat";
		this.backgroundColor = "#FF0000";
		this.instances = [];
		Room.names.push(name);
		Room.array.push(this);
		if (currentRoom === null)
			currentRoom = Room.current = this;
	}

	/**
	 * @param {string} spr
	 * @return {void}
	 */
	setBackground(spr) {
		this.background = spr;
	}

	/**
	 * @param {string} inst Name of the instance to add.
	 * @param {number} x
	 * @param {number} y
	 * @return {void}
	 */
	addInstance(inst, x, y) {
		if (typeof inst === "object") inst = inst.objectName;
		this.instances.push({name: inst, x: x, y: y});
	}

	/**
	 * @param {object} [opts={}]
	 * @return {void}
	 */
	enter(opts) {
		enter(this, opts);
	}

	/**
	 * @return {void}
	 */
	draw() {
		draw(this);
	}

	static draw = draw;
	static enter = enter;
	static next = next;
	static previous = previous;
	static getByName = getByName;
}

export function draw(room)
{
	drawing.clear(room.backgroundColor, room.backgroundAlpha);

	const spr = room.background;
	if (spr === null) return;

	const frame = room.backgroundFrame;
	const animate = room.backgroundAnimate;
	let index = frame;
	if (animate) {
		room.backgroundFrame += room.backgroundAnimateSpeed;
		index = ~~(room.backgroundFrame % spr.images.length);
	}

	const image = spr.images[index].img;

	const canvas = drawing.target.domElement;
	const ctx = drawing.context;
	if (room.backgroundMethod === "stretch" ) {
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		return;
	}

	// Iso patterns.
	if (room.backgroundMethod.indexOf("iso-") !== -1) {
		return drawIsometricBackground(room, ctx, spr, index);
	}

	// Regular patterns.
	ctx.save();
	ctx.translate(room.backgroundX, room.backgroundY);
	ctx.fillStyle = ctx.createPattern(image, room.backgroundMethod);
	ctx.fillRect(-room.backgroundX, -room.backgroundY, canvas.width, canvas.height);
	ctx.restore();
}

function drawIsometricBackground(room, ctx, spr, index)
{
	const image = room.background.images[index].img;
	const pattern = room.backgroundMethod.replace("iso-", "");
	const cam = Camera.currentlyDrawing;
	const xpos = cam?.left ?? 0 - room.backgroundX;
	const ypos = cam?.top ?? 0 - room.backgroundY;
	const camWidth = cam?.width ?? room.width;
	const camHeight = cam?.height ?? room.height;

	ctx.save();
	ctx.translate(room.backgroundX, room.backgroundY);
	ctx.fillStyle = ctx.createPattern(image, pattern);
	ctx.fillRect(xpos, ypos, camWidth, camHeight);

	ctx.translate(spr.width/2, spr.height/2);
	ctx.fillRect(xpos-spr.width/2, ypos-spr.height/2, camWidth, camHeight);
	ctx.restore();
}

export function enter(room, opts = {})
{
	if (opts.transition)
		return enterTransition(room, opts);
	instance.executeEventAll("roomleave");
	for (const i of instance.instanceArray)
		if (!i.persistent) instance.uninstantiate(i);
	Room.current = room;
	currentRoom = room;
	for (const {name, x, y} of room.instances)
		instance.create(name, x, y);
	instance.setDepthSort(true);
	instance.executeEventAll("roomenter");
}

function enterTransition(room, opts)
{
	if (transition) return transition;
	transition = new Transition({
		...opts.transition,
		callback: () => {
			enter(room);
			transition = undefined;
		}
	});
	return transition;
}

export function next(room = currentRoom)
{
	const index = Room.array.indexOf(room);
	Room.enter(Room.array[index+1]);
}

export function previous(room = currentRoom)
{
	const index = Room.array.indexOf(room);
	Room.enter(Room.array[index-1]);
}

export function getByName(name)
{
	return Room.array.find(r => r.name === name);
}

Room.prototype.assetType = "room";
Room.names = [];
Room.array = [];
Room.current = null;
Generator.classStaticMatch(Room);

export default Room;
