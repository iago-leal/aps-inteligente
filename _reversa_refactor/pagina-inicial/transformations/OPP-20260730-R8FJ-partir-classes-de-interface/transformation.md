---
schema_version: 1
id: OPP-20260730-R8FJ
verb: modularize
state: applied
safety_net:
  kind: existing
  green_before: true
  green_after: true
preservation:
  method: equivalence-proof
  evidence:
    - safety-net/resultado.md
    - CHG-001.diff
measurement:
  before: "1 módulo com 689 linhas cobrindo 9 units e 39 arquivos; coesão coincidente (o que os reunia era o prefixo do caminho); 1 arquivo do projeto acima do limite de 400 linhas"
  after: "9 módulos, de 23 a 159 linhas, um por unit; coesão funcional (cada módulo declara os literais de um assunto); nenhum arquivo de scripts/textos/ acima de 172 linhas"
change_set:
  - chg: CHG-001
    file: scripts/textos/classes/interface-calculadora.mts
    purpose: criado — literais de interface/calculadora/**, e o critério dos fragmentos de pontuação
  - chg: CHG-001
    file: scripts/textos/classes/interface-cardiologia.mts
    purpose: criado — literais de interface/cardiologia/**, com a constante TELECONDUTAS e duas das três exceções da camada
  - chg: CHG-001
    file: scripts/textos/classes/interface-comum.mts
    purpose: criado — literais da moldura
  - chg: CHG-001
    file: scripts/textos/classes/interface-contribuicao.mts
    purpose: criado — literais do unit não clínico
  - chg: CHG-001
    file: scripts/textos/classes/interface-gestacao.mts
    purpose: criado — literais de interface/gestacao/**
  - chg: CHG-001
    file: scripts/textos/classes/interface-inicio.mts
    purpose: criado — literais da home e do catálogo
  - chg: CHG-001
    file: scripts/textos/classes/interface-puericultura.mts
    purpose: criado — literais da avaliação de crescimento, com a razão de MD-0012
  - chg: CHG-001
    file: scripts/textos/classes/interface-puericultura-consulta.mts
    purpose: criado — literais da ficha de consulta, com precedência sobre o irmão
  - chg: CHG-001
    file: scripts/textos/classes/interface-risco-cardiovascular.mts
    purpose: criado — literais das PCE, com a terceira exceção da camada
  - chg: CHG-001
    file: scripts/textos/classes/interface.mts
    purpose: removido — 689 linhas, integralmente redistribuídas
  - chg: CHG-001
    file: scripts/textos/classificacao.mts
    purpose: MODULOS passa a registrar os nove módulos, com precedência consulta antes de puericultura, e ganha rede de arrasto de mapa vazio para unit novo
approval:
  by: user
  at: 2026-07-30T00:00:00-03:00
  mode: autonomous
reversible_via: [CHG-001.diff]
---

# Partição de `interface.mts` em nove módulos por unit

## O que foi feito

O monólito de 689 linhas foi partido pelos separadores de seção que ele mesmo já trazia, um
por unit de `interface/**`. Cada bloco foi transportado **byte a byte** para o seu módulo, e
o que se reescreveu foi apenas o entorno: cabeçalho, `import` dos auxiliares de `declarar.mts`
recalculado pelo uso real de cada bloco, e a constante `TELECONDUTAS`, que acompanhou o único
unit que a usava.

Nenhuma declaração mudou de valor, nenhum literal mudou de classe. É por isso que o verbo é
`modularize`, e não `standardize`.

### A razão de cada classe foi distribuída, não descartada

O cabeçalho antigo carregava o que havia de mais valioso no arquivo: as três exceções da
camada, a decisão de `MD-0012` sobre os títulos dos índices de puericultura e o critério dos
fragmentos de pontuação. Um preâmbulo comum a nove assuntos é lido por quem chega e esquecido
por quem volta. Cada parágrafo foi para o módulo cujos literais ele explica, com referência
cruzada onde a exceção se divide entre dois — as duas de cardiologia apontam para a terceira,
em risco cardiovascular, e vice-versa.

### A rede de arrasto declara vazio de propósito

Ao desaparecer `interface.mts`, desapareceria com ele o predicado `startsWith("interface/")`
que dava à mensagem de erro o endereço certo para um caminho ainda não coberto. Em vez de
recriar o catch-all com conteúdo, ele foi recriado **com mapa vazio** e um nome que instrui:
`interface-<unit>.mts (unit novo: crie o módulo, no molde dos irmãos, e registre-o em MODULOS)`.

Não é detalhe de cortesia. Um catch-all com conteúdo é precisamente como o monólito nasceu:
havendo onde despejar, despeja-se. Vazio, ele responde à pergunta "onde declaro isto?" com a
única resposta que não reabre a dívida.

Verificado na prática, e o exemplo não foi escolhido por acaso:

```
interface/busca/campo.tsx  ->  interface-<unit>.mts (unit novo: crie o módulo…)
```

## Prova de preservação

Equivalência, não amostragem. O inventário textual é **gerado** a partir do mapa de classes:
declaração perdida faz o gerador parar com `FalhaDeClassificacao`, e classe alterada muda a
contagem. O arquivo saiu byte a byte idêntico ao commitado.

| | antes | depois |
|---|---|---|
| md5 do inventário | `0f133e2cc8fa7fd6b59423c16870e2c8` | `0f133e2cc8fa7fd6b59423c16870e2c8` |
| literais | 1245 (680 autorais, 498 citações, 67 identificadores) | idem |
| `git diff` do inventário | — | 0 linhas |
| `vitest run` | 920/920 | 920/920 |
| `tsc --noEmit` | 0 | 0 |
| `eslint scripts/` | 0 | 0 |

Sobre `prettier`: os nove módulos criados passam limpos. `classificacao.mts` reprova, e já
reprovava em `HEAD`, na linha 197 — o predicado de `pages-e-arquivos`, que esta transformação
não tocou. Formatar de passagem o que a mudança apenas encosta produziria diff irrevisável, e
a feature 023 já enfrentou e recusou exatamente isso.

## Fronteiras preservadas

Nenhuma fronteira que as specs definem como coesa foi quebrada, e nenhuma que elas separam por
propósito foi fundida. Ao contrário: a partição **reproduz** em `interface/**` a separação que
`models/**` já observava, inclusive na precedência de `consulta` sobre `puericultura`, que é a
mesma regra e existe pela mesma razão — os dois predicados casam com o mesmo caminho, e quem
responde é o primeiro.

A regra de `MD-0014`, segundo a qual a classe vem da origem do texto e nunca do diretório,
permanece intocada. O que mudou foi onde a declaração mora, que é questão de organização; a
classe de cada literal continua exatamente a que era, e o inventário idêntico é o que o prova.

## Efeito sobre o contexto

A dívida 3 está encerrada: nenhum arquivo de `scripts/textos/` passa de 172 linhas. A feature
de busca, quando vier, declara os seus literais em `interface-busca.mts`, e o gerador já sabe
dizer-lhe isso.
