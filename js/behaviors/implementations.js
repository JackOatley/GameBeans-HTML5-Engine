import { BoundToRoom } from "./BoundToRoom.js";
import { RoomWrap } from "./RoomWrap.js";
import { RoomDestroy } from "./RoomDestroy.js";
import { FourWayMovement } from "./FourWayMovement.js";
import { EightWayMovement } from "./EightWayMovement.js";

export const behaviourImplementations = {
	"BoundToRoom": BoundToRoom,
	"RoomWrap": RoomWrap,
	"RoomDestroy": RoomDestroy,
	"FourWayMovement": FourWayMovement,
	"EightWayMovement": EightWayMovement
}
