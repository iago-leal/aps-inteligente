# Requirements: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-26`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA
> Categoria (Princípio nº 4 global): **Produto** — apoio à decisão clínica pediátrica, com responsabilidade sobre a leitura de desvio de crescimento.

## 1. Resumo executivo

Entrega a **quinta calculadora** da plataforma e a **primeira seção de Puericultura**: a partir de sexo, data de nascimento, data da medição, peso, comprimento/estatura e perímetro cefálico, a tela devolve os **escores z** dos índices antropométricos e a **classificação nutricional** correspondente, na redação literal da *Caderneta da Criança* (Ministério da Saúde, 2.ª ed., 2020, pp. 85–97). Resolve o trabalho hoje manual de plotar pontos no gráfico impresso e ler a faixa a olho — leitura que a caderneta admite ser aproximada, ao passo que o escore z é exato.

Um quinto domínio puro `models/puericultura` nasce sob os mesmos sete invariantes da família (`_reversa_sdd/domain.md#7`); a tela vive em `interface/puericultura/`, a rota em `pages/puericultura/crescimento.tsx`, e a seção nova entra primeiro em `interface/inicio/catalogo.ts`. Nenhum motor existente é tocado: feature **estritamente aditiva**.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#1` | Plataforma guarda-chuva com **quatro domínios independentes** sob casca comum; três camadas unidirecionais `pages → interface/* → models/*`; a tabela de invariantes da família é o contrato que o quinto domínio deve satisfazer | 🟢 |
| `_reversa_sdd/domain.md#7` | Sete invariantes transversais: domínio puro, erro como valor, toda saída com `ReferenciaClinica`, coleta total de ofensores, constantes `Object.freeze` em `fonte-clinica.ts`, o motor informa e não escolhe, privacidade por construção | 🟢 |
| `_reversa_sdd/domain.md#8` | Fronteiras de escopo: cenário plausível fora da cobertura da fonte → `ForaDoEscopoDaFonte`, **sem número**, nunca extrapolação (MD-0009). Molde a aplicar à criança fora de 0–10 anos e ao PC acima de 2 anos | 🟢 |
| `_reversa_sdd/adrs/0011-*` (via `domain.md#2.1`) | **Uma fonte clínica por unit**, mescla proibida. Governa a redação das faixas e a decisão sobre a origem dos dados de referência (§10, dúvida 3) | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo 4 — models/risco-cardiovascular` | Molde estrutural mais próximo do que esta feature precisa: `fonte-clinica.ts` com tabela numérica extensa congelada, `validacao.ts` com coleta total + avisos não-travantes, `elegibilidade.ts` para o corte de escopo, fachada `validar → escopo → cálculo → categoria` | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo 9 — interface/risco-cardiovascular` | Molde de tela **sem ritual de revisão** (ADR 0012, D-08), com `proveniencia.tsx` separando a nota de limitação do painel de resultado | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo 2 — models/gestacao` | Aritmética de datas em **dias epoch UTC** (`paraDiasEpoch`, ADR 0013) e **data de referência injetada pela UI** (RN-07): o motor não lê o relógio. A idade da criança reusa exatamente essa disciplina | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo 10 — interface/inicio` | `catalogo.ts` é fonte única tipada das seções (D-07, anti-drift) — a seção `puericultura` entra ali primeiro; `icones.tsx` mapeia `id → Octicon` com fallback `null` para seção sem entrada | 🟢 |
| `_reversa_sdd/architecture.md#6` (dívida 5) | Precedente de **premissa clínica 🟡 registrada e não resolvida** — o mesmo tratamento vale para os pontos 🟡 desta feature | 🟢 |
| `_reversa_sdd/addenda/016-*` (vigente) | Cabeçalho unificado: as calculadoras declaram `comInicio` na `Moldura`; a prop `logoComoTitulo` **não existe mais**. A tela nova nasce já com o contrato atual | 🟢 |
| Fonte clínica (fora do repo, MD-0008) | *Caderneta da Criança — Menino / Menina*, MS, 2.ª ed., Brasília, 2020, seção "Acompanhando o Crescimento", pp. 85–97 | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico de família na Atenção Primária à Saúde, APS (prescritor anônimo, único papel do sistema) | Classificar o estado nutricional e o crescimento de uma criança na consulta de puericultura | Na consulta de rotina de um lactente de 7 meses, informa sexo, data de nascimento, data de hoje, peso, comprimento e perímetro cefálico, e obtém os quatro escores z com as classificações da caderneta, para registrar no prontuário e conduzir a consulta |
| Mesmo médico, revisão de caso | Confirmar suspeita de desvio percebida no gráfico impresso | Uma criança de 3 anos aparenta baixa estatura no gráfico; o médico confere o escore z exato de E/I e o de IMC/I, e vê se cruza o corte de −2 |
| Mesmo médico, criança fora da cobertura | Não ser induzido a erro | Criança de 12 anos: a tela **recusa honestamente** em vez de extrapolar a curva 5–10 anos |

## 4. Regras de negócio novas ou alteradas

Todas **novas** (`models/puericultura`); nenhuma regra dos quatro domínios existentes é alterada ou removida.

1. **RN-01 — Índices calculados.** 🟢 A partir das entradas, o motor calcula até quatro índices: **P/I** (peso-para-idade), **C/I ou E/I** (comprimento-para-idade < 2 anos; estatura-para-idade ≥ 2 anos), **IMC/I** (índice de massa corporal-para-idade) e **PC/I** (perímetro cefálico-para-idade). Cada índice é **independente**: a ausência de uma medida suprime só o índice que dela depende, sem invalidar os demais.
   - Origem no legado: nova (molde de saída composta análogo a `_reversa_sdd/code-analysis.md#Módulo 2`)
   - Tipo: nova
2. **RN-02 — Escore z pelo método LMS.** 🟢 O **escore z** é o número de desvios-padrão que separa a medida da criança da mediana de referência para o seu sexo e idade. O **método LMS** descreve a distribuição do indicador em cada idade por três parâmetros — `L` (assimetria), `M` (mediana) e `S` (coeficiente de variação) — e converte medida em escore por `z = ((X/M)^L − 1) / (L·S)` quando `L ≠ 0`, e por `z = ln(X/M)/S` quando `L = 0`. `L`, `M` e `S` são lidos da tabela de referência do índice, para o **sexo** e a **idade** da criança.
   - Tipo: nova
3. **RN-03 — Correção de cauda da Organização Mundial da Saúde (OMS).** 🟢 Para **P/I e IMC/I** — e **somente** para eles —, quando `|z| > 3` o escore é recalculado de forma linear sobre a distância entre os desvios-padrão 2 e 3: se `z > 3`, `z = 3 + (X − SD3⁺)/(SD3⁺ − SD2⁺)`; se `z < −3`, `z = −3 + (X − SD3⁻)/(SD2⁻ − SD3⁻)`, onde `SDn±` é o valor do indicador em `z = ±n` pela própria LMS. **E/I (C/I) e PC/I não recebem correção de cauda** — a distribuição é aproximadamente normal em toda a extensão. Omitir esta regra produz escores extremos irrealistas em desnutrição grave e obesidade grave, justamente onde a decisão clínica é mais consequente.
   - Tipo: nova
4. **RN-04 — Classificação de P/I (caderneta, pp. 89, 92, 95).** 🟢 `> +2` → "Peso elevado para a idade"; `≥ −2 e ≤ +2` → "Peso adequado para a idade"; `≥ −3 e < −2` → "Baixo peso para a idade"; `< −3` → "Muito baixo peso para a idade".
   - Tipo: nova
5. **RN-05 — Classificação de C/I e E/I (pp. 90, 93, 96).** 🟢 `≥ −2` → "adequada para a idade"; `≥ −3 e < −2` → "Baixa"; `< −3` → "Muito baixa". **Não há categoria superior** na fonte: estatura acima de +2 não é desvio classificado, e a tela não pode inventar rótulo para ela.
   - Tipo: nova
6. **RN-06 — Classificação de IMC/I, dois conjuntos de rótulos.** 🟢 A fonte **muda a nomenclatura aos 5 anos**, e a diferença não é cosmética:
   - **0 a 5 anos** (pp. 91, 94): `> +3` Obesidade · `> +2 e ≤ +3` Sobrepeso · `> +1 e ≤ +2` Risco de sobrepeso · `≥ −2 e ≤ +1` Eutrofia · `≥ −3 e < −2` Magreza · `< −3` Magreza acentuada.
   - **5 a 10 anos** (p. 97): `> +3` Obesidade **grave** · `> +2 e ≤ +3` **Obesidade** · `> +1 e ≤ +2` **Sobrepeso** · `≥ −2 e ≤ +1` Eutrofia · `≥ −3 e < −2` Magreza · `< −3` Magreza acentuada.
   O mesmo escore z `+2,5` é "Sobrepeso" numa criança de 4 anos e "Obesidade" numa de 6. O corte é a idade de 5 anos exatos.
   - Tipo: nova
7. **RN-07 — Classificação de PC/I (p. 88).** 🟢 `> +2` → "Perímetro cefálico acima do esperado para a idade"; `≥ −2 e ≤ +2` → "Perímetro cefálico adequado para a idade"; `< −2` → "Perímetro cefálico abaixo do esperado para a idade". Sem corte em ±3.
   - Tipo: nova
8. **RN-08 — Cobertura da fonte e recusa honesta.** 🟢 A caderneta cobre **0 a 10 anos** para P/I, C-E/I e IMC/I, e **0 a 2 anos** para PC/I. Idade fora de 0–10 anos → `ForaDoEscopoDaFonte` para todos os índices, **sem número**; perímetro cefálico informado para criança ≥ 2 anos → o índice PC/I sai como fora de escopo, **sem invalidar** os demais. Aplicação direta de MD-0009 (`_reversa_sdd/domain.md#8`).
   - Origem no legado: `_reversa_sdd/domain.md#8`
   - Tipo: nova (aplicação de regra transversal existente)
9. **RN-09 — Comprimento × estatura e a correção de 0,7 cm (p. 85).** 🟢 Criança **< 2 anos** mede-se **deitada** (comprimento); **≥ 2 anos**, **em pé** (estatura). Quando a posição efetiva da medição diverge da esperada para a idade, a fonte determina converter antes de classificar: medida deitada em criança ≥ 2 anos → **subtrair 0,7 cm**; medida em pé em criança < 2 anos → **somar 0,7 cm**. O motor recebe a posição como entrada explícita, aplica a conversão e **declara no resultado** que a aplicou. Não há default silencioso: a posição é dado clínico, não suposição.
   - Tipo: nova
10. **RN-10 — Idade em dias epoch UTC, data de referência injetada.** 🟢 A idade da criança é a diferença entre a data da medição e a data de nascimento, em **dias inteiros sobre `Date.UTC`**, reusando a disciplina de `models/gestacao` (ADR 0013). O motor **não lê o relógio**: a data da medição é entrada (RN-07 da 007). Calendário impossível (ex.: 30 de fevereiro) é ofensor, nunca normalização silenciosa.
    - Origem no legado: `_reversa_sdd/domain.md#4` (regras 26 e 27)
    - Tipo: nova (reúso de invariante existente)
11. **RN-11 — Validação por coleta total.** 🟢 A validação nunca para no primeiro erro. Ofensores que **travam**: sexo ausente/inválido; data de nascimento ausente, inválida ou **futura** em relação à data da medição; data de medição inválida; nenhuma medida informada; medida não positiva. Faixas de plausibilidade 🟡: peso `0 < p ≤ 150 kg`; comprimento/estatura `20–200 cm`; perímetro cefálico `20–70 cm`.
    - Origem no legado: `_reversa_sdd/domain.md#7` (invariante 4)
    - Tipo: nova
12. **RN-12 — O motor informa, não escolhe.** 🟢 A saída é escore z + classificação literal da caderneta + referência de página. O motor **não** emite conduta, não sugere investigação, não indica encaminhamento e não interpreta tendência entre medições. Consequência direta de ADR 0005 e da natureza da fonte: a caderneta orienta que desvios "devem ser diagnosticados e tratados precocemente" (p. 85) sem parametrizar como — o que o guia não parametriza, o motor não inventa.
    - Origem no legado: `_reversa_sdd/domain.md#7` (invariante 6)
    - Tipo: nova
13. **RN-13 — Sem ritual de revisão.** 🟢 Classificar crescimento não prescreve dose: a tela **não tem** checkbox de confirmação, seguindo gestação, cardiopatia e risco cardiovascular (ADR 0012, D-08).
    - Origem no legado: `_reversa_sdd/domain.md#7.1` (regra 10)
    - Tipo: nova
14. **RN-14 — Nota de proveniência e de leitura pontual.** 🟢 A tela declara, em bloco próprio fora do painel de resultado (molde `proveniencia.tsx` da 014), que (a) a classificação vale para **uma medição isolada**, ao passo que a caderneta ensina que o crescimento se avalia pela **tendência** de pontos sucessivos (p. 85: "várias medidas […] unidas entre si formam uma linha"), e (b) as curvas são as da **OMS adotadas pelo MS**, sem correção para prematuridade nesta versão (RN-15).
    - Tipo: nova
15. **RN-15 — Pré-termo fora do escopo desta entrega.** 🟡 A caderneta traz curvas próprias para recém-nascidos pré-termo (27–64 semanas pós-concepcionais, p. 87) e a regra de **idade corrigida** (p. 86: até 2 anos de idade cronológica; até 3 anos se a idade gestacional (IG) ao nascer for < 28 semanas). Esta feature **não** as implementa; a tela declara a ausência em vez de silenciar. Ver a dúvida 2 em §10.
    - Tipo: nova (escopo negativo declarado)

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Domínio puro `models/puericultura` com fachada `CalculadoraCrescimentoInfantil.avaliar(entrada)`, sem `import` de React/Next/biblioteca externa | Must | Teste de fronteira: nenhum `import` de framework em `models/puericultura/**`; suíte do domínio roda sem DOM | 🟢 |
| RF-02 | Cálculo do escore z pelo método LMS (RN-02) para os quatro índices | Must | Oráculo: para um conjunto de casos com `L/M/S` conhecidos, o z calculado bate com o valor de referência em ±0,01 | 🟢 |
| RF-03 | Correção de cauda da OMS aplicada **apenas** a P/I e IMC/I (RN-03) | Must | Caso com `z` bruto `> 3` em P/I devolve z corrigido; o mesmo dado em E/I devolve o z LMS sem correção; teste explícito para o par | 🟢 |
| RF-04 | Classificação literal por índice e faixa etária (RN-04 a RN-07), com a **troca de rótulos do IMC aos 5 anos** | Must | Tabela de casos-limite: `z = +2,5` aos 4a11m → "Sobrepeso"; mesmo z aos 5a0m → "Obesidade"; bordas `−3`, `−2`, `+1`, `+2`, `+3` conferidas em cada índice | 🟢 |
| RF-05 | Idade em dias epoch UTC a partir de data de nascimento e data da medição injetada (RN-10) | Must | Determinismo: mesma entrada → mesma saída, independentemente do fuso do ambiente de teste | 🟢 |
| RF-06 | Índices independentes: medida ausente suprime só o índice dependente (RN-01) | Must | Entrada só com peso devolve P/I preenchido e E/I, IMC/I, PC/I ausentes, sem erro | 🟢 |
| RF-07 | `ForaDoEscopoDaFonte` para idade fora de 0–10 anos (global) e para PC/I em criança ≥ 2 anos (parcial), **sem número** (RN-08) | Must | Criança de 12 anos: nenhum escore z na saída, motivo `IDADE_FORA_DA_COBERTURA`; criança de 3 anos com PC informado: P/I, E/I e IMC/I normais + PC/I fora de escopo com motivo `PC_ACIMA_DE_2_ANOS` | 🟢 |
| RF-08 | Posição da medição (deitado/em pé) como entrada explícita, com conversão de 0,7 cm e declaração da conversão aplicada (RN-09) | Must | Criança de 2a3m medida deitada, 90,0 cm → o índice usa 89,3 cm e a saída carrega o aviso da conversão | 🟢 |
| RF-09 | Validação com coleta total de ofensores (RN-11) | Must | Entrada com sexo ausente **e** DN futura **e** peso negativo devolve **três** ofensores, não um | 🟢 |
| RF-10 | Toda saída carrega `ReferenciaClinica` com página da caderneta e edição | Must | Property-based: para qualquer entrada válida, todo índice calculado tem referência não vazia | 🟢 |
| RF-11 | Tela `/puericultura/crescimento`: formulário (sexo, data de nascimento, data da medição, peso, comprimento/estatura + posição da medição, perímetro cefálico) e painel com os quatro índices | Must | Integração: preencher e calcular exibe quatro blocos rotulados com z (uma casa decimal) e classificação | 🟢 |
| RF-12 | Invalidação por edição: qualquer alteração marca o resultado como `desatualizado` | Must | Molde das quatro telas (`_reversa_sdd/domain.md#7.1`, regra 8); teste de integração | 🟢 |
| RF-13 | Bloco de proveniência fora do painel de resultado (RN-14), com a ressalva de medição isolada × tendência e a ausência de correção para prematuridade | Must | Texto único congelado no domínio, lido pela tela (anti-drift, molde `NOTA_PROVENIENCIA` da 014) | 🟢 |
| RF-14 | Seção `puericultura` no catálogo (`interface/inicio/catalogo.ts`) + ícone próprio no mapa de ícones da home, com a rota `/puericultura/crescimento` | Must | Home renderiza a quarta seção com o cartão clicável; e2e navega da home à tela nova | 🟢 |
| RF-15 | Sem ritual de revisão na tela (RN-13) | Must | Teste negativo: nenhum checkbox de confirmação no DOM da tela | 🟢 |
| RF-16 | Tela declara a não cobertura de pré-termo/idade corrigida (RN-15) | Should | Texto presente e acessível; sem campo de IG ao nascer nesta entrega | 🟡 |
| RF-17 | Painel honesto em falha inesperada (exceção fora do contrato) | Should | Molde das quatro telas: `ErroDeInvariante` → painel "não decida a partir desta tela" + evento anônimo (só nome da classe) | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Privacidade | Nenhum dado da criança (nome, DN, medidas) é persistido, transmitido ou logado; nenhum `fetch`/`storage` clínico | ADR 0002, `_reversa_sdd/domain.md#7` (invariante 7). Dado de menor de idade agrava o risco: a barreira é estrutural, não configurável | 🟢 |
| Privacidade | A tela **não** coleta nome nem qualquer identificador da criança — só as variáveis do cálculo | Minimização de dados; nada no cálculo exige identificar o paciente | 🟢 |
| Segurança | Sem dependência nova de runtime; CSP sem terceiros preservada | `_reversa_sdd/architecture.md#4`; features 011–016 não introduziram dependência | 🟢 |
| Desempenho | Avaliação síncrona no cliente, imperceptível (< 16 ms); tabelas de referência não podem inflar o bundle inicial das outras rotas | O volume LMS é a única novidade de peso do projeto: por rota, o custo deve ficar isolado em `/puericultura/crescimento` | 🟡 |
| Robustez | Não há concorrência, retentativa nem tempo-limite a considerar: a avaliação é síncrona, local e sem entrada/saída — a única falha possível é a exceção de invariante, tratada em RF-17 | 🟢 |
| Manutenibilidade | Nenhum arquivo acima de 400 linhas; nenhuma função acima de 50 linhas | Sinal de dívida do mantenedor (CLAUDE.md §5.6); a tabela de referência é **dado**, e a decisão sobre seu formato (§10) deve respeitar o teto sem desmembrar a coesão | 🟡 |
| Acessibilidade | Delta axe-core **0/0** na rota nova, como nas cinco rotas atuais | Baseline e2e vigente | 🟢 |
| Rastreabilidade | Cada arquivo cita no cabeçalho o `RF-NN` que o originou; matriz `_reversa_sdd/traceability/` estendida | Princípio VI | 🟢 |
| Testabilidade | Motor injetável na tela; data da medição injetada; property-based nos invariantes do domínio | Princípio VII; molde das quatro telas | 🟢 |
| Observabilidade | `RelatorDeErros` nulo, evento anônimo com nome de classe apenas | ADR 0007 | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: lactente com medidas completas
  Dado um menino nascido em 2026-01-10 e uma medição em 2026-08-10 (7 meses)
  E peso 8,2 kg, comprimento 68,5 cm medido deitado, perímetro cefálico 44,0 cm
  Quando o médico solicita a avaliação
  Então a tela exibe os quatro índices — P/I, C/I, IMC/I e PC/I — cada um com escore z
    E cada índice traz a classificação literal da Caderneta da Criança
    E cada índice cita a página da caderneta de que a faixa provém

Cenário: a nomenclatura do IMC muda aos 5 anos
  Dada uma criança cujo IMC/I resulta em escore z +2,5
  Quando a idade na medição é 4 anos e 11 meses
  Então a classificação é "Sobrepeso"
  Quando a idade na medição é 5 anos e 0 meses
  Então a classificação é "Obesidade"

Cenário: correção de cauda só onde a OMS a prevê
  Dada uma criança cujo peso produz escore z bruto de +3,8 em P/I
  Quando a avaliação é feita
  Então o escore z de P/I é o valor corrigido pela regra de cauda
  E um dado equivalente em estatura-para-idade devolve o escore z LMS sem correção

Cenário: medição em pé antes dos 2 anos
  Dada uma criança de 1 ano e 8 meses medida em pé, 82,0 cm
  Quando a avaliação é feita
  Então o índice comprimento-para-idade usa 82,7 cm
  E a saída declara que a conversão de +0,7 cm foi aplicada

Cenário: medida ausente não invalida as demais
  Dada uma criança de 3 anos com peso e estatura informados e sem perímetro cefálico
  Quando a avaliação é feita
  Então P/I, E/I e IMC/I são exibidos normalmente
  E PC/I não é exibido, sem mensagem de erro

Cenário negativo: idade fora da cobertura da fonte
  Dada uma criança de 12 anos com todas as medidas informadas
  Quando a avaliação é feita
  Então nenhum escore z é exibido
  E a tela informa que a Caderneta da Criança cobre de 0 a 10 anos
  E não há valor estimado, aproximado ou extrapolado em tela

Cenário negativo: perímetro cefálico acima dos 2 anos
  Dada uma criança de 3 anos com perímetro cefálico informado
  Quando a avaliação é feita
  Então PC/I sai como fora do escopo da fonte, informando a cobertura de 0 a 2 anos
  E os demais índices são calculados normalmente

Cenário negativo: entrada inválida em três pontos
  Dada uma avaliação sem sexo, com data de nascimento posterior à data da medição e peso -3 kg
  Quando a avaliação é solicitada
  Então os três ofensores são exibidos simultaneamente
  E nenhum escore z é calculado

Cenário negativo: edição invalida o resultado
  Dado um resultado exibido em tela
  Quando o médico altera qualquer campo do formulário
  Então o resultado vigente é marcado como desatualizado

Cenário: a nova seção nasce na home
  Dado um médico na página inicial da plataforma
  Quando percorre as seções
  Então encontra a seção Puericultura com o cartão da avaliação de crescimento
  E clicar no cartão o leva à tela /puericultura/crescimento

Cenário: proveniência e limites declarados fora do painel de resultado
  Dada a tela de crescimento aberta
  Quando o médico procura o contexto da fonte
  Então lê que a classificação vale para uma medição isolada, enquanto a caderneta avalia a tendência de medidas sucessivas
  E lê que esta versão não corrige a idade de crianças nascidas pré-termo
  E esse texto está fora do painel de resultado

Cenário negativo: a tela não pede confirmação de revisão
  Dado um resultado exibido em tela
  Quando o médico inspeciona os controles disponíveis
  Então não existe caixa de confirmação de revisão
  E não existe comando condicionado a essa confirmação

Cenário negativo: falha inesperada não produz número
  Dada uma falha fora do contrato do motor durante a avaliação
  Quando a tela recebe a falha
  Então exibe o painel honesto orientando a não decidir a partir daquela tela
  E nenhum escore z parcial é exibido
  E o evento registrado carrega apenas o nome da classe do erro
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 a RF-05, RF-07, RF-09, RF-10 | Must | Núcleo do domínio: sem LMS correto, correção de cauda, corte de escopo e referência, o número em tela é perigoso, não útil |
| RF-04 | Must | A troca de rótulos aos 5 anos é a armadilha central da fonte; errá-la produz laudo nutricional trocado |
| RF-06, RF-08 | Must | Medidas independentes e a conversão de 0,7 cm são o que separa a ferramenta de uma planilha ingênua |
| RF-11, RF-12, RF-14, RF-15 | Must | Sem tela e sem entrada no catálogo a feature não existe para o usuário; a ausência do ritual é invariante da família |
| RF-13, RF-17 | Must | Proveniência e painel honesto são invariantes da plataforma, não enfeite |
| RF-16 | Should | Declarar a ausência de pré-termo é honestidade; a implementação em si é outra feature |
| RNF de desempenho (bundle isolado por rota) | Should | Só vira Must se a tabela de referência crescer a ponto de degradar as outras rotas |
| Plotagem visual da curva | Won't (nesta entrega) | Ver a dúvida 1 em §10: o pedido diz "gráficos", mas a demanda declarada é "ter devolvido na tela os z scores". Plotar exige decidir sobre dependência de charting, contra a diretriz de dependências enxutas |
| Curvas de pré-termo e idade corrigida | Won't (nesta entrega) | RN-15; muda o formulário (IG ao nascer) e traz uma **segunda** fonte de curvas, tensionando ADR 0011 |
| Histórico de medições e tendência | Won't | Exigiria persistir dado clínico de menor — vedado por ADR 0002 sem reabrir LGPD e autenticação |
| Conduta, investigação ou encaminhamento | Won't | RN-12; a fonte não parametriza |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- 🔴 **[DÚVIDA] 1 — Escopo: a tela plota a curva ou só devolve os escores z?** O pedido nomeia "uma página para os gráficos de crescimento" (Queixa), mas descreve o resultado esperado como "ter devolvido na tela os z scores" (Demanda), e diz **"inicialmente"**. As duas leituras produzem features materialmente diferentes: (a) **só escores z e classificação** — nenhuma dependência nova, entrega enxuta, é o que este documento especifica; (b) **z-scores + curva plotada** com o ponto da criança sobre as linhas de ±1, ±2, ±3 — exige decidir entre SVG próprio (mais código, zero dependência, coerente com "dependências enxutas") e uma biblioteca de gráficos (dependência nova sujeita ao filtro de longevidade), além de multiplicar os pontos de referência a embarcar. Este requirements assume **(a)**, com a plotagem em `Won't` declarado (§8). Confirmar ou corrigir antes do `/reversa-plan`.
- 🔴 **[DÚVIDA] 2 — Escopo: pré-termo e idade corrigida entram nesta entrega?** A caderneta dedica duas páginas ao tema (p. 86, regra de idade corrigida; p. 87, curvas Intergrowth 27–64 semanas pós-concepcionais) e o prematuro é população frequente na APS. Incluir significa acrescentar IG ao nascer no formulário, uma **segunda** família de curvas e a regra de até quando corrigir (2 anos, ou 3 se IG < 28 semanas) — o que tensiona "uma fonte por unit" (ADR 0011) mesmo estando na mesma caderneta. Este documento assume **fora do escopo, com a ausência declarada em tela** (RN-15/RF-16). Confirmar.
- 🔴 **[DÚVIDA] 3 — Técnico: de onde vêm os valores `L/M/S` e como se reconciliam com o ADR 0011?** A caderneta traz os **gráficos** e as **faixas de classificação**, não as tabelas numéricas: os PDFs fornecidos não contêm `L`, `M` e `S` em lugar algum. Ela declara (p. 86) que as curvas são "da OMS/MS", de modo que a leitura natural é tratar a Caderneta como **fonte editorial** (faixas, rótulos, cobertura etária, correção de 0,7 cm) e as tabelas LMS da OMS como **o dado tabular que ela reproduz** — análogo aos coeficientes das PCE na feature 014, que também não vieram do texto do guia e foram validados contra implementações de referência. Três pontos a decidir: (i) essa leitura é aceita como **uma fonte por unit**, ou exige ADR próprio registrando a composição? (ii) qual recorte exato — WHO Child Growth Standards 2006 para 0–5 anos e WHO Growth Reference 2007 para 5–10 anos, que é o que a caderneta reproduz 🟡; (iii) os dados entram como **arquivo de dados versionado** no repo (rompendo com MD-0008, que mantém material de fonte fora do versionamento, mas tornando o cálculo auditável) ou transcritos em `fonte-clinica.ts` (coerente com os quatro domínios, porém volumoso demais para o teto de 400 linhas)? Sem essa decisão o `/reversa-plan` não tem o que planejar.

Pontos 🟡 **registrados e não bloqueantes** (seguem o precedente da dívida 5 de `_reversa_sdd/architecture.md#6`, a validar pelo prescritor, sem peso de regressão):

- 🟡 Faixas de plausibilidade da validação (peso ≤ 150 kg; comprimento/estatura 20–200 cm; PC 20–70 cm) — escolhidas por bom senso clínico, não pela fonte.
- 🟡 Granularidade da idade na consulta à tabela (por dia, como a OMS publica para 0–5 anos, ou por mês completo, como a caderneta plota) e o comportamento entre pontos tabelados (interpolação × arredondamento). Afeta o escore na terceira casa, não a classificação, salvo bem na borda de um corte.
- 🟡 Precisão de exibição do escore z: uma casa decimal, com o valor bruto disponível — a definir na tela.
- 🟡 Nomenclatura literal dos rótulos de C/I no material da menina ("Muito **baixo** comprimento"), preservada como transcrição fiel mesmo onde a concordância do original destoa.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-26 | Versão inicial gerada por `/reversa-requirements` | reversa |
