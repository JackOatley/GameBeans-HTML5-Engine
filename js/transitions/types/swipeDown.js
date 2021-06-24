
function start(t, ctx)
{
	const canvas = ctx.canvas;
	t.y = -canvas.height;
}

function update(t, ctx)
{
	const canvas = ctx.canvas;
	const py = t.y;
	t.y += t.delta * canvas.height;
	if (t.y >= 0 && py < 0) {
		t.callback?.();
	} else if (t.y >= canvas.height) {
		t.destroy();
	}
}

function draw(t, ctx)
{
	const canvas = ctx.canvas;
	ctx.globalAlpha = 1;
	ctx.fillStyle = t.color;
	ctx.fillRect(0, t.y, canvas.width, canvas.height);
}

export const swipeDown = {start, update, draw};
