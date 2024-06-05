export const randomWorldPoint = (gumInstance, boundsx, boundsy) => {
  let g = gumInstance;
	return g.vec3(Math.floor(Math.random() * boundsx), 0, Math.floor(Math.random() * boundsy));
}