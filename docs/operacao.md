# Registro do ciclo 1: testes, limitações, custos e próximos passos

## Ambiente
Node 22, npm 10, Chromium 1194 (Playwright 1.56.1), Python 3.13. Instalação de pacotes pelo npm funciona normalmente.

## Testes executados (demo 01, 20/10/2026)
Script: `clientes/demos/01-marcenaria-alto-padrao/tests/smoke.mjs`, rodando no Chromium headless com WebGL via SwiftShader.

| Teste | Desktop 1440×900 | Celular 390×844 |
|---|---|---|
| `tsc --noEmit` e build do Vite | ok | ok |
| WebGL carrega (`.webgl-ready`) | PASS | PASS |
| Animação por scroll nas 4 etapas (capturas revisadas a olho) | PASS | PASS |
| Troca de acabamento atualiza o 3D e o campo do formulário | PASS | PASS |
| Validação do formulário mostra o erro | PASS | PASS |
| Envio gera link `wa.me` com a mensagem certa | PASS | PASS |
| Sem rolagem horizontal | PASS | PASS |
| Console sem erros | PASS (0) | PASS (0) |
| Sem WebGL, cai no visual estático (`.no-webgl`) | PASS | n/a |

Tamanhos: JS inicial de 3,2 KB gzip, CSS de 7,3 KB gzip, 3D de 139 KB gzip carregado sob demanda.

**Problemas encontrados e corrigidos no piloto:**
- Enquadramento cortava o móvel: a distância da câmera agora se adapta à proporção da tela.
- Veio da madeira parecia ondulado: ficou retilíneo, com faixas de tom.
- Texto de etapas anteriores sobrepunha o 3D: só a etapa central fica visível.
- Em GPU fraca, o 3D atrasava em relação ao scroll: entraram a qualidade adaptativa e a renderização só quando algo muda.

## Limitações conhecidas
- **Rede do ambiente:** o acesso direto a Instagram, Google Maps e sites das empresas foi bloqueado. A pesquisa usou só buscas indexadas, por isso nenhuma empresa está marcada como "sem site confirmado". Para liberar, ajuste o *Network access* do ambiente (veja https://code.claude.com/docs/en/cloud-environments#network-access).
- Os testes rodaram com GPU por software. Ainda falta teste em aparelhos reais (um iPhone e um Android intermediário) e uma medição de Lighthouse com GPU.
- Sem fotos reais: o portfólio usa molduras vazias, de propósito.
- O 3D é procedural (aparador genérico de alto padrão), não um móvel do cliente. Com fotos ou projetos reais, dá para modelar uma peça assinatura.

## Custos recorrentes estimados (operação)
| Item | Custo |
|---|---|
| Hospedagem das demos (Cloudflare Pages ou Netlify, plano gratuito) | R$ 0 |
| Um domínio seu para as demos (.com.br) | ~R$ 40/ano |
| MEI (DAS) | ~R$ 80/mês |
| Ferramentas (VS Code, Node, Blender, Figma no plano gratuito) | R$ 0 |
| **Total mínimo** | **~R$ 85/mês** |

## Próximas ações recomendadas
1. **Você:** fazer a checklist de verificação (2 min por empresa) nas 5 primeiras do ranking e atualizar o `prospeccao.csv`.
2. **Você:** registrar um domínio próprio para as demos e publicar a demo 01 no Cloudflare Pages (eu preparo, mas preciso da sua aprovação e da conta).
3. **Você:** enviar a mensagem da Dois Eme (em `vendas/apresentacao-demos.md`) pelo canal comercial público.
4. Depois de "quero ver": personalizar o WhatsApp e os dados em `config.ts`, gravar um vídeo de 40 s da demo e enviar.
5. Gerar variações da demo 01 para Max Ambientes, Recinto e Monalisa (outra paleta, mesma base): cerca de 3 h cada.
6. Construir a demo 02 (pilates) e, depois de confirmar a cidade, a demo 03 (joalheria).
7. Ciclo 2 de pesquisa: clínicas odontológicas premium e arquitetos (Goiânia), depois Brasília e Uberlândia.
