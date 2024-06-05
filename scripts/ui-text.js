import { height } from "./height-map.js";

// Make a height debugger. 
export const heightInfo = document.createElement('div');

// Make a fatigued tooltip
export const fatigue_tooltip = document.createElement('div');

// Make controls display
export const q_tooltip = document.createElement('div');
export const w_tooltip = document.createElement('div');
export const o_tooltip = document.createElement('div');
export const p_tooltip = document.createElement('div');


export function setup_ui_text () {
	document.body.append(heightInfo);
	document.body.append(fatigue_tooltip);
	document.body.append(o_tooltip);
	document.body.append(p_tooltip);
	document.body.append(q_tooltip);
	document.body.append(w_tooltip);
	heightInfo.classList.add('height-info');
	fatigue_tooltip.classList.add('fatigue-tooltip');
	o_tooltip.classList.add('o-tooltip');
	p_tooltip.classList.add('p-tooltip');
	q_tooltip.classList.add('q-tooltip');
	w_tooltip.classList.add('w-tooltip');
	o_tooltip.innerText = "O";
	p_tooltip.innerText = "P";
	q_tooltip.innerText = "Q";
	w_tooltip.innerText = "W";
}

