import { loadAll } from "./load.js";

// Get the setup and draw from KayakScene.
import * as KayakScene from "./kayak-test-scene.js";
import * as TerrainScene from "./terrain.js";

// Make a new instance of the Gum engine, attached to the #game-canvas element 
// element.
const g = new GUM3D.Gum("#game-canvas");

// Tell gum to use high pixel density if available.
g.pixelRatio = window.devicePixelRatio ?? 1.0;

g.defaultPass = 'unlit';

// Step (1) async and wait load all the assets. That way our code below can 
// just call assets.get('default-frag') or assets.get('kayak-model') and get 
// the responses synchronously. Less headache (maybe). The assets will contain 
// a map of responses.
const assets = await loadAll();
window.assets = assets;

// TEMP ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––--

// Make a simple box shape, scale 1 unit.
const boxShape = g.shapes.cube(1);

// Fill all the vertices of the cube with the color pink.
boxShape.fill(g.color('rose'));

// Upload the boxShape data to a GPU friendly format.
const boxShapePointer = g.mesh(boxShape);

// Make a "game object" aka a "scene graph node" aka a 3D thing in the world 
// with a position and possible some children.
const boxObject = g.node();

// Make the box object (js) point to the mesh data (webGL).
boxObject.setGeometry(boxShapePointer);

// END TEMP ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––


// This is not ideal, but here is the easiest way to add new shaders to GUM!
// These shaders will be available to any mesh as 'customShaderProg'.
// This shader does nothing except pure data color.
g.shaders.customShaderProgram = {
  vert: assets.get('default-vert'),
  frag: assets.get('default-frag'),
}

g.shaders.terrainShaderProgram = {
  vert: assets.get('terrain-vert'),
  frag: assets.get('terrain-frag'),
}


// called once. We can use the 'g' namespace for static type things outside of 
// setup but certain things must be done in setup. Those things are 
// (1) adding shader programs
// (2) adding post-process passes
function setup() {
  // TODO Run our constructors, custom scene setup.

  // Add the new shaders. Now that our GL is all set, we can compile shaders.
  g.addProgram('customShaderProgram');
  g.addProgram('terrainShaderProgram');

  // Tell the boxObject to use our new custom program.
  boxObject.program = 'customShaderProgram';


  TerrainScene.setup(g);
}


// called each frame
function draw(delta) {
  g.clear(g.color("lime"));

  g.drawScene();

  TerrainScene.draw(delta);
}


// Actually run the whole thing!
g.run(setup, draw);
