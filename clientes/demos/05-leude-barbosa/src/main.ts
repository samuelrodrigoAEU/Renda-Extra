import '@fontsource-variable/albert-sans/wght.css'
import '@fontsource-variable/newsreader/opsz.css'
import '@fontsource-variable/newsreader/wght-italic.css'
import './style.css'
import { MIN_MESSAGE, waHref } from './message'
import { initFicha } from './ficha'
import { createMask, type Sample } from './mask'
import { createSheet, type SheetFrame } from './sheet'
import { createFallback } from './surface-fallback'

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

for (const a of document.querySelectorAll<HTMLAnchorElement>('a[data-wa]')) if (a.id !== 'enviar') a.href = waHref(MIN_MESSAGE)

// Escala espelho → equilíbrio → giz: o ponto nunca passa do meio, porque a máscara tem piso de 0,38.
const escala = (s: Sample) => Math.min(0.5, ((1 - s.oilAvg) / 0.62) * 0.5)

function initAmostra() {
  const stage = $('#amostra'), folha = $<HTMLButtonElement>('#folha'), glCanvas = $<HTMLCanvasElement>('#superficie')
  const instr = $('#instrucao'), ponto = $('#ponto'), eqCta = $('#eq-cta'), eqLive = $('#eq-live')
  const bPress = $<HTMLButtonElement>('#pressionar'), bReset = $<HTMLButtonElement>('#reiniciar')
  const mask = createMask()
  const all = { u0: 0, v0: 0, u1: 0, v1: 0 }
  const setPonto = (s: Sample) => ponto.style.setProperty('--p', escala(s).toFixed(3))
  setPonto(mask.sample(all))

  // Primeiro quadro é CSS. Na primeira interação com a página entra o WebGL2 (fade de 600 ms);
  // o reflexo 2D só é criado se a pessoa pressionar antes disso ou se não houver WebGL2.
  let fb: { draw: () => void } | null = null
  const ensureFb = () => {
    if (fb) return
    const reflexo = document.createElement('canvas')
    reflexo.className = 'reflexo'; reflexo.setAttribute('aria-hidden', 'true')
    glCanvas.before(reflexo)
    fb = createFallback(reflexo, mask)
    stage.classList.add('fb')
  }
  let surface: { draw: (f?: SheetFrame | null) => void } | null = null

  const say = (t: string) => { if (instr.textContent !== t) instr.textContent = t }
  let lastP = ''
  const sheet = createSheet({
    stage, el: folha, canvas: folha.querySelector('canvas')!, mask, reduced,
    onFrame(f) {
      if (surface) surface.draw(f); else fb?.draw()
      if (f.sample) { const p = escala(f.sample).toFixed(3); if (p !== lastP) { lastP = p; ponto.style.setProperty('--p', p) } }
    },
    onFirstPress() { if (!surface) ensureFb(); boot(); say(reduced ? 'A folha absorveu o excesso daqui. Pressione de novo.' : 'Segure. A folha absorve o excesso.') },
    onStopHere() { say(reduced ? 'Aqui a folha para. Ela segue para outra área.' : 'Aqui a folha para. Leve-a para outra área.') },
    onEquilibrium() {
      say('Equilíbrio. Nem espelho, nem giz.')
      eqCta.hidden = false; bReset.hidden = false
      eqLive.textContent = 'Na ilustração, o brilho chegou ao equilíbrio. O link para agendar a análise apareceu logo abaixo.'
    }
  })
  stage.classList.add('pronta')
  ;(window as unknown as { __amostra: object }).__amostra = { mask, sheet }   // gancho de teste e captura

  let booting = false
  function boot() {
    if (booting) return
    booting = true
    import('./surface').then(({ createSurface }) => {
      surface = createSurface(glCanvas, mask, () => { surface = null; ensureFb(); stage.classList.remove('gl'); sheet.frame() })
      requestAnimationFrame(() => stage.classList.add('gl'))
      sheet.frame()
    }).catch(() => { ensureFb(); sheet.frame() })
    scheduleDemo()
  }
  const first = ['pointerdown', 'pointermove', 'touchstart', 'wheel', 'keydown', 'scroll'] as const
  const onFirst = () => { for (const e of first) removeEventListener(e, onFirst); boot() }
  for (const e of first) addEventListener(e, onFirst, { passive: true })

  if (reduced) {
    bPress.hidden = false
    say('Use “Pressionar a folha” para ver a absorção.')
    bPress.addEventListener('click', () => sheet.pressAt())
    folha.addEventListener('click', (e) => { if (e.detail > 0) sheet.pressAt() })
  }
  // demonstração única, 2,5 s depois que a amostra aparece, só para quem ainda não tocou na folha
  function scheduleDemo() {
    if (reduced) return
    let seen = false
    try { seen = sessionStorage.getItem('demo-feita') === '1' } catch { /* sem storage */ }
    if (!seen) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        setTimeout(() => {
          if (sheet.interacted) return
          sheet.demo()
          try { sessionStorage.setItem('demo-feita', '1') } catch { /* sem storage */ }
        }, 2500)
      }, { threshold: 0.6 })
      io.observe(stage)
    }
  }
  bReset.addEventListener('click', () => {
    sheet.reset(); setPonto(mask.sample(all))
    say(reduced ? 'Brilho de volta. Pressione a folha de novo.' : 'Brilho de volta. Arraste a folha de novo.')
  })
}

// Reflexo único nos títulos e revelação só abaixo da dobra (o que já está na tela nunca some).
function initMotion() {
  if (reduced) return
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add('in', 'on'); io.unobserve(e.target) }
  }, { rootMargin: '0px 0px -12% 0px' })
  const fold = innerHeight
  // lê todas as posições antes de escrever classes (evita layout forçado em série)
  const els = [...document.querySelectorAll<HTMLElement>('main > section > *, hr.sulco, .escada > li')].filter((el) => !el.classList.contains('escada'))
  const below = els.filter((el) => el.getBoundingClientRect().top > fold)
  for (const el of below) { el.classList.add('rv'); io.observe(el) }
  for (const l of document.querySelectorAll('.lux')) io.observe(l)
}

try { initAmostra() } catch { $('#amostra')?.classList.add('estatica') }
initFicha($<HTMLFormElement>('#form'))
initMotion()
