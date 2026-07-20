# Requirements: Integração do design aprovado da calculadora — divergências clínicas e entrada por momento

> Identificador: `001-integrar-design-claude`
> Data: `2026-07-19`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A feature integra ao repositório as quatro mudanças aprovadas no design da tela da calculadora de insulina: duas regras clínicas novas (captura da dose de metformina com alerta de otimização; captura da taxa de filtração glomerular, TFG, para ajustar ou contraindicar a metformina), uma regra ampliada (recomendação de suspender sulfonilureia em dois gatilhos adicionais) e a reestruturação da entrada de glicemias em quatro campos por momento de aferição. O beneficiário é o médico prescritor da Atenção Primária à Saúde (APS), que hoje opera uma calculadora cujo domínio ainda não reflete as condutas aprovadas no design. Fora do escopo: a paridade visual (tokens, tipografia e layout), já entregue em 19/07/2026, e qualquer conteúdo clínico além do que o Guia Rápido DM (SMS-Rio, 2.ª ed. 2023) cobre.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/domain.md#7-intenções-declaradas-e-não-realizadas` | As quatro divergências aprovadas no design e ausentes do domínio; itens 1–2 dependem de conteúdo do guia ainda não extraído | 🔴 |
| `_reversa_sdd/traceability/spec-impact-matrix.md#4-impacto-das-mudanças-pendentes-conhecidas` | Impacto de cada divergência mapeado por camada: entrada do cálculo, regras, constantes, formulário, resultado e testes | 🟢 |
| `_reversa_sdd/domain.md#3.2-titulação-basal` (regra 8) | Regra atual: recomendação de suspender sulfonilureia só na transição do fracionamento, com uso explícito — base alterada pela RN-03 | 🟢 |
| `_reversa_sdd/domain.md#3.2` (regra 4) e `#3.3` (regra 11) | Agregação por média com prevalência de hipoglicemia — semântica preservada pela nova captura por momento | 🟢 |
| `_reversa_sdd/code-analysis.md#módulo-2--interfacecalculadora-apresentação` | Formulário controlado com validação espelhada via catálogo único de constantes; quebra declarada dos testes de integração do formulário | 🟢 |
| `_reversa_sdd/architecture.md#6-dívidas-técnicas` (dívida 7) | As divergências pendentes registradas como dívida de gravidade alta | 🟢 |
| `_reversa_sdd/addenda/bug-BUG-20260719-RHZ5-v001.md` | RN-H vigente do gate de HbA1c: a intensificação foi alterada há pouco; a regressão correspondente deve permanecer intacta | 🟢 |
| Projeto de design "Tela de calculadora de insulina" (`CLAUDE.md`, lido em 19/07/2026) | Registro autoritativo das pendências acordadas e das divergências aprovadas; confirma que o conteúdo clínico dos itens 1–2 está no guia, ainda não extraído | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico prescritor da APS | Iniciar ou ajustar insulinização no DM2 (diabetes mellitus tipo 2) com apoio rastreável ao guia | A cada consulta de ajuste, informa peso, glicemias por momento, HbA1c, esquema atual e, agora, dose de metformina e TFG, e recebe condutas com referência |

## 4. Regras de negócio novas ou alteradas

1. **RN-01 (metformina):** o sistema captura a dose diária atual de metformina e, antes de iniciar ou titular insulina, alerta quando essa dose não está otimizada segundo o guia. 🔴
   - Origem no legado: nenhuma — regra nova, aprovada no design; conteúdo clínico (faixas de otimização) presente no guia, ainda não extraído (`_reversa_sdd/domain.md#7`)
   - Tipo: nova
2. **RN-02 (TFG):** o sistema captura a taxa de filtração glomerular e recomenda ajustar ou contraindicar a metformina conforme a faixa de TFG definida no guia. 🔴
   - Origem no legado: nenhuma — regra nova, aprovada no design; limiares dependem da mesma extração citada do guia
   - Tipo: nova
3. **RN-03 (sulfonilureia ampliada):** a recomendação de suspender sulfonilureia passa a ser emitida também (a) quando o uso de sulfonilureia é "não informado", com redação condicional que explicita a ausência da informação — "Uso de sulfonilureia não informado: se estiver em uso, suspender ao fracionar a NPH (insulina basal de ação intermediária)", adaptando-se o trecho final ao contexto do esquema já fracionado —, e (b) quando o esquema já chega com NPH fracionada, não apenas na transição do fracionamento; no gatilho (b), a recomendação vale tanto para uso explícito (redação direta atual) quanto para uso não informado (redação condicional). 🟢
   - Origem no legado: `_reversa_sdd/domain.md#3.2` (regra 8) — hoje a recomendação sai só ao fracionar com `usoSulfonilureia === true`
   - Decisões da sessão de esclarecimentos de 2026-07-19 (perguntas 3 e 4)
   - Tipo: alterada
4. **RN-04 (captura por momento, semântica preservada):** a entrada de glicemias passa a quatro campos por momento — jejum, antes do almoço, antes do jantar, ao deitar —, cada um aceitando várias aferições com o **espaço como único separador**; vírgula ou ponto continuam valendo como decimal dentro de cada valor (ex.: `98,5 130 210`); campo vazio equivale a momento não aferido; não há máximo de aferições por campo. A agregação clínica não muda (média por momento, hipoglicemia prevalecendo), e o contrato interno de lista de aferições permanece o mesmo. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#3.2` (regra 4) e `#3.3` (regra 11); `_reversa_sdd/traceability/spec-impact-matrix.md#4` (divergência 4: nenhum impacto no domínio)
   - Tipo: alterada (somente a captura; a regra clínica é mantida)

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Capturar a dose diária atual de metformina (campo opcional) e emitir alerta de otimização conforme RN-01, com referência à página do guia | Must | Dose informada abaixo da faixa otimizada do guia produz alerta com referência clínica; campo ausente não produz alerta novo | 🔴 |
| RF-02 | Capturar a TFG (campo opcional) e emitir recomendação de ajuste ou contraindicação da metformina conforme RN-02, com referência à página do guia | Must | TFG abaixo do limiar do guia produz a recomendação correspondente com referência clínica; campo ausente não produz recomendação nova | 🔴 |
| RF-03 | Emitir a recomendação de suspender sulfonilureia nos dois gatilhos adicionais da RN-03, com a redação condicional aprovada no caso "não informado" | Must | Nos dois gatilhos (incluindo esquema já fracionado com uso não informado), a saída contém a recomendação com a redação da RN-03 e referência clínica; o gatilho atual (transição do fracionamento com uso explícito) permanece inalterado | 🟢 |
| RF-04 | Reestruturar a entrada de glicemias em quatro campos por momento, com espaço como único separador de aferições, decimais com vírgula ou ponto dentro de cada valor, campo vazio como momento não aferido e sem máximo de aferições | Must | Valores digitados em cada campo chegam ao motor como aferições do momento correspondente; o resultado do cálculo é idêntico ao que a entrada linha a linha produziria para o mesmo conjunto de aferições | 🟢 |
| RF-05 | Validar os campos novos espelhando as faixas únicas do domínio, coletando todos os ofensores | Must | Cada valor fora de faixa (glicemias 10–1000 mg/dL; faixas de metformina e TFG a definir pela extração do guia) gera ofensor próprio; nenhuma faixa é duplicada fora do catálogo único de constantes | 🟢 |
| RF-06 | Reescrever os testes de integração do formulário para a nova entrada, mantendo a suíte completa verde | Must | Suíte completa verde, incluindo o teste de regressão `tests/regression/BUG-20260719-RHZ5.test.ts` e os property tests de invariantes | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Privacidade | Nenhum dado novo (metformina, TFG, glicemias) é enviado ou persistido; a calculadora segue 100% client-side | ADR 0002/0007 (`_reversa_sdd/architecture.md#1`); privacidade por construção (`_reversa_sdd/domain.md#3.5`, regra 21) | 🟢 |
| Rastreabilidade clínica | Toda saída nova (alerta, recomendação) carrega referência clínica com página ou figura do guia; constantes novas entram no catálogo único congelado | ADR 0001; invariante verificado por property test (`_reversa_sdd/domain.md#3.4`, regra 20) | 🟢 |
| Confiabilidade | O motor permanece determinístico: sem parâmetro de ambiente, sem escolha entre condutas equivalentes | ADR 0005; `_reversa_sdd/architecture.md#1` | 🟢 |
| Qualidade de testes | Cobertura ≥ 90% mantida em `models/**`; regra clínica nova nasce com teste de validação (spec antes do código) | `vitest.config.ts` (RNF-04); Princípios I, II e VII (`.reversa/principles.md`) | 🟢 |
| Manutenibilidade | A reestruturação do formulário não pode agravar o limite de 400 linhas por arquivo (hoje 532) | `_reversa_sdd/architecture.md#6` (dívida 4); sinal 5.6 do CLAUDE.md global | 🟡 |
| Observabilidade | Nada muda: telemetria nula por design na fase 1; relato de erro segue transportando apenas o nome da classe | ADR 0007; `_reversa_sdd/code-analysis.md#módulo-2` | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: metformina não otimizada antes de titular
  Dado um paciente em titulação com dose de metformina informada abaixo da faixa otimizada do guia
  Quando o cálculo é executado
  Então o resultado exibe alerta de otimização da metformina com referência à página do guia

Cenário: TFG contraindica metformina
  Dado uma TFG informada abaixo do limiar de contraindicação do guia
  Quando o cálculo é executado
  Então o resultado recomenda ajustar ou suspender a metformina com referência à página do guia

Cenário: sulfonilureia não informada ao fracionar
  Dado uma titulação que dispara o fracionamento da NPH com uso de sulfonilureia não informado
  Quando o cálculo é executado
  Então a recomendação de suspender sulfonilureia aparece com redação condicional e referência clínica

Cenário: esquema que já chega fracionado
  Dado um esquema de entrada com NPH em duas aplicações e uso de sulfonilureia informado como verdadeiro
  Quando o cálculo é executado
  Então a recomendação de suspender sulfonilureia é emitida mesmo sem novo fracionamento

Cenário: esquema já fracionado com sulfonilureia não informada
  Dado um esquema de entrada com NPH em duas aplicações e uso de sulfonilureia não informado
  Quando o cálculo é executado
  Então a recomendação de suspender sulfonilureia é emitida com a redação condicional da RN-03

Cenário: entrada de glicemias por momento
  Dado o campo de jejum preenchido com "98,5 180 200" e os demais momentos vazios
  Quando o cálculo é executado
  Então as três aferições entram como glicemias de jejum, com 98,5 interpretado como decimal, e o ajuste usa a média com prevalência de hipoglicemia

Cenário: valor fora de faixa na entrada por momento
  Dado o campo de jejum contendo "5" e o peso ausente
  Quando o formulário é submetido
  Então o ofensor de faixa da glicemia (10–1000 mg/dL) e o ofensor do peso são exibidos juntos, sem parar no primeiro
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-03 | Must | Aprovado no design, sem dependência externa; altera conduta clínica hoje incompleta |
| RF-04 | Must | Aprovado no design; único item de interface e pré-condição para os testes reescritos |
| RF-05 | Must | Sem ele a validação espelhada (regra 23 do domínio) quebraria com os campos novos |
| RF-06 | Must | Quebra declarada dos testes do formulário; suíte vermelha não é entregável |
| RF-01 | Must | Escopo confirmado na sessão de 2026-07-19: entra nesta feature; a extração citada do guia (ADR 0001, Princípio I) precede o plano, com o PDF fornecido pelo usuário |
| RF-02 | Must | Mesma decisão e mesma dependência do RF-01 |
| RNF de manutenibilidade | Should | Dívida 4 já registrada; a feature não deve agravá-la |

## 9. Esclarecimentos

### Sessão 2026-07-19

- **Q:** RF-01 (metformina) e RF-02 (TFG) entram nesta feature ou aguardam feature posterior, dado que exigem extração citada do guia cujo PDF estava fora do alcance?
  **R:** Entram nesta feature (opção a). O usuário fornece o PDF antes do plano, para a extração citada acontecer primeiro; na mesma sessão, forneceu o caminho local: `/Users/iagoleal/Downloads/Livro_GuiaRapido-DiabetesMellitus_PDFDigital_20231113.pdf` (verificado, 1,9 MB). O PDF permanece fora do versionamento (MD-0008).
- **Q:** Na entrada por momento, como tratar separador, decimais e limites?
  **R:** Opção a: espaço como único separador; vírgula ou ponto continuam valendo como decimal dentro de cada valor; campo vazio equivale a momento não aferido; sem máximo de aferições por campo.
- **Q:** Qual a redação condicional da recomendação de sulfonilureia quando o uso é "não informado"?
  **R:** Opção b: "Uso de sulfonilureia não informado: se estiver em uso, suspender ao fracionar a NPH", com o trecho final adaptado ao contexto quando o esquema já chega fracionado.
- **Q:** No esquema que já chega com NPH fracionada, a recomendação vale para quais estados do uso de sulfonilureia?
  **R:** Opção a: uso explícito (redação direta) e uso não informado (redação condicional).

## 10. Lacunas

- 🔴 **Dependência registrada (não é dúvida aberta):** as faixas de otimização da metformina e os limiares de TFG ainda não foram extraídos do guia; a extração citada (página a página, ADR 0001) é pré-condição do plano e usará o PDF fornecido na sessão de 2026-07-19. Até ela ocorrer, RN-01, RN-02, RF-01 e RF-02 permanecem 🔴.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-19 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-19 | Sessão de esclarecimentos: 3 dúvidas resolvidas (4 perguntas); RF-01/RF-02 promovidos a Must; RN-03 e RN-04 detalhadas; caminho do PDF do guia registrado | reversa-clarify |
