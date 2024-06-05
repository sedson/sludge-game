#version 300 es

precision mediump float;

uniform sampler2D uTex;



in vec4 vColor;
in vec2 vTexCoord;
in vec4 vWorldPosition;
out vec4 fragColor;
uniform vec4 uColor;


// WATER FOR EVERY SHADER ------------------------------------------------------
uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uShoreColor;
uniform vec3 uWaterParams;
uniform float uTime;


void main() {
  fragColor = texture(uTex, vTexCoord);

  
  if (fragColor.r < 0.1) {
    discard;
  }


  fragColor = uColor;
}
