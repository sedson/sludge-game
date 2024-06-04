#version 300 es

precision mediump float;

uniform sampler2D uTex;

in vec4 vColor;
in vec2 vTexCoord;
out vec4 fragColor;

void main() {
  fragColor = texture(uTex, vTexCoord);
  if (fragColor.r < 0.1) {
    discard;
  }
}