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
export function setup(gumInstance, assets) {
  g = gumInstance;
  const gridShape = g.shapes.grid(100, 100);
  g.node().setGeometry(
    g.mesh(gridShape.renderEdges())
  );

  // Just the box mesh shape for now.
  const kayakShape = g.plyLoader.fromBuffer(assets.get('kayak-model'))
    .fill(g.color('lime'))

  kayak = g.node().setGeometry(g.mesh(kayakShape));

  kayak.velocity = g.vec3();

  // Parent the camera to the kayak.
  g.camera.setParent(kayak);

  // Data related to paddling the kayak
  kayak.paddler = {
    fatigue: 0,
    restNeeded: 2000, // ms of rest to recover from each stroke
  };
}

// The tick function
export function draw(delta) {
  g.camera.target.set(...kayak.transform.position.xyz);
  kayak.transform.position.add(kayak.velocity.copy().mult(0.1 * delta));
  kayak.velocity.mult(0.95);
}

export function degrees_to_radians(degrees) {
  return degrees * (Math.PI / 180)
}

// Handle the impulse to paddle, as directed by player's keypress
// if the paddler is too tired, they must rest before continuing
async function paddle(direction) {
    return new Promise((resolve, reject) => {
	// are you tired yet?
	if (kayak.paddler.fatigue < 2) {
	    // no? ok, paddle this stroke
	    switch (direction) {
	    case "forwardleft":
                // -Z is forward.
		angle = angle - 10;
		kayak.velocity = make_vector(angle, -1).add(kayak.velocity);
		kayak.rotate(0, degrees_to_radians(angle), 0);
		break;
	    case "forwardright":
		angle = angle + 10;
		kayak.velocity = make_vector(angle, -1).add(kayak.velocity);
		kayak.rotate(0, degrees_to_radians(angle), 0);
		break;
	    case "backwardleft":
		angle = angle - 15;
		kayak.velocity = make_vector(angle, .5).add(kayak.velocity);
		kayak.rotate(0, degrees_to_radians(angle), 0);
		break;
	    case "backwardright":
		angle = angle + 15;
		kayak.velocity = make_vector(angle, .5).add(kayak.velocity);
		kayak.rotate(0, degrees_to_radians(angle), 0);
		break;
	    default:
		return;
	    }
	    // increment the fatigue counter
    	    kayak.paddler.fatigue += 1;
	    // then require a certain amount of rest
	    setTimeout(resolve, kayak.paddler.restNeeded);
	} else {
	    // if you *are* tired, reject the promise
	    reject();
	}
    }).then(() => {
	// when the paddler is all rested up, decrement the counter
	kayak.paddler.fatigue -= 1;
    }).catch(() => {
	// if the paddler was too tired, maybe tell the player
	console.log("too tired...");
    })
}

window.addEventListener('keydown', e => {
  if (e.key === 'q') {
    paddle('backwardleft');
  }
  if (e.key === 'w') {
    paddle('forwardleft');
  }
  if (e.key === 'o') {
    paddle('forwardright');
  }
  if (e.key === 'p') {
    paddle('backwardright');
  }
})