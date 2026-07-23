# Legacy Impact: 007-idade-gestacional-e-home

> Data: 2026-07-23 · Cenário: legado (âncora: `_reversa_sdd/architecture.md` + `domain.md` + adendos vigentes 001–006)

## 1. Arquivos afetados

| Arquivo afetado | Componente (`_reversa_sdd/`) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `models/gestacao/{tipos,fonte-clinica,datas,datacao,validacao,calculadora}.ts` | `architecture.md#1` (nova unit no molde de `models/insulina`) | componente-novo | MEDIUM | Segundo domínio clínico da plataforma; puro, sem tocar o motor existente |
| `interface/gestacao/{app,formulario,resultado,tela}.tsx` | `code-analysis.md#módulo-2` (molde) | componente-novo | MEDIUM | UI da IG; padrões do legado (invalidação, painel honesto), sem ritual de revisão (D-08) |
| `interface/inicio/{catalogo.ts,tela.tsx}` | n/a (novo) | componente-novo | MEDIUM | Home por seções; catálogo tipado é a fonte única de navegação (D-07) |
| `interface/comum/moldura.tsx` + `interface/calculadora/tela.tsx` | `code-analysis.md#módulo-2` (`tela.tsx`) | regra-alterada | LOW | Moldura extraída byte a byte (D-09); DOM e comportamento idênticos, oráculo 56/56 verde |
| `pages/index.tsx` | `code-analysis.md#módulo-3` | regra-alterada | HIGH | Comportamento público da raiz muda: deixa de montar a calculadora e passa a montar a home (decisão do usuário, sem redirecionamento) |
| `pages/dm2/insulina.tsx` · `pages/pre-natal/idade-gestacional.tsx` | `code-analysis.md#módulo-3` | componente-novo | MEDIUM | Rotas próprias por calculadora; metadados da insulina preservados da antiga raiz |
| `e2e/calculadora.spec.ts` · `e2e/plataforma.spec.ts` · `e2e/axe-baseline.json` | `addenda/004` (harness e2e) | regra-alterada | LOW | Spec da insulina aponta para a rota nova (asserções intactas); linha de base ganha chaves zero para as telas novas |
| `tests/unit/dominio-gestacao/*` · `tests/integration/interface/{gestacao,inicio}.test.tsx` | `architecture.md#5` | componente-novo | LOW | +42 unidade (com property-based) e +17 integração |
| `README.md` · `.gitignore` | `addenda/004` (diretriz de telas) | regra-alterada | LOW | Diretriz "como adicionar calculadora" e `referencias/` fora do versionamento (MD-0008 estendido à segunda fonte) |

## 2. Diff conceitual por componente

**Shell (`pages/`)** — o legado tinha uma página única cuja raiz **era** a calculadora de insulina (`code-analysis.md#módulo-3`). Agora o shell é uma plataforma: raiz-home + uma rota por calculadora, nomeada pela seção (`/dm2/insulina`, `/pre-natal/idade-gestacional`). Consequência externa: quem acessa a URL raiz de produção passa a ver a home (decisão registrada na sessão de esclarecimentos de 2026-07-23).

**Domínio** — nasce `models/gestacao/`, paralelo a `models/insulina/` e sem nenhuma dependência entre eles. A fonte clínica é outra (Guia Rápido Pré-Natal 2025) com catálogo próprio de referências, mantendo "uma fonte por unit" (coerente com NG-04). Padrões herdados: erros como valores, coleta total de ofensores, determinismo (a data de referência é entrada, não relógio), toda saída com referência.

**Apresentação** — `interface/` ganha três vizinhos de `calculadora/`: `gestacao/`, `inicio/` e `comum/`. A moldura (cabeçalho + selo + tema) virou componente comum; `tela.tsx` da insulina ficou como composição fina. Dois imports cruzados documentados: a moldura e a tela de gestação importam `preferencia-de-tema.ts`/`relator-de-erros.ts`/`erro-de-campo.tsx` de `interface/calculadora/` — candidatos à realocação para `comum/` na re-extração.

**Contratos externos** — nenhum: `GET /api/v1/status`, CSP e cabeçalhos byte a byte (contrato 16/16); zero requisição de rede nova (teste dedicado no e2e).

## 3. Preservadas (regras 🟢 do `domain.md` intactas)

- §3.1–§3.4 (regras 1–20 do motor de insulina, incluindo os deltas dos adendos 001/005): `git diff models/insulina/` vazio.
- §3.5 regra 21 (privacidade por construção) — **estendida** às telas novas, não alterada: sem fetch, sem storage clínico.
- §3.5 regra 22 (invalidação por edição) — na insulina intacta; replicada na IG.
- §3.5 regra 23 (espelhamento de faixas via `CONSTANTES`) — na insulina intacta; replicado com as constantes da gestação.
- Ritual de revisão + Copiar plano (glossário §2; adendo 006) — intactos na tela da insulina; deliberadamente ausentes na IG (datação não prescreve).
- Tema (`state-machines.md#3`): chave `aps-inteligente:tema` e degradação inalteradas (suíte do provedor verde).

## 4. Modificadas (regras 🟢 alteradas ou realocadas)

- `code-analysis.md#módulo-3`: "index.tsx monta TelaCalculadora" **deixou de valer** — a raiz monta a home; a calculadora vive em `/dm2/insulina` (metadados preservados).
- `code-analysis.md#módulo-2`: a moldura descrita dentro de `tela.tsx` agora vive em `interface/comum/moldura.tsx` (apresentação idêntica; realocação, não redesenho).
- `addenda/004` (harness e2e): linha de base axe ganhou três chaves novas (todas 0); as duas chaves antigas permanecem byte a byte.
- `addenda/004` (diretriz de tela nova no README): complementada pela diretriz de calculadora nova via catálogo.
