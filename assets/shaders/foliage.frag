#version 300 es

precision mediump float;

uniform sampler2D uTex;
uniform float uTime;

in vec4 vColor;
in vec2 vTexCoord;
out vec4 fragColor;

float sdRoundedBox(vec2 p, vec2 b, vec4 r ){
    r.xy = (p.x>0.0)?r.xy : r.zw;
    r.x  = (p.y>0.0)?r.x  : r.y;
    vec2 q = abs(p)-b+r.x;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
}

float hash(in vec3 x) {
     vec3 p = 80.0 * fract(x * 0.3972743);
     return fract(p.x * p.y * (p.x - p.y) + p.z * (p.x + p.y));
}

void main() {
  vec2 coord = floor(vTexCoord * 50.0) / 50.0;
  vec2 center = vec2(0.5, 0.5);
  vec2 p = coord - center;
  float dist = sdRoundedBox(p, vec2(0.0, 0.0), vec4(0.2, -0.4, 0.2, -0.4));

  dist += (sin(coord.x * 30.0) * 0.5 + 0.5) * smoothstep(0.8, 0.2, coord.y);

  if (dist + hash(coord.xyx) * 0.1 > 0.5) {
    discard;
  }
  fragColor = vColor;
  fragColor.rgb *= mix(0.9, 1.0, hash(vec3(coord, 1.0) * 0.2));
}