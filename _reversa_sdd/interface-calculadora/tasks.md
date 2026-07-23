# interface/calculadora — Tarefas de Implementação

> `tasks.md` · Re-extração 2 (2026-07-23), regenerado. Absorve 004 (Primer), 005 (redação metformina×TFG), 006 (copiar plano), 007 (Moldura extraída).
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Pré-requisitos

- [ ] Unit `models-insulina` implementada (fachada, tipos, `CONSTANTES`)
- [ ] `interface-comum` (Moldura) disponível
- [ ] React 19 + Testing Library + jsdom; aliases `models/*`, `interface/*`
- [ ] `@primer/react` e estilos (`interface/estilos/*`) carregados

## Tarefas

- [ ] **T-01** Store de tema + contrato `RelatorDeErros` (nulo)
  - Origem no legado: `preferencia-de-tema.ts`, `relator-de-erros.ts`
  - Critério de pronto: alternância degrada bem sem localStorage; `EventoDeErro={nome}` impede payload clínico
  - Confiança: 🟢

- [ ] **T-02** `TelaCalculadora`: composição da Moldura comum + `CalculadoraApp`
  - Origem no legado: `interface/calculadora/tela.tsx`
  - Critério de pronto: não reimplementa cabeçalho/selo/tema (vêm da Moldura); título/subtítulo da insulina
  - Confiança: 🟢

- [ ] **T-03** `Formulario`: linhas dinâmicas, validação no blur via `CONSTANTES`, `interpretaDecimal`, `derivaTipoEsquema`, modos
  - Origem no legado: `interface/calculadora/formulario.tsx`
  - Critério de pronto: RF-01/RF-02; `formulario.test.tsx` verde
  - Confiança: 🟢

- [ ] **T-04** `CalculadoraApp`: `EstadoResultado`, try/catch da fachada, 4 variantes, invalidação, "Novo cálculo" por `key`
  - Origem no legado: `interface/calculadora/calculadora-app.tsx`
  - Critério de pronto: máquina de `../state-machines.md` §1 coberta
  - Confiança: 🟢

- [ ] **T-05** `Resultado`: ordem fixa, condutas alternativas rotuladas, ritual de revisão, painel honesto
  - Origem no legado: `interface/calculadora/resultado.tsx`
  - Critério de pronto: RF-04/RF-05/RF-06; cenários Gherkin do `requirements.md`
  - Confiança: 🟢

- [ ] **T-06** Agrupamento de recomendações com subitem (redução metformina×TFG)
  - Origem no legado: `interface/calculadora/agrupar-recomendacoes.ts` (feature 005)
  - Critério de pronto: `REDUZIR_METFORMINA_TFG` como subitem de `MANTER_METFORMINA`; fallback item de topo
  - Confiança: 🟢

- [ ] **T-07** Plano copiável: rótulos, formatador e adaptador de clipboard
  - Origem no legado: `rotulos.ts`, `formatar-plano.ts`, `area-de-transferencia.ts` (feature 006)
  - Critério de pronto: "Copiar plano" só com revisão válida; quatro partes; alertas/alternativas fora; erro como valor
  - Confiança: 🟢

- [ ] **T-08 (dívida)** Extrair subcomponentes do formulário; substituir `let proximoId` por gerador local
  - Origem no legado: `formulario.tsx` (313 LOC)
  - Critério de pronto: sem arquivo > 400 LOC; ids estáveis sob StrictMode; suítes intactas
  - Confiança: 🟢

## Tarefas de Teste

- [ ] **TT-01** Integração do formulário: validação no blur, linhas, parse decimal, modos
- [ ] **TT-02** Integração do resultado: 4 variantes, ordem fixa, ritual, invalidação
- [ ] **TT-03** Relator: exceção → painel honesto + evento só com nome
- [ ] **TT-04** Copiar plano: habilitado pela revisão; conteúdo das quatro partes; leitura real do clipboard no Chromium (e2e)
- [ ] **TT-05** e2e/axe: privacidade (zero requests com dado clínico) e WCAG AA nos 2 viewports — **reconstituído** (features 004+)

## Ordem Sugerida

1. T-01 (infra) primeiro.
2. T-03 e T-05 após T-01; T-04 integra; T-02 (tela) e T-06/T-07 (005/006) fecham.
3. T-08 (dívida) só com suítes verdes.

## Lacunas Pendentes (🔴)

Nenhuma lacuna 🔴 remanescente: a divergência de "glicemias por momento" da extração 1 não foi adotada, e o e2e/axe foi reconstituído. Débito 🟡: watch D-04 (feature 006) a validar em uso; refactor do formulário (T-08).
