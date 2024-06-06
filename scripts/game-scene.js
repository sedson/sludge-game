import * as UIText from "./ui-text.js";
import * as CosmeticMotion from "./cosmetic-motion.js"
import * as KayakMotion from "./kayak-motion.js"
import * as KayakMath from "./kayak-math.js"
import * as SceneSounds from "./scene-sounds.js"

// g is the the kludge here.
let g, _assets;

// Add some debug boxes.
const DEBUG = false;

// Module "state" can go here. We can do better.

export let kayak;

let debugObjects = {};
let exertion_feelings = ["Aghhh...", "*breathes heavily*", "huff huff", "Fwoo!", "*wipes sweat off brow*", "fwoof", "my goodness", "!", "I am tired", "...", "I am afraid"]

// TODO provide way to switch boats? maybe at start screen
// TODO maybe rename this makeBoat
function makeBoat(assets, instructions) {

	// unpack "instructions" for building a boat
	// (object containing some combination of these keys)
	const {
		'model': model,
		'modelcolor': modelcolor,
		'sprite': sprite,
		'wires': wires,
		'wirecolor': wirecolor,
	} = instructions;

	// start building the boat, as a new scene graph node
	const boat = g.node();

	// load the boat mesh, and maybe wireframe
	const mainMesh = g.plyLoader.fromBuffer(assets.get(model));
	boat.setGeometry(g.mesh(mainMesh))

	// maybe load and use a sprite for the main mesh
	if (sprite) {
		const boatSpriteData = assets.get(sprite);
		const boatSpriteTex = new g.Texer(boatSpriteData.width,
			boatSpriteData.height);
		boatSpriteTex.ctx.drawImage(boatSpriteData, 0, 0);
		g.addTexer(boatSpriteTex);

		boat.setProgram('sprite').uniform('uTex', boatSpriteTex.id);
	}
	// otherwise apply a solid color?
	// else {
	//   boat.setProgram('main');
	// }

	// maybe load an additional wireframe (rigging) mesh
	if (wires) {
		const riggingMesh = g.plyLoader.fromBuffer(assets.get(wires)).fill(g.color(wirecolor));
		boat.createChildNode().setGeometry(g.mesh(riggingMesh.renderEdges()));
	}

	boat.setParent(kayak);
	return boat;
}

export function createBoatModel(type) {
	const boats = {
		'raft': {
			'model': 'raft',
			'modelcolor': null,
			'sprite': 'raft-sprite',
			'wires': 'raft-rigging',
			'wirecolor': '#8f563b',
		},
		'kayak': {
			'model': 'kayak-model',
			'modelcolor': '#00ff00',
			'sprite': null,
			'wires': 'kayak-rigging-model',
			'wirecolor': '#ffff00',
		},
		'rowboat': {
			'model': 'rowboat',
			'modelcolor': null,
			'sprite': 'rowboat-sprite',
			'wires': null,
			'wirecolor': null,
		},
	};

	makeBoat(_assets, boats[type]);
}


// The once at the start function.
export function setup(gumInstance, assets) {
	g = gumInstance;
	_assets = assets;


	kayak = g.node();
	window.kayak = kayak;
	kayak.velocity = g.vec3();

	// Audio Locations
	// SceneSounds.setup_locations(g)
	SceneSounds.setup(g)

	// Parent the camera to the kayak.
	g.camera.setParent(kayak);
	g.beacons = {};

	// Data related to paddling the kayakheight(kayak.x, kayak.z)
	kayak.paddler = {
		fatigue: 0,
		restNeeded: 2000, // ms of rest to recover from each stroke
	};

	g.camera.move(0, 1.3, 0);
	CosmeticMotion.setup_drift_current(g);

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

	SceneSounds.loops(g, kayak);

	KayakMotion.update_speed_and_rotation(g, kayak, debugObjects, DEBUG);

	g.camera.target.set(...kayak.transform.transformPoint([0, 1, -2]));

	const terror = g.postProcessingStack.effects[0];
	terror.uniforms['uTime'] = g.time;
	// terror.uniforms['uTerror'] = kayak.position.mag();
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
				SceneSounds.play_splish(g, 'splish1');
				KayakMotion.forward_left(g);
				break;
			case "forwardright":
				SceneSounds.play_splish(g, 'splash1');
				KayakMotion.forward_right(g);
				break;
			case "backwardleft":
				SceneSounds.play_splish(g, 'splish2');
				KayakMotion.backward_left(g);
				break;
			case "backwardright":
				SceneSounds.play_splish(g, 'splash2');
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