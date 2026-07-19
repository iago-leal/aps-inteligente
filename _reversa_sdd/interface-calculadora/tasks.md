# interface-calculadora — Tarefas de Implementação

> Gerado pelo Reversa Writer em 2026-07-19.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Pré-requisitos

- [ ] Unit `models-insulina` implementada (fachada, tipos e `CONSTANTES` disponíveis)
- [ ] React 19 + Testing Library + jsdom configurados (aliases `models/*`, `interface/*` no tsconfig/vitest)
- [ ] Tokens de design de `interface/estilos/globais.css` disponíveis (projeto Claude Design com layout aprovado — ver memória `design-da-tela-calculadora`)

## Tarefas

- [ ] T-01, Store de tema: `Tema`, `useSyncExternalStore`, chave `aps-inteligente:tema`, degradação graciosa
  - Origem no legado: `interface/calculadora/preferencia-de-tema.ts`
  - Critério de pronto: alternância persiste; com localStorage bloqueado, funciona sem persistir
  - Confiança: 🟢

- [ ] T-02, Contrato `RelatorDeErros` + `EventoDeErro = {nome}` + implementação nula
  - Origem no legado: `interface/calculadora/relator-de-erros.ts`
  - Critério de pronto: tipo impede estruturalmente payload clínico; no-op chamável
  - Confiança: 🟢

- [ ] T-03, Moldura `TelaCalculadora`: cabeçalho, selo "Nada é salvo nem enviado", alternador de tema
  - Origem no legado: `interface/calculadora/tela.tsx`
  - Critério de pronto: RF-08; snapshot de integração
  - Confiança: 🟢

- [ ] T-04, `Formulario`: linhas dinâmicas (glicemia/aplicação) com strings brutas, validação no blur via `CONSTANTES`, `interpretaDecimal` (vírgula/ponto), `derivaTipoEsquema`, alternância de modo
  - Origem no legado: `interface/calculadora/formulario.tsx`
  - Critério de pronto: RF-01/RF-02; suíte `formulario.test.tsx` verde
  - Confiança: 🟢

- [ ] T-05, `CalculadoraApp`: `EstadoResultado`, try/catch da fachada, mapeamento das 4 variantes, invalidação por edição, "Novo cálculo" por `key`
  - Origem no legado: `interface/calculadora/calculadora-app.tsx`
  - Critério de pronto: máquina de `../state-machines.md` §1 coberta por testes
  - Confiança: 🟢

- [ ] T-06, `Resultado`: ordem fixa (alertas → dose → fonte → revisão → disclaimer), condutas alternativas rotuladas, ritual de revisão, painel honesto (EC-07)
  - Origem no legado: `interface/calculadora/resultado.tsx`
  - Critério de pronto: RF-04/RF-05/RF-06; cenários Gherkin do `requirements.md`
  - Confiança: 🟢

- [ ] T-07 (dívida), Extrair subcomponentes do formulário (linha de glicemia, linha de aplicação) mantendo contrato e testes verdes
  - Origem no legado: `formulario.tsx` (532 LOC > limite 400)
  - Critério de pronto: nenhum arquivo > 400 LOC; suítes intactas
  - Confiança: 🟢

- [ ] T-08 (dívida), Substituir `let proximoId` módulo-global por gerador local ao componente (`useRef`/`useId`)
  - Origem no legado: `formulario.tsx:114`
  - Critério de pronto: ids estáveis sob StrictMode/HMR; testes intactos
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Integração do formulário: validação no blur, linhas dinâmicas, parse decimal, modos (`tests/integration/interface/formulario.test.tsx`)
- [ ] TT-02, Integração do resultado: 4 variantes, ordem fixa, ritual de revisão, invalidação (`resultado.test.tsx`)
- [ ] TT-03, Integração do relator: exceção → painel honesto + evento só com nome (`relator-de-erros.test.tsx` 🟢 verificado)
- [ ] TT-04 (adiado por decisão do usuário, 2026-07-19: "nada por enquanto"), e2e com Playwright + axe: privacidade (zero requests com dado clínico) e WCAG AA nos 2 viewports — permanece no backlog de dívidas

## Tarefas de Migração de Dados

n/a.

## Ordem Sugerida

1. T-01/T-02 (infra sem dependência de UI, paralelizáveis).
2. T-04 e T-06 após T-02; T-05 integra ambos; T-03 por fim (moldura).
3. T-07/T-08 (dívidas) só com suítes verdes — refactor sem mudança de comportamento.

## Lacunas Pendentes (🔴)

- Divergência 4 (glicemias por momento, 4 campos): reestrutura T-04 e quebra TT-01 — spec antes do código.
- TT-04 depende de recriar `playwright.config.ts` (existente no bundle antigo como referência).
