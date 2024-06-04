let g;

let kayak;

export function setup(gumInstance) {
  g = gumInstance;
  const gridShape = g.shapes.grid(1000, 500);
  const terrain = g.node().setGeometry(
    g.mesh(gridShape.fill(g.color('sand')))
  );

  terrain.program = 'terrainShaderProgram';

  g.camera.fov = 80;
}

// The tick function
export function draw(delta) {

}