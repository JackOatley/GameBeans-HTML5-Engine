
function start(t, ctx)
{
	const canvas = ctx.canvas;
	t.x = canvas.width;
}

function update(t, ctx)
{
	const canvas = ctx.canvas;
	const px = t.x;
	t.x -= t.delta * canvas.width;
	if (t.x < 0 && px > 0) {
		t.callback?.();
	} else if (t.x <= -canvas.width) {
		t.destroy();
	}
}

function draw(t, ctx)
{
	const canvas = ctx.canvas;
	ctx.globalAlpha = 1;
	ctx.fillStyle = t.color;
	ctx.fillRect(t.x, 0, canvas.width, canvas.height);
}

export const swipeLeft = {start, update, draw};
