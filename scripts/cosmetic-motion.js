// This module contains purely cosmetic touches
// drift from the water current, height bobbing with the waves, etc.

export let drift_current_vector = 0;

export function setup_drift_current(g, make_vector) {
	let current_angle = g.random(0, 360);
	let current_speed = 0.0004;
	drift_current_vector = make_vector(current_angle, current_speed);
}

export function kayak_bobbing(g, current_time, kayak) {
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
