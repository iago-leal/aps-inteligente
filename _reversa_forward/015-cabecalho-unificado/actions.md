# Actions: Cabeçalho unificado entre home e calculadoras

> Identificador: `015-cabecalho-unificado`
> Data: `2026-07-23`
> Roadmap: `_reversa_forward/015-cabecalho-unificado/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 4 |
| Paralelizáveis (`[//]`) | 2 |
| Maior cadeia de dependência | 3 (T001 → T002/T003 → T004) |

Feature de **apresentação** (CSS + guarda de teste). Por proporcionalidade (Princípio VIII), a **Fase 1 (Preparação)** e a **Fase 5 (Polimento)** ficam vazias e são omitidas: não há scaffolding, migração ou telemetria; a atualização dos comentários-cabeçalho das folhas CSS acompanha as próprias edições do núcleo (T002/T003), não constitui ação separada.

## Fase 2, Testes

<!-- Guarda que deve FALHAR no estado atual (align-items divergente) e passar após o núcleo. TDD, Princípio VII. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Guarda geométrica nova: em viewport largo (1280px), medir o `boundingBox().y` do alternador de tema (`getByRole("button", name: /Ativar tema/)`) relativo ao topo do `.cabecalho` em `/` (home) e em `/dm2/insulina` (calculadora); asserir coincidência com tolerância ±2px (molde das guardas da feature 013). Deve **falhar** no código atual (RF-01/RF-02, D-04) | - | - | `e2e/cabecalho.spec.ts` | 🟡 | `[X]` |

## Fase 3, Núcleo

<!-- As duas edições de CSS que unificam o alinhamento. Arquivos distintos e independentes entre si → [//]. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Em `.cabecalho`, trocar `align-items: center` por `align-items: flex-start` como regra-única do alinhamento vertical, válida para as duas variantes; atualizar o comentário-cabeçalho da folha citando a feature 015 (RF-01) e a razão de ancorar ao topo (logo de 34px fixos, D-01) | T001 | `[//]` | `interface/estilos/cabecalho.css` | 🟢 | `[X]` |
| T003 | Remover o override `align-items: flex-end` da regra `.pagina[data-apresentacao="destaque"] .cabecalho`, mantendo intacto o restante do hero (h1 28px, subtítulo 14px, `gap` 6px, coluna de 328px, `borderColor-muted`); atualizar o comentário registrando que o alinhamento migrou para `cabecalho.css` e a variante `destaque` fica reduzida ao peso tipográfico (RF-03, D-02) | T001 | `[//]` | `interface/estilos/inicio.css` | 🟢 | `[X]` |

## Fase 4, Integração

<!-- Ajuste responsivo condicional: garantir que o alinhamento de topo não degrade os breakpoints. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Conferir os breakpoints (`cabecalho.css` @900px; `inicio.css` @544px) sob o novo alinhamento de topo e, se o respiro superior encostar os ícones na borda ou o `flex-wrap` quebrar mal, ajustar apenas o padding/gap vertical dessas media queries — sem reintroduzir `align-items` por variante nem tocar a tipografia; confirmar que a guarda de alinhamento à coluna do corpo (013) e o `axe-baseline` 0/0 seguem verdes (RF-02/RF-04, roadmap §9) | T002, T003 | - | `interface/estilos/cabecalho.css` | 🟡 | `[X]` |

## Notas de execução

- **2026-07-23 (`/reversa-coding`):** 4/4 ações concluídas, nenhuma falha.
- **TDD (T001):** a guarda geométrica nova falhou por **41,5px** no estado bifurcado (`center` × `flex-end`) e passou após o núcleo — validação e regressão fechadas.
- **Núcleo (T002/T003):** bloco `[//]` executado em arquivos distintos — `cabecalho.css` (`align-items: flex-start` único) e `inicio.css` (override `flex-end` removido, hero preservado).
- **Integração (T004):** breakpoints (@900px / @544px) conferidos — herdam `flex-start`, nenhuma reintroduz `align-items`; e2e móvel (375px) sem transbordo e axe base zero → **nenhum ajuste necessário**.
- **Suíte verde:** vitest **423/423**, e2e **25/25** (guarda nova + guardas 013 + axe 0/0), lint e typecheck limpos.
- **Escopo negativo:** `moldura.tsx` byte a byte intocada (`git diff` vazio, D-03); sem cor literal; folhas < 400 linhas (cabecalho 127, inicio 193).
- **Estético:** capturas antes/depois geradas no scratchpad (home/calculadora, largo/estreito, claro/escuro) — pende aprovação do mantenedor antes do commit.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-07-23 | 4/4 ações executadas por `/reversa-coding`; suíte verde; `legacy-impact.md` e `regression-watch.md` gerados | reversa |
