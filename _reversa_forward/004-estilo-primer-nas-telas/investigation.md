# Investigation: Primer como base de estilo das telas da plataforma

> Identificador: `004-estilo-primer-nas-telas`
> Data: `2026-07-21`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Pergunta de fundo

Como adotar um design system mantido por terceiros sem violar as duas restrições estruturais do projeto: privacidade por arquitetura (nenhum recurso externo em runtime, CSP sem terceiros — ADR 0002, RN-02) e reprodutibilidade temporal (versões pinadas, lockfile, filtro de longevidade do Princípio nº 3 global)?

## 2. Estado do ecossistema Primer (verificação de 2026-07-21)

| Pacote | Situação | Veredito |
|---|---|---|
| `@primer/react` | Ativo; **v38.33.0** no npm (release recente); migração para CSS Modules concluída na linha v38, styled-components removido das dependências | 🟢 Via de adoção |
| `@primer/primitives` | Ativo; consumido pelo `@primer/react` na faixa `10.x \|\| 11.x`; entrega os tokens e o CSS de temas (light/dark) | 🟢 Entra como dependência direta pinada |
| `@primer/css` | Modo KTLO ("keep the lights on") declarado pelo GitHub | 🔴 Vetado (RN-03) |
| `@primer/view_components` | Manutenção, foco Rails/ViewComponent | 🔴 Vetado (RN-03): stack incompatível |
| `@primer/octicons-react` | Dependência transitiva do `@primer/react` (`^19.28.1`) | 🟢 Vem no pacote; ícones sem fetch |

### Compatibilidade verificada (npm view, 2026-07-21)

- `peerDependencies` do `@primer/react@38.33.0`: `react 18.x || 19.x`, `react-dom 18.x || 19.x`, `@types/react 18.x || 19.x` — o repo pina React 19.2.4 e `@types/react` 19.2.17: **dentro da faixa**. 🟢
- Next.js 16 Pages Router: o Primer React é framework-agnóstico (biblioteca React pura); o bootstrap no `_app.tsx` é o padrão documentado para Pages Router. 🟢
- Dependências transitivas relevantes para o RNF de desempenho: `@tanstack/react-virtual`, `@oddbird/popover-polyfill`, `@github/relative-time-element`, `focus-visible`, `octicons`. Nenhuma faz requisição de rede em runtime; todas entram pelo bundle. Peso total é a incógnita que o D-08 mede em vez de estimar. 🟡
- CSP vigente (`next.config.ts`): `style-src 'self' 'unsafe-inline'`, `font-src 'self'`, `connect-src 'self'`. CSS estático empacotado satisfaz `'self'`; o `'unsafe-inline'` já presente cobre atributos de estilo; identidade tipográfica do Primer usa pilha do sistema, então `font-src` fica sem uso novo. **Nenhuma mudança de CSP necessária.** 🟢

## 3. Alternativas avaliadas

| Alternativa | Descrição | Por que foi descartada |
|---|---|---|
| Primer tematizado com os tokens do Claude Design | Componentes Primer por baixo, paleta verde-clínica e IBM Plex por cima | Descartada no esclarecimento 1: o usuário decidiu identidade Primer **integral**; o híbrido manteria dois donos da verdade visual |
| Só tokens/primitives, componentes próprios | Importar `@primer/primitives` e continuar estilizando à mão | Descartada no esclarecimento 3: não reduz o CSS próprio (a Demanda), só troca os valores das variáveis |
| `@primer/css` (CSS utilitário) | Classes CSS sem React | Vetada pela RN-03: modo KTLO fere o filtro de longevidade |
| Outro design system (Radix Themes, Mantine, shadcn/ui) | Alternativas maduras do ecossistema React | Fora do escopo do requirements: a Demanda validada nomeia o Primer; reabrir a escolha do sistema exigiria voltar à clarificação (Princípio III) |
| Manter o CSS artesanal e só fatiar o arquivo | Dividir `globais.css` em módulos < 400 linhas | Resolveria a métrica, não o problema: cada tela futura continuaria exigindo componentes visuais do zero |

## 4. Padrões aplicáveis

- **Provider único no shell** (`_app.tsx`): mesmo padrão já usado para fontes e CSS global; a fundação de estilo muda de conteúdo, não de lugar.
- **Adapter sobre estado externo**: `preferencia-de-tema.ts` (fonte externa via `useSyncExternalStore`) permanece; o color mode do Primer vira mero consumidor — baixo acoplamento entre a preferência persistida e a biblioteca de UI, substituível sem quebrar o resto.
- **Strangler visual por componente**: migração incremental com o oráculo de testes verde a cada passo (D-05), em vez de big-bang.
- **Baseline-first para não-regressão**: harness e2e + axe e medição de bundle capturados **antes** da primeira mudança visual, únicos juízes objetivos de "não regrediu" (RF-05, D-08).

## 5. Fontes externas

- https://primer.style — portal do design system (GitHub)
- https://primer.style/product/getting-started/react/ — bootstrap do Primer React (ThemeProvider, BaseStyles, primitives)
- https://www.npmjs.com/package/@primer/react — versões e metadados (v38.33.0 verificada via `npm view` em 2026-07-21)
- https://github.com/primer/react/releases — notas da linha v38 (migração CSS Modules, redução de bundle)
- https://github.com/primer/css — aviso de KTLO
- https://playwright.dev/docs/accessibility-testing — padrão oficial Playwright + axe-core usado no harness do RF-05

## 6. Lacunas remanescentes da investigação

- 🟡 Caminhos exatos de import do CSS de temas do `@primer/primitives` na combinação v38 + primitives 10/11: confirmar contra a doc no primeiro passo do coding (falha de import quebra o build, nunca silenciosamente).
- 🟡 Delta real de bundle: incognoscível antes da medição; tratado pelo D-08 (medir, registrar, limiar de 100 kB gzip reabre decisão).
