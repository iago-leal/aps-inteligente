# Confidence Report — aps-inteligente

> Gerado pelo Reversa Reviewer em 2026-07-19, após revisão das specs e sessão de validação com o usuário (answer_mode: chat).
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Resumo por artefato

| Artefato | 🟢 | 🟡 | 🔴 | Observação |
|---|---|---|---|---|
| `models-insulina/` (4 arquivos) | ~95% | ~3% | ~2% | Domínio inteiro confirmado no código e nos 125 testes; 🔴 restantes são as lacunas G-01..G-03 |
| `interface-calculadora/` (3 arquivos) | ~92% | ~5% | ~3% | Assinaturas de props verificadas e reclassificadas 🟡→🟢 pelo Reviewer; 🔴 é o e2e adiado |
| `pages-next/` (3 arquivos) | ~90% | ~5% | ~5% | Decisões da API e da infra tomadas (🔴→🟢); resta CSP não verificada |
| Globais (architecture, C4, ERD, domain, state-machines, permissions, ADRs, matrizes, user-story) | ~90% | ~7% | ~3% | ADRs reconstruídos de fontes primárias (bundle); progressão clínica do esquema é 🟡 por ser inferida |

**Confiança geral estimada: ~92% 🟢 · ~5% 🟡 · ~3% 🔴**

## Verificações realizadas pelo Reviewer

1. 3 units completas (requirements + design + tasks; `models-insulina` com `questions.md`).
2. Assinaturas de componentes conferidas contra o código (`PropsCalculadoraApp`, `PropsFormulario`, `PropsResultado`) — 3 reclassificações 🟡→🟢; descoberta incorporada: **motor e relator injetáveis por prop para teste**.
3. Nome real da suíte do relator corrigido (`relator-de-erros.test.tsx`).
4. Suíte executada: **125 testes verdes em 10 arquivos** (1,4 s) — corpo de testes citado pelas specs confere.
5. Matrizes validadas: `code-spec-matrix` cobre 18/18 arquivos de produção; `spec-impact-matrix` coerente com as dependências reais (direção única `pages → interface → models`).
6. Consistência cruzada entre units: sem contradições; fronteiras de responsabilidade respeitadas.

## Sessão de validação (6 perguntas)

| Pergunta | Status | Efeito |
|---|---|---|
| P-1 PDF do guia | ✅ usuário fornecerá o caminho | Conferência pendente (G-01) |
| P-2 metformina/TFG | ⏳ aguarda material | G-02 |
| P-3 sulfonilureia ampliada | ⏳ aguarda redação | G-03 |
| P-4 HbA1c silencioso | ✅ indesejado → vira bug | RN-H anotada; ação A-01 |
| P-5 API v1 | ✅ manter como lembrete | RF-04/T-04 reclassificados 🔴→🟢 |
| P-6 infra perdida | ✅ nada por enquanto | T-05/TT-04 decididos 🔴→🟢 |

**Reclassificações totais: 3× 🟡→🟢 (verificação em código) + 4× 🔴→🟢 (decisões do usuário).**

## Revisão Cruzada

Não realizada — plugin Codex indisponível na sessão.

## Veredito

A extração está **apta a servir de fonte para o ciclo forward**: um agente competente reconstruiria o sistema a partir de `{units + domain + ADRs + matrizes}` sem o código. As três lacunas abertas (G-01..G-03) bloqueiam apenas as evoluções clínicas pendentes, não a fidelidade do as-is.
