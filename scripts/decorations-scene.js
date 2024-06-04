let g;

export function setup(gumInstance, assets) {
  g = gumInstance;

  const mesh = g.plyLoader.fromBuffer(assets.get('intersecting-quads'));
  const img = assets.get('tree-sprite');

  const tex = new g.Texer(img.width, img.height);
  tex.ctx.drawImage(img, 0, 0);
  g.addTexer(tex);

  console.log(tex);

  const node = g.node()
    .setGeometry(g.mesh(mesh))
    .move(5, 0, -10)
    .rescale(3)
    .setProgram('foliage')
    .uniform('uTex', tex.id);
}

// The tick function
export function draw(delta) {

}