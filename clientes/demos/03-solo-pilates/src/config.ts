// Dados públicos verificados (fontes no README). Nada aqui é inventado; o que falta confirmar está em PENDENCIAS.md.
export const studio = {
  name: 'Solo Espaço Pilates',
  legal: 'Solo Centro de Reeducação Física Ltda · CNPJ 07.016.697/0001-38', // econodata.com.br
  since: 2004, // CNPJ aberto em 30/09/2004
  instagram: 'https://www.instagram.com/solo_espaco_pilates/',
  whatsapp: '', // não encontrado em fonte pública: preencher com o número oficial (só dígitos, com 55)
  rating: { value: '4,8', count: 25, source: 'Telu (unidade Marista)', url: 'https://telu.app/ranking/br/fitness/pilates/goiania/setor-marista/solo-espaco-pilates-marista', checked: 'outubro de 2026' }
}

export const units = [
  {
    id: 'marista', name: 'Marista', address: 'R. 1130, 224 · Qd. 234 Lt. 15 · Setor Marista', cep: '74180-090',
    phone: '(62) 3092-8565', tel: '+556230928565',
    hours: 'Seg a sex · a partir das 7h',
    maps: 'https://www.google.com/maps/search/?api=1&query=Solo+Espa%C3%A7o+Pilates+R.+1130+224+Setor+Marista+Goi%C3%A2nia'
  },
  {
    id: 'alphamall', name: 'Alphamall', address: 'Alphamall · Alphaville Flamboyant', cep: '',
    phone: '(62) 3414-7852', tel: '+556234147852',
    hours: 'Seg a sex · 7h às 21h',
    maps: 'https://www.google.com/maps/search/?api=1&query=Solo+Espa%C3%A7o+Pilates+Alphamall+Goi%C3%A2nia'
  }
] as const

// Código de cores das molas do reformer → objetivos. A cor é linguagem visual; a carga real é definida pela equipe.
export const springs = [
  { id: 'reab', color: '#f2b705', name: 'Amarela', label: 'leve', goal: 'Reabilitação', k: 6 },
  { id: 'post', color: '#2f6bff', name: 'Azul', label: 'moderada', goal: 'Postura e estética', k: 11 },
  { id: 'cond', color: '#f0442e', name: 'Vermelha', label: 'forte', goal: 'Condicionamento', k: 18 },
  { id: 'online', color: '#14a06f', name: 'Verde', label: 'sem aparelho', goal: 'Aulas online', k: 0 }
] as const

export const waLink = (msg: string) => `https://wa.me/${studio.whatsapp}?text=${encodeURIComponent(msg)}`
