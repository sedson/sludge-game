#version 300 es
precision highp float;

uniform float uTime;
uniform float uTerror;
uniform float uVel;

uniform sampler2D uMainTex;
uniform sampler2D uDepthTex;
uniform vec2 uScreenSize;
uniform float uNear;
uniform float uFar;
uniform float uStart;
uniform float uEnd;
uniform vec4 uBlendColor;
in vec2 vTexCoord;
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

vec4 height(in vec2 pos) {
     vec3 p = vec3(pos.x / 10.0, 0.0, pos.y / 10.0);
     vec4 mapped = vec4(0.0);
     for (int i = 1; i < 8; i++) {
          vec4 hm = heightMap((p + vec3(3.0 * float(i - 1))) * float(i));
          mapped = mapped + (hm / (1.0 + 5.0 * float(i - 1)));
     }
     return vec4(mapped.x * 8.0 + 1.0, mapped.yzw * 8.0);
}

float linearDepth(float d, float near, float far) {
     float z = d * 2.0 - 1.0;
     return (2.0 * near * far) / (far + near - d * (far - near)) / far;
}

float hann(in float n, in float M) {
     return 0.5 * (1.0 + cos(6.28318 * n / M));
}

float windowTime() {
     float time = mod(uTime * 0.0005, 50.0) - 25.0;
     float hn = hann(time, 50.0);
     return time * hn;
}

vec2 rad() {
     return (vTexCoord - vec2(0.5));
}

#define M_PI 3.1415926535897932384626433832795

float angl(in vec2 r) {
     return atan(r.x, r.y) / (2.0 * M_PI) + 0.5;
}

float easeOutQuad(in float f) {
     return 1.0 - (1.0 - f) * (1.0 - f);
}

vec4 speed() {
     float wt = windowTime();
     float lines = mod(hann(angl(rad()) + wt, 0.5) * 25.0, 1.0);

     vec3 v = vec3(vTexCoord / 50.0, 1.0);
     vec3 colorize = lines * vec3(hash(v) + wt, hash(v.yzx) + wt, hash(v.zxy) + wt);
     vec4 outCol = vec4(colorize, 1.0);
     float vel = 1.0 - easeOutQuad(uVel);
     outCol = mix(vec4(0), outCol, 0.2 * smoothstep(vel + 0.4, vel + 0.7, length(rad())));
     outCol = mix(vec4(0), outCol, vTexCoord.y);
     return outCol;
}

vec4 circle(in vec2 v) {
     vec2 d = vTexCoord - v;
     float mul = step(1.0, 5.0 - length(d));
     return mul * vec4(1,0,0,1);
}

vec4 terror(vec4 col, float ldepth) {
     vec4 outCol = height(windowTime() * vTexCoord * 5.0);
     outCol = 10.0 * smoothstep(0.0, 400.0, uTerror) * outCol * outCol;
     return mix(vec4(0), floor(outCol), ldepth);
}

void main() {
     float depth = texture(uDepthTex, vTexCoord).r;
     float lDepth = linearDepth(depth, uNear, uFar);
     float m = smoothstep(uStart, uEnd, lDepth * (uFar - uNear) + uNear);
     vec4 col = texture(uMainTex, vTexCoord);
     col.rgb = mix(col.rgb, uBlendColor.rgb, m * uBlendColor.a);
     fragColor = terror(col, lDepth) * 0.001 + col + speed();
}
