// Dados do cliente. Tudo marcado como CONFIRMAR deve ser validado com a empresa antes de qualquer apresentação pública.
export const client = {
  name: 'Dois Eme Marcenaria', // CONFIRMAR grafia oficial
  short: 'Dois Eme',
  city: 'Goiânia',
  since: '2017', // fonte: bio pública do Instagram (@moveisplanejadosgoiania) — CONFIRMAR
  showroom: 'Setor Pedro Ludovico, Goiânia', // fonte: bio pública — CONFIRMAR endereço completo
  // Número de WhatsApp comercial no formato internacional, só dígitos. Vazio = abre o WhatsApp sem destinatário.
  whatsapp: '',
  instagram: 'https://www.instagram.com/moveisplanejadosgoiania/'
}

export const finishes = [
  { id: 'freijo', name: 'Freijó natural', note: 'Lâmina amadeirada, veio marcado', base: '#a8794d', grain: '#7a5232', rough: 0.62, gloss: 0 },
  { id: 'nogueira', name: 'Nogueira escura', note: 'Tom profundo para ambientes íntimos', base: '#5b3d2a', grain: '#3a2519', rough: 0.58, gloss: 0 },
  { id: 'carvalho', name: 'Carvalho claro', note: 'Luminoso, escandinavo', base: '#c9a983', grain: '#a6845f', rough: 0.66, gloss: 0 },
  { id: 'off', name: 'Laca off-white', note: 'Acetinada, toque sedoso', base: '#e7e1d6', grain: null, rough: 0.38, gloss: 0.35 },
  { id: 'oliva', name: 'Laca verde oliva', note: 'Cor com personalidade', base: '#5d6447', grain: null, rough: 0.4, gloss: 0.3 },
  { id: 'grafite', name: 'Grafite fosco', note: 'Sóbrio e contemporâneo', base: '#2e2f2e', grain: null, rough: 0.72, gloss: 0 }
] as const

export type Finish = (typeof finishes)[number]

export function waLink(message: string) {
  const base = client.whatsapp ? `https://wa.me/${client.whatsapp}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(message)}`
}
