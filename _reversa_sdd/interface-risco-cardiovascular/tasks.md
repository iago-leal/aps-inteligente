# interface/risco-cardiovascular — Tasks

> `tasks.md` · Decomposição para reimplementação fiel. Re-extração 3 (2026-07-23), feature `014-risco-cardiovascular-pce`.
> Estado: já implementado e testado. Cada tarefa cita o arquivo do legado.

| # | Tarefa | Origem no legado | Critério de pronto | Confiança |
|---|--------|------------------|--------------------|-----------|
| T-01 | `TelaRiscoCardiovascular`: compor `Moldura` (título/subtítulo) + `AppRiscoCardiovascular` | `tela.tsx` | Renderiza dentro da Moldura comum; sem estado clínico | 🟢 |
| T-02 | `AppRiscoCardiovascular`: estado, `estadoDaSaida`, ciclo estimar/invalidar/nova estimativa; motor e relator injetáveis | `app.tsx` | Estados corretos; exceção → painel honesto + evento anônimo (EC-07) | 🟢 |
| T-03 | `FormularioRiscoCardiovascular`: campos controlados + toggles, validação no blur espelhando `FAIXAS` | `formulario.tsx` | Campos completos; blur valida faixas do domínio | 🟢 |
| T-04 | `PainelRiscoCardiovascular`: risco %, categoria com `Label` de variante, avisos de clamp; 5 estados de UI | `resultado.tsx` | Cada estado renderiza distintamente; avisos exibidos | 🟢 |
| T-05 | `NotaDeProveniencia` + `ContextoDaFonte`: lê `NOTA_PROVENIENCIA`; seção consultável PCE×PREVENT com link `<a>` nativo | `proveniencia.tsx` | Texto vem do domínio (anti-drift); link não é fetch | 🟢 |
| T-06 | CSS mínimo da tela | `interface/estilos/risco-cardiovascular.css` (8 linhas) | Sobre tokens Primer, sem cor própria | 🟢 |
| T-07 | Teste de integração da tela | `tests/integration/interface/risco-cardiovascular.test.tsx` | Fluxos feliz/escopo/erro cobertos; axe 0/0 | 🟢 |

## Dependências entre tarefas

- T-01 depende de T-02..T-05 (compõe os componentes).
- T-02 é o contêiner; T-03, T-04, T-05 são componentes independentes.
- T-07 valida o conjunto.

## Notas

- 🟢 Reusa `relator-de-erros.ts` de `interface/calculadora/` (padrão comum das telas).
- 🟢 Sem ritual de revisão (D-08) — diferença deliberada face à tela da insulina.
