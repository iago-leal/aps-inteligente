# Plano de Exploração — aps-inteligente

> Criado pelo Reversa em 2026-07-19 · **3ª passagem iniciada em 2026-07-23**
> Marque cada tarefa com ✅ quando concluída.
> Esta é a 3ª passagem do núcleo: absorve as features **011–014** do ciclo forward
> sobre a base da re-extração 2 (que já cobria 001–010).

---

## Delta desta passagem (o que mudou desde a re-extração 2)

- 🆕 **`models/risco-cardiovascular`** — calculadora de risco cardiovascular por Pooled
  Cohort Equations (feature 014). **Domínio novo**, análise do zero.
- 🆕 **`interface/risco-cardiovascular`** — tela da feature 014. **Tela nova**.
- 🔧 **`interface/comum`** — cabeçalho refatorado (toggle de tema icônico, retorno à home;
  features 011/013) e selo de privacidade movido para a identidade.
- 🔧 **`interface/estilos`** — `cabecalho.css` consolidada; proporções alinhadas à home
  (features 011/013).
- 🔧 **`interface/inicio`** — possível novo cartão da calculadora de risco na home.
- 📄 **Adendo 012** — domínio próprio `apsinteligente.app` (infra/docs; sem código de app).
- ♻️ Reconciliar os adendos **011–014** em `_reversa_sdd/addenda/` (marcar "Superado pela
  re-extração" quando absorvidos na base).

Os módulos intocados (insulina, gestacao, cardiopatia-isquemica, calculadora, cardiologia,
gestacao, pages, infra) são **reconfirmados** contra o código, não reescritos sem motivo.

---

## Fase 1: Reconhecimento 🔍

- [x] **Scout** — Mapeamento de estrutura de pastas e tecnologias ✅
- [x] **Scout** — Análise de dependências e gerenciadores de pacotes ✅
- [x] **Scout** — Identificação de entry points, CI/CD e configurações ✅

## Decisão de organização das specs 🗂️

> Já decidida em 2026-07-19 (`feature-folder` / `module`), persistida em `.reversa/config.toml [specs]`. Menu pulado.

## Fase 2: Escavação 🏗️

> Quatro domínios + interface + shell + infra. Foco de esforço no delta 011–014.

**Domínio (`models/`):**
- [x] **Arqueólogo** — `models/insulina` (reconfirmado; motor intocado) ✅
- [x] **Arqueólogo** — `models/gestacao` (reconfirmado) ✅
- [x] **Arqueólogo** — `models/cardiopatia-isquemica` (reconfirmado) ✅
- [x] 🆕 **Arqueólogo** — `models/risco-cardiovascular` (PCE — feature 014, análise nova) ✅

**Interface (`interface/`):**
- [x] 🔧 **Arqueólogo** — `interface/comum` (cabeçalho refatorado — 011/013) + `interface/calculadora` ✅
- [x] 🆕 **Arqueólogo** — `interface/risco-cardiovascular` (tela nova) + `interface/cardiologia` ✅
- [x] **Arqueólogo** — `interface/gestacao` + `interface/inicio` (home + cartão de risco) + 🔧 `interface/estilos` (globais 400→364, dívida resolvida) ✅

**Shell e infraestrutura:**
- [x] **Arqueólogo** — `pages` (shell Next.js, rotas, PWA — nova rota de risco) + `pages/api/v1/status` ✅
- [x] **Arqueólogo** — `infra` (pool pg + compose PostgreSQL; reconfirmado) ✅

## Fase 3: Interpretação 🧠

- [x] **Detetive** — Arqueologia Git e ADRs retroativos (features 011–014) ✅ (+2 ADRs: 0014 PCE, 0015 domínio próprio)
- [x] **Detetive** — Regras de negócio implícitas e máquinas de estado (PCE) ✅
- [x] **Detetive** — Matriz de permissões (RBAC/ACL) ✅ (inalterada: sem RBAC por design)
- [x] **Arquiteto** — Diagramas C4 (Contexto, Containers, Componentes — 4º domínio) ✅
- [x] **Arquiteto** — ERD completo e integrações externas ✅
- [x] **Arquiteto** — Spec Impact Matrix ✅

## Fase 4: Geração 📝

- [x] **Redator** — Specs SDD por componente ✅ (2 units novas + 4 units atualizadas)
- [x] **Redator** — OpenAPI ✅ (`openapi/status.yaml` já citava `apsinteligente.app`; sem mudança)
- [x] **Redator** — User Stories ✅ (`estimativa-risco-cardiovascular.md`)
- [x] **Redator** — Code/Spec Matrix ✅ (4 domínios)

## Fase 5: Revisão ✅

- [x] **Revisor** — Revisão cruzada de specs ✅ (14 units; 1 afirmação corrigida via oráculo; Codex indisponível)
- [x] **Revisor** — Resolução de lacunas com o usuário ✅ (13 premissas 🟡 mantidas por política herdada; Q-R1..R4 novas)
- [x] **Revisor** — Relatório de confiança final ✅ (~94% 🟢)

## Fase 6: Verificação de regressão 🔁

- [x] Verificar os `regression-watch.md` de `_reversa_forward/` (incl. 011, 013, 014) contra o SDD regenerado ✅ (10 features, 60 watch items: 60🟢 / 0🟡 / 0🔴; dívida amarela da re-extração 2 encerrada)
- [x] Reconciliar os adendos 011–014 de `_reversa_sdd/addenda/` (marcar "Superado pela re-extração") ✅ (4 adendos superados)

---

## Agentes Independentes

> Execute estes agentes quando os recursos estiverem disponíveis — podem rodar em qualquer fase.

- [ ] **Visor** — Análise de interface via screenshots
- [ ] **Data Master** — Análise completa do banco de dados
- [ ] **Design System** — Extração de tokens de design
- [ ] **Tracer** — Análise dinâmica (requer sistema acessível)

---

## Próximo passo

Após o Time de Descoberta concluir e o `_reversa_sdd/` estar populado, você pode disparar um dos fluxos seguintes:

- `/reversa-migrate`: orquestrador do **Time de Migração**. Saída em `_reversa_sdd/migration/` e `_reversa_sdd/screens/`.
- `/reversa-reconstructor`: gera plano bottom-up para reimplementar o software a partir das specs do legado (uma tarefa por sessão).
