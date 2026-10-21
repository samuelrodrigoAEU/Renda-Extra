import { buildMessage, waHref, type Ficha } from './message'

// Ficha da primeira conversa: a mensagem e o link do WhatsApp se montam a cada toque.
// Sem envio, sem servidor: só um rascunho local (localStorage) para quem volta depois.
const KEY = 'leude-ficha-v1'

export function initFicha(form: HTMLFormElement) {
  const previa = form.querySelector<HTMLElement>('#previa')!
  const enviar = form.querySelector<HTMLAnchorElement>('#enviar')!
  const copiado = form.querySelector<HTMLElement>('#copiado')!
  const zonas = () => [...form.querySelectorAll<HTMLInputElement>('input[name=zona]')]
  const naosei = form.querySelector<HTMLInputElement>('input[name=naosei]')!

  const read = (): Ficha => {
    const fd = new FormData(form)
    const s = (k: string) => String(fd.get(k) ?? '').trim().slice(0, 60) || undefined
    return { zones: fd.getAll('zona').map(String), unsure: naosei.checked, when: s('quando'), before: s('antes'), period: s('periodo'), nome: s('nome') }
  }

  function update(save: boolean) {
    const f = read(), msg = buildMessage(f)
    previa.textContent = msg
    enviar.href = waHref(msg)
    if (save) try { localStorage.setItem(KEY, JSON.stringify(f)) } catch { /* modo privado: segue sem rascunho */ }
  }

  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null') as Ficha | null
    if (d) {
      for (const z of zonas()) z.checked = d.zones?.includes(z.value) ?? false
      naosei.checked = !!d.unsure
      for (const [k, v] of [['quando', d.when], ['antes', d.before], ['periodo', d.period]] as const) {
        const r = v && [...form.querySelectorAll<HTMLInputElement>(`input[name=${k}]`)].find((i) => i.value === v)
        if (r) r.checked = true
      }
      if (d.nome) (form.elements.namedItem('nome') as HTMLInputElement).value = d.nome
    }
  } catch { /* rascunho ilegível: ignora */ }

  const onInput = (e: Event) => {
    const t = e.target as HTMLInputElement
    // "ainda não sei dizer" e as zonas se excluem
    if (t === naosei && t.checked) zonas().forEach((z) => (z.checked = false))
    if (t.name === 'zona' && t.checked) naosei.checked = false
    update(true)
  }
  form.addEventListener('input', onInput)
  form.addEventListener('change', onInput)
  form.addEventListener('submit', (e) => e.preventDefault())

  form.querySelector('#copiar')!.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(previa.textContent || '')
      copiado.textContent = 'Mensagem copiada.'
    } catch {
      getSelection()?.selectAllChildren(previa)
      copiado.textContent = 'Texto da mensagem selecionado para copiar.'
    }
  })

  update(false)
}
