# Requirements: Revisão da linguagem dos textos da plataforma

> Identificador: `018-revisao-linguagem-textos`
> Data: `2026-07-26`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A prosa da plataforma nasceu feature a feature, sem norma declarada: cada tela trouxe seus títulos, descrições e mensagens conforme o autor do momento, e nada impede que a próxima calculadora traga outros. Esta feature entrega duas coisas indissociáveis. Primeiro, a **norma de redação do produto**, derivada das preferências de escrita do mantenedor e materializada como artefato consultável no repositório, com regras verificáveis em vez de conselhos. Segundo, a **revisão da prosa já publicada** contra essa norma, tela por tela, incluindo os metadados que saem para fora do navegador.

O beneficiário direto é quem lê: o prescritor na consulta, que encontra um texto uniforme em vez de cinco vozes. O beneficiário durável é o mantenedor, porque a norma escrita e verificada por teste substitui a lembrança de como se escrevia aqui.

A feature separa, e é o seu ponto mais delicado, o **texto autoral** do **texto citado da fonte clínica**. Rótulos transcritos de guia impresso não são prosa do produto: são citação, e permanecem como estão. A exceção é uma só, arbitrada em 27/07 e estreita por construção: onde a fonte contraria a **concordância**, o produto escreve a forma correta e **declara o afastamento na proveniência**, para que o prescritor que confere contra a página impressa saiba de onde vem a diferença. São dois rótulos em vinte e cinco, enumerados em §2.4, e a exceção não se estende a mais nada da citação.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#1-estilo-arquitetural` | Quatro domínios clínicos sob casca comum, cada um com **fonte clínica única**; mescla de fontes proibida (ADR 0001/0011). O texto que cita a fonte herda essa disciplina. | 🟢 |
| `_reversa_sdd/architecture.md#5-qualidade-e-testes` | Pirâmide realizada, com integração nas telas e ponta a ponta com baseline de acessibilidade automatizada por rota. É o aparato que a revisão de texto vai atravessar. Duas cifras daquela seção não valem mais e não devem ser transcritas: os **37 arquivos de teste** são a contagem da re-extração nº 3, anterior à feature 017, e o repositório traz hoje 52; o **"0/0 por rota"** não corresponde a `e2e/axe-baseline.json`, que tolera uma violação em `telaInicial` e uma em `telaComResultado`. Correção do artefato: re-extração nº 4 (L-11). | 🟡 |
| `_reversa_sdd/domain.md#7-invariantes-transversais` | Invariante 3: toda saída carrega `ReferenciaClinica`. Invariante 5: constantes clínicas congeladas por `Object.freeze` em `fonte-clinica.ts`, como fonte única anti-drift. Os rótulos clínicos vivem sob essa mesma disciplina. | 🟢 |
| `_reversa_sdd/domain.md#7.1-regras-da-interface-com-forca-de-dominio` | Regra 9: a interface espelha as faixas do domínio importando as constantes, sem segunda fonte. Vale para número e vale para rótulo. | 🟢 |
| `_reversa_sdd/domain.md#7.2-regras-da-interface-com-forca-de-navegacao` | Nomes acessíveis do cabeçalho fixados por decisão ("Ativar tema claro/escuro"). Descreve `logoComoTitulo`, prop já removida pelo adendo 016: leia-se `comInicio`. | 🟡 |
| `_reversa_sdd/addenda/017-puericultura-crescimento.md` | Adendo vigente. O quinto domínio inaugurou a recusa **parcial** e trouxe rótulos transcritos literalmente da caderneta impressa, inclusive com concordância destoante da norma. | 🟢 |
| `_reversa_sdd/code-analysis.md`, "Módulo 10 — `interface/inicio`" | `catalogo.ts` é a fonte única das seções e rotas da home (D-07, anti-drift); título e descrição de cada calculadora nascem ali e a home apenas os renderiza. | 🟢 |
| `_reversa_sdd/code-analysis.md`, "Módulo 6 — `interface/calculadora`" | `rotulos.ts` é fonte única de texto compartilhada entre o painel de resultado e o plano copiável (feature 006, RN-03), para que tela e prontuário digam a mesma coisa. | 🟢 |
| `.reversa/principles.md#i-invariante-mae` | A spec é a fonte de verdade; o código é projeção dela. Revisar texto no código sem reconciliar a spec quebra o invariante. | 🟢 |
| `~/.claude/CLAUDE.md#estilo-de-escrita` | Norma de origem: coesão parafrástica, progressão econômica, correção como silêncio; pontuação em três eixos (sintático, expressivo, modal), com parcimônia nos sinais expressivos e o travessão acima de todos. | 🟢 |

### 2.1 Inventário preliminar da superfície textual

Varredura heurística de literais com três ou mais palavras em `interface/`, `pages/` e `models/`, excluídos comentários, testes e as tabelas antropométricas da Organização Mundial da Saúde (OMS). Contagem aproximada, a ser substituída pelo inventário exato de RF-02.

| Camada | Literais de prosa | Observação |
|---|---|---|
| `models/**` | ~179 | Mistura as duas naturezas: mensagens de validação são autorais, rótulos e localizações de referência são citação. | 🟢 |
| `interface/**` | ~90 | Predominantemente autoral: catálogo da home, blocos de proveniência, títulos de seção, nomes acessíveis. | 🟢 |
| `pages/**` | ~7 | `<title>` e `<meta name="description">` das cinco rotas mais a raiz. | 🟢 |
| `public/manifest.webmanifest` | 3 campos | `name`, `short_name`, `description` do aplicativo instalável. | 🟢 |
| `README.md` | 174 linhas | Incluído pela resolução de L-01: é porta de entrada de quem chega pelo repositório, e sua prosa é integralmente autoral. | 🟢 |

Concentração relevante: `models/insulina/fonte-clinica.ts` (~28), `interface/cardiologia/referencias.tsx` (~26), `models/puericultura/fonte-clinica.ts` (~25), `models/cardiopatia-isquemica/fonte-clinica.ts` (~15), `interface/inicio/catalogo.ts` (~11). Os arquivos `fonte-clinica.ts` são majoritariamente citação; `referencias.tsx` e `catalogo.ts`, majoritariamente autorais.

**A prosa autoral de `models/**` não se concentra em `validacao.ts` e `fonte-clinica.ts`, e é preciso dizê-lo porque a leitura contrária estreitaria a revisão sem que ninguém percebesse.** Mensagens de conduta, de recusa e de alerta — que o prescritor lê na tela como qualquer outro texto — vivem nos arquivos de regra e de orquestração: `models/insulina/regra-intensificacao.ts` e `regra-titulacao-basal.ts`, `models/cardiopatia-isquemica/conduta.ts`, `models/puericultura/elegibilidade.ts` e `calculadora.ts`, `models/risco-cardiovascular/elegibilidade.ts`, entre outros. Todos entram no inventário de RF-02 e todos respondem a RF-03, decisão de 27/07 sobre o achado A001 da segunda auditoria. 🟢

**Um literal já nasce duplicado, e a revisão precisa saber disso antes de tocá-lo.** O subtítulo da home, em `interface/inicio/tela.tsx`, e a `description` de `public/manifest.webmanifest` são hoje a mesma sequência de caracteres, ponto médio incluído: `Calculadoras clínicas para a Atenção Primária à Saúde · cálculo 100% no navegador`. Revisar um lado só converteria uma duplicação em divergência, que é precisamente o estado que RN-05 existe para evitar. 🟢

### 2.2 Acoplamento dos testes ao texto

O aparato de testes assevera texto visível e nome acessível em algo entre duas e três centenas de ocorrências, distribuídas por dezenas de arquivos de teste, entre busca por texto exibido, por nome acessível e por rótulo de campo. Toda alteração de prosa revisada aparecerá como falha de suíte, o que é a propriedade desejada: a mudança é barulhenta, nunca silenciosa. A atualização desses testes é parte da entrega, não efeito colateral.

**A régua canônica é a do gerador, não a desta seção.** Duas varreduras manuais mediram este acoplamento e discordaram, por contarem coisas diferentes: 224 ocorrências em 33 arquivos numa, 251 em 14 noutra. Nenhuma das duas é normativa, e nenhuma é reproduzível daqui a doze meses. A contagem que vale, e a única contra a qual a entrega se afere, é a que o inventário de RF-02 e a medição de RF-08 emitirem, pelo mesmo princípio que rege os literais: **contagem é dado gerado, não número escrito em prosa.** As cifras acima ficam como ordem de grandeza, e é só o que se deve pedir delas. 🟢

**A régua alcança duas famílias de asserção, e não só a mais visível.** As consultas do Testing Library — `getByText`, `getByRole` com `name:`, `getByLabelText`, `toHaveTextContent`, `getByPlaceholderText`, `findByText`, `queryByText` — são a família óbvia, e a única que a primeira formulação media. A segunda é a asserção literal sobre texto de produto, `toContain` e `toBe` sobre a cadeia exibida, e é onde o acoplamento mais denso da suíte se esconde: `tests/unit/interface/formatar-plano.test.ts` assevera assim dezessete literais do plano copiável, todos nascidos de `interface/calculadora/rotulos.ts`, que a revisão reescreve. Uma régua cega a essa família mediria como intacto justamente o arquivo que mais quebra, e deixaria RF-08 aprovar uma entrega da qual asserções tivessem sido removidas. A medição, portanto, cobre `tests/**` e `e2e/**` nas duas famílias, e o piso de comparação de RF-08 é o número assim obtido. Decisão de 27/07 sobre o achado A004 da segunda auditoria. 🟢

### 2.3 Achado de exatidão

🟢 A descrição da home em `pages/index.tsx` afirma que a plataforma cobre "Diabetes Mellitus tipo 2 e Pré-natal". O catálogo vigente tem **quatro seções**: as duas citadas, mais Cardiologia (duas calculadoras) e Puericultura. O texto que sai para buscadores e para o compartilhamento em redes descreve uma plataforma que já não existe. É desatualização de conteúdo, não de estilo, e entra no escopo por RF-04.

### 2.4 Lista fechada dos desvios de concordância na classe citação

Resolvida L-02 pela via da correção declarada, a exceção de RN-09 tem alcance conhecido e finito. Conferidos os vinte e cinco rótulos de `models/puericultura/fonte-clinica.ts`, apenas **dois** apresentam desvio de concordância nominal, ambos idênticos nos materiais do menino e da menina:

| Impresso na Caderneta (pp. 89, 92, 95) | Passa a | Natureza do desvio |
|---|---|---|
| `Comprimento adequada para idade` | `Comprimento adequado para idade` | concordância de gênero: "comprimento" é masculino |
| `Baixa comprimento para idade` | `Baixo comprimento para idade` | concordância de gênero, mesma raiz |

Dois casos vizinhos ficam **fora** da exceção, por não serem concordância: 🟢

- **A elipse do artigo.** A fonte imprime "para idade" em vinte e quatro rótulos e "para a idade" em um só (`PC acima do esperado para a idade`). É registro telegráfico de tabela, não erro de concordância, e uniformizá-lo arrastaria o conjunto inteiro para além do que a decisão autorizou.
- **`Muito baixo comprimento para idade`.** O cabeçalho de `fonte-clinica.ts` o arrola junto dos desviantes, mas ele está gramaticalmente correto: "baixo" já concorda com o masculino. Permanece intocado, e a linha 9 daquele comentário é imprecisa nesse ponto.

Consequência de execução, não de escopo: os dois rótulos corrigidos são asseverados por **asserções literais em três arquivos de teste**, e não por oráculo congelado, como esta seção afirmou até 27/07. `tests/apoio/casos-oraculo-puericultura.json` guarda apenas valores da OMS e do INTERGROWTH-21st, sem rótulo de classificação nenhum, de modo que **nada nesta feature depende de reexecutar `scripts/congelar-casos-oraculo.mts` nem de ter as fontes de `referencias/` em mãos**. As oito asserções vivem em `tests/unit/dominio-puericultura/classificacao.test.ts` (seis, mais o comentário da linha 108), `tests/unit/dominio-puericultura/fachada.test.ts` (uma, linha 59) e `tests/integration/interface/puericultura.test.tsx` (uma, linha 81, mais o comentário da linha 80). Os dois comentários justificam a concordância destoante como fidelidade à fonte e precisam ser reescritos junto, sob pena de o código explicar o oposto do que faz. A atualização é ato deliberado desta feature, sob RF-08. 🟢

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Prescritor na consulta | Ler a tela sem tropeçar, e reconhecer nela o material impresso que tem à mão | Abre a avaliação do crescimento com a caderneta aberta ao lado, encontra "Comprimento adequado" onde a página imprime "Comprimento adequada" e lê, na proveniência, que a diferença é correção de concordância declarada, não divergência de classificação |
| Prescritor que chega pela busca | Entender em uma frase o que a plataforma faz e o que ela cobre | Encontra o resultado no buscador e lê uma descrição que corresponde às quatro seções existentes |
| Mantenedor intermitente | Escrever a próxima tela sem redescobrir a norma | Abre o guia de redação antes de nomear a sexta calculadora e sabe, sem deliberar, como pontuar o subtítulo |
| Agente de codificação | Produzir texto conforme, sem depender de instrução repetida no prompt | Executa `/reversa-coding` de uma feature nova e encontra a norma como artefato do projeto, verificada por teste |

## 4. Regras de negócio novas ou alteradas

1. **RN-01: três classes de texto, e a revisão as alcança de modos diferentes.** Todo literal exibido ao usuário pertence a exatamente uma classe: **autoral** (escrito pelo produto), **citação** (transcrito de fonte clínica, incluindo rótulo de classificação, conduta e localização bibliográfica) ou **identificador** (chave, `id`, nome de campo, valor de `data-*`). A revisão de estilo alcança integralmente a classe autoral. A citação permanece byte a byte, **salvo a exceção estrita de RN-09**, que corrige concordância e só concordância. O identificador está fora do escopo. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#7` (invariante 5, constantes congeladas como fonte única)
   - Tipo: nova

2. **RN-02: a classe é dada pela origem do texto, nunca pelo arquivo onde ele mora.** Mensagens de validação em `models/*/validacao.ts` são autorais, porque nenhum guia impresso escreve "Informe o peso do paciente"; rótulos em `interface/**` podem ser citação, quando reproduzem a fonte. Classificar por diretório produziria erro nas duas direções. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#1` (domínio puro não impede prosa autoral dentro dele)
   - Tipo: nova

3. **RN-03: pontuação pelos três eixos, com parcimônia no expressivo.** O texto autoral usa os sinais sintáticos livremente e reserva os expressivos, travessão à frente, para o que de fato marque subjetividade. Regra dura e verificável: **no máximo um par de travessões por bloco de texto autoral**, e nenhuma reticência ou exclamação em prosa de produto. O travessão é `—`, jamais o hífen `-` nem a sequência `--`. 🟢
   - Origem no legado: `~/.claude/CLAUDE.md#estilo-de-escrita`
   - Tipo: nova

4. **RN-04: revisão de forma nunca altera conteúdo clínico.** Nenhuma reescrita pode mudar número, unidade, faixa, corte, nome de fármaco, nome de exame, conduta ou o sentido de uma recusa. Alteração dessa natureza deixa de ser revisão de linguagem e exige feature própria, com validação do prescritor. É **regra de recusa, e não teste**: quem a faz cumprir são dois mecanismos que já existem ou que a feature instala, e convém nomeá-los para que ninguém espere um verificador que não há. Primeiro, os oráculos de domínio, que reprovam qualquer mudança de valor calculado. Segundo, o congelamento de RF-06, que faz todo literal alterado aparecer no `git diff` do inventário e no par antes/depois do relatório, sob leitura humana. Um verificador que comparasse números dentro de literais pegaria pouco, porque os valores clínicos das telas em geral são interpolados da constante do domínio por força da regra 9 de `domain.md` §7.1; número clínico escrito à mão numa tela já viola aquela regra, antes e independentemente desta. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#7` (invariante 6, o motor informa e não escolhe)
   - Tipo: nova

5. **RN-05: a revisão preserva a fonte única de texto, e não deixa divergir o que já nasceu duplicado.** Onde já existe um ponto único que alimenta dois consumidores, como `rotulos.ts` entre painel e plano copiável, ou `catalogo.ts` entre home e rotas, a reescrita acontece nesse ponto e em nenhum outro. A revisão não pode criar segunda fonte para o mesmo texto. Onde a duplicação **precede** a feature, como entre o subtítulo de `interface/inicio/tela.tsx` e a `description` do manifesto, os dois lados se revisam **no mesmo ato** e a igualdade passa a ser asseverada por teste. A unificação técnica fica descartada por um motivo de forma: o manifesto é JSON estático servido de `public/`, não importa constante de TypeScript, e gerá-lo a partir do código acrescentaria um quarto gerador ao projeto para resolver um literal. Disciplina mais teste, portanto, e não fonte única. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#7.1` (regra 9) e `_reversa_sdd/code-analysis.md`, "Módulo 10 — `interface/inicio`" (D-07)
   - Origem da segunda metade: decisão do usuário em 27/07/2026 sobre o achado A003 da segunda auditoria
   - Tipo: nova

6. **RN-06: o texto que descreve a plataforma corresponde ao catálogo vigente, e a correspondência tem duas formas conforme a superfície.** Título, descrição e manifesto que enumeram o que a ferramenta cobre derivam do catálogo, ou são verificados contra ele. Enumeração desatualizada é defeito, não questão de estilo. A verificação, porém, não é a mesma nos dois lugares: a **descrição da home** enumera e por isso responde à forma positiva — nomeia todas as seções vigentes —, enquanto a **descrição do manifesto** responde à forma negativa, a de não enumerar subconjunto próprio, porque ali um teto prático de comprimento governa o texto e a enumeração seria truncada na tela de instalação. As duas formas cumprem o mesmo propósito, que é impedir a plataforma de se descrever pela metade. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md`, "Módulo 10 — `interface/inicio`" (catálogo como fonte única anti-drift)
   - Tipo: nova

7. **RN-07: o nome acessível descreve a ação, e a revisão de estilo não o degrada.** Rótulos de leitor de tela permanecem imperativos e específicos, no molde de "Ativar tema claro". Elegância de prosa não é razão para tornar um nome acessível vago. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#7.2` (regra 12, nome acessível fixado por decisão)
   - Tipo: alterada, no sentido de passar a valer como restrição explícita da revisão

8. **RN-08: texto alterado é texto congelado.** Cada literal autoral revisado passa a ser asseverado por teste, de modo que alteração futura seja deliberada e visível na suíte, jamais um efeito colateral de refatoração. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#5` (disciplina de oráculos congelados já praticada no domínio)
   - Tipo: nova

9. **RN-09: a citação corrige concordância, e nada além disso, sempre declarando.** Onde a fonte impressa contraria a concordância nominal ou verbal, o produto escreve a forma correta e **declara o afastamento ao leitor**, no bloco de proveniência do domínio. A exceção é estrita em três sentidos: alcança **apenas** desvio de concordância, jamais léxico, terminologia, ordem, número, unidade ou sentido; vale sobre a **lista fechada de §2.4**, não como licença geral de reescrita da citação; e é **inseparável da declaração**, de modo que corrigir sem informar constitui violação da regra, não cumprimento parcial dela. Elipse de artigo, registro telegráfico e escolha vocabular da fonte permanecem como impressos. 🟢
   - Origem: decisão do usuário em `/reversa-clarify` de 27/07/2026, que arbitra a lacuna L-02 contra a posição registrada no cabeçalho de `models/puericultura/fonte-clinica.ts` e reverte a segunda metade de `MD-0014` — reversão que a própria ficha previu e declarou barata, por não ter ainda tocado código
   - Tipo: nova, e substitui a leitura absoluta de RN-01 vigente até 26/07

10. **RN-10: o ponto médio é recurso tipográfico, não sinal de pontuação.** O `·` separa unidades de informação de mesma hierarquia — nome e qualificação no subtítulo, título e marca no `<title>`, fonte e localização na proveniência — e por isso não responde aos três eixos nem ao teto de RN-03. **Permanece onde está**, e a permanência se afere contra o inventário de RF-02, nunca contra uma contagem escrita em prosa: as varreduras manuais divergiram entre vinte e vinte e uma posições, e uma regra que carrega número errado ensina a desconfiar da regra inteira. O que a norma fixa é a forma: sempre ladeado por espaço simples, nunca acumulado com vírgula ou travessão na mesma junção, e jamais em início ou fim de linha. 🟢
   - Origem: decisão do usuário em `/reversa-clarify` de 27/07/2026, que resolve a lacuna L-04; a contagem saiu da regra na segunda passagem do mesmo dia, por L-13
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Guia de redação do produto como artefato versionado do repositório, derivado das preferências globais de escrita e reduzido a regras aplicáveis: as três classes de RN-01 com a exceção de RN-09, os três eixos de pontuação, os tetos de RN-03, o estatuto do ponto médio por RN-10, o molde das mensagens de validação, e a grafia de números, unidades e siglas fixada pelo uso corrente | Must | Existe arquivo único, citado pelo `CLAUDE.md` do projeto, cujas regras são todas ou verificáveis por teste ou ilustradas por par "antes/depois" retirado do próprio produto | 🟢 |
| RF-02 | Inventário completo e classificado de todos os literais exibidos ao usuário, cada um marcado como autoral, citação ou identificador, com arquivo e linha | Must | O inventário cobre `interface/**`, `pages/**`, `models/**`, `public/manifest.webmanifest` e `README.md`; nenhum literal exibido fica sem classe; a soma bate com a varredura de conferência | 🟢 |
| RF-03 | Revisão de todo texto da classe autoral contra o guia de RF-01, **na largura do inventário e não numa fatia dele** | Must | Cada literal autoral do inventário aparece como mantido, com justificativa de uma linha, ou reescrito, com o par "antes/depois" registrado. A cobertura alcança `models/**` por inteiro, e não apenas `validacao.ts` e `fonte-clinica.ts`: as mensagens de conduta, recusa e alerta de `regra-*.ts`, `conduta.ts`, `elegibilidade.ts` e `calculadora.ts` são autorais e entram; alcança também `interface/inicio/tela.tsx`, cujo subtítulo a primeira decomposição deixara de fora | 🟢 |
| RF-04 | Correção da descrição da home, que enumera duas das quatro seções existentes | Must | Duas verificações distintas, uma por superfície (RN-06): a `description` de `pages/index.tsx` **nomeia todas** as seções de `CATALOGO`, e a do manifesto **não enumera subconjunto próprio** delas, ambas comparadas por teste contra a constante. As seis `description` continuam afirmando a privacidade do cálculo, verificado sem congelar a redação da cláusula | 🟢 |
| RF-05 | Verificação automatizada das regras mecânicas da norma sobre os textos autorais, integrada à suíte | Should | Existe teste que falha quando um literal autoral novo viola os tetos de RN-03 ou usa hífen no lugar de travessão; as citações de RN-01 ficam explicitamente isentas | 🟢 |
| RF-06 | Congelamento por teste dos textos autorais revisados | Should | Alterar qualquer literal autoral revisado quebra ao menos um teste, com mensagem que aponta o guia | 🟢 |
| RF-07 | Preservação verificada da classe citação, com exceção única e enumerada, contra linha de base congelada em artefato próprio | Must | Existe artefato de linha de base, emitido **uma vez** do estado anterior às reescritas e jamais regerado, distinto do inventário de RF-02 que a revisão atualiza; a comparação automática contra ele demonstra que os únicos literais de citação alterados são os **dois** de §2.4, e que a alteração se restringe à concordância; qualquer terceiro delta na classe reprova a entrega | 🟢 |
| RF-08 | Atualização dos testes que asseveram texto visível e nome acessível, em razão das reescritas de RF-03 | Must | Suíte integralmente verde; nenhuma asserção removida para acomodar a mudança, apenas atualizada. A contagem que prova a não remoção é a da régua de §2.2, nas suas **duas** famílias — consultas do Testing Library e asserções literais sobre texto de produto —, de modo que `tests/unit/interface/**` entre no piso de comparação em vez de escapar dele | 🟢 |
| RF-09 | Reconciliação da spec com o texto revisado, na disciplina do Princípio I | Should | Os artefatos da extração que citam literais alterados são apontados no relatório da feature, para absorção por `/reversa-sync`; a lista inclui obrigatoriamente `_reversa_sdd/addenda/017-puericultura-crescimento.md` e as fichas `MD-0012` e `MD-0014`, que transcrevem os dois rótulos de §2.4 | 🟡 |
| RF-10 | Declaração ao leitor do afastamento autorizado por RN-09, na proveniência do domínio de puericultura | Must | Constante **própria** do domínio, ao lado da `NOTA_PROVENIENCIA` e distinta dela, informa que dois rótulos de classificação corrigem a concordância do impresso e nomeia as formas originais, de modo que quem confere contra a caderneta reconheça a diferença sem consultar o código; a tela a renderiza como parágrafo próprio, lida do domínio pelo mesmo caminho da `NOTA_PROVENIENCIA` e sem segunda fonte na tela | 🟢 |
| RF-11 | Elevação da norma a princípio formal do projeto, por passagem de `/reversa-principles` dentro desta feature | Must | `.reversa/principles.md` ganha o princípio **IX**, no molde dos oito ativos, com impacto declarado nos templates dependentes; o guia de RF-01 passa a ser a sua materialização operacional, e um remete ao outro nas duas direções | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Compatibilidade | Nenhuma mudança de comportamento observável além do texto: mesmas rotas, mesmos cálculos, mesmos estados | A feature é de superfície; qualquer delta de cálculo indica erro de execução | 🟢 |
| Acessibilidade | **Nenhuma rota piora** em relação a `e2e/axe-baseline.json`, e as rotas que hoje asseveram zero diretamente continuam em zero; todo elemento interativo mantém nome acessível não vazio | O baseline é catraca, e é assim que a suíte o usa: `toBeLessThanOrEqual` contra o valor registrado, com a puericultura em `toBe(0)` sem entrada no arquivo, por decisão declarada no cabeçalho de `e2e/puericultura.spec.ts`. Não é "0/0 por rota": o arquivo tolera uma violação em `telaInicial` e uma em `telaComResultado`, dívida herdada e alheia a esta feature (L-10) | 🟢 |
| Desempenho | Variação de bundle desprezível, por se tratar de troca de literais; qualquer crescimento acima de 1 kB gzip por rota deve ser declarado | Método de medição já estabelecido em `_reversa_forward/017-puericultura-crescimento/medicao-bundle.md` | 🟢 |
| Manutenibilidade | O guia de RF-01 é curto o bastante para ser lido inteiro antes de escrever uma tela, e suas regras duras cabem no teste de RF-05 | Contexto operacional do mantenedor: norma que só existe em prosa longa não sobrevive a seis meses de pausa | 🟡 |
| Privacidade | Nenhum texto revisado passa a coletar, exibir ou transmitir dado do paciente. Além disso, as seis `description` continuam **afirmando** a privacidade do cálculo, verificado por asserção que exige a promessa em alguma forma e não a redação exata de hoje | ADR 0002, privacidade por construção. A asserção é deliberadamente fraca: a cláusula `Cálculo 100% no navegador: nada é salvo nem enviado.` é prosa autoral e o guia pode reescrevê-la; congelá-la aqui poria o RNF a vetar a revisão que a feature existe para fazer. O que não pode desaparecer é a afirmação | 🟢 |
| Rastreabilidade | Cada reescrita registra o literal anterior, de modo que a revisão seja auditável sem recorrer ao `git log` | Princípio VI, rastreabilidade bidirecional | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: prosa autoral revisada conforme a norma
  Dado um literal da classe autoral que hoje usa três travessões em uma frase
  Quando a revisão da feature é aplicada
  Então o literal passa a usar no máximo um par de travessões
  E o par "antes/depois" fica registrado no relatório da feature

Cenário: rótulo citado com desvio de concordância é corrigido e declarado
  Dado o rótulo "Comprimento adequada para idade", transcrito da Caderneta da Criança
  Quando a revisão da feature é aplicada
  Então o rótulo passa a ler "Comprimento adequado para idade"
  E a proveniência do domínio informa o afastamento e a forma impressa original
  E a comparação de RF-07 acusa exatamente os dois deltas de §2.4, nenhum além

Cenário: rótulo citado sem desvio de concordância permanece intacto
  Dado o rótulo "Muito baixo comprimento para idade", gramaticalmente correto na fonte
  E o rótulo "Peso adequado para idade", cuja elipse de artigo não é concordância
  Quando a revisão da feature é aplicada
  Então ambos permanecem byte a byte idênticos
  E a exceção de RN-09 não é invocada para nenhum deles

Cenário: correção de citação sem declaração é reprovada
  Dado um rótulo de citação cuja concordância foi corrigida no domínio
  Quando a proveniência não menciona o afastamento
  Então a entrega viola RN-09
  E o teste de RF-10 falha

Cenário: descrição da home nomeia o catálogo inteiro
  Dado que o catálogo declara quatro seções
  Quando a descrição de pages/index.tsx é lida
  Então ela nomeia todas as quatro
  E o teste que a compara ao catálogo passa

Cenário: descrição do manifesto não descreve a plataforma pela metade
  Dado que o catálogo declara quatro seções
  E que o manifesto tem teto prático de comprimento
  Quando a descrição do manifesto é lida
  Então ela não enumera um subconjunto próprio dessas seções
  E o teste não exige que ela as enumere todas

Cenário: a cláusula de privacidade sobrevive à revisão
  Dado que as seis rotas afirmam hoje que o cálculo não sai do navegador
  Quando a revisão reescreve as descrições
  Então as seis continuam afirmando a privacidade do cálculo
  E o teste aceita a afirmação em qualquer redação conforme ao guia

Cenário: literal duplicado não vira literal divergente
  Dado que o subtítulo da home e a description do manifesto são hoje idênticos
  Quando a revisão alcança um deles
  Então alcança o outro no mesmo ato
  E um teste assevera que os dois permanecem iguais

Cenário: texto novo fora da norma é barrado
  Dado um literal autoral novo que usa hífen onde caberia travessão
  Quando a suíte é executada
  Então o teste de RF-05 falha
  E a mensagem de falha aponta a regra do guia que foi violada

Cenário: revisão que alteraria conteúdo clínico é recusada
  Dado um literal autoral cuja reescrita mudaria a unidade de uma dose
  Quando a revisão é proposta
  Então a alteração é rejeitada por RN-04
  E o literal permanece como está, com a razão registrada

Cenário: nome acessível preservado em especificidade
  Dado o nome acessível "Ativar tema claro"
  Quando a revisão de estilo é aplicada ao cabeçalho
  Então o nome acessível continua descrevendo a ação de forma imperativa e específica
  E nenhuma rota piora em relação à linha de base de acessibilidade automatizada

Cenário: inventário fechado, sem literal órfão
  Dado o conjunto de literais exibidos ao usuário nas seis rotas e no manifesto
  Quando o inventário da feature é conferido contra uma varredura independente
  Então todo literal exibido tem exatamente uma classe atribuída
  E não resta literal sem classe nem literal classificado em duas

Cenário: norma consultável antes de escrever
  Dado um mantenedor que abre o projeto após meses de pausa
  Quando ele procura como pontuar o subtítulo de uma tela nova
  Então encontra a regra no guia de redação apontado pelo CLAUDE.md do projeto
  E a regra vem acompanhada de um par "antes/depois" tirado do próprio produto
  E o guia remete ao princípio IX, que lhe dá a razão de ser

Cenário: ponto médio preservado como recurso tipográfico
  Dado o subtítulo "APS Inteligente · Fonte única: Caderneta da Criança"
  Quando a revisão de pontuação é aplicada
  Então o ponto médio permanece, ladeado por espaço simples
  E o teto de travessões de RN-03 não o contabiliza

Cenário: alteração futura de texto revisado não passa silenciosa
  Dado um literal autoral já revisado e congelado
  Quando alguém o altera sem atualizar a asserção correspondente
  Então a suíte falha
  E a mensagem de falha aponta o guia de redação

Cenário: entrega com suíte verde
  Dado que as reescritas quebraram asserções de texto existentes
  Quando a feature é dada por concluída
  Então todas as asserções afetadas foram atualizadas, nenhuma removida
  E a suíte completa passa

Cenário: literais alterados que a extração cita são reportados
  Dado um literal reescrito que aparece transcrito em artefato da extração
  Quando o relatório da feature é fechado
  Então esse artefato consta da lista de reconciliação
  E a lista fica disponível para a convergência posterior da extração
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 guia de redação | Must | Sem norma escrita, a revisão é gosto pessoal de uma tarde e a deriva recomeça na feature seguinte |
| RF-02 inventário classificado | Must | "Todos os textos" só é verificável contra uma lista fechada; sem ela não há critério de pronto |
| RF-03 revisão da prosa autoral | Must | É o pedido literal |
| RF-04 descrição desatualizada | Must | Defeito de exatidão já constatado, visível a quem chega pela busca |
| RF-07 preservação da citação | Must | A citação é o que casa a tela com o impresso; a exceção de RN-09 só se sustenta se for enumerada e verificada, sob pena de virar licença geral |
| RF-10 declaração do afastamento | Must | Corrigir sem informar troca um desvio gramatical por um desvio de transparência, e este é o pior dos dois na ferramenta clínica |
| RF-11 princípio IX | Must | Decisão do usuário em 27/07: a norma vale como princípio do projeto, não só como guia de uma feature |
| RF-08 testes atualizados | Must | Centenas de asserções de texto quebram junto, nas duas famílias da régua de §2.2, mais as oito asserções literais dos dois rótulos de §2.4 — que são asserções em três arquivos de teste, e não oráculo congelado, como esta tabela afirmou até 27/07; entrega sem suíte verde não é entrega |
| RF-05 verificação automatizada | Should | Converte a norma em guardrail; sem ela a regra depende de lembrança |
| RF-06 congelamento por teste | Should | Torna deliberada a mudança futura, no molde dos oráculos já usados no domínio |
| RF-09 reconciliação da spec | Should | Princípio I; pode ser absorvida por `/reversa-sync` ao fim do ciclo |
| Revisão do `README.md` | Must | Incluído por decisão de 27/07 (L-01): é a porta de entrada de quem chega pelo repositório |
| Revisão de comentários de código, de `_reversa_sdd/` e de mensagens de commit | Won't, nesta feature | Fora da fronteira fixada em 27/07; incluir a documentação da extração multiplicaria o escopo por uma ordem de grandeza |
| Tradução ou versão em outro idioma | Won't | Não pedido, e multiplicaria a superfície a manter |
| Redesenho de layout, hierarquia visual ou tipografia | Won't | Feature de linguagem, não de design; alterações visuais têm ciclo próprio |

## 9. Esclarecimentos

### Sessão 2026-07-27

- **Q:** Fronteira do "website": o que entra na revisão?
  **R:** Entra o que o usuário lê na tela, o que sai para fora do navegador **e o `README.md`**, por ser a porta de entrada de quem chega pelo repositório. Ficam fora os comentários de código, os artefatos de `_reversa_sdd/` e as mensagens de commit. Resolve L-01; incorporado em §2.1, RF-02 e na tabela MoSCoW.

- **Q:** Rótulos transcritos com desvio de concordância, como "Comprimento adequada" e "Baixa comprimento": a citação prevalece ou se corrige?
  **R:** **Corrigir a concordância e registrar o desvio da fonte na proveniência.** A decisão reverte a posição declarada no cabeçalho de `models/puericultura/fonte-clinica.ts` e a segunda metade de `MD-0014`, cientes de que a tela passa a diferir da página impressa nesses dois pontos; a declaração ao leitor é o que mantém a conferência à beira do leito possível. O alcance é o da palavra empregada, concordância, e não se estende a léxico, elipse de artigo ou registro. Resolve L-02; incorporado em §2.4, RN-01, RN-09, RF-07, RF-10 e nos cenários.

- **Q:** A norma fica como guia mais teste, ou sobe a princípio formal do projeto?
  **R:** **As duas coisas, dentro desta feature**: guia versionado com verificação automatizada, e princípio **IX** em `.reversa/principles.md` por passagem de `/reversa-principles`, com impacto declarado nos templates. Resolve L-03; incorporado em RF-01 e RF-11.

- **Q:** O ponto médio "·" permanece, e em quais posições?
  **R:** **Permanece onde está**, e o guia o declara recurso tipográfico de separação, alheio aos três eixos da pontuação e ao teto de travessões. Resolve L-04; incorporado em RN-10 e em RF-01. *(A resposta original dizia "em todas as vinte posições atuais". A cifra foi retirada na segunda passagem do mesmo dia, por L-13: a medição encontrou vinte e uma posições em literais exibidos, e a permanência passou a se aferir contra o inventário. A decisão de preservar o ponto médio segue de pé, intacta.)*

- **Q:** Que regra o guia fixa para números, unidades e siglas?
  **R:** **Codificar o uso corrente como norma** — decimal com vírgula, espaço antes da unidade, percentual sem espaço, símbolo matemático admitido em prosa, meia-risca em intervalo — e uniformizar apenas os desvios pontuais que a revisão encontrar. Resolve L-05; incorporado em RF-01.

- **Q:** As mensagens de validação alternam entre imperativo e constatação. A alternância é deliberada?
  **R:** É deliberada, e a varredura o demonstra: o molde dominante é `constatação: imperativo` ("Glicemia fora da faixa plausível: informe um valor entre X e Y mg/dL."), e o imperativo puro aparece justamente quando o campo está **ausente** ("Informe ao menos uma glicemia capilar para calcular a titulação."). O guia fixa a regularidade observada: **valor presente e inválido pede diagnóstico seguido de instrução; valor ausente pede instrução direta.** Proposto pelo esclarecedor e não contestado. Resolve L-06; incorporado em RF-01.

### Sessão 2026-07-27, segunda passagem (pós-auditoria)

Cinco perguntas nascidas do `audit/cross-check.md`, que encontrou quatro achados de severidade alta e dez de menor porte. O traço comum dos altos, e a razão de a segunda passagem existir, é que três verificações prometidas por estes artefatos **não teriam como reprovar**: apareceriam verdes por construção, não por mérito.

- **Q:** RF-10 exige que a `NOTA_PROVENIENCIA` carregue a declaração do afastamento; D-06 do roadmap decidiu constante separada, porque emendar produziria três pares de travessão contra o teto de RN-03. Qual prevalece?
  **R:** **A constante separada**, e o critério de RF-10 passa a nomeá-la em vez da `NOTA_PROVENIENCIA`. São dois assuntos com ciclos de vida distintos: se um terceiro rótulo vier a ser corrigido, a declaração muda e a proveniência não. Pesou ainda que `W022`, reescrito por `MD-0017`, passará a vigiar a permanência da declaração, e vigiar constante exportada é preciso, ao passo que vigiar trecho dentro de um bloco de quinhentos caracteres quebra na primeira reescrita de forma. Resolve o achado A001; incorporado em RF-10.

- **Q:** O inventário de RF-02 é, ao mesmo tempo, o congelamento que se regera ao fim das reescritas e a linha de base contra a qual RF-07 prova que a citação foi preservada. Como se resolve a colisão?
  **R:** **Dois artefatos.** O inventário segue gerado e regerado; a linha de base da citação vai para arquivo próprio, emitido uma vez do estado anterior e jamais regerado. Descartado o bloco preservado dentro do inventário, que poria o gerador a carregar adiante dado que ele não produziu, contra `MD-0008`, e faria um defeito de cópia corromper a linha de base em silêncio dentro de um arquivo que ninguém inspeciona por ser gerado. O artefato separado não é andaime: congelado, torna-se o guarda permanente do invariante "a citação é byte a byte, salvo dois casos declarados", com as duas exceções visíveis para sempre como exceções. Registrado em `MD-0018`. Resolve A002; incorporado em RF-07.

- **Q:** O RNF de acessibilidade manda preservar um baseline "0/0 por rota" que o repositório não pratica. Corrige-se a spec ou zera-se o baseline?
  **R:** **Corrige-se a spec**, para a forma de catraca que a suíte de fato implementa: nenhuma rota piora, e as que hoje asseveram zero continuam em zero. Zerar as duas violações da insulina é dívida real, mas absorvê-la aqui destruiria a propriedade que D-12 construiu, a de que qualquer falha de acessibilidade seja atribuível à revisão de texto e a mais nada. A dívida vai para L-10, e a origem do erro, `architecture.md` §5, para L-11. Resolve A003; incorporado em §2, §6 e no cenário do nome acessível.

- **Q:** Três contagens divergentes convivem nos artefatos (224 asserções em 33 arquivos, 251 em 14, vinte posições de ponto médio contra vinte e uma). Qual é a régua?
  **R:** **Nenhuma delas: a régua é o gerador.** As contagens escritas em prosa ficam como ordem de grandeza e perdem força normativa, porque um número medido por varredura manual não se reproduz daqui a doze meses. É a mesma doutrina de `MD-0016`, já adotada para os literais, agora estendida às contagens que os descrevem. RN-10 deixa de fixar "vinte posições" e passa a enunciar a propriedade, aferida contra o inventário. Resolve A005 e A007; incorporado em §2.2 e RN-10.

- **Q:** O cenário "revisão que alteraria conteúdo clínico é recusada" não tem ação nem teste, embora o roadmap o declare mitigação de risco alto. Ganha verificador próprio?
  **R:** **Não, e o registro passa a dizer por quê.** Um verificador que comparasse números dentro de literais pegaria pouco, porque a regra 9 de `domain.md` §7.1 manda a interface importar a constante em vez de reescrevê-la, de modo que os valores clínicos das telas são interpolados e não literais. O que faz RN-04 valer são os oráculos de domínio, que reprovam mudança de valor, e o congelamento de RF-06, que expõe todo literal alterado à leitura humana. Resolve A008; incorporado em RN-04.

### Sessão 2026-07-27, terceira passagem (pós-auditoria nº 2)

Cinco perguntas nascidas da segunda execução de `audit/cross-check.md`, que encontrou quatro achados altos e oito de menor porte. O traço comum dos altos, e a razão desta passagem existir, é diferente do da anterior: agora não se trata de verificações que não podiam reprovar, e sim de uma **fronteira que encolheu sem declarar**. O que o inventário varre e o que a revisão alcança deixaram de coincidir.

- **Q:** A prosa autoral de `models/**` fora de `validacao.ts` e `fonte-clinica.ts` — mensagens de conduta, recusa e alerta em `regra-*.ts`, `conduta.ts`, `elegibilidade.ts` e `calculadora.ts` — entra na revisão ou fica de fora?
  **R:** **Entra: a camada inteira é revisada.** O inventário já a classifica por completo, e deixar de revisá-la produziria o pior arranjo possível — uma lista fechada que enumera o que a entrega não cumpre, com a suíte verde do mesmo jeito, porque o congelamento de RF-06 aprova o literal não revisado exatamente como aprova o revisado. Descartado estreitar RF-03 para a fatia atual, que seria honesto mas entregaria menos do que o pedido literal da feature, e descartado partir em duas entregas, que multiplicaria o custo de coordenação sobre um trabalho que o mesmo guia rege. Resolve o achado A001; incorporado em §2.1 e RF-03.

- **Q:** A `description` do manifesto deve nomear as quatro seções de `CATALOGO`, como mandavam o roadmap §10 e T021, ou apenas não enumerar subconjunto próprio, como mandam o cenário do requirements e o contrato do manifesto?
  **R:** **Uma forma por superfície: positiva na home, negativa no manifesto.** A home enumera hoje e enumera errado, e é ali que o defeito de §2.3 vive; exigir dela a enumeração completa é o que corrige o defeito e o impede de voltar. O manifesto não enumera nada, tem teto prático de 78 caracteres e um texto que persiste no dispositivo de quem instalou até a reinstalação: obrigá-lo às quatro seções custaria sessenta e três caracteres antes de qualquer moldura e produziria truncamento na tela de instalação. RN-06 passa a declarar as duas formas em vez de deixar a leitura por conta de quem escrever o teste. Resolve A002; incorporado em RN-06, RF-04 e nos cenários.

- **Q:** O subtítulo de `interface/inicio/tela.tsx` e a `description` do manifesto são hoje o mesmo literal, e só o segundo tinha ação. Unifica-se a fonte, revisam-se os dois juntos, ou deixa-se divergir?
  **R:** **Revisam-se os dois no mesmo ato, com a igualdade asseverada por teste.** A unificação técnica foi descartada por desproporção: o manifesto é JSON estático em `public/` e não importa constante de TypeScript, de modo que unificá-lo de fato exigiria um quarto gerador no projeto para resolver um literal. Deixar divergir foi descartado por ser exatamente o estado que RN-05 existe para impedir — e a duplicação, aqui, não é acidente de leitura: as duas superfícies dizem a mesma coisa ao mesmo leitor, em momentos diferentes. Resolve A003; incorporado em §2.1, RN-05 e num cenário novo.

- **Q:** A régua de RF-08 conta apenas as consultas do Testing Library, e assim não enxerga as dezessete asserções literais de `tests/unit/interface/formatar-plano.test.ts`, que a reescrita de `rotulos.ts` quebra. Amplia-se a régua?
  **R:** **Amplia-se, e o arquivo ganha ação própria.** Uma régua que não vê a família `toContain` mediria como intacto justamente o arquivo de acoplamento mais denso, e deixaria RF-08 aprovar uma entrega da qual asserções tivessem sido removidas — o mesmo modo de falha que a auditoria anterior encontrou três vezes, agora na medição em vez de no verificador. Descartado manter a régua e acrescentar só a ação, que resolveria a suíte e não o critério; descartado deixar tudo para o `/reversa-coding`, que transformaria em surpresa de execução o que já se sabe agora. Resolve A004; incorporado em §2.2, RF-08 e na tabela MoSCoW.

- **Q:** O contrato dos metadados promete asserção explícita para a cláusula de privacidade nas seis rotas, e nenhuma ação a cria. Cria-se, e em que força?
  **R:** **Cria-se na forma fraca: a promessa de privacidade tem de estar lá, a redação atual não.** Congelar `Cálculo 100% no navegador: nada é salvo nem enviado.` poria o requisito não funcional a vetar a revisão que a feature existe para fazer, já que a cláusula é prosa autoral como qualquer outra. O que não pode desaparecer, por descuido de reescrita, é a afirmação — e é isso, e só isso, que o teste guarda. Resolve A007; incorporado no RNF de privacidade, em RF-04 e num cenário novo.

## 10. Lacunas

- 🟡 **L-07 Desalinhamento herdado da extração.** `_reversa_sdd/domain.md` §7.2 regra 11 ainda descreve a prop `logoComoTitulo`, removida pelo adendo 016. Não afeta esta feature, mas quem ler a citação da seção 2 encontrará a discrepância; a correção pertence à re-extração nº 4.
- 🟡 **L-08 Três redações para a mesma recusa.** "Sexo inválido" existe em três formas entre os domínios: seca ("informe masculino ou feminino."), com justificativa anexa ("As curvas de referência são específicas por sexo.") e com referência à fonte ("(eixo do Quadro 2)"). Resolvida a regra de molde por L-06, resta ao guia decidir se a justificativa e a referência à fonte são obrigatórias, facultativas ou vedadas na mensagem de validação. É decisão de RF-01 durante a execução, não bloqueio de plano.
- 🟢 **L-09 Ficha de decisão reconciliada.** `MD-0014` afirmava no título que "a citação de fonte clínica fica fora da revisão de linguagem", proposição que a resposta a L-02 derrubou. Resolvida em 27/07: `MD-0015` registra a arbitragem, e `MD-0014` passou a `superado-parcialmente`, com a primeira metade — classificação pela origem, não pelo diretório — preservada e ainda regendo RN-01 e RN-02.
- 🟢 **L-10 Dívida de acessibilidade herdada.** `e2e/axe-baseline.json` tolera uma violação em `telaInicial` e uma em `telaComResultado`, ambas da calculadora de insulina, e não tem entrada para a puericultura, que assevera zero diretamente. Fora do escopo desta feature por decisão de 27/07; merece ticket de manutenção próprio.
- 🟢 **L-11 Cifras desatualizadas em `architecture.md` §5.** A seção declara 37 arquivos de teste e baseline "0/0 por rota"; o repositório traz 52 arquivos e um baseline com duas tolerâncias. É desalinhamento herdado, anterior à feature 017, e a correção pertence à re-extração nº 4, junto com L-07.
- 🟢 **L-12 Propagação da segunda passagem.** Resolvida em 27/07: as cinco decisões daquela rodada foram absorvidas pelo `roadmap.md` (D-14 e D-15, §1, §5, §8, §9, §10), pelo `data-delta.md` (§3.1-bis) e pelo `actions.md` (T053, T054, T055, com T022 realocada e T046 sem o baseline como alvo). A segunda auditoria conferiu a propagação item a item.
- 🟢 **L-13 Régua canônica das contagens.** Resolvida em 27/07: contagem é dado gerado, e as cifras em prosa valem como ordem de grandeza. Estendida na terceira passagem, que fixou **quais** asserções a régua conta.
- 🟢 **L-14 Propagação da terceira passagem.** Resolvida em 27/07. As cinco decisões foram absorvidas pelo `roadmap.md` (D-16 a D-20, §1, §4, §5, §8 passos 4 e 6, §9, §10), pelo `actions.md` (sete ações novas, T056 a T062, e oito alteradas), pelo `data-delta.md` (§2.5), pelo `investigation.md` (§2.5 e §3.3), pelo `onboarding.md` (passos 3 e 6) e pelos dois contratos de `interfaces/`. A terceira auditoria conferiu a propagação item a item e encontrou, no que sobrou, apenas divergências de contagem nos resumos do roadmap, corrigidas na quarta passagem do plano.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-26 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-27 | Seis lacunas resolvidas por `/reversa-clarify`. Escopo estendido ao `README.md`; citação passa a admitir correção de concordância declarada (RN-09, RF-10, §2.4), revertendo a segunda metade de `MD-0014`; norma sobe a princípio IX (RF-11); ponto médio preservado (RN-10); grafia e molde das validações fixados pelo uso corrente | reversa |
| 2026-07-27 | Segunda passagem de `/reversa-clarify`, sobre os achados de `audit/cross-check.md`. RF-10 passa a nomear constante própria em vez da `NOTA_PROVENIENCIA` (A001); RF-07 ganha linha de base em artefato separado, jamais regerado (A002, `MD-0018`); o RNF de acessibilidade abandona o "0/0 por rota" pela forma de catraca que a suíte pratica (A003); as contagens em prosa perdem força normativa em favor do gerador, e RN-10 deixa de fixar o número de posições (A005, A007); RN-04 declara os dois mecanismos que a fazem valer, em vez de prometer verificador próprio (A008). Correções factuais em §2, §2.2, §2.4 e no cenário do inventário fechado (A006, A011, A012). Lacunas novas L-10 a L-13 | reversa |
| 2026-07-27 | Terceira passagem de `/reversa-clarify`, sobre a segunda execução de `audit/cross-check.md`. RF-03 fixa a cobertura na largura do inventário, e `models/**` entra por inteiro (A001); RN-06 passa a declarar duas formas de verificação, positiva na home e negativa no manifesto, e RF-04 as separa (A002); RN-05 ganha a cláusula do literal já duplicado entre `interface/inicio/tela.tsx` e o manifesto, revisados no mesmo ato (A003); a régua de §2.2 passa a contar as duas famílias de asserção, e RF-08 mede por ela (A004); o RNF de privacidade ganha a asserção fraca da cláusula das seis rotas (A007). Quatro cenários novos, e a justificativa MoSCoW de RF-08 corrigida quanto aos "oráculos congelados" (A006). L-12 resolvida, L-13 estendida, L-14 aberta | reversa |
