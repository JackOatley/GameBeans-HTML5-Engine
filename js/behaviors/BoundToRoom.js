import { Room } from "../core.js";

export function BoundToRoom()
{
	this.eventAddAction("stepEnd", function() {

		const w = this.boxRight - this.boxLeft;
		const h = this.boxBottom - this.boxTop;
		const rw = Room.current.width;
		const rh = Room.current.height;
		if (this.boxLeft < 0) this.x = this.x - this.boxLeft;
		if (this.boxTop < 0) this.y = this.y - this.boxTop;
		if (this.boxRight > rw) this.x = rw - w + this.x - this.boxLeft;
		if (this.boxBottom > rh) this.y = rh - h + this.y - this.boxTop;

	});
}
