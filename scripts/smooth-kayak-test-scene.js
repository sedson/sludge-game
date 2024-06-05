import { height } from "./height-map.js";

// g is the the kludge here.
let g;

// Module "state" can go here. We can do better.

let kayak;
let cidada_location;

// 0 is -z

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


// Make a height debugger. 
const heightInfo = document.createElement('div');
heightInfo.classList.add('height-info');
document.body.append(heightInfo);

let splashiesVolume = .11

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

export function setup_current() {

	let current_angle = g.random(0, 360);
	let current_speed = 0.0004;
	return make_vector(current_angle, current_speed);
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

	// Cicada location
	cidada_location = randomWorldPoint()

	// Parent the camera to the kayak.
	g.camera.setParent(kayak);

	// Data related to paddling the kayakheight(kayak.x, kayak.z)
	kayak.paddler = {
		fatigue: 0,
		restNeeded: 2000, // ms of rest to recover from each stroke
	};

	g.camera.move(0, 1.3, -1);

	current_vector = setup_current();
}

export function heightmap_friction_calculation() {
	let boundary = 1;
	let local_height = height(kayak.x, kayak.z)[0];
	let remaining = 1 - movement_passive_friction
	if (local_height < (0 - boundary)) {
		return movement_passive_friction;
	} else {
		return Math.max(
			1,
			movement_passive_friction + (remaining * g.sin(boundary + local_height))
		);
	}
}

export function kayak_bobbing(current_time) {
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

export function update_speed_and_rotation() {
	let current_time = g.time
	let kayak_turn = turn_ratio(current_time);
	global_kayak_turn = kayak_turn;
	let kayak_speed = movement_ratio(current_time, movement_speed_target_backwards);

	let local_friction = heightmap_friction_calculation();
	kayak.velocity.mult(1 - local_friction);

	kayak_bobbing(current_time);

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
		.add(current_vector);
}

// The tick function
export function draw(delta) {

	const cicadaDiff = g.vec3(kayak.x - cidada_location.x, 0, kayak.z - cidada_location.z)
	let cicadaDiffMag = .5 / Math.abs(cicadaDiff.x) + .5 / Math.abs(cicadaDiff.z)
	// console.log(300 - cicadaDiffMag)
	g.audioEngine.loopVolume('cicadas', cicadaDiffMag);

	g.camera.target.set(...kayak.transform.transformPoint([0, 1, -2]));
	kayak.transform.position.add(kayak.velocity.copy().mult(0.1 * delta));
	update_speed_and_rotation();


	const h = height(kayak.x, kayak.z);
	heightInfo.innerText =
		`X: ${kayak.x.toFixed(3)}, 
   Z: ${kayak.z.toFixed(3)}, 
   HEIGHT: ${h[0].toFixed(3)},
   DX: ${h[1].toFixed(3)},
   DX: ${h[3].toFixed(3)}
   vel: ${kayak.velocity}
   angle: ${g.degrees(kayak.rotation.y)},
   turn : ${global_kayak_turn}`;
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

// window.addEventListener('keydown', e => {
// 	if (e.key === 'q') {
// 		backward_left();
// 	}
// 	if (e.key === 'w') {
// 		forward_left();
// 	}
// 	if (e.key === 'o') {
// 		forward_right();
// 	}
// 	if (e.key === 'p') {
// 		backward_right();
// 	}
// })


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
	}).catch(() => {
		// if the paddler was too tired, maybe tell the player
		console.log("too tired...");
	})
}

window.addEventListener('keydown', e => {
	if (e.key === 'q') {
		paddle('backwardleft');
	}
	if (e.key === 'w') {
		paddle('forwardleft');
	}
	if (e.key === 'o') {
		paddle('forwardright');
	}
	if (e.key === 'p') {
		paddle('backwardright');
	}
})