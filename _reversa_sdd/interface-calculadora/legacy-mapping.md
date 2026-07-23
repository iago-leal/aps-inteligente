# Legacy Mapping — unit `interface-calculadora`

> Arquivos do legado que compõem este módulo. **Regenerado na re-extração 2 (2026-07-23)** pelo Reviewer: o mapa da extração 1 estava obsoleto — descrevia `tela.tsx` como a Moldura (extraída para `interface/comum` na feature 007), `formulario.tsx` com 532 LOC e `globais.css` com 699 LOC (hoje 313 e 400, este último realocado para a unit `interface-estilos`).

| Arquivo | LOC | Conteúdo relevante |
|---|---|---|
| `interface/calculadora/tela.tsx` | 17 | Composição fina: monta a `Moldura` comum (título/subtítulo da insulina) + `CalculadoraApp`; não reimplementa a casca (feature 007, D-09) |
| `interface/calculadora/calculadora-app.tsx` | 80 | `EstadoResultado`, `aoCalcular` com captura de exceção (EC-07), invalidação por edição, remontagem por `key`; motor/relator injetáveis por prop |
| `interface/calculadora/formulario.tsx` | 313 | `interpretaDecimal`, validadores por campo, linhas dinâmicas, `derivaTipoEsquema` — abaixo do teto de 400 LOC (dívida da extração 1 resolvida) |
| `interface/calculadora/resultado.tsx` | 353 | Painel em ordem fixa (alertas→dose→fonte→revisão→disclaimer), ritual de revisão, ação "Copiar plano" (feature 006), painel honesto de falha |
| `interface/calculadora/esquema-atual.tsx` | 124 | Bloco do esquema atual (modo titulação) |
| `interface/calculadora/glicemias-por-momento.tsx` | 115 | Linhas de glicemia por momento |
| `interface/calculadora/antidiabeticos-orais.tsx` | 90 | Campos de antidiabéticos orais |
| `interface/calculadora/agrupar-recomendacoes.ts` | 37 | Subordinação da redução por TFG como subitem da manutenção (feature 005) |
| `interface/calculadora/formatar-plano.ts` | 70 | `formatarPlano`: texto do plano em quatro partes (feature 006) |
| `interface/calculadora/area-de-transferencia.ts` | 17 | `copiarParaAreaDeTransferencia`: clipboard com erro como valor (feature 006) |
| `interface/calculadora/rotulos.ts` | 17 | `ROTULO_MOMENTO`, `textoDoDelta` — fonte única anti-drift (tela ↔ plano) |
| `interface/calculadora/validacao-campos.ts` | 51 | Validadores de campo espelhando `CONSTANTES` do motor |
| `interface/calculadora/erro-de-campo.tsx` | 14 | Componente de erro de campo |
| `interface/calculadora/preferencia-de-tema.ts` | 39 | Store externo do tema; chave `aps-inteligente:tema`; consumido pela Moldura (acoplamento a realocar) |
| `interface/calculadora/provedor-tema.tsx` | 23 | `ProvedorTemaPrimer` (usado por `pages/_app.tsx`) |
| `interface/calculadora/relator-de-erros.ts` | 20 | Contrato `RelatorDeErros` + `relatorNulo` (`EventoDeErro = {nome}`) — MD-0010 |

**Testes associados:** `tests/integration/interface/*` (formulario, resultado, relator-de-erros) + `e2e/calculadora.spec.ts` (aponta para `/dm2/insulina`; axe-baseline em zero).

> Nota de reconciliação: nenhum arquivo desta unit passa de 400 LOC na re-extração 2 (a dívida ⚠️ da extração 1 em `formulario.tsx` e `globais.css` foi resolvida — `formulario.tsx` caiu para 313 e `globais.css` saiu para `interface-estilos`). A Moldura, antes aqui em `tela.tsx`, vive em `interface/comum/moldura.tsx` (95 LOC) desde a feature 007.
