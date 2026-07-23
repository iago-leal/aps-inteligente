# Actions: Calculadora de dor torácica e probabilidade pré-teste de cardiopatia isquêmica

> Identificador: `010-dor-toracica-pre-teste`
> Data: `2026-07-23`
> Roadmap: `_reversa_forward/010-dor-toracica-pre-teste/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 30 |
| Paralelizáveis (`[//]`) | 19 |
| Maior cadeia de dependência | 10 (T003 → T013 → T015 → T016 → T018 → T022 → T025 → T027 → T028 → T029) |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T001 | Medir a linha de base do bundle: `npm run build` no estado atual e registrar o first-load gzip das rotas existentes (`/`, `/dm2/insulina`, `/pre-natal/idade-gestacional`) para a comparação do gate D-08 (roadmap D-09; RNF de desempenho) | - | `[//]` | `_reversa_forward/010-dor-toracica-pre-teste/` | 🟡 | `[X]` |
| `[//]` T002 | Garantir o PDF da fonte em `referencias/` (fora do git) e confirmar/estender o `.gitignore` para a terceira fonte clínica (MD-0008; roadmap §9) | - | `[//]` | `.gitignore` | 🟢 | `[X]` |
| `[//]` T003 | Definir os tipos do domínio em `models/cardiopatia-isquemica/tipos.ts`: `EntradaAvaliacao`, `SaidaAvaliacao` (união `ResultadoAvaliacao` \| `ForaDoEscopoDaFonte` \| `EntradaInvalida` \| `ErroDeInvariante`), `ReferenciaClinica`, enums de classificação da dor, estrato e fator de risco (roadmap D-01; data-delta; RF-01..RF-06) | - | `[//]` | `models/cardiopatia-isquemica/tipos.ts` | 🟢 | `[X]` |

## Fase 2, Testes

<!-- TDD: nascem falhando, antes do núcleo. Property-based para invariantes; oráculo por célula do Quadro 2. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T004 | Unidade (oráculo): para cada uma das 24 células do Quadro 2 (classe da dor × sexo × faixa etária 30–39/40–49/50–59/60–69), a probabilidade-base reproduz exatamente o valor tabelado (RF-02/RN-02) | T003 | `[//]` | `tests/unit/dominio-cardiopatia/probabilidade.test.ts` | 🟢 | `[X]` |
| `[//]` T005 | Unidade: classificação da dor — 3 características → "angina típica"; 2 → "angina atípica"; 0–1 → "dor não anginosa" (RF-01/RN-01) | T003 | `[//]` | `tests/unit/dominio-cardiopatia/classificacao.test.ts` | 🟢 | `[X]` |
| `[//]` T006 | Unidade: ajuste por fatores de risco — sem fator exibe base; com ≥ 1 fator exibe faixa `×2–×3` capada em ">90%/alta"; qualquer fator impede o estrato "baixa"; estratos <10/10–90/>90 corretos (RF-03/RF-04/RN-03/RN-04) | T003 | `[//]` | `tests/unit/dominio-cardiopatia/probabilidade-ajuste.test.ts` | 🟡 | `[X]` |
| `[//]` T007 | Unidade: conduta por estrato — baixa → "exame não indicado" + causas não cardíacas; intermediária/alta → exame não invasivo; ergometria × alternativa quando ECG basal altera/impede exercício; advertência de instabilidade (RF-04/RF-05/RF-07/RN-04/RN-05/RN-07) | T003 | `[//]` | `tests/unit/dominio-cardiopatia/conduta.test.ts` | 🟢 | `[X]` |
| `[//]` T008 | Unidade: validação com coleta total de ofensores (`EntradaInvalida`) e fora-de-escopo por idade fora de 30–69 (`ForaDoEscopoDaFonte`), sem número estimado (RF-06/RF-09/RN-06/RN-09) | T003 | `[//]` | `tests/unit/dominio-cardiopatia/validacao.test.ts` | 🟢 | `[X]` |
| `[//]` T009 | Unidade property-based (fast-check): toda `ResultadoAvaliacao` e todo `ForaDoEscopoDaFonte` carregam ≥ 1 `ReferenciaClinica` (invariante "toda saída referenciada") (RN-09; Princípio VII) | T003 | `[//]` | `tests/unit/dominio-cardiopatia/invariantes.test.ts` | 🟢 | `[X]` |
| `[//]` T010 | Integração da tela (nasce falhando): render do formulário; submissão produz resultado com classificação/probabilidade/conduta; invalidação por edição; fora-de-escopo exibido; ausência de ritual de revisão (RF-01..RF-07; roadmap D-08) | T003 | `[//]` | `tests/integration/interface/cardiologia.test.tsx` | 🟡 | `[X]` |
| `[//]` T011 | Integração: `inicio.test.tsx` ganha caso da nova seção "Cardiologia" e da ficha no catálogo; asserções existentes byte a byte (RF-08) | T003 | `[//]` | `tests/integration/interface/inicio.test.tsx` | 🟢 | `[X]` |
| `[//]` T012 | e2e aditivo em `plataforma.spec.ts`: ficha na home leva a `/cardiologia/dor-toracica`; fluxo típico; fora-de-escopo; exame alternativo; `axe` ≤ baseline (baseline ganha chave da rota nova em zero); asserções antigas byte a byte (RF-01/RF-05/RF-06/RF-08) | T003 | `[//]` | `e2e/plataforma.spec.ts` | 🟡 | `[X]` |

## Fase 3, Núcleo

<!-- Implementa o domínio puro até os testes da Fase 2 ficarem verdes. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T013 | `fonte-clinica.ts`: `REFERENCIAS` (quadros/páginas do TeleCondutas 2017) e `CONSTANTES` congeladas — matriz `PROBABILIDADE_PRE_TESTE[classe][sexo][faixa]` (24 células), `FAIXAS_ETARIAS`, `ESTRATOS`, `CARACTERISTICAS_DOR`, `CAUSAS_NAO_CARDIACAS`; faz T004 verde (roadmap D-02; RN-02/RN-04) | T003 | - | `models/cardiopatia-isquemica/fonte-clinica.ts` | 🟢 | `[X]` |
| T014 | `classificacao.ts`: contagem das três características → classe da dor; faz T005 verde (roadmap D-04; RN-01) | T003, T013 | - | `models/cardiopatia-isquemica/classificacao.ts` | 🟢 | `[X]` |
| T015 | `probabilidade.ts`: lookup na matriz + ajuste por fatores de risco (faixa `×2–×3` capada) + fora-de-escopo por idade; faz T004/T006 verde (roadmap D-02/D-03/D-05; RN-02/RN-03/RN-06) | T013, T014 | - | `models/cardiopatia-isquemica/probabilidade.ts` | 🟡 | `[X]` |
| T016 | `conduta.ts`: mapa estrato → conduta (causas não cardíacas na baixa; ergometria × exame alternativo; advertência de instabilidade); faz T007 verde (roadmap D-04; RN-04/RN-05/RN-07) | T013, T015 | - | `models/cardiopatia-isquemica/conduta.ts` | 🟢 | `[X]` |
| `[//]` T017 | `validacao.ts`: coleta **todos** os ofensores (idade, sexo, características, fatores) e devolve `EntradaInvalida`; sem confiar na UI; faz parte de T008 verde (roadmap D-01; RN-09) | T003, T013 | `[//]` | `models/cardiopatia-isquemica/validacao.ts` | 🟢 | `[X]` |
| T018 | `calculadora.ts`: fachada orquestrando validação → escopo (idade) → classificação → probabilidade → conduta, devolvendo `SaidaAvaliacao`; faz T008/T009 verde (roadmap D-01; RF-01..RF-09) | T014, T015, T016, T017 | - | `models/cardiopatia-isquemica/calculadora.ts` | 🟢 | `[X]` |

## Fase 4, Integração

<!-- Cola com a UI e a navegação. Sem contratos externos. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T019 | `interface/cardiologia/formulario.tsx`: campos (idade, sexo, três características, fatores de risco, impedimento de ergometria, sinais de instabilidade); validação espelhando `CONSTANTES`; edição invalida o resultado (RF-01..RF-07/RN-09) | T018 | `[//]` | `interface/cardiologia/formulario.tsx` | 🟢 | `[X]` |
| `[//]` T020 | `interface/cardiologia/resultado.tsx`: render das quatro variantes de `SaidaAvaliacao` (resultado, fora-de-escopo, entrada inválida, painel honesto), com `ReferenciaClinica` visível (RF-01..RF-06/RN-09) | T018 | `[//]` | `interface/cardiologia/resultado.tsx` | 🟢 | `[X]` |
| `[//]` T021 | `interface/cardiologia/referencias.tsx`: blocos de referência textual (CCS I–IV, tratamento + Tabela 1, seguimento, manejo agudo), cada um citando quadro/página, sem cálculo (RF-10/RN-08; roadmap D-07) | T013 | `[//]` | `interface/cardiologia/referencias.tsx` | 🟢 | `[X]` |
| T022 | `interface/cardiologia/app.tsx` + `tela.tsx`: compõem `Moldura` + formulário + resultado + referências, com o estado do resultado; faz T010 verde (roadmap D-08/D-09; RF-01..RF-07/RF-10) | T019, T020, T021 | - | `interface/cardiologia/tela.tsx` | 🟡 | `[X]` |
| `[//]` T023 | `interface/inicio/catalogo.ts`: nova seção `cardiologia` ("Cardiologia") com a ficha "Calculadora de probabilidade pré-teste de cardiopatia isquêmica" e rota `/cardiologia/dor-toracica`; faz T011 verde (RF-08; roadmap D-06) | T003 | `[//]` | `interface/inicio/catalogo.ts` | 🟢 | `[X]` |
| T024 | `interface/inicio/icones.tsx`: mapear `cardiologia` → Octicon (`HeartIcon`), `aria-hidden`, fallback null (RF-08; roadmap D-06) | T023 | - | `interface/inicio/icones.tsx` | 🟢 | `[X]` |
| T025 | `pages/cardiologia/dor-toracica.tsx`: rota que monta a tela, no molde de `pages/pre-natal/idade-gestacional.tsx`, com metadados; faz T012 verde (RF-08; roadmap D-06) | T022, T023 | - | `pages/cardiologia/dor-toracica.tsx` | 🟢 | `[X]` |
| T026 | `interface/estilos/cardiologia.css` (apenas se o reúso de classes existentes não bastar): importar em `_app.tsx` após globais; sobre tokens Primer, arquivo < 400 linhas (roadmap D-09; RF-08) | T022 | - | `interface/estilos/cardiologia.css` | 🟡 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T027 | Verificação integrada: `lint` + `typecheck` + `test` + `test:api` 16/16 + `test:e2e` verdes; diff das suítes antigas só com adições; `axe` sem aumento sobre baseline; `git diff models/insulina models/gestacao` vazio; nenhum arquivo > 400 linhas (roadmap §10) | T018, T022, T024, T025, T026 | - | `_reversa_forward/010-dor-toracica-pre-teste/` | 🟢 | `[X]` |
| T028 | Medir o bundle final (`npm run build`) e comparar com a base de T001 contra o gate D-08 (< 100 kB gzip no first-load); se estourar, parar e registrar decisão explícita do usuário (RNF de desempenho) | T001, T027 | - | `_reversa_forward/010-dor-toracica-pre-teste/` | 🟡 | `[X]` |
| `[//]` T029 | Consolidar `relatorio.md`: screenshots das telas nos dois temas, evidência dos casos-chave (típico/baixa/fora-de-escopo/alternativa/instabilidade), medições de bundle (T001/T028) e candidatos a watch (cap da faixa D-03; ausência de ritual D-08; transcrição do Quadro 2) | T028 | `[//]` | `_reversa_forward/010-dor-toracica-pre-teste/relatorio.md` | 🟡 | `[X]` |
| `[//]` T030 | Atualizar o README: terceira calculadora e seção "Cardiologia" no catálogo; reforçar a diretriz "como adicionar calculadora"; nota da terceira fonte clínica em `referencias/` (RF-08; MD-0008) | T027 | `[//]` | `README.md` | 🟢 | `[X]` |

## Notas de execução

<!-- Reservado para /reversa-coding. -->

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-to-do` | reversa |
