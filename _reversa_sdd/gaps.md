# Gaps — aps-inteligente

> Regenerado pelo Reversa Reviewer na **re-extração 2 (2026-07-23)**. Lacunas e dívidas após a sessão de validação (o usuário optou por manter as premissas clínicas como 🟡 e seguir para a regressão).

## Premissas clínicas abertas (🟡, aguardam chancela do prescritor)

| # | Premissa | Unit | O que destrava |
|---|----------|------|----------------|
| Q-G1 | Cortes de trimestre 13+6 / 27+6 | `models-gestacao` | Definição operacional de trimestre |
| Q-G2 | Limite retroativo da DUM (44 semanas) | `models-gestacao` | Teto de plausibilidade da validação |
| Q-G3 | Faixa do laudo de USG (0–42 semanas) | `models-gestacao` | Faixa de plausibilidade da validação |
| Q-G4 | 3.º trimestre: só informar, sem arbitrar | `models-gestacao` | Conduta da comparação DUM×USG sem margem na fonte |
| Q-C1 | Transcrição das 24 células do Quadro 2 | `models-cardiopatia-isquemica` | Conferência independente contra o PDF |
| Q-C2 | Estrato "baixa" descritivo | `models-cardiopatia-isquemica` | Semântica clínica do estrato |
| Q-C3 | Cap do ajuste em 99% e sinal ">90%" | `models-cardiopatia-isquemica` | Apresentação da incerteza |
| Q-C4 | Ausência de ritual de revisão | `models-cardiopatia-isquemica` / `interface-cardiologia` | Confirmação da conduta de UX clínica |
| Q-C5 | Fidelidade dos blocos complementares | `interface-cardiologia` | Nível de detalhe do material consultável |

## Pendência de insumo

| # | Lacuna | Origem | O que destrava |
|---|--------|--------|----------------|
| G-01 | Caminho do PDF do *Guia Rápido DM* (usuário fornecerá) | `questions.md` Q-I1 | Conferência página a página das 20 referências e limiares de `models/insulina/fonte-clinica.ts` |

## Dívidas técnicas registradas (sem bloqueio)

- 🟡 **Acoplamento residual de tema:** `interface/calculadora/preferencia-de-tema.ts` é consumido pela `Moldura` (`interface/comum`) — realocar para `interface/comum/` numa próxima feature (declarado no próprio código e no `design.md` da unit `interface-comum`).
- ✅ **`globais.css` no teto de 400 linhas — RESOLVIDO (2026-07-23):** o layout do cabeçalho (família `.cabecalho*`) migrou para `cabecalho.css`; `globais.css` caiu para 364 linhas (todas as folhas < 400). Relocação byte a byte, mesma ordem de cascata; suíte 375/375, build e Prettier verdes.
- 🟡 **`formulario.tsx` (313 LOC):** concentra linhas, validação e montagem — extração de subcomponentes recomendável (unit `interface-calculadora`, T-08); `let proximoId` módulo-global é frágil sob StrictMode/HMR.
- 🔴 **Sem telemetria/logs de produção** (por design, ADR 0007) — comportamento em uso real é invisível; dívida estrutural conhecida, não defeito.
- 🟡 **Backlog de infra da refundação** (CI, lint de fronteira de camadas D-01, página 404 própria): documentado em `architecture.md` §6; reavaliar na próxima feature de infraestrutura.

## Corrigido nesta re-extração

- ✅ **`legacy-mapping.md` obsoletos** (`pages-next/`, `interface-calculadora/`): estavam congelados na extração 1 e contradiziam os specs regenerados (IBM Plex, `/api/v1/index.js` vazio, Moldura em `tela.tsx`, LOC 532/699). Regenerados pelo Reviewer contra o código real (313/400 LOC, Moldura em `interface/comum`, `status.ts` realizado).
