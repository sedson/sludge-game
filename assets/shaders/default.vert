#version 300 es

// The default camera based uniforms that are available to us.
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform float uNear;
uniform float uFar;
uniform float uObjectId;
uniform float uAspect;

// Default vertex attribs.
in vec4 aPosition;
in vec4 aColor;
in vec3 aNormal;
in vec2 aTexCoord;
in vec4 aRegister1;
in vec4 aRegister2;
in float aSurfaceId;

// Default varyings.
out vec4 vWorldPosition;
out vec4 vColor;
out vec3 vWorldNormal;
out vec3 vViewNormal;
out vec3 vSurfaceId;
out vec2 vTexCoord;
out float vDepth;
out float vId;

/**
 * Main stuff.
 */
void main() {
  mat4 modelView = uView * uModel;
  mat3 normMatrix = transpose(inverse(mat3(modelView)));
  vViewNormal = normalize(normMatrix * aNormal.xyz);
  vWorldNormal = normalize(mat3(uModel) * aNormal.xyz);
  vWorldPosition = uModel * aPosition;
  vColor = aColor;
  vId = aSurfaceId;
  vTexCoord = aTexCoord;
  gl_Position = uProjection * uView * uModel * vec4(aPosition.xyz, 1.0);
}