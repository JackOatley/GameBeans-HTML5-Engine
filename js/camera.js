import room from "./room.js";
import * as draw from "./draw.js";
import * as Instance from "./instance.js";

//
export const allCameras = [];

/**
 *
 */
export class Camera
{
	constructor(opts = {}) {
		this.x = 0;
		this.y = 0;
		this.angle = 0;
		this.width = room.current.width;
		this.height = room.current.height;
		this.follow = null;
		this.gridLocked = false;
		this.left = 0;
		this.right = 0;
		this.top = 0;
		this.bottom = 0;
		Object.assign(this, opts);
		allCameras.push(this);
	}

	update() {
		update(this);
	}

	updateBounds() {
		updateBounds(this);
	}

	destroy() {
		destroy(this);
	}
}

Camera.create = create;
Camera.array = allCameras;
Camera.currentlyDrawing = undefined;;
Camera.updateAll = updateAllCameras;
Camera.destroyAll = destroyAllCameras;

export function create(opts = {})
{
	return new Camera(opts);
}

function update(cam)
{
	if (cam.follow) {

		// if single instance, put into array
		if (!Array.isArray(cam.follow))
			cam.follow = [cam.follow];

		//
		let x = 0, y = 0, count = 0, weight = 1;
		cam.follow.forEach((inst) => {

			if (Array.isArray(inst)) {
				weight = inst[1] || 1;
				inst = inst[0];
			} else {
				weight = 1;
			}

			x += inst.x * weight;
			y += inst.y * weight;
			count += weight;

		});

		cam.x = x / count;
		cam.y = y / count;
	}

	cam.updateBounds();

	// apply camera
	draw.scale(room.current.width/cam.width, room.current.height/cam.height);
	draw.translate(-cam.left, -cam.top);

	// Draw for this camera.
	Camera.currentlyDrawing = cam;
	room.draw(room.current);
	Instance.drawAll();
}

function updateBounds(c)
{
	c.left = c.x - c.width / 2;
	c.right = c.x + c.width / 2;
	c.top = c.y - c.height / 2;
	c.bottom = c.y + c.height / 2;
}

function destroy(c)
{
	const index = allCameras.indexOf(c);
	if (index < 0) return;
	allCameras.splice(index, 1);
}

export function updateAllCameras()
{
	allCameras.forEach(update);
}

export function destroyAllCameras()
{
	allCameras.forEach(destroy);
}
