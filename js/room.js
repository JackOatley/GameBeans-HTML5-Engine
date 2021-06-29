import {Camera} from "./camera.js";
import {Transition} from "./transitions/transition.js";
import * as instance from "./instance.js";
import * as drawing from "./draw.js";

//
export let currentRoom = null;
export let transition = false;

/*
 *
 */
export class Room {

	/*
	 *
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
		this.backgroundColor = "black";
		this.instances = [];
		Room.names.push(name);
		Room.array.push(this);
		if (currentRoom === null)
			currentRoom = Room.current = this;
	}

	setBackground(spr) {
		this.background = spr;
	}

	addInstance(inst, x, y) {
		addInstance(this, inst, x, y)
	}

	enter(type, color, time) {
		enter(this, type, color, time);
	}

	draw() {
		draw(this);
	}
}

Room.draw = draw;
Room.enter = enter;
Room.next = next;
Room.previous = previous;
Room.restart = restart;
Room.getByName = getByName;
Room.addInstance = addInstance;

/*
 *
 */
export function addInstance(r, inst, x, y)
{
 	if (typeof inst === "object") inst = inst.objectName;
 	r.instances.push({name: inst, x, y});
 }

export function draw(room)
{
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
	if (room.backgroundMethod === "stretch")
		return ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

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

export function enter(room, type, color, time)
{
	if (type && color && time)
		return enterTransition(room, type, color, time);

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

/**
 *
 */
function enterTransition(room, type, color, time)
{
	if (transition) {
		return console.warn("attempting to transistion to another room while already transitioning!");
	}

	transition = new Transition({
		type, color, time,
		callback: () => {
			enter(room);
			transition = undefined;
		}
	});
}

export function next(type, color, time)
{
	const index = Room.array.indexOf(currentRoom);
	enter(Room.array[index+1], type, color, time);
}

export function previous(type, color, time)
{
	const index = Room.array.indexOf(currentRoom);
	enter(Room.array[index-1], type, color, time);
}

export function restart(type, color, time)
{
	enter(currentRoom, type, color, time);
}

export function getByName(name)
{
	return Room.array.find(r => r.name === name);
}

Room.prototype.assetType = "room";
Room.names = [];
Room.array = [];
Room.current = null;
