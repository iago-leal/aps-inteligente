# Actions: Estrutura do cabeçalho da home unificada com a das calculadoras

> Identificador: `016-estrutura-cabecalho-home`
> Data: `2026-07-23`
> Roadmap: `_reversa_forward/016-estrutura-cabecalho-home/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 11 |
| Paralelizáveis (`[//]`) | 8 |
| Maior cadeia de dependência | 4 (T001 → T004 → T005 → T010) |

> **Fase 1 (Preparação) omitida** por proporcionalidade (Princípio VIII): a feature não introduz dependência, scaffolding, migração nem configuração de infraestrutura.
>
> **Bloco atômico de contrato:** T004 (remover `logoComoTitulo` / adicionar `comInicio`) e seus pontos de uso T005 (home) e T006 (calculadoras) devem ser executados juntos antes de rodar a suíte — isolados, deixam a árvore num estado de tipos quebrado (home passando prop inexistente; calculadoras sem o ⌂).

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Reescrever os casos de `tests/integration/interface/moldura.test.tsx` que assumiam `logoComoTitulo`: a logo é **sempre** marca decorativa (`aria-hidden`, `alt=""`) fora do `h1`; o `h1` é textual e seu nome acessível é o `titulo`; o comando de início aparece com `comInicio` e some sem ele (RF-02/RF-03/RF-04) | - | `[//]` | `tests/integration/interface/moldura.test.tsx` | 🟢 | `[X]` |
| T002 | Guarda de altura e2e: medir `boundingBox().height` de `.cabecalho` nas cinco rotas (`/`, `/dm2/insulina`, `/pre-natal/idade-gestacional`, `/cardiologia/dor-toracica`, `/cardiologia/risco-cardiovascular`) na mesma viewport e exigir coincidência (±2px), com mensagem que aponte a primeira tela divergente (RF-01/RF-06) | - | `[//]` | `e2e/cabecalho.spec.ts` | 🟢 | `[X]` |
| T003 | Guarda negativa: teste que lê `cabecalho.css` e `inicio.css` e falha se houver `height`/`min-height` no bloco do seletor `.cabecalho` (impede reintrodução de altura chumbada, RF-01, caso negativo) | - | `[//]` | `tests/unit/interface/cabecalho-sem-altura-fixa.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | `Moldura`: remover a prop `logoComoTitulo` (interface e ramo de render); a identidade passa a ser única — marca decorativa (`aria-hidden`, 34px) + `h1` textual (`{titulo}`) + subtítulo + selo; adicionar `comInicio?: boolean` (default `false`) que governa a presença do `IconButton` de início; atualizar o comentário-cabeçalho citando a feature 016 (D-01/D-02/D-03; RF-02/RF-03/RF-04) | T001 | - | `interface/comum/moldura.tsx` | 🟢 | `[X]` |
| T005 | Home: montar a `Moldura` sem `logoComoTitulo` e sem `comInicio` (herda a identidade de três blocos; `h1` textual "APS Inteligente"); manter `apresentacao="destaque"` (RF-02/RF-04) | T004 | `[//]` | `interface/inicio/tela.tsx` | 🟢 | `[X]` |
| T006 | Calculadoras: declarar `comInicio` na `Moldura` das quatro telas, preservando o comando de início antes derivado de `!logoComoTitulo` (mesma edição mecânica, coesa; regra 11 de `domain.md#7.2`) (RF-03) | T004 | `[//]` | `interface/{calculadora,cardiologia,gestacao,risco-cardiovascular}/tela.tsx` | 🟢 | `[X]` |
| T007 | `inicio.css`: remover a tipografia do hero da variante `destaque` (`gap:6px`; `h1` 28/24px; subtítulo 14px + `max-width:60ch`); manter apenas o padding da coluna de 720px e a borda `muted` (D-04; RF-05) | - | `[//]` | `interface/estilos/inicio.css` | 🟢 | `[X]` |
| T008 | `cabecalho.css`: remover a regra órfã `.cabecalho-identidade h1 .cabecalho-logo` (a logo-como-wordmark deixa de existir com T004) (RF-05) | T004 | `[//]` | `interface/estilos/cabecalho.css` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T009 | Atualizar em `e2e/plataforma.spec.ts` o caso que hoje casa `.cabecalho-identidade h1 .cabecalho-logo` na home: passar a verificar a identidade unificada (marca decorativa + `h1` textual com nome acessível "APS Inteligente") (RF-02/RF-04) | T004, T005 | - | `e2e/plataforma.spec.ts` | 🟢 | `[X]` |
| T010 | Subtítulo da home (D-06): rodar a guarda de altura (T002); se a home divergir por o subtítulo quebrar em duas linhas na coluna de 720px, encurtar o texto do subtítulo em `interface/inicio/tela.tsx` para uma versão enxuta que caiba em uma linha; se couber, manter o texto atual (premissa §9) | T002, T005, T007 | - | `interface/inicio/tela.tsx` | 🟡 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T011 | Atualizar no `README.md` a menção a `logoComoTitulo` (a home não usa mais logo-como-`h1`): descrever a identidade unificada e a prop `comInicio` (Princípio VI — a doc não pode mentir sobre o contrato) | T004 | `[//]` | `README.md` | 🟢 | `[X]` |

## Notas de execução

- **T010 (D-06) resolvido por medição, sem edição.** A guarda de altura mediu `.cabecalho` = **209px na home e nas quatro calculadoras** (viewport 1280px), coincidência exata. Com a tipografia padrão (12px) e sem `max-width:60ch`, o subtítulo atual da home coube em **uma linha** na coluna de 720px — a premissa 🟡 se confirmou, e o texto do subtítulo permaneceu intacto.
- **Ajuste de robustez em T009.** O teste legado RF-07 (tamanho da logo home×calc) usava `.evaluate` logo após `goto`, sem auto-esperar o layout; na home mediu 0px numa corrida de paint. Adicionado `await expect(.cabecalho-marca).toBeVisible()` antes de cada medição. É adaptação de teste (não muda comportamento do app).
- **Suíte verde:** typecheck + lint limpos; vitest **424/424**; Playwright **31/31** (guarda de altura nova + guardas 011/013/015 + axe 0/0).

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-07-23 | 11/11 ações concluídas por `/reversa-coding`; suíte verde (424 vitest, 31 e2e) | reversa-coding |
