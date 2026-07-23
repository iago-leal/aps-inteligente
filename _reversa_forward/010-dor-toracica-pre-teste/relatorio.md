# Relatório de execução — feature 010-dor-toracica-pre-teste

> Data: 2026-07-23 · Cenário: legado · Categoria: Produto

## O que foi entregue

Terceira calculadora clínica da plataforma: **classificação da dor torácica → probabilidade
pré-teste de cardiopatia isquêmica → conduta de investigação**, pelo *TeleCondutas — Cardiopatia
Isquêmica* (TelessaúdeRS-UFRGS, 2017), a terceira fonte da plataforma. Domínio puro novo em
`models/cardiopatia-isquemica/`, tela em `interface/cardiologia/`, seção "Cardiologia" no catálogo
e rota `/cardiologia/dor-toracica`. Blocos de referência (CCS, tratamento + Tabela 1, seguimento,
manejo agudo) como material consultável, fora do cálculo (RF-10). Sem ritual de revisão (D-08).

Ações concluídas: **30/30** (T001–T030).

## Verificação (T027)

| Gate | Resultado |
|------|-----------|
| `typecheck` (`tsc --noEmit`) | ✅ verde |
| `lint` (eslint) | ✅ sem erros |
| `npm test` (unidade + integração) | ✅ **375/375** (era 284; +81 unidade cardiopatia, +9 integração cardiologia, +1 home) |
| `test:api` (contrato) | ✅ **16/16** — byte a byte, nenhum delta |
| `test:e2e` (Playwright) | ✅ **21/21** (era 15; +6 aditivos) |
| `axe` (acessibilidade) | ✅ tela de cardiologia e resultado em **0** violações; baseline antigo intocado |
| `git diff models/insulina models/gestacao` | ✅ vazio (motores intocados) |
| Arquivos > 400 linhas | ✅ nenhum (maior novo: `formulario.tsx`, 203) |

Cobertura do domínio novo pelo oráculo das 24 células do Quadro 2, property-based do invariante
"toda saída referenciada", classificação, ajuste por fatores de risco, fora-de-escopo e conduta.

## Bundle (T028) — gate D-08

Medição determinística via `.next/build-manifest.json` (first-load JS gzip):

| Rota | first-load |
|------|-----------|
| `/pre-natal/idade-gestacional` (irmã) | ≈ 276,7 kB |
| `/cardiologia/dor-toracica` (nova) | ≈ 278,5 kB |

O delta da rota nova sobre a irmã é **≈ 1,8 kB gzip** — todo o domínio + UI de cardiologia,
duas ordens de magnitude abaixo do gate D-08 (< 100 kB de acréscimo). Os números absolutos são
o bundle compartilhado Primer/React, inalterado pela feature. Sem biblioteca nova (HeartIcon do
`@primer/octicons-react`, já presente, tree-shaken).

## Evidência visual

`screenshots/`: home (claro/escuro), tela de cardiologia vazia (claro/escuro) e com resultado de
angina típica de alto risco (claro/escuro). Design coerente com o vocabulário Primer da plataforma,
logo APSi no cabeçalho, selo de privacidade e alternância de tema.

## Candidatos a vigilância (para o regression-watch e validação clínica)

- **D-03** — mecânica e redação do *cap* da faixa de fatores de risco (base×2–base×3, capada em 99%
  com sinal ">90%"): validar leitura clínica com o prescritor.
- **D-08** — ausência de ritual de revisão (espelha a IG): confirmar conforto em uso; reversível.
- **Estrato "baixa"** definido pela descrição clínica do guia (dor não anginosa **e** sem fatores),
  não pelo corte numérico isolado — leitura da nota ** do Quadro 2; confirmar com o prescritor.
- **Transcrição das 24 células do Quadro 2**: coberta por oráculo, mas convém conferência humana.
