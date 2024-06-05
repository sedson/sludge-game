#version 300 es

precision mediump float;

uniform float uTime;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
    vec2 coord = floor(vTexCoord * 25.0) / 25.0;
    vec2 center = vec2(0.5);
    vec2 p = coord - center;
    
    float dist = clamp(0.5 - length(p), 0.0, 1.0);
    
    vec4 col = vec4(
        sin(uTime + coord.x * 8.0)*cos(uTime + coord.y * 50.0),
        cos(uTime - coord.y)*cos(uTime + coord.y * 13.0),
        sin(uTime * 3.0 + coord.x * 3.0) * sin(uTime * 7.0 + coord.y * 19.0),
        1.0
    );
    col = mix(vec4(0), col, 5.0 * dist * sin(coord.x) * cos(coord.y));

    // Output to screen
    fragColor = col;
}
