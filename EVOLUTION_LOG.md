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

---

## Auditoria 2 (21/10/2026): evidências medidas nas demos 01–03

Ferramentas: Lighthouse 12 (mobile, Chromium com GPU emulada por software, que **infla o TBT** em páginas com WebGL), capturas do Playwright e leitura do código. Problemas **confirmados** vêm com a medição; **hipóteses** estão marcadas.

| Demo | Desempenho | Acessibilidade | Boas práticas | SEO* | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| 01 Marcenaria | 49 | 96 | 100 | 54 | 3,8 s | 23,6 s | 0 |
| 02 Lindyse | 67 | 96 | 100 | 58 | 2,0 s | 11,6 s | 0 |
| 03 Solo | 92 | 100 | 100 | 58 | 2,7 s | 0 ms | 0,094 |
\*SEO baixo é proposital (`noindex` nas demonstrações), mais `robots.txt` inexistente.

| # | Problema | Evidência | Impacto | Correção | Como evitar |
|---|---|---|---|---|---|
| 1 | WebGL na abertura trava o carregamento | TBT de 23,6 s (01) e 11,6 s (02) contra 0 ms na 03, que abre com imagem | Em celular fraco, a página demora a responder ao toque | 01/02: abrir com render estático e trocar pelo 3D depois do primeiro toque ou quando o navegador estiver ocioso | **Regra:** primeira tela sem WebGL bloqueante. O 3D entra depois do LCP |
| 2 | CLS de 0,094 na 03 | `layout-shifts`: `.hero-grid` desloca 0,067 quando a fonte da palavra elástica carrega | Conteúdo pula enquanto a pessoa lê | Reservar a altura da palavra no CSS antes da fonte carregar | Testar CLS no Lighthouse antes de entregar (meta < 0,05) |
| 3 | Contraste insuficiente | `.eyebrow` e `.fine` (01) e um `<span>` de pílula (02) abaixo de 4,5:1 | Leitura difícil e falha de acessibilidade | Escurecer o texto auxiliar | Lighthouse com acessibilidade 100 como critério de saída |
| 4 | Sem `robots.txt` nem sitemap | Auditoria de SEO | Na publicação real, prejudica a indexação | Incluir `robots.txt` (bloqueando na demo) e sitemap no build final | Checklist de publicação |
| 5 | Fotografia | Nenhuma demo tem foto real (rede bloqueia bancos e Instagram) | Percepção de valor limitada; a nota de fotografia ficou em 5 | Renders próprios e lista de fotos a produzir; pedir as fotos na primeira conversa | Liberar um banco de imagens no ambiente |
| 6 | Logotipos provisórios | As três usam marca tipográfica improvisada | Cliente pode estranhar a marca "redesenhada" | Deixar explícito na apresentação que a marca entra depois | Pedir o logo junto com as fotos |
| 7 | (hipótese) Desempenho em celular real | Não há GPU real aqui | O FPS do 3D é desconhecido | Testar num Android intermediário | Pendência fixa até ter um aparelho de teste |

### Padrões criativos já usados (consolidado)
- **01:** papel creme, serifa editorial, texto à esquerda com 3D fixo à direita, configurador de acabamento.
- **02:** veludo escuro, Bodoni monumental atrás do objeto, travessia pelo anel, gravação ao vivo, medidor.
- **03:** claro e vibrante, tipografia elástica, código de cores funcional, física de mola, prévia ao vivo da mensagem.
- **Comuns a evitar:** formulário em pílulas, FAQ em lista, CTA fixo no rodapé do celular, faixa de demonstração no topo (obrigatória, mas pode ser mais elegante).

---

## Demo 04: Box 21 Tecnologia Automotiva · "Freio aberto" (refs. ThreadLab + "48")

**Processo com referências:** skill Image to Code indisponível (verificada). Fiz a análise manual em `referencias/2026-10-21/ANALISE.md`, a implementação, a comparação lado a lado e os ajustes (ex.: adicionei o halo atmosférico que faltava em relação à ref. B).

**Evolução concreta em relação às demos anteriores:**
- **Primeira linguagem "técnica/HUD":** Archivo expandida, IBM Plex Mono, lima funcional. Nenhum padrão das demos 01 a 03 se repete.
- **3D com utilidade dupla:** vista explodida *explica* as peças e a frenagem *demonstra* (aquecimento e desaceleração).
- **Conversão nova:** diagnóstico por sintoma, com prévia em formato de **ordem de serviço** e aviso automático de guincho.
- **Melhor desempenho do portfólio:** 98 no Lighthouse mobile, TBT 0, CLS 0, com o padrão "render primeiro, 3D na interação".
- **Erros persistentes corrigidos nas demos antigas:** 02 de 65 para 97 (mesmo padrão), 01 e 02 com acessibilidade de 96 para 100, CLS da 03 de 0,094 para 0,028.

| Critério | Nota | Evidência |
|---|---|---|
| Originalidade | 9 | Linguagem HUD e freio interativo com aquecimento; sem repetir técnicas anteriores |
| Qualidade tipográfica | 9 | Archivo 125% no wordmark, 88% no H1, mono nos dados; hierarquia clara (ver capturas) |
| Direção de arte | 9 | Duas referências combinadas: abertura escura e seção editorial clara com numeral "21" |
| Fotografia | 5 | Ainda sem fotos reais (rede bloqueada); renders rotulados. Lista de fotos no README |
| Profundidade de conteúdo | 7 | Endereço, telefones, CNPJ, especialidade, perguntas. **Faltam horário e lista de serviços confirmados** |
| Adequação ao segmento | 9 | O freio é a peça de segurança mais compreensível para o cliente; foco em sintoma, endereço e telefone |
| Animações | 8 | Explodir, aquecer, desacelerar e etiquetas projetadas. Revelações discretas |
| 3D | 8 | Disco convincente (anisotropia, furos, aletas); pinça simplificada, sem pistões |
| Clareza comercial | 9 | H1 visível sem rolar nas 3 larguras (testado); CTA de agendamento e ligação em todas as seções |
| Credibilidade | 7 | CNPJ e endereço da Receita; sem avaliações recentes, então não exibidas |
| Responsividade | 9 | 390, 820 e 1440 px sem rolagem lateral, menu móvel testado |
| Desempenho | 9 | Lighthouse 98, TBT 0, CLS 0 (GPU emulada; aparelho real pendente) |
| Funcionalidade | 9 | 48/48 checagens. WhatsApp usa número a confirmar; telefones funcionam |
| Acabamento | 8 | Etiquetas sobrepostas no celular foram corrigidas; a pinça ainda é a peça menos refinada |

### Erros encontrados e corrigidos
1. A ordem de serviço ficou ilegível (lima sobre papel claro) por herança de `.diag .mono`. Agora tem cor explícita no `.ticket`.
2. As etiquetas da vista explodida se sobrepunham no celular. Agora há deslocamento por etiqueta.
3. `[hidden]` era vencido por `display: inline-flex` e o botão de freio aparecia sem WebGL. Agora há regra global.
4. A câmera cortava a pinça, e o decalque ficava numa face invisível e na direção errada.

### Regras novas para a 05
- **"Render primeiro, 3D na interação"** é o padrão para qualquer abertura com WebGL.
- Lighthouse (mobile) faz parte da saída: acessibilidade 100, CLS < 0,05, desempenho ≥ 90.
- Toda classe utilitária de cor (como `.mono`) precisa ser checada em fundo claro **e** escuro.

---

## Demo 05: Leude Barbosa Estética · "Acetinado" (nova diretriz: sem títulos artificiais)

**Processo:**
- Consultei o log e gerei o conceito com um workflow: 3 propostas independentes e 1 juiz.
- Construí, testei e fiz uma revisão adversarial. Não houve referências enviadas para este projeto, então a skill Image to Code não se aplicou.

**Evolução concreta em relação às demos anteriores:**
- **Sem nenhum título de seção, eyebrow ou numeração.** A hierarquia vem de:
  - voz serifada contra texto corrido;
  - sulcos em relevo seco (nenhuma troca de fundo);
  - escada de passos por recuo;
  - o nome em relevo;
  - o "T-4" monumental.
- **Ideia memorável inédita:** a folha de papel de arroz absorve o brilho e **para sozinha** no equilíbrio. O gesto ensina o conceito do método ("Equilibrar não é secar") sem prometer resultado.
- **WebGL2 cru**, sem Three.js:
  - o relevo e os poros são calculados uma vez numa textura;
  - a luz fica sob demanda e a máscara é lida em CPU.
- **Primeiro quadro em CSS:** desempenho 96 no Lighthouse mobile, TBT 0, CLS 0.

| Critério | Nota | Evidência |
|---|---|---|
| Originalidade | 9 | Folha que absorve e para no equilíbrio; nada repetido das demos 01 a 04 |
| Qualidade tipográfica | 9 | Albert Sans 320 no H1 em 3 linhas fixas (testado), Newsreader com tamanho óptico na voz |
| Direção de arte | 9 | Paleta caulim e grafite, um único reflexo; sulcos e relevo seco no lugar de blocos |
| Fotografia | 4 | Sem fotos (rede bloqueada). Superfícies geradas e rotuladas; lista de fotos no README |
| Profundidade de conteúdo | 7 | Só o que a matéria confirma; faltam horário, duração da análise e WhatsApp confirmado |
| Adequação ao segmento | 9 | Fala de equilíbrio, não de "secar"; sem antes e depois nem promessa |
| Animações | 8 | Capilaridade da mancha, reflexo único nos títulos, revelação só abaixo da dobra |
| 3D / WebGL | 8 | Janela refletida nítida quando oleosa e desfocada quando tratada, mais faíscas; o fosco ainda é sutil em telas pequenas |
| Clareza comercial | 9 | CTA visível sem rolar em 390, 820 e 1440 px (testado); a ficha monta a mensagem ao vivo |
| Credibilidade | 7 | Matéria citada com link; sem avaliações verificadas, então nada exibido |
| Responsividade | 9 | Sem rolagem lateral; deslizar na amostra rola a página, e arrastar a folha não rola (testado) |
| Desempenho | 9 | Lighthouse 96, TBT 0, CLS 0 (GPU emulada) |
| Funcionalidade | 9 | 57/57 checagens (sem WebGL, movimento reduzido, toque, rascunho) |
| Acabamento | 8 | Shader refeito 3 vezes até sair do aspecto "metal pontilhado" |

### Erros encontrados e corrigidos
1. O primeiro shader tinha poros grandes e regulares e virou um "metal pontilhado". Refeito com poros de raio e presença aleatórios, relevo largo e ombro de tom (sem estourar).
2. O equilíbrio dependia de 12 s de pressão medidos por quadro. Em aparelho lento ficava 2× mais longo. Agora conta 7 s de tempo real, ou 40% da área tratada.
3. A demonstração automática contava como "primeira interação" e trocava a instrução. Agora ela não conta.
4. O boot do WebGL depois do LCP dava TBT de 1.300 ms (desempenho 62). Com o padrão da regra (3D na interação), o reflexo 2D preguiçoso e as máscaras em CPU, o desempenho foi a 96 e o TBT a 0.
5. A identificação "conceito independente" só aparecia no rodapé. Agora também aparece sob o nome, no topo.

### Regras novas para a 06
- O teste de toque usa `Input.dispatchTouchEvent`. O `synthesizeScrollGesture` não rola no headless e dá falso negativo.
- Qualquer contagem de tempo de interação usa tempo real, não `dt` limitado por quadro.
- O shader é aprovado por uma captura comparativa (metade tratada, metade original) antes do teste completo.

### Correção retroativa na demo 01 (21/10)
A pendência da auditoria (TBT de 23,6 s, desempenho 49) foi resolvida com o padrão "render primeiro, 3D na interação":
- a abertura usa um pôster gerado do próprio 3D;
- o Three.js e a checagem de contexto WebGL só acontecem no primeiro gesto.

Resultado no Lighthouse mobile: **desempenho 100**, TBT 0, CLS 0. As cinco demos agora seguem a mesma regra.
