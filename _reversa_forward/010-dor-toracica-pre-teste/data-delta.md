# Data-delta — dor torácica e probabilidade pré-teste

> Feature `010-dor-toracica-pre-teste` · 2026-07-23
> Diff conceitual sobre o modelo extraído em `_reversa_sdd/erd-complete.md`.

## Contexto

🟢 O sistema **não tem banco** (ausência por design — ADR 0002; `_reversa_sdd/architecture.md#3`). O "modelo de dados" é o conjunto de entidades **em memória** que fluem `Entrada → Saída` na unit de domínio. Este delta descreve as entidades novas da unit `models/cardiopatia-isquemica/`; nenhuma migração, índice ou DDL está envolvido.

## Entidades novas (em memória)

### `EntradaAvaliacao` (entrada da fachada)

| Campo | Tipo conceitual | Origem (requirements) | Observação |
|-------|-----------------|-----------------------|------------|
| `idadeAnos` | inteiro | RF-02/RN-06 | Fora de 30–69 → `ForaDoEscopoDaFonte`; validação de intervalo plausível (ofensor) |
| `sexo` | `'masculino' \| 'feminino'` | RF-02/RN-02 | Eixo da tabela do Quadro 2 |
| `dorRetroesternal` | booleano | RN-01 (característica a) | Característica 1 do Quadro 1 |
| `provocadaPorEsforcoOuEstresse` | booleano | RN-01 (característica b) | Característica 2 |
| `aliviaComRepousoOuNitrato` | booleano | RN-01 (característica c) | Característica 3 |
| `fatoresDeRisco` | conjunto de `{ diabetes, tabagismo, hipertensao, dislipidemia }` | RN-03 | Presença de ≥ 1 aciona o ajuste ×2–×3 e impede estrato "baixa" |
| `impedimentoErgometria` | booleano (ou união de motivos) | RN-05 | ECG basal alterado / não pode exercitar → exame alternativo |
| `sinaisInstabilidade` | booleano (ou união) | RN-07 | Aciona advertência de encaminhamento emergencial |

### `SaidaAvaliacao` (união de resultado)

Espelha o padrão `SaidaCalculo` do legado (4 variantes; `_reversa_sdd/erd-complete.md`):

| Variante | Quando | Carga |
|----------|--------|-------|
| `ResultadoAvaliacao` | entrada válida e dentro do escopo | `classificacaoDor` (típica/atípica/não anginosa), `probabilidadeBase` (%), `probabilidadeAjustada` (faixa capada, se houver fator de risco), `estrato` (baixa/intermediária/alta), `conduta` (texto estruturado + exame indicado), `advertencias` (ex.: instabilidade), e `referencias: ReferenciaClinica[]` — **toda** saída referenciada |
| `ForaDoEscopoDaFonte` | idade fora de 30–69 (RN-06) | motivo + `ReferenciaClinica` explicando o limite do Quadro 2 |
| `EntradaInvalida` | ≥ 1 ofensor de validação | lista **completa** de ofensores (RN-09) |
| `ErroDeInvariante` | bug interno | só o nome da classe (privacidade) → painel honesto |

## Constantes congeladas novas (`fonte-clinica.ts`)

- `PROBABILIDADE_PRE_TESTE`: matriz `[classe][sexo][faixaEtaria] → número` (Quadro 2, 24 células) — **fonte numérica única**, congelada.
- `FAIXAS_ETARIAS`: `30–39`, `40–49`, `50–59`, `60–69`.
- `ESTRATOS`: limiares `< 10` (baixa), `10–90` (intermediária), `> 90` (alta).
- `CARACTERISTICAS_DOR` e mapa de contagem → classificação (3 → típica; 2 → atípica; ≤ 1 → não anginosa).
- `CAUSAS_NAO_CARDIACAS`: lista da conduta de probabilidade baixa (musculoesquelética, psiquiátrica, gastrointestinal, pulmonar).
- `REFERENCIAS`: catálogo de `ReferenciaClinica` por quadro/página do TeleCondutas 2017.

## Migrações

**n/a** — sem persistência. Nenhuma linha de dado existente é lida, transformada ou movida. A introdução da unit não afeta `models/insulina` nem `models/gestacao`.
