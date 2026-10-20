# Demo 03: Solo Espaço Pilates · conceito "Tensão"

Landing page de **agendamento de aula experimental**. É uma demonstração independente, com `noindex` e faixa de aviso.

## Oportunidade (evidências)
- **Sem domínio próprio:** a presença online é uma página em subdomínio de terceiros (`solopilates.hpub.com.br`), mais Facebook, Yelp e Instagram ([@solo_espaco_pilates](https://www.instagram.com/solo_espaco_pilates/), ~6,4 mil seguidores).
- **Negócio sólido:** CNPJ aberto em 30/09/2004 ([econodata](https://www.econodata.com.br/consulta-empresa/07016697000138-solo-centro-de-reeducacao-fisica-ltda)), duas unidades (Marista e Alphamall) e aulas online.
- **Avaliações:** nota **4,8** com **25 avaliações** públicas na unidade Marista ([Telu](https://telu.app/ranking/br/fitness/pilates/goiania/setor-marista/solo-espaco-pilates-marista)), elogiando equipe e instalações. Há uma crítica pública sobre a demora no retorno pelo WhatsApp, justamente o que um pedido de agendamento completo resolve.
- **Telefones** com divergência entre fontes: a página usa (62) 3092-8565 para o Marista (o mais consistente) e (62) 3414-7852 para o Alphamall (vem do [Alphamall](https://alphamall.com.br/lojas/solo-espaco-pilates/)).

## Conceito
| | |
|---|---|
| Personalidade | Estúdio claro, técnico e acolhedor: cuidado sem cara de hospital |
| Ideia central | **A interface obedece à física de molas**, como o reformer |
| Tipografia | Anybody variável (largura de 50% a 150%) nos títulos; Fraunces itálico SOFT nas notas humanas; Figtree no texto |
| Código visual | As cores das molas do reformer viram o sistema: amarela para reabilitação, azul para postura, vermelha para condicionamento, verde para online |
| Movimento | "PILATES" é uma mola: estica com o scroll, pode ser puxada e volta oscilando. Os títulos entram "relaxando" a largura |
| 3D | Reformer modelado em código. Arrastar o carrinho aplica força; cada mola tem uma constante `k` diferente. **A vermelha anda menos com a mesma força**, e isso foi verificado em teste |
| Conversão | Pedido de aula experimental: objetivo, unidade, período e experiência, com **prévia ao vivo da mensagem** para o WhatsApp e telefones clicáveis por unidade |

## O que é real, ilustrativo ou pendente
- **Real e verificado:** nome, razão social, CNPJ, 2004, unidades, endereço do Marista, telefones, horário do Alphamall, nota e quantidade de avaliações (com a fonte e a data na página), frentes de trabalho e "equipe multidisciplinar" (texto da própria empresa).
- **Ilustrativo:** os renders do reformer (rotulados) e a física das molas (a página avisa que a carga real é definida pela equipe).
- **Pendente:** ver a lista abaixo. O que não foi confirmado **não aparece** na página.

### Pendências para a empresa confirmar
1. WhatsApp oficial (`studio.whatsapp` em `src/config.ts`). Sem ele, o botão abre o WhatsApp sem destinatário. Os telefones já funcionam.
2. Horário completo do Marista. As fontes divergem entre 19h30 e 21h, por isso a página diz "a partir das 7h".
3. Endereço exato da loja no Alphamall.
4. Planos e valores, formato das aulas online, Wellhub/Gympass (omitidos).
5. Formação da equipe (fisioterapeutas? CREFITO?). Não foi afirmada.
6. Logotipo oficial. A marca na página é tipográfica e provisória.

### Lista de fotos a produzir (substituem os renders)
1. Unidade Marista às 8h, luz lateral de janela, salão com os reformers vazios (horizontal, para a abertura).
2. Close das molas coloridas no gancho (vertical, para a seção das molas).
3. Instrutor ajustando a mola para um aluno, com autorização de imagem (para "Caminhos").
4. Fachadas ou recepções das duas unidades (para "Unidades").
5. Retrato da equipe (para a seção de confiança).

## Rodar e testar
```bash
npm install && npm run dev
npm run build && (npx vite preview --port 4175 &)
node tests/smoke.mjs     # 41 checagens: 3 larguras de tela, sem WebGL e com movimento reduzido
node tests/stills.mjs    # regenera os renders a partir da cena; depois rode o build de novo
```
- **Peso:** JS inicial de 5 KB gzip. O 3D (140 KB gzip) só carrega a 900 px da seção, e a abertura usa uma imagem (`fetchpriority=high`), não WebGL.
- **CSP** é aplicada no build.
