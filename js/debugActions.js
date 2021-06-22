
export function message(args)
{
	console.log(args);
}

export function alert(m)
{
	window.alert(m);
}

export function confirm(m)
{
	return window.confirm(m);
}

export function prompt(varName, global, message, def)
{
	const target = global ? window.global : this;
	target[varName] = window.prompt(message, def);
}
