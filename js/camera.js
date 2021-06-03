import room from "./room.js";
import * as draw from "./draw.js";
import * as Instance from "./instance.js";

//
export const allCameras = [];

/**
 *
 */
export class Camera {

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
		Camera.array.push(this);
	}

	/**
	 * Update the Camera.
	 * @return {void}
	 */
	update() {
		update(this);
	}

	/**
	 *
	 */
	updateBounds() {
		this.left = this.x - this.width / 2;
		this.right = this.x + this.width / 2;
		this.top = this.y - this.height / 2;
		this.bottom = this.y + this.height / 2;
	}

	/**
	 * @return {void}
	 */
	destroy() {
		destroy(this);
	}

	/**
	 *
	 */
	static create = opts => new Camera(opts);
	static array = allCameras;
	static currentlyDrawing = null;
	static updateAll = updateAllCameras;
	static destroyAll = destroyAllCameras;

}

//
export function updateAllCameras() {
	allCameras.forEach(update);
}

//
export function destroyAllCameras() {
	allCameras.forEach(x => x.destroy());
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

function destroy(cam)
{
	const index = Camera.array.indexOf(cam);
	if (index < 0) return;
	Camera.array.splice(index, 1);
}
