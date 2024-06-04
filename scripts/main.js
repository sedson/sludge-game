import { Gum } from '/dep/gum.module.js';
import { loadAll } from "./load.js";
import { createEngineAndLoadAudio } from './audio-engine.js';

// Grab our scenes.
import * as KayakScene from "./kayak-test-scene.js";
import * as SmoothKayakScene from "./smooth-kayak-test-scene.js";

import * as TerrainScene from "./terrain.js";
import * as DecorationsScene from "./decorations-scene.js";


// Make a new instance of the Gum engine, attached to the #game-canvas element 
// element.
const g = new Gum("#game-canvas");

// Tell gum to use high pixel density if available.
g.pixelRatio = window.devicePixelRatio ?? 1.0;
g.defaultPass = 'unlit';

// Step (1) async and wait load all the assets. That way our code below can 
// just call assets.get('default-frag') or assets.get('kayak-model') and get 
// the responses synchronously. Less headache (maybe). The assets will contain 
// a map of responses.
const assets = await loadAll();

// called once. We can use the 'g' namespace for static type things outside of 
// setup but certain things must be done in setup. Those things are 
// (1) adding shader programs
// (2) adding post-process passes
function setup() {

  // User interaction required to start audio - otherwise audio engine is "suspended"
  document.addEventListener('click', () => g.audioEngine.activateContext())
  document.addEventListener('keydown', () => g.audioEngine.activateContext())
  // Here is the easiest way to add new shaders to GUM! These shaders will be 
  // available to any mesh as 'terrainShaderProgram'.
  g.addProgram('terrainShaderProgram', {
    vert: assets.get('terrain-vert'),
    frag: assets.get('terrain-frag'),
  });

  g.addProgram('foliage', {
    vert: assets.get('default-vert'),
    frag: assets.get('foliage-frag'),
  });


  g.audioEngine = createEngineAndLoadAudio();

  TerrainScene.setup(g, assets);
  // KayakScene.setup(g, assets);
  SmoothKayakScene.setup(g, assets);

  DecorationsScene.setup(g, assets);

  g.addEffect('post-depth-fade', {
    uStart: 10,
    uEnd: 100,
    uBlendColor: g.color('#444466').rgba,
  });


  g.audioEngine.loopVolume('cicadas', 1);
}


// called each frame
function draw(delta) {
  g.clear(g.color('#444466'));

  TerrainScene.draw(delta);
  // KayakScene.draw(delta);
  SmoothKayakScene.draw(delta);
  DecorationsScene.draw(delta);


  g.drawScene();
}


// Actually run the whole thing!
g.run(setup, draw);