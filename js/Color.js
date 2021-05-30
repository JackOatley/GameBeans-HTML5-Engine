
/**
 *
 */
export function rgbaToCSS(r=0, g=0, b=0, a=1)
{
	return `rgba(${r},${g},${b},${a})`;
}

/**
 *
 */
export function hslaToCSS(h=0, s=0, l=0, a=1)
{
	return `hsla(${h},${s}%,${l}%,${a})`;
}

/**
 * Takes a hex value as a string and returns an objects containing r, g, b & a
 * properties.
 */
export function hexToRgb(hex)
{
	const [r, g, b, a] = hexToArray(hex);
	return {r, g, b, a};
}

/**
 * Takes a hex value and returns an array in the format of [r, g, b, a].
 */
export function hexToArray(hex)
{
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16),
		255
	] : [0, 0, 0, 255];
}

/**
 * Takes r, g, b values a numbers from 0 - 255 and returns a CSS hex string.
 */
export function rgbToHex(r, g, b)
{
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/**
 * Takes a component and returns a hex value.
 */
export function componentToHex(c)
{
	const hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}
