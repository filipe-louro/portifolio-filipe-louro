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
  uniform float u_beamIntensity;
  uniform float u_diskSpeed;
  uniform float u_cameraTilt;
  uniform float u_autoRotate;

  out vec4 outColor;

  #define MAX_STEPS 260
  #define BH_RADIUS 1.5
  #define DISK_INNER 1.65
  #define DISK_OUTER 8.0
  #define DISK_THICKNESS 0.12
  #define GRAVITY_STRENGTH 0.4
  #define BOUNDS_RADIUS 9.5

  mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  // Dave Hoskins - Hash without Sine (ALU-fast & cross-platform)
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm2D(vec2 p) {
    return noise2D(p) * 0.65 + noise2D(p * 2.05) * 0.35;
  }

  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i.xy + vec2(0.0, 0.0) + vec2(i.z, 0.0)),
                       hash(i.xy + vec2(1.0, 0.0) + vec2(i.z, 0.0)), f.x),
                   mix(hash(i.xy + vec2(0.0, 1.0) + vec2(i.z, 0.0)),
                       hash(i.xy + vec2(1.0, 1.0) + vec2(i.z, 0.0)), f.x), f.y),
               mix(mix(hash(i.xy + vec2(0.0, 0.0) + vec2(i.z, 1.0)),
                       hash(i.xy + vec2(1.0, 0.0) + vec2(i.z, 1.0)), f.x),
                   mix(hash(i.xy + vec2(0.0, 1.0) + vec2(i.z, 1.0)),
                       hash(i.xy + vec2(1.0, 1.0) + vec2(i.z, 1.0)), f.x), f.y), f.z);
  }

  float getDiskDensity(vec3 p, float dist) {
    float h = abs(p.y);
    float thickness = DISK_THICKNESS * (0.80 + 0.20 * sin(dist * 5.0 - u_time * 0.3 * u_diskSpeed));
    float density = 1.0 - smoothstep(0.0, thickness, h);
    if (density <= 0.0) return 0.0;

    float phi = atan(p.z, p.x);
    float kepler = (u_time * 0.35 * u_diskSpeed) + 5.5 / (sqrt(dist) + 0.2);
    vec2 polar = vec2(dist * 2.2, (phi + kepler) * 2.8);

    float clouds = pow(fbm2D(polar), 1.6) * 3.8;

    float r1 = sin(dist * 14.0 - u_time * 0.2 * u_diskSpeed);
    float r2 = sin(dist * 31.0 + u_time * 0.1 * u_diskSpeed);
    float rings = 0.60 + 0.25 * r1 + 0.15 * r2;

    density *= clouds * rings;
    density *= smoothstep(DISK_INNER, DISK_INNER + 0.85, dist);
    density *= 1.0 - smoothstep(DISK_OUTER * 0.65, DISK_OUTER, dist);

    return max(0.0, density);
  }

  // Fundo com campo estelar e nebulosa
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

    float neb = noise3D(dir * 3.0) * 0.5 + noise3D(dir * 7.0) * 0.25;
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

    float yaw = u_autoRotate > 0.5 ? sin(u_time * 0.05) * 0.10 : 0.0;
    float camY = 2.6 + u_cameraTilt * 3.5 + (u_autoRotate > 0.5 ? sin(u_time * 0.07) * 0.15 : 0.0);
    vec3 ro = vec3(sin(yaw) * 15.0, camY, -cos(yaw) * 15.0);
    vec3 ta = vec3(0.0, 0.0, 0.0);

    vec3 ww = normalize(ta - ro);
    vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
    vec3 vv = normalize(cross(uu, ww));
    vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.2 * ww);

    float jitter = hash(gl_FragCoord.xy + fract(u_time) * 61.0);

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
    float hitIncidence = 1.0;
    float minDist = 1000.0;
    int steps = int(u_steps);

    if (intersectsBounds) {
      for (int i = 0; i < MAX_STEPS; i++) {
        if (i >= steps) break;

        float d = length(pos);

        if (d > BOUNDS_RADIUS && dot(pos, rd) > 0.0) break;

        // Passo adaptativo: saltos largos no vácuo, passos refinados na lâmina do disco
        float stepLen;
        bool inDiskZone = abs(pos.y) < 0.35 && d >= (DISK_INNER * 0.9) && d <= (DISK_OUTER * 1.05);
        if (inDiskZone) {
          stepLen = clamp(d * 0.024, 0.04, 0.09);
        } else if (d < 2.8) {
          stepLen = clamp(d * 0.040, 0.05, 0.12);
        } else {
          stepLen = clamp(d * 0.075, 0.22, 0.50);
        }

        if (i == 0) stepLen *= jitter + 0.5;

        rd = normalize(rd + normalize(-pos) * (GRAVITY_STRENGTH / (d * d + 0.05)) * stepLen);

        float tClosest = clamp(-dot(pos, rd), 0.0, stepLen);
        vec3 closestPos = pos + rd * tClosest;
        float dSeg = length(closestPos);
        minDist = min(minDist, dSeg);

        if (dSeg < BH_RADIUS) {
          hitHorizon = true;
          hitIncidence = dot(rd, normalize(-closestPos));
          break;
        }

        pos += rd * stepLen;

        if (abs(pos.y) < DISK_THICKNESS * 1.35 && d > DISK_INNER && d < DISK_OUTER) {
          float dens = getDiskDensity(pos, d);
          if (dens > 0.001) {
            vec3 tangent = vec3(-pos.z, 0.0, pos.x) / max(d, 0.001);
            float dop = 1.0 + dot(tangent, -rd) * 0.68;

            // Relativistic Doppler beaming com potência 3.5
            float beaming = pow(max(0.01, dop), 3.5);

            vec3 base = diskColor(d);
            // Blueshift térmico no lado em aproximação, redshift no lado em afastamento
            float blueShift = clamp((dop - 1.0) * 0.75, 0.0, 0.65);
            base = mix(base, vec3(0.80, 0.95, 1.35), blueShift);
            float redShift = clamp((1.0 - dop) * 0.55, 0.0, 0.45);
            base = mix(base, vec3(0.95, 0.22, 0.03), redShift);

            // Borda interna incandescente no raio ISCO (r = 1.65)
            float iscoRim = smoothstep(DISK_INNER + 0.65, DISK_INNER + 0.02, d);
            base += vec3(1.5, 1.35, 1.15) * iscoRim * 2.4;

            // Feixe equatorial relativístico (fatia radiante frontal quando pos.z < 0.0)
            float isFront = smoothstep(0.8, -0.8, pos.z);
            float beamBoost = 1.0 + (u_beamIntensity * 2.2) * isFront;

            vec3 sampleCol = dens * base * 0.09 * beaming * beamBoost * (stepLen / 0.1);
            col += sampleCol * (1.0 - totalDensity);
            totalDensity += dens * 0.09 * beamBoost * (stepLen / 0.1);

            if (totalDensity > 0.98) break;
          }
        }

        glow += 0.01 / (d * d + 0.5) * (stepLen / 0.1);
      }
    }

    if (hitHorizon) {
      float grazing = pow(clamp(1.0 - hitIncidence, 0.0, 1.0), 6.0);
      col += vec3(1.30, 1.15, 1.00) * grazing * 0.9 * (1.0 - totalDensity);
    } else {
      float distFromHorizon = max(0.0, minDist - BH_RADIUS);
      float angle = atan(uv.y, uv.x);
      float horizFactor = pow(abs(cos(angle)), 4.0);

      float ringCore = exp(-distFromHorizon * mix(14.0, 6.0, horizFactor));
      float ringHalo = exp(-distFromHorizon * mix(5.0, 1.8, horizFactor));
      col += (vec3(1.30, 1.15, 1.00) * ringCore * 1.25 + vec3(1.0, 0.72, 0.45) * ringHalo * 0.35)
             * (1.0 - totalDensity) * 0.85;

      vec3 background = getBackground(rd);
      col += background * (1.0 - min(1.0, totalDensity * 1.5 + ringCore * 2.0));
    }

    col += vec3(1.0, 0.6, 0.3) * glow * 0.5;

    col = acesTonemap(col * 1.15);

    outColor = vec4(col, 1.0);
  }
`;

// --- Pós-processamento anamórfico e composição ---

export const brightPassShaderSource = `#version 300 es
  precision mediump float;

  uniform sampler2D u_scene;
  uniform vec2 u_texelSize;
  uniform vec2 u_viewportScale;

  in vec2 v_uv;
  out vec4 outColor;

  void main() {
    vec2 uv = v_uv * u_viewportScale;
    vec2 maxUv = u_viewportScale;

    vec3 c = texture(u_scene, uv).rgb * 0.25;
    c += texture(u_scene, clamp(uv + vec2( u_texelSize.x,  u_texelSize.y), vec2(0.0), maxUv)).rgb * 0.1875;
    c += texture(u_scene, clamp(uv + vec2(-u_texelSize.x,  u_texelSize.y), vec2(0.0), maxUv)).rgb * 0.1875;
    c += texture(u_scene, clamp(uv + vec2( u_texelSize.x, -u_texelSize.y), vec2(0.0), maxUv)).rgb * 0.1875;
    c += texture(u_scene, clamp(uv + vec2(-u_texelSize.x, -u_texelSize.y), vec2(0.0), maxUv)).rgb * 0.1875;

    float luma = dot(c, vec3(0.299, 0.587, 0.114));
    outColor = vec4(c * smoothstep(0.45, 0.85, luma), 1.0);
  }
`;

export const blurShaderSource = `#version 300 es
  precision mediump float;

  uniform sampler2D u_texture;
  uniform vec2 u_direction;
  uniform vec2 u_viewportScale;

  in vec2 v_uv;
  out vec4 outColor;

  void main() {
    vec2 uv = v_uv * u_viewportScale;
    vec2 maxUv = u_viewportScale;

    vec3 c = texture(u_texture, uv).rgb * 0.2270;
    c += texture(u_texture, clamp(uv + u_direction * 1.3846, vec2(0.0), maxUv)).rgb * 0.3162;
    c += texture(u_texture, clamp(uv - u_direction * 1.3846, vec2(0.0), maxUv)).rgb * 0.3162;
    c += texture(u_texture, clamp(uv + u_direction * 3.2308, vec2(0.0), maxUv)).rgb * 0.0703;
    c += texture(u_texture, clamp(uv - u_direction * 3.2308, vec2(0.0), maxUv)).rgb * 0.0703;
    outColor = vec4(c, 1.0);
  }
`;

export const compositeShaderSource = `#version 300 es
  precision mediump float;

  uniform sampler2D u_scene;
  uniform sampler2D u_bloom;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_viewportScaleScene;
  uniform vec2 u_viewportScaleBloom;

  in vec2 v_uv;
  out vec4 outColor;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec3 col = texture(u_scene, clamp(v_uv * u_viewportScaleScene, vec2(0.0), u_viewportScaleScene)).rgb;
    vec3 bloom = texture(u_bloom, clamp(v_uv * u_viewportScaleBloom, vec2(0.0), u_viewportScaleBloom)).rgb;

    col += bloom * 0.90;

    col = pow(col, vec3(0.4545));

    vec2 uv = (v_uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
    col *= 1.0 - dot(uv, uv) * 0.6;

    col += (hash(gl_FragCoord.xy * 1.37 + fract(u_time * 7.0)) - 0.5) * (2.0 / 255.0);

    outColor = vec4(col, 1.0);
  }
`;
