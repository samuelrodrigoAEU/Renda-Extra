# Renda Extra — operação de landing pages premium

Prospecção, demonstrações e venda de sites de alto padrão para empresas com boa reputação e presença digital fraca. Começamos por Goiânia.

## Estrutura

```
pesquisa/
  prospeccao.md         ranking com fontes, evidências e abordagem (ciclo 1: 21 empresas)
  prospeccao.csv        registro único de empresas (evita contato duplicado)
clientes/
  demos/                conceitos independentes (noindex, com faixa de aviso)
    01-marcenaria-alto-padrao/   PILOTO completo: Vite + TS + Three.js
    02-pilates-boutique/         conceito documentado
    03-joalheria-autoral/        conceito documentado
  autorizados/          só depois de autorização por escrito da empresa
  contratados/          só depois da entrada paga
vendas/
  playbook.md           funil, mensagens, roteiro de reunião, objeções, entrega, ética
  precos-e-margem.md    pacotes, custos e fórmula de margem
  proposta-modelo.md    proposta editável
  apresentacao-demos.md pitch e mensagem personalizada para cada demo
docs/
  operacao.md           registro de testes, limitações, custos recorrentes, próximos passos
```

## Início rápido

```bash
cd clientes/demos/01-marcenaria-alto-padrao && npm install && npm run dev
```
