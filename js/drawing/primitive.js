import draw from "./../draw.js";
import sprite from "./../sprite.js";

const noop = () => {};

/** */
export default class Primitive {

	/**
	 * @param {object} opts Options object.
	 * @param {array} opts.points Array of Point objects.
	 * @param {*} opts.texture Sprite object or name of sprite resource.
	 * @param {*} opts.color Color of the primitive.
	 * @param {string} opts.format Format of the points array.
	 * @param {function} opts.modifier Point modifier function.
	 * @param {number} opts.x X position to draw the primitive.
	 * @param {number} opts.y Y position to draw the primitive.
	 */
	constructor(opts = {}) {
		this.points = opts.points || [];
		this.texture = opts.texture || null;
		this.color = opts.color || "#000000";
		this.format = opts.format || "quads";
		this.modifier = opts.modifier || noop;
		this.x = opts.x || 0;
		this.y = opts.y || 0;
	}
	
	/** Method for drawing instantiated Primitive. */
	draw() {
		Primitive.draw(this);
	}
	
	/**
	 * Alternate way to create a new Primitive instance.
	 * @param {object} opts See constructor.opts parameter.
	 */
	static create(opts = {}) {
		return new Primitive(opts);
	}
	
	/**
	 * @param {object} opts See constructor.opts parameter.
	 */
	static draw(opts = {}) {
		if (opts.texture) drawTextured(opts);
		else drawBasic(opts);
	}

}

/**
 *
 */
function drawTextured(opts = {}) {
	
	let texture = opts.texture;
	let spr = sprite.get(texture);
	if (spr === null) {
		console.warn("No such texture: " + texture);
		return;
	}
	
	let ctx = draw.context;
	let frame = spr.images[0];
	let img = frame.img;
	let w = spr.width;
	let h = spr.height;
	let tris = orderTriangleList(opts);
	
	//
	let t;
	let pts = applyModifier(opts.points, opts.modifier);
	let len = tris.length;
	for (t=0; t<len; t++) {
		
		var pp = tris[t];
		var x0 = pts[pp[0]].x, x1 = pts[pp[1]].x, x2 = pts[pp[2]].x;
		var y0 = pts[pp[0]].y, y1 = pts[pp[1]].y, y2 = pts[pp[2]].y;
		var u0 = pts[pp[0]].u*w, u1 = pts[pp[1]].u*w, u2 = pts[pp[2]].u*w;
		var v0 = pts[pp[0]].v*h, v1 = pts[pp[1]].v*h, v2 = pts[pp[2]].v*h;
		
		// Set clipping area so that only pixels inside the triangle will
		// be affected by the image drawing operation
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.closePath();
		ctx.clip();

		// Compute matrix transform
		var delta = u0*v1 + v0*u2 + u1*v2 - v1*u2 - v0*u1 - u0*v2;
		var delta_a = x0*v1 + v0*x2 + x1*v2 - v1*x2 - v0*x1 - x0*v2;
		var delta_b = u0*x1 + x0*u2 + u1*x2 - x1*u2 - x0*u1 - u0*x2;
		var delta_c = u0*v1*x2 + v0*x1*u2 + x0*u1*v2 - x0*v1*u2
					  - v0*u1*x2 - u0*x1*v2;
		var delta_d = y0*v1 + v0*y2 + y1*v2 - v1*y2 - v0*y1 - y0*v2;
		var delta_e = u0*y1 + y0*u2 + u1*y2 - y1*u2 - y0*u1 - u0*y2;
		var delta_f = u0*v1*y2 + v0*y1*u2 + y0*u1*v2 - y0*v1*u2
					  - v0*u1*y2 - u0*y1*v2;

		// Draw the transformed image
		ctx.transform(delta_a/delta, delta_d/delta,
					  delta_b/delta, delta_e/delta,
					  delta_c/delta, delta_f/delta);
		ctx.drawImage(img, 0, 0);
		ctx.restore();
	}
}

/**
 *
 */
function drawBasic(opts = {}) {
	let points = applyModifier(opts.points, opts.modifier);
	let length = points.length;
	if (length > 0) {
		let tris = orderQuadList(opts);
		let i, ctx = draw.context;
		ctx.fillStyle = opts.color || draw.color;
		for (i=0; i<tris.length; i++) {
			let tri = tris[i];
			let n, p = points[tri[0]];
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			for (n=1; n<tri.length; n++) {
				p = points[tri[n]];
				ctx.lineTo(p.x, p.y);
			}
			ctx.closePath();
			ctx.fill();
		}
	}
}

/**
 *
 */
function applyModifier(points, modifier) {
	let newPoints = [];
	points.forEach(function(p) {
		let newP = Object.assign({}, p, modifier.call(p));
		newPoints.push(newP);
	});
	return newPoints;
}

/**
 * @param {object} opts
 */
function orderTriangleList(opts = {}) {
	let tris = [];
	if (opts.format === "quads") {
		let length = Math.floor(opts.points.length / 4);
		let n, o = 0;
		for (n=0; n<length; n++) {
			tris.push([o+0, o+1, o+2], [o+2, o+3, o+0]);
			o += 4;
		}
	}
	return tris;
}

/**
 * @param {object} opts
 */
function orderQuadList(opts = {}) {
	let tris = [];
	let length = Math.floor(opts.points.length / 4);
	let n, o = 0;
	for (n=0; n<length; n++, o+=4) {
		tris.push([o+0, o+1, o+2, o+3]);
	}
	return tris;
}