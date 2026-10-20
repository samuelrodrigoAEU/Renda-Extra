import { defineConfig } from 'vite'

// CSP só no build (o dev server do Vite usa WebSocket e scripts próprios). NO_CSP=1 desativa para hosts que injetam scripts.
const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'"

export default defineConfig({
  base: './',
  build: { target: 'es2020', chunkSizeWarningLimit: 700 },
  plugins: [{
    name: 'csp',
    apply: 'build',
    transformIndexHtml: () => (process.env.NO_CSP ? [] : [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' }])
  }]
})
