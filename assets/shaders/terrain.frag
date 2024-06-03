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

void main() {
     vec4 water = vec4(0, 0, 1, 1);
     fragColor = vColor * smoothstep(-3.0, 2.0, vWorldPosition.y) + (water * step(vWorldPosition.y, 0.0));
}
