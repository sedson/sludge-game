let g;

let kayak;

export function setup(gumInstance) {
  g = gumInstance;
  const gridShape = g.shapes.grid(4000, 600);
  const terrain = g.node().setGeometry(
    g.mesh(gridShape.fill(g.color('#5c5214')))
  );

  terrain.program = 'terrainShaderProgram';

  g.camera.fov = 80;
}

// The tick function
export function draw(delta) {

}