import { randomWaterPoint, generateSoundDiff } from "./utils.js";
import { kayak } from "./game-scene.js";

let g;

export function setup(gumInstance, assets) {
  g = gumInstance;
  const OSCILLATOR_COUNT = 14
  for (let i = 0; i < OSCILLATOR_COUNT; i++) {
    g.audioEngine.createSpookyOscillator(`osc-${i}`)
    let location = randomWaterPoint(g, 220, 60)
    console.log(location)
    g.beacons[`osc-${i}`] = location
  }
}

// The tick function
export function draw(delta) {
  for (let osc in g.audioEngine.spookyOscillators) {
    if (osc === "undefined") continue;
    let location = g.beacons[osc]
    let locationDiff = g.vec3(kayak.x - location.x, 0, kayak.y - location.z)
    let locationDiffMag = Math.abs(locationDiff.x) + Math.abs(locationDiff.z)
    let soundDiffMag = 1 / (1 + locationDiffMag)
    g.audioEngine.spookyOscillatorVolume(osc, soundDiffMag / 8)
  }
}