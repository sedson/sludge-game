import { height } from "./height-map.js";

let g;

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
    .rescale(20)
    .setProgram('sprite')
    .uniform('uTex', spriteTexture.id);

  const pano2 = g.node()
    .setGeometry(panoMesh)
    .rescale(10)
    .rotate(0, 20, 0)
    .setProgram('sprite')
    .uniform('uTex', spriteTexture.id);



  // Make the default tree!
  function tree1(x, y, z, scale) {
    const mesh = g.mesh(g.plyLoader.fromBuffer(assets.get('tree')));
    const canopyMesh = g.mesh(
      g.plyLoader.fromBuffer(assets.get('tree-canopy')).fill(g.color('chocolate'))
    );

    const h = height(x, z)[0];

    const obj = g.node()
      .setGeometry(mesh)
      .setProgram('sprite')
      .uniform('uTex', spriteTexture.id)
      .move(x, h, z)
      .rescale(scale);

    const canoppObj = g.node()
      .setGeometry(canopyMesh)
      .setProgram('foliage')
      .setParent(obj);

    return obj;
  }


  tree1(4, 0, 0, 10);


  for (let i = 0; i < 40; i++) {
    const x = g.random(-100, 100);
    const z = g.random(-100, 100);

    tree1(x, 0, z, g.random(10, 20));
  }

  // g.orbit();
  g.camera.far = 1000;
}

// The tick function
export function draw(delta) {

}