import { Camera } from "./camera.js";
import Generator from "./generator.js";
import Transition from "./transition.js";
import * as instance from "./instance.js";
import * as draw from "./draw.js";

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

		console.log(this.backgroundAlpha);
		draw.clear(this.backgroundColor, this.backgroundAlpha);

		const canvas = draw.target.domElement;
		const ctx = draw.context;
		const spr = this.background;

		if (spr === null) return;

		const frame = this.backgroundFrame;
		const animate = this.backgroundAnimate;
		let index = frame;
		if (animate) {
			this.backgroundFrame += this.backgroundAnimateSpeed;
			index = ~~(this.backgroundFrame % spr.images.length);
		}

		const image = spr.images[index].img;

		if (this.backgroundMethod === "stretch" ) {
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
			return;
		}

		// Iso patterns.
		if (this.backgroundMethod.indexOf("iso-") !== -1) {

			let pattern = this.backgroundMethod.replace("iso-", "");
			let xpos = Camera?.currentlyDrawing?.left ?? 0 - this.backgroundX;
			let ypos = Camera?.currentlyDrawing?.top ?? 0 - this.backgroundY;
			let camWidth = Camera?.currentlyDrawing?.width ?? this.width;
			let camHeight = Camera?.currentlyDrawing?.height ?? this.height;

			// First.
			ctx.save();
			ctx.translate(this.backgroundX, this.backgroundY);
			ctx.fillStyle = ctx.createPattern(image, pattern);
			ctx.fillRect(xpos, ypos, camWidth, camHeight);

			// Second.
			ctx.translate(spr.width/2, spr.height/2);
			ctx.fillRect(xpos-spr.width/2, ypos-spr.height/2, camWidth, camHeight);
			ctx.restore();

			return;
		}

		// Regular patterns.
		ctx.save();
		ctx.translate(this.backgroundX, this.backgroundY);
		ctx.fillStyle = ctx.createPattern(image, this.backgroundMethod);
		ctx.fillRect(-this.backgroundX, -this.backgroundY, canvas.width, canvas.height);
		ctx.restore();

	}

	static enter = enter;
	static next = next;
	static previous = previous;
	static getByName = getByName;
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
