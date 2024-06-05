import { randomWorldPoint } from "./utils.js";
import { kayak } from "./game-scene.js";

let g;

export function setup(gumInstance, assets) {
  g = gumInstance;
  const OSCILLATOR_COUNT = 9
  for (let i = 0; i < OSCILLATOR_COUNT; i++) {
    g.audioEngine.createSpookyOscillator(`osc-${i}`)
    g.audioEngine.spookyOscillators[`osc-${i}`].location = randomWorldPoint(g, 220, 60) 
  }
}

// The tick function
export function draw(delta) {
  for (let osc in g.audioEngine.spookyOscillators) {
    const locationDiff = g.vec3(kayak.x - cidada_location.x, 0, kayak.z - cidada_location.z)
    let cicadaDiffMag = .5 / Math.abs(locationDiff.x) + .5 / Math.abs(locationDiff.z)
    g.audioEngine.loopVolume('cicadas', cicadaDiffMag);
    // g.audioEngine.spookyOscillatorVolume(osc, .01)
  }
}