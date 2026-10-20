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

---

## Autópsia criativa das demos 01 e 02 (antes da 03)

**Erros de julgamento, não só técnicos:**
1. **Faltou contar quem é a empresa.** Nenhuma das duas tinha endereço completo, horário, telefone nem mapa. A Lindyse tinha esses dados públicos (Av. 24 de Outubro, 1163, horário seg–sex 8h30–18h) e eu não usei. Um visitante não conseguiria *ir* à loja.
2. **Zero prova social pesquisada.** Não procurei avaliações públicas em nenhuma. Confiança ficou só em "CONFIRMAR".
3. **Imagens:** a 01 tinha molduras vazias. A 02 usava renders rotulados: honestos, mas mostram o *produto genérico*, nunca a *empresa*. Nenhuma das duas mostrava lugar, pessoas ou trabalho real. (Limitação real: a rede bloqueia Instagram, sites e bancos de fotos. Ver abaixo.)
4. **Títulos abstratos:** "Feitas à mão, uma vez só." é bonito, mas não diz "alianças" sem o subtítulo. A 01 foi mais clara.
5. **Excesso de cara de demonstração:** o tracejado "CONFIRMAR" espalhado por seções inteiras faz a página parecer inacabada. Melhor omitir o que não é confirmado e concentrar as pendências numa lista separada (README e apresentação).
6. **As duas eram escuras e "objeto 3D como herói"** (a 02 ainda mais). Risco de virar assinatura repetida.
7. **3D no topo pesa o primeiro carregamento** (LCP depende de shader e PMREM) em aparelho fraco.

**O que preservar:** gravação ao vivo e medidor de aro (ferramentas úteis que alimentam o formulário); tipografia monumental com eixo óptico; renders estáticos da própria cena; formulário → mensagem qualificada; testes e capturas por seção; vídeo em tempo virtual.

### Padrões já usados (evitar ou reinventar de propósito)
- Fundo escuro de veludo ou papel creme com serifa itálica colorida em uma palavra.
- 3D fixo como herói e etapas no scroll ao lado.
- Eyebrow em caixa alta espaçada antes de todo título.
- Seleção de opções em pílulas, FAQ em `<details>` e processo numerado em 4 ou 5 colunas.
- Alternância escuro/claro a cada seção. CTA fixo em pílula no celular.
- Objeto girando com a luz seguindo o cursor.

### Limitação de imagens (ambiente)
O proxy recusa images.unsplash.com, pexels, wikimedia, pixabay, Instagram e os sites das empresas. Não há como baixar fotos licenciadas nem reais aqui. Estratégia: (a) imagens próprias honestas (renders e ilustração tipográfica), sempre rotuladas; (b) **lista de fotos a produzir** com direção de arte, para o cliente aprovar e fotografar; (c) layout pensado para receber as fotos reais sem redesenho.

---

## Demo 03: Solo Espaço Pilates · conceito "Tensão"

**O que mudou de verdade em relação à 01 e à 02 (aplicando a autópsia):**
- **Linguagem clara e vibrante,** com cores funcionais (código das molas). Nada de fundo escuro ou papel creme.
- **Empresa explicada por completo:** razão social, CNPJ, ano, frentes de trabalho, unidades com endereço, CEP, horário, telefone clicável e "Como chegar".
- **Prova social real e com fonte:** 4,8 com 25 avaliações, link e data na página. Nenhum depoimento inventado.
- **Pendências fora da página:** em vez de tracejados "CONFIRMAR" espalhados, o que não foi confirmado é omitido e listado no README.
- **Título que diz o que vende:** "Pilates para reabilitar, fortalecer e alinhar o corpo." A palavra gigante é decorativa (`aria-hidden`); o H1 é claro.
- **3D fora da abertura:** a primeira tela usa imagem com `fetchpriority=high`. O 3D só carrega perto da seção. É a melhor estratégia de LCP até agora.
- **3D com função:** a física das molas *ensina* o método (a vermelha resiste mais, verificado em teste), e não é só um objeto girando.
- **Formulário com prévia ao vivo da mensagem** e telefones por unidade como alternativa ao WhatsApp.
- **Testes mais fortes:** 41 checagens, incluindo tablet, movimento reduzido, física (mola vermelha < amarela) e telefone clicável.

| Critério | Nota | Evidência / limitação |
|---|---|---|
| Originalidade | 9 | Tipografia com física de mola real e reformer com resistência por mola. Nenhuma técnica repete as demos anteriores |
| Qualidade tipográfica | 9 | Eixo de largura usado como linguagem (estica, comprime, oscila). Hierarquia clara entre display, serifa itálica e texto |
| Impacto visual | 8 | Abertura forte e limpa. Sem fotografia real, o impacto fica abaixo do que fotos do estúdio dariam |
| Fotografia | 5 | **Limitação de ambiente:** a rede bloqueia bancos de fotos e o Instagram. Renders rotulados e lista de fotos a produzir |
| Profundidade de informação | 9 | Razão social, CNPJ, unidades, endereço, CEP, horários, telefones, mapa, frentes, FAQ |
| Prova de confiança | 8 | Nota real com fonte e data, ano de fundação, CNPJ. Faltam fotos da equipe e depoimentos autorizados |
| 3D / animação | 8 | Física estável (subpassos, batente com quique). Modelo convincente, mas simplificado (sem cordas e alças) |
| Clareza comercial | 9 | Objetivo único (aula experimental) com CTA em todas as seções e telefones como alternativa |
| Responsividade | 8 | 390, 820 e 1440 px sem rolagem lateral (verificado). Falta aparelho real |
| Desempenho | 8 | 5 KB iniciais, abertura sem WebGL, 3D sob demanda e pausado fora da tela. FPS real não medido |
| Funcionalidade | 8 | Tudo testado. O WhatsApp depende do número oficial; os telefones funcionam |
| Acabamento | 8 | Revisão por seção em 3 larguras. Falhas encontradas e corrigidas abaixo |

### Erros encontrados e corrigidos na produção
1. "PILATES" comprimida ocupava a primeira tela inteira e escondia o H1. Agora há limite de altura e repouso mais largo.
2. A largura útil ignorava o padding: a palavra transbordava. Agora usa a largura interna real.
3. Força alta demais no controle deslizante: todas as molas chegavam ao fim do curso, e a demonstração não mostrava diferença.
4. As estrelas não apareciam: a variável `--f` estava no filho, não no elemento com a máscara.
5. O rodapé transbordava no celular (palavra a 150% e grade sem `minmax(0, …)`).
6. Escolher uma mola marcava o objetivo no formulário sem ação do usuário. Agora só marca com clique.

### Regras novas para a 04
- **Fotografia continua sendo o maior déficit.** Antes de prospectar a próxima empresa, liberar no ambiente um banco de imagens (Unsplash ou Pexels) **ou** pedir ao cliente as fotos na primeira conversa.
- Começar pela primeira tela: o H1 que explica o negócio precisa aparecer *sem rolar* em 390 × 844.
- Toda física ou interação precisa de um teste que prove o efeito (como "a vermelha resiste mais").
