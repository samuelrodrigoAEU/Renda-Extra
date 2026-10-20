import '@fontsource-variable/archivo/standard.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './style.css'
import { shop, brands, waLink } from './config'

type SceneApi = ReturnType<typeof import('./scene').createScene>
const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector(s) as T
const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll(s)) as T[]
const root = document.documentElement
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const w = window as unknown as { dataLayer?: object[]; __scene?: SceneApi; __boot?: () => Promise<void> }
const track = (event: string, d: Record<string, string> = {}) => w.dataLayer?.push({ event, ...d })
document.addEventListener('click', (e) => { const t = (e.target as HTMLElement).closest<HTMLElement>('[data-track]'); if (t) track(t.dataset.track!) })
$('#legal').textContent = shop.legal

// ---------- Menu ----------
const menuBtn = $<HTMLButtonElement>('.menu-btn'), menu = $('#menu')
const setMenu = (open: boolean) => { menuBtn.setAttribute('aria-expanded', String(open)); menu.classList.toggle('open', open) }
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'))
menu.addEventListener('click', (e) => { if ((e.target as HTMLElement).tagName === 'A') setMenu(false) })
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false) })

// ---------- Diagnóstico guiado ----------
type Opt = { id: string; label: string }
const opts: Record<'brand' | 'sym' | 'run' | 'when', { box: string; type: 'radio' | 'checkbox'; items: Opt[] }> = {
  brand: { box: '#f-brand', type: 'radio', items: [...brands.map((b) => ({ id: b.id, label: b.name })), { id: 'outra', label: 'Outra' }] },
  sym: { box: '#f-sym', type: 'checkbox', items: [
    { id: 'luz', label: 'Luz de alerta no painel' }, { id: 'freio', label: 'Barulho ou vibração ao frear' },
    { id: 'susp', label: 'Ruído na suspensão' }, { id: 'motor', label: 'Perda de potência ou falhas' },
    { id: 'rev', label: 'Revisão preventiva' }, { id: 'outro', label: 'Outro' }] },
  run: { box: '#f-run', type: 'radio', items: [{ id: 'normal', label: 'Sim, normalmente' }, { id: 'cuidado', label: 'Sim, com cuidado' }, { id: 'guincho', label: 'Não, precisa de guincho' }] },
  when: { box: '#f-when', type: 'radio', items: [{ id: 'ja', label: 'O quanto antes' }, { id: 'semana', label: 'Esta semana' }, { id: 'prox', label: 'Próxima semana' }] }
}
for (const [name, g] of Object.entries(opts)) {
  for (const o of g.items) {
    const l = document.createElement('label')
    l.innerHTML = `<input type="${g.type}" name="${name}" value="${o.id}"><span>${o.label}</span>`
    $(g.box).append(l)
  }
}
const form = $<HTMLFormElement>('#diag')
const lbl = (name: keyof typeof opts, id: string) => opts[name].items.find((o) => o.id === id)?.label || ''
function read() {
  const fd = new FormData(form)
  return {
    brand: String(fd.get('brand') || ''), sym: fd.getAll('sym').map(String), run: String(fd.get('run') || ''), when: String(fd.get('when') || ''),
    modelo: String(fd.get('modelo') || '').trim(), nome: String(fd.get('nome') || '').trim()
  }
}
const pad = (k: string) => (k + ' ').padEnd(15, '.') + ' '
function ticket() {
  const d = read()
  const car = [d.brand && lbl('brand', d.brand), d.modelo].filter(Boolean).join(' ')
  const rows = [
    pad('CLIENTE') + (d.nome || '—'),
    pad('VEÍCULO') + (car || '—'),
    pad('SINTOMAS') + (d.sym.length ? d.sym.map((s) => lbl('sym', s)).join('\n' + ' '.repeat(16)) : '—'),
    pad('RODANDO?') + (d.run ? lbl('run', d.run) : '—'),
    pad('PRAZO') + (d.when ? lbl('when', d.when) : '—')
  ]
  $('#ticket').textContent = rows.join('\n')
  $('#tow-note').hidden = d.run !== 'guincho'
}
$('#os-n').textContent = new Date().toLocaleDateString('pt-BR')
form.addEventListener('input', ticket)
form.addEventListener('change', ticket)
form.addEventListener('submit', (e) => {
  e.preventDefault()
  const d = read(), err = $('.form-error')
  if (!d.brand || !d.sym.length || !d.nome) {
    err.hidden = false
    ;(!d.brand ? $('#f-brand input') : !d.sym.length ? $('#f-sym input') : $('[name=nome]')).focus()
    return
  }
  err.hidden = true
  const msg = [
    `Olá, Box 21! Sou ${d.nome} e quero agendar uma avaliação.`,
    `• Carro: ${[lbl('brand', d.brand), d.modelo].filter(Boolean).join(' ')}`,
    `• Sintomas: ${d.sym.map((s) => lbl('sym', s)).join('; ')}`,
    d.run && `• Está rodando? ${lbl('run', d.run)}`,
    d.when && `• Quando: ${lbl('when', d.when)}`
  ].filter(Boolean).join('\n')
  track('lead_whatsapp', { brand: d.brand })
  window.open(waLink(msg), '_blank', 'noopener')
})
ticket()
function pickBrand(id: string) {
  const i = $<HTMLInputElement>(`#f-brand input[value="${id}"]`)
  if (i) { i.checked = true; ticket() }
}

// ---------- Carrossel das marcas ----------
let bi = 0
const car = $('#carousel')
function renderBrand() {
  const b = brands[bi]
  car.innerHTML = `<div class="brand-card"><p class="bn">${b.name}</p><p class="bi">${String(bi + 1).padStart(2, '0')} / ${String(brands.length).padStart(2, '0')} · especialidade da casa</p>
    <a class="btn" href="#diagnostico" data-brand="${b.id}">Agendar para ${b.name}</a>
    <div class="dots" aria-hidden="true">${brands.map((_, i) => `<i class="${i === bi ? 'on' : ''}"></i>`).join('')}</div></div>`
  car.querySelector<HTMLAnchorElement>('[data-brand]')!.addEventListener('click', () => { pickBrand(b.id); track('brand_cta', { brand: b.id }) })
}
$('#prev').addEventListener('click', () => { bi = (bi + brands.length - 1) % brands.length; renderBrand() })
$('#next').addEventListener('click', () => { bi = (bi + 1) % brands.length; renderBrand() })
renderBrand()

// ---------- Scroll: tema da barra, dock, revelações ----------
addEventListener('scroll', () => {
  const under = document.elementFromPoint(innerWidth - 40, 40)?.closest('section')
  root.classList.toggle('light-bar', !!under && (under.classList.contains('shop') || under.classList.contains('faq')))
  const dg = $('#diagnostico').getBoundingClientRect()
  root.classList.toggle('show-dock', scrollY > innerHeight * 0.7 && !(dg.top < innerHeight && dg.bottom > 0))
}, { passive: true })
const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }, { rootMargin: '0px 0px -8% 0px' })
for (const sel of ['.col', '.diag h2', '.ticket', '.map-card', '.where-grid > div:last-child', '.spec div']) $$(sel).forEach((el) => { el.classList.add('rv'); io.observe(el) })

// ---------- 3D: sobe na primeira interação (a abertura usa o render estático, sem bloquear o carregamento) ----------
const hero = $('.hero'), explodeBtn = $<HTMLButtonElement>('#explode'), brakeBtn = $<HTMLButtonElement>('#brake'), note = $('#brake-note')
let scene: SceneApi | null = null, booting: Promise<void> | null = null, exploded = false
const labels = new Map($$<HTMLLIElement>('.labels li').map((li) => [li.dataset.a!, li]))
function hasWebGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } }
const webgl = hasWebGL()
function boot() {
  if (!webgl) return Promise.resolve()
  booting ??= import('./scene').then(({ createScene }) => {
    scene = createScene($<HTMLCanvasElement>('#gl'), { reducedMotion: reduced })
    w.__scene = scene
    let first = true
    scene.onFrame((anchors, ex, heat) => {
      for (const a of anchors) { const li = labels.get(a.id)!; li.style.setProperty('--x', `${a.x}px`); li.style.setProperty('--y', `${a.y}px`); li.classList.toggle('on', a.visible && ex > 0.85) }
      note.textContent = `Aquecimento simulado · ${Math.round(heat * 100)}%`
      if (first) { first = false; requestAnimationFrame(() => root.classList.add('live')) }
    })
    scene.setExplode(exploded)
    new IntersectionObserver(([e]) => (e.isIntersecting ? scene!.start() : scene!.stop())).observe(hero)
  }).catch((err) => { console.warn('3D indisponível', err) })
  return booting
}
w.__boot = boot
for (const ev of ['pointermove', 'touchstart', 'scroll', 'keydown']) addEventListener(ev, () => boot(), { once: true, passive: true })

explodeBtn.addEventListener('click', async () => {
  exploded = !exploded
  explodeBtn.setAttribute('aria-pressed', String(exploded))
  hero.classList.toggle('exploded', exploded)
  if (!webgl) { $<HTMLImageElement>('.still').src = `./renders/${exploded ? 'exploded' : 'hero'}.webp`; return }
  await boot(); scene?.setExplode(exploded)
})
const brake = async (on: boolean) => { brakeBtn.classList.toggle('on', on); await boot(); scene?.setBrake(on) }
brakeBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); brakeBtn.setPointerCapture(e.pointerId); brake(true) })
for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) brakeBtn.addEventListener(ev, () => brake(false))
brakeBtn.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); brake(true) } })
brakeBtn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') brake(false) })
if (!webgl) { root.classList.add('no-webgl'); brakeBtn.hidden = true; note.hidden = true }
