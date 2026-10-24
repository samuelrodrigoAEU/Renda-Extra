# Oferta: Conta Doce

## Público
- **Quem compra:** confeiteira que vende por encomenda ou delivery, em casa ou num espaço pequeno.
  - Usa o WhatsApp e o Instagram para vender.
  - Faz a conta no caderno ou "pelo que as outras cobram".
- **Situação atual:** trabalha muito e no fim do mês não sabe para onde foi o dinheiro.
  - Na hora de responder "quanto fica 100 docinhos?", ela trava ou chuta.
- **Dor principal:** não sabe o custo real de cada doce. A hora dela, o gás e a taxa da maquininha ficam de fora.
- **Resultado desejado:** um preço que paga o trabalho, que ela consiga explicar e mandar com segurança.
- **Objeções:**
  - "Não sei mexer em planilha."
  - "Tem planilha grátis no YouTube."
  - "Se eu subir o preço, perco cliente."
  - "Não tenho tempo."
- **Alternativas atuais:**
  - caderno;
  - calculadora;
  - planilha gratuita genérica;
  - copiar o preço da concorrente;
  - cursos longos.
- **Motivo para agir agora:** datas de pico de encomenda (Natal e fim de ano, Páscoa, Dia das Mães). Errar o preço num pico multiplica o prejuízo.
  - Use o argumento sem inventar prazos falsos nem contagem regressiva.

## Produto (pronto e testado em `produto/`)
- **Nome:** Conta Doce · o preço do seu doce em 15 minutos.
- **Formato:** planilha (.xlsx) que funciona no Google Planilhas do celular e no Excel.
- **Conteúdo:**
  - **Comece aqui:** 3 passos de 5 minutos cada.
  - **Custos do mês:** pró-labore, horas, gastos fixos, taxas e margem. Calcula o valor da hora e o gasto fixo por hora.
  - **Insumos:** 52 itens comuns de confeitaria e embalagem, já com tamanhos usuais de embalagem, mais 48 linhas livres.
  - **6 fichas de preço:**
    - lista suspensa de ingredientes;
    - custo real por unidade;
    - preço mínimo, preço sugerido e preço para aplicativo de delivery;
    - lucro por unidade;
    - "quanto sobra no preço que você cobra hoje";
    - aviso em vermelho quando falta preço de um insumo.
  - **Tabela WhatsApp:** linhas prontas "Produto: R$ X" para copiar.
  - **Exemplo:** ficha do brigadeiro preenchida, com **valores de exemplo**, avisados como tal.
- **Primeira vitória:** o custo real e o preço sugerido do doce mais vendido, em cerca de 15 minutos.
- **Entrega:** link de download na área de membros da plataforma, logo após o pagamento. Inclui as instruções para abrir no Google Planilhas.
- **Suporte:** e-mail ou WhatsApp para dúvidas de uso, com prazo de resposta de até 2 dias úteis.
- **Limites, escritos na página e na planilha:**
  - calcula a partir dos números da pessoa;
  - não conhece o preço da região;
  - não garante vendas.
- **Testes:** `tools/testar_planilha.py` preenche um caso, recalcula no LibreOffice e confere 11 resultados com a conta feita à mão (11/11).

## Por que esta e não as outras opções
| Alternativa | Vantagem da Conta Doce |
|---|---|
| Conteúdo grátis | Já vem montada, com insumos e tamanhos de embalagem, a sua hora e os gastos fixos na conta, e a tabela pronta para o WhatsApp. Não precisa assistir a uma aula para usar |
| Concorrente | Feita para o celular. Fala a língua de quem vende por encomenda (preço mínimo, sugerido, de aplicativo e "quanto sobra hoje"). Sem promessa de faturamento |
| Fazer sozinha | São 15 minutos em vez de uma tarde montando fórmulas |
| Adiar | Cada encomenda com preço errado é trabalho sem pagamento |

Não há "método secreto". A diferença está na organização e na velocidade.

## Preço e estrutura
| Item | Preço | Observação |
|---|---|---|
| Conta Doce (principal) | **R$ 27** | Faixa observada: planilhas genéricas de R$ 12 a R$ 29 no Mercado Livre. O preço dos concorrentes da Hotmart **não foi verificado** |
| Order bump: Agenda de Encomendas | **R$ 12,90** | Pronta e testada: pedidos, sinal, quanto falta receber, entregas dos próximos 2 dias em destaque, faturamento do mês |
| Upsell (fase 2, **não produzido**) | R$ 37 | Kit Orçamento: cardápio editável e mensagens de orçamento e de reajuste de preço. Só produzir se o principal vender |
| Garantia | 7 dias (direito de arrependimento, art. 49 do CDC) | Reembolso pela plataforma |

## Economia (premissas de planejamento, NÃO são dados reais)
**Premissas de custo:**
- Kiwify: 8,99% + R$ 2,49 por transação, segundo fonte de terceiro (confirmar antes).
- Imposto: 6% sobre o faturamento (Simples, premissa; confirme com um contador).
- Reembolso: perde a receita e a taxa fixa.
- O upsell é uma transação separada.

**Margem por cenário:**

| Cenário | Bump | Upsell | Reembolso | Ticket médio | **Margem antes do tráfego = CPA de equilíbrio** |
|---|---|---|---|---|---|
| Conservador | 15% | 5% | 10% | R$ 30,79 | **R$ 20,95** |
| Intermediário | 25% | 10% | 6% | R$ 33,93 | **R$ 24,39** |
| Otimista | 35% | 15% | 3% | R$ 37,06 | **R$ 27,71** |

**Conversão da página necessária para empatar:**

| Mídia | Conservador | Intermediário | Otimista |
|---|---|---|---|
| CPM R$ 30, CTR 1,2%, 75% de visualização da página | 15,9% | 13,7% | 12,0% |
| CPM R$ 22, CTR 1,8%, 80% de visualização da página | 7,3% | 6,3% | 5,5% |

**Só o produto principal (sem upsell):**
- a margem fica entre R$ 19,30 e R$ 22,63;
- com CPM de R$ 30, CTR de 1,2% e página convertendo 3%, o CPA estimado é de **R$ 111**, ou seja, prejuízo.

**Leitura honesta:**
- O low-ticket só fecha a conta com **criativo muito eficiente** (CTR de 1,8% ou mais e CPM baixo) **e** página convertendo 6% ou mais, ou com o ticket médio subindo pelo bump e pelo upsell.
- Faturamento ≠ receita líquida ≠ lucro. Os números acima são margem de contribuição antes da mídia.
- O lucro só existe se o CPA real ficar abaixo dessa margem.
