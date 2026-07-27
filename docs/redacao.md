# Norma de redação do produto

> Materialização operacional do **princípio IX** de `.reversa/principles.md`, que lhe dá a
> razão de ser e para o qual este guia remete de volta.
> Criado pela feature `018-revisao-linguagem-textos` (RF-01).

## 1. Para que este guia existe, e o que ele não é

A prosa desta plataforma nasceu tela a tela. Cada feature trouxe seus títulos, suas
descrições e suas mensagens conforme quem as escreveu naquele dia, e nada impedia que a
calculadora seguinte trouxesse outra voz. Este guia fixa a voz única, e a fixa em regras:
o que aqui está ou é verificável por teste, ou vem com um par "antes/depois" tirado do
próprio produto.

Ele não é um tratado de estilo nem um manual de gosto. Quem procura a doutrina completa da
pontuação a encontra nas preferências globais do mantenedor; o que este arquivo faz é
reduzi-la ao que se aplica a um produto clínico consultado à beira do leito, e ao que se
pode conferir sem discutir.

Duas leituras bastam. Quem vai escrever uma tela nova lê as seções 2 a 6 antes de nomear a
primeira coisa. Quem vai revisar texto existente lê tudo, inclusive a seção 7, que separa o
que a suíte prova do que só o julgamento resolve.

## 2. As três classes de texto

Todo literal que o produto exibe pertence a **exatamente uma** de três classes. A classe
vem da **origem** do texto, jamais do diretório onde ele mora: mensagens de validação em
`models/` são autorais, e rótulos em `interface/` podem ser citação. Classificar por pasta
erraria nas duas direções, e erraria em silêncio.

A classe não se infere: declara-se em `scripts/textos/classes/`. Literal novo sem entrada
faz o gerador do inventário parar, nomeando arquivo e linha. É falha ruidosa por desenho —
literal sem classe é decisão adiada, não acidente.

### 2.1 Autoral

Texto escrito pelo produto: títulos, subtítulos, descrições, mensagens de validação,
condutas redigidas por nós, avisos, nomes acessíveis, prosa de proveniência. **É a classe
que esta norma alcança por inteiro**, e a única que a revisão de estilo reescreve.

### 2.2 Citação

Texto transcrito de fonte clínica: rótulo de classificação, conduta reproduzida do guia,
localização bibliográfica. A citação **permanece byte a byte**, e permanece porque o
prescritor confere a tela contra a página impressa que tem na mão. Elegância não é razão
para afastar os dois.

Isso vale inclusive quando a fonte escreve mal. "Peso elevado para idade", sem o artigo, é
registro telegráfico de tabela e fica como está; "PC acima do esperado para a idade", com o
artigo, também fica, ainda que destoe dos vinte e quatro vizinhos. Uniformizar o conjunto
seria reescrever a fonte.

**A exceção é uma só, e é estreita nos três sentidos.** Onde a fonte impressa contraria a
**concordância**, o produto escreve a forma correta e **declara o afastamento ao leitor**,
na proveniência do domínio. A exceção alcança apenas desvio de concordância, jamais léxico,
terminologia, ordem, número, unidade ou sentido; vale sobre lista fechada e enumerada, não
como licença geral; e é **inseparável da declaração**, de modo que corrigir sem informar
viola a regra em vez de cumpri-la pela metade. A razão é clínica antes de ser gramatical:
corrigir em silêncio troca um desvio de português por um desvio de transparência, e este é
o pior dos dois numa ferramenta que se confere contra o impresso.

| Antes (impresso na Caderneta, p. 90) | Depois | Por quê |
|---|---|---|
| `Comprimento adequada para idade` | `Comprimento adequado para idade` | concordância de gênero: "comprimento" é masculino |
| `Baixa comprimento para idade` | `Baixo comprimento para idade` | mesma raiz |
| `Muito baixo comprimento para idade` | *(intocado)* | já concorda; não há o que corrigir |
| `Peso adequado para idade` | *(intocado)* | elipse de artigo não é concordância |

A lista fechada dos casos autorizados vive em `_reversa_forward/018-revisao-linguagem-textos/requirements.md`
§2.4, e a permanência do resto é verificada contra `tests/apoio/citacao-linha-de-base.json`,
que jamais se regera. Qualquer terceiro desvio reprova a entrega.

### 2.3 Identificador

Chave, `id`, nome de campo, código de erro, valor de `data-*`, discriminante de tipo.
`MEDIDA_NAO_INFORMADA` e `peso-idade` são identificadores, ainda que morem num campo de
texto. Estão **fora** do alcance desta norma, e mudá-los é refatoração, não revisão.

## 3. Pontuação

### 3.1 Os três eixos

A pontuação se distribui por três eixos funcionais, classificados pela operação que
executam e não pelo glifo:

- **Sintático** — estrutura o período: ponto, vírgula, ponto e vírgula, dois-pontos.
- **Expressivo** — marca subjetividade: travessão, reticências, parênteses quando comentam.
- **Modal** — fixa o ato de fala: o ponto assere, a interrogação pergunta, a exclamação
  exclama.

Um mesmo sinal ocupa mais de um eixo conforme o uso. O ponto é sintático e modal; o
parêntese é expressivo quando comenta e sintático quando explica sigla, e é por isso que
`doença arterial coronariana (DAC)` não conta como sinal expressivo em lugar nenhum deste
guia. O hífen fica fora do sistema: é sinal ortográfico, e não se confunde com o travessão.

**A regra que atravessa os três eixos:** o sintático é livre, o expressivo é racionado, o
modal é assertivo. Prosa de produto clínico assere; ela não interpela o leitor nem se
espanta com ele.

Uma ressalva, e ela vem do próprio produto. A interrogação é admitida quando **nomeia a
pergunta que a seção responde** — `Por que Pooled Cohort Equations, e não a AHA PREVENT?`,
título do bloco de proveniência do risco cardiovascular, é o exemplo vivo. Ali a pergunta é
o assunto, não a interpelação: quem lê já a tinha, e o título a reconhece antes de
respondê-la. O que fica vedado é a interrogação que cobra do leitor uma reação — "Já
conferiu a dose?" —, e a exclamação em qualquer posição.

### 3.2 O travessão: no máximo um par por bloco

O travessão é `—` (travessão), jamais `-` (hífen) nem `--` (dois hifens). E **cada bloco de
texto autoral admite no máximo um par de travessões**. O segundo par não intensifica: ele
dilui o primeiro, e converte o aparte em maneirismo.

"Bloco" é a unidade que o inventário registra: um literal, um parágrafo, um campo de
metadado. Dois literais vizinhos não somam.

Antes, na nota de proveniência da puericultura, com dois pares no mesmo bloco:

> A Caderneta da Criança avalia o crescimento pela tendência de medidas sucessivas **—**
> vários pontos unidos formam a linha que mostra como a criança evolui **—**, e um ponto
> único não substitui essa leitura. […] A tabela é lida na linha publicada **—** por dia até
> os 5 anos e por mês completo depois **—**, sem interpolação.

Depois, com o segundo aparte convertido em oração e o primeiro preservado, que é o que de
fato comenta:

> A Caderneta da Criança avalia o crescimento pela tendência de medidas sucessivas **—**
> vários pontos unidos formam a linha que mostra como a criança evolui **—**, e um ponto
> único não substitui essa leitura. […] A tabela é lida na linha publicada, por dia até os
> 5 anos e por mês completo depois, sem interpolação.

Nada do conteúdo se moveu: as afirmações sobre curvas, faixas e ausência de interpolação
continuam inteiras. Foi a moldura que mudou, e é só a moldura que esta norma governa.

**O travessão que pertence a nome próprio não conta.** `TeleCondutas — Cardiopatia
Isquêmica` é como a fonte se chama, e o teto de RN-03 não o alcança, pela mesma razão que
não alcança a citação.

### 3.3 Reticências e exclamação ficam fora

Nenhuma reticência e nenhuma exclamação em prosa de produto. A reticência sugere o que não
se quis dizer, e um apoio à decisão clínica não tem o direito de sugerir; a exclamação pede
uma reação que a tela não deve pedir. Onde faltar ênfase, a solução é a ordem da frase, não
o sinal.

Isto não alcança a citação: se a fonte imprimir reticências, elas ficam.

### 3.4 O ponto médio não é pontuação

O `·` é recurso **tipográfico** de separação, não sinal de pontuação: não responde aos três
eixos e não entra no teto de travessões. Ele separa unidades de informação de **mesma
hierarquia** — o nome e a marca no `<title>`, a fonte e a localização na proveniência, o
nome e a qualificação num subtítulo.

Forma fixa, e só ela é verificável:

- sempre ladeado por **espaço simples** dos dois lados;
- **nunca acumulado** com vírgula ou travessão na mesma junção;
- **jamais** em início ou fim de linha.

O ponto médio que hoje existe **permanece**. A regra não manda tirar nem pôr: manda que,
onde ele estiver, esteja assim.

## 4. Números, unidades e siglas

A norma aqui **codifica o uso corrente** em vez de inventar padrão novo. O que segue já é o
que a plataforma faz na maioria dos lugares; o que a revisão corrige são os desvios
pontuais.

| Caso | Forma | Exemplo do produto |
|---|---|---|
| Decimal | vírgula, nunca ponto | `0,7 cm` |
| Unidade | espaço simples antes | `70 mg/dL`, `120 mmHg`, `82,0 cm` |
| Percentual | sem espaço | `HbA1c > 7,0%` |
| Intervalo | meia-risca sem espaços | `pp. 85–97`, `0–2 anos` |
| Símbolo matemático | admitido em prosa | `> +2`, `≥ −2`, `< 28 semanas` |
| Sigla | expandida na primeira aparição da tela, com a sigla entre parênteses | `doença cardiovascular aterosclerótica (ASCVD)` |
| Sigla consagrada no domínio | dispensa expansão | `IMC`, `DUM`, `IG`, `APS` |
| Ordinal de edição | forma abreviada com ponto | `2.ª ed.` |

Duas observações que evitam retrabalho. A meia-risca `–` do intervalo **não é** o travessão
`—` nem o hífen `-`, e trocá-los é erro de grafia, não de estilo. E número clínico não se
escreve à mão numa tela: a interface importa a constante do domínio, por regra que precede
esta norma; literal com valor clínico dentro já é defeito antes de ser questão de redação.

## 5. Mensagens de validação

O produto já tem um molde, e a varredura o demonstra. A norma o declara em vez de o
substituir.

**Valor presente e inválido pede diagnóstico seguido de instrução**, separados por
dois-pontos:

> `Glicemia fora da faixa plausível: informe um valor entre 20 e 600 mg/dL.`

**Valor ausente pede instrução direta**, sem diagnóstico, porque não há o que diagnosticar:

> `Informe ao menos uma glicemia capilar para calcular a titulação.`

Ambos terminam em ponto. Ambos tratam o leitor por imperativo — `informe`, `verifique`,
`use` —, que é a forma mais curta de dizer o que fazer a seguir.

### 5.1 O complemento é facultativo, e a referência à fonte é vedada

A mesma recusa hoje existe em três redações entre os domínios, e a norma escolhe uma:

| Hoje | Estado |
|---|---|
| `Sexo inválido: informe masculino ou feminino.` | **forma canônica** |
| `Sexo inválido: informe masculino ou feminino. As curvas de referência são específicas por sexo.` | admitida: o complemento explica por que o campo não se deduz |
| `Sexo inválido: informe masculino ou feminino (eixo do Quadro 2).` | **corrigida**: a localização sai da mensagem |

A regra que essas três linhas realizam:

1. **O núcleo é obrigatório** — diagnóstico e instrução, ou instrução só, conforme o molde
   acima.
2. **O complemento é facultativo, e admite-se no máximo um.** Ele entra quando responde
   "por que o sistema não pode seguir sem isto?" de um modo que a instrução não responde
   sozinha. "As curvas de referência são específicas por sexo" passa nesse teste; repetir a
   faixa que a instrução já deu, não.
3. **A referência à fonte é vedada na mensagem de validação.** Toda saída do domínio já
   carrega a sua `ReferenciaClinica`, e reescrever a localização dentro do texto criaria
   segunda fonte para o mesmo dado — exatamente o que a disciplina de fonte única existe
   para impedir. A localização pertence à referência, não à recusa.

A recusa **clínica**, que não é validação de campo, segue outra lógica e pode nomear a
fronteira da fonte, porque a fronteira é o conteúdo da recusa: `O Guia Rápido DM (SMS-Rio,
2023) não titula a insulina "Lantus" no DM2: o catálogo coberto é NPH e Regular (p. 59).`
Ali a localização é o que se está afirmando, e não um carimbo anexo.

## 6. Títulos, descrições e metadados

### 6.1 O `<title>` tem duas unidades e um separador

Forma fixa: **`<nome da tela> · APS Inteligente`**. Duas unidades de mesma hierarquia, um
ponto médio entre elas, nada mais.

Hoje convivem três padrões, e é desvio de forma:

| Antes | Depois |
|---|---|
| `APS Inteligente — Calculadoras clínicas para a APS` | `APS Inteligente · Calculadoras clínicas para a APS` |
| `Calculadora de Insulina — DM2 · APS Inteligente` | `Calculadora de insulina no DM2 · APS Inteligente` |
| `Calculadora de Idade Gestacional · APS Inteligente` | `Calculadora de idade gestacional · APS Inteligente` |

A qualificação que antes pedia um segundo separador passa a caber na própria frase, por
preposição. Acumular `—` e `·` na mesma linha é o defeito que esta regra elimina: o
travessão ali não comentava nada, apenas separava, e separar é ofício do ponto médio.

### 6.2 Caixa de frase, e não caixa de título

Título de tela se escreve em **caixa de frase**: maiúscula só na inicial e nos nomes
próprios, siglas e marcas. `Calculadora de insulina`, não `Calculadora de Insulina`;
`Avaliação do crescimento infantil`, não `Avaliação do Crescimento Infantil`.

A razão não é estética. O catálogo da home já escreve em caixa de frase, e é ele a fonte
única dos nomes das calculadoras; o `<title>` que escreve diferente diverge da fonte pela
capitalização. Uniformizar aproxima os dois lados sem tocar em conteúdo.

Nomes próprios permanecem: `Pooled Cohort Equations`, `Caderneta da Criança`, `Guia Rápido
Pré-Natal`, `TeleCondutas — Cardiopatia Isquêmica`.

### 6.3 A descrição descreve o que existe

A `description` que enumera o que a plataforma cobre **nomeia todas as seções vigentes**.
Enumeração desatualizada é defeito de exatidão, não questão de estilo — e é o defeito que
esta feature encontrou:

> **Antes:** Calculadoras clínicas para a Atenção Primária à Saúde, por seção: Diabetes
> Mellitus tipo 2 e Pré-natal.
>
> **Depois:** Calculadoras clínicas para a Atenção Primária à Saúde, por seção: Diabetes
> Mellitus tipo 2, Pré-natal, Cardiologia e Puericultura.

Onde o teto de comprimento impede a enumeração — é o caso do manifesto do aplicativo
instalável, truncado na tela de instalação —, a descrição **não enumera subconjunto
próprio**: ou nomeia todas, ou não nomeia nenhuma. Descrever a plataforma pela metade é
pior que não a descrever por seções.

Toda `description` de rota termina afirmando a privacidade do cálculo. A redação é livre e
esta norma pode reescrevê-la; **a afirmação não pode desaparecer**.

## 7. O que a suíte prova, e o que ela não prova

Este guia mistura duas naturezas de regra, e confundi-las produziria o pior dos dois
mundos: alguém tomaria "a suíte passou" por "o texto está bom".

**Verificado por teste** — falha o gate, com mensagem que aponta a regra violada:

| Regra | Seção | Verificador |
|---|---|---|
| Travessão `—`, nunca `-` nem `--` | 3.2 | `tests/unit/textos/norma.test.ts` |
| No máximo um par de travessões por bloco | 3.2 | idem |
| Sem reticências e sem exclamação | 3.3 | idem |
| Ponto médio ladeado por espaço simples, não acumulado | 3.4 | idem |
| Citação preservada byte a byte, salvo a lista fechada | 2.2 | `tests/unit/textos/citacao.test.ts` |
| Literal autoral revisado não muda em silêncio | — | `tests/unit/textos/congelamento.test.ts` |
| A descrição da home nomeia todas as seções | 6.3 | `tests/unit/textos/descricao-plataforma.test.ts` |
| A do manifesto não enumera subconjunto próprio | 6.3 | idem |
| A cláusula de privacidade sobrevive à reescrita | 6.3 | `tests/unit/textos/privacidade.test.ts` |
| Marca e nome curto do manifesto intactos | — | `tests/unit/textos/manifesto.test.ts` |
| Subtítulo da home e descrição do manifesto idênticos | — | `tests/unit/textos/par-duplicado.test.ts` |

**Não verificado, e é julgamento de quem escreve:**

- coesão entre períodos, e a preferência por conectivo em vez de justaposição;
- progressão econômica: cada período avança o raciocínio, sem redundância nem ornamento;
- adequação do complemento facultativo de 5.1, que só o sentido decide;
- se o texto revisado ainda diz a mesma coisa clínica que dizia — que é a única regra deste
  guia cuja violação não é questão de forma, e cuja guarda é a leitura humana do par
  antes/depois, mais os oráculos do domínio.

A norma diz qual é qual justamente para que a segunda lista não se disfarce de primeira.

## 8. Quando esta norma muda

Ela muda por decisão registrada, como qualquer outra fonte de verdade deste projeto: ficha
em `.harness/decisoes/`, e o princípio IX revisado se o que mudar for o princípio e não a
regra. Alterar o guia sem alterar o verificador correspondente deixa a norma mentindo, o
que é pior do que não a ter escrito.

