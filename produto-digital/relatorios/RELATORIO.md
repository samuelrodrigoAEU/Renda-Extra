# Relatório final · produto digital para Meta Ads (24/10/2026)

## 1. Resumo executivo
- **Produto prioritário (PROVISÓRIO):** **Conta Doce**, uma planilha de precificação para confeitaria, por **R$ 27**, com order bump **Agenda de Encomendas** por R$ 12,90.
- **Status do produto:** pronto e testado (11/11 cálculos conferidos com a conta feita à mão).
- **Criativos:**
  - **3 vídeos 9:16 prontos**, com capturas reais da planilha;
  - **2 UGC roteirizados**, que precisam de pessoa real;
  - página de vendas pronta;
  - plano de teste de R$ 100.
- **Por que provisório:** a rede deste ambiente bloqueou a Biblioteca de Anúncios da Meta, o Reclame Aqui e o Google Trends.
  - A demanda está sustentada por **oferta recorrente** (8 ou mais produtores na mesma categoria) e por **estudos sobre a dor**, mas **não** por longevidade de anúncios.
  - **Você precisa fazer a verificação de 20 minutos antes de gastar** (passo a passo em `pesquisa/pesquisa-e-validacao.md`).
- **Economia:**
  - CPA de equilíbrio entre **R$ 21 e R$ 28** (bump e upsell incluídos);
  - para empatar, a página precisa converter **de 5,5% a 7%** com mídia boa (CPM perto de R$ 22 e CTR perto de 1,8%);
  - **R$ 100 não comprovam lucro:** o teste mede sinais.

## 2–6. Metodologia, hipóteses, finalistas, evidências e pontuação
Estão em `pesquisa/pesquisa-e-validacao.md`:
- 11 hipóteses pesquisadas e 9 só triadas;
- 5 finalistas com notas ponderadas e notas dos pilares;
- links e datas;
- argumentos contra a escolha.

## 7–8. Produto escolhido e pilares
| Pilar | Nota | Base |
|---|---|---|
| 1. Dor real | 8 (provisória) | Estudos sobre preço e falência de microempresas de doces; concorrentes vendendo exatamente "incluir o que fica de fora" |
| 2. Conveniência | 9 | 3 abas, primeiro preço em cerca de 15 min, 52 insumos já listados, celular |
| 3. Transformação | 8 (provisória) | De "chutei" para "sei o custo real e o lucro". O número fica visível na ficha ("quanto sobra no preço de hoje") |

## 9–12. Público, oferta, preço, bump, upsell e economia
Em `oferta/oferta.md`. O upsell (Kit Orçamento) está **descrito, não produzido**.

## 13–14. Criativos, áudios e vídeos
| ID | Formato | Hipótese | Arquivo |
|---|---|---|---|
| pov_01 | POV, texto e captura real | Dor: "sobram R$ 0,40, não R$ 1,05" | `videos/pov_01.mp4` (25 s) |
| pov_02 | POV, conversa | Identidade: orçamento sem travar | `videos/pov_02.mp4` (22 s) |
| conceito_05 | Tutorial de tela | Conveniência: 3 abas, 15 min | `videos/conceito_05.mp4` (26 s) |
| ugc_01 | Criador para a câmera | Confiança: quem fez e por quê | Roteiro; **gravar** |
| ugc_02 | Confeiteira real no primeiro uso | Prova por demonstração | Guia de captação; **gravar, com consentimento** |

Roteiros, storyboards, copies, títulos e métricas estão em `criativos/<id>/roteiro.md`.

**Revisão interna dos vídeos prontos (0–10; critério de qualidade, não previsão):**

| Critério | pov_01 | pov_02 | conceito_05 |
|---|---|---|---|
| Gancho | 8 | 8 | 7 |
| Clareza da dor | 9 | 7 | 6 |
| Demonstração | 8 | 7 | 9 |
| Conveniência | 6 | 8 | 9 |
| Transformação plausível | 8 | 7 | 7 |
| Narração | n/a | n/a | n/a |
| Visual | 7 | 7 | 7 |
| Originalidade | 8 | 7 | 6 |
| Clareza da oferta | 8 | 8 | 8 |
| Potencial de ação | 8 | 7 | 7 |

O ponto fraco comum é o visual: são texto e capturas de planilha, sem pessoa e sem cena real de cozinha. Os UGC existem para cobrir isso.

**Áudio:** **não gerado.** O ambiente não tem acesso a nenhum serviço de voz.
- Google, Microsoft, ElevenLabs e Hugging Face estão bloqueados na rede.
- O único pacote de voz local em pt-BR encontrado no npm (`@igpauli/pi-sano-tts`) teve a execução **negada pela política de segurança** (código de terceiro não verificado).
- Os vídeos foram feitos para funcionar **sem som**: todo o conteúdo está em texto na tela, e cada vídeo leva uma faixa silenciosa.
- Os roteiros trazem narração opcional com direção de voz. Para gravar: use a sua própria voz ou uma voz sintética licenciada e **identificada** como tal. Nunca a apresente como depoimento.

## 15–16. Campanha, mensuração e decisão
Em `campanha/plano-de-teste.md`. Planilhas de acompanhamento:
- `campanha/acompanhamento.csv`
- `campanha/pesquisa-biblioteca-anuncios.csv`

## 17. Riscos, limitações e próximos passos
**Riscos:**
- alternativas gratuitas fortes (planilhas no YouTube, app Doce Jornada da Nestlé);
- categoria saturada;
- ticket baixo;
- a planilha só foi testada no LibreOffice, falta o Google Planilhas no celular;
- taxas de plataforma vindas de fonte de terceiro.

**Não verificado:**
- longevidade de anúncios;
- preços dos concorrentes na Hotmart;
- volume de buscas;
- reclamações específicas da categoria.

**Próximos passos:**
1. Verificação na Biblioteca de Anúncios (20 min).
2. Testar a planilha no Google Planilhas do celular.
3. Criar o checkout e hospedar a página.
4. Validar o Pixel.
5. Gravar o UGC 01.
6. Rodar o teste de R$ 100 por 5 dias.
7. Ler os resultados com as regras do plano.

**Ferramentas:** nada pago foi contratado nem é necessário para o teste além dos R$ 100 de mídia.

## Arquivos produzidos e verificados
- `produto/Conta-Doce-precificacao-confeitaria.xlsx` e `produto/Agenda-de-Encomendas.xlsx`: gerados por `tools/gerar_planilha.py` e testados por `tools/testar_planilha.py` (11/11). A agenda foi testada separadamente.
- `pagina-de-vendas/index.html`: testada em 390 px (sem rolagem lateral, imagens carregando, botão de compra acima da dobra, sem erros).
- `videos/*.mp4`: gerados por `tools/video/render.mjs` a partir de `tools/video/studio.html` e das capturas reais feitas por `tools/capturas.py`.
