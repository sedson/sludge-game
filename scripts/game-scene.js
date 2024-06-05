import { height } from "./height-map.js";
import * as UIText from "./ui-text.js";
import * as CosmeticMotion from "./cosmetic-motion.js"

// g is the the kludge here.
let g;

// Add some debug boxes.
const DEBUG = true;

// Module "state" can go here. We can do better.

export let kayak;
let cidada_location;
let sigh_location;
let whale_location;
let current_vector;

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

let splashiesVolume = .11

let debugObjects = {};
let exertion_feelings = ["Aghhh...", "*breathes heavily*", "huff huff", "Fwoo!", "*wipes sweat off brow*", "fwoof", "my goodness", "!", "I am tired", "...", "I am afraid"]

const randomWorldPoint = () => {
	return g.vec3(Math.floor(Math.random() * 200), 0, Math.floor(Math.random() * 200));
}

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
	return degrees * (Math.PI / 180)
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
	movement_angle_target = g.radians(new_angle);
}

function makeKayak(assets) {
	const boat = g.node();

	const mainMesh = g.plyLoader.fromBuffer(assets.get('kayak-model'));
	const riggingMesh = g.plyLoader.fromBuffer(assets.get('kayak-rigging-model'));

	boat.setGeometry(g.mesh(mainMesh));

	const child = boat.createChildNode()
		.setGeometry(g.mesh(riggingMesh.renderEdges()));

	return boat;
}

// The once at the start function.
export function setup(gumInstance, assets) {
	g = gumInstance;


	kayak = makeKayak(assets);
	kayak.setProgram('main');
	window.kayak = kayak;
	kayak.velocity = g.vec3();

	// Audio Locations
	cidada_location = randomWorldPoint(g, 300, 200);
	whale_location = randomWorldPoint(g, 200, 200);
	sigh_location = randomWorldPoint(g, 200, 200);

	// Parent the camera to the kayak.
	g.camera.setParent(kayak);
  g.beacons = {}

	// Data related to paddling the kayakheight(kayak.x, kayak.z)
	kayak.paddler = {
		fatigue: 0,
		restNeeded: 2000, // ms of rest to recover from each stroke
	};

	CosmeticMotion.setup_drift_current(g, make_vector);
	UIText.setup_ui_text();

	if (DEBUG) {
		let msh = g.mesh(g.shapes.uvsphere(1, 4).fill(g.color("#ffff00")));
		debugObjects.front = g.node().setGeometry(msh);
		debugObjects.back = g.node().setGeometry(msh);
		debugObjects.left = g.node().setGeometry(msh);
		debugObjects.right = g.node().setGeometry(msh);
	}

}


export function heightmap_friction_calculation() {
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

export function update_speed_and_rotation() {
	let current_time = g.time
	let kayak_turn = turn_ratio(current_time);
	global_kayak_turn = kayak_turn;
	let kayak_speed = movement_ratio(current_time, movement_speed_target_backwards);

	let local_friction = heightmap_friction_calculation();
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
}

// The tick function
export function draw(delta) {
  
	const cicadaDiff = g.vec3(kayak.x - cidada_location.x, 0, kayak.z - cidada_location.z)
	let cicadaDiffMag = .5 / Math.abs(cicadaDiff.x) + .5 / Math.abs(cicadaDiff.z)
	g.audioEngine.loopVolume('cicadas', cicadaDiffMag / 2);

	const sighDiff = g.vec3(kayak.x - sigh_location.x, 0, kayak.z - sigh_location.z)
	let sighDiffMag = .5 / Math.abs(sighDiff.x) + .5 / Math.abs(sighDiff.z)
	g.audioEngine.loopVolume('sighs', sighDiffMag) / 2;

	const whale_diff = g.vec3(kayak.x - whale_location.x, 0, kayak.z - whale_location.z)
	let whaleDiffMag = .5 / Math.abs(whale_diff.x) + .5 / Math.abs(whale_diff.z)
	g.audioEngine.loopVolume('whale', whaleDiffMag / 2);

	update_speed_and_rotation();
	kayak.transform.position.add(kayak.velocity.copy().mult(0.1));
	g.camera.target.set(...kayak.transform.transformPoint([0, 1, -2]));

	const terror = g.postProcessingStack.effects[0];
	terror.uniforms['uTime'] = g.time;
	terror.uniforms['uTerror'] = kayak.position.mag();
	terror.uniforms['uVel'] = kayak.velocity.mag();

	UIText.heightInfo.innerText =
		`X: ${kayak.x.toFixed(3)} Z: ${kayak.z.toFixed(3)} `;
}


export function forward_left() {
	// -Z is forward.
	movement_msec_start = g.time;
	movement_speed_target_backwards = false;
	make_angle(movement_angle_base_forward, false);
	movement_angular_momentum = -1 * movement_angular_momentum_max;
	movement_rotation_past_peak = false;
}
export function forward_right() {
	movement_msec_start = g.time;
	movement_speed_target_backwards = false;
	make_angle(movement_angle_base_forward, true);
	movement_angular_momentum = movement_angular_momentum_max;
	movement_rotation_past_peak = false;
}
export function backward_left() {
	movement_msec_start = g.time;
	movement_speed_target_backwards = true;
	make_angle(movement_angle_base_backward, true);
	movement_angular_momentum = movement_angular_momentum_max;
	movement_rotation_past_peak = false;
}
export function backward_right() {
	movement_msec_start = g.time;
	movement_speed_target_backwards = true;
	make_angle(movement_angle_base_backward, false);
	movement_angular_momentum = -1 * movement_angular_momentum_max;
	movement_rotation_past_peak = false;
}

// Handle the impulse to paddle, as directed by player's keypress
// if the paddler is too tired, they must rest before continuing
async function paddle(direction) {
	return new Promise((resolve, reject) => {
		// are you tired yet?
		if (kayak.paddler.fatigue < 2) {
			// no? ok, paddle this stroke
			switch (direction) {
			case "forwardleft":
				// -Z is forward.
				g.audioEngine.playOneShot('splish1', splashiesVolume);
				forward_left();
				break;
			case "forwardright":
				g.audioEngine.playOneShot('splash1', splashiesVolume);
				forward_right();
				break;
			case "backwardleft":
				g.audioEngine.playOneShot('splish2', splashiesVolume);
				backward_left();
				break;
			case "backwardright":
				g.audioEngine.playOneShot('splash2', splashiesVolume);
				backward_right();
				break;
			default:
				return;
			}
			// increment the fatigue counter
			kayak.paddler.fatigue += 1;
			// then require a certain amount of rest
			setTimeout(resolve, kayak.paddler.restNeeded);
		} else {
			// if you *are* tired, reject the promise
			reject();
		}
	}).then(() => {
		// when the paddler is all rested up, decrement the counter
		kayak.paddler.fatigue -= 1;
		UIText.fatigue_tooltip.innerText = ""
		UIText.q_tooltip.classList.remove('key-pressed');
		UIText.w_tooltip.classList.remove('key-pressed');
		UIText.o_tooltip.classList.remove('key-pressed');
		UIText.p_tooltip.classList.remove('key-pressed');
	}).catch(() => {
		// if the paddler was too tired, maybe tell the player
		UIText.fatigue_tooltip.innerText = exertion_feelings[Math.floor(Math.random() * exertion_feelings.length)];
		// UIText.fatigue_tooltip.innerText = "Don't overwork yourself! Rest a sec...";
	})
}

window.addEventListener('keydown', e => {
	if (e.key === 'q') {
		UIText.q_tooltip.classList.add('key-pressed');
		paddle('backwardleft');
	}
	if (e.key === 'w') {
		UIText.w_tooltip.classList.add('key-pressed');
		paddle('forwardleft');
	}
	if (e.key === 'o') {
		UIText.o_tooltip.classList.add('key-pressed');
		paddle('forwardright');
	}
	if (e.key === 'p') {
		UIText.p_tooltip.classList.add('key-pressed');
		paddle('backwardright');
	}
})