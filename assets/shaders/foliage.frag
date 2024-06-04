#version 300 es

precision mediump float;

uniform sampler2D uTex;

in vec4 vColor;
in vec2 vTexCoord;
out vec4 fragColor;

float hash(in vec3 x) {
     vec3 p = 80.0 * fract(x * 0.3972743);
     return fract(p.x * p.y * (p.x - p.y) + p.z * (p.x + p.y));
}

void main() {
  vec2 coord = floor(vTexCoord * 40.0) / 40.0;
  float dist = distance(coord, vec2(0.5, 0.5));

  if (dist + hash(coord.xyx) * 0.2 > 0.5) {
    discard;
  }
  fragColor = vColor;
}