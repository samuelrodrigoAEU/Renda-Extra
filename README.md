# Renda Extra — operação de landing pages premium

Prospecção, demonstrações e venda de sites de alto padrão para empresas com boa reputação e presença digital fraca. Começamos por Goiânia.

## Estrutura

```
pesquisa/
  prospeccao.md         ranking com fontes, evidências e abordagem (ciclo 1: 21 empresas)
  prospeccao.csv        registro único de empresas (evita contato duplicado)
  prospeccao-9-segmentos.md  rodada 2: 57 empresas nos 9 segmentos definidos
referencias/            imagens de referência enviadas + análise (ANALISE.md)
clientes/
  demos/                conceitos independentes (noindex, com faixa de aviso)
    01-marcenaria-alto-padrao/   piloto: Vite + TS + Three.js (móvel 3D e acabamentos)
    02-aliancas-lindyse/         "O Estojo": travessia pelo anel, gravação 3D ao vivo, medidor de aro
    03-solo-pilates/             "Tensão": tipografia elástica, reformer 3D com física de molas, agendamento
    04-box21-oficina/            "Freio aberto": HUD, freio 3D explodido e aquecendo, diagnóstico guiado
    _descartados/                conceitos descartados, com o motivo
  autorizados/          só depois de autorização por escrito da empresa
  contratados/          só depois da entrada paga
vendas/
  playbook.md           funil, mensagens, roteiro de reunião, objeções, entrega, ética
  precos-e-margem.md    pacotes, custos e fórmula de margem
  proposta-modelo.md    proposta editável
  apresentacao-demos.md pitch e mensagem personalizada para cada demo
EVOLUTION_LOG.md        revisão crítica de cada demo e regras para a próxima
docs/
  operacao.md           registro de testes, limitações, custos recorrentes, próximos passos
```

## Início rápido

```bash
cd clientes/demos/01-marcenaria-alto-padrao && npm install && npm run dev
```
