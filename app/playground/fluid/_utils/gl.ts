export interface GLProgram {
    program: WebGLProgram;
    uniforms: Record<string, WebGLUniformLocation | null>;
}

export interface FBO {
    texture: WebGLTexture;
    fbo: WebGLFramebuffer;
    width: number;
    height: number;
    texelSizeX: number;
    texelSizeY: number;
}

export interface DoubleFBO {
    width: number;
    height: number;
    texelSizeX: number;
    texelSizeY: number;
    read: FBO;
    write: FBO;
    swap: () => void;
}

export function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Não foi possível criar o shader.');

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Erro ao compilar shader: ${info}`);
    }

    return shader;
}

function extractUniformNames(source: string): string[] {
    const names = new Set<string>();
    const regex = /uniform\s+\w+\s+(\w+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(source)) !== null) names.add(match[1]);
    return Array.from(names);
}

export function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentSource: string): GLProgram {
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    if (!program) throw new Error('Não foi possível criar o programa WebGL.');

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(`Erro ao linkar programa WebGL: ${info}`);
    }

    // Um fragment shader que não lê vL/vR/vT/vB pode fazer o linker eliminar
    // texelSize (só usado no vertex shader para calcular essas varyings), então
    // toda entrada é registrada mesmo quando a location vem null — os
    // uniformXf abaixo aceitam null como "ignorar", mas não aceitam undefined.
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    const uniformNames = new Set(extractUniformNames(fragmentSource));
    uniformNames.add('texelSize');
    for (const name of uniformNames) {
        uniforms[name] = gl.getUniformLocation(program, name);
    }

    return { program, uniforms };
}

export function createFBO(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
    internalFormat: number,
    format: number,
    filtering: number
): FBO {
    const texture = gl.createTexture();
    if (!texture) throw new Error('Não foi possível criar a textura.');

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtering);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtering);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, gl.HALF_FLOAT, null);

    const fbo = gl.createFramebuffer();
    if (!fbo) throw new Error('Não foi possível criar o framebuffer.');

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return { texture, fbo, width, height, texelSizeX: 1 / width, texelSizeY: 1 / height };
}

export function createDoubleFBO(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
    internalFormat: number,
    format: number,
    filtering: number
): DoubleFBO {
    let fbo1 = createFBO(gl, width, height, internalFormat, format, filtering);
    let fbo2 = createFBO(gl, width, height, internalFormat, format, filtering);

    return {
        width,
        height,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read() {
            return fbo1;
        },
        get write() {
            return fbo2;
        },
        swap() {
            const temp = fbo1;
            fbo1 = fbo2;
            fbo2 = temp;
        },
    };
}

export function deleteFBO(gl: WebGL2RenderingContext, fbo: FBO): void {
    gl.deleteTexture(fbo.texture);
    gl.deleteFramebuffer(fbo.fbo);
}

export function deleteDoubleFBO(gl: WebGL2RenderingContext, fbo: DoubleFBO): void {
    deleteFBO(gl, fbo.read);
    deleteFBO(gl, fbo.write);
}

export function getResolution(canvasWidth: number, canvasHeight: number, resolution: number) {
    let aspectRatio = canvasWidth / canvasHeight;
    if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;

    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);

    return canvasWidth > canvasHeight ? { width: max, height: min } : { width: min, height: max };
}

export interface FluidGLContext {
    gl: WebGL2RenderingContext;
    formatRGBA: { internalFormat: number; format: number };
    formatRG: { internalFormat: number; format: number };
    formatR: { internalFormat: number; format: number };
}

export function getFluidGLContext(canvas: HTMLCanvasElement): FluidGLContext | null {
    const gl = canvas.getContext('webgl2', {
        alpha: false,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false,
    }) as WebGL2RenderingContext | null;

    if (!gl) return null;

    // Renderizar em texturas de ponto flutuante exige uma destas extensões;
    // sem elas o ping-pong de velocidade/densidade não funciona no WebGL2.
    const hasFloatBuffer = gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float');
    if (!hasFloatBuffer) return null;

    gl.getExtension('OES_texture_float_linear');

    return {
        gl,
        formatRGBA: { internalFormat: gl.RGBA16F, format: gl.RGBA },
        formatRG: { internalFormat: gl.RG16F, format: gl.RG },
        formatR: { internalFormat: gl.R16F, format: gl.RED },
    };
}
