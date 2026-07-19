# Legacy Mapping — unit `models-insulina`

> Arquivos do legado que compõem este módulo. Gerado pelo Archaeologist em 2026-07-19.

| Arquivo | LOC | Conteúdo relevante |
|---|---|---|
| `models/insulina/tipos.ts` | 186 | Contratos de entrada/saída (l. 5–145), `ErroDeInvariante` (l. 148), value objects `Peso` (l. 156), `Glicemia` (l. 166), `DoseUi` (l. 179) |
| `models/insulina/fonte-clinica.ts` | 108 | `FONTE_ID`/`VERSAO_EDICAO` (l. 7–8), catálogo `REFERENCIAS` com 20 entradas (l. 18–71), `CONSTANTES` clínicas (l. 73–108) |
| `models/insulina/validacao.ts` | 148 | `validarEntrada` (l. 26–138), regra EC-10 (l. 121–134), `motivoForaDoEscopo` (l. 141–148) |
| `models/insulina/regra-inicio.ts` | 69 | `RegraInicio.calcular` (l. 13–69): indicação de insulina (l. 18–33), recomendações (l. 35–52), faixas (l. 54–67) |
| `models/insulina/regra-titulacao-basal.ts` | 173 | `AjusteEmCurso` (l. 15), `indiceDaNphNoturna` (l. 32), `contemDoseLimitada` (l. 42), `aplicar` (l. 62–108), `fracionarSeIndicado` (l. 114–172) |
| `models/insulina/regra-intensificacao.ts` | 240 | `BRACOS` (l. 25–47), gate de HbA1c (l. 60–106), `aplicarBraco` (l. 132–222), AMB-03 (l. 174–210), `ajustarRegular` (l. 224–239) |
| `models/insulina/calculadora.ts` | 156 | `SEVERIDADE` (l. 27), `semDuplicatas` (l. 35), fachada `calcular` (l. 52–73), `calcularTitulacao` (l. 75–155) |

**Testes associados:** `tests/unit/dominio/` (7 suítes: inicio, titulacao-basal, intensificacao, validacao, tipos, invariantes com fast-check, referencias) + `tests/apoio/construtores.ts`.
