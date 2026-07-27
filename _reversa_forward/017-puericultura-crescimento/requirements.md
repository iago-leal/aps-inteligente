# Requirements: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-26`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA
> Categoria (Princípio nº 4 global): **Produto** — apoio à decisão clínica pediátrica, com responsabilidade sobre a leitura de desvio de crescimento.

## 1. Resumo executivo

Entrega a **quinta calculadora** da plataforma e a **primeira seção de Puericultura**: a partir de sexo, data de nascimento, data da medição, peso, comprimento/estatura e perímetro cefálico, a tela devolve os **escores z** dos índices antropométricos e a **classificação nutricional** correspondente, na redação literal da *Caderneta da Criança* (Ministério da Saúde, 2.ª ed., 2020, pp. 85–97). Resolve o trabalho hoje manual de plotar pontos no gráfico impresso e ler a faixa a olho — leitura que a caderneta admite ser aproximada, ao passo que o escore z é exato.

A calculadora atende **também a criança nascida pré-termo** (decisão da sessão de esclarecimento): recebe a idade gestacional ao nascer, aplica as curvas INTERGROWTH-21st enquanto a criança estiver na janela de 27 a 64 semanas pós-menstruais e, passada essa janela, transfere o acompanhamento para as curvas da Organização Mundial da Saúde (OMS) sobre **idade corrigida**, exatamente como a caderneta determina (pp. 86–87).

Um quinto domínio puro `models/puericultura` nasce sob os mesmos sete invariantes da família (`_reversa_sdd/domain.md#7`); a tela vive em `interface/puericultura/`, a rota em `pages/puericultura/crescimento.tsx`, e a seção nova entra primeiro em `interface/inicio/catalogo.ts`. Nenhum motor existente **muda de comportamento**: feature **estritamente aditiva**. Registre-se a ressalva que a auditoria cruzada levantou (A004), para que a promessa não seja lida como mais forte do que é: um arquivo de motor existente, `models/gestacao/datas.ts`, é **aberto** — só para receber, em comentário, a declaração do gêmeo que D-07 do roadmap exige. Nenhuma linha executável dele muda, e o `roadmap.md` §5 lista agora todo arquivo tocado, inclusive esse.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#1` | Plataforma guarda-chuva com **quatro domínios independentes** sob casca comum; três camadas unidirecionais `pages → interface/* → models/*`; a tabela de invariantes da família é o contrato que o quinto domínio deve satisfazer | 🟢 |
| `_reversa_sdd/domain.md#7` | Sete invariantes transversais: domínio puro, erro como valor, toda saída com `ReferenciaClinica`, coleta total de ofensores, constantes `Object.freeze` em `fonte-clinica.ts`, o motor informa e não escolhe, privacidade por construção | 🟢 |
| `_reversa_sdd/domain.md#8` | Fronteiras de escopo: cenário plausível fora da cobertura da fonte → `ForaDoEscopoDaFonte`, **sem número**, nunca extrapolação (MD-0009). Molde a aplicar à criança fora de 0–10 anos, ao PC acima de 2 anos e à idade pós-menstrual abaixo de 27 semanas | 🟢 |
| `_reversa_sdd/adrs/0011-*` (via `domain.md#2.1`) | **Uma fonte clínica por unit**, mescla proibida. Governa a decisão sobre a origem dos dados de referência — resolvida em `.harness/decisoes/MD-0001.md` | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo 4 — models/risco-cardiovascular` | Molde estrutural mais próximo: `fonte-clinica.ts` com tabela numérica extensa congelada, `validacao.ts` com coleta total + avisos não-travantes, `elegibilidade.ts` para o corte de escopo, fachada `validar → escopo → cálculo → categoria` | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo 9 — interface/risco-cardiovascular` | Molde de tela **sem ritual de revisão** (ADR 0012, D-08), com `proveniencia.tsx` separando a nota de limitação do painel de resultado | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo 2 — models/gestacao` | Aritmética de datas em **dias epoch UTC** (`paraDiasEpoch`, ADR 0013) e **data de referência injetada pela UI** (RN-07): o motor não lê o relógio. A idade da criança reusa exatamente essa disciplina; a idade gestacional em semanas+dias reusa o vocabulário já existente naquele domínio | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo 10 — interface/inicio` | `catalogo.ts` é fonte única tipada das seções (D-07, anti-drift) — a seção `puericultura` entra ali primeiro; o mapa de ícones da home tem fallback `null` para seção sem entrada | 🟢 |
| `_reversa_sdd/architecture.md#6` (dívida 5) | Precedente de **premissa clínica 🟡 registrada e não resolvida** — o mesmo tratamento vale para os pontos 🟡 desta feature | 🟢 |
| `_reversa_sdd/addenda/016-*` (vigente) | Cabeçalho unificado: as calculadoras declaram `comInicio` na `Moldura`; a prop `logoComoTitulo` **não existe mais**. A tela nova nasce já com o contrato atual | 🟢 |
| Fonte clínica (fora do repo, MD-0008) | *Caderneta da Criança — Menino / Menina*, MS, 2.ª ed., Brasília, 2020, "Acompanhando o Crescimento", pp. 85–97; curvas de pré-termo **INTERGROWTH-21st** (University of Oxford) na p. 87, verificadas na própria página | 🟢 |
| `.harness/decisoes/MD-0001.md` | A caderneta é a fonte editorial; as tabelas de referência que ela reproduz (OMS e INTERGROWTH-21st) são o dado tabular da mesma fonte, não fontes concorrentes | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico de família na Atenção Primária à Saúde, APS (prescritor anônimo, único papel do sistema) | Classificar o estado nutricional e o crescimento de uma criança na consulta de puericultura | Na consulta de rotina de um lactente de 7 meses, informa sexo, data de nascimento, data de hoje, peso, comprimento e perímetro cefálico, e obtém os escores z com as classificações da caderneta, para registrar no prontuário e conduzir a consulta |
| Mesmo médico, egresso de UTI neonatal | Acompanhar o prematuro sem errar a curva nem a idade | Criança nascida com 30 semanas, hoje com 2 meses de vida: a calculadora reconhece que ela está na janela pós-menstrual das curvas de pré-termo e usa a referência certa, sem que o médico precise decidir qual gráfico abrir |
| Mesmo médico, revisão de caso | Confirmar suspeita de desvio percebida no gráfico impresso | Uma criança de 3 anos aparenta baixa estatura no gráfico; o médico confere o escore z exato de E/I e o de IMC/I, e vê se cruza o corte de −2 |
| Mesmo médico, criança fora da cobertura | Não ser induzido a erro | Criança de 12 anos: a tela **recusa honestamente** em vez de extrapolar a curva de 5 a 10 anos |

## 4. Regras de negócio novas ou alteradas

Todas **novas** (`models/puericultura`); nenhuma regra dos quatro domínios existentes é alterada ou removida.

1. **RN-01 — Índices calculados.** 🟢 A partir das entradas, o motor calcula até quatro índices: **P/I** (peso-para-idade), **C/I ou E/I** (comprimento-para-idade < 2 anos; estatura-para-idade ≥ 2 anos), **IMC/I** (índice de massa corporal-para-idade) e **PC/I** (perímetro cefálico-para-idade). Cada índice é **independente**: a ausência de uma medida suprime só o índice que dela depende, sem invalidar os demais.
   - Origem no legado: nova (molde de saída composta análogo a `_reversa_sdd/code-analysis.md#Módulo 2`)
   - Tipo: nova
2. **RN-02 — Escore z pelo método LMS (curvas da OMS).** 🟢 O **escore z** é o número de desvios-padrão que separa a medida da criança da mediana de referência para o seu sexo e idade. O **método LMS** descreve a distribuição do indicador em cada idade por três parâmetros — `L` (assimetria), `M` (mediana) e `S` (coeficiente de variação) — e converte medida em escore por `z = ((X/M)^L − 1) / (L·S)` quando `L ≠ 0`, e por `z = ln(X/M)/S` quando `L = 0`. Vale para as curvas da OMS; as curvas de pré-termo têm modelo próprio (RN-17).
   - Tipo: nova
3. **RN-03 — Correção de cauda da OMS.** 🟢 Para **P/I e IMC/I** — e **somente** para eles —, quando `|z| > 3` o escore é recalculado de forma linear sobre a distância entre os desvios-padrão 2 e 3: se `z > 3`, `z = 3 + (X − SD3⁺)/(SD3⁺ − SD2⁺)`; se `z < −3`, `z = −3 + (X − SD3⁻)/(SD2⁻ − SD3⁻)`, onde `SDn±` é o valor do indicador em `z = ±n` pela própria LMS. **E/I (C/I) e PC/I não recebem correção de cauda** — a distribuição é aproximadamente normal em toda a extensão. Omitir esta regra produz escores extremos irrealistas em desnutrição grave e obesidade grave, justamente onde a decisão clínica é mais consequente.
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
   - **Fronteiras em números** (D-15 e D-16 do roadmap, ficha `MD-0006`; a redação original dizia "anos", que não é testável): a cobertura superior termina no **mês 120 inclusive** — recusa a partir de **3683 dias**, porque o mês 120 cobre os dias 3653 a 3682; o perímetro cefálico é calculável enquanto **`dias ≤ 730`** e sai do escopo a partir de **731**.
   - Origem no legado: `_reversa_sdd/domain.md#8`
   - Tipo: nova (aplicação de regra transversal existente)
9. **RN-09 — Comprimento × estatura e a correção de 0,7 cm (p. 85).** 🟢 Criança **< 2 anos** mede-se **deitada** (comprimento); **≥ 2 anos**, **em pé** (estatura). Quando a posição efetiva da medição diverge da esperada para a idade, a fonte determina converter antes de classificar: medida deitada em criança ≥ 2 anos → **subtrair 0,7 cm**; medida em pé em criança < 2 anos → **somar 0,7 cm**. O motor recebe a posição como entrada explícita, aplica a conversão e **declara no resultado** que a aplicou. Não há default silencioso: a posição é dado clínico, não suposição.
   - **Fronteira em números** (D-16, ficha `MD-0006`): "menor de 2 anos" é **`dias ≤ 730`**, o mesmo limiar do perímetro cefálico e o ponto em que a própria OMS troca a posição de medida na tabela de comprimento/estatura; "2 anos ou mais" começa em **731 dias**.
   - Tipo: nova
10. **RN-10 — Idade em dias epoch UTC, data de referência injetada.** 🟢 A idade cronológica é a diferença entre a data da medição e a data de nascimento, em **dias inteiros sobre `Date.UTC`**, reusando a disciplina de `models/gestacao` (ADR 0013). O motor **não lê o relógio**: a data da medição é entrada (RN-07 da 007). Calendário impossível (ex.: 30 de fevereiro) é ofensor, nunca normalização silenciosa.
    - Origem no legado: `_reversa_sdd/domain.md#4` (regras 26 e 27)
    - Tipo: nova (reúso de invariante existente)
11. **RN-11 — Validação por coleta total.** 🟢 A validação nunca para no primeiro erro. Ofensores que **travam**: sexo ausente/inválido; data de nascimento ausente, inválida ou **futura** em relação à data da medição; data de medição inválida; nenhuma medida informada; medida não positiva; idade gestacional ao nascer, quando informada, fora de **22 a 42 semanas** ou com dias fora de 0–6. Faixas de plausibilidade 🟡: peso `0 < p ≤ 150 kg`; comprimento/estatura `20–200 cm`; perímetro cefálico `20–70 cm`.
    - Origem no legado: `_reversa_sdd/domain.md#7` (invariante 4)
    - Tipo: nova
12. **RN-12 — O motor informa, não escolhe.** 🟢 A saída é escore z + classificação literal da caderneta + referência de página. O motor **não** emite conduta, não sugere investigação, não indica encaminhamento e não interpreta tendência entre medições. Consequência direta de ADR 0005 e da natureza da fonte: a caderneta orienta que desvios "devem ser diagnosticados e tratados precocemente" (p. 85) sem parametrizar como — o que o guia não parametriza, o motor não inventa.
    - Origem no legado: `_reversa_sdd/domain.md#7` (invariante 6)
    - Tipo: nova
13. **RN-13 — Sem ritual de revisão.** 🟢 Classificar crescimento não prescreve dose: a tela **não tem** checkbox de confirmação, seguindo gestação, cardiopatia e risco cardiovascular (ADR 0012, D-08).
    - Origem no legado: `_reversa_sdd/domain.md#7.1` (regra 10)
    - Tipo: nova
14. **RN-14 — Nota de proveniência e de leitura pontual.** 🟢 A tela declara, em bloco próprio fora do painel de resultado (molde `proveniencia.tsx` da 014), que a classificação vale para **uma medição isolada**, ao passo que a caderneta ensina que o crescimento se avalia pela **tendência** de pontos sucessivos (p. 85: "várias medidas […] unidas entre si formam uma linha"), e identifica os padrões de referência em uso (OMS e INTERGROWTH-21st, conforme a janela).
    - Tipo: nova

### 4.1 Criança nascida pré-termo (pp. 86–87)

15. **RN-15 — Idade gestacional ao nascer como entrada opcional.** 🟢 O formulário aceita a **idade gestacional (IG) ao nascer** em semanas + dias. Quando **ausente**, o motor trata a criança como nascida a termo, não corrige idade alguma e **declara essa premissa no resultado** — silenciar produziria classificação errada num prematuro sem que o médico percebesse. Quando informada e **≥ 37 semanas**, também não há correção: a regra da caderneta é para o recém-nascido pré-termo (RNPT).
    - Tipo: nova
16. **RN-16 — Idade corrigida (p. 86).** 🟢 Para RNPT (IG ao nascer < 37 semanas): `desconto = 40 semanas − IG ao nascer`, e `idade corrigida = idade cronológica − desconto`. A correção vale **até 2 anos de idade cronológica**, ou **até 3 anos** quando a IG ao nascer for **< 28 semanas**; ultrapassado esse limite, o motor volta a usar a idade cronológica pura. Toda leitura de curva da OMS num RNPT dentro do período usa a **idade corrigida**, e o resultado **declara** que a usou, com o desconto aplicado.
    - Tipo: nova
17. **RN-17 — Curvas de pré-termo INTERGROWTH-21st (p. 87).** 🟢 Enquanto o RNPT estiver na janela de **27 a 64 semanas de idade pós-menstrual** (`IG ao nascer + idade cronológica em semanas`), os índices de **peso, comprimento e perímetro cefálico** são lidos nas curvas INTERGROWTH-21st, indexadas por **semana pós-menstrual**, e não nas curvas da OMS. **Não existe IMC nessas curvas**: nessa janela o índice IMC/I simplesmente não é calculado, sem que isso seja erro. Passadas as 64 semanas pós-menstruais, o acompanhamento transfere-se para as curvas da OMS sobre idade corrigida (RN-16) — a transferência é determinada pela própria caderneta.
    - Tipo: nova
18. **RN-18 — Fronteira inferior do pré-termo.** 🟢 Idade pós-menstrual **< 27 semanas** → `ForaDoEscopoDaFonte`, **sem número**: a caderneta começa em 27 semanas e extrapolar abaixo disso é inventar referência para o paciente mais frágil do serviço.
    - Origem no legado: `_reversa_sdd/domain.md#8` (MD-0009)
    - Tipo: nova
19. **RN-19 — O médico sempre sabe qual régua foi usada.** 🟢 Todo índice calculado declara, na saída, **qual padrão o produziu** (OMS ou INTERGROWTH-21st), **qual idade** foi usada (cronológica ou corrigida, com o desconto) e a **referência de página**. Duas crianças com o mesmo peso e a mesma data de nascimento podem receber escores diferentes por terem nascido em idades gestacionais distintas: sem essa declaração, o número seria inauditável.
    - Origem no legado: `_reversa_sdd/domain.md#7` (invariante 3)
    - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Domínio puro `models/puericultura` com fachada `CalculadoraCrescimentoInfantil.avaliar(entrada)`, sem `import` de framework | Must | Teste de fronteira: nenhum `import` de framework em `models/puericultura/**`; suíte do domínio roda sem DOM | 🟢 |
| RF-02 | Cálculo do escore z pelo método LMS (RN-02) nas curvas da OMS | Must | Oráculo: para casos com `L/M/S` conhecidos, o z calculado bate com o valor de referência em ±0,01 | 🟢 |
| RF-03 | Correção de cauda da OMS aplicada **apenas** a P/I e IMC/I (RN-03) | Must | Caso com `z` bruto `> 3` em P/I devolve z corrigido, provado contra a coluna `SD4` da própria planilha, que a OMS publica já corrigida (T008). A metade negativa — E/I devolve o z LMS sem correção — corre sobre acervo **sintético com `L ≠ 1`**: no dado real da OMS esses indicadores têm `L = 1`, e ali as duas regras coincidem por construção (diferença de 1e-14), de modo que o par não distinguiria implementação certa de errada | 🟢 |
| RF-04 | Classificação literal por índice e faixa etária (RN-04 a RN-07), com a **troca de rótulos do IMC aos 5 anos** | Must | Casos-limite: `z = +2,5` aos 4a11m → "Sobrepeso"; mesmo z aos 5a0m → "Obesidade"; bordas `−3`, `−2`, `+1`, `+2`, `+3` conferidas em cada índice | 🟢 |
| RF-05 | Idade cronológica em dias epoch UTC a partir de data de nascimento e data da medição injetada (RN-10) | Must | Determinismo: mesma entrada → mesma saída, independentemente do fuso do ambiente de teste | 🟢 |
| RF-06 | Índices independentes: medida ausente suprime só o índice dependente (RN-01) | Must | Entrada só com peso devolve P/I preenchido e os demais ausentes, sem erro | 🟢 |
| RF-07 | `ForaDoEscopoDaFonte` para idade fora de 0–10 anos (global), para PC/I em criança ≥ 2 anos (parcial) e para idade pós-menstrual < 27 semanas (global), **sem número** (RN-08, RN-18) | Must | Criança de 12 anos: nenhum escore z, motivo `IDADE_FORA_DA_COBERTURA`; criança de 3 anos com PC: demais índices normais + PC/I fora de escopo com motivo `PC_ACIMA_DE_2_ANOS`; idade pós-menstrual 26 semanas: nenhum índice, motivo `ABAIXO_DA_CURVA_DE_PRETERMO`. **Nos limites** (D-15/D-16): 3682 dias calcula e 3683 recusa; 730 dias calcula PC/I e 731 o põe fora de escopo | 🟢 |
| RF-08 | Posição da medição (deitado/em pé) como entrada explícita, com conversão de 0,7 cm e declaração da conversão aplicada (RN-09) | Must | Criança de 2a3m medida deitada, 90,0 cm → o índice usa 89,3 cm e a saída carrega o aviso da conversão | 🟢 |
| RF-09 | Validação com coleta total de ofensores (RN-11) | Must | Entrada com sexo ausente **e** data de nascimento futura **e** peso negativo devolve **três** ofensores, não um | 🟢 |
| RF-10 | Toda saída carrega `ReferenciaClinica` com página da caderneta e edição | Must | Property-based: para qualquer entrada válida, todo índice calculado tem referência não vazia | 🟢 |
| RF-11 | Tela `/puericultura/crescimento`: formulário (sexo, data de nascimento, data da medição, peso, comprimento/estatura + posição da medição, perímetro cefálico, idade gestacional ao nascer) e painel com os índices | Must | Integração: preencher e calcular exibe os blocos rotulados com z (uma casa decimal) e classificação | 🟢 |
| RF-12 | Invalidação por edição: qualquer alteração marca o resultado como `desatualizado` | Must | Molde das quatro telas (`_reversa_sdd/domain.md#7.1`, regra 8); teste de integração | 🟢 |
| RF-13 | Bloco de proveniência fora do painel de resultado (RN-14), com a ressalva de medição isolada × tendência e a identificação dos padrões em uso | Must | Texto único congelado no domínio, lido pela tela (anti-drift, molde `NOTA_PROVENIENCIA` da 014) | 🟢 |
| RF-14 | Seção `puericultura` no catálogo (`interface/inicio/catalogo.ts`) + ícone próprio no mapa de ícones da home, com a rota `/puericultura/crescimento` | Must | Home renderiza a quarta seção com o cartão clicável; e2e navega da home à tela nova | 🟢 |
| RF-15 | Sem ritual de revisão na tela (RN-13) | Must | Teste negativo: nenhum checkbox de confirmação no DOM da tela | 🟢 |
| RF-16 | Idade gestacional ao nascer como campo opcional; ausente → assume termo e **declara a premissa** (RN-15) | Must | Sem IG informada, o resultado traz a declaração de que não houve correção; com IG ≥ 37 semanas, idem | 🟢 |
| RF-17 | Idade corrigida calculada e aplicada nos limites da fonte (RN-16) | Must | RNPT de 30 semanas com 6 meses cronológicos → desconto de 10 semanas aplicado; aos 2a1m de idade cronológica → sem correção; com IG de 27 semanas, a correção persiste até 3 anos | 🟢 |
| RF-18 | Curvas INTERGROWTH-21st na janela de 27 a 64 semanas pós-menstruais, para peso, comprimento e PC (RN-17) | Must | RNPT de 32 semanas com 4 semanas de vida (36 pós-menstruais) → três índices lidos no padrão de pré-termo; **IMC/I ausente**, sem erro | 🟢 |
| RF-19 | Transferência automática do padrão de pré-termo para as curvas da OMS após 64 semanas pós-menstruais (RN-17) | Must | Mesmo RNPT em 64 e em 65 semanas pós-menstruais: o padrão declarado muda de INTERGROWTH-21st para OMS, e a idade passa a ser a corrigida | 🟢 |
| RF-20 | Cada índice declara o padrão usado, a idade usada (cronológica ou corrigida, com desconto) e a página de referência (RN-19) | Must | Property-based: nenhum índice calculado sai sem padrão e sem idade declarados | 🟢 |
| RF-21 | Painel honesto em falha inesperada (exceção fora do contrato) | Should | Molde das quatro telas: `ErroDeInvariante` → painel "não decida a partir desta tela" + evento anônimo (só nome da classe) | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Privacidade | Nenhum dado da criança (data de nascimento, medidas, idade gestacional) é persistido, transmitido ou logado; nenhum `fetch`/`storage` clínico | ADR 0002, `_reversa_sdd/domain.md#7` (invariante 7). Dado de menor de idade agrava o risco: a barreira é estrutural, não configurável | 🟢 |
| Privacidade | A tela **não** coleta nome nem qualquer identificador da criança — só as variáveis do cálculo | Minimização de dados; nada no cálculo exige identificar o paciente | 🟢 |
| Segurança | Sem dependência nova de runtime; CSP sem terceiros preservada | `_reversa_sdd/architecture.md#4`; features 011–016 não introduziram dependência | 🟢 |
| Reprodutibilidade | As tabelas de referência são **arquivo de dados versionado** no repositório, lido pelo domínio — build determinístico hoje e daqui a anos, sem depender de servidor externo | Decisão da sessão de esclarecimento; Princípio 5.3 (reprodutibilidade temporal) | 🟢 |
| Desempenho | Avaliação síncrona no cliente, imperceptível (< 16 ms); as tabelas não podem inflar o bundle das outras rotas | O volume de dados é a única novidade de peso do projeto: o custo deve ficar isolado em `/puericultura/crescimento` | 🟡 |
| Robustez | Não há concorrência, retentativa nem tempo-limite a considerar: a avaliação é síncrona, local e sem entrada/saída — a única falha possível é a exceção de invariante, tratada em RF-21 | 🟢 |
| Manutenibilidade | Nenhum arquivo de **código** acima de 400 linhas; nenhuma função acima de 50 linhas. O arquivo de **dados** é exceção declarada: é tabela, não lógica | Sinal de dívida do mantenedor (CLAUDE.md §5.6); a exceção evita o falso dilema entre o teto e a coesão do dado | 🟢 |
| Acessibilidade | Delta axe-core **0/0** na rota nova, como nas cinco rotas atuais | Baseline e2e vigente | 🟢 |
| Rastreabilidade | Cada arquivo cita no cabeçalho o `RF-NN` que o originou; matriz `_reversa_sdd/traceability/` estendida | Princípio VI | 🟢 |
| Testabilidade | Motor injetável na tela; data da medição injetada; property-based nos invariantes do domínio | Princípio VII; molde das quatro telas | 🟢 |
| Observabilidade | `RelatorDeErros` nulo, evento anônimo com nome de classe apenas | ADR 0007 | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: lactente a termo com medidas completas
  Dado um menino nascido em 2026-01-10 e uma medição em 2026-08-10 (7 meses)
  E peso 8,2 kg, comprimento 68,5 cm medido deitado, perímetro cefálico 44,0 cm
  Quando o médico solicita a avaliação
  Então a tela exibe os quatro índices — P/I, C/I, IMC/I e PC/I — cada um com escore z
    E cada índice traz a classificação literal da Caderneta da Criança
    E cada índice declara o padrão usado e a página de referência

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

Cenário: prematuro dentro da janela das curvas de pré-termo
  Dado um menino nascido com 32 semanas de idade gestacional, medido 4 semanas depois
  Quando a avaliação é feita
  Então peso, comprimento e perímetro cefálico são lidos nas curvas INTERGROWTH-21st
    E cada índice declara esse padrão e a idade pós-menstrual de 36 semanas
    E o índice de IMC não é exibido, por não existir nessas curvas
    E a ausência do IMC não é apresentada como erro

Cenário: transferência do padrão de pré-termo para as curvas da OMS
  Dado um prematuro cuja idade pós-menstrual é de 64 semanas
  Quando a avaliação é feita
  Então os índices declaram o padrão INTERGROWTH-21st
  Quando a mesma criança é avaliada com 65 semanas pós-menstruais
  Então os índices declaram as curvas da OMS
    E a idade usada é a corrigida, com o desconto explicitado

Cenário: até quando a idade é corrigida
  Dado um prematuro nascido com 30 semanas de idade gestacional
  Quando é avaliado com 1 ano e 6 meses de idade cronológica
  Então a idade usada é a corrigida, com desconto de 10 semanas
  Quando é avaliado com 2 anos e 1 mês de idade cronológica
  Então a idade usada é a cronológica, sem correção
  E um prematuro de 27 semanas mantém a correção até os 3 anos

Cenário: idade gestacional não informada
  Dada uma criança sem idade gestacional ao nascer informada
  Quando a avaliação é feita
  Então o resultado declara que a criança foi tratada como nascida a termo
  E nenhuma correção de idade é aplicada

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

Cenário negativo: abaixo da curva de pré-termo
  Dado um recém-nascido cuja idade pós-menstrual é de 26 semanas
  Quando a avaliação é feita
  Então nenhum escore z é exibido
  E a tela informa que as curvas de pré-termo começam em 27 semanas

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
  E lê quais padrões de referência a calculadora usa
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
| RF-16 a RF-20 | Must | O prematuro entrou no escopo por decisão de 26/07; entregá-lo pela metade seria pior que não entregá-lo, porque a classificação errada num RNPT tem consequência assistencial direta |
| RF-11, RF-12, RF-14, RF-15 | Must | Sem tela e sem entrada no catálogo a feature não existe para o usuário; a ausência do ritual é invariante da família |
| RF-13, RF-21 | Must | Proveniência e painel honesto são invariantes da plataforma, não enfeite |
| RNF de desempenho (bundle isolado por rota) | Should | Só vira Must se as tabelas crescerem a ponto de degradar as outras rotas |
| Plotagem visual da curva | Won't (nesta entrega) | Decidido em 26/07: a entrega é dos escores z e da classificação. A curva fica para uma feature seguinte, sem depender de biblioteca nova |
| Histórico de medições e tendência | Won't | Exigiria persistir dado clínico de menor — vedado por ADR 0002 sem reabrir LGPD e autenticação |
| Conduta, investigação ou encaminhamento | Won't | RN-12; a fonte não parametriza |

## 9. Esclarecimentos

### Sessão 2026-07-26

- **Q:** A tela plota a curva de crescimento ou devolve só os escores z?
  **R:** Só escores z e classificação. A curva fica para uma feature seguinte; nenhuma dependência nova de visualização entra agora. Reflete-se em §8 (`Won't`) e na ausência de RF de plotagem.

- **Q:** Crianças nascidas pré-termo entram nesta entrega (idade corrigida e curvas próprias)?
  **R:** **Sim, tudo** — idade corrigida e curvas de pré-termo. O escopo ampliou: entraram RN-15 a RN-19 e RF-16 a RF-20, mais o campo de idade gestacional ao nascer no formulário e seis cenários de aceitação. As curvas foram identificadas na p. 87 como **INTERGROWTH-21st** (University of Oxford), de 27 a 64 semanas pós-menstruais, cobrindo peso, comprimento e perímetro cefálico — **sem IMC**, o que se tornou RN-17.

- **Q:** Como os parâmetros L/M/S da OMS entram no projeto?
  **R:** Como **arquivo de dados versionado** no repositório, lido pelo domínio. Torna o cálculo auditável e o build determinístico; a exceção ao teto de 400 linhas vale só para o arquivo de dados, não para código (§6, Manutenibilidade). A composição fonte editorial × dado tabular está registrada em `.harness/decisoes/MD-0001.md`, agora estendida também às curvas INTERGROWTH-21st.

- **Q:** Com que granularidade de idade o motor consulta a tabela de referência?
  **R:** **Por dia até 5 anos e por mês de 5 a 10 anos** — exatamente como a OMS publica. Sem interpolação: nenhum valor usado no cálculo é estimado por nós. Nas curvas de pré-termo, o índice é a **semana pós-menstrual** (RN-17).

## 10. Lacunas

As três dúvidas da versão inicial foram resolvidas na sessão de 2026-07-26. Permanecem os pontos 🟡 abaixo, **registrados e não bloqueantes** (precedente da dívida 5 de `_reversa_sdd/architecture.md#6`, a validar pelo prescritor, sem peso de regressão) e um ponto de investigação técnica para o `/reversa-plan`:

- 🟡 **Modelo estatístico das curvas INTERGROWTH-21st pós-natais.** A fórmula LMS de RN-02 vale para as curvas da OMS; os padrões pós-natais de pré-termo têm formulação própria. Qual conversão de medida em escore z usar — e em que forma a tabela é publicada — é trabalho de apuração do `/reversa-plan` (fase de investigação), não decisão de produto. Enquanto não apurado, RN-17 fixa **o que** deve acontecer, não **como** se calcula.
- 🟡 Faixas de plausibilidade da validação (peso ≤ 150 kg; comprimento/estatura 20–200 cm; PC 20–70 cm; IG ao nascer 22–42 semanas) — escolhidas por bom senso clínico, não pela fonte.
- 🟡 Precisão de exibição do escore z: uma casa decimal, com o valor bruto disponível — a definir na tela.
- 🟡 Nomenclatura literal dos rótulos de C/I no material da menina ("Muito **baixo** comprimento"), preservada como transcrição fiel mesmo onde a concordância do original destoa.
- 🟡 Recorte das tabelas da OMS: WHO Child Growth Standards 2006 para 0–5 anos e WHO Growth Reference 2007 para 5–10 anos, que é o que a caderneta reproduz — a conferir contra os gráficos na fase de investigação.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-26 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-26 | Sessão de esclarecimento (`/reversa-clarify`): quatro respostas integradas; pré-termo **entra** no escopo (RN-15 a RN-19, RF-16 a RF-20, seis cenários novos); plotagem confirmada como `Won't`; dados de referência como arquivo versionado; granularidade por dia até 5 anos. Três `[DÚVIDA]` resolvidos, zero restantes | reversa |
