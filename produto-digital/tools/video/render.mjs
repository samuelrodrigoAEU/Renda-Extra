// Renderiza studio.html quadro a quadro (30 fps, tempo virtual) e codifica MP4 9:16 com ffmpeg.
// Uso: node render.mjs <video> <pasta_quadros> <saida.mp4>   |   node render.mjs <video> <pasta> --stills 1,5,9
import { createRequire } from 'node:module'
import { mkdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT || '/home/user/Renda-Extra/clientes/demos/05-leude-barbosa/node_modules/playwright')
const [video, dir, out] = process.argv.slice(2)
const FPS = 30
const page = await (await chromium.launch()).newPage({ viewport: { width: 1080, height: 1920 } })
await page.goto(new URL(`studio.html?v=${video}`, import.meta.url).href)
await page.evaluate(() => document.fonts.ready)
await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0))
rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true })
if (out === '--stills') {
  for (const t of process.argv[5].split(',').map(Number)) { await page.evaluate((t) => window.__tick(t), t); await page.screenshot({ path: `${dir}/t${t}.png` }) }
} else {
  const dur = await page.evaluate(() => window.__dur)
  for (let i = 0; i < Math.round(dur * FPS); i++) {
    await page.evaluate((t) => window.__tick(t), i / FPS)
    await page.screenshot({ path: `${dir}/${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 })
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${dir}/%05d.jpg`, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', out])
}
process.exit(0)
