import { Room } from "../core.js";

export function RoomWrap() {

	this.eventAddAction("stepEnd", function() {

		const w = this.boxRight - this.boxLeft;
		const h = this.boxBottom - this.boxTop;
		const rw = Room.current.width;
		const rh = Room.current.height;
		if (this.boxLeft > rw) this.x -= rw + w;
		if (this.boxTop > rh) this.y -= rh + h;
		if (this.boxRight < 0) this.x += rw + w;
		if (this.boxBottom < 0) this.y += rh + h;

	});

}
