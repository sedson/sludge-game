import * as CosmeticMotion from "./cosmetic-motion.js";
import * as KayakMath from "./kayak-math.js";
import { height } from "./height-map.js";

let movement_msec_start = 0;

let movement_speed_target_backwards = true;

// movement speed increases linearly to max over movement_msec
// movement angle increases in sine function 0..1 over movement_msec
let movement_angle_target = 0;
let movement_angular_momentum = 0;
let movement_angular_momentum_max = 1;
let movement_rotation_past_peak = false;

// fields that will vary based on the boat type
let movement_msec_total = 600;
let movement_speed_add = .02;
let movement_angle_base_forward = 80;
let movement_angle_base_backward = 120;
let movement_angular_momentum_decay = .97;
let movement_passive_friction = 0.004;

// Bob X. and Bob Z. want different amounts of makeup
let cosmetic_x_bob_modifier = .25;
let cosmetic_z_bob_modifier = .45;

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

export function heightmap_friction_calculation(g, kayak, debugObjects, DEBUG) {
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

export function update_speed_and_rotation(g, kayak, debugObjects, DEBUG) {
	let current_time = g.time
	let kayak_turn = turn_ratio(g, current_time);
	let kayak_speed = movement_ratio(current_time, movement_speed_target_backwards);

	let local_friction = heightmap_friction_calculation(g, kayak, debugObjects, DEBUG);
	kayak.velocity.mult(1 - local_friction);

	let radial_x = 0;
	let radial_z = 0;

	CosmeticMotion.kayak_vertical_bobbing(g, current_time, kayak);

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
			radial_x = (
				(movement_speed_target_backwards != local_rotation_value > 0)?
				KayakMath.degrees_to_radians(local_rotation_value):
				KayakMath.degrees_to_radians(local_rotation_value) * -1
			);
			radial_z = (
				movement_speed_target_backwards ? 
				KayakMath.degrees_to_radians(local_rotation_value) :
				KayakMath.degrees_to_radians(local_rotation_value) * -1
			);

			kayak.rotate(
				0,
				kayak.ry + KayakMath.degrees_to_radians(local_rotation_value),
				0);
		}
	} else if (Math.abs(movement_angular_momentum) > 0.00001 && movement_rotation_past_peak) {
		radial_x = ((movement_speed_target_backwards != movement_angular_momentum > 0)?
			KayakMath.degrees_to_radians(movement_angular_momentum):
			KayakMath.degrees_to_radians(movement_angular_momentum) * -1
		);
		radial_z = (
			movement_speed_target_backwards ?
			KayakMath.degrees_to_radians(movement_angular_momentum) :
			KayakMath.degrees_to_radians(movement_angular_momentum) * -1
		);

		kayak.rotate(
			0,
			kayak.ry + KayakMath.degrees_to_radians(movement_angular_momentum),
			0);

	}

	CosmeticMotion.kayak_radial_bobbing(g, current_time, kayak, radial_x, radial_z, cosmetic_x_bob_modifier, cosmetic_z_bob_modifier);

	movement_angular_momentum = movement_angular_momentum * movement_angular_momentum_decay;
	kayak.velocity = KayakMath.make_vector(g, g.degrees(kayak.ry) + kayak_turn, kayak_speed)
		.add(kayak.velocity)
		.add(CosmeticMotion.drift_current_vector);
	kayak.transform.position.add(kayak.velocity.copy().mult(0.1));
}

export function forward_left(g) {
	// -Z is forward.
	movement_msec_start = g.time;
	movement_speed_target_backwards = false;
	movement_angle_target = KayakMath.make_angle(g, movement_angle_base_forward, false);
	movement_angular_momentum = -1 * movement_angular_momentum_max;
	movement_rotation_past_peak = false;
}
export function forward_right(g) {
	movement_msec_start = g.time;
	movement_speed_target_backwards = false;
	movement_angle_target = KayakMath.make_angle(g, movement_angle_base_forward, true);
	movement_angular_momentum = movement_angular_momentum_max;
	movement_rotation_past_peak = false;
}
export function backward_left(g) {
	movement_msec_start = g.time;
	movement_speed_target_backwards = true;
	movement_angle_target = KayakMath.make_angle(g, movement_angle_base_backward, true);
	movement_angular_momentum = movement_angular_momentum_max;
	movement_rotation_past_peak = false;
}
export function backward_right(g) {
	movement_msec_start = g.time;
	movement_speed_target_backwards = true;
	movement_angle_target = KayakMath.make_angle(g, movement_angle_base_backward, false);
	movement_angular_momentum = -1 * movement_angular_momentum_max;
	movement_rotation_past_peak = false;
}

export function set_boat_type(boat) {
	switch (boat) {
		case "kayak":
			// defaults for the boat we made first
			break;
		case "rowboat":
			movement_msec_total = 500
			movement_speed_add = .025;
			movement_angle_base_forward = 60;
			movement_angle_base_backward = 60;
			movement_angular_momentum_decay = .95;
			movement_passive_friction = .003;
			cosmetic_x_bob_modifier = .15;
			cosmetic_z_bob_modifier = .40;
			break;
		case "raft":
			movement_msec_total = 700;
			movement_speed_add = .017;
			movement_angle_base_forward = 120;
			movement_angle_base_backward = 120;
			movement_angular_momentum_decay = .99;
			movement_passive_friction = .005;
			cosmetic_x_bob_modifier = .10;
			cosmetic_z_bob_modifier = .10;
			break;
		default:
			// kayak
	}
}

