# Demo 02 — Alianças sob medida (Lindyse Joias) · conceito "O Estojo"

Landing page de alianças e anéis de noivado. Ela complementa o site institucional da Lindyse (lindysejoias.com), que é focado em blog e SEO, sem substituí-lo.

> Demonstração independente, com `noindex` e faixa de aviso. Não publique como site oficial.

## Assinaturas do projeto
1. **Abertura no veludo vinho:** um par de alianças entrelaçadas como elos, em ouro físico (PBR), com pavé de 15 brilhantes. O cursor gira o estúdio de luz, e os reflexos percorrem o metal. O par também gira por arraste, com inércia.
2. **Travessia pelo anel:** com o scroll, uma aliança sai de cena, a outra fica de frente e a câmera atravessa o aro. A seção seguinte aparece *dentro* do círculo: um `clip-path` sincronizado com a projeção do aro na tela.
3. **Gravação ao vivo:** o casal digita o texto e o vê gravado na parede interna da aliança 3D (relevo, rugosidade e cor), escolhendo letra, ouro e largura (3 a 6 mm).
4. **Medidor de aro na tela:** calibração com um cartão (85,6 mm) e medição de um anel que a pessoa já tenha, ou pela circunferência medida com barbante. O resultado vai para o formulário.
5. **Formulário:** junta gravação, ouro, largura e aros numa mensagem pronta para o WhatsApp.

## Rodar, testar e gerar imagens
```bash
npm install
npm run dev                      # http://localhost:5173
npm run build                    # tipos + build (CSP injetada no build; NO_CSP=1 desativa)
npx vite preview --port 4174 &   # serve dist/
node tests/smoke.mjs             # capturas por seção e checagem das interações
node tests/stills.mjs            # regenera public/renders/*.jpg a partir da cena 3D (depois rode o build de novo)
```

## Arquitetura
- `src/main.ts` (4 KB gzip): interface, scroll, medidor, formulário e troca do canvas entre os dois palcos. Um único `WebGLRenderer` é reposicionado no DOM em vez de criar dois contextos.
- `src/scene.ts` (138 KB gzip com o Three.js, carregado sob demanda):
  - perfil anatômico (comfort fit) revolucionado com `LatheGeometry` (256 segmentos);
  - estúdio procedural (softboxes HDR) passado pelo PMREM;
  - brilhante com 24 facetas por anel em duas camadas: o pavilhão reflete o estúdio próprio das pedras, com mosaico de reflexão interna, e a coroa tem um reflexo iridescente translúcido;
  - *glints* aditivos;
  - gravação em `CanvasTexture`, com a proporção corrigida para a parede interna.
- **Qualidade adaptativa:** em aparelho lento, cai para DPR 1 e remove a camada iridescente. Renderiza só com a seção 3D visível.
- **Sem WebGL:** usa os renders reais da própria cena (`public/renders`), com a mesma composição da abertura.
- **SEO e segurança:** JSON-LD `JewelryStore` (só com dados públicos), Open Graph com render próprio, CSP no build.

## Pendências: aprovar ou substituir
| Item | Situação |
|---|---|
| "30 anos", ateliê no Setor Campinas | Tirados de lindysejoias.com. CONFIRMAR |
| Teor do ouro, certificado, gravação inclusa, prazo, ajuste de aro, envio, pagamento | Marcados `CONFIRMAR` na página |
| Fotos do ateliê | Renders 3D ilustrativos, rotulados. Substituir por fotos reais |
| WhatsApp | Vazio em `config.ts` |
| Marca e logotipo | Logotipo tipográfico provisório. Pedir a marca oficial |
| Analytics | Eventos em `dataLayer`. Instalar só com consentimento |
