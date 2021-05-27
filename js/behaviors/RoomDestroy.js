import { Room } from "../core.js";

export function RoomDestroy() {

	this.eventAddAction("outsideroom", function() {
		this.destroy();
	});

}
