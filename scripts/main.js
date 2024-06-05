import { Gum } from '../dep/gum.module.js';
import { loadAll } from "./load.js";
import { createEngineAndLoadAudio } from './audio-engine.js';

// Grab our scenes.
import * as SmoothKayakScene from "./game-scene.js";

import * as TerrainScene from "./terrain.js";
import * as DecorationsScene from "./decorations-scene.js";
import * as BeaconsScene from "./beacons-scene.js";


// Make a new instance of the Gum engine, attached to the #game-canvas element 
// element.
const g = new Gum("#game-canvas");

const CAMERA_DEF_POS = g.vec3(0, 1.3, 0);
const LAST_ORBIT_POS = g.vec3();
let isOrbitMode = false;

// Tell gum to use high pixel density if available.
g.pixelRatio = window.devicePixelRatio ?? 1.0;
g.defaultPass = 'unlit';

const waterQuad = g.mesh(g.shapes.quad(1000, 1));

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
  g.addProgram('main', {
    vert: assets.get('default-vert'),
    frag: assets.get('default-frag'),
  });

  g.addProgram('terrainShaderProgram', {
    vert: assets.get('terrain-vert'),
    frag: assets.get('terrain-frag'),
  });

  g.addProgram('foliage', {
    vert: assets.get('default-vert'),
    frag: assets.get('foliage-frag'),
  });

  g.addProgram('sprite', {
    vert: assets.get('default-vert'),
    frag: assets.get('sprite-frag'),
  });

  g.addProgram('water', {
    vert: assets.get('default-vert'),
    frag: assets.get('water-frag'),
  });



  Object.assign(g.globalUniforms, {
    uShallowColor: g.color("#4c987b").rgb,
    uDeepColor: g.color("#2f5a32").rgb,
    uShoreColor: [0.8, 0.9, 0.8],
    uWaterParams: [6, 0.95, 0.3],
  });


  g.shaders['post-terror'] = {
    frag: assets.get('terror-frag'),
  };


  g.audioEngine = createEngineAndLoadAudio();

  TerrainScene.setup(g, assets);
  SmoothKayakScene.setup(g, assets);
  DecorationsScene.setup(g, assets);
  BeaconsScene.setup(g, assets);

  g.addEffect('post-terror', {
    uTime: 0,
    uTerror: 0,
    uVel: 0,
    uStart: 10,
    uEnd: 300,
    uBlendColor: g.color('#ccc769').rgba,
  });



  g.audioEngine.loopVolume('cicadas', 1);
  g.audioEngine.loopVolume('waterglide_ambient', 3);

  g.orbit();
  g.camera.move(...CAMERA_DEF_POS);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'r') {
      if (isOrbitMode) {
        LAST_ORBIT_POS.set(...g.camera.position);
        g.camera.move(...CAMERA_DEF_POS);
        isOrbitMode = false;
        return;
      }
      isOrbitMode = true;
      g.camera.position.set(...LAST_ORBIT_POS);
    }
  })
}


// called each frame
function draw(delta) {
  g.clear(g.color('#ccc769'));

  TerrainScene.draw(delta);
  SmoothKayakScene.draw(delta);
  DecorationsScene.draw(delta);

  if (!isOrbitMode) {
    g.camera.move(...CAMERA_DEF_POS);
  }
  g.drawScene();

  const gl = g.renderer.gl;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  g.renderer.setProgram('water');
  g.drawMesh(waterQuad);
  gl.disable(gl.BLEND);

}


// Actually run the whole thing!
g.run(setup, draw);