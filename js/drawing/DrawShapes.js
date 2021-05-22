import * as Draw from "../draw.js";

/**
 * @type {function(number, number, number, number, Object):void}
 */
export function line(x1, y1, x2, y2, opts = {}) {
	var ctx = Draw.context;
	ctx.strokeStyle = opts.color || Draw.color;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

/**
 * @type {function(number, number, number, number, Object):void}
 */
export function ellipse(x, y, xr, yr, opts = {}) {

	//
	var ctx = Draw.context;
	ctx.save();
	ctx.beginPath();
	ctx.translate(x-xr, y-yr);
	ctx.scale(xr, yr);
	ctx.arc(1, 1, 1, 0, 2 * Math.PI, false);
	ctx.restore();

	//
	let style = opts.color || Draw.color;

	//
	if (opts.fill || (!opts.fill && !opts.stroke)) {
		ctx.fillStyle = style;
		ctx.fill();
	}

	if (opts.stroke) {
		ctx.strokeStyle = style
		ctx.lineWidth = opts.lineWidth || 1;
		ctx.stroke();
	}

}

/**
 * @type {function(number, number, number, number, Object):void}
 */
export function rectangle(x, y, w, h, opts = {}) {

	//
	const ctx = Draw.context;
	ctx.beginPath();
	ctx.rect(x, y, w, h);

	//
	const style = opts.color || Draw.color;

	//
	if (opts.fill || (!opts.fill && !opts.stroke)) {
		ctx.fillStyle = style;
		ctx.fill();
	}

	if (opts.stroke) {
		ctx.strokeStyle = style;
		ctx.lineWidth = opts.lineWidth || 1;
		ctx.stroke();
	}

}

/**
 * @type {function(number, number, number, number, number, number, number):void}
 */
export function healthBar(x, y, w, h, amount, c1, c2) {
	const size = w * amount / 100;
	rectangle(x, y, w, h, { color: c2 });
	rectangle(x, y, size, h, { color: c1 });
}
