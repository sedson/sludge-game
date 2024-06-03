let g;

let kayak;

export function setup(gumInstance) {
  g = gumInstance;
  const gridShape = g.shapes.grid(100, 500);
  const terrain = g.node().setGeometry(
    g.mesh(gridShape.fill(g.color('sand')))
  );

  terrain.program = 'terrainShaderProgram';

  const kayakShape = g.shapes.cube(1).fill(g.color('black'))

  kayak = g.node().setGeometry(g.mesh(kayakShape));

  kayak.velocity = g.vec3();

  // Parent the camera to the kayak.
  g.camera.setParent(kayak);


}

// The tick function
export function draw(delta) {
    g.camera.target.set(...kayak.transform.position.xyz);
    g.camera.fov = 90;
  kayak.transform.position.add(kayak.velocity.copy().mult(0.1 * delta));
  kayak.velocity.mult(0.95 ** delta);
}


window.addEventListener('keydown', e => {
  if (e.key === 'w') {
    // -Z is forward.
    kayak.velocity = g.vec3(0, 0, -1);
  }
})
