# Plano de Exploração — aps-inteligente

> Criado pelo Reversa em 2026-07-19 · **Re-extração iniciada em 2026-07-23**
> Marque cada tarefa com ✅ quando concluída.
> Esta é a 2ª passagem do núcleo: absorve as features 001–010 do ciclo forward.

---

## Fase 1: Reconhecimento 🔍

- [x] **Scout** — Mapeamento de estrutura de pastas e tecnologias ✅
- [x] **Scout** — Análise de dependências e gerenciadores de pacotes ✅
- [x] **Scout** — Identificação de entry points, CI/CD e configurações ✅

## Decisão de organização das specs 🗂️

> Já decidida em 2026-07-19 (`feature-folder` / `module`), persistida em `.reversa/config.toml [specs]`. Menu pulado.

## Fase 2: Escavação 🏗️

> Módulos reais (re-extração 2): três domínios + interface + shell + infra.

**Domínio (`models/`):**
- [x] **Arqueólogo** — `models/insulina` (calculadora de insulina DM2) ✅
- [x] **Arqueólogo** — `models/gestacao` (idade gestacional / DPP — feature 007) ✅
- [x] **Arqueólogo** — `models/cardiopatia-isquemica` (dor torácica / pré-teste — feature 010) ✅

**Interface (`interface/`):**
- [x] **Arqueólogo** — `interface/comum` + `interface/calculadora` (Moldura + tela da insulina) ✅
- [x] **Arqueólogo** — `interface/gestacao` + `interface/cardiologia` (telas 007/010) ✅
- [x] **Arqueólogo** — `interface/inicio` + `interface/estilos` (home por seções + CSS Primer) ✅

**Shell e infraestrutura:**
- [x] **Arqueólogo** — `pages` (shell Next.js, rotas, PWA) + `pages/api/v1/status` ✅
- [x] **Arqueólogo** — `infra` (pool pg + compose PostgreSQL) ✅

## Fase 3: Interpretação 🧠

- [x] **Detetive** — Arqueologia Git e ADRs retroativos ✅
- [x] **Detetive** — Regras de negócio implícitas e máquinas de estado ✅
- [x] **Detetive** — Matriz de permissões (RBAC/ACL) ✅
- [x] **Arquiteto** — Diagramas C4 (Contexto, Containers, Componentes) ✅
- [x] **Arquiteto** — ERD completo e integrações externas ✅
- [x] **Arquiteto** — Spec Impact Matrix ✅

## Fase 4: Geração 📝

- [x] **Redator** — Specs SDD por componente ✅ (11 units: 9 novas + 2 regeneradas)
- [x] **Redator** — OpenAPI ✅ (`openapi/status.yaml`)
- [x] **Redator** — User Stories ✅ (datação gestacional, estratificação de dor torácica)
- [x] **Redator** — Code/Spec Matrix ✅ (atualizada para os 3 domínios)

## Fase 5: Revisão ✅

- [x] **Revisor** — Revisão cruzada de specs ✅ (12 units; 2 legacy-mapping obsoletos corrigidos)
- [x] **Revisor** — Resolução de lacunas com o usuário ✅ (9 premissas clínicas mantidas 🟡 por decisão do usuário)
- [x] **Revisor** — Relatório de confiança final ✅ (~94% 🟢)

## Fase 6: Verificação de regressão 🔁

- [x] Verificar os 10 `regression-watch.md` de `_reversa_forward/` contra o SDD regenerado ✅ (44 itens: 43 🟢, 1 🟡, 0 🔴)
- [x] Reconciliar os adendos de `_reversa_sdd/addenda/` (marcar "Superado pela re-extração") ✅ (10 adendos superados)

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

- `/reversa-migrate`: orquestrador do **Time de Migração** (Paradigm Advisor → Curator → Strategist → Designer → Screen Translator → Inspector). Gera as specs do sistema novo. Saída em `_reversa_sdd/migration/` e `_reversa_sdd/screens/`.
- `/reversa-reconstructor`: gera plano bottom-up para reimplementar o software a partir das specs do legado (uma tarefa por sessão).
