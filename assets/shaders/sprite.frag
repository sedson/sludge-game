#version 300 es

precision mediump float;

uniform sampler2D uTex;



in vec4 vColor;
in vec2 vTexCoord;
in vec4 vWorldPosition;
out vec4 fragColor;


// WATER FOR EVERY SHADER ------------------------------------------------------
uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uShoreColor;
uniform vec3 uWaterParams;
uniform float uTime;

vec4 water (vec4 col) {
  float limit = sin(vWorldPosition.x * 4.0 + uTime * 0.005) * cos(vWorldPosition.z * 8.0 + uTime * 0.001) * 0.008;
  if (vWorldPosition.y < limit) {
    float fac = smoothstep(0.0, -uWaterParams.x, vWorldPosition.y);
    fac = clamp(fac, 0.0, 1.0);
    vec3 waterCol = mix(uShallowColor, uDeepColor, fac);
    col.rgb = mix(col.rgb, waterCol, uWaterParams.y);

    float shoreDepth = -uWaterParams.z;
    shoreDepth += 0.1 * sin(vWorldPosition.x * 0.3 + uTime * 0.001) * cos(vWorldPosition.z * 0.3 + uTime * 0.0005);
    shoreDepth += sin(vWorldPosition.z * 8.0 + uTime * 0.007) * cos(vWorldPosition.x * 4.0 + uTime * 0.001) * 0.008;


    float fac2 = clamp(smoothstep(shoreDepth + 0.2, shoreDepth + 0.19, vWorldPosition.y), 0.0, 1.0);
    col.rgb = mix(col.rgb, uShoreColor, 1.0 - fac2);
  }
  return col;
}
// END WATER -------------------------------------------------------------------

void main() {
  fragColor = texture(uTex, vTexCoord);
  if (fragColor.r < 0.1) {
    discard;
  }
  fragColor = water(fragColor);
}
