#version 300 es

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

in vec4 aPosition;
in vec4 aColor;
in vec4 aTexCoord;
in vec4 aRegister1;
in vec4 aRegister2;
in float aSurfaceId;

out vec4 vWorldPosition;
out vec4 vColor;
out vec3 vWorldNormal;
out vec3 vViewNormal;
out vec3 vSurfaceId;
out vec2 vTexCoord;
out float vDepth;
out float vId;

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

void main() {
     vec4 SamplePos = uModel * aPosition;
     vec4 vMapped = height(SamplePos.xz);
     mat4 modelView = uView * uModel;
     mat3 normMatrix = transpose(inverse(mat3(modelView)));
     vViewNormal = normalize(normMatrix * vMapped.yzw);
     vWorldNormal = normalize(mat3(uModel) * vMapped.yzw);
     vColor = aColor;
     vId = aSurfaceId;
     vWorldPosition = uModel * vec4(aPosition.x, vMapped.x, aPosition.z, 1.0);

     gl_Position = uProjection * uView * vWorldPosition;
}
