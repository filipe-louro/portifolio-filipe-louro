export const vertexShaderSource = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const simulationShaderSource = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_feed;
uniform float u_kill;
uniform float u_diffU;
uniform float u_diffV;
uniform vec4 u_mouse; // x, y (in uv coords), radius (in uv space), action (+1 add V, -1 clear V)

void main() {
    vec2 texel = 1.0 / u_resolution;
    vec2 state = texture(u_texture, v_uv).rg;
    float u = state.r;
    float v = state.g;

    // Laplaciano de 9 pontos com pesos de estêncil isotrópico
    vec2 left  = texture(u_texture, v_uv + vec2(-texel.x, 0.0)).rg;
    vec2 right = texture(u_texture, v_uv + vec2(texel.x, 0.0)).rg;
    vec2 up    = texture(u_texture, v_uv + vec2(0.0, -texel.y)).rg;
    vec2 down  = texture(u_texture, v_uv + vec2(0.0, texel.y)).rg;

    vec2 ul = texture(u_texture, v_uv + vec2(-texel.x, -texel.y)).rg;
    vec2 ur = texture(u_texture, v_uv + vec2(texel.x, -texel.y)).rg;
    vec2 dl = texture(u_texture, v_uv + vec2(-texel.x, texel.y)).rg;
    vec2 dr = texture(u_texture, v_uv + vec2(texel.x, texel.y)).rg;

    vec2 laplacian = (left + right + up + down) * 0.2 + (ul + ur + dl + dr) * 0.05 - state;

    // Equações cinéticas de Gray-Scott
    float uvv = u * v * v;
    float du = u_diffU * laplacian.r - uvv + u_feed * (1.0 - u);
    float dv = u_diffV * laplacian.g + uvv - (u_feed + u_kill) * v;

    u = clamp(u + du * 0.95, 0.0, 1.0);
    v = clamp(v + dv * 0.95, 0.0, 1.0);

    // Injeção química manual pelo cursor do mouse
    if (u_mouse.z > 0.0001) {
        float aspect = u_resolution.x / u_resolution.y;
        vec2 d = (v_uv - u_mouse.xy) * vec2(aspect, 1.0);
        float dist = length(d);
        if (dist < u_mouse.z) {
            float strength = smoothstep(u_mouse.z, 0.0, dist);
            if (u_mouse.w > 0.0) {
                // Injetar catalisador V
                v = clamp(v + strength * 0.65, 0.0, 1.0);
                u = clamp(u - strength * 0.35, 0.0, 1.0);
            } else {
                // Dissolver catalisador V
                u = clamp(u + strength * 0.8, 0.0, 1.0);
                v = clamp(v - strength * 0.8, 0.0, 1.0);
            }
        }
    }

    fragColor = vec4(u, v, 0.0, 1.0);
}
`;

export const renderShaderSource = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform int u_palette;
uniform bool u_bumpLight;

vec3 getPaletteColor(float v, int palette) {
    if (palette == 0) {
        // Paleta Elétrica (Violeta, Púrpura, Magenta, Cyan)
        vec3 c0 = vec3(0.02, 0.02, 0.06); // Fundo abissal
        vec3 c1 = vec3(0.35, 0.12, 0.65); // Roxo profundo
        vec3 c2 = vec3(0.75, 0.22, 0.85); // Magenta
        vec3 c3 = vec3(0.95, 0.55, 0.98); // Brilho suave
        vec3 c4 = vec3(0.38, 0.88, 0.98); // Cyan bioluminescente

        if (v < 0.15) return mix(c0, c1, v / 0.15);
        if (v < 0.35) return mix(c1, c2, (v - 0.15) / 0.2);
        if (v < 0.65) return mix(c2, c3, (v - 0.35) / 0.3);
        return mix(c3, c4, (v - 0.65) / 0.35);
    } else if (palette == 1) {
        // Bioluminescente (Verde Elétrico, Esmeralda, Lima)
        vec3 c0 = vec3(0.01, 0.04, 0.03);
        vec3 c1 = vec3(0.04, 0.28, 0.22);
        vec3 c2 = vec3(0.12, 0.68, 0.45);
        vec3 c3 = vec3(0.55, 0.95, 0.35);
        vec3 c4 = vec3(0.85, 1.0, 0.65);

        if (v < 0.18) return mix(c0, c1, v / 0.18);
        if (v < 0.40) return mix(c1, c2, (v - 0.18) / 0.22);
        if (v < 0.70) return mix(c2, c3, (v - 0.40) / 0.30);
        return mix(c3, c4, (v - 0.70) / 0.30);
    } else if (palette == 2) {
        // Térmica (Índigo, Escarlate, Âmbar, Ouro)
        vec3 c0 = vec3(0.03, 0.01, 0.08);
        vec3 c1 = vec3(0.42, 0.08, 0.28);
        vec3 c2 = vec3(0.88, 0.25, 0.12);
        vec3 c3 = vec3(0.98, 0.72, 0.15);
        vec3 c4 = vec3(1.0, 0.98, 0.85);

        if (v < 0.15) return mix(c0, c1, v / 0.15);
        if (v < 0.38) return mix(c1, c2, (v - 0.15) / 0.23);
        if (v < 0.68) return mix(c2, c3, (v - 0.38) / 0.30);
        return mix(c3, c4, (v - 0.68) / 0.32);
    } else {
        // Obsidiana Cromo Metálico
        vec3 c0 = vec3(0.01, 0.01, 0.02);
        vec3 c1 = vec3(0.15, 0.16, 0.22);
        vec3 c2 = vec3(0.45, 0.48, 0.58);
        vec3 c3 = vec3(0.85, 0.88, 0.95);

        if (v < 0.25) return mix(c0, c1, v / 0.25);
        if (v < 0.60) return mix(c1, c2, (v - 0.25) / 0.35);
        return mix(c2, c3, (v - 0.60) / 0.40);
    }
}

void main() {
    vec2 texel = 1.0 / u_resolution;
    vec2 state = texture(u_texture, v_uv).rg;
    float v = state.g;

    vec3 baseColor = getPaletteColor(v, u_palette);

    if (u_bumpLight) {
        // Estimativa de gradiente normal para relevo sombreado 3D
        float vLeft  = texture(u_texture, v_uv - vec2(texel.x, 0.0)).g;
        float vRight = texture(u_texture, v_uv + vec2(texel.x, 0.0)).g;
        float vDown  = texture(u_texture, v_uv - vec2(0.0, texel.y)).g;
        float vUp    = texture(u_texture, v_uv + vec2(0.0, texel.y)).g;

        vec3 normal = normalize(vec3((vLeft - vRight) * 3.5, (vDown - vUp) * 3.5, 0.18));
        vec3 lightDir = normalize(vec3(0.4, 0.6, 0.8));

        float diffuse = clamp(dot(normal, lightDir), 0.0, 1.0);
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfDir), 0.0), 24.0) * 0.65;

        vec3 shaded = baseColor * (0.35 + 0.65 * diffuse) + vec3(spec);
        fragColor = vec4(shaded, 1.0);
    } else {
        fragColor = vec4(baseColor, 1.0);
    }
}
`;
