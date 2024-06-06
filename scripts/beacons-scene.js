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
  let minDistToABecaon = Infinity;
  const osc0 = Object.keys(g.audioEngine.spookyOscillators)[0];

  for (let [osc, loc] of Object.entries(g.beacons)) {
    if (osc === "undefined") continue;
    let location = loc
    let locationDiff = g.vec3(kayak.x - location.x, 0, kayak.z - location.z);
    let dist = locationDiff.mag();
    if (dist < minDistToABecaon) {
      minDistToABecaon = dist;
    }
  }

  // Beyond distance range[0], the beacon-based effects do no set in. The effect
  // reach max at range[0];
  const effectRange = [40, 2];
  const effectPower = g.remap(minDistToABecaon, effectRange[0], effectRange[1], 0, 1);

  const spookyVolume = g.lerp(0, 0.01, effectPower);
  g.audioEngine.spookyOscillatorVolume(osc0, spookyVolume);


  let terror = kayak.position.mag();
  terror += g.lerp(100, 480, effectPower);
  g.postProcessingStack.effects[0].uniforms['uTerror'] = terror;

  let warp = g.lerp(0, 10, effectPower);
  g.postProcessingStack.effects[0].uniforms['uWarp'] = warp;
}