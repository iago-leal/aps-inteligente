# Perguntas para Validação — aps-inteligente

> Regenerado pelo Reversa Reviewer na **re-extração 4 (2026-07-28)**. `answer_mode = chat`.
> Consolida, no nível global, as premissas 🟡 dos **cinco domínios clínicos e do unit não
> clínico** (detalhe por unit em `models-*/questions.md`).
> **Política vigente, decidida pelo usuário em 2026-07-23 e mantida:** premissas clínicas
> permanecem 🟡 documentadas; nenhuma é 🔴 bloqueante, e nenhuma impede a reimplementação a
> partir da extração.
> **Novas nesta passagem: Q-P1 a Q-P7 (puericultura), Q-S1 a Q-S3 (consulta) e Q-X1 (contribuição).**

---

## 🆕 Puericultura — `models/puericultura` (feature 017)

| # | Premissa | Valor atual no código | Fonte da premissa | Status |
|---|----------|-----------------------|-------------------|--------|
| Q-P1 | Limite estendido da correção de idade | 730 dias, ou 1.095 quando IG < 28 semanas | Prática corrente; a caderneta ensina a corrigir sem publicar o limite em dias (`MD-0006`) | 🟡 nova |
| Q-P2 | O ano conta 365 dias corridos | fronteiras em dias, não na data civil | Uniformidade de unidade entre as duas fronteiras da mesma regra | 🟡 nova |
| Q-P3 | A idade **cronológica** governa a posição de medida | `posicaoEsperadaEm(diasDeVida)` | Leitura de que a posição é propriedade do corpo, não da curva; a fonte não trata do caso | 🟡 nova |
| Q-P4 | Faixas de plausibilidade da digitação | peso (0;150], comprimento (20;200], PC (20;70], IG 22–42 | Bom senso clínico; a caderneta não publica limites de entrada | 🟡 nova |
| Q-P5 | Correção de cauda só em peso e IMC | lista como dado, não `if` | Prova plena só em acervo sintético: nas 14 tabelas reais os outros dois índices têm `L = 1` | 🟡 nova |
| Q-P6 | Exibição com uma casa decimal | motor devolve exato; a tela arredonda | A caderneta trabalha com faixas, não com valor pontual | 🟡 nova |
| Q-P7 | Faixa de 30 dias entre as duas fronteiras dos 5 anos | tabela de 0–5 com rótulos de 5–10 | Escolha do mal menor: alinhá-las produziria rótulo trocado ou buraco de cobertura | 🟡 nova |

## 🆕 Consulta de puericultura — `models/puericultura/consulta` (feature 020)

| # | Premissa | Valor atual no código | Fonte da premissa | Status |
|---|----------|-----------------------|-------------------|--------|
| Q-S1 | Idade entre duas consultas cai na ficha **anterior** | `find` sobre faixas contíguas | A fonte não diz o que fazer com a criança de sete meses; custo de errar é um clique | 🟡 nova |
| Q-S2 | Atribuição de cada campo a uma seção do SOAP | decisão editorial, declarada em toda montagem | A caderneta imprime seções numeradas e não menciona registro orientado por problemas | 🟡 nova |
| Q-S3 | Supressão de "Criptorquidia" na ficha feminina | lista de um item só, declarada ao leitor | Achado do exame da bolsa escrotal; a fonte imprime o campo nas duas tiragens (`MD-0026`, `MD-0027`) | 🟡 nova |

## 🆕 Contribuição — `models/contribuicao` (feature 019)

| # | Premissa | Valor atual no código | Fonte da premissa | Status |
|---|----------|-----------------------|-------------------|--------|
| Q-X1 | O contrato emitido é conferido fora do CI | vetor do CRC e propriedade rodam em CI; decodificador e aplicativo real, não | Não há como automatizar sem conta de teste e leitor real | 🟡 nova |

## Risco cardiovascular — `models/risco-cardiovascular` (feature 014)

| # | Premissa | Valor atual no código | Fonte da premissa | Status |
|---|----------|-----------------------|-------------------|--------|
| Q-R1 | Faixas fisiológicas de clamp | colesterol 130–320, HDL 20–100, PAS 90–200 | Faixas do ASCVD Estimator; fora → clamp com aviso | 🟡 mantida |
| Q-R2 | Cortes de categoria de risco | 5 / 7,5 / 20% | 2019 ACC/AHA Primary Prevention | 🟡 mantida |
| Q-R3 | `raca="outra"` usa coeficientes de branco | modelo correspondente ao sexo | Convenção do estimador oficial | 🟡 mantida |
| Q-R4 | Transportabilidade das PCE ao Brasil | declarada, não corrigida | Coorte dos EUA, sem calibração validada | 🟡 mantida |

## Gestação — `models/gestacao`

| # | Premissa | Valor atual no código | Status |
|---|----------|-----------------------|--------|
| Q-G1 | Cortes de trimestre (13+6 e 27+6) | convenção obstétrica | 🟡 mantida |
| Q-G2 | Limite retroativo da DUM (44 semanas) | plausibilidade arbitrada | 🟡 mantida |
| Q-G3 | Faixa do laudo de USG | plausibilidade arbitrada | 🟡 mantida |
| Q-G4 | 3.º trimestre sem margem | a fonte não parametriza | 🟡 mantida |

## Cardiologia — `models/cardiopatia-isquemica`

| # | Premissa | Status |
|---|----------|--------|
| Q-C1 | Transcrição das 24 células do Quadro 2 | 🟡 mantida |
| Q-C2 | Leitura do estrato "baixa" | 🟡 mantida |
| Q-C3 | Ajuste por fatores de risco | 🟡 mantida |
| Q-C4 | Ausência de ritual de revisão | 🟡 mantida |
| Q-C5 | Fidelidade dos blocos complementares | 🟡 mantida |

## Insulina — `models/insulina` (herdada da extração 1)

| # | Premissa | Estado | Status |
|---|----------|--------|--------|
| Q-I1 (G-01) | Caminho do PDF do *Guia Rápido DM* para conferência página a página das 20 referências | Usuário confirmou que forneceria; o caminho ainda não chegou | 🟡 pendente de insumo |

---

## As duas que mais mudam resultado em tela

Se for para chancelar poucas, comece por estas:

1. **Q-P1** — o limite estendido da correção decide, em prematuro extremo entre dois e três
   anos, se a curva é lida na idade corrigida ou na cronológica. Muda o escore e pode mudar a
   faixa de rótulo.
2. **Q-P3** — se a posição de medida seguisse a idade corrigida, a conversão de 0,7 cm passaria
   a incidir sobre outro conjunto de crianças, com efeito em estatura e IMC ao mesmo tempo.

**Q-P4** é a que mais aparece em uso comum: as faixas de plausibilidade barram digitação
legítima de prematuro extremo de muito baixo peso.

> **Encaminhamento:** as premissas seguem chanceláveis a qualquer momento. Confirmadas, promovem-se
> a 🟢 por validação humana; ajustadas, geram bug ou feature do ciclo forward, porque o código
> atual reflete os valores acima.
