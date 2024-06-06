import { height } from "./height-map.js";

let g;

const billboards = [];


export function setup(gumInstance, assets) {
  g = gumInstance;

  // Load the sprite sheet and set it up.
  const spriteImageData = assets.get('silhouettes');
  const spriteTexture = new g.Texer(spriteImageData.width, spriteImageData.height);
  spriteTexture.ctx.drawImage(spriteImageData, 0, 0);
  g.addTexer(spriteTexture);

  // Panoramas.
  const panoMesh = g.mesh(g.plyLoader.fromBuffer(assets.get('panorama')));

  const pano1 = g.node()
    .setGeometry(panoMesh)
    .rescale(50)
    .move(0, -8, 0)
    .setProgram('sprite')
    .uniform('uTex', spriteTexture.id);

  // TODO make a second panorama for the close one?
  // otherwise bridges won't work...
  // const pano2 = g.node()
  //   .setGeometry(panoMesh)
  //   .rescale(10)
  //   .rotate(0, 20, 0)
  //   .setProgram('sprite')
  //   .uniform('uTex', spriteTexture.id);

  const treeMesh = g.mesh(g.plyLoader.fromBuffer(assets.get('tree')));
  const canopyMesh = g.mesh(
    g.plyLoader.fromBuffer(assets.get('tree-canopy')).fill(g.color('chocolate'))
  );
  // Make the default tree!
  function tree1(x, y, z, scale) {
    const h = height(x, z)[0];

    const obj = g.node()
      .setGeometry(treeMesh)
      .setProgram('sprite')
      .uniform('uTex', spriteTexture.id)
      .move(x, h - 3, z)
      .rotate(0, g.random(), 0)
      .rescale(scale);

    const canoppObj = g.node()
      .setGeometry(canopyMesh)
      .setProgram('foliage')
      .setParent(obj);

    return obj;
  }


  // tree1(4, 0, 0, 10);


  for (let i = 0; i < 1000; i++) {
    const x = g.random(-400, 400);
    const z = g.random(-400, 400);

    if (height(x, z)[0] > 0.4) {
      tree1(x, 0, z, g.random(10, 20));
    }

  }

  g.orbit();
  // load the texture for beacon model
  const beaconSpriteData = assets.get('fuel');
  const beaconSpriteTex = new g.Texer(beaconSpriteData.width,
    beaconSpriteData.height);
  beaconSpriteTex.ctx.drawImage(beaconSpriteData, 0, 0);
  g.addTexer(beaconSpriteTex);

  const solidMesh = g.mesh(g.plyLoader.fromBuffer(
    assets.get('beacon')
  ));
  const wireMesh = g.mesh(g.plyLoader.fromBuffer(assets.get('beaconwires'))
    .fill(g.color('#df713b')).renderEdges()
  );
  const fuelMesh = g.mesh(g.plyLoader.fromBuffer(assets.get('beacon-fuel')));

  // function to make beacon model
  function makeBeacon(x, y, z) {
    const scale = 1;


    const beacon = g.node()
      .setGeometry(solidMesh)
      .setProgram('sprite')
      .uniform('uTex', beaconSpriteTex.id)
      .move(x, y, z) // no h
      .rescale(scale);

    beacon.createChildNode()
      .setGeometry(wireMesh);

    beacon.createChildNode()
      .setGeometry(fuelMesh)
      .setProgram('beacon')


    return beacon;
  }


  // draw a beacon at the source of each sound
  for (const [k, v] of Object.entries(g.beacons)) {
    const [x, y, z] = v;
    makeBeacon(x, y, z);
  }

  g.camera.far = 1000;



  const rockMesh = g.mesh(g.plyLoader.fromBuffer(assets.get('rock')));

  for (let i = 0; i < 1000; i++) {
    const x = g.random(-500, 500);
    const z = g.random(-500, 500);
    const h = height(x, z)[0];
    if (h < -5) {
      g.node().setGeometry(rockMesh)
        .move(x, h, z)
        .rescale(g.random(3, 6))
        .setProgram('main')
        .rotate(g.random(), g.random(), g.random())
    }
  }



  const heronImg = assets.get('heron');
  const heronTex = new g.Texer(heronImg.width, heronImg.height);
  heronTex.ctx.drawImage(heronImg, 0, 0);
  g.addTexer(heronTex);
  const heronMesh = g.mesh(g.plyLoader.fromBuffer(assets.get('heron-model')));

  function makeHeron(x, y, z) {
    let billboard = g.node()
      .setGeometry(heronMesh)
      .setProgram('sprite')
      .move(x, y, z)
      .uniform('uTex', heronTex.id);

    billboards.push(billboard);
  }

  for (let i = 0; i < 100; i++) {
    const [x, z] = [g.random(-300, 300), g.random(-300, 300)];
    const h = height(x, z)[0];
    if (h > 0.5 && h < 3) {
      makeHeron(x, h, z);
    }
  }


  const algeaMesh = g.mesh(g.plyLoader.fromBuffer(assets.get('algae')));

  for (let i = 0; i < 6000; i++) {
    const x = g.random(-500, 500);
    const z = g.random(-500, 500);
    const h = height(x, z)[0];
    if (h < 0 && h > -1) {
      g.node().setGeometry(algeaMesh)
        .move(x, 0.01, z)
        .rescale(g.random(3, 6))
        .setProgram('main')
        .rotate(0, g.random(), 0)
    }
  }

  console.log('TOTAL DRAW CALLS: ', g.scene._toDrawList([], true).length);

}



// The tick function
export function draw(delta) {
  // UGHHHHH PUT THIS IN GUM!
  const camPos = g.vec3(g.camera._worldMatrix[12], g.camera._worldMatrix[13], g.camera._worldMatrix[14]);

  for (let billboard of billboards) {
    const vecToCam = billboard.position.vectorTo(camPos);
    const thetaToCam = Math.atan2(vecToCam.x, vecToCam.z);
    billboard.rotate(0, thetaToCam, 0);
  }
}