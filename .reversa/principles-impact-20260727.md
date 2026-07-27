# Relatório de impacto — princípio IX

> Data: `2026-07-27`
> Operação: adicionar `IX. A prosa do produto tem norma declarada, e a norma é verificável`
> Origem: feature 018 (RF-11, roadmap D-09), sobre a arbitragem de `MD-0015`
> Gerado por: `/reversa-principles`

**Este relatório apenas sugere. Nenhum template foi alterado.** Aplicar ou descartar cada
sugestão é decisão do humano.

## Por que este princípio pede ajuste de template, e os oito anteriores não pediam

Os princípios I a VIII regem **como se chega** ao artefato: clarificação antes da solução,
portão antes da escrita, spec antes do código, teste como metade da fonte de verdade. Os
templates já os refletem por construção, porque o próprio encadeamento dos moldes é a
materialização deles.

O IX rege outra coisa: **como o artefato fala.** É a primeira regra do projeto que alcança
o conteúdo do texto emitido, e não o processo que o produziu. Os templates não têm hoje
nenhum lugar onde a classe de um literal se declare, nem onde um critério de aceite de
texto remeta ao guia em vez de descrever estilo por extenso. Daí as três sugestões abaixo,
todas pequenas e todas no mesmo espírito: abrir espaço para a declaração, não impor
formulário novo.

## `requirements-template.md`

### Sugestão 1 — comentário da seção 4 (regras de negócio), após a linha "Marque cada regra com 🟢 / 🟡 / 🔴."

Acrescentar:

> Regra que introduza texto exibido ao usuário declara a **classe** dos literais que cria
> — autoral, citação ou identificador (princípio IX). A classe é declarada, nunca
> deduzida do diretório: mensagem de validação dentro do domínio é autoral, e rótulo
> dentro da interface pode ser citação.

**Por quê.** Sem isso, a classe só aparece quando alguém se lembra de mencioná-la, que é
como a feature 018 encontrou vinte e cinco rótulos citados sem marca nenhuma e uma nota
autoral de quinhentos caracteres morando no meio deles.

### Sugestão 2 — comentário novo sob o cabeçalho da seção 5 (requisitos funcionais)

Acrescentar:

> Critério de aceite de texto autoral remete a `docs/redacao.md`, e não descreve estilo
> por extenso aqui. Critério que repita a norma envelhece em paralelo a ela e produz duas
> fontes para a mesma regra.

**Por quê.** É o princípio V aplicado ao texto: a norma é a fonte, o critério a projeção.

### Não sugerido, e vale dizer por quê

A seção 6 (requisitos não funcionais) **não** ganha linha de "Linguagem". A tentação existe
— pareceria o lugar natural —, mas o RNF descreve propriedade do sistema, e a norma de
redação é regra de conteúdo com teste próprio. Alojá-la ali a converteria em atributo de
qualidade difuso, do tipo que ninguém verifica.

## `roadmap-template.md`

### Sugestão 3 — linha de exemplo da tabela da seção 2 (princípios aplicados)

A tabela hoje traz uma linha de exemplo (`| I. <título> | <observação> | respeita / conflita |`).
Convém que o exemplo deixe de sugerir que só o primeiro princípio se confere:

> `| I. <título> | <observação> | respeita / conflita |`
> `| … | | |`
> `| IX. <título> | <observação, quando a feature criar ou alterar texto exibido> | respeita / conflita / n/a |`

**Por quê.** O IX é o único princípio que não se aplica a toda feature: uma que só mexa em
infraestrutura não emite prosa nova. Um `n/a` explícito é melhor do que a linha ausente,
porque distingue "não se aplica" de "esqueci de conferir".

### Sugestão 4 — comentário novo sob o cabeçalho da seção 3 (decisões técnicas)

Acrescentar:

> Decisão que crie superfície textual nova declara **onde** a classe de cada literal será
> registrada. Superfície nova sem lugar declarado para a classe é dívida que só aparece
> na próxima revisão de linguagem.

## `actions-template.md`

### Sugestão 5 — comentário da Fase 1 (Preparação)

Acrescentar ao comentário existente:

> Ação que escreva texto exibido ao usuário não se dá por concluída enquanto o literal não
> tiver classe declarada. O gerador do inventário para em candidato sem entrada, e é essa
> parada que converte a regra em portão em vez de conselho.

**Por quê.** É a única das cinco sugestões que muda o critério de conclusão de uma ação, e
por isso a que mais merece deliberação antes de entrar. O custo é real: todo literal novo
passa a cobrar uma entrada no mapa, para sempre. O efeito é desejado — literal sem classe
é decisão adiada, não acidente —, mas o sinal de que a decisão foi mal tomada é
observável: um mapa preenchido em massa, sem leitura, converte a declaração em carimbo e
devolve a inferência pela porta dos fundos.

## Resumo

| Template | Sugestões | Natureza |
|---|---|---|
| `requirements-template.md` | 2 | Comentário de seção; nenhuma coluna nova |
| `roadmap-template.md` | 2 | Linha de exemplo e comentário; nenhuma coluna nova |
| `actions-template.md` | 1 | Comentário que altera critério de conclusão — a única que pede deliberação |

Nenhuma sugestão acrescenta coluna, seção ou campo obrigatório. Se todas forem aplicadas,
os três templates crescem em cerca de doze linhas de comentário somadas.
