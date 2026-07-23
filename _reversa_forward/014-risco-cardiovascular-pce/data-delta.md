# Data-delta: modelo de domínio da feature 014

> Identificador: `014-risco-cardiovascular-pce`
> Data: `2026-07-23`
> Base: `_reversa_sdd/erd-complete.md` · `_reversa_sdd/data-dictionary.md`

## 0. Escopo do delta

**Nenhuma mudança de banco.** O Postgres (feature 003) só serve ao healthcheck `SELECT 1` e nunca toca dado clínico (architecture.md §3); não há tabela, coluna, índice, constraint ou migração nesta feature. O único durável do sistema segue sendo o tema em `localStorage`.

O que muda é o **modelo de domínio em memória**: novos value objects imutáveis, efêmeros por request, no molde da unit `models/cardiopatia-isquemica`. O `erd-complete.md` os modela como composição de objetos com invariantes por value object; este documento descreve o diff conceitual dessa composição.

## 1. Novos tipos de entrada (`models/risco-cardiovascular/tipos.ts`)

```ts
type Sexo = "masculino" | "feminino";
type Raca = "branco" | "afro-americano" | "outra";   // "outra" → coeficientes de branco (RN-05)

interface EntradaEstimativa {
  readonly sexo: Sexo;
  readonly raca: Raca;
  readonly idadeAnos: number;
  readonly colesterolTotalMgDl: number;
  readonly hdlMgDl: number;
  readonly pasMmHg: number;
  readonly emTratamentoAntiHipertensivo: boolean;
  readonly diabetes: boolean;
  readonly tabagismoAtual: boolean;
  readonly dcvPrevia: boolean;                        // true → prevenção secundária, fora do escopo (RF-05)
}
```

| Campo | Faixa fisiológica | Fora da faixa | Origem |
|---|---|---|---|
| `idadeAnos` | 40–79 (elegível); 0–120 plausível | 40–79 excedida → `fora-do-escopo`; fora de 0–120 → ofensor | RN-02/RF-03, D-06 |
| `colesterolTotalMgDl` | 130–320 | *clamp* + alerta | RN-03, D-07 |
| `hdlMgDl` | 20–100 | *clamp* + alerta | RN-03, D-07 |
| `pasMmHg` | 90–200 | *clamp* + alerta | RN-03, D-07 |
| `emTratamentoAntiHipertensivo` | booleano | seleciona β da PAS tratada × não-tratada | RN-03 |
| `diabetes`, `tabagismoAtual` | booleano | termo binário 0/1 | RN-03 |
| `dcvPrevia` | booleano | true → `fora-do-escopo` (`DCV_PREVIA`) | RF-05, D-06 |

## 2. Nova saída (união discriminada por `tipo`)

```ts
type SaidaEstimativa = ResultadoEstimativa | ForaDoEscopoDaFonte | EntradaInvalida;
```

- **`ResultadoEstimativa`** (`tipo: "resultado"`): `riscoPct: number`, `categoria: CategoriaRisco`, `avisos: readonly Aviso[]` (clamps aplicados, D-07), `notaProveniencia: string`, `referencias: readonly ReferenciaClinica[]` (nunca vazia — RF-08).
- **`ForaDoEscopoDaFonte`** (`tipo: "fora-do-escopo"`): `motivo: "IDADE_FORA_DA_FAIXA" | "DCV_PREVIA"`, `mensagem: string`, `referencia: ReferenciaClinica`.
- **`EntradaInvalida`** (`tipo: "erro-validacao"`): `ofensores: readonly Ofensor[]` (coleta total).

Auxiliares: `CategoriaRisco = "baixo" | "limitrofe" | "intermediario" | "alto"`; `Ofensor { campo; codigo; mensagem }` com `CodigoOfensor` (ex.: `SEXO_INVALIDO`, `RACA_INVALIDA`, `IDADE_INVALIDA`, `COLESTEROL_INVALIDO`, `HDL_INVALIDO`, `PAS_INVALIDA`); `Aviso { campo; codigo; mensagem }` para clamp; `ReferenciaClinica { fonteId; versaoEdicao; localizacao }` reusado do padrão da 010; classe `ErroDeInvariante` só para bug interno.

## 3. Constantes congeladas (`fonte-clinica.ts`)

Estruturas `Object.freeze` (aninhado), comentadas com a Tabela A de Goff 2013 — detalhe numérico em `investigation.md` §4:

- `COEFICIENTES` — `Record<GrupoPce, RegistroCoeficientes>`, quatro grupos (`homem-branco`, `homem-negro`, `mulher-branca`, `mulher-negra`); precisão estendida (investigation §4.1).
- `BASELINE_SURVIVAL` — `Record<GrupoPce, number>` (0.91436 / 0.89536 / 0.96652 / 0.95334).
- `MEANS` — `Record<GrupoPce, number>` (61.1816 / 19.5425 / −29.1817 / 86.6081) — **mean dos homens negros = 19.54** (corrigido).
- `FAIXAS` — `{ idadeCobertura {40,79}, idadePlausivel {0,120}, colesterolTotal {130,320}, hdl {20,100}, pas {90,200} }`.
- `CATEGORIAS` — cortes `{ limitrofe: 5, intermediario: 7.5, alto: 20 }` (%).
- `REFERENCIAS` — `ReferenciaClinica` congeladas das PCE (ACC/AHA 2013).
- `NOTA_PROVENIENCIA` — texto único da limitação (coorte dos EUA + raça, sem calibração para o Brasil) — RN-09/RF-10.

## 4. Mapeamento sexo×raça → grupo PCE

Função pura `grupoDe(sexo, raca): GrupoPce`, com `raca === "outra"` → coeficientes de branco (RN-05):

| sexo | raca | grupo |
|---|---|---|
| masculino | branco / outra | `homem-branco` |
| masculino | afro-americano | `homem-negro` |
| feminino | branco / outra | `mulher-branca` |
| feminino | afro-americano | `mulher-negra` |

## 5. Impacto no dicionário de dados / ERD

- `_reversa_sdd/data-dictionary.md`: nova entrada da unit `risco-cardiovascular` (value objects §1–2 e coeficientes §3), no molde das seções das outras units. Fonte editorial (guideline Goff 2013) fora do git (MD-0008).
- `_reversa_sdd/erd-complete.md`: +um agrupamento de value objects imutáveis (entrada, saída, coeficientes), sem relacionamento persistido — como as demais units.

## 6. Migração

n/a — sem estado persistido. A ordem de introdução dos arquivos vive no `actions.md`.
