# Plano de teste no Meta Ads · R$ 100

**Pré-condição:** a verificação da Biblioteca de Anúncios (`pesquisa/pesquisa-e-validacao.md`) deu SIGA, e a página e o checkout estão no ar.

> **Realidade do orçamento:** com CPA de equilíbrio entre R$ 21 e R$ 28, R$ 100 compram de 0 a 4 vendas. **Isso não prova lucro nem prejuízo.** O teste serve para ler **sinais** (CTR, custo por visualização da página, início de checkout) e escolher os criativos da próxima rodada.

## Estrutura
- **Campanha:** objetivo **Vendas**. Local da conversão: site.
- **Evento de otimização:**
  - **Compra** é o ideal, mas a Meta precisa de volume. Com R$ 100 o conjunto não sai do aprendizado.
  - Use **InitiateCheckout** (início de checkout) neste primeiro teste e anote isso na leitura dos resultados.
  - Troque para Compra quando o pixel tiver 30 ou mais compras em 7 dias (premissa usual de aprendizado; confirme na Central de Ajuda da Meta).
- **Conjunto de anúncios:**
  - 1 conjunto, Brasil, 22–55 anos, público Advantage+ sem interesses (deixe a Meta achar o público pelo criativo);
  - idioma português;
  - posicionamentos Advantage+ (Reels e Stories recebem o 9:16).
- **Anúncios:** os 3 vídeos prontos (`pov_01`, `pov_02`, `conceito_05`), mais os 2 UGC quando estiverem gravados, no **mesmo conjunto**.
  - A Meta **não** divide o gasto por igual; isso é esperado.
  - Se quiser forçar a leitura de cada um, a alternativa é 1 anúncio por conjunto com orçamento fixo. Com R$ 100 isso dilui demais, então não é recomendado.
- **Orçamento:** **R$ 20/dia por 5 dias**. Não mexa nos primeiros 3 dias.
- **UTMs** (em "parâmetros de URL" de cada anúncio):
  `utm_source=meta&utm_medium=paid&utm_campaign=contadoce_t1&utm_content={{ad.name}}`
  - A página repassa as UTMs ao checkout. Na Kiwify, confira se o relatório de vendas mostra a UTM.

## Rastreamento: verificar ANTES de gastar
1. Crie o Pixel no Gerenciador de Eventos e instale-o na página (comentário no `<head>` de `pagina-de-vendas/index.html`).
2. Na plataforma de checkout, ative a integração com o Pixel e, se houver, com a API de Conversões (Kiwify e Hotmart têm campo próprio para isso).
3. Teste com a extensão Meta Pixel Helper ou com "Testar eventos":
   - PageView na página;
   - InitiateCheckout no checkout;
   - Purchase numa compra de teste (compre e peça reembolso, ou use o modo de teste da plataforma).
4. Verifique o domínio no Gerenciador de Negócios e priorize o evento Purchase.
5. **Só comece quando os 3 eventos aparecerem.** Sem isso, os números da campanha não significam nada.

## O que cada métrica diz (e o que não diz)
| Métrica | Diz | Não diz |
|---|---|---|
| CPM | Quanto custa ser visto (leilão e público) | Se o anúncio é bom |
| CTR de link | Se o gancho e a promessa geram interesse | Se a página converte |
| CPC de link | Custo do interesse | Qualidade de quem clicou |
| Visualização da página ÷ clique | Velocidade da página e cliques acidentais | Interesse real |
| Início de checkout ÷ visualização | Se a página convence | Se o pagamento conclui |
| Compra e CPA | Viabilidade real (precisa de volume) | Nada com 1 ou 2 compras: é ruído |
| ROAS | Receita ÷ gasto | Lucro (falta tirar taxas, imposto e reembolso) |
| Margem após mídia | Lucro de contribuição: vendas × margem (oferta.md) − gasto | Lucro final (falta o custo fixo da operação) |

## Regras de decisão (proporcionais aos dados)
- **Antes de R$ 15 gastos num anúncio:** não conclua nada.
- **Anúncio com R$ 20 ou mais e CTR de link abaixo de 0,8%:** pause. O gancho não funcionou.
- **CTR de 1,5% ou mais e custo por visualização da página de até R$ 1,00:** o criativo é candidato. Faça 2 variações de gancho na próxima rodada.
- **Página:**
  - 100 visualizações e nenhum início de checkout: o problema é a página ou o preço. Mude a primeira dobra antes de culpar o criativo.
  - Início de checkout sem compra: confira o checkout (pagamento por Pix, campos, preço do bump).
- **Ao final dos R$ 100**, classifique:
  - **sinal positivo:** CTR de 1,5% ou mais **e** 1 compra ou mais, ou início de checkout ÷ visualização de 8% ou mais. Coloque mais R$ 200 a R$ 300 nos 2 melhores;
  - **inconclusivo:** sinais mistos. Faça uma nova rodada de criativos com o mesmo orçamento;
  - **negativo:** CTR abaixo de 0,8% em todos e nenhum início de checkout. Volte à pesquisa (candidato B).
- **Ausência de compra com R$ 100 ≠ prova de fracasso.**
- **Também não é sucesso:** 1 compra com CPA abaixo de R$ 25 pode ser sorte.
