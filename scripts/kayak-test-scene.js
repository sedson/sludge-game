// g is the the kludge here.
let g;

// Module "state" can go here. We can do better.

let kayak;

// 0 is -z
//
let angle = 0;
let velocity = 0;

export function make_vector(new_angle, new_velocity) {
	let x = 0;
	let y = 0;
	let radians = degrees_to_radians(new_angle);
	return g.vec3(new_velocity * (g.sin(radians)), 0, new_velocity * (g.cos(radians)));
}


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
	kayak.velocity.mult(0.95);
}

export function degrees_to_radians(degrees) {
	return degrees * (Math.PI/ 180)
}

export function forward_left() {
	// -Z is forward.

	angle = angle - 10;
	kayak.velocity = make_vector(angle, -1).add(kayak.velocity);
	kayak.rotate(0, degrees_to_radians(angle), 0);
}
export function forward_right() {
	angle = angle + 10;
	kayak.velocity = make_vector(angle, -1).add(kayak.velocity);
	kayak.rotate(0, degrees_to_radians(angle), 0);
}
export function backward_left() {
	angle = angle - 15;
	kayak.velocity = make_vector(angle, .5).add(kayak.velocity);
	kayak.rotate(0, degrees_to_radians(angle), 0);
}
export function backward_right() {
	angle = angle + 15;
	kayak.velocity = make_vector(angle, .5).add(kayak.velocity);
	kayak.rotate(0, degrees_to_radians(angle), 0);
}

window.addEventListener('keydown', e => {
	if (e.key === 'q') {
		backward_left();
	}
	if (e.key === 'w') {
		forward_left();
	}
	if (e.key === 'o') {
		forward_right();
	}
	if (e.key === 'p') {
		backward_right();
	}
})
