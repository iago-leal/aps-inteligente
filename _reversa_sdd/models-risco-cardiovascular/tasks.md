# models/risco-cardiovascular — Tasks

> `tasks.md` · Decomposição para reimplementação fiel. Re-extração 3 (2026-07-23), feature `014-risco-cardiovascular-pce`.
> Cada tarefa cita o arquivo do legado de onde o comportamento foi extraído. Estado: já implementado e testado (extração de sistema existente).

| # | Tarefa | Origem no legado | Critério de pronto | Confiança |
|---|--------|------------------|--------------------|-----------|
| T-01 | Definir contratos: `EntradaEstimativa`, `SaidaEstimativa` (union por `tipo`), `Aviso`, `Ofensor`, `ForaDoEscopoDaFonte`, `ErroDeInvariante` | `tipos.ts` | Tipos compilam em TS strict; union discriminada por `tipo` | 🟢 |
| T-02 | Congelar constantes da fonte: `COEFICIENTES` (4 grupos × 13 termos), `BASELINE_SURVIVAL`, `MEANS`, `FAIXAS`, `CATEGORIAS`, `REFERENCIAS`, `NOTA_PROVENIENCIA` | `fonte-clinica.ts` | Todos os objetos `Object.freeze`; valores em precisão estendida | 🟢 |
| T-03 | Implementar `validarEntrada` com coleta total de ofensores (6 códigos) | `validacao.ts:33-93` | Entrada com múltiplos erros devolve todos os ofensores | 🟢 |
| T-04 | Implementar `clamparEntrada`: corta colesterol/HDL/PAS à faixa e produz `Aviso` com direção do viés | `validacao.ts:100-163` | HDL 15 → clampa a 20 + aviso "pode subestimar"; valor na faixa → sem aviso | 🟢 |
| T-05 | Implementar `foraDoEscopo`: DCV prévia (precedência) e idade fora de 40–79 → `ForaDoEscopoDaFonte` com motivo distinto | `elegibilidade.ts` | idade 82 → `IDADE_FORA_DA_FAIXA`; dcvPrevia → `DCV_PREVIA` | 🟢 |
| T-06 | Implementar `grupoDe(sexo,raca)`: mapeia sexo×raça ao `GrupoPce`; `raca="outra"`→branco | `equacao.ts:11-15` | 4 grupos corretos; "outra" cai no branco correspondente | 🟢 |
| T-07 | Implementar `riscoAscvdPct`: soma de Cox log-linear com termo de PAS mutuamente exclusivo; risco = `1 − S₀^exp(soma − mean)` ×100 | `equacao.ts:28-56` | Valores conhecidos batem com o ASCVD Estimator (oráculo) | 🟢 |
| T-08 | Implementar `categoriaDe`: cortes 5 / 7,5 / 20% | `categoria.ts` | 4,9→baixo; 6→limítrofe; 12→intermediário; 21→alto | 🟢 |
| T-09 | Implementar a fachada `estimar`: pipeline validar→escopo→clamp→equação→categoria; invariante de referência não vazia | `calculadora.ts` | Pipeline na ordem correta; `ErroDeInvariante` se referências vazias | 🟢 |
| T-10 | Testes de unidade: `equacao.test.ts` (valores conhecidos) e `invariantes.test.ts` (property-based: risco 0–100, categoria monotônica, referência não vazia) | `tests/unit/dominio-risco-cardiovascular/` | Suíte verde; cobertura no threshold de `models/**` | 🟢 |

## Dependências entre tarefas

- T-01, T-02 são pré-requisito de todas as demais.
- T-03..T-08 são independentes entre si (funções puras isoladas).
- T-09 depende de T-03..T-08; T-10 valida o conjunto.

## Premissas 🟡 a confirmar (não bloqueiam a reimplementação)

- Faixas fisiológicas de clamp (130–320 / 20–100 / 90–200) — validar com o prescritor.
- Cortes de categoria (5 / 7,5 / 20%) — cortes do 2019 ACC/AHA; confirmar aplicabilidade.
- `raca="outra"` → coeficientes de branco (RN-05) — confirmar a convenção herdada do ASCVD Estimator.
