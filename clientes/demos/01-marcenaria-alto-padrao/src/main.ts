import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/manrope'
import './style.css'
import { client, finishes, waLink, type Finish } from './config'

const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector(s) as T
const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll(s)) as T[]
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

// Dados do cliente centralizados em config.ts
for (const el of $$('[data-client]')) {
  const v = client[el.dataset.client as keyof typeof client]
  if (v) el.textContent = v
}
for (const el of $$<HTMLAnchorElement>('[data-client-href]')) el.href = client.instagram

// Eventos de conversão: dispara para dataLayer se um analytics for instalado com consentimento
function track(name: string, data: Record<string, string> = {}) {
  const w = window as unknown as { dataLayer?: object[] }
  w.dataLayer?.push({ event: name, ...data })
}
for (const el of $$('[data-track]')) el.addEventListener('click', () => track(el.dataset.track!))

// Acabamentos
let current: Finish = finishes[0]
const sw = $('.swatches')
const note = $('.swatch-note')
const finishInput = $<HTMLInputElement>('input[name="acabamento"]')
let scene: Awaited<ReturnType<typeof loadScene>> | null = null

function selectFinish(f: Finish, focus = false) {
  current = f
  for (const b of $$('.swatch')) b.setAttribute('aria-checked', String(b.dataset.id === f.id))
  if (focus) $<HTMLElement>(`.swatch[data-id="${f.id}"]`).focus()
  note.innerHTML = `<b>${f.name}</b> — ${f.note}`
  finishInput.value = f.name
  scene?.setFinish(f)
  track('finish_select', { finish: f.id })
}

finishes.forEach((f, i) => {
  const b = document.createElement('button')
  b.type = 'button'
  b.className = 'swatch' + (f.grain ? ' wood' : '')
  b.dataset.id = f.id
  b.setAttribute('role', 'radio')
  b.setAttribute('aria-label', f.name)
  b.tabIndex = i === 0 ? 0 : -1
  b.style.setProperty('--c', f.base)
  if (f.grain) b.style.setProperty('--g', f.grain)
  b.addEventListener('click', () => selectFinish(f))
  b.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = finishes[(finishes.indexOf(current) + d + finishes.length) % finishes.length]
    for (const s of $$('.swatch')) s.tabIndex = s.dataset.id === next.id ? 0 : -1
    selectFinish(next, true)
  })
  sw.append(b)
})
selectFinish(current)

$('#finish-cta').addEventListener('click', () => track('finish_cta', { finish: current.id }))

// Formulário → mensagem organizada no WhatsApp (sem backend, sem armazenamento)
const form = $<HTMLFormElement>('#lead')
form.addEventListener('submit', (e) => {
  e.preventDefault()
  const fd = new FormData(form)
  const nome = String(fd.get('nome') || '').trim()
  const ambiente = String(fd.get('ambiente') || '')
  const momento = String(fd.get('momento') || '')
  const err = $('.form-error')
  if (!nome || !ambiente || !momento) {
    err.hidden = false
    ;(form.querySelector(!nome ? '[name=nome]' : !ambiente ? '[name=ambiente]' : '[name=momento]') as HTMLElement).focus()
    return
  }
  err.hidden = true
  const bairro = String(fd.get('bairro') || '').trim()
  const msg = [
    `Olá! Sou ${nome} e gostaria de um projeto de marcenaria.`,
    `• Ambiente: ${ambiente}`,
    `• Imóvel: ${momento}`,
    `• Acabamento de interesse: ${current.name}`,
    bairro && `• Local: ${bairro}`
  ].filter(Boolean).join('\n')
  track('lead_whatsapp', { ambiente, momento })
  window.open(waLink(msg), '_blank', 'noopener')
})
$<HTMLAnchorElement>('.wa-float').href = waLink(`Olá! Vi o site da ${client.name} e quero falar sobre um projeto.`)
$('.wa-float').setAttribute('target', '_blank')
$('.wa-float').setAttribute('rel', 'noopener')

// Entrada dos blocos e estado de scroll
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
}, { threshold: 0.25 })
// Passos do palco: só o passo central fica visível, evitando texto sobreposto ao 3D
const stepIO = new IntersectionObserver((entries) => {
  for (const e of entries) e.target.classList.toggle('in', e.isIntersecting)
}, { rootMargin: '-38% 0px -38% 0px' })
$$('.step').forEach((el) => stepIO.observe(el))
for (const sel of ['.rooms h2', '.room-list li', '.section-head', '.shot', '.steps-line li', '.faq details', '.contact-grid > *']) {
  $$(sel).forEach((el) => { el.classList.add('reveal'); io.observe(el) })
}

// Palco 3D
const stage = $('.stage')
const canvas = $<HTMLCanvasElement>('#scene')

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

async function loadScene() {
  const { createScene } = await import('./scene')
  return createScene(canvas, { reducedMotion })
}

function stageProgress() {
  const r = stage.getBoundingClientRect()
  const span = r.height - window.innerHeight
  return span > 0 ? (Math.min(Math.max(-r.top / span, 0), 1) * 3) : 0
}

function onScroll() {
  document.documentElement.classList.toggle('scrolled', window.scrollY > 40)
  scene?.setProgress(stageProgress())
}
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

// sem criar contexto na carga: a checagem real (cara) só acontece no primeiro gesto
if ('WebGLRenderingContext' in window) {
  const boot = () => (hasWebGL() ? loadScene() : Promise.reject(new Error('sem WebGL'))).then((s) => {
    scene = s
    s.setFinish(current)
    s.setProgress(stageProgress())
    new IntersectionObserver(([e]) => (e.isIntersecting ? s.start() : s.stop())).observe(stage)
    requestAnimationFrame(() => document.documentElement.classList.add('webgl-ready'))
  }).catch((err) => {
    console.warn('3D indisponível, usando visual estático.', err)
    document.documentElement.classList.add('no-webgl')
  })
  // Render primeiro, 3D na interação: o pôster (o próprio 3D congelado) fica até o primeiro gesto
  const first = ['pointerdown', 'pointermove', 'touchstart', 'wheel', 'keydown', 'scroll'] as const
  const onFirst = () => { for (const e of first) removeEventListener(e, onFirst); boot() }
  for (const e of first) addEventListener(e, onFirst, { passive: true })
} else {
  document.documentElement.classList.add('no-webgl')
}
