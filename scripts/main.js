const g = new GUM3D.Gum("#game-canvas");

g.size(500, 500);

function setup() {}

function draw() {
  g.clear(g.color("lime"));
}

g.run(setup, draw)