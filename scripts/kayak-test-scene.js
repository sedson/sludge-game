// g is the the kludge here.
let g;

// Module "state" can go here. We can do better.

let kayak;


// The once at the start function.
export function setup(gumInstance) {
  g = gumInstance;
  const gridShape = g.shapes.grid(100, 100);
  g.node().setGeometry(
    g.mesh(gridShape.renderEdges())
  );

  // Just the box mesh shape for now.
  const kayakShape = g.shapes.cube(1).fill(g.color('black'))

  kayak = g.node().setGeometry(g.mesh(kayakShape));

  kayak.velocity = g.vec3();

  // Parent the camera to the kayak.
  g.camera.setParent(kayak);
}

// The tick function
export function draw(delta) {
  g.camera.target.set(...kayak.transform.position.xyz);
  kayak.transform.position.add(kayak.velocity.copy().mult(0.1 * delta));
  kayak.velocity.mult(0.95 ** delta);
}


window.addEventListener('keydown', e => {
  if (e.key === 'w') {
    // -Z is forward.
    kayak.velocity = g.vec3(0, 0, -1);
  }
})