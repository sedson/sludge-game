const g = new GUM3D.Gum("#game-canvas");

g.size(500, 500);

// called once
function setup() {}

// called each frame
function draw() {
  g.clear(g.color("lime"));
}

g.run(setup, draw)
