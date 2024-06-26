#version 300 es

precision mediump float;

uniform float uTime;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
    vec2 coord = floor(vTexCoord * 15.0) / 15.0;
    vec2 center = vec2(0.5);
    vec2 p = coord - center;
    
    float dist = clamp(0.5 - length(p), 0.0, 1.0);
    float t = uTime * 0.002;
    vec4 col = vec4(
        sin(t + coord.x * 8.0)*cos(t + coord.y * 50.0),
        cos(t - coord.y)*cos(t + coord.y * 13.0),
        sin(t * 3.0 + coord.x * 3.0) * sin(t * 7.0 + coord.y * 19.0),
        1.0
    );
    col = mix(vec4(0), col, 5.0 * dist * sin(coord.x) * cos(coord.y)) * 3.0;

    // Output to screen
    if (dot(col.rgb, vec3(1.0)) < 0.2) {
        discard;
    }
    fragColor = col;
}
