# Demo 01 — Marcenaria de alto padrão (Dois Eme Marcenaria)

Landing page conceitual com um **móvel 3D interativo**. O scroll conduz a narrativa: apresentação, portas abertas mostrando a caixaria, gaveta extraída e, por fim, o configurador de acabamentos. O formulário entrega uma mensagem qualificada no WhatsApp.

> Demonstração independente, com `noindex` e faixa de aviso. Não publique como site oficial da empresa.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # checa tipos e gera dist/
npm run preview    # serve dist/ em http://localhost:4173
```

## Testar (Chromium headless)

```bash
npm run build && (npx vite preview --port 4173 &) && sleep 2
node tests/smoke.mjs   # capturas de tela em screens/
# neste ambiente: CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome WAIT=4500 node tests/smoke.mjs
```

## Hospedar (sem custo)
O site é estático: basta publicar a pasta `dist/`.
- **Cloudflare Pages:** comando de build `npm run build`, pasta de saída `dist`, diretório raiz `clientes/demos/01-marcenaria-alto-padrao`.
- **Netlify:** arrastar a pasta `dist/` em app.netlify.com/drop.
- Para mostrar a um cliente, use um subdomínio seu (ex.: `demo-marcenaria.seudominio.com.br`), nunca um domínio parecido com o da empresa.

## Personalizar
Todos os dados do cliente ficam em `src/config.ts`: nome, cidade, ano de fundação, showroom, número de WhatsApp e acabamentos (cor, veio, rugosidade e brilho). Os textos estão no `index.html`.

## Arquitetura
- `index.html`: conteúdo e estrutura semântica. O texto aparece antes do 3D.
- `src/main.ts` (≈3 KB gzip): interface, formulário, acabamentos e progresso do scroll. Carrega o 3D **sob demanda**, quando o navegador fica ocioso.
- `src/scene.ts` (≈139 KB gzip com o Three.js): móvel modelado proceduralmente (RoundedBoxGeometry), texturas de madeira e pedra geradas em canvas, RoomEnvironment para os reflexos, sombra suave, ACES tone mapping. **Nenhum asset de terceiros.**
- Fontes self-hosted (Fontsource, licença OFL): Instrument Serif e Manrope.

## Desempenho e acessibilidade
- O 3D só renderiza quando algo muda (scroll, cursor, acabamento) e pausa fora da tela.
- **Qualidade adaptativa:** se o aparelho não sustentar cerca de 22 fps por 20 quadros, reduz a resolução (DPR 1) e o mapa de sombra.
- Sem WebGL, a página exibe um fundo estático (`.no-webgl`), sem nenhuma função perdida.
- Com `prefers-reduced-motion`, não há suavização, parallax nem animações de entrada.
- Link "pular para o conteúdo", amostras de acabamento como `radiogroup` navegável pelas setas, foco visível, erro do formulário com `role=alert`.

## Pendências: aprovar ou substituir antes de usar comercialmente
| Item | Situação |
|---|---|
| Grafia do nome, logotipo e monograma "2M" | Placeholder. Pedir o logo oficial |
| WhatsApp comercial | Vazio em `config.ts`: abre o WhatsApp sem destinatário |
| "Fábrica própria", "desde 2017", showroom no Pedro Ludovico | Tirados da bio pública. Confirmar |
| Caixaria, ferragens, garantia, prazos, regiões atendidas, pagamento | Marcados como `CONFIRMAR` na página |
| Fotos do portfólio | Molduras vazias. Usar fotos reais e autorizadas das obras |
| Cores dos acabamentos | Ilustrativas. Alinhar com o catálogo real (fornecedores de MDF ou lâmina) |
| Analytics | Os eventos já disparam para `dataLayer`. Instalar só com banner de consentimento |
