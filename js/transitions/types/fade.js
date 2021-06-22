
function update(t)
{
	t.alpha += t.direction ? t.delta : -t.delta;
	if (t.alpha >= 1) {
		t.callback?.();
		t.direction = 0;
	} else if (t.alpha <= 0) {
		t.destroy();
	}
}

function draw(t, ctx)
{
	const canvas = ctx.canvas;
	ctx.globalAlpha = t.alpha;
	ctx.fillStyle = t.color;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export const fade = {update, draw};
