# Legacy impact — 004-estilo-primer-nas-telas

> Data: 2026-07-21
> Cenário: legado (âncora: `_reversa_sdd/architecture.md` + `domain.md`)
> Execução parcial: T001–T012 concluídas; T013 bloqueada pelo gate de bundle (D-08); T014/T015 pendentes de decisão.

## Arquivos afetados

| Arquivo afetado | Componente (extração) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `package.json` / `package-lock.json` | `dependencies.md#runtime` | componente-novo | MEDIUM | Primeiras dependências de UI de terceiro: `@primer/react@38.33.0` + `@primer/primitives@11.9.0`, pinadas; vetados (`@primer/css`, `view_components`) ausentes (RN-03) |
| `pages/_app.tsx` | `code-analysis.md#módulo-3--pages-shell-nextjs` | regra-alterada | MEDIUM | Shell agora importa os CSS do primitives e envolve tudo em `ProvedorTemaPrimer`; IBM Plex (`next/font`) e variáveis `--fonte-*` removidas (D-04, RN-05) |
| `interface/calculadora/provedor-tema.tsx` | novo, ao lado de `preferencia-de-tema.ts` | componente-novo | LOW | Adaptador `preferencia-de-tema` → `ThemeProvider`/`BaseStyles` do Primer; a fonte de verdade do tema não mudou (RN-04) |
| `interface/calculadora/tela.tsx` | `code-analysis.md#módulo-2` (moldura) | regra-alterada | LOW | Recomposição com `Heading`/`Text`/`Label`/`Button`; textos, `data-tema` e alternância intactos |
| `interface/calculadora/resultado.tsx` | `code-analysis.md#módulo-2` (painel) | regra-alterada | MEDIUM | Recomposição com `Flash`/`Checkbox`/`FormControl`/`Heading`/`Text`/`Button`; ordem fixa, `EstadoResultado`, ritual de revisão e todos os textos clínicos byte a byte |
| `interface/calculadora/formulario.tsx` | `code-analysis.md#módulo-2` (formulário) | regra-alterada | MEDIUM | Campos em `FormControl`/`TextInput`/`Select`/`RadioGroup`; validação espelhada via `CONSTANTES`, blur e remontagem por `key` intactos |
| `interface/calculadora/{antidiabeticos-orais,glicemias-por-momento,esquema-atual}.tsx` | `code-analysis.md#módulo-2` (subcomponentes da feature 001) | regra-alterada | MEDIUM | Mesma recomposição; rótulos e mensagens de validação idênticos |
| `interface/calculadora/erro-de-campo.tsx` | novo | componente-novo | LOW | `ErroDeCampo` único (`role="alert"`), extraído para evitar import circular |
| `interface/estilos/globais.css` | `architecture.md#6-dívidas-técnicas` (dívida 4) | componente-extinto (identidade) / regra-alterada (arquivo) | HIGH | 699 → 397 linhas; tokens do design Claude removidos por completo; resíduo é cola de layout 100% sobre `var(--*)` do Primer (RN-05, RF-04) |
| `next.config.ts` | `addenda/002` (cabeçalhos vigiados) | regra-alterada | MEDIUM | Apenas `transpilePackages: ["@primer/react"]`; **CSP e cabeçalhos byte a byte idênticos**, confirmados pelo teste de contrato (D-09) |
| `playwright.config.ts` + `e2e/` | `architecture.md#5` (e2e 🔴 ausente) | componente-novo | MEDIUM | Nasce o nível e2e da pirâmide: fluxo, tema, privacidade de rede e axe contra linha de base versionada (`e2e/axe-baseline.json`) |
| `vitest.config.ts` | `architecture.md#5` (testes) | regra-alterada | LOW | `server.deps.inline` para os `.css` internos do Primer nos testes |
| `tests/integration/interface/provedor-tema.test.tsx` | suíte de integração da UI | componente-novo | LOW | 5 casos do adaptador de tema, incluindo chave invariante e storage bloqueado |

## Diff conceitual por componente

**Shell (`pages`).** O bootstrap de estilo trocou de dono: saem as fontes IBM Plex e o CSS artesanal como identidade, entram os tokens do Primer (bundle próprio) e o par `ThemeProvider`+`BaseStyles` via `ProvedorTemaPrimer`. Nenhuma fonte é mais baixada — a tipografia é a pilha do sistema do Primer.

**UI da calculadora (`interface/calculadora`).** Recomposição puramente visual: todos os elementos estilizados à mão viraram componentes `@primer/react`. Máquina `EstadoResultado`, flags `desatualizado`/`revisaoConfirmada`, validação espelhada, parsing por momento, `derivaTipoEsquema`, `RelatorDeErros` e todos os textos clínicos permanecem idênticos — as 10 suítes (unidade+integração) e a e2e passaram **sem alteração de uma única asserção**.

**Estilo (`interface/estilos`).** `globais.css` deixou de ser identidade visual e virou resíduo de layout: grid da página, cartões e espaçamentos, todas as cores por variável funcional do Primer (zero hexadecimal próprio). A autoridade de estilo agora é externa (Primer), reduzindo o CSS sob manutenção do dono do projeto em ~43%.

**Domínio (`models/insulina`).** Intocado (RN-01) — nenhum arquivo alterado.

**Contratos externos.** Nenhum: `GET /api/v1/status` e cabeçalhos de segurança inalterados (contrato 16/16 verde).

## Preservadas (regras 🟢 do domain.md que continuam intactas)

- Todas as regras clínicas do motor (§3.1–3.4: início, titulação, intensificação, metformina/TFG, sulfonilureia, validação, severidade) — `models/**` sem diff.
- Regra 23 (§3.5): espelhamento de faixas na UI via `CONSTANTES` — mantido literalmente no código migrado.
- RN-06/EC-03: edição invalida resultado e desfaz revisão — asserido por integração e e2e.
- EC-07: painel honesto de falha inesperada com evento anônimo — mantido (`Flash` apenas re-estiliza).
- MD-0011 (§6): nenhum dado clínico fora do dispositivo; e2e prova zero requisições externas.
- Tema (state-machines §3): `claro ⇄ escuro` com chave `aps-inteligente:tema` e degradação graciosa — contrato preservado e agora testado.
- Cabeçalhos/CSP da feature 002 e saúde do banco da feature 003 — suíte de contrato verde sem edição.

## Modificadas (regras 🟢 alteradas ou removidas)

- **Identidade visual do design Claude (adendo 001, tokens/tipografia):** removida por decisão de spec (RN-05, esclarecimento 1). Os tokens (paleta verde-clínica, IBM Plex) não existem mais no repo; o adendo 001 permanece válido apenas nas regras clínicas e na estrutura de componentes.
- **"Sem dependência de UI de terceiro" (dependencies.md, runtime enxuto):** o trio Next/React ganhou `@primer/react`+`@primer/primitives`; o domínio segue sem dependência externa alguma.
- **Dívida técnica nº 4 (`globais.css` 699 LOC):** quitada (397).
- **Dívida técnica nº 3, parte e2e (script quebrado):** quitada (`test:e2e` funcional com axe).
