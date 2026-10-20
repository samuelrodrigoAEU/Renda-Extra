# Análise das referências (21/10/2026) → Demo 04 Box 21

> A skill **Image to Code** não está instalada (conferi as skills da conta, o catálogo e `~/.claude/skills`). Esta análise segue o mesmo procedimento de forma manual: extrair os princípios, adaptar ao negócio, implementar e comparar por captura lado a lado.

## Ref. A: "48" exposição de arte robótica (Dribbble)
| Princípio | Observação | Adaptação para a Box 21 |
|---|---|---|
| Grade suíça de 3 colunas com filetes finos | Coluna esquerda (texto e estatística), centro (sujeito), direita (carrossel e destaque) | Seção "A oficina" em grade de 3 colunas com filetes de 1 px |
| Numeral gigante **atrás** do sujeito recortado | "48" em preto chapado; o sujeito sobrepõe o número (profundidade em camadas) | **"21"** (do nome Box 21) atrás do render explodido do conjunto de freio |
| Fundo cinza-quente claro, monocromático | Contraste só no preto | Seção clara #ECEBE7 com tinta grafite. O acento aparece só em detalhes |
| Bloco preto de menu no canto | Retângulo sólido com "MENU ☰" | Bloco preto com a marca e o menu, fixo no canto superior esquerdo |
| Estatística grande com rótulo pequeno | "60+ artworks…" | "2004", ano de início segundo diretório; "6 marcas" |
| Carrossel com setas ← → e "+ + +" | Miniaturas navegáveis | Carrossel das marcas atendidas (só texto, sem logotipos) |
| Botão circular translúcido sobre o sujeito | "View Details" | Botão circular "Agendar avaliação" sobre o render |
| Marcas tipográficas (®, +) | Detalhes de impressão | Cruzes de registro nos cantos da grade |

## Ref. B: ThreadLab (moda em 3D)
| Princípio | Observação | Adaptação |
|---|---|---|
| Objeto 3D central dramático em fundo escuro | Vestido com tecido roxo atrás | Conjunto de freio (disco ventilado e furado + pinça) em estúdio grafite |
| Wordmark **extra-largo** sobreposto à base do objeto | "THREADLAB" em sans expandida branca | "BOX 21" em Archivo expandida (largura 125, peso 800), sobre a base do disco |
| Texto-fantasma grande no canto | "GLOBAL HUB FOR…" em baixo contraste | As marcas atendidas em letras gigantes de baixo contraste (decorativo, `aria-hidden`) |
| HUD: colchetes de canto, coordenadas, "+++" | Linguagem de interface técnica | Coordenadas de Goiânia, colchetes e etiquetas em **IBM Plex Mono** |
| Chip contornado com acento lima "TRY A 3D PREVIEW" | Convite claro à interação | Chip "VER A PEÇA EXPLODIDA" com acento lima #C8FF3D |
| Grade sutil de fundo | Linhas finas | Grade de 64 px em 4% de opacidade |

## O que **não** copiar
Textos, marcas, a figura do robô, o vestido e o código. Os títulos precisam dizer o que a oficina faz (a ref. B é abstrata demais para um serviço local).

## Ajustes de negócio
- O H1 visível e claro fica acima do wordmark: "Oficina especializada em carros importados, em Goiânia."
- A interação tem utilidade: o carrinho explodido explica as peças, e o "teste de frenagem" aquece o disco.
- Conversão: **diagnóstico guiado por sintoma**, com marca, modelo, sintoma e urgência, mais prévia da mensagem e ligação direta.
