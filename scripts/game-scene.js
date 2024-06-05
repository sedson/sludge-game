import { height } from "./height-map.js";
import * as UIText from "./ui-text.js";
import * as CosmeticMotion from "./cosmetic-motion.js"
import * as KayakMotion from "./kayak-motion.js"

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

let splashiesVolume = .11

let debugObjects = {};
let exertion_feelings = ["Aghhh...", "*breathes heavily*", "huff huff", "Fwoo!", "*wipes sweat off brow*", "fwoof", "my goodness", "!", "I am tired", "...", "I am afraid"]

const randomWorldPoint = () => {
	return g.vec3(Math.floor(Math.random() * 200), 0, Math.floor(Math.random() * 200));
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

	KayakMotion.update_speed_and_rotation(g, kayak, debugObjects);
	
	g.camera.target.set(...kayak.transform.transformPoint([0, 1, -2]));

	const terror = g.postProcessingStack.effects[0];
	terror.uniforms['uTime'] = g.time;
	terror.uniforms['uTerror'] = kayak.position.mag();
	terror.uniforms['uVel'] = kayak.velocity.mag();

	UIText.heightInfo.innerText =
		`X: ${kayak.x.toFixed(3)} Z: ${kayak.z.toFixed(3)} `;
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
					KayakMotion.forward_left(g);
					break;
				case "forwardright":
					g.audioEngine.playOneShot('splash1', splashiesVolume);
					KayakMotion.forward_right(g);
					break;
				case "backwardleft":
					g.audioEngine.playOneShot('splish2', splashiesVolume);
					KayakMotion.backward_left(g);
					break;
				case "backwardright":
					g.audioEngine.playOneShot('splash2', splashiesVolume);
					KayakMotion.backward_right(g);
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
