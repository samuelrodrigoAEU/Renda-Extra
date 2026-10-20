// Tipografia elástica: a palavra se comporta como uma mola (Hooke + amortecimento).
// O eixo de largura (wdth 50–150) da Anybody estica; o peso afina quando a palavra estica, como um elástico.
// O tamanho da fonte é recalculado para a palavra sempre ocupar a largura da caixa: esticar achata, comprimir alonga.

type Opts = { min?: number; max?: number; k?: number; c?: number; rest?: number; maxH?: () => number; reduced: boolean }

export function elastic(el: HTMLElement, o: Opts) {
  const min = o.min ?? 50, max = o.max ?? 150, k = o.k ?? 90, c = o.c ?? 9
  // mede a largura da palavra a 100px em 5 larguras para interpolar o tamanho ideal
  const probe = el.cloneNode(true) as HTMLElement
  Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', fontSize: '100px', whiteSpace: 'nowrap', width: 'auto', left: '-9999px' })
  document.body.append(probe)
  const samples = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const w = min + (max - min) * t
    probe.style.fontStretch = `${w}%`
    probe.style.fontWeight = String(Math.round(820 - t * 380))
    return probe.getBoundingClientRect().width / 100
  })
  probe.remove()
  const ratioAt = (t: number) => { const f = t * 4, i = Math.min(3, Math.floor(f)); return samples[i] + (samples[i + 1] - samples[i]) * (f - i) }

  const box = el.parentElement!
  const inner = () => { const cs = getComputedStyle(box); return box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) }
  let pos = o.rest ?? 0.55, vel = 0, target = pos, raf = 0, last = 0
  const apply = () => {
    const t = Math.min(1.08, Math.max(-0.05, pos))
    const tc = Math.min(1, Math.max(0, t))
    el.style.fontStretch = `${min + (max - min) * tc}%`
    el.style.fontWeight = String(Math.round(820 - tc * 380))
    // ocupa a largura útil; no estado comprimido, limita a altura para o título do negócio continuar visível
    const fs = Math.min(inner() / ratioAt(tc), o.maxH ? o.maxH() : Infinity)
    el.style.fontSize = `${fs * (1 - Math.max(0, t - 1) * 0.6)}px`
    el.style.setProperty('--t', tc.toFixed(3))
  }
  const loop = (now: number) => {
    const dt = Math.min(0.033, (now - last) / 1000 || 0.016); last = now
    if (o.reduced) { pos = target; vel = 0 } else { vel += (k * (target - pos) - c * vel) * dt; pos += vel * dt }
    apply()
    if (Math.abs(vel) > 0.0005 || Math.abs(target - pos) > 0.0005) raf = requestAnimationFrame(loop)
    else raf = 0
  }
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop) } }

  // Arrastar a palavra estica; soltar devolve com oscilação
  let dragX: number | null = null, base = 0, rest = pos
  el.addEventListener('pointerdown', (e) => { dragX = e.clientX; base = target; el.setPointerCapture(e.pointerId); el.classList.add('grab') })
  el.addEventListener('pointermove', (e) => { if (dragX !== null) { target = base + ((e.clientX - dragX) / inner()) * 1.6; kick() } })
  const up = () => { if (dragX === null) return; dragX = null; el.classList.remove('grab'); target = rest; kick() }
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up)
  addEventListener('resize', () => apply())
  apply()
  return {
    set(t: number) { rest = t; if (dragX === null) { target = t; kick() } },
    pluck(amount = 0.6) { vel += amount * 6; kick() } // "beliscar" a mola: oscila e volta
  }
}
