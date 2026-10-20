# Conceito 2 — Solo Espaço Pilates (estúdio boutique)

**Status:** conceito aprovado internamente. A demo só será construída depois que a empresa responder "quero ver" (veja o playbook).

## Negócio e público
- Pilates em estúdio com unidades no Marista e no Alphamall, mais aulas online (bio pública). Nota 4,8 com 25 avaliações (telu.app).
- Público provável: mulheres de 28 a 55 anos, renda média-alta, que buscam postura, alívio de dor e rotina. Também pacientes encaminhados por fisioterapeutas.

## Oportunidade comercial
A receita é recorrente (mensalidade). O momento de conversão é a **aula experimental**. Hoje a pessoa precisa perguntar no direct qual unidade, qual horário e qual preço. A página resolve isso em 3 cliques.

## Direção de arte: "luz da manhã"
- Nada de preto e dourado. Fundo areia rosada `#F3E9E2`, sálvia `#7E8C76`, texto `#2B2A28`, acento coral queimado `#C9704F`.
- Tipografia: Fraunces (títulos, com eixo "soft") + Inter Tight.
- Movimento: **CSS e Motion, sem 3D.** Aqui o 3D seria decoração. Uma linha contínua desenha a coluna vertebral durante o scroll, e as seções "respiram" (escala 0,98 → 1). Animações lentas, coerentes com a marca.

## Estrutura
1. Hero: "Seu corpo, no seu ritmo. Aula experimental no Marista ou no Alphamall." Botão: Agendar experimental.
2. Seletor de unidade (mapa estilizado e endereço) → horários de exemplo `[CONFIRMAR grade]`.
3. Para quem é: dor nas costas, pós-parto, performance, 60+. Sem promessas clínicas.
4. Modalidades e formatos: individual, dupla, trio, online `[CONFIRMAR]`.
5. Equipe: fotos e registro CREFITO/CREF `[fornecido pelo cliente]`.
6. Planos: "a partir de" `[CONFIRMAR]` ou "consulte".
7. Perguntas frequentes · formulário (unidade, objetivo, período) → WhatsApp da unidade escolhida.

## Stack
Vite, TypeScript, CSS e a biblioteca `motion` (cerca de 4 KB, só para a linha da coluna). Meta de desempenho: Lighthouse acima de 95 no celular.
