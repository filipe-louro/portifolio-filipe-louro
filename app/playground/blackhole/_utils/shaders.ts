export const vertexShaderSource = `#version 300 es
  in vec2 a_position;
  out vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const fragmentShaderSource = `#version 300 es
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_steps;

  out vec4 outColor;

  #define MAX_STEPS 260
  #define BH_RADIUS 1.5
  #define DISK_INNER 2.25
  #define DISK_OUTER 8.0
  #define DISK_THICKNESS 0.12
  #define GRAVITY_STRENGTH 0.4
  #define BOUNDS_RADIUS 9.5

  mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = i.x + i.y * 57.0 + i.z * 113.0;
    return mix(mix(mix(hash(i.xy + vec2(0,0) + vec2(i.z,0)),
                       hash(i.xy + vec2(1,0) + vec2(i.z,0)), f.x),
                   mix(hash(i.xy + vec2(0,1) + vec2(i.z,0)),
                       hash(i.xy + vec2(1,1) + vec2(i.z,0)), f.x), f.y),
               mix(mix(hash(i.xy + vec2(0,0) + vec2(i.z,1)),
                       hash(i.xy + vec2(1,0) + vec2(i.z,1)), f.x),
                   mix(hash(i.xy + vec2(0,1) + vec2(i.z,1)),
                       hash(i.xy + vec2(1,1) + vec2(i.z,1)), f.x), f.y), f.z);
  }

  float fbm(vec3 p) {
    float f = 0.0;
    float w = 0.5;
    for (int i = 0; i < 4; i++) {
      f += w * noise(p);
      p *= 2.0;
      w *= 0.5;
    }
    return f;
  }

  float getDiskDensity(vec3 p, float dist) {
    float h = abs(p.y);
    float density = 1.0 - smoothstep(0.0, DISK_THICKNESS, h);
    if (density <= 0.0) return 0.0;

    vec3 q = p;
    q.xz *= rot(u_time * 0.3 + 6.0 / (dist + 0.1));

    density *= fbm(q * 1.2) * 3.0;
    density *= smoothstep(DISK_INNER, BH_RADIUS * 2.5, dist);
    density *= 1.0 - smoothstep(DISK_OUTER * 0.6, DISK_OUTER, dist);

    return max(0.0, density);
  }

  // Estrelas ancoradas em células angulares: estáveis quando a resolução
  // interna muda (o hash por pixel antigo "fervilhava" ao reescalar).
  float starLayer(vec3 dir, float scale, float threshold) {
    vec2 sph = vec2(atan(dir.z, dir.x), asin(clamp(dir.y, -1.0, 1.0)));
    vec2 g = sph * scale;
    vec2 id = floor(g);
    float h = hash(id);
    if (h < threshold) return 0.0;

    vec2 starPos = vec2(hash(id + 17.0), hash(id + 43.0));
    float d = length(fract(g) - starPos);
    float brightness = (h - threshold) / (1.0 - threshold);
    float twinkle = 0.75 + 0.25 * sin(u_time * 2.0 + h * 40.0);
    return smoothstep(0.06, 0.0, d) * brightness * twinkle;
  }

  vec3 getBackground(vec3 dir) {
    vec3 col = vec3(0.0);
    col += vec3(1.0, 0.97, 0.92) * starLayer(dir, 48.0, 0.93);
    col += vec3(0.82, 0.88, 1.0) * starLayer(dir, 21.0, 0.955) * 1.4;

    float neb = noise(dir * 3.0) * 0.5 + noise(dir * 7.0) * 0.25;
    col += vec3(0.10, 0.05, 0.16) * neb * neb;
    return col;
  }

  vec3 diskColor(float dist) {
    float temp = clamp(DISK_INNER / dist, 0.0, 1.0);
    return mix(vec3(1.0, 0.30, 0.05), vec3(1.30, 1.15, 1.00), pow(temp, 1.5));
  }

  vec3 acesTonemap(vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    float yaw = sin(u_time * 0.05) * 0.10;
    vec3 ro = vec3(sin(yaw) * 15.0, 2.6 + sin(u_time * 0.07) * 0.15, -cos(yaw) * 15.0);
    vec3 ta = vec3(0.0);

    vec3 ww = normalize(ta - ro);
    vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
    vec3 vv = normalize(cross(uu, ww));
    vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.2 * ww);

    float jitter = hash(gl_FragCoord.xy + fract(u_time) * 61.0);

    // Avança analiticamente até a esfera de interesse: fora dela nada
    // acontece, então marchar até lá seria puro desperdício de passos.
    vec3 pos = ro;
    float b = dot(ro, rd);
    float discriminant = b * b - (dot(ro, ro) - BOUNDS_RADIUS * BOUNDS_RADIUS);
    bool intersectsBounds = discriminant > 0.0;
    if (intersectsBounds) {
      float tEntry = max(0.0, -b - sqrt(discriminant));
      pos = ro + rd * tEntry;
    }

    vec3 col = vec3(0.0);
    float totalDensity = 0.0;
    float glow = 0.0;
    bool hitHorizon = false;
    float minDist = 1000.0;
    int steps = int(u_steps);

    if (intersectsBounds) {
      for (int i = 0; i < MAX_STEPS; i++) {
        if (i >= steps) break;

        float d = length(pos);
        minDist = min(minDist, d);

        if (d < BH_RADIUS) {
          hitHorizon = true;
          break;
        }
        if (d > BOUNDS_RADIUS && dot(pos, rd) > 0.0) break;

        // Passo proporcional à distância: fino perto do horizonte, onde a
        // lente gravitacional exige precisão; largo na periferia.
        float stepLen = clamp(d * 0.085, 0.05, 0.28);
        if (i == 0) stepLen *= jitter + 0.5;

        rd = normalize(rd + normalize(-pos) * (GRAVITY_STRENGTH / (d * d + 0.05)) * stepLen);
        pos += rd * stepLen;

        if (abs(pos.y) < DISK_THICKNESS && d > DISK_INNER && d < DISK_OUTER) {
          float dens = getDiskDensity(pos, d);
          if (dens > 0.001) {
            vec3 tangent = vec3(-pos.z, 0.0, pos.x) / max(d, 0.001);
            float dop = 1.0 + dot(tangent, -rd) * 0.65;

            vec3 base = diskColor(d);
            base = mix(base, vec3(0.75, 0.85, 1.25), clamp((dop - 1.0) * 0.6, 0.0, 0.5));

            // stepLen/0.1 normaliza a emissão para o passo variável
            vec3 sampleCol = dens * base * 0.08 * (dop * dop) * (stepLen / 0.1);
            col += sampleCol * (1.0 - totalDensity);
            totalDensity += dens * 0.08 * (stepLen / 0.1);

            if (totalDensity > 0.98) break;
          }
        }

        glow += 0.01 / (d * d + 0.5) * (stepLen / 0.1);
      }
    }

    if (!hitHorizon) {
      float distFromHorizon = max(0.0, minDist - BH_RADIUS);
      float angle = atan(uv.y, uv.x);
      float horizFactor = pow(abs(cos(angle)), 4.0);
      float falloff = mix(10.0, 2.8, horizFactor);
      float photonRingIntensity = exp(-distFromHorizon * falloff);
      col += vec3(1.15, 1.1, 1.05) * photonRingIntensity * (1.0 - totalDensity) * 0.8;

      vec3 background = getBackground(rd);
      col += background * (1.0 - min(1.0, totalDensity * 1.5 + photonRingIntensity * 2.0));
    }

    col += vec3(1.0, 0.6, 0.3) * glow * 0.5;

    col = acesTonemap(col * 1.15);
    col = pow(col, vec3(0.4545));

    float vin = 1.0 - dot(uv, uv) * 0.6;
    col *= vin;

    // dither de 1 bit contra banding, visível principalmente no glow escuro
    col += (hash(gl_FragCoord.xy * 1.37 + fract(u_time * 7.0)) - 0.5) * (2.0 / 255.0);

    outColor = vec4(col, 1.0);
  }
`;
