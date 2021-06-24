import * as Draw from "../draw.js";

/*
 *
 */
export function line(x1, y1, x2, y2, {color = "red"} = {})
{
	var ctx = Draw.context;
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

/*
 *
 */
export function ellipse(x, y, xr, yr, {
	color = Draw.color,
	fill = true,
	lineWidth = 1
} = {})
{
	var ctx = Draw.context;
	ctx.save();
	ctx.beginPath();
	ctx.translate(x-xr, y-yr);
	ctx.scale(xr, yr);
	ctx.arc(1, 1, 1, 0, 2 * Math.PI, false);
	ctx.restore();

	if (fill) {
		ctx.fillStyle = color;
		ctx.fill();
	} else {
		ctx.strokeStyle = color
		ctx.lineWidth = lineWidth;
		ctx.stroke();
	}
}

/*
 *
 */
export function rectangle(x, y, w, h, {
	color = Draw.color,
	fill = true,
	lineWidth = 1
} = {})
{
	const ctx = Draw.context;
	ctx.beginPath();
	ctx.rect(x, y, w, h);

	if (fill) {
		ctx.fillStyle = style;
		ctx.fill();
	} else {
		ctx.strokeStyle = style;
		ctx.lineWidth = lineWidth;
		ctx.stroke();
	}
}

/*
 *
 */
export function healthBar(x, y, w, h, amount, c1 = "red", c2 = "green")
{
	const size = w * amount / 100;
	rectangle(x, y, w, h, {color: c2});
	rectangle(x, y, size, h, {color: c1});
}
