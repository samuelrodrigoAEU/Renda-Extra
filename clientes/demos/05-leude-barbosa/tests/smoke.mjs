// Teste de fumaça da demo 05: 3 larguras, sem WebGL, movimento reduzido, toque; checagens funcionais.
import { chromium } from 'playwright'
const URL = process.env.URL || 'http://localhost:4177/'
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const R = [], ok = (n, c) => R.push(`${c ? 'PASS' : 'FAIL'} ${n}`)
const origin = new globalThis.URL(URL).origin
const watch = (page) => {
  const errors = [], ext = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text())); page.on('pageerror', (e) => errors.push(e.message))
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(origin) && !/^(data|blob):/.test(u)) ext.push(u) })
  return { errors, ext }
}
const P = () => document.querySelector('#ponto').style.getPropertyValue('--p')

for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['tablet', { width: 820, height: 1180 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: label === 'mobile' })
  await ctx.addInitScript(() => sessionStorage.setItem('demo-feita', '1'))
  const page = await ctx.newPage(), w = watch(page)
  await page.goto(URL, { waitUntil: 'networkidle' })
  const lines = await page.$$eval('h1 .lux', (s) => s.map((e) => e.getClientRects().length))
  ok(`${label}: H1 em 3 linhas`, lines.length === 3 && lines.every((n) => n === 1))
  const cta = await page.locator('.topo .botao').boundingBox()
  ok(`${label}: CTA visível sem rolar`, cta && cta.y + cta.height <= vp.height)
  await page.waitForTimeout(1500)
  ok(`${label}: abertura sem WebGL antes de interagir`, !(await page.evaluate(() => document.querySelector('#amostra').classList.contains('gl'))))
  await page.mouse.move(vp.width / 2, 200)
  await page.waitForFunction(() => document.querySelector('#amostra').classList.contains('gl'), null, { timeout: 20000 }).catch(() => {})
  ok(`${label}: WebGL entra na primeira interação`, await page.evaluate(() => document.querySelector('#amostra').classList.contains('gl')))
  const p0 = parseFloat(await page.evaluate(P))
  const s = await page.locator('#folha').boundingBox()
  const cx = s.x + s.width / 2, cy = s.y + Math.min(s.height / 2, 40)
  await page.mouse.move(cx, cy); await page.mouse.down()
  for (let i = 1; i <= 20; i++) { await page.mouse.move(cx - 120 * i / 20, cy + 60 * i / 20); await page.waitForTimeout(30) }
  await page.waitForTimeout(1500)
  ok(`${label}: pressionar muda a instrução`, /Segure|para/.test(await page.textContent('#instrucao')))
  await page.waitForTimeout(label === 'desktop' ? 6500 : 500); await page.mouse.up(); await page.waitForTimeout(400)
  const p1 = parseFloat(await page.evaluate(P))
  ok(`${label}: escala anda para o equilíbrio (${p0} → ${p1})`, p1 > p0 && p1 <= 0.5)
  if (label === 'desktop') {
    ok('desktop: equilíbrio mostra o CTA e o reinício', await page.isVisible('#eq-cta') && await page.isVisible('#reiniciar'))
    ok('desktop: anúncio do equilíbrio', (await page.textContent('#eq-live')).length > 10)
    await page.click('#reiniciar'); await page.waitForTimeout(300)
    ok('desktop: reiniciar devolve o brilho', parseFloat(await page.evaluate(P)) < p1)
    await page.focus('#folha'); const t0 = await page.evaluate(() => getComputedStyle(document.querySelector('#folha')).transform)
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(500)
    ok('desktop: setas movem a folha', t0 !== await page.evaluate(() => getComputedStyle(document.querySelector('#folha')).transform))
  }
  if (label === 'mobile') {
    const cdp = await ctx.newCDPSession(page)
    const swipe = async (x, y) => {
      x = Math.round(x); y = Math.round(y)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
      for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * 20 }] }); await page.waitForTimeout(16) }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(400)
    }
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300)
    const f = await page.locator('#folha').boundingBox()
    await swipe(f.x + 30, f.y + 30)
    ok(`mobile: arrastar a folha não rola a página (${await page.evaluate(() => scrollY)})`, (await page.evaluate(() => scrollY)) === 0)
    const a = await page.locator('#amostra').boundingBox()
    await swipe(a.x + 40, Math.min(a.y + a.height - 30, 800))
    ok(`mobile: deslizar na amostra rola a página (${await page.evaluate(() => scrollY)})`, (await page.evaluate(() => scrollY)) > 100)
  }
  // ficha
  await page.locator('#ficha').scrollIntoViewIfNeeded(); await page.waitForTimeout(300)
  await page.click('.z-testa path', { position: { x: 30, y: 25 } }); await page.click('.z-nariz span')
  await page.click('.dia label:nth-child(2) span'); await page.fill('input[name=nome]', 'Ana')
  let href = decodeURIComponent(await page.getAttribute('#enviar', 'href'))
  ok(`${label}: WhatsApp com a ficha`, href.startsWith('https://wa.me/5562981007881?text=') && ['testa e nariz', 'no meio do dia', 'Nome: Ana'].every((t) => href.includes(t)))
  const prev = await page.textContent('#previa')
  ok(`${label}: prévia igual à mensagem e sem lacunas`, href.endsWith(prev) && !/undefined|não informado/.test(prev))
  await page.click('.zonas .opcao span')
  ok(`${label}: "ainda não sei" desmarca as zonas`, (await page.$$eval('input[name=zona]:checked', (e) => e.length)) === 0 && (await page.textContent('#previa')).includes('ainda não sei dizer'))
  await page.click('#copiar'); await page.waitForTimeout(200)
  ok(`${label}: copiar dá retorno`, (await page.textContent('#copiado')).length > 5)
  await page.reload({ waitUntil: 'networkidle' })
  ok(`${label}: rascunho volta depois de recarregar`, (await page.inputValue('input[name=nome]')) === 'Ana' && await page.isChecked('input[name=naosei]'))
  const wa = await page.$$eval('a[data-wa]:not(#enviar)', (as) => as.every((a) => decodeURIComponent(a.href).includes('agendar uma análise de pele')))
  ok(`${label}: links de WhatsApp com mensagem`, wa)
  ok(`${label}: sem rolagem horizontal`, !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)))
  ok(`${label}: nenhuma requisição externa (${w.ext.length})`, w.ext.length === 0)
  ok(`${label}: console limpo (${w.errors.length})`, w.errors.length === 0)
  if (w.errors.length) console.log(w.errors.slice(0, 4).join('\n'))
  await ctx.close()
}

// sem WebGL (o 2D continua)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }), page = await ctx.newPage(), w = watch(page)
  await ctx.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : g.call(this, t, ...a) } })
  await page.goto(URL, { waitUntil: 'networkidle' }); await page.waitForTimeout(3500)
  const s = await page.locator('#folha').boundingBox(); const p0 = parseFloat(await page.evaluate(P))
  await page.mouse.move(s.x + 40, s.y + 40); await page.mouse.down(); await page.mouse.move(s.x + 120, s.y - 60, { steps: 15 }); await page.waitForTimeout(1500); await page.mouse.up()
  ok('sem WebGL: cai no reflexo 2D, sem erro', await page.evaluate(() => { const c = document.querySelector('#amostra').classList; return c.contains('fb') && !c.contains('gl') }) && w.errors.length === 0)
  ok('sem WebGL: a folha ainda trata o brilho', parseFloat(await page.evaluate(P)) > p0)
  await ctx.close()
}
// movimento reduzido: três cliques chegam ao equilíbrio
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }), page = await ctx.newPage(), w = watch(page)
  await page.goto(URL, { waitUntil: 'networkidle' })
  ok('reduzido: botão "Pressionar a folha" visível', await page.isVisible('#pressionar'))
  for (let i = 0; i < 3; i++) await page.click('#pressionar')
  await page.waitForTimeout(300)
  ok('reduzido: 3 cliques chegam ao equilíbrio', await page.isVisible('#eq-cta') && /Equilíbrio/.test(await page.textContent('#instrucao')))
  ok('reduzido: nada escondido para revelar', (await page.$$eval('.rv', (e) => e.length)) === 0)
  ok('reduzido: sem erros', w.errors.length === 0)
  await ctx.close()
}
await browser.close()
console.log(R.join('\n'))
process.exit(R.some((r) => r.startsWith('FAIL')) ? 1 : 0)
