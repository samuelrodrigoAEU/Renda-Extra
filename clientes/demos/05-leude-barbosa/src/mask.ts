// Máscara de oleosidade 256×256 (canal ALFA = brilho restante) + amostrador 32×32.
// destination-out mexe no alfa: por isso o shader e o fallback leem .a, nunca .r.

export const FLOOR = 0.38 // piso: o brilho nunca chega ao fosco de giz
const S = 256, SMALL = 32

function mulberry32(a: number) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

export type Sample = { oilUnder: number; oilAvg: number; treated: number }

export function createMask() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = S
  const g = canvas.getContext('2d', { willReadFrequently: true })!   // CPU: a leitura de 250 em 250 ms não força cópia da GPU
  const small = document.createElement('canvas')
  small.width = small.height = SMALL
  const sg = small.getContext('2d', { willReadFrequently: true })!
  let version = 0

  function paint() {
    const rnd = mulberry32(21)
    g.globalCompositeOperation = 'source-over'
    g.clearRect(0, 0, S, S)
    g.fillStyle = 'rgba(255,255,255,0.72)'
    g.fillRect(0, 0, S, S)
    for (let i = 0; i < 22; i++) {
      const x = rnd() * S, y = rnd() * S, r = 30 + rnd() * 70
      const gr = g.createRadialGradient(x, y, 0, x, y, r)
      gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = gr
      g.fillRect(x - r, y - r, r * 2, r * 2)
    }
    version++
  }

  // Carimbo elíptico (u,v em 0..1; rx, ry em fração da amostra). a = intensidade neste quadro.
  function stamp(u: number, v: number, rx: number, ry: number, a: number) {
    g.save()
    g.globalCompositeOperation = 'destination-out'
    g.translate(u * S, v * S)
    g.scale(rx * S, ry * S)
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1)
    gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(0.7, `rgba(0,0,0,${a * 0.6})`); gr.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = gr
    g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill()
    g.restore()
    version++
  }

  // Leitura barata: só a cópia 32×32, chamada no máximo a cada 250 ms durante a interação.
  function sample(rect: { u0: number; v0: number; u1: number; v1: number }): Sample {
    sg.clearRect(0, 0, SMALL, SMALL)
    sg.drawImage(canvas, 0, 0, SMALL, SMALL)
    const d = sg.getImageData(0, 0, SMALL, SMALL).data
    let sum = 0, under = 0, nUnder = 0, low = 0
    for (let y = 0; y < SMALL; y++) for (let x = 0; x < SMALL; x++) {
      const a = d[(y * SMALL + x) * 4 + 3] / 255
      const oil = FLOOR + (1 - FLOOR) * a
      sum += oil
      if (a < 0.12) low++
      const u = (x + 0.5) / SMALL, v = (y + 0.5) / SMALL
      if (u >= rect.u0 && u <= rect.u1 && v >= rect.v0 && v <= rect.v1) { under += oil; nUnder++ }
    }
    const n = SMALL * SMALL
    return { oilUnder: nUnder ? under / nUnder : sum / n, oilAvg: sum / n, treated: low / n }
  }

  paint()
  return { canvas, paint, stamp, sample, get version() { return version } }
}
export type Mask = ReturnType<typeof createMask>
