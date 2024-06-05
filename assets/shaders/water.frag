#version 300 es

precision mediump float;

uniform sampler2D uTex;
uniform float uTime;

in vec4 vColor;
in vec2 vTexCoord;
in vec4 vWorldPosition;
out vec4 fragColor;

float hash(in vec3 x) {
     vec3 p = 80.0 * fract(x * 0.3972743);
     return fract(p.x * p.y * (p.x - p.y) + p.z * (p.x + p.y));
}


vec4 heightMap(in vec3 x) {
     vec3 p = floor(x / 1.8);
     vec3 w = fract(x / 1.8);

     vec3 u = w * w * (3.0 - 2.0 * w);
     vec3 du = 6.0 * w * (1.0 - w);

     float a = hash(p + vec3(0,0,0));
     float b = hash(p + vec3(1,0,0));
     float c = hash(p + vec3(0,1,0));
     float d = hash(p + vec3(1,1,0));
     float e = hash(p + vec3(0,0,1));
     float f = hash(p + vec3(1,0,1));
     float g = hash(p + vec3(0,1,1));
     float h = hash(p + vec3(1,1,1));

     float k0 = a;
     float k1 = b - a;
     float k2 = c - a;
     float k3 = e - a;
     float k4 = a - b - c + d;
     float k5 = a - c - e + g;
     float k6 = a - b - e + f;
     float k7 = -a + b + c - d + e - f - g + h;

     return vec4(
          -1.0 + 2.0*(k0 + k1*u.x + k2*u.y + k3*u.z + k4 * u.x * u.y + k5 * u.y * u.z + k6 * u.z * u.x + k7 * u.x * u.y * u.z),
          2.0 * du * vec3(k1 + k4 * u.y + k6 * u.z + k7 * u.y * u.z,
                          k2 + k5 * u.z + k4 * u.x + k7 * u.z * u.x,
                          k3 + k6 * u.x + k5 * u.y + k7 * u.x * u.y)
          );
}

void main() {
  float hs = heightMap(vWorldPosition.xyz * 1.0 + uTime * vec3(0.001, 0.001, 0.001)).x * 0.5 + 0.5;
  float hs2 = heightMap(vWorldPosition.zyx * 6.0 + uTime * vec3(0.0002, -0.0005, 0.000)).x * 0.5 + 0.5;;
  float ripple = smoothstep(0.7, 0.71, hs * hs2);
  fragColor = vec4(1.0, 1.0, 1.0, ripple * 0.2);
}