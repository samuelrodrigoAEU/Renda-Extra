# Demo 05: Leude Barbosa · "Acetinado"

Página de **agendamento da análise de pele** para uma esteticista de pele oleosa. É uma demonstração independente: tem `noindex`, a linha "conceito independente, não é o site oficial" logo abaixo do nome, no topo, e o aviso repetido no rodapé.

> **BLOQUEIO DE PUBLICAÇÃO:** o número (62) 98100-7881 vem de uma matéria de cerca de 2023 e é **WhatsApp provável, não confirmado**. Não publique nem envie o link com esse número antes de confirmar com a própria Leude.

## Oportunidade (evidências)
- **Quem é e o que faz:** a [matéria do Curta Mais](https://curtamais.com.br/goiania/esteticista-em-goiania-desenvolve-metodo-inedito-de-limpeza-de-pele-que-une-experiencia-e-tecnologia/) a apresenta como esteticista e cosmetóloga em Goiânia, com método próprio de limpeza de pele para pele oleosa. Segundo a matéria, o método começa pela análise da pele, que define o protocolo, e tem como objetivo combater a oleosidade e restabelecer o equilíbrio da pele, com tecnologias atuais (sem detalhar quais).
- **Contato e endereço** (citados na mesma matéria): Av. T-4, 619, Sala 812, Setor Bueno · Instagram @leudebarbosa.
- **Presença digital:** a busca "nome + site" de 21/10/2026 não encontrou site próprio. A rede deste ambiente bloqueia o Instagram, então **o link da bio não foi conferido**. Confira antes do contato.
- **Avaliações:** nenhuma pública verificada, por isso a página não exibe nenhuma.

## A ideia
A pele oleosa é tratada como **brilho**, não como "problema". A abertura é uma amostra mineral acetinada com uma folha de papel de arroz por cima:
- arrastar e segurar a folha absorve o brilho, e ela deixa uma mancha translúcida que cresce por capilaridade;
- a folha **para sozinha** quando o brilho chega a um piso: nunca fica fosca como giz;
- uma escala "espelho, equilíbrio, giz" acompanha o gesto e para no meio.

O texto amarra o gesto ao método: "Aqui a folha para. Equilibrar não é secar." A frase vem do objetivo publicado do método, sem prometer resultado.

**Na composição, não há títulos de seção nem eyebrows.** A hierarquia vem de:
- uma voz serifada grande (Newsreader) contra um texto corrido sem serifa (Albert Sans);
- sulcos em relevo seco no lugar de trocas de fundo;
- uma escada de quatro passos sem números;
- o nome em relevo seco;
- o endereço com o "T-4" monumental, numa "outra zona T".

## O que é real, ilustrativo ou pendente
- **Real:** nome, profissão, método (só o que a matéria diz), endereço, Instagram.
- **Ilustrativo:** a amostra é gerada em código e rotulada "não é pele real nem resultado de tratamento". As três texturas de "peles oleosas diferentes" também são rotuladas. O mapa de zonas é "pela sua percepção, não é diagnóstico".
- **Nunca usar:** antes e depois, depoimentos, números de clientes, prazos de resultado.
- **Pendente (pedir à Leude):**
  1. Confirmar o WhatsApp (bloqueia publicação).
  2. Horário de atendimento e duração da análise.
  3. Fotos reais: retrato da Leude, sala 812, cabine e equipamentos (só os que ela quiser mostrar).
  4. Logotipo, se houver. O wordmark atual é tipográfico e provisório.
  5. Se ela quer citar valores ou não. A página não cita.

## Decisões técnicas
- **Primeiro quadro em CSS**, com gradiente, ruído SVG e brilho. Na primeira interação com a página (mouse, toque, rolagem, teclado), o WebGL2 entra com fade de 600 ms.
  - O shader faz o relevo e os poros uma única vez, numa textura. A luz fica sob demanda: uma janela refletida, nítida quando a pele está oleosa e desfocada quando foi tratada, mais as faíscas de uma luz pontual.
  - A máscara de brilho é um canvas 256² lido em CPU a cada 250 ms.
- **Sem WebGL2:** um reflexo 2D com a mesma máscara. As pressões continuam acumulando.
- **Acessibilidade:** a folha é um `<button>` (setas movem, Espaço pressiona, Esc devolve).
  - Com movimento reduzido, aparece "Pressionar a folha", e três toques chegam ao equilíbrio.
  - O reflexo dos títulos usa `content: attr() / ""` para não ser lido duas vezes.
  - Só a folha tem `touch-action: none`: deslizar na amostra rola a página.
- **Ficha:** monta a mensagem do WhatsApp e a prévia a cada toque. Não há envio nem servidor, e o rascunho fica só no navegador (`localStorage`). A CSP bloqueia formulários e requisições externas.
- **Lighthouse mobile:**
  - desempenho 96, acessibilidade 100, boas práticas 100;
  - TBT 0, CLS 0, LCP 2,3 s;
  - SEO 54 só por causa do `noindex`, que é intencional.

## Rodar e testar
```bash
npm install && npm run build && (npx vite preview --port 4177 &)
node tests/smoke.mjs    # 57 checagens: desktop, tablet, celular, toque, sem WebGL, movimento reduzido
node tests/stills.mjs   # capturas para revisão visual (pasta screens/)
```
