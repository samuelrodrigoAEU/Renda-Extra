# Conceito 3 — GAW Joalheria Autoral

> **DESCARTADO (20/10/2026):** a GAW fica em São Paulo (Lapa) e tem site próprio (gawgaw.com.br). Fonte: casamentos.com.br e gawgaw.com.br/us/quem-somos.

**Status:** conceito. **Bloqueio:** confirmar a cidade e se já existe loja online antes de investir horas.

## Negócio e público
- Joalheria autoral em ouro e prata, com cerca de 69 mil seguidores no Instagram (trecho de busca). A venda hoje parece acontecer pelo direct.
- Público: mulheres de 25 a 50 anos que compram peças com significado. Também noivos (alianças).

## Oportunidade comercial
Com uma base grande no Instagram e nenhuma vitrine própria localizada, cada venda depende de conversa manual. Uma vitrine de coleções com encomenda pelo WhatsApp (e, numa fase 2, um checkout) aumenta o valor percebido e organiza os pedidos.

## Direção de arte: "galeria noturna"
- Fundo azul-petróleo profundo `#0E1A1E`, marfim `#EFE9DF`, acento champanhe `#D8C3A0`. Fica longe do clichê preto e dourado, com sensação de vitrine de museu.
- Tipografia: Cormorant (títulos) + Satoshi ou General Sans.
- **3D com propósito:** um anel ou pingente modelado (LatheGeometry e TubeGeometry) com MeshPhysicalMaterial, metalness 1, iridescência sutil e um environment map de estúdio. A peça gira devagar e responde ao cursor. A cena só renderiza quando há movimento. No celular: giro por toque, DPR limitado a 1,5, e imagem estática se o WebGL falhar.
- Modelo real: pedir à marca o arquivo CAD da peça (joalherias costumam ter, em Rhino ou Matrix) e converter para glTF com compressão Draco. Isso dá a fidelidade máxima.

## Estrutura
1. Hero: a peça em 3D com "Joias que guardam histórias." Botões: Ver coleções e Encomendar peça autoral.
2. Coleções (grid editorial com fotos da marca `[autorizadas]`).
3. Processo da peça autoral: conversa, desenho, modelagem, ourivesaria e entrega.
4. Materiais: ouro 18k e prata 925 `[CONFIRMAR]`, certificado e garantia `[CONFIRMAR]`.
5. Alianças: seletor de largura e acabamento → WhatsApp.
6. Perguntas frequentes (prazo, envio, tamanho do anel, cuidados) e contato.

## Stack
Vite, TypeScript, Three.js (com o mesmo padrão de carregamento sob demanda e qualidade adaptativa do piloto).
