import { height } from "./height-map.js";

const posOrNeg = () => Math.random() > 0.5 ? 1 : -1;

const randDeviation = (val, dev) => {
  return Math.floor(val + (Math.random() * dev * posOrNeg()))
}

export const randomWorldPoint = (gumInstance, boundsx, boundsy) => {
  let g = gumInstance;
	return g.vec3(randDeviation(0, boundsx), 0, randDeviation(0, boundsy));
}

export const randomWaterPoint = (gumInstance, boundsx, boundsy) => {
  let g = gumInstance;
	// let vec = g.vec3(Math.floor(Math.random() * boundsx), 0, Math.floor(Math.random() * boundsy));
	let vec = g.vec3(randDeviation(0, boundsx), 0, randDeviation(0, boundsy));
  let h = height(vec.x, vec.z)[0];
  if (h > 0){
    return randomWaterPoint(gumInstance, boundsx, boundsy)
  } // Else, it's water!
  return vec
}