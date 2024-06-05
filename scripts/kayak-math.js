export function degrees_to_radians(degrees) {
	return degrees * (Math.PI / 180)
}

export function make_vector(g, new_angle, new_velocity) {
	let x = 0;
	let y = 0;
	let radians = degrees_to_radians(new_angle);
	return g.vec3(new_velocity * (g.sin(radians)), 0, new_velocity * (g.cos(radians)));
}

export function make_angle(g, target, is_turning_right) {
	let variation = g.random(0, 10);
	let new_angle;
	if (is_turning_right) {
		new_angle = target + variation;
	} else {
		new_angle = -1 * (target + variation);
	}
	return g.radians(new_angle);
}

