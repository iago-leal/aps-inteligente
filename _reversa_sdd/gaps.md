# Gaps — aps-inteligente

> Gerado pelo Reversa Reviewer em 2026-07-19. Lacunas que permaneceram após a sessão de validação.

## Abertas (aguardam insumo do usuário)

| # | Lacuna | Origem | O que destrava |
|---|--------|--------|----------------|
| G-01 | Caminho do PDF do Guia Rápido DM (usuário confirmou que fornecerá) | `questions.md` P-1 | Conferência página a página das 20 referências e limiares de `fonte-clinica.ts` |
| G-02 | Páginas/tabelas do guia sobre dose otimizada de metformina e ajuste/contraindicação por TFG | `questions.md` P-2 | Specs das divergências clínicas 1 e 2 (features futuras do ciclo forward) |
| G-03 | Redação condicional da `SUSPENDER_SULFONILUREIA` ampliada e seu gatilho (todo cálculo fracionado vs. só com ajuste) | `questions.md` P-3 | Spec da divergência clínica 3 |

## Convertidas em ação (decididas, aguardam execução)

| # | Item | Decisão do usuário (2026-07-19) | Próximo passo |
|---|------|--------------------------------|---------------|
| A-01 | Silêncio do motor com HbA1c ausente nos ramos residuais | Comportamento indesejado — deve recomendar dosar HbA1c | Registrar via `/reversa-debugger`; teste de regressão antes do fix |
| A-02 | Placeholder `/api/v1` | Manter deliberadamente como lembrete | Nada nesta fase; implementar na etapa do banco (ADR 0008) |
| A-03 | CI, lint de fronteira (D-01), e2e, CSP/404 | Nada por enquanto | Permanecem em `architecture.md` §6; reavaliar na próxima feature de infra |

## Estruturais (registradas, sem bloqueio)

- 🔴 Sem telemetria/logs de produção (por design, ADR 0007) — comportamento em uso real é invisível.
- 🟡 `formulario.tsx` (532 LOC) e `globais.css` (699 LOC) acima do limite de 400; `proximoId` módulo-global — dívidas com tarefas propostas (`interface-calculadora/tasks.md` T-07/T-08).
