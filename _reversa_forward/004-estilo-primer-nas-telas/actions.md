# Actions: Primer como base de estilo das telas da plataforma

> Identificador: `004-estilo-primer-nas-telas`
> Data: `2026-07-21`
> Roadmap: `_reversa_forward/004-estilo-primer-nas-telas/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 15 |
| Paralelizáveis (`[//]`) | 2 |
| Maior cadeia de dependência | 14 (T001 → T014) |

A cadeia longa é intencional: o plano de migração do roadmap (§8) exige linha de base antes da fundação e migração estrangulada componente a componente, cada passo validado pelo oráculo de testes do anterior. Paralelizar aqui seria trocar segurança por velocidade sem ganho real.

## Fase 1, Preparação

Linha de base e fundação de dependências — nada visual muda nesta fase.

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Criar `playwright.config.ts` (projeto chromium, `webServer` contra o build de produção) e corrigir o script `test:e2e` do `package.json`, quitando a parte e2e da dívida técnica nº 3 (D-07) | - | - | `playwright.config.ts` | 🟢 | `[X]` |
| T002 | Escrever a spec e2e da calculadora com verificação axe: fluxo completo de cálculo (caso válido de início), alternância de tema com persistência após recarga, e varredura `@axe-core/playwright` da tela (D-07, RF-05) | T001 | - | `e2e/calculadora.spec.ts` | 🟢 | `[X]` |
| T003 | Capturar a linha de base sobre a tela atual: `next build` (first load gzip da página da calculadora) e `test:e2e` (contagem de violações axe); registrar ambas em `baseline.md` na pasta da feature (D-07, D-08) | T002 | - | `_reversa_forward/004-estilo-primer-nas-telas/baseline.md` | 🟢 | `[X]` |
| T004 | Instalar e pinar `@primer/react@38.33.0` e `@primer/primitives` (versão exata resolvida, sem ranges), lockfile commitado; confirmar na doc do v38 os caminhos de import do CSS de temas (resolve o 🟡 do D-02); conferir ausência dos pacotes vetados `@primer/css` e `@primer/view-components` (D-01, RN-03) | T003 | - | `package.json` | 🟡 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Escrever teste de integração do adaptador de tema: `claro`/`escuro` de `preferencia-de-tema.ts` mapeados para o color mode do Primer, chave `as-is` `aps-inteligente:tema` preservada, degradação graciosa com storage bloqueado (D-03, RN-04) | T004 | - | `tests/integration/adaptador-de-tema.test.tsx` | 🟢 | `[X]` |

## Fase 3, Núcleo

Migração estrangulada: após cada ação, as 3 suítes de integração da UI devem passar ajustando apenas seletores, nunca asserções comportamentais (RF-02).

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T006 | Fundação no shell: `ThemeProvider` + `BaseStyles` + import do CSS de temas do primitives em `pages/_app.tsx`, com o adaptador de tema ligando `preferencia-de-tema.ts` ao `colorMode` (SSR nasce claro, como hoje); a tela antiga continua estilizada pelo CSS legado em coexistência transitória (D-02, D-03) | T005 | - | `pages/_app.tsx` | 🟡 | `[X]` |
| T007 | Migrar `tela.tsx` para componentes Primer: cabeçalho, selo "Nada é salvo nem enviado" e alternador de tema (D-05) | T006 | - | `interface/calculadora/tela.tsx` | 🟢 | `[X]` |
| T008 | Migrar `resultado.tsx`: alertas (`Flash`), painel de conduta, checkbox do ritual de revisão e bloco "Pronto para prescrever", preservando a ordem fixa alertas → dose → fonte → revisão → disclaimer e a máquina `EstadoResultado` (D-05) | T007 | - | `interface/calculadora/resultado.tsx` | 🟢 | `[X]` |
| T009 | Migrar `formulario.tsx`: campos (`FormControl`/`TextInput`), botões e mensagens de validação no blur, mantendo a validação espelhada via `CONSTANTES` e o reset por remontagem (D-05) | T008 | - | `interface/calculadora/formulario.tsx` | 🟢 | `[X]` |
| T010 | Migrar os subcomponentes do formulário: `glicemias-por-momento.tsx`, `antidiabeticos-orais.tsx` e `esquema-atual.tsx` (D-05) | T009 | - | `interface/calculadora/glicemias-por-momento.tsx` (+2 correlatos) | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T011 | Remover IBM Plex Sans/Mono (`next/font`) do `_app.tsx` e as variáveis `--fonte-texto`/`--fonte-dados`; valem as pilhas de fonte do Primer (D-04, RN-05) | T010 | - | `pages/_app.tsx` | 🟢 | `[X]` |
| T012 | Reduzir `globais.css` a resíduo: remover tokens do design superado (paleta verde-clínica) e regras cobertas por componentes Primer; resultado < 400 linhas (`wc -l`), quitando a dívida técnica nº 4 (D-06, RF-04) | T011 | - | `interface/estilos/globais.css` | 🟢 | `[X]` |
| T013 | Verificação integrada final: suíte completa (`npm test`), contrato (`test:api`, CSP verde sem mudança em `next.config.ts` — D-09), e2e com axe ≤ linha de base, e `next build` com delta de bundle medido contra `baseline.md`; **delta > 100 kB gzip interrompe e reabre o roadmap como decisão** (D-08) | T012 | - | `_reversa_forward/004-estilo-primer-nas-telas/baseline.md` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T014 | Atualizar o README: diretriz de como criar tela nova com o padrão Primer (provider já no shell, componentes, tema) e roteiro de verificação de saúde incluindo `test:e2e` (RF-01) | T013 | `[//]` | `README.md` | 🟢 | `[X]` |
| `[//]` T015 | Consolidar o relatório da feature: medições antes/depois (bundle e axe) e registro de que o projeto Claude Design está superado e arquivado como referência histórica, sem autoridade de estilo (RN-05, D-08) | T013 | `[//]` | `_reversa_forward/004-estilo-primer-nas-telas/relatorio.md` | 🟢 | `[X]` |

## Notas de execução

- **T013: gate do D-08 disparou e foi resolvido pelo usuário (delta aceito — D-10 do roadmap).** Delta de bundle: 126,3 → 279,1 kB gzip (**+152,8 kB**, acima do limiar de 100 kB do esclarecimento 4). Todo o resto da verificação integrada passou: suíte 193/193, contrato 16/16 (CSP idêntica), e2e 4/4, axe **0** violações (linha de base era 1), lint/typecheck limpos, cobertura de domínio 98,7%. Mitigação tentada sem efeito: `experimental.optimizePackageImports` (Turbopack já poda o barrel; revertida por inócua).
- `next.config.ts` ganhou `transpilePackages: ["@primer/react"]` — diretiva de bundling exigida pelos imports internos de `.css` do pacote. A **CSP permaneceu byte a byte idêntica** (substância do D-09 preservada; o teste de contrato confirma).
- Componente novo fora do plano: `interface/calculadora/erro-de-campo.tsx` (`ErroDeCampo`), extraído para evitar import circular entre `formulario.tsx` e os subcomponentes; preserva o contrato `role="alert"` asserido pelas suítes.
- `vitest.config.ts` ganhou `server.deps.inline: [/@primer\//]` (o ESM do Node não importa os `.css` internos do pacote nos testes).
- O jsdom 29 não implementa `localStorage`; o teste do adaptador instala stub em memória (mesmo contrato), inclusive o caso de storage bloqueado.
- Nenhuma asserção comportamental de teste foi alterada em toda a migração (critério do RF-02): as 3 suítes de integração da UI e a suíte e2e passaram intocadas.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-21 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-07-21 | Execução T001–T012 concluída; T013 bloqueada pelo gate de bundle (D-08) | reversa |
| 2026-07-21 | Gate resolvido pelo usuário (delta aceito, D-10); T013 concluída; T014/T015 executadas | reversa (decisão: iago) |
