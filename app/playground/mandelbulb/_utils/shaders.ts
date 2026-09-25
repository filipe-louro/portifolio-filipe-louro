export const vertexShaderSource = `#version 300 es
precision highp float;

in vec2 aPosition;
out vec2 vUv;

void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const fragmentShaderSource = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform vec2 uRotation;
uniform float uZoom;
uniform float uPower;
uniform int uMaxIterations;
uniform int uPalette;
uniform float uGlow;
uniform float uTime;

vec2 intersectSphere(vec3 ro, vec3 rd, float radius) {
    float b = dot(ro, rd);
    float c = dot(ro, ro) - radius * radius;
    float h = b * b - c;
    if (h < 0.0) return vec2(-1.0);
    h = sqrt(h);
    return vec2(-b - h, -b + h);
}

float mapDE(vec3 p, out float trap, out float iterCount) {
    vec3 z = p;
    float dr = 1.0;
    float r = 0.0;
    float minR = 100.0;
    int maxIt = uMaxIterations;

    for (int i = 0; i < 14; i++) {
        if (i >= maxIt) break;
        r = length(z);
        if (r > 2.0) {
            iterCount = float(i);
            break;
        }
        minR = min(minR, r);

        float safeR = max(r, 0.0001);
        float theta = acos(clamp(z.z / safeR, -1.0, 1.0));
        float phi = atan(z.y, z.x);
        dr = pow(safeR, uPower - 1.0) * uPower * dr + 1.0;

        float zr = pow(safeR, uPower);
        theta = theta * uPower;
        phi = phi * uPower;

        z = zr * vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta)) + p;
        iterCount = float(i + 1);
    }
    trap = minR;
    return 0.5 * log(max(r, 0.0001)) * max(r, 0.0001) / max(dr, 0.0001);
}

float map(vec3 p) {
    float dummyTrap;
    float dummyIter;
    return mapDE(p, dummyTrap, dummyIter);
}

vec3 calcNormal(vec3 p, float d) {
    float eps = max(0.0008, d * 0.5);
    vec2 e = vec2(eps, 0.0);
    return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
    ));
}

vec3 getPaletteColor(float t, int pal) {
    if (pal == 0) {
        vec3 a = vec3(0.5, 0.2, 0.6);
        vec3 b = vec3(0.5, 0.4, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.6, 0.2, 0.8);
        return a + b * cos(6.28318 * (c * t + d));
    } else if (pal == 1) {
        vec3 a = vec3(0.6, 0.4, 0.2);
        vec3 b = vec3(0.4, 0.3, 0.2);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.1, 0.2, 0.5);
        return a + b * cos(6.28318 * (c * t + d));
    } else if (pal == 2) {
        vec3 a = vec3(0.1, 0.5, 0.4);
        vec3 b = vec3(0.3, 0.4, 0.4);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.2, 0.7, 0.6);
        return a + b * cos(6.28318 * (c * t + d));
    } else {
        vec3 a = vec3(0.8, 0.5, 0.7);
        vec3 b = vec3(0.4, 0.5, 0.3);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.0, 0.33, 0.67);
        return a + b * cos(6.28318 * (c * t + d));
    }
}

mat3 setCamera(vec3 ro, vec3 ta) {
    vec3 cw = normalize(ta - ro);
    vec3 cp = vec3(0.0, 1.0, 0.0);
    vec3 cu = normalize(cross(cw, cp));
    vec3 cv = cross(cu, cw);
    return mat3(cu, cv, cw);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);

    float yaw = uRotation.x;
    float pitch = uRotation.y;

    float camDist = uZoom;
    vec3 ro = vec3(
        camDist * cos(pitch) * sin(yaw),
        camDist * sin(pitch),
        camDist * cos(pitch) * cos(yaw)
    );
    vec3 ta = vec3(0.0);

    mat3 camMat = setCamera(ro, ta);
    vec3 rd = camMat * normalize(vec3(uv, 1.8));

    vec3 bgColor = mix(vec3(0.02, 0.01, 0.04), vec3(0.04, 0.02, 0.08), clamp(uv.y + 0.5, 0.0, 1.0));

    vec2 bSphere = intersectSphere(ro, rd, 1.35);

    if (bSphere.y < 0.0) {
        fragColor = vec4(bgColor, 1.0);
        return;
    }

    float t = max(0.0, bSphere.x);
    float tMax = bSphere.y;

    float d = 0.0;
    float trap = 0.0;
    float iters = 0.0;
    float glowAcc = 0.0;
    bool hit = false;
    int stepCount = 0;

    for (int i = 0; i < 90; i++) {
        stepCount = i;
        vec3 p = ro + rd * t;
        d = mapDE(p, trap, iters);

        glowAcc += exp(-d * 8.0) * (0.015 * uGlow);

        if (d < 0.0015 * (1.0 + t * 0.4)) {
            hit = true;
            break;
        }

        t += d * 0.85;
        if (t > tMax) break;
    }

    vec3 col = bgColor;

    if (hit) {
        vec3 p = ro + rd * t;
        vec3 normal = calcNormal(p, d);

        vec3 lightDir1 = normalize(vec3(0.6, 0.8, 0.5));
        vec3 lightDir2 = normalize(vec3(-0.6, -0.4, -0.5));

        float diff1 = max(0.0, dot(normal, lightDir1));
        float diff2 = max(0.0, dot(normal, lightDir2)) * 0.4;

        vec3 ref = reflect(rd, normal);
        float spec = pow(max(0.0, dot(ref, lightDir1)), 16.0) * 0.6;

        float ao = clamp(1.0 - float(stepCount) / 80.0, 0.1, 1.0);

        float colorParam = trap * 1.5 + iters * 0.1;
        vec3 surfaceColor = getPaletteColor(colorParam, uPalette);

        col = surfaceColor * (diff1 + diff2 + 0.15) * ao + vec3(spec);
        col = mix(col, bgColor, 1.0 - exp(-0.08 * t * t));
    }

    vec3 glowColor = getPaletteColor(0.2 + uTime * 0.02, uPalette);
    col += glowColor * glowAcc;
    col *= 1.0 - 0.2 * dot(uv, uv);

    fragColor = vec4(col, 1.0);
}
`;
