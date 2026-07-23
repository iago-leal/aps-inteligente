# Confidence Report — aps-inteligente

> Gerado pelo Reversa Reviewer na **re-extração 2 (2026-07-23)**, após revisão das 12 units regeneradas e sessão de validação com o usuário (answer_mode: chat).
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Resumo por artefato

| Unit / artefato | 🟢 | 🟡 | 🔴 | Observação |
|---|---|---|---|---|
| `models-insulina/` | ~96% | ~3% | ~1% | Motor intocado byte a byte desde a feature 001 (`git log` confirma); specs da extração 1 seguem válidas; 🟡 é o PDF (G-01) |
| `models-gestacao/` | ~90% | ~10% | 0 | Fórmulas (IG, Naegele, retroprojeção, margens) 🟢 por property-based; 🟡 são 4 parâmetros de convenção/plausibilidade (Q-G1..G4) |
| `models-cardiopatia-isquemica/` | ~90% | ~10% | 0 | Classificação, lookup, ajuste, estrato, conduta 🟢 por property-based + oráculo das 24 células; 🟡 são premissas clínicas (Q-C1..C5) |
| `interface-comum/` (Moldura) | ~95% | ~5% | 0 | Semântica de a11y verificada por axe; 🟡 é o acoplamento de tema a realocar |
| `interface-calculadora/` | ~96% | ~4% | 0 | Assinaturas e LOC verificadas no código; e2e/axe reconstituídos; 🟡 é dívida de refactor (T-08) |
| `interface-gestacao/` | ~97% | ~3% | 0 | Estados/privacidade por integração (+17 testes); 🟡 é ergonomia da entrada dupla |
| `interface-cardiologia/` | ~95% | ~5% | 0 | 4 variantes + privacidade por integração (+9) e e2e (axe 0/0); 🟡 é fidelidade dos blocos (Q-C5) |
| `interface-inicio/` | ~97% | ~3% | 0 | Catálogo/stretched link/ícones verificados; axe 0/0 |
| `interface-estilos/` | ~95% | ~5% | 0 | Só tokens Primer verificável por inspeção; 🟡 é `globais.css` no teto de 400 |
| `pages-next/` | ~95% | ~5% | 0 | Estrutura de rotas verificada no código; lacunas 🔴 da extração 1 resolvidas; 🟡 é 404 própria |
| `pages-api-v1-status/` | ~99% | ~1% | 0 | Contrato fixado e verificado (16/16) |
| `infra/` | ~97% | ~3% | 0 | Fachada `pg` + Compose 17; 🟡 é `Date.now()` na medição (aceitável em infra) |
| Globais (architecture, C4, ERD, domain, state-machines, permissions, 13 ADRs, matrizes, user-stories, OpenAPI) | ~92% | ~7% | ~1% | Regenerados para 3 domínios + plataforma; matrizes coerentes com dependências reais |

**Confiança geral estimada: ~94% 🟢 · ~6% 🟡 · <1% 🔴**

## Verificações realizadas pelo Reviewer

1. **12 units completas** (requirements + design + tasks; domínios com `questions.md`; API com `contracts.md`; insulina/pages/calculadora com `legacy-mapping.md`).
2. **Spot-checks no código real** (fonte de verdade acima da spec):
   - Estrutura de `pages/`: 3 rotas de calculadora + home na raiz + `api/v1/status.ts`; **não há** `api/v1/index.js` vazio.
   - LOC: `formulario.tsx` 313, `resultado.tsx` 353, `globais.css` 400, `moldura.tsx` 95, `tela.tsx` 17 — nenhum arquivo de produção acima de 400.
   - `models/insulina` intocado desde a feature 001 (`git log -1 -- models/insulina`).
   - Quatro folhas de estilo presentes (globais, cabecalho, inicio, cardiologia).
3. **Correção de inconsistência:** dois `legacy-mapping.md` (`pages-next/`, `interface-calculadora/`) estavam congelados na extração 1 e contradiziam os specs regenerados; **regenerados in-place** contra o código real. `models-insulina/legacy-mapping.md` confirmado válido (motor intocado).
4. **Consistência cruzada entre units:** sem contradições; três domínios mutuamente isolados; `Moldura` como único acoplamento horizontal (confere com a `spec-impact-matrix`).
5. **Matrizes validadas:** `code-spec-matrix` cobre 100% do código de produção dos 3 domínios + plataforma; `spec-impact-matrix` coerente com as dependências reais (direção `pages → interface → models`, `api → infra`).

## Sessão de validação (premissas clínicas 🟡)

Apresentadas 9 premissas 🟡 ao prescritor (4 gestação, 5 cardiologia/insulina). **Decisão do usuário (2026-07-23): manter todas como premissas 🟡 documentadas e seguir para a verificação de regressão.** Nenhuma promovida a 🟢 nesta sessão; nenhuma ajustada. Registro em `questions.md` e `gaps.md`.

## Reclassificações desta sessão

- **2 artefatos corrigidos** (`legacy-mapping.md` de `pages-next` e `interface-calculadora`): de conteúdo obsoleto/contraditório para 🟢 alinhado ao código real.
- **0 reclassificações de premissa** (o usuário optou por manter 🟡).

## Revisão Cruzada

Não realizada — plugin Codex indisponível na sessão.

## Veredito

A extração 2 está **apta a servir de fonte para o ciclo forward**: um agente competente reconstruiria a plataforma (3 domínios + casca + shell + API + infra) a partir de `{units + domain + ADRs + matrizes}` sem o código. As premissas 🟡 abertas são parâmetros clínicos de convenção/plausibilidade que o prescritor pode chancelar a qualquer momento; não comprometem a fidelidade do as-is. As lacunas 🔴 da extração 1 foram resolvidas pelas features 002/003/004.
