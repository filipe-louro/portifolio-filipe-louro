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

  out vec4 outColor;

  // --- PARÂMETROS ---
  #define ITERATIONS 220        
  #define STEPSIZE 0.1          
  #define BH_RADIUS 1.5         
  #define ACCRETION_RADIUS 8.0  
  #define DISK_THICKNESS 0.1    
  #define GRAVITY_STRENGTH 0.4

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

  float getDiskDensity(vec3 p) {
    float dist = length(p);
    if (dist < BH_RADIUS * 1.5 || dist > ACCRETION_RADIUS) return 0.0;
    
    float h = abs(p.y);
    float density = 1.0 - smoothstep(0.0, DISK_THICKNESS, h);
    
    vec3 q = p;
    q.xz *= rot(u_time * 0.3 + 6.0 / (dist + 0.1)); 
    
    float clouds = fbm(q * 1.2);
    density *= clouds * 3.0; 
    
    density *= smoothstep(BH_RADIUS * 1.5, BH_RADIUS * 2.5, dist); 
    density *= 1.0 - smoothstep(ACCRETION_RADIUS * 0.6, ACCRETION_RADIUS, dist); 
    
    return max(0.0, density);
  }

  vec3 getStarfield(vec3 dir) {
    float s = pow(hash(dir.xy * 80.0 + dir.zz * 30.0), 500.0) * 0.8;
    return vec3(s);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    
    vec3 ro = vec3(0.0, 2.6, -15.0); 
    vec3 ta = vec3(0.0, 0.0, 0.0);
    
    vec3 ww = normalize(ta - ro);
    vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
    vec3 vv = normalize(cross(uu, ww));
    vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.2 * ww); 

    vec3 col = vec3(0.0);
    vec3 pos = ro;
    float totalDensity = 0.0;
    float glow = 0.0;
    bool hitHorizon = false;
    float minDist = 1000.0;

    for(int i = 0; i < ITERATIONS; i++) {
      float d = length(pos);
      minDist = min(minDist, d);

      vec3 gravityForce = normalize(-pos) * (GRAVITY_STRENGTH / (d * d + 0.05));
      rd = normalize(rd + gravityForce * STEPSIZE);
      
      pos += rd * STEPSIZE;
      
      if(d < BH_RADIUS) {
        hitHorizon = true;
        break; 
      }
      
      float dens = getDiskDensity(pos);
      if(dens > 0.001) {
        float temp = 1.0 / (d * 0.3); 
        vec3 baseFireColor = mix(vec3(1.0, 0.4, 0.1), vec3(0.9, 0.9, 1.0), temp * temp * 0.5);
        
        float doppler = 1.0 + dot(normalize(pos), vec3(1.0, 0.0, 0.0)) * 0.6;

        vec3 sampleCol = dens * baseFireColor * 0.08 * doppler;
        
        col += sampleCol * (1.0 - totalDensity); 
        totalDensity += dens * 0.08;
        
        if(totalDensity > 1.0) break;
      }
      
      glow += 0.01 / (d*d + 0.5);
    }
    
    if (!hitHorizon) {
       float distFromHorizon = max(0.0, minDist - BH_RADIUS);
       float angle = atan(uv.y, uv.x);
       float horizFactor = abs(cos(angle));
       horizFactor = pow(horizFactor, 4.0); 
       float falloff = mix(10.0, 2.8, horizFactor);
       float photonRingIntensity = exp(-distFromHorizon * falloff);
       vec3 whiteLight = vec3(1.15, 1.1, 1.05) * photonRingIntensity;
       col += whiteLight * (1.0 - totalDensity) * 0.8;
       vec3 stars = getStarfield(rd);
       col += stars * (1.0 - min(1.0, totalDensity * 1.5 + photonRingIntensity * 2.0));
    } 

    col += vec3(1.0, 0.6, 0.3) * glow * 0.5;
    
    col = col / (col + vec3(1.0));        
    col = pow(col, vec3(0.4545));        
    col = smoothstep(0.0, 1.0, col * 1.2); 
    
    float vin = 1.0 - dot(uv, uv) * 0.6;
    col *= vin;

    outColor = vec4(col, 1.0);
  }
`;