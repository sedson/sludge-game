import { randomWaterPoint, generateSoundDiff } from "./utils.js";
import { kayak } from "./game-scene.js";

let g;

export function setup(gumInstance, assets) {
  g = gumInstance;
  const OSCILLATOR_COUNT = 9
  for (let i = 0; i < OSCILLATOR_COUNT; i++) {
    g.audioEngine.createSpookyOscillator(`osc-${i}`)
    let location = randomWaterPoint(g, 220, 60)
    g.beacons[`osc-${i}`] = location
  }
}

// The tick function
export function draw(delta) {
  for (let osc in g.audioEngine.spookyOscillators) {
    if (osc === "undefined") continue;
    let location = g.beacons[osc]
    let soundDiffMag = generateSoundDiff(g, location, kayak, 1)
    g.audioEngine.spookyOscillatorVolume(osc, 0.005 / (10 + soundDiffMag))
  }
}
