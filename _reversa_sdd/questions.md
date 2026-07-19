# Perguntas para Validação — aps-inteligente

> Gerado pelo Reversa Reviewer em 2026-07-19.
> `answer_mode = chat`: as perguntas serão feitas na conversa; este arquivo é o registro.
> Consolida e substitui, no nível global, as questões de `models-insulina/questions.md`.

---

## Pergunta 1

**Contexto:** Constantes clínicas de `models/insulina/fonte-clinica.ts` citam página/figura do guia, mas o PDF está fora do repo (ADR 0001).
**Spec afetada:** [`_reversa_sdd/models-insulina/requirements.md`] (todas as RN)
**Pergunta:** Você pode disponibilizar o PDF do Guia Rápido DM para conferência página a página das 20 referências e limiares?
**Impacto:** Com o PDF, a fidelidade à fonte ganha verificação independente; sem ele, permanece 🟢 por rastreabilidade de comentários apenas.

**Resposta:** ✅ Respondida (chat, 2026-07-19). Sim — o usuário fornecerá o caminho do PDF. Conferência página a página pendente até o caminho chegar.

---

## Pergunta 2

**Contexto:** Divergências clínicas 1 e 2 aprovadas no design (dose de metformina; TFG) dependem de conteúdo do guia ainda não extraído.
**Spec afetada:** [`_reversa_sdd/models-insulina/questions.md`], futura feature do ciclo forward
**Pergunta:** Quais páginas/tabelas do guia fundamentam a dose otimizada de metformina e o ajuste/contraindicação por TFG?
**Impacto:** A extração citada precede a spec das duas features (Princípios I/II); sem ela, seguem bloqueadas.

**Resposta:** <!-- preencha aqui -->

---

## Pergunta 3

**Contexto:** Divergência 3 — `SUSPENDER_SULFONILUREIA` ampliada (uso "não informado" com redação condicional; esquema que já chega fracionado).
**Spec afetada:** [`_reversa_sdd/models-insulina/requirements.md`] RN-G
**Pergunta:** Confirme a redação condicional para o caso "não informado" e se a recomendação vale para todo cálculo com NPH já fracionada ou só quando houver ajuste.
**Impacto:** Define o comportamento da futura RN-G ampliada e seus testes de validação.

**Resposta:** <!-- preencha aqui -->

---

## Pergunta 4

**Contexto:** `RegraIntensificacao.aplicar` retorna silenciosamente quando HbA1c está ausente e o paciente não está intensificado com pré-prandiais (ramos residuais fora do EC-10).
**Spec afetada:** [`_reversa_sdd/models-insulina/requirements.md`] RN-H
**Pergunta:** Esse silêncio é a conduta desejada, ou deveria haver recomendação explícita de dosar HbA1c nesses ramos?
**Impacto:** Se indesejado, nasce bug (via `/reversa-debugger`) com teste de regressão; se desejado, RN-H ganha nota explícita 🟢.

**Resposta:** ✅ Respondida (chat, 2026-07-19). Não — o comportamento desejado é recomendar dosar HbA1c nos ramos residuais. Vira bug via /reversa-debugger (teste de regressão antes do fix). RN-H anotada.

---

## Pergunta 5

**Contexto:** `pages/api/v1/index.js` vazio — rota declarada sem handler falha se requisitada; scripts `test:api` quebrados.
**Spec afetada:** [`_reversa_sdd/pages-next/requirements.md`] RF-04, [`tasks.md`] T-04
**Pergunta:** A API v1 renasce agora (reimplementar `GET /api/v1/status` no padrão ADR 0008) ou o placeholder e o script `test:api` saem até a etapa do banco?
**Impacto:** Define T-04 e o destino de `infra/compose.yaml` e `tests/integration/api/`.

**Resposta:** ✅ Respondida (chat, 2026-07-19). Manter o placeholder deliberadamente, como lembrete da API futura. RF-04/T-04 atualizados (Won't nesta fase; implementação na etapa do banco, padrão ADR 0008).

---

## Pergunta 6

**Contexto:** Perdas da refundação ainda não repostas: CSP sem terceiros, 404 própria, e2e de privacidade/WCAG (Playwright+axe), CI (D-07), lint de fronteira de camadas (D-01).
**Spec afetada:** [`_reversa_sdd/pages-next/tasks.md`] T-05, [`interface-calculadora/tasks.md`] TT-04, [`architecture.md`] §6
**Pergunta:** Quais desses itens devem ser reconstituídos já na próxima feature de infraestrutura, e quais ficam para depois?
**Impacto:** Prioriza o backlog de dívidas de gravidade alta da extração.

**Resposta:** ✅ Respondida (chat, 2026-07-19). Nada por enquanto — CI, lint de fronteira, e2e e CSP/404 permanecem no backlog de dívidas (architecture.md §6); reavaliar na próxima feature de infraestrutura.
