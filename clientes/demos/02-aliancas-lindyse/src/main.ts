import '@fontsource-variable/bodoni-moda/opsz.css'
import '@fontsource-variable/bodoni-moda/opsz-italic.css'
import '@fontsource-variable/jost'
import '@fontsource/pinyon-script'
import './style.css'
import { client, metals, widths, scripts, waLink, aroFromDiameter, type Metal, type Script } from './config'

type SceneApi = ReturnType<typeof import('./scene').createScene>

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T
const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll(s)) as T[]
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
const store = {
  get: (k: string) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* modo privado */ } }
}

for (const el of $$('[data-client]')) el.textContent = client[el.dataset.client as keyof typeof client] || el.textContent
function track(event: string, data: Record<string, string> = {}) {
  (window as unknown as { dataLayer?: object[] }).dataLayer?.push({ event, ...data })
}
document.addEventListener('click', (e) => { const t = (e.target as HTMLElement).closest<HTMLElement>('[data-track]'); if (t) track(t.dataset.track!) })

let scene: SceneApi | null = null

// ---------- Gravação ----------
const state = { text: $<HTMLInputElement>('#en-text').value, script: scripts[0] as Script, metal: metals[0] as Metal, width: 5 as number }
function radios<T extends { id: string }>(box: string, items: readonly T[], label: (i: T) => string, pick: (i: T) => void, current: T) {
  const fs = $(box)
  for (const it of items) {
    const l = document.createElement('label')
    l.className = 'opt'
    l.innerHTML = `<input type="radio" name="${box.slice(1)}" value="${it.id}" ${it === current ? 'checked' : ''}/><span>${label(it)}</span>`
    l.querySelector('input')!.addEventListener('change', () => pick(it))
    fs.append(l)
  }
}
radios('#en-font', scripts, (s) => `<span class="f" style="font:${s.font.replace('{s}', '17')}">${s.name}</span>`, (s) => { state.script = s; syncEngrave() }, state.script)
radios('#en-metal', metals, (m) => `<i style="--c:${m.color}"></i>${m.name.replace(' 18k', '')}`, (m) => { state.metal = m; syncEngrave() }, state.metal)
radios('#en-width', widths.map((w) => ({ id: String(w), w })), (o) => `${o.w} mm`, (o) => { state.width = o.w; syncEngrave() }, { id: '5', w: 5 })
$<HTMLInputElement>('#en-width input[value="5"]').checked = true

const enText = $<HTMLInputElement>('#en-text')
enText.addEventListener('input', () => { state.text = enText.value; syncEngrave() })
function syncEngrave() {
  $('.count').textContent = `${enText.value.length}/26`
  scene?.setEngrave({ text: state.text, font: state.script.font, metal: state.metal.color, width: state.width })
  $<HTMLInputElement>('[name=gravacao]').value = state.text
  summary()
}
$('#en-cta').addEventListener('click', () => track('engrave_choice', { metal: state.metal.id, width: String(state.width), font: state.script.id }))

// ---------- Medidor de aro ----------
const cal = $<HTMLInputElement>('#cal'), ring = $<HTMLInputElement>('#ring'), circ = $<HTMLInputElement>('#circ')
cal.value = store.get('lj-cal') || String(Math.round((85.6 * 96) / 25.4))
function sizer() {
  const cardPx = Number(cal.value), pxmm = cardPx / 85.6, d = Number(ring.value)
  $('.card-outline').style.setProperty('--w', `${cardPx}px`)
  $('.ring-outline').style.setProperty('--d', `${d * pxmm}px`)
  $('#aro-n').textContent = String(aroFromDiameter(d))
  $('#aro-mm').textContent = `${d.toFixed(1).replace('.', ',')} mm de diâmetro interno`
}
cal.addEventListener('input', () => { store.set('lj-cal', cal.value); sizer() })
ring.addEventListener('input', () => { circ.value = ''; sizer() })
circ.addEventListener('input', () => {
  const c = Number(circ.value.replace(',', '.'))
  if (c >= 40 && c <= 80) { ring.value = String(c / Math.PI); sizer() }
})
for (const b of $$<HTMLButtonElement>('[data-save]')) {
  b.addEventListener('click', () => {
    const n = $('#aro-n').textContent!
    $<HTMLInputElement>(`[name=aro${b.dataset.save}]`).value = n
    b.classList.add('saved'); b.textContent = `Aro ${b.dataset.save}: ${n} ✓`
    track('sizer_save', { aro: n }); summary()
  })
}
sizer()

// ---------- Formulário → WhatsApp ----------
const form = $<HTMLFormElement>('#lead')
function summary() {
  const fd = new FormData(form)
  const a1 = String(fd.get('aro1') || ''), a2 = String(fd.get('aro2') || '')
  $('#summary').textContent = `${state.metal.name} · ${state.width} mm · letra ${state.script.name.toLowerCase()}` +
    (a1 || a2 ? ` · aros ${a1 || '?'} e ${a2 || '?'}` : '')
}
form.addEventListener('input', summary)
form.addEventListener('submit', (e) => {
  e.preventDefault()
  const fd = new FormData(form), g = (k: string) => String(fd.get(k) || '').trim()
  const err = $('.form-error')
  if (!g('nomes') || !g('peca')) { err.hidden = false; $<HTMLElement>(g('nomes') ? '[name=peca]' : '[name=nomes]').focus(); return }
  err.hidden = true
  const data = g('data') ? new Date(g('data') + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : ''
  const msg = [
    `Olá! Somos ${g('nomes')} e queremos encomendar: ${g('peca')}.`,
    `• Ouro: ${state.metal.name}, ${state.width} mm`,
    g('gravacao') && `• Gravação: "${g('gravacao')}" (letra ${state.script.name.toLowerCase()})`,
    (g('aro1') || g('aro2')) && `• Aros estimados: ${g('aro1') || '?'} e ${g('aro2') || '?'}`,
    data && `• Casamento: ${data}`
  ].filter(Boolean).join('\n')
  track('lead_whatsapp', { peca: g('peca') })
  window.open(waLink(msg), '_blank', 'noopener')
})
summary()

// ---------- Scroll: palco, linha do processo, CTA móvel ----------
const stage = $('.stage'), sticky = $('.stage-sticky'), portalEl = $('.portal'), proc = $('.process')
let portalP = 0
function onScroll() {
  const vh = innerHeight
  const r = stage.getBoundingClientRect()
  const s = clamp(-r.top / (r.height - vh))
  sticky.style.setProperty('--p', s.toFixed(4))
  portalP = clamp((s - 0.06) / 0.86)
  scene?.setPortal(portalP)
  if (!scene) paintPortal({ x: innerWidth / 2, y: vh / 2, r: portalP * Math.hypot(innerWidth, vh) })
  const pr = proc.getBoundingClientRect()
  proc.style.setProperty('--draw', clamp((vh * 0.85 - pr.top) / (pr.height * 0.6)).toFixed(3))
  // cabeçalho claro sobre seções claras
  const under = document.elementFromPoint(innerWidth / 2, 70)?.closest('section')
  document.documentElement.classList.toggle('nav-light', !!under && (/atelier|sizer|faq/.test(under.className) || (under === stage && s > 0.9)))
  // CTA fixo do celular: some onde a seção já tem a própria ação (gravação, medidor, contato)
  const own = ['#gravacao', '#aro', '#contato'].some((id) => { const b = $(id).getBoundingClientRect(); return b.top < vh * 0.7 && b.bottom > vh * 0.3 })
  document.documentElement.classList.toggle('show-cta', scrollY > vh * 0.9 && !own)
}
function paintPortal(c: { x: number; y: number; r: number }) {
  portalEl.style.setProperty('--x', `${c.x.toFixed(1)}px`)
  portalEl.style.setProperty('--y', `${c.y.toFixed(1)}px`)
  portalEl.style.setProperty('--r', `${Math.max(0, c.r).toFixed(1)}px`)
  portalEl.style.setProperty('--q', clamp((c.r / Math.min(innerWidth, innerHeight) - 0.25) * 1.6).toFixed(3))
}
addEventListener('scroll', onScroll, { passive: true })
addEventListener('resize', onScroll)
onScroll()

// Revelações de entrada (uma vez só; nunca escondem conteúdo já lido)
const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }, { rootMargin: '0px 0px -8% 0px' })
for (const sel of ['.at-number', '.at-copy', '.at-fig', '.engrave-panel > *', '.sz-head', '.sz-step', '.sz-result', '.pr-steps li', '.faq details', '.contact-grid > *']) {
  $$(sel).forEach((el) => { el.classList.add('rv'); io.observe(el) })
}

// ---------- 3D ----------
const canvas = $<HTMLCanvasElement>('#gl')
const slotHero = $('#slot-hero'), slotEngrave = $('#slot-engrave')
function hasWebGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } }

function placeCanvas() {
  if (!scene) return
  const vh = innerHeight
  const st = stage.getBoundingClientRect(), en = $('#gravacao').getBoundingClientRect()
  const heroOn = st.bottom > 0 && st.top < vh
  const engOn = en.top < vh && en.bottom > 0
  const target = engOn && !heroOn ? slotEngrave : heroOn ? slotHero : null
  if (!target) { scene.stop(); return }
  if (canvas.parentElement !== target) { target.append(canvas); scene.resize() }
  scene.setMode(target === slotEngrave ? 'engrave' : 'hero')
  scene.start()
}

async function boot() {
  const { createScene } = await import('./scene')
  await Promise.all([...scripts.map((s) => document.fonts.load(s.font.replace('{s}', '40'), 'Aa&')), document.fonts.ready]).catch(() => {})
  scene = createScene(canvas, { reducedMotion })
  scene.onFrame(() => paintPortal(scene!.portalCircle()))
  syncEngrave()
  scene.setPortal(portalP)
  addEventListener('scroll', placeCanvas, { passive: true })
  placeCanvas()
  requestAnimationFrame(() => document.documentElement.classList.add('webgl-ready'))
  ;(window as unknown as { __scene: SceneApi }).__scene = scene
}

if (hasWebGL()) {
  const go = () => boot().catch((err) => { console.warn('3D indisponível, usando imagem estática.', err); fallback() })
  'requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 500 }) : setTimeout(go, 150)
} else fallback()

function fallback() {
  document.documentElement.classList.add('no-webgl')
  // URL absoluta: url() relativo dentro de variável CSS resolveria a partir da pasta do CSS
  const img = (f: string) => `url("${new URL(`renders/${f}`, location.href).href}") center / cover`
  slotHero.style.background = img('og.jpg')
  slotHero.style.zIndex = '-1' // atrás do título, como o 3D faria com o fundo
  slotEngrave.style.background = img('engrave.jpg')
}
syncEngrave()
