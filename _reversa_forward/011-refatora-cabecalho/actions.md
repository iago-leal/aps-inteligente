# Actions: Refatoração do cabeçalho — toggle icônico e navegação de retorno

> Identificador: `011-refatora-cabecalho`
> Data: `2026-07-23`
> Roadmap: `_reversa_forward/011-refatora-cabecalho/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 8 |
| Paralelizáveis (`[//]`) | 3 |
| Maior cadeia de dependência | 4 (T003 → T005 → T006 → T007) |

## Fase 1, Preparação

Sem scaffolding: dependências (`@primer/react`, `@primer/octicons-react`) já pinadas; nenhuma migração. Fase vazia.

## Fase 2, Testes

<!-- TDD: as asserções refletem a spec antes/junto ao núcleo. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Em `moldura.test.tsx`, atualizar o caso do alternador para afirmar o toggle icônico: botão com nome acessível casando `/tema/i` (rótulo "Ativar tema claro/escuro") e ausência do texto "Tema claro"/"Tema escuro" | - | `[//]` | `tests/integration/interface/moldura.test.tsx` | 🟢 | `[X]` |
| T002 | Em `moldura.test.tsx`, reescrever a asserção de links da 009 (D-06): sem `logoComoTitulo` (calculadora) a logo segue não-link E existe um link "Início" para `/`; com `logoComoTitulo` (home) não há comando de início | T001 | - | `tests/integration/interface/moldura.test.tsx` | 🟢 | `[X]` |
| T003 | Nos e2e, atualizar os seletores do toggle de `"Tema escuro"`/`"Tema claro"` para os novos rótulos `"Ativar tema escuro"`/`"Ativar tema claro"` | - | `[//]` | `e2e/calculadora.spec.ts` | 🟢 | `[X]` |
| T004 | Em `plataforma.spec.ts`, atualizar o seletor do toggle e adicionar cenário: numa calculadora, acionar o comando "Início" navega para `/`; e a home não expõe o comando | T003 | - | `e2e/plataforma.spec.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Substituir o `Button` textual do tema por `IconButton` (`@primer/react`) com `icon` sol/lua pelo tema-alvo (`SunIcon` no escuro, `MoonIcon` no claro) e `aria-label` "Ativar tema claro/escuro"; preservar o `onClick` que chama `gravarTema` | T002, T004 | - | `interface/comum/moldura.tsx` | 🟢 | `[X]` |
| T006 | Adicionar o comando de início como `IconButton` com `HomeIcon`, renderizado por `next/link` (`href="/"`), `aria-label="Início"`, exibido apenas quando `logoComoTitulo` for falso | T005 | - | `interface/comum/moldura.tsx` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Em `cabecalho.css`, estilizar os controles icônicos (alinhamento na zona de ações, tamanho consistente do início e do toggle) sobre tokens Primer, sem cor própria; garantir responsivo ≤ 900px | T006 | - | `interface/estilos/cabecalho.css` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Atualizar o comentário-cabeçalho de `moldura.tsx` documentando a feature 011 (toggle icônico D-01/D-02; comando de início condicional D-03/D-04) | T006 | `[//]` | `interface/comum/moldura.tsx` | 🟢 | `[X]` |

## Notas de execução

- **Trabalho emergente (infra de teste):** o `IconButton` do `@primer/react` renderiza um `TooltipV2`, cujo popover-polyfill (`@oddbird`) faz `[...root.adoptedStyleSheets]` — não implementado no jsdom, quebrando todo render de IconButton nos testes de integração. Adicionado `tests/apoio/setup-jsdom.ts` (polyfill de `adoptedStyleSheets` como array gravável, no-op em env node) e registrado em `setupFiles` do `vitest.config.ts`. No navegador real o tooltip funciona; os e2e o exercem.
- **Dívida evitada (teto de 400 linhas):** os dois cenários e2e novos empurraram `plataforma.spec.ts` de 392 para 416 linhas. Extraídos para `e2e/cabecalho.spec.ts` (spec coeso do cabeçalho); `plataforma.spec.ts` voltou a 392. Nenhum arquivo tocado > 400.
- **Verificação:** typecheck ✓, lint ✓, 378 unidade/integração ✓, 16 contrato ✓ (`/api/v1/status` byte a byte), 23 e2e ✓ (axe-baseline preservada). `git diff` de `models/`, `interface/inicio/catalogo.ts` e `pages/api` vazio.
- **Incidente de ambiente:** um `next-server` stale (build antigo) ocupava a porta 3000 e foi reusado pelo Playwright na 1.ª rodada (18 falsos negativos). Encerrado; e2e re-rodados do build fresco, 23/23.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-to-do` | reversa |
