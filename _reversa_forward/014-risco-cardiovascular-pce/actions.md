# Actions: Calculadora de risco cardiovascular (Pooled Cohort Equations — ACC/AHA)

> Identificador: `014-risco-cardiovascular-pce`
> Data: `2026-07-23`
> Roadmap: `_reversa_forward/014-risco-cardiovascular-pce/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 22 |
| Paralelizáveis (`[//]`) | 10 |
| Maior cadeia de dependência | 10 (T001 → T002 → T005/6/7/8 → T009 → T012 → T013 → T014 → T015 → T021 → T022) |

## Fase 1, Preparação

<!-- Fundação do domínio puro: tipos e fonte clínica congelada. Sem migração de banco (data-delta §0). -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Criar os value objects da unit: `Sexo`, `Raca`, `EntradaEstimativa`, `GrupoPce`, `CategoriaRisco`, a união `SaidaEstimativa = ResultadoEstimativa \| ForaDoEscopoDaFonte \| EntradaInvalida` (discriminada por `tipo`), `Ofensor`/`CodigoOfensor`, `Aviso`, `ReferenciaClinica` e a classe `ErroDeInvariante`. Espelha `models/cardiopatia-isquemica/tipos.ts` (data-delta §1–2, D-03) | - | - | `models/risco-cardiovascular/tipos.ts` | 🟢 | `[X]` |
| T002 | Congelar (`Object.freeze` aninhado) as constantes clínicas: `COEFICIENTES` dos quatro grupos em precisão estendida (investigation §4.1), `BASELINE_SURVIVAL` (0.91436/0.89536/0.96652/0.95334), `MEANS` (61.1816/**19.5425**/−29.1817/86.6081), `FAIXAS`, `CATEGORIAS` (5/7,5/20), `REFERENCIAS` e `NOTA_PROVENIENCIA`, cada bloco comentado com a Tabela A de Goff 2013 (D-04, data-delta §3) | T001 | - | `models/risco-cardiovascular/fonte-clinica.ts` | 🟢 | `[X]` |

## Fase 2, Testes

<!-- Testes de domínio derivados da spec (golden cases + invariantes), escritos contra as assinaturas de T001/T002; guiam o núcleo (Princípio VII). -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | *Golden cases* das PCE em vitest, tolerância ±0,1 pp: no mínimo homem branco baseline (5.4%), mulher negra baseline (3.0%) e o caso alto-risco (20.8%), cobrindo sexo, raça e as três faixas de categoria; incluir as variações tratada/fumante/diabetes da investigation §6 como reforço | T001, T002 | `[//]` | `tests/unit/dominio-risco-cardiovascular/equacao.test.ts` | 🟢 | `[X]` |
| T004 | Invariantes property-based (fast-check): toda `SaidaEstimativa` do tipo `"resultado"` carrega ≥1 referência (RF-08); todo valor fora de faixa fisiológica gera `Aviso` de clamp (D-07); a validação faz coleta total de ofensores (nunca para no primeiro erro, domain.md regra 15) | T001, T002 | `[//]` | `tests/unit/dominio-risco-cardiovascular/invariantes.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

<!-- Lógica central de domínio: elegibilidade, equação, categoria, validação e a fachada que as orquestra. Motores existentes intocados. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Regra de elegibilidade: idade fora de 40–79 → `ForaDoEscopoDaFonte` com `motivo: "IDADE_FORA_DA_FAIXA"`; `dcvPrevia === true` → `ForaDoEscopoDaFonte` com `motivo: "DCV_PREVIA"` (D-06, RF-05) | T001, T002 | `[//]` | `models/risco-cardiovascular/elegibilidade.ts` | 🟢 | `[X]` |
| T006 | Núcleo de cálculo: `grupoDe(sexo, raca)` (`"outra"` → coeficientes de branco, RN-05, data-delta §4), montagem dos termos por grupo (estrutura distinta por grupo, investigation §3) e `Risco_10 = 1 − S0^exp(Σ(β·X) − mean_grupo)` com variáveis contínuas em `Ln`; PAS por coeficiente tratada×não-tratada mutuamente exclusivo | T001, T002 | `[//]` | `models/risco-cardiovascular/equacao.ts` | 🟢 | `[X]` |
| T007 | Classificação em `CategoriaRisco` pelos cortes congelados (< 5 baixo; 5–<7,5 limítrofe; ≥7,5–<20 intermediário; ≥20 alto), RF-07/investigation §7 | T001, T002 | `[//]` | `models/risco-cardiovascular/categoria.ts` | 🟢 | `[X]` |
| T008 | Validação de entrada: ofensores de tipo/domínio com coleta total (`SEXO_INVALIDO`, `RACA_INVALIDA`, `IDADE_INVALIDA`, `COLESTEROL_INVALIDO`, `HDL_INVALIDO`, `PAS_INVALIDA`) e *clamp* dos numéricos fora da faixa fisiológica ao limite mais próximo, emitindo `Aviso` (não trava, D-07) | T001, T002 | `[//]` | `models/risco-cardiovascular/validacao.ts` | 🟡 | `[X]` |
| T009 | Fachada `CalculadoraRiscoCardiovascular.estimar(entrada): SaidaEstimativa`: orquestra validação → elegibilidade → equação → categoria; monta `ResultadoEstimativa` com `riscoPct`, `categoria`, `avisos`, `notaProveniencia` e `referencias` (nunca vazia); `ErroDeInvariante` só para bug interno (D-03, ADR 0004) | T005, T006, T007, T008 | - | `models/risco-cardiovascular/calculadora.ts` | 🟢 | `[X]` |

## Fase 4, Integração

<!-- Tela sobre a Moldura comum, rota do Pages Router, catálogo, folha de estilo e teste de integração da tela. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T010 | Componente da nota de proveniência, alimentado por `NOTA_PROVENIENCIA` do domínio (fonte textual única anti-drift, D-09/RF-10) | T002 | `[//]` | `interface/risco-cardiovascular/proveniencia.tsx` | 🟢 | `[X]` |
| T011 | Formulário: sexo, raça, idade, colesterol total, HDL, PAS, em tratamento anti-hipertensivo, diabetes, tabagismo atual e DCV prévia; reusa `interface/calculadora/erro-de-campo` | T001 | `[//]` | `interface/risco-cardiovascular/formulario.tsx` | 🟢 | `[X]` |
| T012 | Resultado: risco % + `CategoriaRisco` + avisos de clamp + nota de proveniência + referências; **sem** emitir conduta (RN-06/ADR 0005) | T009, T010 | - | `interface/risco-cardiovascular/resultado.tsx` | 🟢 | `[X]` |
| T013 | Componente de aplicação com `EstadoRiscoCardiovascular` (`vazio → sucesso \| fora-do-escopo \| erro \| falha-inesperada`, state-machines §3, sem ritual de revisão D-08); chama a fachada e reusa `interface/calculadora/relator-de-erros` | T009, T011, T012 | - | `interface/risco-cardiovascular/app.tsx` | 🟢 | `[X]` |
| T014 | Tela que compõe o app dentro da `interface/comum/moldura` (variante calculadora) | T013 | - | `interface/risco-cardiovascular/tela.tsx` | 🟢 | `[X]` |
| T015 | Rota do Pages Router em `pages/cardiologia/risco-cardiovascular.tsx`, molde de `pages/cardiologia/dor-toracica.tsx`, com `<Head>` e aviso de cálculo local; raiz e rotas existentes inalteradas (D-02) | T014 | - | `pages/cardiologia/risco-cardiovascular.tsx` | 🟢 | `[X]` |
| T016 | Adicionar a **segunda** ficha da seção `cardiologia` no catálogo, preservando a ficha existente byte a byte (delta §5) | - | `[//]` | `interface/inicio/catalogo.ts` | 🟢 | `[X]` |
| T017 | Folha de estilo própria só com tokens Primer, sem cor literal; `globais.css` intocado (D adendo 009) | - | `[//]` | `interface/estilos/risco-cardiovascular.css` | 🟢 | `[X]` |
| T018 | Importar `risco-cardiovascular.css` ao final do bloco de CSS de `pages/_app.tsx` (após a linha 25, `cardiologia.css`) | T017 | - | `pages/_app.tsx` | 🟢 | `[X]` |
| T019 | Teste de integração da tela: entrada válida → risco % + categoria; idade fora de 40–79 → `fora-do-escopo`; DCV prévia → `fora-do-escopo`; dois campos inválidos → dois ofensores; asserção de que o resultado **não** recomenda estatina; nota de proveniência visível | T014 | - | `tests/integration/interface/risco-cardiovascular.test.tsx` | 🟢 | `[X]` |

## Fase 5, Polimento

<!-- Cobertura da home, jornada e2e e linha de base de acessibilidade. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T020 | Acrescentar +1 caso ao teste da home cobrindo a nova ficha da seção Cardiologia, mantendo as asserções das fichas antigas byte a byte | T016 | - | `tests/integration/interface/inicio.test.tsx` | 🟢 | `[X]` |
| T021 | Bloco e2e da rota nova: navegação da home → `/cardiologia/risco-cardiovascular`, cálculo de um caso conhecido e verificação de `fora-do-escopo`, no molde dos testes de cardiologia da `plataforma.spec.ts` | T015, T016 | - | `e2e/plataforma.spec.ts` | 🟢 | `[X]` |
| T022 | Registrar as duas chaves da rota nova em zero na linha de base do axe (0/0), garantindo acessibilidade sem violação | T021 | - | `e2e/axe-baseline.json` | 🟢 | `[X]` |

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.
-->

- Invariante transversal a toda a fase 3/4: `git diff` de `models/insulina`, `models/gestacao` e `models/cardiopatia-isquemica` deve permanecer vazio (critério de pronto do roadmap §10); a unit nova é 100 % aditiva.
- Ordem de introdução recomendada (roadmap §8): domínio → testes de domínio → tela → integração → rota + catálogo + CSS → e2e/axe.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-to-do` | reversa |
