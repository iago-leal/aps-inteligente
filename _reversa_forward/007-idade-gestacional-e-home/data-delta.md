# Data Delta: 007-idade-gestacional-e-home

> Diff conceitual sobre `_reversa_sdd/erd-complete.md`. Todas as entidades abaixo são **em memória** (RN-09: nada é persistido; o banco da fundação 003 permanece vazio). O modelo `EntradaCalculo → SaidaCalculo` da insulina não muda em nada.

## 1. Entidades novas (unit `models/gestacao/`)

### `EntradaDatacao`

| Campo | Tipo | Regras |
|---|---|---|
| `dataReferencia` | data (`AAAA-MM-DD`) | Obrigatória; injetada pela UI com a data do dispositivo (RN-07); o motor não lê o relógio |
| `dum` | data, opcional | Primeiro dia da última menstruação; não pode ser futura nem anterior a 44 semanas da referência (RN-05 🟡) |
| `ultrassom` | objeto, opcional | Datação por exame; parcial é ofensor (RN-05) |
| `ultrassom.dataExame` | data | Não pode ser futura |
| `ultrassom.semanas` | inteiro 0–42 | IG do laudo (parte semanas) 🟡 |
| `ultrassom.dias` | inteiro 0–6 | IG do laudo (parte dias) |

Invariante de entrada: ao menos uma datação completa (`dum` ou `ultrassom`). Ambas presentes → dispara a comparação (RN-11).

### `SaidaDatacao` (union, erros como valores — ADR 0004)

| Variante | Conteúdo |
|---|---|
| `resultado` | `ResultadoDatacao` |
| `erro-validacao` | lista completa de `Ofensor` (coleta total, regra 15 do domain.md) |

(Sem variante `fora-do-escopo` nesta unit: as fronteiras de escopo da datação são cobertas pela validação; se surgir cenário fora da fonte, o padrão da insulina será replicado.)

### `ResultadoDatacao`

| Campo | Tipo | Regras |
|---|---|---|
| `porDum` | `DatacaoCalculada`, opcional | Presente se `dum` informada |
| `porUltrassom` | `DatacaoCalculada`, opcional | Presente se `ultrassom` informado; inclui `dumEquivalente` |
| `comparacao` | `ComparacaoDatacoes`, opcional | Presente somente com as duas datações (RN-11) |
| `referencias` | `ReferenciaClinica[]` | Nunca vazia (invariante property-based, padrão do motor de insulina) |
| `notas` | textos fixos | Ressalva de confiabilidade da DUM (p. 31) e natureza estimativa (RF-07) |

### `DatacaoCalculada`

| Campo | Tipo | Regras |
|---|---|---|
| `ig` | `{ semanas: inteiro ≥ 0, dias: 0–6 }` | RN-01: ⌊dias/7⌋ + resto, sobre `dataReferencia` |
| `dpp` | data | RN-02: Naegele calendárico (+7 dias, +9 meses), p. 32 (D-03) |
| `trimestre` | 1 \| 2 \| 3 | RN-04: cortes 13+6 / 27+6 🟡 |
| `dumEquivalente` | data, só no modo ultrassom | RN-03: `dataExame − (semanas×7 + dias)` |

### `ComparacaoDatacoes`

| Campo | Tipo | Regras |
|---|---|---|
| `diferencaDias` | inteiro ≥ 0 | \|DUM informada − DUM equivalente\| |
| `trimestreDaUsg` | 1 \| 2 \| 3 | Calculado pela IG **no dia do exame** |
| `margemDias` | 7 \| 14 \| indefinida | p. 32: 1.º tri → 7; 2.º tri → 14; 3.º tri → sem parâmetro na fonte (D-05) |
| `veredito` | `dum-confirmada` \| `dum-fora-da-margem` \| `sem-parametro-na-fonte` | Informativo; o motor não escolhe a datação (ADR 0005) |

### `Ofensor` (catálogo da unit)

`DUM_FUTURA`, `DUM_ALEM_DE_44_SEMANAS` 🟡, `DATA_EXAME_FUTURA`, `IG_LAUDO_FORA_DE_FAIXA` (semanas 0–42 / dias 0–6), `DATACAO_ULTRASSOM_INCOMPLETA`, `NENHUMA_DATACAO_INFORMADA`, `DATA_INVALIDA` (formato/calendário). Coleta total: todos de uma vez, nunca o primeiro.

### `ReferenciaClinica` (catálogo próprio)

Mesma forma da insulina (documento + localização), catálogo congelado em `models/gestacao/fonte-clinica.ts`: *Guia Rápido Pré-Natal, SMS-Rio, 4.ª ed., 2025* — p. 31 (datação pela DUM), p. 32 (Naegele; margens da USG), p. 113 (indicações de USG). Não há mescla com o catálogo do guia de diabetes: uma fonte por unit (coerente com NG-04 da insulina).

## 2. Estruturas novas de apresentação (fora do domínio)

- `interface/inicio/catalogo.ts` (D-07): `Secao { id, titulo, calculadoras: Calculadora[] }` e `Calculadora { titulo, descricao, rota }` — dado estático tipado, congelado; duas seções (`dm2`, `pre-natal`), uma calculadora em cada.
- Estado da tela de IG: máquina reduzida de `EstadoResultado` (`vazio → sucesso | erro`, flag `desatualizado`; **sem** `revisaoConfirmada` — D-08; `falha-inesperada` mantida com o painel honesto).

## 3. Campos removidos

Nenhum.

## 4. Migrações necessárias

Nenhuma (sem persistência; schema `public` do banco segue vazio, adendo 003).

## 5. Edge cases de dados a fixar em teste (alimenta o `/reversa-to-do`)

1. Naegele com estouro de dia no mês destino (ex.: DUM 24/05 → +7d = 31/05 → +9m = 31/02 inválido): normalização por transbordo documentada (investigation §4).
2. Ano bissexto na diferença de dias e DUM 29/02.
3. Limites de trimestre: 13+6→14+0 e 27+6→28+0 (RN-04) nos dois sentidos.
4. Limites de margem: diferença exatamente igual à margem (7 e 14 dias) — pela p. 32, "fora" é estritamente maior que a margem; fixar em teste com a redação "desconsiderada se cair fora".
5. USG de 3.º trimestre + DUM → `sem-parametro-na-fonte` (D-05).
6. IG do laudo 0 semanas 0 dias (exame no primeiro dia) e DUM = dataReferencia (IG 0+0, 1.º trimestre).
