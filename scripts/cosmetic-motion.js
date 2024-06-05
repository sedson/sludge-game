import * as KayakMath from "./kayak-math.js";

// This module contains purely cosmetic touches
// drift from the water current, height bobbing with the waves, etc.

export let drift_current_vector = 0;

export function setup_drift_current(g) {
	let current_angle = g.random(0, 360);
	let current_speed = 0.0004;
	drift_current_vector = KayakMath.make_vector(g, current_angle, current_speed);
}

export function kayak_vertical_bobbing(g, current_time, kayak) {
	let big_amp = .045;
	let big_fre = 1300;
	let med_amp = .065;
	let med_fre = 700;
	let sml_amp = .035;
	let sml_fre = 300;
	kayak.position.y = (-0.04 +
		(big_amp * g.sin(current_time / big_fre)) +
		(med_amp * g.sin(current_time / med_fre)) +
		(sml_amp * g.sin(current_time / sml_fre))
	);
}

export function kayak_radial_bobbing(g, current_time, kayak, radial_x, radial_z) {
	let x_big_amp = .07;
	let x_med_amp = .026;
	let x_sml_amp = .077;
	let x_big_fre = 2300;
	let x_med_fre = 600;
	let x_sml_fre = 300;
	
	let z_big_amp = .054;
	let z_med_amp = .026;
	let z_sml_amp = .0453;
	let z_big_fre = 1300;
	let z_med_fre = 730;
	let z_sml_fre = 270;

	let x_mult = g.cos(current_time / 2345) / 10; // diminish with speed
	let z_mult = g.sin(current_time / 4321) / 10;

	let speed = kayak.velocity.mag();

	let x_rot = (2 * radial_x) + (
		(((1 - speed) * .25) + x_mult) * (
			(x_big_amp * g.sin(current_time / x_big_fre)) +
			(x_med_amp * g.sin(current_time / x_med_fre)) +
			((x_sml_amp * g.sin(kayak.ry)) * g.sin(current_time / x_sml_fre))
		)
	);
	let z_rot = (4 * radial_z) + (
		(((1 - speed) * .45) + z_mult) * (
			(z_big_amp * g.sin(current_time / z_big_fre)) +
			(z_med_amp * g.sin(current_time / z_med_fre)) +
			((z_sml_amp * g.cos(kayak.ry)) * g.sin(current_time / z_sml_fre))
		)
	);
	kayak.rotate(x_rot, kayak.ry, z_rot);
}

