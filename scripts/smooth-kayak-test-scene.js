// g is the the kludge here.
let g;

// Module "state" can go here. We can do better.

let kayak;

// 0 is -z
//
let angle = 0;
let velocity = 0;

let current_vector;


let movement_msec_start = 0;
let movement_msec_total = 500;

let movement_speed_add = .05;
let movement_speed_target_backwards = true;

let movement_angle_base_forward = 20;
let movement_angle_base_backward = 25;
// movement speed increases linearly to max over movement_msec
// movement angle increases in sine function 0..1 over movement_msec
let movement_angle_target = 0;
let movement_angle_actual = 0;

let movement_passive_friction = 0.008;

export function movement_ratio(time, backwards) {
	if (time > movement_msec_start + movement_msec_total || movement_msec_start == 0) {
		return 0;
	}
	let speed = (movement_speed_add * ((time - movement_msec_start) / movement_msec_total));
	if (!backwards) {
		// negative z for forward
		return speed * -1;
	}
	return speed;
}

export function turn_ratio(time) {
	if (time > movement_msec_start + movement_msec_total || movement_msec_start == 0) {
		return 0;
	}
	let new_angle = (movement_angle_target * (g.sin((time - movement_msec_start) / movement_msec_total)));
	return new_angle; 
}

export function degrees_to_radians(degrees) {
	return degrees * (Math.PI/ 180)
}

export function make_vector(new_angle, new_velocity) {
	let x = 0;
	let y = 0;
	let radians = degrees_to_radians(new_angle);
	return g.vec3(new_velocity * (g.sin(radians)), 0, new_velocity * (g.cos(radians)));
}

export function make_angle(target, is_turning_right) {
	let variation = g.random(0, 10);
	let new_angle;
	if (is_turning_right) {
		new_angle = target + variation;
	} else {
		new_angle = -1 * (target + variation);
	}
	movement_angle_target = ((movement_angle_actual + new_angle)) % 360;
}

export function setup_current() {

	let current_angle = g.random(0, 360);
	let current_speed = 0.0004;
	return make_vector(current_angle, current_speed);
}

// The once at the start function.
export function setup(gumInstance) {
	g = gumInstance;
	const gridShape = g.shapes.grid(100, 100);
	g.node().setGeometry(
		g.mesh(gridShape.renderEdges())
	);

	// Just the box mesh shape for now.
	const kayakShape = g.shapes.cube(1).fill(g.color('black'))

	kayak = g.node().setGeometry(g.mesh(kayakShape));

	kayak.velocity = g.vec3();

	// Parent the camera to the kayak.
	g.camera.setParent(kayak);

	current_vector = setup_current();
}
export function update_speed_and_rotation() {
	let current_time = g.time
	let kayak_turn = turn_ratio(current_time);
	let kayak_speed = movement_ratio(current_time, movement_speed_target_backwards);
	kayak.velocity.mult(1 - movement_passive_friction);
	if (current_time <= movement_msec_start + movement_msec_total) {
		kayak.rotate(0, degrees_to_radians(kayak_turn), 0);
		movement_angle_actual = movement_angle_target;
	}
	kayak.velocity = make_vector(kayak_turn, kayak_speed)
		.add(kayak.velocity)
		.add(current_vector);
	console.log("actual:" + movement_angle_actual + " target:" + movement_angle_target + " turn:" + kayak_turn);
}


// The tick function
export function draw(delta) {
	g.camera.target.set(...kayak.transform.position.xyz);
	kayak.transform.position.add(kayak.velocity.copy().mult(0.1 * delta));
	update_speed_and_rotation();
}


export function forward_left() {
	// -Z is forward.
	movement_msec_start = g.time;
	movement_speed_target_backwards = false ;
	make_angle(movement_angle_base_forward, false);
}
export function forward_right() {
	movement_msec_start = g.time;
	movement_speed_target_backwards = false;
	make_angle(movement_angle_base_forward, true);
}
export function backward_left() {
	movement_msec_start = g.time;
	movement_speed_target_backwards = true;
	make_angle(movement_angle_base_backward, true);
}
export function backward_right() {
	movement_msec_start = g.time;
	movement_speed_target_backwards = true;
	make_angle(movement_angle_base_backward, false);
}

window.addEventListener('keydown', e => {
	if (e.key === 'q') {
		backward_left();
	}
	if (e.key === 'w') {
		forward_left();
	}
	if (e.key === 'o') {
		forward_right();
	}
	if (e.key === 'p') {
		backward_right();
	}
})
