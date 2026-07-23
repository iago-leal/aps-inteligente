# Regression watch — 004-estilo-primer-nas-telas

> Feature: `004-estilo-primer-nas-telas` (2026-07-21)
> Watch items derivados da seção "Modificadas" do `legacy-impact.md`. Regras que eram 🟡/🔴 na extração ficam em "Observações", sem peso de regressão.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|------------------------------|----------------------|--------------------|
| W001 | `_reversa_sdd/addenda/001-integrar-design-claude.md` (design aprovado); RN-05 do requirements | A fonte visual canônica é o **Primer**; os tokens do design Claude (paleta verde-clínica `#0e5f53` etc., IBM Plex via `next/font`) **não existem** no código, e nenhum artefato novo os cita como fonte de estilo | ausência | Qualquer hexadecimal da paleta antiga ou import de `next/font` reaparecendo em `interface/**` ou `pages/**`; artefato novo citando o Claude Design como autoridade |
| W002 | `_reversa_sdd/dependencies.md#runtime` | Runtime contém exatamente Next/React/pg + `@primer/react` e `@primer/primitives` **pinados**; `@primer/css` e `@primer/view-components` ausentes de todo o manifesto (RN-03) | presença + ausência | Range (`^`/`~`) nas deps do Primer; pacote vetado em qualquer seção; dependência de UI adicional sem decisão registrada |
| W003 | `_reversa_sdd/architecture.md#6`, dívida 4 | `interface/estilos/globais.css` < 400 linhas, sem cor própria (só `var(--*)` do Primer) | redação | `wc -l` ≥ 400; hexadecimal/rgb próprio no arquivo |
| W004 | `_reversa_sdd/architecture.md#5` (e2e 🔴) + dívida 3 | `npm run test:e2e` roda Playwright com verificação axe contra o build de produção; `e2e/axe-baseline.json` vigente com linha de base ≤ {inicial: 1, comResultado: 1} e contagem real atual **0** | presença | Script quebrado de novo; spec e2e sem `AxeBuilder`; baseline afrouxada para acomodar regressão |
| W005 | `_reversa_sdd/state-machines.md#3-tema`; RN-04 | Preferência de tema: chave `aps-inteligente:tema`, valores `claro`/`escuro`, fonte de verdade `preferencia-de-tema.ts`; o Primer é só consumidor via `provedor-tema.tsx` | redação | Chave/valores novos no localStorage; componente lendo tema fora do contrato; perda da degradação graciosa |
| W006 | `_reversa_sdd/addenda/002` (cabeçalhos vigiados); D-09 | `next.config.ts` com a **mesma CSP** (`style-src 'self' 'unsafe-inline'`, `font-src 'self'`…); único acréscimo da feature é `transpilePackages: ["@primer/react"]`; e2e prova zero requisições externas | redação + presença | Diretiva CSP afrouxada "por causa do estilo"; requisição externa no e2e de privacidade |
| W007 | `_reversa_sdd/code-analysis.md#módulo-2`; RF-02 | Comportamento da UI idêntico sob a pele nova: `EstadoResultado`, validação espelhada via `CONSTANTES`, ritual de revisão, textos clínicos byte a byte; mensagens de erro com `role="alert"` (`erro-de-campo.tsx`) | presença | Asserção comportamental de teste alterada para "passar"; texto clínico divergente; perda do `role="alert"` |
| W008 | `_reversa_sdd/architecture.md#1` (ADR 0003); RN-01 | `models/insulina/**` sem nenhuma alteração decorrente de estilo; dependência unidirecional `pages → interface → models` preservada | ausência | Import de `@primer/*` em `models/**`; qualquer diff em `models/**` atribuído a esta feature |

## Observações (sem peso de regressão)

- **O-01 (gate D-08 em aberto):** first load 126,3 → 279,1 kB gzip (**+152,8 kB**, limiar 100). T013 bloqueada; a decisão do usuário (aceitar/mitigar/reverter) deve ser registrada no roadmap. Enquanto pendente, o número não é regra — é decisão em curso.
- **O-02 (origem 🟡 da compatibilidade):** peers do `@primer/react` verificados via npm em 2026-07-21 (`react 18.x || 19.x`); revalidar no próximo upgrade de React/Next.
- **O-03 (infra de teste):** `server.deps.inline` no vitest e stub de localStorage no jsdom são acomodações de runner, não contrato do produto.
- **O-04 (acessibilidade melhorou):** violações axe 1 → 0 nos dois estados; se a linha de base for atualizada para 0, atualizar `e2e/axe-baseline.json` por decisão, nunca silenciosamente.

## Histórico de re-extrações


### Re-extração 2026-07-23 21:40 (nº 3 — absorve features 011–014)

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W002 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W003 | 🟢 verde | dívida ENCERRADA: `globais.css` agora 364 linhas (< 400) após consolidação da família `.cabecalho*` em `cabecalho.css` (features 011/013); era 🟡 na re-extração 2 |
| W004 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W005 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W006 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W007 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W008 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
### Re-extração 2026-07-23 14:10

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | paleta Claude antiga (`#0e5f53`) e `next/font`/IBM Plex ausentes de `interface/**` e `pages/**` (grep); nenhum artefato cita o Claude Design como autoridade |
| W002 | 🟢 verde | `@primer/react` 38.33.0, `@primer/primitives` 11.9.0, `@primer/octicons-react` 19.29.2 **pinados** (sem `^`/`~`); `@primer/css` e `@primer/view-components` ausentes do manifesto |
| W003 | 🟡 amarelo | `interface/estilos/globais.css` em **exatamente 400 linhas** — no teto, não abaixo dele; o sinal "`wc -l ≥ 400`" toca o limite. Sem cor própria (só `var(--*)`, grep confirma). Dívida 🟡 já documentada (`gaps.md`), não regressão de conteúdo. **Recomendação:** extrair layout base do cabeçalho de `globais.css` para folha própria e voltar a < 400 |
| W004 | 🟢 verde | `e2e/axe-baseline.json` vigente; contagem real atual 0 (specs de interface: axe 0/0) |
| W005 | 🟢 verde | chave `aps-inteligente:tema`, valores claro/escuro, `preferencia-de-tema.ts` fonte de verdade; Primer consumidor via `provedor-tema.tsx` (`domain.md` §6, `state-machines.md`) |
| W006 | 🟢 verde | CSP inalterada em `next.config`; único acréscimo `transpilePackages: ["@primer/react"]` (grep) |
| W007 | 🟢 verde | comportamento idêntico sob a pele nova: `EstadoResultado`, validação via `CONSTANTES`, ritual; `erro-de-campo.tsx` (14 LOC) preserva `role="alert"` |
| W008 | 🟢 verde | sem `@primer/*` em `models/**` (grep); `models/insulina/**` intocado |

## Arquivadas

_Vazio._
