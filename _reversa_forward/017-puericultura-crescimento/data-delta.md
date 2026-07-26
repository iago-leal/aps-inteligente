# Delta de dados: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-26`
> Base comparada: `_reversa_sdd/erd-complete.md` e `_reversa_sdd/data-dictionary.md` (re-extração nº 3)

## 1. O que não muda

Nada é persistido. O modelo extraído descreve os quatro domínios como composições de objetos
imutáveis, efêmeros por interação, e o banco PostgreSQL como presença sem dado clínico
(`architecture.md#3`, ADR 0002). Este delta **não** cria tabela, coluna, índice ou migração;
não toca `infra/database.ts`; não altera `/api/v1/status`. O único dado durável do sistema
continua sendo a preferência de tema em `localStorage`.

O que a feature acrescenta é de outra natureza: um **quinto domínio no ERD** (Domínio 5) e uma
categoria de dado que o projeto ainda não tinha, o **dado de referência tabelado**, versionado
no repositório e apenas lido.

## 2. Entidades novas do Domínio 5 (em memória)

Todas em `models/puericultura/tipos.ts`, imutáveis (`readonly`), sem identidade nem ciclo de
vida — mesma disciplina dos quatro domínios existentes.

### 2.1 Entrada

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `sexo` | `"masculino" \| "feminino"` | sim | RN-11; determina a curva |
| `dataDeNascimento` | `DataIso` (`AAAA-MM-DD`) | sim | RN-10; não pode ser posterior à medição |
| `dataDaMedicao` | `DataIso` | sim | RN-10; injetada pela UI, o motor não lê o relógio |
| `pesoKg` | `number` | não | ao menos uma medida é obrigatória (RN-11) |
| `comprimentoCm` | `number` | não | acompanhado obrigatoriamente de `posicaoDaMedicao` |
| `posicaoDaMedicao` | `"deitado" \| "em-pe"` | condicional | RN-09; sem valor padrão silencioso |
| `perimetroCefalicoCm` | `number` | não | índice suprimido acima de 2 anos (RN-08) |
| `idadeGestacionalAoNascer` | `{ semanas: number; dias: number } \| null` | não | RN-15; ausente significa "tratada como termo", e isso é declarado na saída |

Nenhum campo identifica a criança: não há nome, prontuário ou documento, por decisão de
minimização (RNF de privacidade). Isso é diferença relevante frente ao domínio de gestação, que
também lida com datas mas nunca com dado de menor de idade.

### 2.2 Derivadas do tempo

`IdadesDerivadas` concentra o que hoje ficaria espalhado e transforma cada regra temporal em
campo inspecionável:

| Campo | Significado |
|---|---|
| `diasDeVida` | Idade cronológica em dias inteiros (`Date.UTC`, ADR 0013) |
| `descontoDeSemanas` | `40 − IG ao nascer`, zero quando a criança é a termo (RN-16) |
| `diasCorrigidos` | Idade corrigida, ou a cronológica quando a correção já não se aplica |
| `correcaoAtiva` | Se a correção vale nesta avaliação (até 2 anos, ou 3 quando IG < 28 semanas) |
| `semanasPosMenstruais` | `IG ao nascer + idade cronológica`, em semanas exatas; `null` quando a criança é a termo |

### 2.3 Índice antropométrico

Quatro instâncias possíveis por avaliação, cada uma independente das demais (RN-01). O tipo é
uma união discriminada, de modo que "não calculado" nunca se confunde com "calculado como
zero":

| Variante | Campos |
|---|---|
| `calculado` | `indice`, `escoreZ`, `classificacao` (rótulo literal), `padrao` (`"OMS" \| "INTERGROWTH-21st"`), `idadeUsada` (`"cronologica" \| "corrigida" \| "pos-menstrual"`, com o desconto quando houver), `avisos` (conversão de 0,7 cm, entre outros), `referencia` |
| `ausente` | `indice`, `motivo` (medida não informada, ou IMC inexistente nas curvas de pré-termo) |
| `fora-do-escopo` | `indice`, `motivo` (`PC_ACIMA_DE_2_ANOS`), `mensagem`, `referencia` |

`escoreZ` guarda o valor sem arredondamento; a exibição com uma casa decimal é responsabilidade
da tela (D-13). O par `padrao` + `idadeUsada` realiza RN-19 e é o que torna o número auditável.

### 2.4 Saída da fachada

União discriminada por `tipo`, no molde de `SaidaEstimativa` do risco cardiovascular:

- `resultado` — os quatro índices (em qualquer combinação de variantes), a declaração de
  premissa de termo quando a idade gestacional não foi informada (RN-15), a nota de proveniência
  e as referências;
- `fora-do-escopo` — recusa global, com motivo `IDADE_FORA_DA_COBERTURA` ou
  `ABAIXO_DA_CURVA_DE_PRETERMO`, sem número algum;
- `erro-validacao` — todos os ofensores de uma vez (RN-11).

## 3. Dado de referência embarcado (categoria nova)

### 3.1 Forma

Um módulo TypeScript por combinação de índice, faixa e sexo, em
`models/puericultura/oms/tabelas/`, com arrays paralelos indexados por posição:

```ts
export const PESO_IDADE_0_5_MASCULINO = Object.freeze({
  unidade: "dia",     // "dia" (0–5 anos) ou "mes" (5–10 anos)
  inicio: 0,          // índice da primeira linha
  fim: 1856,          // índice da última linha
  l: Object.freeze([...]),   // comprimento = fim − inicio + 1
  m: Object.freeze([...]),
  s: Object.freeze([...]),
});
```

A busca é aritmética (`posição = idade − inicio`), sem varredura nem estrutura auxiliar. Arrays
paralelos, em vez de lista de objetos, cortam cerca de um terço do texto-fonte sem perder
legibilidade do diff: uma correção futura da OMS aparece como alteração numa posição.

### 3.2 Inventário e volume

| Módulo | Índice de linha | Linhas | Origem |
|---|---|---|---|
| `peso-idade-0-5-{masculino,feminino}` | dia 0–1856 | 1857 | WHO 2006, tabela expandida `wfa` |
| `comprimento-estatura-idade-0-5-{…}` | dia 0–1856 | 1857 | WHO 2006, `lhfa` |
| `imc-idade-0-5-{…}` | dia 0–1856 | 1857 | WHO 2006, `bfa` |
| `perimetro-cefalico-idade-0-2-{…}` | dia 0–730 | 731 | WHO 2006, `hcfa`, **recortado** (D-04) |
| `peso-idade-5-10-{…}` | mês 61–120 | 60 | WHO 2007, `wfa` |
| `estatura-idade-5-10-{…}` | mês 61–120 | 60 | WHO 2007, `hfa` |
| `imc-idade-5-10-{…}` | mês 61–120 | 60 | WHO 2007, `bfa` |

Total de 14 módulos e 12.964 registros `L/M/S`. Precisão preservada como publicada; o gerador
arredonda o ruído de ponto flutuante da planilha (`18.505700000000001` volta a ser `18,5057`).

**Nenhum dado tabular para o pré-termo:** as curvas INTERGROWTH-21st entram como seis expressões
em `models/puericultura/intergrowth/equacoes.ts` (D-02), o que dispensa dezenas de milhares de
registros e elimina a questão de granularidade nessa janela.

### 3.3 Ciclo de vida

O dado é gerado por `scripts/gerar-tabelas-oms.ts` (dev-time), commitado junto do gerador que o
produziu e alterado apenas quando a OMS publicar revisão das tabelas ou o Ministério da Saúde
publicar edição nova da caderneta — o mesmo gatilho de revisão que MD-0008 já define para as
fontes clínicas. O contrato de aquisição, com URLs verificadas e regras de conferência, está em
`interfaces/tabelas-de-referencia.md`.

## 4. Impacto no ERD extraído

| Artefato | Delta |
|---|---|
| `_reversa_sdd/erd-complete.md` | Domínio 5 novo: entrada, idades derivadas, índice antropométrico (união de três variantes), saída. Sem relacionamento com os quatro domínios existentes |
| `_reversa_sdd/data-dictionary.md` | Vocabulário novo: escore z, LMS, idade corrigida, idade pós-menstrual, índice antropométrico, padrão de referência, posição da medição |
| `_reversa_sdd/domain.md#2` | Seção 2.6 nova (puericultura) e a quinta linha na tabela de domínios |
| `_reversa_sdd/state-machines.md` | `EstadoCrescimentoInfantil`, no molde de `EstadoRiscoCardiovascular` (`vazio → sucesso \| fora-do-escopo \| erro \| falha-inesperada`) |

Essas atualizações são trabalho do `/reversa-sync` após a implementação, não deste plano.

## 5. Migrações

Não se aplica. Sem esquema, sem persistência, sem versão de dado em trânsito. A introdução do
dado de referência não exige passo de implantação: ele viaja no bundle, como código.
