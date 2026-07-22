# Actions: Dar função ao ritual de revisão — copiar o Plano ao prontuário

> Identificador: `006-checkbox-revisao-redundante`
> Data: `2026-07-22`
> Roadmap: `_reversa_forward/006-checkbox-revisao-redundante/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 9 |
| Paralelizáveis (`[//]`) | 4 |
| Maior cadeia de dependência | 6 (T001 → T004 → T006 → T007 → T008 → T009) |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Extrair de `resultado.tsx` os rótulos e utilitários de texto reutilizáveis pelo formatador (`ROTULO_MOMENTO`, `textoDoDelta`) para o módulo puro `interface/calculadora/rotulos.ts`, com cabeçalho citando RF-02; refactor sem mudança de comportamento — suíte existente permanece verde (D-01) | - | - | `interface/calculadora/rotulos.ts` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T002 | Criar o teste de unidade do formatador (nasce falhando): quatro partes na ordem do RF-02 (esquema/dose → recomendações → referência → linha de contexto), sem cabeçalho "Plano:"; hierarquia da 005 como subitem recuado; alertas e condutas alternativas ausentes do texto (D-04); cenários de início (faixas) e de titulação (conduta + dose total + esquema); linha de contexto com o teor de D-05 (RF-02; RN-03) | - | `[//]` | `tests/unit/interface/formatar-plano.test.ts` | 🟢 | `[X]` |
| `[//]` T003 | Estender o teste de integração do painel (nasce falhando) com dublê injetável do adaptador de cópia: botão "Copiar plano" só com revisão confirmada e resultado atual; clique com dublê de sucesso → mensagem `role="status"`; dublê de falha → mensagem `role="alert"` com orientação de transcrição manual; edição desfaz revisão, retira botão e zera o retorno; sem revisão não há botão (RF-01, RF-03, RF-04; D-02, D-03) | - | `[//]` | `tests/integration/interface/resultado.test.tsx` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T004 | Implementar `formatar-plano.ts`: função pura `formatarPlano(saida: ResultadoCalculo): string` com as quatro partes do RF-02, importando `agruparRecomendacoes` e `rotulos.ts`; corpo conforme D-04 (sem alertas nem condutas alternativas); linha de contexto de D-05; cabeçalho citando RF-02/RN-03; T002 verde (D-01) | T001, T002 | `[//]` | `interface/calculadora/formatar-plano.ts` | 🟡 | `[X]` |
| `[//]` T005 | Implementar `area-de-transferencia.ts`: adaptador assíncrono que grava texto na área de transferência do navegador e devolve `{ok: true} \| {ok: false}` — erro capturado como valor, jamais exceção ao chamador; cabeçalho citando RF-03/RN-05; molde de `preferencia-de-tema.ts` (D-02; ADR 0004) | - | `[//]` | `interface/calculadora/area-de-transferencia.ts` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T006 | Estender o bloco de revisão em `resultado.tsx`: botão "Copiar plano" (D-06) dentro de "Pronto para prescrever", habilitado por `revisaoValida`; estado local `EstadoCopia` (`ocioso \| copiado \| falhou`) zerado quando `revisaoValida` deixa de valer; mensagens de retorno com `role="status"`/`role="alert"`; adaptador injetável para os testes; ajuste mínimo em `globais.css` se preciso (ambos os arquivos abaixo de 400 linhas — extrair componente do bloco se `resultado.tsx` estourar); T003 verde (RF-01, RF-03, RF-04; D-03) | T003, T004, T005 | - | `interface/calculadora/resultado.tsx` | 🟢 | `[X]` |
| T007 | Estender `e2e/calculadora.spec.ts`: no chromium, conceder permissões de clipboard, marcar a revisão, copiar e comparar o conteúdo da área de transferência com o painel renderizado (quatro partes, sem cabeçalho); nos dois viewports, verificar botão e retorno visível; axe permanece na linha de base 0 da feature 004 (RF-02 ponta a ponta; D-07) | T006 | - | `e2e/calculadora.spec.ts` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Verificação integrada: `npm test`, `test:api` e `test:e2e` verdes; `git diff models/` vazio; diff de strings clínicas nulo fora do bloco de revisão (RF-05); zero fetch novo (RN-04); limites de linhas respeitados (critério de pronto do roadmap §10) | T007 | - | `_reversa_forward/006-checkbox-revisao-redundante/` | 🟢 | `[X]` |
| T009 | Consolidar `relatorio.md` da feature: exemplo real do texto copiado nos dois modos, resultado da varredura axe, e registro dos watchs — D-04 (alertas/alternativas fora do texto, validar em uso real) e drift formatador×tela (RF-02; roadmap §9) | T008 | - | `_reversa_forward/006-checkbox-revisao-redundante/relatorio.md` | 🟢 | `[X]` |

## Notas de execução

<!-- Reservado para /reversa-coding. -->

- A regra react-hooks/set-state-in-effect vetou o reset por efeito; a ação de cópia virou componente filho (`AcaoCopiarPlano`) montado só com `revisaoValida` — o desmonte zera o estado por construção (mesma semântica do RF-04, solução mais limpa que a prevista no T006).
- Suíte de contrato exige `npm run db:up` (Postgres local da feature 003) e o servidor de produção de pé (`npm run build && npm start`); ambos foram levantados e derrubados na verificação do T008.
- Drift de formatação pré-existente em 3 arquivos não tocados (agrupar-recomendacoes.ts, status.test.ts, BUG-20260719-RHZ5.test.ts) foi deixado como está para não poluir o diff da feature.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-22 | Versão inicial gerada por `/reversa-to-do` | reversa |
