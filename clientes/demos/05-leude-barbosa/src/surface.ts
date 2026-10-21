import type { Mask } from './mask'
import type { SheetFrame } from './sheet'

// Amostra mineral em WebGL2: (1) BAKE único de relevo/poros (worley + fbm) para uma textura;
// (2) LUZ sob demanda: brilho especular controlado pela máscara (canal .a), com piso de 0,38 no próprio shader.

const VS = `#version 300 es
in vec2 p; out vec2 vUv;
void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`

const BAKE = `#version 300 es
precision highp float;
uniform float uDpr; out vec4 o;
vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
float h1(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(h1(i), h1(i + vec2(1, 0)), u.x), mix(h1(i + vec2(0, 1)), h1(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++) { s += a * vn(p); p *= 2.03; a *= .5; } return s; }
// poros: um por célula, raio e presença aleatórios (evita o padrão de bolinhas regulares)
float poro(vec2 p){ p /= 5.5; vec2 i = floor(p), f = fract(p); float m = 0.;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 g = vec2(x, y), c = i + g; vec2 r = g + h2(c) - f;
    float rad = .10 + .16 * h1(c + 3.1), on = step(.55, h1(c + 7.7)); m = max(m, on * (1. - smoothstep(rad * .35, rad, length(r)))); }
  return m; }
float hb(vec2 p){ return fbm(p / 110.); }
float hf(vec2 p){ return -.22 * poro(p) + .05 * fbm(p / 2.6); }
void main(){
  vec2 p = gl_FragCoord.xy / uDpr;
  // relevo largo (dobra o reflexo) + relevo fino (poros), guardados como gradiente
  vec2 gB = vec2(hb(p) - hb(p + vec2(4, 0)), hb(p) - hb(p + vec2(0, 4))) * 6.;
  float f0 = hf(p);
  vec2 gF = vec2(f0 - hf(p + vec2(1, 0)), f0 - hf(p + vec2(0, 1)));
  o = vec4(clamp((gB + gF) * .5 + .5, 0., 1.), 0., poro(p));
}`

const LIGHT = `#version 300 es
precision highp float;
uniform sampler2D uBake, uMask; uniform vec2 uRes; uniform vec4 uSheet; uniform float uRot, uPress, uRelevo; uniform vec3 uArgila;
in vec2 vUv; out vec4 o;
float sdRB(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }
void main(){
  vec4 b = texture(uBake, vUv);
  float m = texture(uMask, vec2(vUv.x, 1. - vUv.y)).a;
  vec3 N = normalize(vec3((b.xy * 2. - 1.) * uRelevo, 1.));
  float poro = b.w;
  float oil = mix(.38, 1., m);                         // piso: nunca vira giz
  float asp = uRes.x / uRes.y;
  // janela grande refletida: nítida e quebrada pelo relevo quando oleosa; desfocada e baixa quando tratada
  float rough = mix(.7, .05, oil);
  vec2 q = vUv + N.xy * mix(.10, .28, oil);
  float w = rough * .5 + .015;
  float jan = 1. - smoothstep(-w, w, sdRB((q - vec2(.64, .64)) * vec2(asp, 1.), vec2(.34 * asp, .3), .08));
  jan *= .55 + .45 * smoothstep(.4, .95, q.y);
  // faíscas de uma luz pontual no alto, à direita: somem quando o brilho baixa
  vec3 P = vec3(vUv.x * asp, vUv.y, 0.), L = normalize(vec3(.8 * asp, .85, .7) - P), H = normalize(L + vec3(0, 0, 1));
  float shin = mix(14., 220., oil);
  float glint = pow(max(dot(N, H), 0.), shin) * (shin + 8.) / 228.;
  float spec = jan * mix(.025, .32, oil) + glint * mix(.03, .5, oil);
  float diff = clamp(.8 + .2 * dot(N, L), 0., 1.);
  vec3 col = uArgila * mix(.9, 1.04, diff) * (1. - .03 * poro);
  col += vec3(1., .99, .965) * spec * (1. - .5 * poro);
  col = mix(col, 1. - .12 * exp(-(col - .88) / .12), step(.88, col));   // ombro suave, sem estourar
  // halo de contato em volta da folha pressionada
  vec2 sp = vUv - uSheet.xy; sp.x *= asp;
  float c = cos(uRot), s = sin(uRot); sp = mat2(c, s, -s, c) * sp;
  float sd = sdRB(sp, uSheet.zw * vec2(asp, 1.), .01);
  col *= 1. - .10 * uPress * smoothstep(.05, 0., abs(sd));
  o = vec4(col, 1.);
}`

function sh(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src); gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader')
  return s
}
function prog(gl: WebGL2RenderingContext, fs: string) {
  const p = gl.createProgram()!
  gl.attachShader(p, sh(gl, gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl, gl.FRAGMENT_SHADER, fs))
  gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link')
  return p
}

export function createSurface(canvas: HTMLCanvasElement, mask: Mask, onLost: () => void) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' })
  if (!gl) throw new Error('webgl2 indisponível')
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onLost() })
  const bakeP = prog(gl, BAKE), lightP = prog(gl, LIGHT)
  const vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const tex = () => { const t = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, t); for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); return t }
  const bakeTex = tex(), maskTex = tex()
  const fbo = gl.createFramebuffer()
  let w = 1, h = 1, dpr = 1, maskVer = -1

  function resize() {
    dpr = Math.min(devicePixelRatio, 1.5)
    const r = canvas.getBoundingClientRect()
    w = Math.max(2, Math.round(r.width * dpr)); h = Math.max(2, Math.round(r.height * dpr))
    canvas.width = w; canvas.height = h
    // BAKE: relevo e poros calculados uma vez por tamanho
    gl!.bindTexture(gl!.TEXTURE_2D, bakeTex)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA8, w, h, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null)
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo)
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, bakeTex, 0)
    gl!.viewport(0, 0, w, h)
    gl!.useProgram(bakeP)
    gl!.uniform1f(gl!.getUniformLocation(bakeP, 'uDpr'), dpr)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null)
  }

  let lastFrame: SheetFrame | null = null
  function draw(f: SheetFrame | null = lastFrame) {
    lastFrame = f
    if (mask.version !== maskVer) {
      maskVer = mask.version
      gl!.bindTexture(gl!.TEXTURE_2D, maskTex)
      gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA8, gl!.RGBA, gl!.UNSIGNED_BYTE, mask.canvas)
    }
    gl!.viewport(0, 0, w, h)
    gl!.useProgram(lightP)
    gl!.activeTexture(gl!.TEXTURE0); gl!.bindTexture(gl!.TEXTURE_2D, bakeTex)
    gl!.activeTexture(gl!.TEXTURE1); gl!.bindTexture(gl!.TEXTURE_2D, maskTex)
    const U = (n: string) => gl!.getUniformLocation(lightP, n)
    gl!.uniform1i(U('uBake'), 0); gl!.uniform1i(U('uMask'), 1)
    gl!.uniform2f(U('uRes'), w, h)
    gl!.uniform1f(U('uRelevo'), 1.)
    gl!.uniform3f(U('uArgila'), 0xc9 / 255, 0xcc / 255, 0xbf / 255)
    if (f) { gl!.uniform4f(U('uSheet'), f.u, 1 - f.v, f.hu, f.hv); gl!.uniform1f(U('uRot'), -f.rot); gl!.uniform1f(U('uPress'), f.press) }
    else { gl!.uniform4f(U('uSheet'), -9, -9, 0, 0); gl!.uniform1f(U('uPress'), 0) }
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }

  new ResizeObserver(() => { resize(); draw() }).observe(canvas)
  resize()
  draw(null)
  return { draw }
}
