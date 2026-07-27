# Investigação: Revisão da linguagem dos textos da plataforma

> Identificador: `018-revisao-linguagem-textos`
> Data: `2026-07-27`
> Roadmap: `_reversa_forward/018-revisao-linguagem-textos/roadmap.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. A pergunta que a investigação teve de responder

O `requirements.md` fixa o **quê** com precisão incomum: três classes de texto, uma exceção enumerada, tetos verificáveis. O que ficava em aberto era o **como**, e em três pontos onde a escolha errada custa caro: como saber, de forma reproduzível, quais literais existem e a que classe pertencem; como converter uma norma de prosa em teste sem construir um linter de linguagem natural; e como provar que a citação foi preservada, quando "preservada" agora comporta duas exceções autorizadas.

Cada seção abaixo trata de uma dessas frentes, com as alternativas que foram consideradas e a razão do descarte.

## 2. Como extrair e classificar a superfície textual

### 2.1 O que existe hoje, medido

Varredura de conferência executada nesta sessão, sobre literais com três ou mais palavras separadas por espaço: 🟢

| Camada | Literais candidatos | Fonte da contagem |
|---|---|---|
| `models/**` | 253 | `grep -rEho '"[^"]*\s[^"]*\s[^"]*"' models` |
| `interface/**` | 151 | idem |
| `pages/**` | 7 | idem |
| `public/manifest.webmanifest` | 3 campos | leitura direta |
| `README.md` | 174 linhas | leitura direta |

A contagem excede a heurística de §2.1 do `requirements.md` (~179 e ~90) porque inclui literais de comentário e de tabela gerada, que a árvore sintática vai descartar. É exatamente a diferença que justifica D-03: **a régua bruta superestima em cerca de 40% e o erro se concentra onde o projeto é mais denso em prosa de cabeçalho.** O número honesto só sai do gerador.

Ponto médio: 72 ocorrências no repositório, das quais **21 em literais exibidos** (`interface/**`, `pages/**`, manifesto) e o restante em comentários de cabeçalho — sobretudo nas tabelas geradas da OMS, que usam `·` como separador de metadado de proveniência. O clarify contou vinte posições; a diferença de uma unidade é do tipo que o inventário exato resolve, e não altera a decisão de RN-10. 🟢

Asserções de texto na suíte: 251 ocorrências em 14 arquivos, pela varredura de `getByText`, `getByRole` com `name:`, `getByLabelText`, `toHaveTextContent`, `getByPlaceholderText`, `findByText` e `queryByText`. O `requirements.md` §2.2 registrou 224 em 33 arquivos, com régua diferente. Nenhuma das duas contagens é a definitiva; ambas dizem a mesma coisa relevante, que é a ordem de grandeza do acoplamento. 🟡

### 2.2 Extração: árvore sintática, e não expressão regular

O projeto já traz `typescript` como dependência de desenvolvimento, pinada e usada pelo `npm run typecheck`. A API do compilador (`ts.createSourceFile` e travessia de nós) distingue sem heurística o que uma expressão regular confunde: `StringLiteral`, `NoSubstitutionTemplateLiteral` e `JsxText` de um lado; `SingleLineCommentTrivia` e `MultiLineCommentTrivia` de outro.

A alternativa madura seria `ts-morph`, que embrulha a mesma API numa camada mais confortável. Foi descartada por acrescentar dependência a um projeto que a declara enxuta por princípio, para uma travessia que cabe em poucas dezenas de linhas. O ganho de conforto não paga o custo de manutenção de mais um pacote a acompanhar no ritual trimestral.

### 2.3 Classificação: por que ela não pode ser automática

A tentação óbvia é derivar a classe do caminho do arquivo — `fonte-clinica.ts` seria citação, `validacao.ts` seria autoral. RN-02 a proíbe, e o exame do código mostra por quê nas duas direções:

- `models/puericultura/fonte-clinica.ts` é majoritariamente citação, mas a `NOTA_PROVENIENCIA` que ele exporta é **prosa autoral** de 500 caracteres, escrita pelo produto para explicar limites da avaliação. Classificá-la como citação a poria fora da revisão, e é justamente ela que hoje carrega dois pares de travessão contra o teto de RN-03.
- `interface/cardiologia/referencias.tsx` concentra ~26 literais e mistura texto autoral de enquadramento com localização bibliográfica citada.

Daí D-04: mapa exaustivo, declarado, com falha ruidosa no candidato sem entrada. O custo é real e foi registrado como risco; a contrapartida é que a classe passa a ser uma decisão tomada uma vez e revisável, em vez de uma inferência que erra em silêncio na direção mais perigosa — revisar citação por omissão.

### 2.4 Alternativa de fundo descartada: catálogo de mensagens (i18n)

A solução canônica para "todos os textos num lugar só" é extrair os literais para um catálogo de mensagens, no molde de `react-intl` ou `i18next`, e referenciá-los por chave. Ela resolveria o inventário por construção: o catálogo *é* a lista fechada.

Descartada, por três razões cumulativas:

1. **Custo desproporcional ao problema.** Tocaria todos os componentes de tela e todas as 251 asserções, num projeto que não tem e não planeja ter segundo idioma — a tradução está declarada *Won't* na tabela MoSCoW.
2. **Colide com a fonte única do domínio.** Rótulos clínicos e mensagens de recusa nascem congelados em `fonte-clinica.ts` por invariante (`domain.md` §7, invariante 5). Movê-los para um catálogo de interface criaria a segunda fonte que RN-05 proíbe e desfaria o anti-drift que a 017 construiu.
3. **Apaga a distinção que a feature precisa preservar.** No catálogo, rótulo citado e prosa autoral viram entradas do mesmo tipo. A feature inteira depende de os dois **não** serem a mesma coisa.

O inventário de D-02 alcança o benefício buscado — lista fechada, verificável, versionada — sem mover uma linha de código de produção.

### 2.5 Onde a prosa autoral de `models/**` realmente mora

A primeira versão deste plano supunha que a prosa autoral do domínio se concentrasse nas mensagens de validação, e desenhou a frente de reescrita em torno de `models/*/validacao.ts`. A suposição é intuitiva e está errada, e a medição desta sessão mostra por quanto. Descontados os comentários, os cinco `validacao.ts` somam **18** literais candidatos; os 17 demais arquivos de `models/**` que ficavam de fora somam **47**. A camada excluída era duas vezes e meia a incluída.

| Arquivo | Candidatos | O que há ali |
|---|---|---|
| `models/insulina/regra-intensificacao.ts` | 9 | Condutas de intensificação e metas de HbA1c, lidas no painel de resultado |
| `models/puericultura/oms/leitura.ts` | 5 | Mensagens de leitura da tabela, em boa parte internas |
| `models/gestacao/calculadora.ts` | 4 | Orquestração e recusas |
| `models/puericultura/elegibilidade.ts` | 4 | A recusa parcial do perímetro cefálico acima de 2 anos, com a localização citada ao lado |
| `models/insulina/regra-inicio.ts` | 4 | Conduta de início de insulinização |
| `models/insulina/calculadora.ts`, `models/puericultura/calculadora.ts` | 3 cada | Alertas e recusas, entre eles o da idade gestacional não informada |
| Demais onze arquivos | 1 a 2 cada | Recusas pontuais, mensagens de invariante, rótulos internos |

A tabela também expõe a razão de D-04 não poder ser afrouxada aqui: `oms/leitura.ts` mistura mensagem interna de invariante com texto que chega à tela, e `elegibilidade.ts` põe, lado a lado, a recusa autoral e a localização bibliográfica citada. Nenhuma regra de caminho separaria as duas; o mapa declarado separa. 🟡 — a contagem é aproximada, por descontar comentários com expressão regular; a exata continua vindo do gerador.

## 3. Como verificar uma norma de prosa

### 3.1 Ferramentas de lint de prosa: o estado real

**Vale** ([vale.sh](https://vale.sh/), [vale-cli/vale](https://github.com/vale-cli/vale)) é a referência da categoria e **passa no filtro de longevidade**: repositório atualizado em 24/07/2026, série 3.x corrente, organização por trás e adoção institucional documentada (a Grafana, entre outras, o roda em CI). Não há aqui, portanto, argumento de abandono. 🟢

Ainda assim, foi descartado para esta feature, e a razão é de adequação:

- **A norma é idiossincrática e em português.** As regras que importam — os três eixos da pontuação, o teto de um par de travessões por bloco, o travessão `—` contra o hífen `-`, o ponto médio como recurso tipográfico alheio aos eixos — não existem em pacote pronto de estilo. Seriam escritas do zero em YAML de Vale, com o mesmo esforço de escrevê-las em TypeScript.
- **É binário externo ao npm.** Instalação por Homebrew, Go ou download, fora do `package-lock.json`. Contra a reprodutibilidade temporal que o projeto exige: `clone → rodar` deixaria de depender só do lock file.
- **Não enxerga a distinção de classe.** Vale opera sobre arquivos de marcação e código-fonte com filtros; ensiná-lo a isentar a classe citação exigiria replicar nele o mapa de D-04, que já existe do lado do teste.

**textlint** foi considerado pela mesma razão e descartado antes: ecossistema de regras concentrado em inglês e japonês, com cobertura escassa de português, e o mesmo problema de duplicar a classificação.

Daí D-07: as regras mecânicas viram um arquivo de teste de vitest que lê o inventário classificado. Ele roda no gate que já existe, isenta a citação porque conhece a classe, e falha com mensagem que aponta a regra do guia. Se um dia a norma crescer a ponto de o teste ficar desconfortável, o Vale continua disponível e a decisão se reabre com o inventário já pronto para alimentá-lo.

### 3.2 O que é verificável por máquina, e o que não é

A separação importa porque promete demais quem diz que a norma inteira vira teste. Do que o `requirements.md` fixa:

| Regra | Verificável mecanicamente | Observação |
|---|---|---|
| Travessão é `—`, nunca `-` nem `--` | sim 🟢 | Comparação de caracteres |
| No máximo um par de travessões por bloco autoral | sim 🟢 | Contagem por literal |
| Nenhuma reticência ou exclamação em prosa de produto | sim 🟢 | Comparação de caracteres |
| Ponto médio ladeado por espaço simples, nunca em início ou fim de linha, nunca acumulado com vírgula ou travessão | sim 🟢 | Expressão sobre o entorno do `·` |
| Decimal com vírgula, espaço antes da unidade, percentual sem espaço | em parte 🟡 | Detectável onde o número aparece no literal; invisível quando é interpolado em tempo de render |
| Molde da mensagem de validação (`constatação: imperativo` com valor presente, imperativo puro com valor ausente) | em parte 🟡 | A forma se detecta pela presença de `: ` e por verbo inicial; a adequação ao caso exige leitura |
| Descrição da plataforma corresponde ao catálogo | sim 🟢 | D-05, comparação contra `CATALOGO` |
| Coesão parafrástica, progressão econômica, ausência de ornamento | **não** 🔴 | É julgamento; vive no guia como par antes/depois, não como teste |

O guia de RF-01 deve deixar essa fronteira explícita, para que ninguém confunda "a suíte passou" com "o texto está bom".

### 3.3 As duas famílias de asserção, e por que medir só uma não mede

A régua de RF-08 nasceu da forma como a suíte é escrita nas telas: consultas do Testing Library — `getByText`, `getByRole` com `name:`, `getByLabelText`, `toHaveTextContent`, `getByPlaceholderText`, `findByText`, `queryByText` —, que rendem 251 ocorrências em 14 arquivos. É a família visível, e por isso a que primeiro se conta.

Há uma segunda, e ela é justamente onde o acoplamento se adensa. `tests/unit/interface/formatar-plano.test.ts` não consulta o DOM: assevera a cadeia do plano copiável por `expect(texto).toContain(...)`, dezessete vezes, sobre literais como `"A dose exata é fixada pelo prescritor."`, `"Conduta: Reduzir 4 UI. Dose total: 26 UI/dia."` e `"Recomendações ao prescritor:"`. Todos nascem de `interface/calculadora/rotulos.ts` e das regras da insulina — as duas frentes que a revisão mais mexe.

O defeito da régua estreita não é subestimar: é **medir como intacto o arquivo que mais quebra**. Pior, é medir assim justamente na propriedade que RF-08 existe para garantir. Se alguém apagasse cinco das dezessete asserções para fazer a suíte passar, a contagem de saída continuaria batendo com a de entrada, e o critério aprovaria a entrega que ele deveria reprovar. É o mesmo modo de falha que a primeira auditoria encontrou em três verificadores, aparecendo agora num lugar em que ninguém o procurava — na medição, e não no teste. Daí D-19, e daí a regra que o roadmap §9 passou a enunciar: medição nova se confere contra o caso que ela deveria acusar. 🟢

## 4. Como provar que a citação foi preservada

O problema é de linha de base: para demonstrar que só dois literais de citação mudaram, é preciso ter registro do que eles eram antes. O projeto já resolveu esse problema uma vez, na feature 017, e a solução vale aqui: **congelar em JSON versionado e comparar**.

A diferença é que o congelamento da 017 (`scripts/congelar-casos-oraculo.mts` → `tests/apoio/casos-oraculo-puericultura.json`) depende de fontes em `referencias/`, pasta excluída do git. O inventário de D-02 não depende de nada externo: lê o próprio código. Roda em clone limpo, sem rede e sem PDF na mão.

### 4.1 Por que a linha de base não cabe no inventário

Esta seção afirmava, na primeira versão, que o inventário serviria também de linha de base. A auditoria mostrou que não pode, e a razão é temporal antes de ser técnica: **congelamento e linha de base parecem a mesma coisa e são opostos no tempo.** O congelamento diz "o texto de hoje é este, e alterá-lo tem de doer"; acompanha o presente e se atualiza por ato deliberado a cada revisão, que é justamente o que D-08 quer quando trata o `git diff` do inventário como sinal útil. A linha de base diz "o texto de ontem era aquele", e o seu valor inteiro está em não acompanhar nada: assim que se move, deixa de medir.

Fundidos num arquivo só, o segundo papel morre na primeira regeração, e morre em silêncio. O teste de RF-07 continuaria passando, comparando o estado corrente consigo mesmo, e a suíte verde deixaria de significar o que a feature oferece que ela signifique. Num aparato de verificação esse é o pior modo de falha que existe, porque um verificador que não pode reprovar é indistinguível, no relatório, de um verificador que aprovou.

Três saídas foram consideradas antes de chegar em D-14:

| Saída | Por que foi descartada |
|---|---|
| Bloco `linhaDeBase` preservado dentro do inventário, copiado adiante pelo gerador | Põe o gerador a carregar estado que ele não produziu, contra `MD-0008`, segundo o qual a idempotência é propriedade do texto emitido; e um defeito na cópia corromperia a linha de base sem sinal, dentro de um arquivo que ninguém inspeciona porque é gerado |
| Recuperar o estado anterior pelo `git log` do inventário | Transfere a prova para fora da suíte, contra o RNF de rastreabilidade, que exige a revisão auditável **sem** recorrer ao histórico; e um teste que depende do histórico do repositório não roda em clone raso |
| Não regerar o inventário, deixando-o como registro do estado anterior | Devolve as asserções literal a literal que D-08 descartou, e deixa o artefato mais consultado da feature descrevendo um texto que já não existe |

O que decidiu a favor do artefato separado, além de eliminar o modo de falha, foi perceber que ele **não é andaime**. Congelado em 27/07/2026, torna-se o guarda permanente do invariante "a citação é byte a byte, salvo dois casos declarados", com as duas exceções visíveis para sempre como exceções em vez de absorvidas na normalidade. O custo, uma disciplina de não regerar, é o mesmo que `casos-oraculo-puericultura.json` já cobra e que o projeto já paga sem atrito. Registrado em `MD-0018`.

**Achado que simplifica a execução.** A conferência desta sessão mostra que `casos-oraculo-puericultura.json` guarda apenas valores numéricos da OMS e do INTERGROWTH — suas chaves são `esquema`, `feature`, `acao`, `geradoPor`, `aviso`, `porQueExiste`, `consumidores`, `oms`, `intergrowth`. **Nenhum rótulo de classificação está lá.** O que o `requirements.md` §2.4 chamou de "oráculos congelados do domínio" são, na verdade, asserções literais em três arquivos de teste: 🟢

| Arquivo | Ocorrências dos dois rótulos |
|---|---|
| `tests/unit/dominio-puericultura/classificacao.test.ts` | 6 asserções + 1 comentário explicativo (linha 108) |
| `tests/unit/dominio-puericultura/fachada.test.ts` | 1 asserção (linha 59) |
| `tests/integration/interface/puericultura.test.tsx` | 1 asserção (linha 81) + 1 comentário (linha 80) |

Consequência prática: nenhum passo da feature exige reexecutar o congelador nem ter as fontes clínicas em mãos. Os comentários das linhas 108 e 80 justificam a concordância destoante como fidelidade à fonte e precisam ser reescritos junto com as asserções, sob pena de o código explicar o oposto do que faz.

## 5. O Primer e a camada de conteúdo que o projeto não adota

O projeto adotou o Primer integralmente na identidade visual (feature 004, adendo 004). O Primer também publica diretrizes de **conteúdo** ([primer.style/foundations/content](https://primer.style/foundations/content/), [primer/design](https://github.com/primer/design)), e é previsível que alguém, no futuro, proponha adotá-las por coerência com aquela decisão.

Registro aqui a razão de **não** as adotar, para que a proposta encontre resposta escrita: a orientação do Primer é tom informal, período curto, nível de leitura de sétima série e voz de produto — calibrada para uma plataforma de desenvolvimento em inglês, dirigida a público geral. A norma desta plataforma vem de outra origem declarada (`~/.claude/CLAUDE.md`, seção de estilo de escrita), é em português, e o leitor é o prescritor em consulta, para quem precisão terminológica pesa mais que simplicidade de leitura. As duas normas coincidem em economia e em voz ativa, e divergem em registro.

A adoção do Primer, portanto, permanece onde a 004 a colocou — tokens, componentes, espaçamento — e não se estende à prosa. 🟢

## 6. Padrões do próprio repositório que a feature reaproveita

Nada do que a feature constrói é forma nova no projeto. Cada peça tem precedente, e citá-lo é o que a torna retomável:

| Peça nova | Precedente | O que se herda |
|---|---|---|
| `scripts/inventariar-textos.mts` | `scripts/gerar-tabelas-oms.mts`, `scripts/congelar-casos-oraculo.mts` | Escrita atômica, falha ruidosa e localizada, idempotência com `git diff` vazio como sinal, cabeçalho que explica o problema que o script resolve |
| `tests/apoio/inventario-textual.json` | `tests/apoio/casos-oraculo-puericultura.json` | Dado versionado em `tests/apoio/`, com esquema declarado no próprio arquivo e consumidores nomeados |
| Teste de norma (RF-05) | `tests/unit/dominio-*/invariantes.test.ts` | Verificação de propriedade sobre um conjunto, e não caso a caso |
| Constante `NOTA_CORRECAO_DE_CONCORDANCIA` | `NOTA_PROVENIENCIA` e `REFERENCIAS` da 017 | Texto congelado no domínio, lido pela tela, que não reescreve nada (anti-drift) |
| Verificação da descrição contra o catálogo (RF-04) | `CATALOGO` como fonte única (D-07 da feature 007) | Anti-drift por teste, e não por disciplina de quem edita |
| `tests/apoio/citacao-linha-de-base.json` (D-14) | `casos-oraculo-puericultura.json` | Dado congelado versionado que serve de oráculo externo à implementação; a diferença é que este não se regera nunca, e o aviso no arquivo o declara |

### 6.1 Onde os verificadores moram, e por quê

Os quatro testes que a feature acrescenta vão para `tests/unit/textos/`, e não para `tests/contract/`, embora o de integridade do manifesto tenha vizinhança temática com o `cabecalhos.test.ts` que já vive lá. A razão é de execução: `vitest.config.ts` inclui `tests/unit/**`, `tests/integration/**` e `tests/regression/**`, e deixa `tests/contract/**` para `vitest.api.config.ts`, cujo cabeçalho declara que aqueles testes "fazem fetch contra um servidor de pé" e por isso "vivem fora do include da suíte padrão". Um teste que lê três campos de um JSON estático herdaria a dependência de build sem receber nada, e ficaria fora dos gates do plano, o que o faria parecer escrito e verde sem nunca ter rodado. Daí D-15. 🟢

## 7. Fontes

- [Vale — linter de prosa](https://vale.sh/) · [repositório](https://github.com/vale-cli/vale) — verificado ativo em 24/07/2026, série 3.x
- [Primer Foundations — Content](https://primer.style/foundations/content/) · [primer/design](https://github.com/primer/design) — diretrizes de voz e tom do design system adotado na camada visual
- `~/.claude/CLAUDE.md`, seção "Estilo de escrita" — norma de origem, e os três eixos da pontuação
- `_reversa_sdd/domain.md` §7 e §7.1 — invariantes de fonte única que a revisão não pode romper
- `_reversa_sdd/addenda/017-puericultura-crescimento.md` — origem dos rótulos citados
- `.harness/decisoes/MD-0014.md` (superado em parte) e `.harness/decisoes/MD-0015.md` — a arbitragem que autorizou a exceção

## 8. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-27 | Versão inicial gerada por `/reversa-plan` | reversa |
| 2026-07-27 | Segunda passagem: §4.1 registra por que a linha de base não cabe no inventário, com as três saídas descartadas (D-14, `MD-0018`), corrigindo a afirmação original de que o inventário serviria aos dois papéis; §6.1 registra a colocação dos verificadores na suíte padrão (D-15) | reversa |
| 2026-07-27 | Terceira passagem: §2.5 mede onde a prosa autoral de `models/**` de fato mora e corrige a suposição de que ela se concentrava nas validações — 18 literais dentro da fatia antiga contra 47 fora dela (D-16); §3.3 registra a segunda família de asserção, que a régua de RF-08 não via, e por que medir só a primeira aprovaria a remoção que o requisito proíbe (D-19) | reversa |
