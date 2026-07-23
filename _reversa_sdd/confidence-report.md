# Confidence Report — aps-inteligente

> Gerado pelo Reversa Reviewer na **re-extração 3 (2026-07-23)**, após revisão das 14 units (12 da base + 2 novas do risco cardiovascular) e sessão de validação com o usuário (answer_mode: chat).
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Resumo por artefato

| Unit / artefato | 🟢 | 🟡 | 🔴 | Observação |
|---|---|---|---|---|
| `models-insulina/` | ~96% | ~3% | ~1% | Motor intocado byte a byte desde a feature 001; 🟡 é o PDF (G-01) |
| `models-gestacao/` | ~90% | ~10% | 0 | Fórmulas 🟢 por property-based; 🟡 são 4 parâmetros de convenção (Q-G1..G4) |
| `models-cardiopatia-isquemica/` | ~90% | ~10% | 0 | Classificação/lookup/estrato 🟢 por property-based + oráculo das 24 células; 🟡 são premissas (Q-C1..C5) |
| `models-risco-cardiovascular/` **(nova)** | ~90% | ~10% | 0 | Equação PCE 🟢 por oráculo (`equacao.test.ts`) + invariantes property-based; 🟡 são premissas clínicas (Q-R1..R4) |
| `interface-comum/` (Moldura) | ~95% | ~5% | 0 | Cabeçalho refatorado (011/013) verificado no código + axe; 🟡 é o acoplamento de tema a realocar |
| `interface-calculadora/` | ~96% | ~4% | 0 | Assinaturas e LOC verificadas; 🟡 é dívida de refactor (T-08) |
| `interface-gestacao/` | ~97% | ~3% | 0 | Estados/privacidade por integração; 🟡 é ergonomia da entrada dupla |
| `interface-cardiologia/` | ~95% | ~5% | 0 | 4 variantes + privacidade por integração e e2e (axe 0/0); 🟡 é fidelidade dos blocos (Q-C5) |
| `interface-risco-cardiovascular/` **(nova)** | ~94% | ~6% | 0 | Estados + proveniência + integração (`risco-cardiovascular.test.tsx`); 🟡 é o acoplamento de relator/tema herdado |
| `interface-inicio/` | ~97% | ~3% | 0 | Catálogo (cardiologia com 2 fichas)/stretched link/ícones verificados; axe 0/0 |
| `interface-estilos/` | ~97% | ~3% | 0 | Só tokens Primer; **5 folhas**; dívida do teto de `globais.css` RESOLVIDA (364 linhas) |
| `pages-next/` | ~95% | ~5% | 0 | Estrutura de rotas verificada (nova rota de risco); 🟡 é 404 própria |
| `pages-api-v1-status/` | ~99% | ~1% | 0 | Contrato fixado e verificado |
| `infra/` | ~97% | ~3% | 0 | Fachada `pg` + Compose 17; 🟡 é `Date.now()` na medição (aceitável em infra) |
| Globais (architecture, C4, ERD, domain, state-machines, permissions, **15 ADRs**, matrizes, user-stories, OpenAPI) | ~93% | ~7% | <1% | Regenerados para 4 domínios + plataforma; matrizes coerentes com dependências reais |

**Confiança geral estimada: ~94% 🟢 · ~6% 🟡 · <1% 🔴**

## Verificações realizadas pelo Reviewer

1. **14 units completas** (requirements + design + tasks; domínios com `questions.md`; API com `contracts.md`).
2. **Spot-checks no código real** (fonte de verdade acima da spec):
   - Novo domínio `models/risco-cardiovascular`: 7 arquivos, fachada `estimar`, equação de Cox log-linear, coeficientes congelados.
   - **Valor de exemplo do caso-base conferido contra o oráculo** `tests/unit/dominio-risco-cardiovascular/equacao.test.ts`: homem-branco 55a, CT 213, HDL 50, PAS 120 → **5,4%** (não 5,3% — afirmação corrigida in-place).
   - Cabeçalho refatorado em `interface/comum/moldura.tsx`: `IconButton` de tema-alvo + comando de início `!logoComoTitulo` + `.cabecalho-selo` na identidade.
   - LOC das folhas: `globais.css` **364** (abaixo do teto de 400), `cabecalho.css` 116, `risco-cardiovascular.css` 8 — nenhuma folha acima de 400.
   - `models/insulina`, `models/gestacao`, `models/cardiopatia-isquemica` intocados na feature 014 (`git diff` vazio).
3. **Consistência cruzada entre units:** sem contradições; quatro domínios mutuamente isolados; `Moldura` como único acoplamento horizontal (confere com a `spec-impact-matrix`).
4. **Matrizes validadas:** `code-spec-matrix` cobre 100% do código de produção dos 4 domínios + plataforma; `spec-impact-matrix` (12×13) coerente com as dependências reais.

## Sessão de validação (premissas clínicas 🟡)

Apresentadas 13 premissas 🟡 ao prescritor (4 gestação, 5 cardiologia/insulina, 4 risco cardiovascular). **Decisão do usuário (2026-07-23, política herdada da re-extração 2): manter todas como premissas 🟡 documentadas e seguir para a verificação de regressão.** Nenhuma promovida a 🟢 nesta sessão; nenhuma ajustada. Registro em `questions.md` e `gaps.md`.

## Reclassificações desta sessão

- **1 afirmação corrigida** (`models-risco-cardiovascular/requirements.md` + `user-stories/estimativa-risco-cardiovascular.md`): valor de exemplo "~5,3%" → **5,4%** conferido contra o oráculo. 🟢-frágil → 🟢-confirmado.
- **1 dívida encerrada:** `globais.css` no teto de 400 (item amarelo 004/W003 da re-extração 2) — confirmada resolvida (364 linhas).
- **0 reclassificações de premissa clínica** (o usuário optou por manter 🟡).

## Revisão Cruzada

Não realizada — plugin Codex indisponível na sessão.

## Veredito

A extração 3 está **apta a servir de fonte para o ciclo forward**: um agente competente reconstruiria a plataforma (4 domínios + casca + shell + API + infra) a partir de `{units + domain + ADRs + matrizes}` sem o código. As premissas 🟡 abertas são parâmetros clínicos de convenção/plausibilidade que o prescritor pode chancelar a qualquer momento; não comprometem a fidelidade do as-is. O novo domínio (feature 014) chega com fonte única, ADR próprio (0014), referências, proveniência e testes; a dívida amarela remanescente foi encerrada.
