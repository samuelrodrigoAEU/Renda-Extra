# Checklist antes de publicar
**Decisões suas (custo ou credencial):**
- [ ] Escolher a plataforma de checkout: Kiwify ou Hotmart. Ambas são grátis para criar conta e cobram por venda; confirme as taxas atuais na página oficial.
- [ ] Hospedar a página: Cloudflare Pages ou Netlify (plano grátis), ou a própria página de vendas da plataforma.
- [ ] Domínio (opcional, cerca de R$ 40/ano).
- [ ] Rodar a verificação da Biblioteca de Anúncios e anotar em `campanha/pesquisa-biblioteca-anuncios.csv`.

**Produto e página:**
- [ ] Subir `produto/Conta-Doce-precificacao-confeitaria.xlsx` como entregável e `Agenda-de-Encomendas.xlsx` como order bump.
- [ ] Testar a planilha no app Google Planilhas de um celular Android (abrir, escolher um insumo na lista, ver o cálculo). Isso **não foi testado** daqui: só no LibreOffice.
- [ ] Preencher o rodapé da página: vendedor, CPF/CNPJ, endereço e contato (Decreto 7.962/2013).
- [ ] Trocar `#COLE-O-LINK-DO-CHECKOUT` pelo link real.
- [ ] Política de reembolso de 7 dias visível no checkout.
- [ ] E-mail de entrega com o link e o passo a passo do Google Planilhas.

**Rastreamento:**
- [ ] Pixel instalado e PageView, InitiateCheckout e Purchase validados (ver `campanha/plano-de-teste.md`).
- [ ] UTMs configuradas nos anúncios.

**Anúncios (políticas da Meta e CDC):**
- [ ] Nenhuma promessa de renda ou faturamento.
- [ ] "Valores de exemplo" visível sempre que aparece um número.
- [ ] Nenhum depoimento inventado. UGC 02 só com uma pessoa real, com consentimento escrito e parceria sinalizada.
- [ ] Sem logotipo nem interface do WhatsApp nos vídeos (o pov_02 usa uma conversa genérica). O nome "WhatsApp" aparece só como texto descritivo.
- [ ] Música: só da biblioteca livre da Meta ou com licença.

**Modelo de autorização de imagem (UGC 02):**
> Eu, [nome], CPF [ ], autorizo [vendedor] a usar minha imagem e voz no vídeo gravado em [data] em anúncios da Conta Doce no Facebook e no Instagram, por [prazo], sem custo / mediante [valor]. Posso revogar esta autorização a qualquer momento por escrito. [assinatura]
