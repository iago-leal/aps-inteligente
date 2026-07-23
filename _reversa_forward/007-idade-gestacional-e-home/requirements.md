# Requirements: Calculadora de idade gestacional (DUM ou ultrassom) e página inicial por categorias

> Identificador: `007-idade-gestacional-e-home`
> Data: `2026-07-23`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A feature entrega duas peças que consolidam a promessa de plataforma guarda-chuva registrada na extração: (a) a **segunda calculadora clínica** da plataforma — idade gestacional (IG) e data provável do parto (DPP) a partir da data da última menstruação (DUM) ou do último ultrassom —, dirigida ao profissional da APS que conduz pré-natal; e (b) a **página inicial** que agrupa as calculadoras em seções temáticas — nesta primeira versão, apenas duas: **Diabetes Mellitus tipo 2** e **Pré-natal** —, resolvendo o problema de a raiz do site hoje ser a própria calculadora de insulina, sem espaço para crescer. As seis categorias de linha de cuidado cogitadas inicialmente (saúde da mulher, do idoso, da criança, mental, do adulto, do adolescente) ficam como direção de evolução incremental, quando o volume de ferramentas as justificar. A referência funcional dos cálculos é a calculadora pública do site FetalMed indicada pelo usuário; a fonte clínica citável é o **Guia Rápido Pré-Natal (SMS-Rio, 4.ª edição, 2025)**, definido na sessão de esclarecimentos de 2026-07-23 — segunda fonte da plataforma, no mesmo padrão editorial do guia de diabetes que ancora a calculadora de insulina.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/inventory.md#visão-geral` | O projeto é "plataforma guarda-chuva cuja primeira ferramenta é uma calculadora de insulina" — esta feature realiza o "guarda-chuva" com a segunda ferramenta e o índice | 🟢 |
| `_reversa_sdd/architecture.md#1-estilo-arquitetural` | Três camadas com dependência unidirecional (`pages → interface → models`) e domínio puro fora do framework (ADR 0003); a nova calculadora nasce no mesmo molde | 🟢 |
| `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md` | Nenhum fetch, nenhum storage de dado clínico; a IG calcula-se 100% no navegador como a insulina | 🟢 |
| `_reversa_sdd/adrs/0001-fonte-clinica-unica-guia-sms-rio.md` | Toda saída carrega `ReferenciaClinica` (página/figura). O ADR é escopado à calculadora de insulina; a de IG segue o mesmo padrão com fonte própria (linha abaixo) | 🟢 |
| Fonte clínica da IG: *Guia Rápido Pré-Natal* — SMS-Rio, 4.ª ed., 2025 (`referencias/guia-rapido-pre-natal-sms-rio-4ed-2025.pdf`, fora do versionamento como MD-0008) | "Como calcular a IG e a DPP?" (pp. 31–32): datação pela DUM em semanas e dias; regra de Naegele para a DPP; margens de erro da USG e descarte da DUM divergente; indicações de USG para datação (p. 113) | 🟢 |
| `_reversa_sdd/domain.md#3-regras-de-domínio-por-modo` (regra 15) | Validação coleta **todos os ofensores**, nunca para no primeiro; o motor revalida sem confiar na UI — padrão herdado pela calculadora de IG | 🟢 |
| `_reversa_sdd/domain.md#6-fronteiras-de-escopo` | Orientações ao paciente excluídas; o resultado dirige-se ao prescritor (MD-0009) — vale também para a IG | 🟢 |
| `_reversa_sdd/code-analysis.md#módulo-3` (pages) e `pages/index.tsx` | A raiz monta diretamente a `TelaCalculadora` de insulina; não há navegação nem índice — é o vazio que a home preenche | 🟢 |
| `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` | O design system adotado na feature 004 é a base visual integral das telas; home e calculadora de IG nascem dentro dele, sem identidade paralela | 🟢 |
| `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md` | Produção no ar com CSP sem terceiros e cabeçalhos vigiados por teste de contrato; a raiz pública hoje **é** a calculadora de insulina — mover a rota tem consequência externa | 🟢 |
| `_reversa_sdd/addenda/006-checkbox-revisao-redundante.md` | O ritual de revisão ganhou função (copiar plano); aplicabilidade desse padrão à IG não é automática — a IG informa datação, não conduta prescritiva | 🟡 |
| Referência funcional externa: `fetalmed.net/calculadora/calculadora-idade-gestacional/` | Quatro modos (DUM, USG, FIV/FET, DPP inversa); IG em semanas+dias, trimestre, DPP por DUM + 280 dias; USG por DUM equivalente retroprojetada | 🟡 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico da APS em consulta de pré-natal | Datar a gestação e obter a DPP em segundos, com fonte citável | Gestante informa a DUM; o médico digita a data e transcreve IG e DPP para o prontuário |
| Médico da APS com DUM incerta | Datar pelo último ultrassom | Digita a data do exame e a IG do laudo (semanas e dias); recebe a IG atual e a DPP recalculadas |
| Profissional da APS navegando a plataforma | Encontrar a calculadora certa para a situação clínica | Abre a página inicial, reconhece a seção (ex.: Pré-natal) e chega à ferramenta em um clique |

## 4. Regras de negócio novas ou alteradas

1. **RN-01 — IG por DUM:** a idade gestacional na data de referência é o número inteiro de semanas e o resto em dias do intervalo `data de referência − DUM` (IG = ⌊dias/7⌋ semanas + `dias mod 7`), conforme "datação manual da IG pela DUM" do guia (p. 31: "somar todos os dias decorridos [...] e dividir o total por 7 — o resultado é apresentado em semanas e dias"). A saída registra a ressalva do guia: a datação pela DUM é confiável quando o primeiro dia da última menstruação é conhecido e os ciclos eram regulares. 🟢
   - Origem: *Guia Rápido Pré-Natal* SMS-Rio 2025, p. 31; convergente com a referência funcional FetalMed
   - Tipo: nova
2. **RN-02 — DPP por DUM (regra de Naegele):** ao primeiro dia da última menstruação, acrescentar 7 dias e somar 9 meses (exemplo do guia, p. 32: DUM 03/02/2020 → DPP 10/11/2020). 🟢
   - Origem: *Guia Rápido Pré-Natal* SMS-Rio 2025, p. 32
   - Nota 🟡: a regra calendárica de Naegele e a soma de 280 dias (40 semanas exatas) divergem em ±1–3 dias conforme o comprimento dos meses; a fonte fixa Naegele, e a conciliação fina com a IG exibida (40 semanas na DPP) é decisão registrada do plano
   - Tipo: nova
3. **RN-03 — IG por ultrassom:** dada a data do exame e a IG no exame (semanas + dias), a DUM equivalente é `data do exame − (semanas×7 + dias)`; IG atual e DPP derivam dela pelas RN-01/RN-02. O guia indica a USG para datação quando a DUM é incerta ou a IG não pode ser calculada por ela (p. 113). 🟡 (retroprojeção é método padrão, não explicitado como fórmula no guia; indicação da USG 🟢 p. 113)
   - Tipo: nova
4. **RN-04 — Trimestre:** 1.º trimestre até 13 semanas + 6 dias; 2.º de 14 semanas + 0 dias a 27 semanas + 6 dias; 3.º a partir de 28 semanas + 0 dias. O guia usa os trimestres sem definir cortes numéricos; os valores acima são a convenção obstétrica usual, adotada como premissa declarada a validar pelo prescritor. 🟡
   - Tipo: nova
5. **RN-05 — Validação com coleta total:** a validação da IG coleta todos os ofensores antes de responder, no padrão do motor de insulina: DUM no futuro ou anterior a 44 semanas da data de referência; data do exame no futuro; IG do exame fora de 0–42 semanas ou dias fora de 0–6; ao menos uma datação completa (DUM, ou exame com data e IG do laudo) — datação de ultrassom parcial é ofensor. 🟡 (padrão herdado 🟢 de `_reversa_sdd/domain.md#3-regras-de-domínio-por-modo` regra 15; limites numéricos propostos, a validar)
   - Tipo: nova
6. **RN-06 — Rastreabilidade clínica:** toda saída da calculadora de IG carrega referência à fonte clínica (documento, página/seção), no padrão do ADR 0001. A fonte é o *Guia Rápido Pré-Natal* — SMS-Rio, 4.ª edição, 2025 (pp. 31–32 para datação e DPP; p. 113 para indicações de USG), segunda fonte da plataforma e base declarada para futuras features de pré-natal. 🟢
   - Origem no legado: `_reversa_sdd/adrs/0001-fonte-clinica-unica-guia-sms-rio.md` (padrão); decisão do usuário em 2026-07-23
   - Tipo: nova
7. **RN-07 — Determinismo do motor:** a data de referência ("hoje") é **entrada explícita** do motor de IG; o domínio não lê o relógio do sistema. A interface a preenche com a data do dispositivo e a exibe junto ao resultado. 🟢 (decorre de `_reversa_sdd/architecture.md#1-estilo-arquitetural`, determinismo e domínio puro)
   - Tipo: nova
8. **RN-08 — Seções da home:** a página inicial organiza as calculadoras em seções temáticas; nesta versão, exatamente duas: **Diabetes Mellitus tipo 2** (calculadora de insulina) e **Pré-natal** (calculadora de idade gestacional). Cada calculadora pertence a exatamente uma seção; nenhuma seção nasce vazia. 🟢 (decisão do usuário em 2026-07-23, revendo a proposta inicial de seis categorias de linha de cuidado — que permanecem como possível nível de agrupamento futuro, fora do escopo desta feature)
   - Tipo: nova
9. **RN-09 — Privacidade por arquitetura estendida:** a calculadora de IG e a home seguem a fronteira do legado: nenhum dado clínico (datas de gestação incluídas) sai do navegador ou é persistido; nenhuma requisição de rede nasce desta feature. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#6-fronteiras-de-escopo` (MD-0003) e `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md`
   - Tipo: nova (extensão de regra existente a componentes novos)
10. **RN-10 — Escopo negativo:** ficam fora desta feature os modos FIV/FET e a conversão inversa DPP→IG (presentes no site de referência), o calendário gestacional/desenvolvimento fetal semanal, e qualquer conteúdo dirigido à paciente (coerente com MD-0009). 🟢 (a queixa pede DUM e ultrassom, apenas)
    - Tipo: nova
11. **RN-11 — Entrada dupla com divergência explicitada:** DUM e ultrassom podem ser informados juntos. Nesse caso a calculadora exibe as duas datações e a divergência entre elas, aplicando a regra do guia (p. 32): a USG confirma a DUM se esta cair dentro da margem de erro do exame; a DUM deve ser desconsiderada se cair fora dessa margem — uma semana quando a USG é de primeiro trimestre, duas semanas quando de segundo. Quando a DUM é desconsiderada, a datação pela USG é destacada como a de referência; a calculadora informa, não decide pelo prescritor (padrão do ADR 0005). 🟢
    - Origem: *Guia Rápido Pré-Natal* SMS-Rio 2025, p. 32; decisão do usuário em 2026-07-23 (entrada dupla, não modos exclusivos)
    - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Calcular IG, DPP e trimestre a partir da DUM | Must | Para DUM válida, exibe IG em "N semanas e M dias" na data de referência, DPP em data completa e o trimestre, conforme RN-01/02/04 | 🟢 |
| RF-02 | Calcular IG, DPP e trimestre a partir do último ultrassom | Must | Para data de exame + IG do laudo válidas, exibe os mesmos três resultados via DUM equivalente (RN-03) | 🟡 |
| RF-03 | Validar entradas com coleta total de ofensores e mensagem por campo | Must | Entradas inválidas produzem a lista completa de ofensores de uma vez; nenhum cálculo parcial é exibido | 🟢 |
| RF-04 | Exibir a referência clínica em toda saída | Must | Todo resultado renderiza a citação da fonte (Guia Rápido Pré-Natal SMS-Rio 2025, com página), sem exceção | 🟢 |
| RF-09 | Exibir as duas datações e a divergência quando DUM e ultrassom são informados juntos | Must | Com entrada dupla, o resultado mostra IG/DPP por DUM e por USG, a diferença em dias e, quando a DUM cai fora da margem da RN-11, o destaque da USG como referência com a regra citada | 🟢 |
| RF-05 | Página inicial na raiz com as duas seções e navegação às calculadoras | Must | A raiz exibe as seções da RN-08 (Diabetes Mellitus tipo 2 e Pré-natal) com as calculadoras como cartões/links; cada calculadora é alcançável em um clique | 🟢 |
| RF-06 | Rota própria por calculadora, com a raiz servindo a home | Must | A raiz exibe a página inicial (decisão do usuário: quem acessa o link antigo vê a home, sem redirecionamento); a calculadora de insulina permanece funcional em rota própria, alcançável em um clique | 🟢 |
| RF-07 | Declarar a natureza do cálculo junto ao resultado da IG | Should | O resultado informa a data de referência usada e que a datação por DUM é estimativa (o ultrassom precoce confirma a IG) | 🟡 |
| RF-08 | Motor de insulina intocado | Must | `git diff models/insulina/` vazio ao fim da feature | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança/Privacidade | CSP e cabeçalhos byte a byte inalterados; zero requisição de rede nova; teste de contrato permanece verde | `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md` (cabeçalhos vigiados) | 🟢 |
| Acessibilidade | Varredura automática de acessibilidade permanece na linha de base zero nas telas novas (home e IG), nos dois viewports do harness e2e | `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` (linha de base versionada) | 🟢 |
| Testabilidade | Domínio novo (`models/` da gestação) com cobertura ≥ 90%, no mesmo threshold do motor de insulina; invariantes por property-based (ex.: IG(DUM, ref) sempre ≥ 0; DPP − DUM = 280 dias) | `_reversa_sdd/inventory.md#cobertura-de-testes` | 🟢 |
| Consistência visual | Home e calculadora de IG usam exclusivamente o design system vigente da plataforma; nenhuma identidade visual paralela | `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` (RN-05 daquela feature) | 🟢 |
| Desempenho | Cálculo local e imediato (sem rede); nenhuma dependência de runtime nova para aritmética de datas sem justificativa registrada | `_reversa_sdd/architecture.md#1-estilo-arquitetural` (determinismo, dependências enxutas) | 🟢 |
| Observabilidade | Erros da UI seguem o padrão existente (erro como valor; painel honesto para bug interno) | `_reversa_sdd/domain.md#3-regras-de-domínio-por-modo` regra 20 | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: IG e DPP a partir da DUM
  Dado que a data de referência é 2026-07-23
  E a DUM informada é 2026-01-01
  Quando o profissional solicita o cálculo
  Então a IG exibida é "29 semanas e 0 dias"
  E a DPP exibida é 2026-10-08
  E o trimestre exibido é o 3.º
  E a referência clínica acompanha o resultado
  E a data de referência 2026-07-23 é exibida junto ao resultado, com a nota de que a datação por DUM é estimativa

Cenário: IG e DPP a partir do último ultrassom
  Dado que a data de referência é 2026-07-23
  E o exame de 2026-06-10 registrou IG de 12 semanas e 3 dias
  Quando o profissional solicita o cálculo
  Então a IG exibida é "18 semanas e 4 dias"
  E a DPP exibida é 2026-12-22 (Naegele sobre a DUM equivalente 2026-03-15)
  E o trimestre exibido é o 2.º

Cenário: entrada dupla com DUM fora da margem da ultrassonografia
  Dado que a data de referência é 2026-07-23
  E a DUM informada é 2026-01-01
  E o exame de 2026-03-10 registrou IG de 8 semanas e 0 dias (primeiro trimestre)
  Quando o profissional solicita o cálculo
  Então as duas datações são exibidas (DUM equivalente da USG: 2026-01-13)
  E a divergência de 12 dias é explicitada
  E, por exceder a margem de uma semana do primeiro trimestre, a datação pela USG é destacada como referência
  E a regra da fonte (p. 32) acompanha o destaque

Cenário: DUM no futuro (caso negativo)
  Dado que a data de referência é 2026-07-23
  Quando o profissional informa DUM 2026-08-01 e solicita o cálculo
  Então nenhum resultado é exibido
  E o ofensor "DUM no futuro" aparece junto ao campo correspondente

Cenário: IG do laudo fora de faixa (caso negativo, coleta total)
  Dado que o profissional informou data de exame no futuro E IG do laudo de 45 semanas
  Quando solicita o cálculo
  Então os dois ofensores são exibidos de uma só vez
  E nenhum cálculo parcial é apresentado

Cenário: navegação pela página inicial
  Dado que o profissional acessa a raiz da plataforma
  Quando a página inicial carrega
  Então as duas seções são exibidas
  E a calculadora de idade gestacional aparece sob Pré-natal
  E a calculadora de insulina aparece sob Diabetes Mellitus tipo 2
  E nenhuma seção vazia é exibida
  E cada calculadora abre em um clique

Cenário: motor de insulina preservado (caso negativo de efeito colateral)
  Dado o repositório ao fim da implementação da feature
  Quando se compara o conteúdo de models/insulina/ com o estado anterior à feature
  Então não existe nenhuma diferença
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01, RF-02 | Must | São a queixa nuclear: datar a gestação por DUM ou ultrassom |
| RF-03 | Must | Coleta total de ofensores é invariante da plataforma (padrão do motor) |
| RF-04 | Must | Sem fonte citável não há saída legítima — princípio herdado do ADR 0001 |
| RF-09 | Must | A entrada dupla com divergência explicitada é decisão do usuário (2026-07-23) ancorada na regra da p. 32 do guia |
| RF-05, RF-06 | Must | A home por categorias é a segunda metade explícita do pedido |
| RF-08 | Must | O motor de insulina validado clinicamente não pode sofrer efeito colateral |
| RF-07 | Should | Qualifica a estimativa sem bloquear a entrega nuclear |
| RNF acessibilidade / privacidade / testabilidade | Must | Gates já vigentes na plataforma (linha de base zero, CSP vigiada, threshold 90%) |

## 9. Esclarecimentos

### Sessão 2026-07-23

- **Q:** Qual documento oficial ancora fórmulas, cortes de trimestre e DPP da calculadora de IG?
  **R:** O *Guia Rápido Pré-Natal* — SMS-Rio, 4.ª edição, 2025, indicado pelo usuário também como boa referência para futuras features de pré-natal. O PDF foi arquivado em `referencias/guia-rapido-pre-natal-sms-rio-4ed-2025.pdf` (fora do versionamento, padrão MD-0008). A leitura das pp. 31–32 confirmou as fórmulas: datação pela DUM em semanas e dias (dias ÷ 7), DPP pela regra de Naegele (+7 dias, +9 meses) e margens de erro da USG para descarte da DUM divergente; a p. 113 traz as indicações de USG para datação. Integrado em RN-01, RN-02, RN-03, RN-06, RF-01 e RF-04.
- **Q:** DUM e ultrassom informados juntos: modos mutuamente exclusivos ou entrada dupla?
  **R:** Entrada dupla com divergência explicitada. A regra de arbitragem veio da própria fonte (p. 32): DUM fora da margem de erro da USG (1 semana no 1.º trimestre, 2 no 2.º) deve ser desconsiderada — a calculadora destaca a USG como referência e cita a regra, sem decidir pelo prescritor. Integrado como RN-11 e RF-09; RN-05 ajustada (ao menos uma datação completa).
- **Q:** Quem acessa a raiz em produção (hoje, a calculadora de insulina) vê o quê?
  **R:** Vê a home. Sem redirecionamento; a calculadora de insulina passa a rota própria, alcançável em um clique a partir da página inicial. Integrado em RF-06.

## 10. Lacunas

- Nenhuma dúvida bloqueante pendente. Premissas 🟡 declaradas, a validar durante plano e uso (não impedem o `/reversa-plan`):
  - Cortes de trimestre (13+6 / 27+6) são convenção obstétrica; o guia usa os trimestres sem defini-los numericamente (RN-04).
  - Conciliação fina entre a regra calendárica de Naegele e as 40 semanas exatas na exibição da IG na DPP (nota da RN-02) — decisão registrada do plano.
  - Limites de validação propostos (44 semanas retroativas para a DUM; 0–42 semanas para IG de laudo) aguardam confirmação do prescritor (RN-05).

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-23 | Home reduzida de seis categorias para duas seções (Diabetes Mellitus tipo 2 e Pré-natal), por decisão do usuário; RN-08, RF-05, cenário de navegação e Lacuna 3 reconciliados | reversa |
| 2026-07-23 | Sessão de esclarecimentos: fonte clínica fixada (Guia Rápido Pré-Natal SMS-Rio 2025, pp. 31–32 e 113), entrada dupla com divergência (RN-11/RF-09) e raiz servindo a home (RF-06); zero `[DÚVIDA]` restante | reversa (`/reversa-clarify`) |
