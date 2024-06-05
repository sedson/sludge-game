#version 300 es

precision highp float;

uniform vec3 uEye;
uniform vec4 uColor;

in vec4 vWorldPosition;
in vec4 vColor;
in vec3 vWorldNormal;
in vec3 vViewNormal;
in vec3 vSurfaceId;
in float vDepth;
in float vId;

out vec4 fragColor;

// WATER FOR EVERY SHADER ------------------------------------------------------
uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uShoreColor;
uniform vec3 uWaterParams;
uniform float uTime;

vec4 water (vec4 col) {
  if (vWorldPosition.y < 0.0) {
    float fac = smoothstep(0.0, -uWaterParams.x, vWorldPosition.y);
    fac = clamp(fac, 0.0, 1.0);
    vec3 waterCol = mix(uShallowColor, uDeepColor, fac);
    col.rgb = mix(col.rgb, waterCol, uWaterParams.y);

    float shoreDepth = -uWaterParams.z;
    shoreDepth += 0.1 * sin(vWorldPosition.x * 0.3 + uTime * 0.001) * cos(vWorldPosition.z * 0.3 + uTime * 0.0005);


    float fac2 = clamp(smoothstep(shoreDepth + 0.2, shoreDepth + 0.19, vWorldPosition.y), 0.0, 1.0);
    col.rgb = mix(col.rgb, uShoreColor, 1.0 - fac2);
  }
  return col;
}
// END WATER -------------------------------------------------------------------

void main() {
     fragColor = vColor * clamp(smoothstep(-7.0, 4.0, vWorldPosition.y), 0.0, 1.0);
     fragColor.a = 1.0;
     fragColor = water(fragColor);
}
