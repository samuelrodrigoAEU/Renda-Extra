# Demo 04: Box 21 Tecnologia Automotiva · oficina de importados

Página de **agendamento de avaliação** guiada por sintoma. É uma demonstração independente, com `noindex` e o aviso "Conceito independente · não oficial" visível na abertura e no rodapé.

## Oportunidade (evidências)
- **Empresa ativa:** CNPJ 07.101.286/0001-40, cadastro atualizado em jun/2026, sede na Av. Botafogo, 724, Setor Pedro Ludovico ([econodata](https://econodata.com.br/consulta-empresa/07101286000140-BOX-21-TECNOLOGIA-AUTOMOTIVA-LTDA)).
- **Especialidade:** importados (MB, BMW, Audi, Porsche, Land Rover, Volvo), segundo os diretórios. Atuando "desde 2004" ([oficinasgyn](https://oficinasgyn.com.br/oficinas/195/box_21)).
- **Presença digital:** **nenhum site nem Instagram localizado.** Só diretórios de 2008 a 2018, com endereço antigo (Av. Assis Chateaubriand) que confunde quem procura.
- **Avaliações:** antigas (2017–2018) e mistas, por isso **não aparecem na página**.

## Referências visuais
Ver `referencias/2026-10-21/ANALISE.md`. A skill Image to Code não está instalada; a análise foi feita manualmente e comparada lado a lado.
- **Ref. B (ThreadLab)** na abertura: objeto 3D central, wordmark expandido sobreposto, HUD com coordenadas e colchetes, chip lima.
- **Ref. A (exposição "48")** na seção "A oficina": grade suíça de 3 colunas com filetes, numeral gigante "21" atrás do recorte, carrossel com setas e botão circular translúcido.

## O que é real, ilustrativo ou pendente
- **Real:** razão social, CNPJ, endereço, telefones, especialidade por marca, 2004.
- **Ilustrativo:** renders do freio (rotulados), aquecimento "simulado" (rotulado).
- **Pendente (omitido da página):**
  1. Confirmar se o celular (62) 98132-2167 é WhatsApp. O botão usa esse número.
  2. Horário de funcionamento (o único dado é antigo).
  3. Lista exata de serviços. A página fala de sintomas, não promete serviços.
  4. Logotipo oficial. O monograma tipográfico é provisório.
  5. Fotos reais da oficina, dos boxes, da equipe e do scanner de diagnóstico.

## Decisões técnicas (evolução)
- **Abertura sem WebGL:** render WebP de 59 KB com `fetchpriority=high`. O 3D só sobe na primeira interação (mouse, toque, rolagem, teclado). Resultado no Lighthouse mobile: **desempenho 98, acessibilidade 100, LCP 2,0 s, TBT 0, CLS 0**.
- **Freio procedural:** pistas com anisotropia (usinagem radial), 40 aletas, 72 furos, cubo, pinça de 3 partes, pastilhas e decalque. Estúdio PMREM próprio.
- **Vista explodida** com 4 etiquetas posicionadas por projeção 3D → 2D. **Frenagem:** segurar o botão (mouse, toque, espaço ou Enter) aquece o disco com emissivo radial e o desacelera.
- **Sem WebGL:** "ver explodida" troca o render; o botão de freio some.

## Rodar e testar
```bash
npm install && npm run build && (npx vite preview --port 4176 &)
node tests/smoke.mjs    # 48 checagens: desktop, tablet, celular, sem WebGL, movimento reduzido
node tests/stills.mjs   # regenera os renders; depois rode o build de novo
```
