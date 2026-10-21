import type { Mask } from './mask'

// Sem WebGL2: duas camadas. A camada CSS .brilho fica fixa a 38% (o piso); por cima, este canvas de
// reflexo a 62% recebe os mesmos carimbos da máscara (destination-in pelo alfa), então as pressões acumulam.
export function createFallback(canvas: HTMLCanvasElement, mask: Mask) {
  const g = canvas.getContext('2d')!
  let w = 1, h = 1, ver = -1
  function resize() {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 1.5)
    w = canvas.width = Math.max(2, Math.round(r.width * dpr)); h = canvas.height = Math.max(2, Math.round(r.height * dpr))
    ver = -1; draw()
  }
  function draw() {
    if (mask.version === ver) return
    ver = mask.version
    g.globalCompositeOperation = 'source-over'
    g.clearRect(0, 0, w, h)
    for (const [x, y, r, a] of [[0.68, 0.3, 0.42, 0.75], [0.3, 0.7, 0.35, 0.45]]) {
      const gr = g.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * Math.max(w, h))
      gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = gr; g.fillRect(0, 0, w, h)
    }
    g.globalCompositeOperation = 'destination-in'
    g.drawImage(mask.canvas, 0, 0, w, h)
  }
  new ResizeObserver(resize).observe(canvas)
  resize()
  return { draw: () => draw() }
}
