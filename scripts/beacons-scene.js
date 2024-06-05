import { randomWaterPoint } from "./utils.js";
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
    let location = g.beacons[osc]
    const x = location.x
    const z = location.z
    const locationDiff = g.vec3(kayak.x - x, 0, kayak.z - z)
    let soundDiffMag = .5 / Math.abs(locationDiff.x) + .5 / Math.abs(locationDiff.z)
    if (soundDiffMag > 1) {
      soundDiffMag = 1
    }
    g.audioEngine.spookyOscillatorVolume(osc, soundDiffMag / 10)
  }
}
