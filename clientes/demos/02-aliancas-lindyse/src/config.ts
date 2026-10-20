// Dados do cliente. Tudo marcado CONFIRMAR deve ser validado com a empresa antes de qualquer apresentação pública.
export const client = {
  name: 'Lindyse Joias',
  city: 'Goiânia',
  years: '30', // fonte: lindysejoias.com ("30 anos de tradição") — CONFIRMAR
  atelier: 'Setor Campinas, Goiânia', // fonte: lindysejoias.com — CONFIRMAR endereço completo
  site: 'https://lindysejoias.com/',
  whatsapp: '' // só dígitos com DDI, ex.: 5562999999999. Vazio = WhatsApp sem destinatário
}

export const metals = [
  { id: 'amarelo', name: 'Ouro amarelo 18k', color: '#f2c879' },
  { id: 'branco', name: 'Ouro branco 18k', color: '#e9e7e2' },
  { id: 'rose', name: 'Ouro rosé 18k', color: '#f1b89c' }
] as const

export const widths = [3, 4, 5, 6] as const // mm

export const scripts = [
  { id: 'classica', name: 'Clássica', font: 'italic 600 {s}px "Bodoni Moda Variable", serif' },
  { id: 'manuscrita', name: 'Manuscrita', font: '400 {s}px "Pinyon Script", cursive' },
  { id: 'moderna', name: 'Moderna', font: '500 {s}px "Jost Variable", sans-serif' }
] as const

export type Metal = (typeof metals)[number]
export type Script = (typeof scripts)[number]

export function waLink(message: string) {
  return `https://wa.me/${client.whatsapp}?text=${encodeURIComponent(message)}`
}

// Numeração brasileira: aro ≈ circunferência interna (mm) − 40. Estimativa, não substitui o medidor do ateliê.
export const aroFromDiameter = (d: number) => Math.round(Math.PI * d - 40)
