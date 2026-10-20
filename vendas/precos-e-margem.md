# Faixas de preço e cálculo de margem (hipóteses a validar)

Valores de referência para o mercado brasileiro em 2026. **Não são preços garantidos**: ajuste depois das 5 primeiras propostas, conforme as respostas.

| Pacote | Escopo | Faixa sugerida | Horas estimadas |
|---|---|---|---|
| **Básico** | Página única sobre um modelo próprio, adaptada à marca. Textos a partir do briefing, botão de WhatsApp, SEO básico, 1 revisão | R$ 1.800 – 3.500 | 12–20 h |
| **Premium** | Design exclusivo, textos de venda, animações de scroll, formulário que qualifica o contato, SEO técnico, analytics com consentimento, 2 revisões | R$ 4.500 – 9.000 | 30–50 h |
| **Premium 3D** | Tudo do Premium, mais uma experiência 3D (cena própria ou modelo licenciado), interação (configurador ou visualizador), fallback para celulares fracos, testes de desempenho | R$ 9.000 – 20.000+ | 60–110 h |
| Manutenção | Hospedagem, domínio, alterações e relatório | R$ 150 – 600/mês | 1–4 h/mês |

## Custos diretos típicos

| Item | Custo |
|---|---|
| Domínio .com.br (registro.br) | ~R$ 40/ano. Paga o cliente, no CPF ou CNPJ dele |
| Hospedagem de site estático (Cloudflare Pages ou Netlify, plano gratuito) | R$ 0 |
| Fotos profissionais (se o cliente não tiver) | R$ 500 – 2.000 |
| Modelo 3D licenciado (se não for procedural) | R$ 0 – 800 |
| Fontes | R$ 0 (Google Fonts ou Fontsource, licença OFL) |
| Imposto: MEI (DAS ~R$ 80/mês) ou Simples Nacional (a partir de ~6% do faturamento) | Varia; confirme com um contador |

> Atenção: o plano gratuito da Vercel (Hobby) **não permite uso comercial**. Para clientes, use Cloudflare Pages ou Netlify, ou um plano pago.

## Fórmula de margem

```
Custo de produção = (horas estimadas × 1,3 de margem para imprevistos × valor da sua hora) + custos diretos + imposto
Margem = (preço − custo de produção) ÷ preço
```

**Exemplo (Premium 3D):** 80 h × 1,3 × R$ 70/h = R$ 7.280, mais R$ 300 de custos diretos, mais 6% de imposto sobre R$ 14.000 (R$ 840). Custo total: **R$ 8.420**. Preço de R$ 14.000 → margem de **40%**.

**Regras:**
- Não feche abaixo de **35% de margem**. Se o cliente não aceita o preço, **reduza o escopo** (tire o 3D, use menos seções), nunca só o preço.
- Registre as horas reais de cada projeto em `clientes/contratados/<cliente>/horas.md`. Depois de 3 projetos, recalcule as estimativas.
- Reaproveite componentes: os modelos `demos/01-*` cortam de 40% a 60% das horas do próximo projeto do mesmo segmento. Aqui está a margem real da operação.
