# EVOLUTION_LOG: o que cada projeto ensinou ao seguinte

Regra: cada demo nova precisa superar a anterior em originalidade, acabamento e execução. Se lembrar demais a anterior, volte para a direção criativa.

## Critérios de avaliação (0–10)
Originalidade · Impacto inicial · Direção de arte · 3D/animação · Sofisticação da interface · Celular · Desempenho · Clareza comercial · Potencial de conversão · Acabamento.
Mínimo de 8 nos critérios principais. Meta de 9 a 10 em originalidade, execução visual e acabamento. Toda nota vem com a evidência (teste, captura ou medição).

---

## Demo 01: Marcenaria (Dois Eme) · revisão crítica

| Critério | Nota | Evidência |
|---|---|---|
| Originalidade | 6 | Fórmula conhecida: texto à esquerda, 3D fixo à direita, etapas no scroll |
| Impacto inicial | 7 | Hero limpo, mas um aparador sozinho não surpreende |
| Direção de arte | 7 | Boa tipografia (Instrument Serif + Manrope), paleta coerente. Seções finais genéricas |
| 3D / animação | 7 | Portas e gaveta funcionam. Madeira listrada demais, tampo de pedra quase branco, "livros" que parecem caixas |
| Sofisticação da interface | 7 | Amostras de acabamento bonitas. Lista de ambientes só com texto |
| Celular | 6 | Funciona, mas o 3D e o texto disputam a mesma tela |
| Desempenho | 8 | JS inicial de 3 KB, 3D carregado sob demanda, qualidade adaptativa, renderiza só quando há mudança |
| Clareza comercial | 8 | Oferta e próximo passo claros |
| Conversão | 7 | Formulário qualificado para o WhatsApp. Sem barra de CTA fixa no celular |
| Acabamento | 6 | Portfólio com molduras vazias. Prateleira cortada sob o header. Etapas que somem no scroll rápido |

### Erros que não podem se repetir
1. **Processo:** duas empresas marcadas como "site não localizado" tinham site (Dois Eme e GAW). Agora a verificação exige busca pelo nome **com** "site" ou "loja", mais o nome da cidade, antes de pontuar.
2. **Molduras vazias** no lugar de fotos derrubam a percepção de qualidade. Usar renders próprios do 3D como imagem editorial (com o rótulo "render ilustrativo").
3. **Um objeto, uma ideia:** o 3D ficou isolado no topo e o resto da página virou template. A experiência precisa atravessar a página.
4. **Texturas procedurais pobres:** em joias e metal, o realismo vem do ambiente de reflexo (iluminação de estúdio), não de textura.
5. **Vídeo:** gravar em tempo real com GPU por software trava. Usar o renderizador com relógio virtual (`tests/render60.mjs`).
6. **Fade só no passo central** esconde o texto quando a rolagem é rápida. Preferir revelações que não dependam do passo central.
7. **SEO e segurança ausentes:** faltaram JSON-LD, imagem de compartilhamento (Open Graph) e CSP.

### O que funcionou e fica
- Carregar o 3D sob demanda, qualidade adaptativa e renderizar só quando algo muda.
- `config.ts` com os dados do cliente e as pendências marcadas `CONFIRMAR`.
- Formulário → mensagem organizada no WhatsApp. Faixa de demonstração e `noindex`.
- Teste de fumaça no Playwright e capturas revisadas a olho.

---

## Demo 02: Alianças (Lindyse) · conceito "O Estojo"

**O que mudou em relação à 01:**
- Paleta: veludo vinho e porcelana, no lugar de papel creme.
- Tipografia: Bodoni Moda com eixo óptico e Jost, no lugar de Instrument Serif e Manrope.
- Abertura: tipografia monumental *atrás* do objeto 3D, e não texto à esquerda com 3D à direita.
- Narrativa: travessia por dentro do anel, e não etapas laterais.
- Interação principal: gravação ao vivo dentro da peça, mais uma ferramenta útil (o medidor de aro), no lugar de um configurador de cor.
- Imagens: renders reais da própria cena no lugar de molduras vazias.
- O 3D atravessa a página: abertura, travessia e gravação.

| Critério | Nota | Evidência / limitação |
|---|---|---|
| Originalidade | 9 | Travessia pelo anel com revelação sincronizada, gravação interna ao vivo, medidor calibrado. Nenhum elemento repete a 01 |
| Impacto inicial | 9 | Capturas: título monumental com as alianças em primeiro plano, pavé cintilando, a gravação já visível na abertura |
| Direção de arte | 8 | Paleta e tipografia coerentes. O logotipo ainda é provisório |
| 3D / animação | 8 | Ouro PBR convincente. O brilhante é uma aproximação: não tem refração física nem dispersão real |
| Sofisticação da interface | 8 | Seleções em pílula, medidor, linha de ouro desenhada pelo scroll, cabeçalho que muda de tema sobre as seções claras |
| Celular | 8 | Prévia 3D presa no topo enquanto os controles rolam. CTA fixo some nas seções com ação própria. **Não testado em aparelho real** |
| Desempenho | não medido | 4 KB iniciais, 3D sob demanda, qualidade adaptativa. O FPS real depende de GPU que este ambiente não tem: testar num Android intermediário |
| Clareza comercial | 8 | Oferta (alianças sob medida) e próximos passos claros |
| Potencial de conversão | 9 | Três ferramentas alimentam uma mensagem qualificada (ouro, largura, gravação, aros) |
| Acabamento | 8 | Testes de fumaça 15/15. Revisão visual de abertura, travessia, ateliê, gravação, medidor, processo, contato e versão sem WebGL |

### Erros encontrados e corrigidos durante a produção
1. **Revelação antes da hora:** o círculo da travessia aparecia preenchido já na abertura. Agora ele só abre com a aliança de frente.
2. **Transmissão do Three.js em gemas pequenas sobre fundo escuro:** as pedras viravam "buracos pretos". Trocado por reflexão interna em cubemap próprio.
3. **`computeVertexNormals` no LatheGeometry:** criava uma costura no metal. Usar as normais nativas do Lathe.
4. **`url()` relativo dentro de variável CSS** resolve a partir da pasta do CSS, não da página. Usar a URL absoluta via JS.
5. **Gravação em Bodoni fina** serrilhava na tela pequena: peso 600 e câmera mais próxima no celular.
6. **CTA fixo e prévia fixa** cobriam os controles no celular: esconder o CTA nas seções com ação própria e aplicar `scroll-margin-top`.

### Regras novas para a 03
- Planejar desde o início um **render estático** de cada cena (fallback, Open Graph e imagens editoriais).
- Toda captura por etapa vem acompanhada de uma checagem automática (`show-cta`, classes do tema, URLs).
- Antes de escolher a empresa: buscar `nome + site` e `nome + cidade`. Duas falsas "sem site" já aconteceram.
