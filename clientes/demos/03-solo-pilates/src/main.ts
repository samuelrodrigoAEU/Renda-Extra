import '@fontsource-variable/anybody/standard.css'
import '@fontsource-variable/fraunces/soft-italic.css'
import '@fontsource-variable/figtree'
import './style.css'
import { studio, units, springs, waLink } from './config'
import { elastic } from './elastic'

type SceneApi = ReturnType<typeof import('./scene').createScene>
const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector(s) as T
const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll(s)) as T[]
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const w = window as unknown as { dataLayer?: object[]; __scene?: SceneApi; __word?: ReturnType<typeof elastic> }
const track = (event: string, d: Record<string, string> = {}) => w.dataLayer?.push({ event, ...d })
document.addEventListener('click', (e) => { const t = (e.target as HTMLElement).closest<HTMLElement>('[data-track]'); if (t) track(t.dataset.track!) })
$('#legal').textContent = studio.legal

// ---------- Formulário (estado central) ----------
const unitColor: Record<string, string> = { marista: 'var(--y)', alphamall: 'var(--b)', online: 'var(--g)' }
const state = { goal: '', unit: '', time: '', exp: '' }
const groups: Record<keyof typeof state, { id: string; label: string; c?: string }[]> = {
  goal: springs.map((s) => ({ id: s.id, label: s.goal, c: s.color })),
  unit: [...units.map((u) => ({ id: u.id, label: u.name, c: unitColor[u.id] })), { id: 'online', label: 'Online', c: unitColor.online }],
  time: [{ id: 'manha', label: 'Manhã' }, { id: 'tarde', label: 'Tarde' }, { id: 'noite', label: 'Noite' }],
  exp: [{ id: 'nunca', label: 'Nunca fiz' }, { id: 'ja', label: 'Já pratiquei' }]
}
const boxes: Record<keyof typeof state, string> = { goal: '#o-goal', unit: '#o-unit', time: '#o-time', exp: '#o-exp' }
for (const key of Object.keys(groups) as (keyof typeof state)[]) {
  for (const o of groups[key]) {
    const l = document.createElement('label')
    l.className = 'opt'
    if (o.c) l.style.setProperty('--c', o.c)
    l.innerHTML = `<input type="radio" name="${key}" value="${o.id}"><span>${o.c ? '<i></i>' : ''}${o.label}</span>`
    l.querySelector('input')!.addEventListener('change', () => { state[key] = o.id; preview() })
    $(boxes[key]).append(l)
  }
}
function choose(key: keyof typeof state, id: string) {
  const i = $<HTMLInputElement>(`#book input[name=${key}][value=${id}]`)
  if (i) { i.checked = true; state[key] = id; preview() }
}
const label = (key: keyof typeof state) => groups[key].find((o) => o.id === state[key])?.label || ''
const form = $<HTMLFormElement>('#book')
function message() {
  const fd = new FormData(form), nome = String(fd.get('nome') || '').trim(), obs = String(fd.get('obs') || '').trim()
  return [
    `Olá, Solo! ${nome ? `Sou ${nome} e quero` : 'Quero'} agendar uma aula experimental.`,
    state.goal && `• Objetivo: ${label('goal')}`,
    state.unit && `• Unidade: ${label('unit')}`,
    state.time && `• Melhor período: ${label('time').toLowerCase()}`,
    state.exp && `• Experiência: ${label('exp').toLowerCase()}`,
    obs && `• Observação: ${obs}`
  ].filter(Boolean).join('\n')
}
function preview() {
  $('#bubble').textContent = message()
  const list = state.unit && state.unit !== 'online' ? units.filter((u) => u.id === state.unit) : units
  $('#call').innerHTML = list.map((u) => `<a href="tel:${u.tel}">${u.name} ${u.phone}</a>`).join(' · ')
}
form.addEventListener('input', preview)
form.addEventListener('submit', (e) => {
  e.preventDefault()
  const nome = String(new FormData(form).get('nome') || '').trim()
  const err = $('.form-error')
  if (!state.goal || !state.unit || !nome) {
    err.hidden = false
    ;(!state.goal ? $('#o-goal input') : !state.unit ? $('#o-unit input') : $('[name=nome]')).focus()
    return
  }
  err.hidden = true
  track('lead_whatsapp', { goal: state.goal, unit: state.unit })
  window.open(waLink(message()), '_blank', 'noopener')
})
preview()

// Caminhos → formulário
for (const li of $$('.path-list li')) {
  li.querySelector('.pick')!.addEventListener('click', () => { choose('goal', li.dataset.goal!); $('#agendar').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }) })
}

// ---------- Unidades ----------
$('#unit-grid').innerHTML = units.map((u) => `
  <article class="unit" style="--c:${unitColor[u.id]}">
    <p class="uname">${u.name}</p>
    <p>${u.address}${u.cep ? ` · CEP ${u.cep}` : ''} · Goiânia</p>
    <p>${u.hours}</p>
    <p><a href="tel:${u.tel}">${u.phone}</a></p>
    <div class="uactions">
      <a class="btn btn-sm" href="#agendar" data-unit="${u.id}" data-track="unit_${u.id}">Agendar nesta unidade</a>
      <a class="btn btn-sm btn-ghost" href="${u.maps}" target="_blank" rel="noopener">Como chegar</a>
    </div>
  </article>`).join('') + `
  <article class="unit" style="--c:var(--g)">
    <p class="uname">Online</p>
    <p>De onde você estiver.</p><p>Formato e horários: consulte a equipe.</p>
    <div class="uactions"><a class="btn btn-sm" href="#agendar" data-unit="online" data-track="unit_online">Agendar online</a></div>
  </article>`
for (const a of $$<HTMLAnchorElement>('[data-unit]')) a.addEventListener('click', () => choose('unit', a.dataset.unit!))

// ---------- Tipografia elástica ----------
document.fonts.ready.then(() => {
  const word = elastic($('#word'), { reduced, rest: 0.55, maxH: () => innerHeight * 0.36 })
  w.__word = word
  if (!reduced) setTimeout(() => word.pluck(0.9), 350) // a palavra "vibra" ao chegar, como mola solta
  const hero = $('.hero')
  const onScroll = () => word.set(0.55 + Math.min(1, Math.max(0, scrollY / (hero.offsetHeight * 0.6))) * 0.45)
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

// Revelações (uma vez só) e dock móvel
const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }, { rootMargin: '0px 0px -10% 0px' })
for (const sel of ['.el-title', '.sec-head p', '.path-list li', '.springs-copy > *', '.big-rate', '.facts > div', '.unit', '.qa div', '.preview']) $$(sel).forEach((el) => { el.classList.add('rv'); io.observe(el) })
addEventListener('scroll', () => {
  const b = $('#agendar').getBoundingClientRect()
  document.documentElement.classList.toggle('show-dock', scrollY > innerHeight * 0.8 && !(b.top < innerHeight && b.bottom > 0))
}, { passive: true })

// ---------- Reformer 3D (carregado só perto da seção) ----------
const chips = $('#spring-chips'), readout = $('#readout'), stage = $('.springs-stage'), push = $<HTMLInputElement>('#push')
let scene: SceneApi | null = null, current = 0
function selectSpring(i: number, user = false) {
  current = i
  const s = springs[i]
  for (const [j, c] of Array.from(chips.children).entries()) c.setAttribute('aria-checked', String(j === i))
  stage.style.setProperty('--c', s.color)
  readout.textContent = s.id === 'online' ? 'Online: exercícios sem aparelho. As molas ficam de fora.' : `Mola ${s.name.toLowerCase()} · resistência ${s.label}`
  scene?.setSprings(springs.map((x) => x.color), i, s.k, s.id !== 'online')
  if (user) choose('goal', s.id)
}
springs.forEach((s, i) => {
  const b = document.createElement('button')
  b.type = 'button'; b.className = 'chip'; b.setAttribute('role', 'radio'); b.style.setProperty('--c', s.color)
  b.innerHTML = `<i></i>${s.name}`
  b.addEventListener('click', () => selectSpring(i, true))
  chips.append(b)
})
push.addEventListener('input', () => scene?.push(Number(push.value)))
const relax = () => { scene?.release(); push.value = '0' }
push.addEventListener('change', relax); push.addEventListener('pointerup', relax); push.addEventListener('blur', relax)

function hasWebGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } }
async function boot() {
  const { createScene } = await import('./scene')
  scene = createScene($<HTMLCanvasElement>('#gl'), { reducedMotion: reduced })
  w.__scene = scene
  scene.onMove((x) => stage.style.setProperty('--x', x.toFixed(3)))
  selectSpring(current)
  new IntersectionObserver(([e]) => (e.isIntersecting ? scene!.start() : scene!.stop())).observe(stage)
  requestAnimationFrame(() => document.documentElement.classList.add('ready'))
}
if (hasWebGL()) {
  const near = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return
    near.disconnect()
    boot().catch((err) => { console.warn('3D indisponível', err); fallback() })
  }, { rootMargin: '900px 0px' })
  near.observe(stage)
} else fallback()
function fallback() {
  document.documentElement.classList.add('no-webgl')
  stage.style.setProperty('--fb', `url("${new URL('renders/springs.jpg', location.href).href}")`)
}
selectSpring(0)
