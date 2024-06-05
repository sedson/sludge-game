import * as CosmeticMotion from "./cosmetic-motion.js";

let movement_msec_start = 0;
let movement_msec_total = 600;

let movement_speed_add = .04;
let movement_speed_target_backwards = true;

let movement_angle_base_forward = 80;
let movement_angle_base_backward = 120;
// movement speed increases linearly to max over movement_msec
// movement angle increases in sine function 0..1 over movement_msec
let movement_angle_target = 0;
let movement_angular_momentum = 0;
let movement_angular_momentum_max = 1;
let movement_rotation_past_peak = false;

let movement_passive_friction = 0.005;

let global_kayak_turn = 0;

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

export function turn_ratio(g, time) {
	if (time > movement_msec_start + movement_msec_total || movement_msec_start == 0) {
		return 0;
	}
	let new_angle = (movement_angle_target * (g.sin((time - movement_msec_start) / movement_msec_total)));
	return new_angle;
}

export function make_angle(g, target, is_turning_right) {
	let variation = g.random(0, 10);
	let new_angle;
	if (is_turning_right) {
		new_angle = target + variation;
	} else {
		new_angle = -1 * (target + variation);
	}
	movement_angle_target = g.radians(new_angle);
}

export function heightmap_friction_calculation(g, kayak, debugObjects) {
	// Get some point in front of the kayak.
	let front = kayak.transform.transformPoint([0, 0, -3.5]);
	let back = kayak.transform.transformPoint([0, 0, 3]);
	let left = kayak.transform.transformPoint([-1, 0, 0]);
	let right = kayak.transform.transformPoint([1, 0, 0]);

	// Local depth 
	let depth_center = -height(kayak.x, kayak.z)[0];
	let depth_front = -height(front[0], front[2])[0];
	let depth_back = -height(back[0], back[2])[0];
	let depth_left = -height(left[0], left[2])[0];
	let depth_right = -height(right[0], right[2])[0];
	let local_depth = Math.min(depth_center, depth_front, depth_back, depth_left, depth_right);

	if (DEBUG) {
		debugObjects.front.move(front[0], -depth_front + 0.1, front[2]);
		debugObjects.back.move(back[0], -depth_back + 0.1, back[2]);
		debugObjects.left.move(left[0], -depth_left + 0.1, left[2]);
		debugObjects.right.move(right[0], -depth_right + 0.1, right[2]);
	}

	// Ignore negative depth (positive height)
	local_depth = Math.max(local_depth, 0);

	// Depth where more friction starts 
	let depth_boundary = 1;

	// Multiplier for full friction.
	let friction_multiplier = 60;

	// Remap the depth from 
	const friction_factor = g.remap(local_depth, depth_boundary, -depth_boundary, movement_passive_friction, friction_multiplier * movement_passive_friction);

	return friction_factor;
}

export function update_speed_and_rotation(g, kayak, debugObjects) {
	let current_time = g.time
	let kayak_turn = turn_ratio(g, current_time);
	global_kayak_turn = kayak_turn;
	let kayak_speed = movement_ratio(current_time, movement_speed_target_backwards);

	let local_friction = heightmap_friction_calculation(g, kayak, debugObjects);
	kayak.velocity.mult(1 - local_friction);

	CosmeticMotion.kayak_bobbing(g, current_time, kayak);

	if (current_time <= movement_msec_start + movement_msec_total) {
		if (kayak_turn !== 0) {
			if (Math.abs(kayak_turn) > Math.abs(movement_angular_momentum)) {
				movement_rotation_past_peak = true;
			}
			let local_rotation_value;
			if (movement_rotation_past_peak) {
				if (kayak_turn > 0) {
					local_rotation_value = Math.min(kayak_turn, movement_angular_momentum);
				} else {
					local_rotation_value = Math.max(kayak_turn, movement_angular_momentum);
				}
			} else {
				local_rotation_value = kayak_turn
			}
			kayak.rotate(0, kayak.ry + degrees_to_radians(local_rotation_value), 0);
		}
	} else if (Math.abs(movement_angular_momentum) > 0.00001 && movement_rotation_past_peak) {
		kayak.rotate(0, kayak.ry + degrees_to_radians(movement_angular_momentum), 0);

	}
	movement_angular_momentum = movement_angular_momentum * .97;
	kayak.velocity = make_vector(g.degrees(kayak.ry) + kayak_turn, kayak_speed)
		.add(kayak.velocity)
		.add(CosmeticMotion.drift_current_vector);
	kayak.transform.position.add(kayak.velocity.copy().mult(0.1));
}

export function forward_left(g) {
	// -Z is forward.
	movement_msec_start = g.time;
	movement_speed_target_backwards = false;
	make_angle(g, movement_angle_base_forward, false);
	movement_angular_momentum = -1 * movement_angular_momentum_max;
	movement_rotation_past_peak = false;
}
export function forward_right(g) {
	movement_msec_start = g.time;
	movement_speed_target_backwards = false;
	make_angle(g, movement_angle_base_forward, true);
	movement_angular_momentum = movement_angular_momentum_max;
	movement_rotation_past_peak = false;
}
export function backward_left(g) {
	movement_msec_start = g.time;
	movement_speed_target_backwards = true;
	make_angle(g, movement_angle_base_backward, true);
	movement_angular_momentum = movement_angular_momentum_max;
	movement_rotation_past_peak = false;
}
export function backward_right(g) {
	movement_msec_start = g.time;
	movement_speed_target_backwards = true;
	make_angle(g, movement_angle_base_backward, false);
	movement_angular_momentum = -1 * movement_angular_momentum_max;
	movement_rotation_past_peak = false;
}
