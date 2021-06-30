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
export function ellipse(x, y, xr, yr, fill = true)
{
	const ctx = Draw.context;
	const color = Draw.color;
	ctx.save();
	ctx.beginPath();
	ctx.translate(x, y);
	ctx.scale(xr, yr);
	ctx.arc(0, 0, 1, 0, 2 * Math.PI, false);
	ctx.restore();

	if (fill) {
		ctx.fillStyle = color;
		ctx.fill();
	} else {
		ctx.strokeStyle = color
		ctx.stroke();
	}
}

/*
 *
 */
export function ellipseGradient(x, y, xr, yr, c1, c2)
{
	const ctx = Draw.context;
	const color = Draw.color;
	ctx.save();
	ctx.beginPath();
	ctx.translate(x, y);
	ctx.scale(xr, yr);
	const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
	gradient.addColorStop(0, c1);
	gradient.addColorStop(1, c2);
	ctx.arc(0, 0, 1, 0, 2 * Math.PI, false);
	ctx.fillStyle = gradient;
	ctx.fill();
	ctx.restore();
}

/*
 *
 */
export function rectangle(x, y, w, h, fill = true)
{
	const ctx = Draw.context;
	const color = Draw.color;
	ctx.beginPath();
	ctx.rect(x, y, w, h);

	if (fill) {
		ctx.fillStyle = color;
		ctx.fill();
	} else {
		ctx.strokeStyle = color;
		ctx.stroke();
	}
}

/*
 *
 */
export function rectangleGradient(x, y, w, h, c1, c2, hv)
{
	const ctx = Draw.context;
	const oldStyle = ctx.fillStyle;
	const coords = hv ? [x, y, x + w, y] : [x, y, x, y + h];
	const gradient = ctx.createLinearGradient(...coords);
	gradient.addColorStop(0, c1);
	gradient.addColorStop(1, c2);
	ctx.fillStyle = gradient;
	ctx.fillRect(x, y, w, h);
	ctx.fillStyle = oldStyle;
}

/*
 *
 */
export function healthBar(x, y, w, h, amount, c1 = "red", c2 = "green")
{
	const oldColor = Draw.color;
	const size = w * amount / 100;
	Draw.setColor(c2);
	rectangle(x + size, y, w - size, h);
	Draw.setColor(c1);
	rectangle(x, y, size, h);
	Draw.setColor(oldColor);
}
