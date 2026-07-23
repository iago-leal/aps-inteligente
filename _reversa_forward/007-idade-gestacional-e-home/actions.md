# Actions: Calculadora de idade gestacional (DUM ou ultrassom) e página inicial por categorias

> Identificador: `007-idade-gestacional-e-home`
> Data: `2026-07-23`
> Roadmap: `_reversa_forward/007-idade-gestacional-e-home/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 19 |
| Paralelizáveis (`[//]`) | 14 |
| Maior cadeia de dependência | 10 (T001 → T003 → T008 → T010 → T012 → T013 → T015 → T016 → T017 → T018) |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T001 | Criar o esqueleto da unit de domínio: `models/gestacao/tipos.ts` (EntradaDatacao, SaidaDatacao, ResultadoDatacao, DatacaoCalculada, ComparacaoDatacoes, Ofensor — `data-delta.md#1`) e `models/gestacao/fonte-clinica.ts` (REFERENCIAS pp. 31–32/113 do Guia Rápido Pré-Natal e CONSTANTES congeladas: limites de validação, margens 7/14 dias, cortes de trimestre), cabeçalhos citando RF-01..04 e RN-01..07 (D-01) | - | `[//]` | `models/gestacao/tipos.ts` | 🟢 | `[X]` |
| `[//]` T002 | Criar o catálogo tipado da plataforma: `interface/inicio/catalogo.ts` com as duas seções (Diabetes Mellitus tipo 2 → `/dm2/insulina`; Pré-natal → `/pre-natal/idade-gestacional`), títulos e descrições dos cartões; fonte única anti-drift, cabeçalho citando RF-05/RF-06 e RN-08 (D-06, D-07) | - | `[//]` | `interface/inicio/catalogo.ts` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T003 | Teste de unidade da datação (nasce falhando): RN-01 (IG = ⌊dias/7⌋ + resto sobre a data de referência), RN-02 Naegele com o exemplo literal da fonte (DUM 03/02/2020 → DPP 10/11/2020), estouro de dia no mês destino (DUM 24/05) e bissexto/29-02, RN-03 (DUM equivalente da USG), RN-04 (limites 13+6→14+0 e 27+6→28+0), mais os cenários fixos do `requirements.md#7` (`data-delta.md#5`) | T001 | `[//]` | `tests/unit/dominio-gestacao/datacao.test.ts` | 🟢 | `[X]` |
| `[//]` T004 | Teste de unidade da validação (nasce falhando): coleta total de ofensores (nunca para no primeiro), catálogo completo (`DUM_FUTURA`, `DUM_ALEM_DE_44_SEMANAS`, `DATA_EXAME_FUTURA`, `IG_LAUDO_FORA_DE_FAIXA`, `DATACAO_ULTRASSOM_INCOMPLETA`, `NENHUMA_DATACAO_INFORMADA`, `DATA_INVALIDA`), limites exatos das CONSTANTES (RN-05; RF-03) | T001 | `[//]` | `tests/unit/dominio-gestacao/validacao.test.ts` | 🟡 | `[X]` |
| `[//]` T005 | Teste de invariantes por propriedade (nasce falhando): toda saída de sucesso carrega referência não vazia (RN-06); IG ≥ 0 e dias 0–6 para qualquer entrada válida; ida e volta DUM↔dias epoch; determinismo (mesma entrada → mesma saída); comparação DUM×USG — veredito `dum-fora-da-margem` sse diferença > margem do trimestre da USG (7/14), `sem-parametro-na-fonte` no 3.º trimestre (RN-11; D-04, D-05) | T001 | `[//]` | `tests/unit/dominio-gestacao/invariantes.test.ts` | 🟡 | `[X]` |
| `[//]` T006 | Teste de integração da tela de IG (nasce falhando): formulário com DUM e/ou USG, ofensores por campo com coleta total, resultado com datações/comparação/divergência destacada, data de referência e nota de estimativa visíveis (RF-07), referência clínica presente, **ausência** do ritual de revisão (D-08), painel honesto em exceção | T001 | `[//]` | `tests/integration/interface/gestacao.test.tsx` | 🟡 | `[X]` |
| `[//]` T007 | Teste de integração da home (nasce falhando): duas seções do catálogo renderizadas com seus cartões e links, nenhuma seção vazia, títulos conforme RN-08, navegação acessível (landmarks/headings) (RF-05) | T002 | `[//]` | `tests/integration/interface/inicio.test.tsx` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T008 | Implementar `models/gestacao/datas.ts` (aritmética de dias epoch em UTC, parse/format `AAAA-MM-DD`, soma calendárica de meses com transbordo documentado — D-02) e `models/gestacao/datacao.ts` (RN-01 IG, RN-02 Naegele, RN-03 retroprojeção, RN-04 trimestre); T003 verde | T001, T003 | `[//]` | `models/gestacao/datacao.ts` | 🟢 | `[X]` |
| `[//]` T009 | Implementar `models/gestacao/validacao.ts`: coleta total de ofensores contra as CONSTANTES, ao menos uma datação completa, datas parseadas com `DATA_INVALIDA` como valor (RN-05; RF-03); T004 verde | T001, T004 | `[//]` | `models/gestacao/validacao.ts` | 🟡 | `[X]` |
| T010 | Implementar `models/gestacao/calculadora.ts` (fachada): validação → datação por método presente → comparação DUM×USG com margem pelo trimestre da USG e veredito informativo (RN-11; D-04, D-05) → referências e notas fixas; erros como valores, `ErroDeInvariante` só para bug interno (ADR 0004); T005 verde | T005, T008, T009 | - | `models/gestacao/calculadora.ts` | 🟡 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T011 | Extrair a moldura comum de `interface/calculadora/tela.tsx` para `interface/comum/moldura.tsx` (cabeçalho com selo "nada é salvo nem enviado" + alternador de tema), refactor byte a byte sem mudança de comportamento — suíte de integração e e2e da insulina permanecem verdes sem alterar asserção (D-09; RF-08) | - | `[//]` | `interface/comum/moldura.tsx` | 🟡 | `[X]` |
| `[//]` T012 | Implementar `interface/gestacao/formulario.tsx` (+ validação espelhada importando CONSTANTES de `models/gestacao` — campos DUM e USG opcionais, mensagens por campo, `role="alert"`), estado no molde de `calculadora-app.tsx` sem `revisaoConfirmada`; parte de T006 verde | T006, T010 | `[//]` | `interface/gestacao/formulario.tsx` | 🟡 | `[X]` |
| T013 | Implementar `interface/gestacao/resultado.tsx` (datações, comparação com destaque da USG quando `dum-fora-da-margem`, referências, data de referência + nota de estimativa) e `interface/gestacao/tela.tsx` sobre a moldura comum; T006 verde por completo | T011, T012 | - | `interface/gestacao/resultado.tsx` | 🟡 | `[X]` |
| `[//]` T014 | Implementar a home `interface/inicio/tela.tsx`: seções e cartões renderizados a partir do `catalogo.ts`, sobre a moldura comum, componentes do design system vigente (adendo 004); T007 verde | T002, T007, T011 | `[//]` | `interface/inicio/tela.tsx` | 🟢 | `[X]` |
| T015 | Recompor as rotas: `pages/index.tsx` passa a montar a home (metadados da plataforma); criar `pages/dm2/insulina.tsx` com o conteúdo atual da raiz (título/description preservados) e `pages/pre-natal/idade-gestacional.tsx` com metadados próprios (RF-05, RF-06; D-06) | T013, T014 | - | `pages/index.tsx` | 🟡 | `[X]` |
| T016 | E2E: atualizar `e2e/calculadora.spec.ts` para a rota `/dm2/insulina` (asserções de comportamento intactas) e criar `e2e/plataforma.spec.ts` — home com duas seções, navegação às duas calculadoras, cálculo de IG por DUM com valores do onboarding, zero requisição de rede, axe na linha de base 0 nos dois viewports (D-10) | T015 | - | `e2e/plataforma.spec.ts` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T017 | Verificação integrada do critério de pronto (roadmap §10): `lint` + `typecheck` + `npm test` + cobertura ≥ 90% em `models/**` (incluindo a unit nova) + `test:api` 16/16 + `test:e2e` verdes; `git diff models/insulina/` vazio; nenhum arquivo > 400 linhas; cabeçalhos RF-NN presentes nos arquivos novos | T016 | - | `_reversa_forward/007-idade-gestacional-e-home/` | 🟢 | `[X]` |
| `[//]` T018 | Consolidar `relatorio.md` da feature: exemplos reais das três saídas (DUM, USG, entrada dupla), registro da normalização do transbordo de Naegele, resultado do axe, e candidatos a watch — premissas 🟡 do roadmap §4 (cortes de trimestre, limites de validação, ausência do ritual, 3.º trimestre sem veredito) | T017 | `[//]` | `_reversa_forward/007-idade-gestacional-e-home/relatorio.md` | 🟢 | `[X]` |
| `[//]` T019 | Atualizar o README: raiz agora é a home; rotas das duas calculadoras; diretriz "como adicionar nova calculadora" (entrada no `catalogo.ts` + rota + tela), na linha da diretriz de telas da feature 004 | T017 | `[//]` | `README.md` | 🟢 | `[X]` |

## Notas de execução

- T013: duas asserções de T006 foram precisadas de `getByText` para `getByRole("heading")` ("Pela DUM"/"Pelo ultrassom") porque o mesmo texto aparece legitimamente no cabeçalho do bloco e na mensagem da comparação (RN-11) — ambiguidade de consulta, não mudança de comportamento esperado.
- T011: `preferencia-de-tema.ts` permaneceu em `interface/calculadora/` (provedor de tema e sua suíte apontam para lá); a moldura comum o importa de lá, com realocação anotada para a re-extração.

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.
-->

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-to-do` | reversa |
