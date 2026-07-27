# Relatório da revisão de linguagem — feature 018

> Ação **T050**, exigida por **RF-03**: cada literal autoral do inventário aparece aqui como
> **mantido**, com justificativa, ou **reescrito**, com o par antes/depois. A lista é
> conferida contra o inventário inteiro, e não contra os arquivos que a decomposição lembrou
> de listar — é a rede que o roadmap §9 montou contra o risco de a frente de reescrita ser
> mais estreita que a superfície inventariada.
>
> Fonte: `tests/apoio/inventario-textual.json`, 642 literais, dos quais **490 autorais**.

## 1. O que a revisão fez, em números

| | Literais |
|---|---:|
| Autorais no inventário | **490** |
| — dos quais no `README.md`, revisado como prosa contínua (D-10) | 146 |
| — dos quais no código, revisados literal a literal | **344** |
| Reescritos | **27** |
| Acrescentados | **1** |
| Mantidos | **316** |
| Citações preservadas byte a byte | 106 |
| Citações com afastamento declarado (`MD-0015`) | **2** |
| Identificadores, fora do alcance da revisão | 44 |

**Vinte e sete reescritas em trezentos e quarenta e quatro literais é pouco, e convém dizer
por que é o número certo em vez de o número baixo.** A prosa desta plataforma não estava
malfeita: estava sem norma. O que a revisão encontrou foram desvios de **forma** concentrados
em três famílias — o travessão fazendo ofício de dois-pontos, a caixa de título onde o
catálogo já usava caixa de frase, e o separador acumulado nos `<title>` —, mais **um defeito
de exatidão**, que é a descrição da home. Reescrever mais do que isso teria sido trocar gosto
por gosto, e o guia existe justamente para que a próxima revisão não precise deliberar de
novo sobre o que esta manteve.

## 2. Os vinte e sete literais reescritos, com o par antes/depois

### 2.1 O defeito de exatidão (RF-04)

| Arquivo | Antes | Depois |
|---|---|---|
| `pages/index.tsx` | `…por seção: Diabetes Mellitus tipo 2 e Pré-natal.` | `…por seção: Diabetes Mellitus tipo 2, Pré-natal, Cardiologia e Puericultura.` |

A descrição que sai para o buscador nomeava duas das quatro seções do catálogo. É
desatualização de conteúdo, e não questão de estilo: o texto descrevia uma plataforma que já
não existia. O verificador `descricao-plataforma.test.ts` passa a compará-la ao `CATALOGO` na
forma positiva, de modo que a quinta seção não entre sem revisitá-la.

### 2.2 O travessão fazendo ofício de dois-pontos (§3.2 do guia)

Nenhum destes travessões marcava subjetividade: todos separavam ou introduziam, que é
trabalho de sinal sintático. O eixo expressivo se racionou; o sentido não se moveu.

| Arquivo | Antes | Depois |
|---|---|---|
| `interface/calculadora/resultado.tsx` | `Plano copiado — cole no prontuário.` | `Plano copiado: cole no prontuário.` |
| `interface/calculadora/resultado.tsx` | `Os dados mudaram — recalcule antes de prescrever.` | `Os dados mudaram: recalcule antes de prescrever.` |
| `interface/calculadora/resultado.tsx` | `Condutas alternativas do guia — a escolha é do prescritor` | `Condutas alternativas do guia: a escolha é do prescritor` |
| `interface/calculadora/resultado.tsx` | `Entradas fora da faixa plausível — nenhuma dose foi calculada:` | `Entradas fora da faixa plausível. Nenhuma dose foi calculada:` |
| `interface/calculadora/resultado.tsx` | `… — dose inicial pela fonte:` | `…. Dose inicial pela fonte:` |
| `models/insulina/fonte-clinica.ts` | `…se estiver em uso, suspender — a NPH já está fracionada.` | `…se estiver em uso, suspender, pois a NPH já está fracionada.` |
| `models/insulina/regra-intensificacao.ts` | `…pós-prandiais para ajuste — o guia não parametriza esse ajuste; a conduta é do prescritor.` | `…pós-prandiais. O guia não parametriza esse ajuste, e a conduta é do prescritor.` |
| `models/gestacao/calculadora.ts` | `…entre as datações — a avaliação é do julgamento clínico.` | `…entre as datações, e a avaliação é do julgamento clínico.` |
| `models/puericultura/calculadora.ts` | `…informe a idade gestacional — a classificação pode mudar.` | `…informe a idade gestacional: a classificação pode mudar.` |
| `models/cardiopatia-isquemica/fonte-clinica.ts` | `…por método invasivo — encaminhar ao cardiologista.` | `…por método invasivo, com encaminhamento ao cardiologista.` |
| `models/cardiopatia-isquemica/fonte-clinica.ts` | `…atendimento emergencial — não seguir o fluxo eletivo de investigação.` | `…atendimento emergencial, e não seguir o fluxo eletivo de investigação.` |
| `models/puericultura/fonte-clinica.ts` | `…na linha publicada — por dia até os 5 anos e por mês completo depois —, sem interpolação` | `…na linha publicada, por dia até os 5 anos e por mês completo depois, sem interpolação` |
| `interface/risco-cardiovascular/proveniencia.tsx` | `professional.heart.org — PREVENT™ Online Calculator` | `professional.heart.org · PREVENT™ Online Calculator` |

**A última linha da tabela é a mais delicada da feature inteira**, e merece o parágrafo que
o roadmap §9 previu: a `NOTA_PROVENIENCIA` da puericultura tinha **dois pares** de travessão,
contra o teto de um. O segundo aparte virou oração coordenada, e **nenhuma afirmação clínica
se moveu** — leitura por tendência, curvas da OMS de 2006 e referência de 2007, faixa
INTERGROWTH-21st de 27 a 64 semanas pós-menstruais da p. 87, leitura na linha publicada sem
interpolação. O par antes/depois acima é a prova sob leitura humana que RN-04 pede, já que a
regra é de recusa e não de teste.

### 2.3 Caixa de frase e separador único do `<title>` (§6.1 e §6.2)

Onze literais, cinco `<title>` e seis `<h1>` de tela, todos pelo mesmo motivo: o catálogo já
escreve em caixa de frase e é ele a fonte única dos nomes das calculadoras, de modo que o
título que escrevia em caixa de título divergia da fonte pela capitalização.

| Arquivo | Antes | Depois |
|---|---|---|
| `pages/index.tsx` | `APS Inteligente — Calculadoras clínicas para a APS` | `APS Inteligente · Calculadoras clínicas para a APS` |
| `pages/dm2/insulina.tsx` | `Calculadora de Insulina — DM2 · APS Inteligente` | `Calculadora de insulina no DM2 · APS Inteligente` |
| `pages/pre-natal/idade-gestacional.tsx` | `Calculadora de Idade Gestacional · APS Inteligente` | `Calculadora de idade gestacional · APS Inteligente` |
| `pages/cardiologia/dor-toracica.tsx` | `Probabilidade Pré-teste de Cardiopatia Isquêmica · APS Inteligente` | `Probabilidade pré-teste de cardiopatia isquêmica · APS Inteligente` |
| `pages/cardiologia/risco-cardiovascular.tsx` | `Risco Cardiovascular em 10 anos (Pooled Cohort Equations) · APS Inteligente` | `Risco cardiovascular em 10 anos (Pooled Cohort Equations) · APS Inteligente` |
| `pages/puericultura/crescimento.tsx` | `Avaliação do Crescimento Infantil · APS Inteligente` | `Avaliação do crescimento infantil · APS Inteligente` |
| `interface/calculadora/tela.tsx` | `Calculadora de Insulina — DM2` | `Calculadora de insulina no DM2` |
| `interface/gestacao/tela.tsx` | `Calculadora de Idade Gestacional` | `Calculadora de idade gestacional` |
| `interface/cardiologia/tela.tsx` | `Probabilidade Pré-teste de Cardiopatia Isquêmica` | `Probabilidade pré-teste de cardiopatia isquêmica` |
| `interface/risco-cardiovascular/tela.tsx` | `Risco Cardiovascular em 10 anos (Pooled Cohort Equations)` | `Risco cardiovascular em 10 anos (Pooled Cohort Equations)` |
| `interface/puericultura/tela.tsx` | `Avaliação do Crescimento Infantil` | `Avaliação do crescimento infantil` |

O `<title>` de `/dm2/insulina` acumulava `—` **e** `·` na mesma linha, e é o caso que deu
origem à regra: o travessão ali não comentava nada, apenas separava, e separar é ofício do
ponto médio. A qualificação passou a caber na própria frase, por preposição.

### 2.4 As mensagens de validação (§5.1, resolução de L-08)

| Arquivo | Antes | Depois |
|---|---|---|
| `models/cardiopatia-isquemica/validacao.ts` | `Sexo inválido: informe masculino ou feminino (eixo do Quadro 2).` | `Sexo inválido: informe masculino ou feminino. A probabilidade pré-teste é específica por sexo.` |
| `models/risco-cardiovascular/validacao.ts` | `Sexo inválido: informe masculino ou feminino.` | `Sexo inválido: informe masculino ou feminino. As equações são específicas por sexo.` |
| `models/risco-cardiovascular/validacao.ts` | `Raça inválida: informe branco, afro-americano ou outra.` | `Raça inválida: informe branca, preta/afro-americana ou outra.` |

As três formas da recusa por sexo convergiram para o molde do guia: núcleo obrigatório
(diagnóstico e instrução), complemento facultativo que responde "por que o sistema não pode
seguir sem isto?", e **referência à fonte vedada** — `(eixo do Quadro 2)` saiu porque toda
saída do domínio já carrega a sua `ReferenciaClinica`, e reescrever a localização dentro da
mensagem criaria segunda fonte para o mesmo dado.

A recusa por raça trazia concordância trocada em texto **autoral**: "Raça" é feminino, e a
mensagem enumerava `branco, afro-americano`. Passou a usar os rótulos que a própria tela
exibe.

### 2.5 O par duplicado, reescrito num ato só (D-18)

| Arquivos | Antes | Depois |
|---|---|---|
| `interface/inicio/tela.tsx` **e** `public/manifest.webmanifest` | `…à Saúde · cálculo 100% no navegador` | `…à Saúde · Cálculo 100% no navegador` |

O subtítulo do hero e a `description` do manifesto eram byte a byte o mesmo literal, e
continuam sendo — asseverado por `par-duplicado.test.ts`. A reescrita é mínima de propósito:
o teto prático do manifesto governa os dois lados, e o campo já estava em 81 caracteres, de
modo que a revisão podia encurtar mas não alongar. O que mudou foi a maiúscula da segunda
unidade, que uniformiza a junção por ponto médio com as demais do produto.

### 2.6 O catálogo (RN-05, fonte única da home e das rotas)

| Arquivo | Antes | Depois |
|---|---|---|
| `interface/inicio/catalogo.ts` | `…trimestre pela DUM ou pelo último ultrassom, pelo Guia Rápido…` | `…trimestre a partir da DUM ou do último ultrassom, pelo Guia Rápido…` |
| `interface/inicio/catalogo.ts` | `…perímetro cefálico, com a classificação nutricional…` | `…perímetro cefálico com a classificação nutricional…` |

Três preposições `pel-` em sequência na primeira; vírgula solta antes de adjunto restritivo
na segunda. Defeitos de coesão, não de conteúdo.

### 2.7 O literal acrescentado (RF-10)

| Arquivo | Literal |
|---|---|
| `models/puericultura/fonte-clinica.ts` | `NOTA_CORRECAO_DE_CONCORDANCIA` — 430 caracteres declarando ao leitor o afastamento autorizado, nomeando as duas formas impressas |

É a única prosa nova da feature, e é a metade sem a qual a correção dos dois rótulos citados
seria violação de RN-09 em vez de cumprimento dela. Renderizada pela proveniência como
parágrafo próprio, lida do domínio pelo mesmo caminho da `NOTA_PROVENIENCIA`, sem segunda
fonte na tela.

### 2.8 A citação: dois afastamentos, e só dois (RF-07)

Fora da classe autoral, mas parte da mesma entrega, e o item que mais precisa aparecer aqui:

| Arquivo | Impresso na Caderneta (p. 90) | Exibido | Ficha |
|---|---|---|---|
| `models/puericultura/fonte-clinica.ts` | `Comprimento adequada para idade` | `Comprimento adequado para idade` | `MD-0015` |
| `models/puericultura/fonte-clinica.ts` | `Baixa comprimento para idade` | `Baixo comprimento para idade` | `MD-0015` |

As outras **106** citações permanecem byte a byte, conferidas contra
`tests/apoio/citacao-linha-de-base.json`, congelado antes da primeira reescrita e jamais
regerado. A comparação acusa exatamente estes dois deltas, ambos de concordância; um terceiro
reprovaria a entrega.

### 2.9 O `README.md`, revisado como prosa contínua (D-10)

Uma alteração: as reticências de `` `Heading`…) `` viraram `, entre outros)`, por §3.3. O
arquivo entra no inventário e responde às regras mecânicas, mas **não** ao congelamento —
são cento e quarenta e seis linhas de documentação que mudam a cada feature, e congelá-las
literal a literal transformaria toda atualização de README em atualização de oráculo.

Duas seções novas foram acrescentadas por T005 e T016 (a norma de redação e o inventário da
superfície textual), e a própria execução mostrou por que a decisão de D-10 era necessária:
essas linhas moveram a contagem do inventário duas vezes, e sob declaração literal a literal
teriam parado o gerador nas duas.

## 3. Os trezentos e dezesseis literais mantidos

Cada um foi lido contra o guia e mantido por uma destas razões, agrupadas porque a
justificativa é a mesma e repeti-la trezentas vezes seria ruído, não rigor:

1. **Já conforme.** A grande maioria. Rótulo de campo, nome acessível, título de seção e
   mensagem que já seguem o molde do guia: sem travessão em excesso, sem sinal expressivo
   vedado, ponto médio bem formado, caixa de frase. Não havia o que corrigir.
2. **Termo clínico consagrado** (`NPH`, `Regular`, `Jejum`, `Diabetes`, `Hipertensão`,
   `Peso (kg)`, `HDL (mg/dL)`). Reescrever mudaria conteúdo, e RN-04 recusa.
3. **Nome próprio de fonte** (`Guia Rápido Diabetes Mellitus — SMS-Rio,`, `TeleCondutas —
   Cardiopatia Isquêmica ·`, `Pooled Cohort Equations (ACC/AHA 2013) ·`). O travessão
   pertence ao nome e não conta para o teto, pela mesma razão que não conta na citação.
4. **Nome acessível fixado por decisão** (`Ativar tema claro`, `Ativar tema escuro`,
   `Início`, `Remover aplicação`). RN-07 os protege: elegância de prosa não é razão para
   tornar vago um rótulo de leitor de tela.
5. **Fragmento de frase montada** (`:`, `.`, `—`, `·`, `%`, `a`, `UI/dia`). São pedaços que
   a interpolação do JSX interrompe, e o sentido está na frase inteira, não neles.
6. **Contrato externo declarado.** `Método não permitido; use GET.` em
   `pages/api/v1/status.ts` é autoral, mas pertence ao contrato de
   `_reversa_sdd/openapi/status.yaml`. Revisá-lo alteraria contrato, o que a feature declarou
   fora de escopo.
7. **Marca fixada pela feature 009.** `APS Inteligente` e `APSi` no manifesto e no hero.
   `manifesto.test.ts` os vigia: alterá-los renomearia o produto na tela inicial de quem
   instalou.

A lista nominal, arquivo a arquivo, vem a seguir. Ela existe para que a omissão apareça como
linha faltante numa lista fechada, e não como ausência que ninguém procura — que é
exatamente a rede que o roadmap §9 pediu contra o risco da frente estreita.

### 3.1 Lista nominal dos mantidos, por arquivo

**`models/cardiopatia-isquemica/fonte-clinica.ts`** — 4 mantido(s):

- `Probabilidade pré-teste baixa (dor não anginosa e sem fatores de risco): exame funcional não indicad…`
- `Probabilidade pré-teste intermediária: indicar exame não invasivo para confirmar ou afastar a suspei…`
- `Exame inicial: ECG de repouso e teste ergométrico.`
- `ECG basal impede a interpretação da ergometria ou o paciente não pode exercitar: preferir método não…`

**`models/gestacao/fonte-clinica.ts`** — 2 mantido(s):

- `Datação a partir da última menstruação: confiável quando o primeiro dia é conhecido e os ciclos eram…`
- `Idade gestacional calculada na data de referência informada; a datação é estimativa e não substitui …`

**`models/gestacao/validacao.ts`** — 7 mantido(s):

- `Data de referência inválida: use o formato AAAA-MM-DD com data de calendário real.`
- `DUM inválida: use o formato AAAA-MM-DD com data de calendário real.`
- `DUM no futuro: a data da última menstruação deve ser até a data de referência.`
- `Datação por ultrassom incompleta: informe a data do exame e a IG do laudo (semanas e dias).`
- `Data do exame inválida: use o formato AAAA-MM-DD com data de calendário real.`
- `Data do exame no futuro: informe um exame já realizado, até a data de referência.`
- `Nenhuma datação informada: informe a DUM ou o ultrassom (data do exame e IG do laudo).`

**`models/insulina/calculadora.ts`** — 3 mantido(s):

- `A conduta exige avaliação clínica individual do prescritor; a calculadora não sugere dose fora da fo…`
- `Considerar compartilhamento de cuidados com especialista focal.`
- `Reavaliar a glicemia e ajustar novamente a cada 3 dias, até alcançar a meta.`

**`models/insulina/fonte-clinica.ts`** — 3 mantido(s):

- `Ao fracionar a NPH, suspender a sulfonilureia.`
- `Esquema com NPH já fracionada: suspender a sulfonilureia.`
- `Uso de sulfonilureia não informado: se estiver em uso, suspender ao fracionar a NPH.`

**`models/insulina/regra-inicio.ts`** — 4 mantido(s):

- `Indicação de insulina presente (HbA1c ≥ 10% ou glicemia de jejum ≥ 300 mg/dL, inclusive ao diagnósti…`
- `Manter a metformina ao iniciar a insulina NPH.`
- `Manter a sulfonilureia ao iniciar a insulina NPH.`
- `Orientar aferição de glicemia capilar em jejum três vezes por semana, com registro, durante 15 dias.`

**`models/insulina/regra-intensificacao.ts`** — 8 mantido(s):

- `café da manhã`
- `Meta de HbA1c atingida sob esquema intensificado: ajustar a Regular da refeição correspondente e ava…`
- `Meta de HbA1c atingida: manter a conduta e repetir HbA1c a cada 6 meses.`
- `HbA1c acima da meta: aferir glicemia capilar antes do almoço (AA), antes do jantar (AJ) e antes de d…`
- `HbA1c não informada: solicitar HbA1c para dirigir a intensificação do esquema (meta ≤ 7,0%).`
- `Repetir HbA1c em 3 meses para reavaliar o esquema intensificado.`
- `Aumentar a NPH antes do café (ajustar 2 UI a cada 3 dias)`
- `Iniciar insulina Regular 4 UI antes do almoço (ajustar 2 UI a cada 3 dias)`

**`models/insulina/regra-titulacao-basal.ts`** — 3 mantido(s):

- `Glicemia em faixa de hipoglicemia (≤ 70 mg/dL) no período: reduzir a insulina basal; jamais aumentar…`
- `Alternativa do guia: ⅔ da dose antes do café e ⅓ antes da ceia`
- `Manter a metformina ao fracionar a NPH.`

**`models/insulina/validacao.ts`** — 3 mantido(s):

- `Informe o esquema de insulina atual para calcular a titulação.`
- `Informe ao menos uma glicemia capilar para calcular a titulação.`
- `Glicemias pré-prandiais dirigem a intensificação, que depende da HbA1c (> 7,0% após 3 meses): inform…`

**`models/puericultura/elegibilidade.ts`** — 1 mantido(s):

- `O gráfico de perímetro cefálico da Caderneta da Criança cobre de 0 a 2 anos. Acima dessa idade a fon…`

**`models/puericultura/medidas.ts`** — 2 mantido(s):

- `aferida deitada em criança de 2 anos ou mais`
- `aferida em pé em criança menor de 2 anos`

**`models/puericultura/validacao.ts`** — 9 mantido(s):

- `Peso`
- `Comprimento/estatura`
- `Perímetro cefálico`
- `Informe ao menos uma medida: peso, comprimento/estatura ou perímetro cefálico.`
- `Informe se a medida foi aferida deitada (comprimento) ou em pé (estatura): a conversão de 0,7 cm dep…`
- `Data de nascimento inválida: informe uma data real no formato AAAA-MM-DD.`
- `Data da medição inválida: informe uma data real no formato AAAA-MM-DD.`
- `Data de nascimento posterior à data da medição: verifique as duas datas.`
- `Sexo inválido: informe masculino ou feminino. As curvas de referência são específicas por sexo.`

**`models/risco-cardiovascular/elegibilidade.ts`** — 1 mantido(s):

- `Doença cardiovascular prévia (prevenção secundária): as Pooled Cohort Equations estimam risco apenas…`

**`models/risco-cardiovascular/fonte-clinica.ts`** — 1 mantido(s):

- `As Pooled Cohort Equations foram derivadas de coortes dos Estados Unidos (ARIC, CHS, CARDIA, Framing…`

**`models/risco-cardiovascular/validacao.ts`** — 3 mantido(s):

- `Colesterol total inválido: informe um valor positivo em mg/dL.`
- `HDL inválido: informe um valor positivo em mg/dL.`
- `Pressão arterial sistólica inválida: informe um valor positivo em mmHg.`

**`interface/calculadora/antidiabeticos-orais.tsx`** — 5 mantido(s):

- `Dose de metformina inválida: use apenas números.`
- `TFG inválida: use apenas números.`
- `Antidiabéticos orais e função renal`
- `Dose atual de metformina (mg/dia) — opcional`
- `TFG (mL/min/1,73 m²) — opcional`

**`interface/calculadora/esquema-atual.tsx`** — 12 mantido(s):

- `Antes do café`
- `Antes do almoço`
- `Antes do jantar`
- `Ao deitar`
- `Esquema atual de insulina`
- `Insulina`
- `NPH`
- `Regular`
- `Momento da aplicação`
- `Dose (UI)`
- `Remover aplicação`
- `Adicionar aplicação`

**`interface/calculadora/formatar-plano.ts`** — 4 mantido(s):

- `Plano elaborado com apoio de ferramenta de decisão clínica; a prescrição é responsabilidade do médic…`
- `A dose exata é fixada pelo prescritor.`
- `Recomendações ao prescritor:`
- `Fonte clínica:`

**`interface/calculadora/formulario.tsx`** — 13 mantido(s):

- `Informe ao menos uma glicemia capilar para a titulação.`
- `Informe o esquema de insulina atual.`
- `Modo de cálculo`
- `Início de insulinização`
- `Titulação de dose`
- `Dados do paciente`
- `Peso (kg)`
- `HbA1c (%) — opcional`
- `Uso de sulfonilureia`
- `Não informado`
- `Sim`
- `Não`
- `Calcular`

**`interface/calculadora/glicemias-por-momento.tsx`** — 7 mantido(s):

- `Jejum`
- `Antes do almoço (AA)`
- `Antes do jantar (AJ)`
- `Ao deitar (AD)`
- `Glicemias capilares por momento`
- `Registre uma ou mais aferições por campo, separadas por espaço (ex.: 98,5 130 210). Deixe em branco …`
- `(mg/dL)`

**`interface/calculadora/resultado.tsx`** — 30 mantido(s):

- `Copiar plano`
- `Não foi possível copiar. Transcreva o plano manualmente a partir desta tela.`
- `—`
- `UI`
- `Recomendações ao prescritor`
- `Fonte clínica`
- `Guia Rápido Diabetes Mellitus — SMS-Rio,`
- `:`
- `Insulina`
- `a`
- `UI/dia`
- `Equivalente por peso (0,1 a 0,2 UI/kg/dia):`
- `O guia informa a faixa; a dose exata é fixada pelo prescritor.`
- `Conduta:`
- `Dose total:`
- `Na meta (71–129 mg/dL)`
- `Resultado do cálculo`
- `Resultado`
- `Preencha os dados do paciente e acione Calcular.`
- `Não foi possível calcular.`
- `Ocorreu uma falha inesperada.`
- `Não prescreva`
- `a partir desta tela: recarregue a página e, se persistir, faça o cálculo manualmente pela fonte clín…`
- `Cenário fora do escopo da fonte clínica:`
- `.`
- `Revisei a dose e a fonte`
- `Pronto para prescrever`
- `Transcreva o esquema ao prontuário/receituário. Nada é salvo nem enviado por esta página.`
- `Ferramenta de apoio à decisão: não substitui o julgamento do médico, que permanece responsável pela …`
- `Novo cálculo`

**`interface/calculadora/rotulos.ts`** — 5 mantido(s):

- `antes do café`
- `antes do almoço`
- `antes do jantar`
- `ao deitar`
- `Manter a dose`

**`interface/calculadora/tela.tsx`** — 1 mantido(s):

- `APS Inteligente · Fonte única: Guia Rápido Diabetes Mellitus — SMS-Rio, 2.ª ed. atualizada, 2023`

**`interface/calculadora/validacao-campos.ts`** — 4 mantido(s):

- `Informe o peso do paciente.`
- `Peso inválido: use apenas números (vírgula ou ponto).`
- `HbA1c inválida: use apenas números.`
- `Informe a dose da aplicação.`

**`interface/cardiologia/formulario.tsx`** — 15 mantido(s):

- `Diabetes`
- `Tabagismo`
- `Hipertensão`
- `Dislipidemia`
- `Paciente`
- `Idade (anos)`
- `Sexo`
- `Masculino`
- `Feminino`
- `Características da dor (Quadro 1)`
- `Fatores de risco`
- `Sinais clínicos adicionais`
- `ECG basal altera a interpretação da ergometria ou o paciente não pode exercitar-se`
- `Sinais de angina instável ou dor aguda (repouso, início recente, em crescendo)`
- `Avaliar`

**`interface/cardiologia/referencias.tsx`** — 6 mantido(s):

- `Classificação funcional da angina estável (CCS)`
- `Tratamento farmacológico e Tabela 1 de medicamentos`
- `Acompanhamento na APS`
- `Manejo da doença arterial coronariana aguda e encaminhamento`
- `Material de referência`
- `Conteúdo consultável do TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017), fora do cál…`

**`interface/cardiologia/resultado.tsx`** — 17 mantido(s):

- `Probabilidade pré-teste (base):`
- `%`
- `Ajustada por fatores de risco:`
- `% a`
- `(pode ultrapassar 90%)`
- `Resultado`
- `Informe idade, sexo, as características da dor e os fatores de risco, e avalie.`
- `Falha inesperada na calculadora. Não use os valores desta tela; recarregue a página e refaça a avali…`
- `Nova avaliação`
- `Fora do escopo da fonte`
- `Fonte clínica`
- `TeleCondutas — Cardiopatia Isquêmica ·`
- `Entrada incompleta ou implausível`
- `Resultado desatualizado: os dados foram editados após a avaliação. Avalie novamente.`
- `Estrato de probabilidade:`
- `Conduta`
- `Investigar causas não cardíacas:`

**`interface/cardiologia/tela.tsx`** — 1 mantido(s):

- `APS Inteligente · Fonte única: TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017)`

**`interface/comum/moldura.tsx`** — 4 mantido(s):

- `Nada é salvo nem enviado`
- `Início`
- `Ativar tema claro`
- `Ativar tema escuro`

**`interface/gestacao/formulario.tsx`** — 7 mantido(s):

- `Datação pela menstruação`
- `Data da última menstruação (DUM)`
- `Datação pelo último ultrassom`
- `Data do exame`
- `Semanas no exame`
- `Dias no exame`
- `Calcular`

**`interface/gestacao/resultado.tsx`** — 19 mantido(s):

- `Idade gestacional:`
- `—`
- `.º trimestre`
- `Data provável do parto:`
- `DUM equivalente:`
- `Resultado`
- `Informe a DUM, o último ultrassom, ou ambos, e calcule.`
- `Falha inesperada na calculadora. Não use os valores desta tela; recarregue a página e refaça o cálcu…`
- `Novo cálculo`
- `Entrada incompleta ou implausível`
- `Resultado desatualizado: os dados foram editados após o cálculo. Calcule novamente.`
- `Idade gestacional`
- `Calculada na data de referência`
- `.`
- `Pela DUM`
- `Pelo ultrassom`
- `Fonte clínica`
- `Guia Rápido Pré-Natal — SMS-Rio,`
- `·`

**`interface/gestacao/tela.tsx`** — 1 mantido(s):

- `APS Inteligente · Fonte única: Guia Rápido Pré-Natal — SMS-Rio, 4.ª ed., 2025`

**`interface/inicio/catalogo.ts`** — 10 mantido(s):

- `Diabetes Mellitus tipo 2`
- `Calculadora de insulina`
- `Início de insulinização, titulação da NPH e intensificação com Regular, pelo Guia Rápido Diabetes Me…`
- `Pré-natal`
- `Cardiologia`
- `Calculadora de probabilidade pré-teste de cardiopatia isquêmica`
- `Classificação da dor torácica, probabilidade pré-teste de doença arterial coronariana e conduta de i…`
- `Calculadora de risco cardiovascular em 10 anos`
- `Risco de doença cardiovascular aterosclerótica (ASCVD) em 10 anos pelas Pooled Cohort Equations (ACC…`
- `Puericultura`

**`interface/inicio/tela.tsx`** — 1 mantido(s):

- `APS Inteligente`

**`interface/puericultura/formulario.tsx`** — 20 mantido(s):

- `Criança`
- `Sexo`
- `Masculino`
- `Feminino`
- `Data de nascimento`
- `Data da medição`
- `Medidas`
- `Informe ao menos uma medida. A que faltar apenas suprime o índice que depende dela.`
- `Peso (kg)`
- `Comprimento/estatura (cm)`
- `Posição da medição`
- `Deitado (comprimento)`
- `Em pé (estatura)`
- `Perímetro cefálico (cm)`
- `Perímetro cefálico`
- `Idade gestacional ao nascer (opcional)`
- `Em branco, a criança é tratada como nascida a termo e nenhuma correção de idade é aplicada.`
- `Semanas completas`
- `Dias`
- `Avaliar crescimento`

**`interface/puericultura/proveniencia.tsx`** — 5 mantido(s):

- `Proveniência e limites desta avaliação`
- `Cobertura da fonte:`
- `. Fora dessa faixa, a ferramenta recusa o cálculo em vez de extrapolar.`
- `Fonte:`
- `.`

**`interface/puericultura/resultado.tsx`** — 22 mantido(s):

- `Peso para a idade`
- `Comprimento/estatura para a idade`
- `IMC para a idade`
- `Perímetro cefálico para a idade`
- `Medida não informada.`
- `As curvas de pré-termo (INTERGROWTH-21st) não publicam IMC: o índice não existe nesta faixa, e a sua…`
- `idade cronológica`
- `idade corrigida`
- `idade pós-menstrual`
- `Escore z:`
- `·`
- `Padrão:`
- `Não calculado.`
- `Resultado`
- `Informe o sexo, as duas datas e ao menos uma medida para avaliar o crescimento pelos gráficos da Cad…`
- `Falha inesperada na calculadora. Não use os valores desta tela; recarregue a página e refaça a avali…`
- `Nova avaliação`
- `Fora do escopo da fonte`
- `Fonte clínica`
- `Entrada incompleta ou implausível`
- `Resultado desatualizado: os dados foram editados após a avaliação. Avalie novamente.`
- `Índices antropométricos`

**`interface/puericultura/tela.tsx`** — 1 mantido(s):

- `APS Inteligente · Fonte única: Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020), pp. 85–97`

**`interface/risco-cardiovascular/formulario.tsx`** — 20 mantido(s):

- `Branca`
- `Preta / afro-americana`
- `Outra`
- `Paciente`
- `Sexo`
- `Masculino`
- `Feminino`
- `Raça / cor`
- `Idade (anos)`
- `Exames e pressão`
- `Colesterol total (mg/dL)`
- `HDL (mg/dL)`
- `Pressão arterial sistólica (mmHg)`
- `Em tratamento anti-hipertensivo`
- `Fatores de risco`
- `Diabetes`
- `Tabagismo atual`
- `Histórico cardiovascular`
- `Doença cardiovascular já estabelecida (infarto, AVC, revascularização)`
- `Estimar risco`

**`interface/risco-cardiovascular/proveniencia.tsx`** — 4 mantido(s):

- `Por que Pooled Cohort Equations, e não a AHA PREVENT?`
- `A AHA PREVENT (2023) é uma calculadora mais recente — sexo-específica e sem variável de raça, deriva…`
- `Esta ferramenta usa, ainda assim, as Pooled Cohort Equations porque a recomendação de estatina em pr…`
- `Calculadora AHA PREVENT (site oficial, em inglês):`

**`interface/risco-cardiovascular/resultado.tsx`** — 12 mantido(s):

- `Resultado`
- `Informe sexo, raça, idade, os exames e os fatores de risco, e estime o risco cardiovascular em 10 an…`
- `Falha inesperada na calculadora. Não use os valores desta tela; recarregue a página e refaça a estim…`
- `Nova estimativa`
- `Fora do escopo da fonte`
- `Fonte clínica`
- `Pooled Cohort Equations (ACC/AHA 2013) ·`
- `Entrada incompleta ou implausível`
- `Resultado desatualizado: os dados foram editados após a estimativa. Estime novamente.`
- `Risco de ASCVD em 10 anos:`
- `%`
- `Categoria de risco:`

**`interface/risco-cardiovascular/tela.tsx`** — 1 mantido(s):

- `APS Inteligente · Fonte única: 2013 ACC/AHA Guideline — Pooled Cohort Equations (Goff et al., 2014)`

**`pages/api/v1/status.ts`** — 1 mantido(s):

- `Método não permitido; use GET.`

**`pages/cardiologia/dor-toracica.tsx`** — 1 mantido(s):

- `Classificação da dor torácica, probabilidade pré-teste de doença arterial coronariana e conduta de i…`

**`pages/cardiologia/risco-cardiovascular.tsx`** — 1 mantido(s):

- `Estimativa do risco de doença cardiovascular aterosclerótica (ASCVD) em 10 anos pelas Pooled Cohort …`

**`pages/dm2/insulina.tsx`** — 1 mantido(s):

- `Apoio à decisão para insulinização no DM2 pelo Guia Rápido Diabetes Mellitus (SMS-Rio, 2.ª ed. 2023)…`

**`pages/pre-natal/idade-gestacional.tsx`** — 1 mantido(s):

- `Idade gestacional, data provável do parto e trimestre pela DUM ou pelo último ultrassom, pelo Guia R…`

**`pages/puericultura/crescimento.tsx`** — 1 mantido(s):

- `Escores z de peso, comprimento/estatura, IMC e perímetro cefálico com a classificação da Caderneta d…`

**`public/manifest.webmanifest`** — 2 mantido(s):

- `APS Inteligente`
- `APSi`

## 4. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-27 | Versão inicial, escrita por `/reversa-coding` na ação T050 | reversa |
