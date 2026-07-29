# Plano de Exploração — aps-inteligente

> Criado pelo Reversa em 2026-07-19 · **4ª passagem iniciada em 2026-07-28**
> Marque cada tarefa com ✅ quando concluída.
> Esta é a 4ª passagem do núcleo: absorve as features **015–022** do ciclo forward
> sobre a base da re-extração 3 (que já cobria 001–014).

---

## Delta desta passagem (o que mudou desde a re-extração 3)

**Domínio — a família `models/` deixa de ser homogênea:**

- 🆕 **`models/puericultura`** — quinto domínio clínico (feature 017): escores z de crescimento
  infantil por LMS, curvas da OMS e INTERGROWTH-21st, 18 regras novas. Traz o primeiro
  **acervo tabular embarcado** (12.964 linhas L/M/S em 14 módulos gerados, com `sha256`) e um
  **oráculo congelado** de 356 casos + 1596 células. **Domínio novo, análise do zero.**
- 🆕 **Submódulo `models/puericultura/consulta/`** — a mesma unit ganha a **segunda fachada**,
  `RegistroDeConsultaPuericultura.montar` (feature 020). Primeiro caso de duas fachadas sob uma
  unit, e primeira saída do produto que **não é um número**, mas texto SOAP com contrato de forma.
- 🆕 **`models/contribuicao`** — primeiro unit de domínio **não clínico** (feature 019): BR Code
  PIX estático, CRC16. Isento por escrito de fonte clínica única, `ReferenciaClinica` e catálogo
  congelado (`MD-0022`), conservando os demais invariantes da família.

**Interface — o cabeçalho fecha e a moldura cresce:**

- 🔧 **`interface/comum`** — contrato da `Moldura` alterado: `logoComoTitulo` **removida**,
  `comInicio` acrescentada (016); e a `Moldura` passa a ser **dona do enquadramento horizontal**
  de toda tela, com a coluna do corpo no `<main>` (021).
- 🆕 **`interface/puericultura`** (tela de crescimento, 017) e **`interface/puericultura/consulta`**
  (ficha SOAP, 020). **Telas novas.**
- 🆕 **`interface/contribuicao`** — painel de apoio via PIX na home (019). **Tela nova.**
- 🔧 **`interface/inicio`** — catálogo com **quatro seções** e duas fichas de puericultura;
  bloco de apoio **fora** do `map` do `CATALOGO`; o catálogo vira também oráculo da descrição
  da plataforma (018).
- 🔧 **`interface/estilos`** — de cinco para **nove** folhas: `puericultura.css`,
  `contribuicao.css`, `consulta-puericultura.css`, `moldura.css`; `inicio.css` reduzida ao
  mínimo; `globais.css` encolhe abaixo das 364 linhas.
- 🔧 **`interface/calculadora`** e demais telas — cinco literais revistos; `comInicio` declarada.

**Shell, API e infraestrutura:**

- 🔧 **`pages`** — duas rotas novas (`/puericultura/crescimento`, `/puericultura/consulta`),
  totalizando nove; os doze metadados das rotas revisados, com correção de exatidão na
  `description` da raiz (018).
- 🔧 **`pages/api/v1/status`** — **a inversão desta passagem**: o handler passa a `async`, consulta
  o banco de verdade e devolve **seis** chaves (`publicado_em`, `ambiente`, `banco` acrescidas).
  200 em todo estado do banco, inclusive degradado (`MD-0031`).
- 🔧 **`infra`** — deixa de ser arquivo único: nasce `infra/saude.ts`; o pool ganha
  `connectionTimeoutMillis` e `statement_timeout` derivados de `APS_TIMEOUT_SAUDE_MS`;
  `CausaDeErroDeBanco` ganha a quarta causa, `tempo_esgotado`.

**Camada nova, que a extração 3 não conhece:**

- 🆕 **`scripts/**` — camada dev-time** acima das três: quatro geradores idempotentes
  (tabelas da OMS, oráculo congelado, inventário textual, fichas da caderneta). Não entra no
  bundle e não é importada por `models/`, `interface/` nem `pages/`.
- 🆕 **`tests/unit/textos/`** — sete verificadores da norma de redação (018), com
  `docs/redacao.md` e o princípio **IX** de `.reversa/principles.md`.

**Dívidas que só esta passagem fecha:**

- **L-07** — `domain.md` §7.2, item 11, ainda descreve a `Moldura` governada por
  `logoComoTitulo`, prop que o componente não tem mais (apontado pelo adendo 021).
- **L-11** — a cifra de testes de `architecture.md` §5 ("37 arquivos") está defasada desde a
  feature 018; a suíte real fechou a 022 com **816 testes em 67 arquivos**.
- **Rota de status sem I/O** — `code-analysis.md` (módulo 13) e `architecture.md` §1/§2/§4
  descrevem um handler síncrono sem dependência.

**Reconciliação:** marcar os adendos **015–022** como "Superado pela re-extração" quando
absorvidos na base; `MD-0022` a `MD-0032` entram como decisões registradas.

Os módulos intocados (insulina, gestacao, cardiopatia-isquemica, risco-cardiovascular,
cardiologia) são **reconfirmados** contra o código, não reescritos sem motivo.

---

## Fase 1: Reconhecimento 🔍

- [x] **Scout** — Mapeamento de estrutura de pastas e tecnologias (incl. `scripts/**` dev-time) ✅ 21 módulos
- [x] **Scout** — Análise de dependências (`react-qr-code@2.2.0`, primeira desde a 010) ✅ + `prop-types` por arrasto
- [x] **Scout** — Identificação de entry points, CI/CD e configurações ✅ 18 entry points, 3 jobs de CI

## Decisão de organização das specs 🗂️

> Já decidida em 2026-07-19 (`feature-folder` / `module`), persistida em `.reversa/config.toml [specs]`. Menu pulado.

## Fase 2: Escavação 🏗️

> Cinco domínios clínicos + um não clínico + interface + shell + infra + dev-time.
> Foco de esforço no delta 015–022.

**Domínio (`models/`):**
- [x] **Arqueólogo** — `models/insulina` ✅ (reconfirmado; motor intocado)
- [x] **Arqueólogo** — `models/gestacao` ✅ (reconfirmado; só comentário em `datas.ts`)
- [x] **Arqueólogo** — `models/cardiopatia-isquemica` ✅ (reconfirmado)
- [x] **Arqueólogo** — `models/risco-cardiovascular` ✅ (reconfirmado)
- [x] 🆕 **Arqueólogo** — `models/puericultura` — motor de crescimento + acervo tabular (017)
- [x] 🆕 **Arqueólogo** — `models/puericultura/consulta` — segunda fachada, SOAP (020)
- [x] 🆕 **Arqueólogo** — `models/contribuicao` — unit não clínico, BR Code + CRC16 (019)

**Interface (`interface/`):**
- [x] 🔧 **Arqueólogo** — `interface/comum` (`Moldura`: `comInicio`, coluna do corpo — 016/021)
- [x] 🆕 **Arqueólogo** — `interface/puericultura` + `interface/puericultura/consulta`
- [x] 🆕 **Arqueólogo** — `interface/contribuicao` (painel PIX)
- [x] 🔧 **Arqueólogo** — `interface/inicio` (catálogo em quatro seções + bloco de apoio)
- [x] 🔧 **Arqueólogo** — `interface/estilos` (nove folhas) + `interface/calculadora` (literais revistos)
- [x] **Arqueólogo** — `interface/cardiologia` + `interface/gestacao` + `interface/risco-cardiovascular` ✅ (reconfirmados)

**Shell, infraestrutura e camada dev-time:**
- [x] 🔧 **Arqueólogo** — `pages` (nove rotas, metadados revistos — 018)
- [x] 🔧 **Arqueólogo** — `pages/api/v1/status` (I/O real, seis campos — 022)
- [x] 🔧 **Arqueólogo** — `infra` (`saude.ts`, tetos, quarta causa — 022)
- [x] 🆕 **Arqueólogo** — `scripts/**` (camada dev-time: quatro geradores idempotentes)

## Fase 3: Interpretação 🧠

- [x] **Detetive** — Arqueologia Git e ADRs retroativos (features 015–022, `MD-0022`–`MD-0033`) ✅ 6 ADRs novos (0016–0021)
- [x] **Detetive** — Regras de negócio implícitas e máquinas de estado (puericultura, consulta, contribuição) ✅ 76 regras; 13 máquinas/cascatas
- [x] **Detetive** — Matriz de permissões (RBAC/ACL) ✅ veredito preservado, conferido contra 019/020/022
- [x] **Arquiteto** — Diagramas C4 (5º e 6º units de `models/`, camada dev-time) ✅ 3 recortes de componentes
- [x] **Arquiteto** — ERD completo e integrações externas (OMS, INTERGROWTH-21st, BR Code, Neon em runtime) ✅ 8 integrações, 2 contratos emitidos
- [x] **Arquiteto** — Spec Impact Matrix (duas fachadas sob uma unit — arranjo inédito) ✅ 19×20, coluna `scripts` nova

## Fase 4: Geração 📝

- [x] **Redator** — Specs SDD por componente (units novas + atualizadas) ✅ 7 novas + 7 atualizadas, 37 arquivos
- [x] **Redator** — OpenAPI (`openapi/status.yaml`: seis chaves, exemplo defasado) ✅ 3 exemplos + `EstadoDoBanco`
- [x] **Redator** — User Stories (crescimento infantil, consulta SOAP, contribuição) ✅ 3 novas
- [x] **Redator** — Code/Spec Matrix (duas fachadas sob `models/puericultura`) ✅ + camada dev-time, 816 testes

## Fase 5: Revisão ✅

- [x] **Revisor** — Revisão cruzada de specs ✅ 21 units (Codex indisponível; revisão própria com 10 aferições)
- [x] **Revisor** — Resolução de lacunas com o usuário ✅ 24 premissas em `questions.md`, 2 lacunas 🔴 em `gaps.md`
- [x] **Revisor** — Relatório de confiança final ✅ ~93% 🟢

## Fase 6: Verificação de regressão 🔁

- [x] Verificar os `regression-watch.md` de `_reversa_forward/` (21 features) contra o SDD regenerado ✅ 179 itens: 169 🟢 · 9 🟡 · 1 🔴
- [x] Reconciliar os adendos 015–022 de `_reversa_sdd/addenda/` (marcar "Superado pela re-extração") ✅ 8 adendos marcados

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
