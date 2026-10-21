import { PHONE } from './config'

export type Ficha = { zones: string[]; unsure: boolean; when?: string; before?: string; period?: string; nome?: string }

export const MIN_MESSAGE = 'Olá, Leude! Vim pelo site e gostaria de agendar uma análise de pele. Pode me passar os horários disponíveis?'

const list = (items: string[]) => {
  try { return new Intl.ListFormat('pt-BR', { type: 'conjunction' }).format(items) } catch { return items.join(', ') }
}

// Função pura: cada linha só entra se tiver valor (nunca "não informado").
export function buildMessage(f: Ficha) {
  const where = f.unsure ? 'ainda não sei dizer' : f.zones.length ? list(f.zones) : ''
  return [
    'Olá, Leude! Vim pelo site e gostaria de agendar uma análise de pele.',
    f.nome && `• Nome: ${f.nome}`,
    where && `• Onde percebo mais brilho: ${where}`,
    f.when && `• Quando percebo o brilho: ${f.when}`,
    f.before && `• Já fiz limpeza de pele antes: ${f.before}`,
    f.period && `• Melhor período: ${f.period}`,
    'Pode me passar os horários disponíveis?'
  ].filter(Boolean).join('\n')
}

export const waHref = (msg: string) => `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`
