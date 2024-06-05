let cidada_location;
let sigh_location;
let whale_location;

let splashiesVolume = .11

function randomWorldPoint(g) {
	return g.vec3(Math.floor(Math.random() * 200), 0, Math.floor(Math.random() * 200));
}

export function setup_locations(g) {
	cidada_location = randomWorldPoint(g, 300, 200);
	whale_location = randomWorldPoint(g, 200, 200);
	sigh_location = randomWorldPoint(g, 200, 200);
}

export function play_loops(g, kayak) {
	const cicadaDiff = g.vec3(kayak.x - cidada_location.x, 0, kayak.z - cidada_location.z)
	let cicadaDiffMag = .5 / Math.abs(cicadaDiff.x) + .5 / Math.abs(cicadaDiff.z)
	g.audioEngine.loopVolume('cicadas', cicadaDiffMag / 2);

	const sighDiff = g.vec3(kayak.x - sigh_location.x, 0, kayak.z - sigh_location.z)
	let sighDiffMag = .5 / Math.abs(sighDiff.x) + .5 / Math.abs(sighDiff.z)
	g.audioEngine.loopVolume('sighs', sighDiffMag) / 2;

	const whale_diff = g.vec3(kayak.x - whale_location.x, 0, kayak.z - whale_location.z)
	let whaleDiffMag = .5 / Math.abs(whale_diff.x) + .5 / Math.abs(whale_diff.z)
	g.audioEngine.loopVolume('whale', whaleDiffMag / 2);

}

export function play_splish(g, splash_name) {
	g.audioEngine.playOneShot(splash_name, splashiesVolume);
}