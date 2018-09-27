import Draw from "../draw";

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {Object} [opts={}]
 * @return {void}
 */
function line(x1, y1, x2, y2, opts = {}) {
	var ctx = Draw.context;
	ctx.strokeStyle = opts.color || Draw.color;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {Object} [opts={}]
 * @return {void}
 */
function ellipse(x, y, xr, yr, opts = {}) {

	//
	var ctx = Draw.context;
	ctx.save();
	ctx.beginPath();
	ctx.translate(x-xr, y-yr);
	ctx.scale(xr, yr);
	ctx.arc(1, 1, 1, 0, 2 * Math.PI, false);
	ctx.restore();

	//
	let style;
	if (opts.healthbar) {
		let amount = opts.healthbar.amount || 1;
		let color = opts.healthbar.color || "#0F0";
		let background = opts.healthbar.background || "#F00";
		style = ctx.createLinearGradient( x-xr, 0, x+xr, 0 );
		style.addColorStop(0, color);
		style.addColorStop(amount, color);
		style.addColorStop(amount, background);
		style.addColorStop(1, background);
	} else {
		style = opts.color || Draw.color;
	}

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
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {Object} [opts={}]
 * @return {void}
 */
function rectangle(x, y, w, h, opts = {}) {

	//
	var ctx = Draw.context;
	ctx.beginPath();
	ctx.rect(x, y, w, h);

	//
	let style;
	if (opts.healthbar) {
		let amount = opts.healthbar.amount || 1;
		let color = opts.healthbar.color || "#0F0";
		let background = opts.healthbar.background || "#F00";
		style = ctx.createLinearGradient(x, 0, x+w, 0);
		style.addColorStop(0, color);
		style.addColorStop(amount, color);
		style.addColorStop(amount, background);
		style.addColorStop(1, background);
	} else {
		style = opts.color || Draw.color;
	}

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

//
export default { line, ellipse, rectangle }
