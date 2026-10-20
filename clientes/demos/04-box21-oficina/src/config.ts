// Dados públicos verificados (fontes no README). O que não foi confirmado fica fora da página.
export const shop = {
  name: 'Box 21 Tecnologia Automotiva',
  legal: 'BOX 21 TECNOLOGIA AUTOMOTIVA LTDA · CNPJ 07.101.286/0001-40',
  since: 2004, // oficinasgyn.com.br: "desde 2004"
  address: 'Av. Botafogo, 724 · Setor Pedro Ludovico · Goiânia', // cadastro na Receita via econodata (jun/2026)
  maps: 'https://www.google.com/maps/search/?api=1&query=Av.+Botafogo,+724,+Setor+Pedro+Ludovico,+Goi%C3%A2nia',
  phone: { label: '(62) 3251-8789', tel: '+556232518789' },
  mobile: { label: '(62) 98132-2167', tel: '+5562981322167', wa: '5562981322167' } // CONFIRMAR se é WhatsApp
}
export const brands = [
  { id: 'mb', name: 'Mercedes-Benz', short: 'MB' },
  { id: 'bmw', name: 'BMW', short: 'BMW' },
  { id: 'audi', name: 'Audi', short: 'AUDI' },
  { id: 'porsche', name: 'Porsche', short: 'PORSCHE' },
  { id: 'lr', name: 'Land Rover', short: 'LAND ROVER' },
  { id: 'volvo', name: 'Volvo', short: 'VOLVO' }
] as const
export const waLink = (msg: string) => `https://wa.me/${shop.mobile.wa}?text=${encodeURIComponent(msg)}`
