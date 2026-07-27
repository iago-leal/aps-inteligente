# Cross-check: Revisão da linguagem dos textos da plataforma

> Identificador: `018-revisao-linguagem-textos`
> Data: `2026-07-27` (terceira auditoria, sobre os artefatos propagados pela terceira passagem de `/reversa-clarify`, `/reversa-plan` e `/reversa-to-do`)
> Artefatos analisados:
> - `_reversa_forward/018-revisao-linguagem-textos/requirements.md` (364 linhas, 11 RF, 10 RN, 17 cenários)
> - `_reversa_forward/018-revisao-linguagem-textos/roadmap.md` (168 linhas, 20 decisões)
> - `_reversa_forward/018-revisao-linguagem-textos/actions.md` (150 linhas, 62 ações)
> - Apoio consultado, sem alteração: `data-delta.md`, `investigation.md`, `onboarding.md`, `interfaces/{metadados-html,manifesto-pwa}.md`, `_reversa_sdd/{domain,architecture,code-analysis}.md`, e o próprio código do repositório
>
> **Este relatório é estritamente leitor. Nenhum dos artefatos analisados foi alterado.**
>
> Os identificadores `A0xx` são estáveis dentro deste relatório e **não** correspondem aos das auditorias anteriores, que este arquivo substitui por reescrita completa.

## Resumo

| Severidade | Findings |
|---|---|
| CRITICAL | 0 |
| HIGH | 1 |
| MEDIUM | 5 |
| LOW | 4 |
| **Total** | **10** |

Os quatro achados altos da rodada anterior foram resolvidos e verificados contra o código: a frente de reescrita passou a se declarar por camada e alcança os 17 arquivos de `models/**` que ficavam de fora (D-16, T058–T060); a verificação da descrição da plataforma ganhou duas formas, uma por superfície (D-17, T021); o par duplicado entre `interface/inicio/tela.tsx` e o manifesto se reescreve num ato só, com igualdade asseverada (D-18, T035, T056); e a régua de RF-08 passou a contar a família de asserção que não via, com ação própria para `tests/unit/interface/**` (D-19, T054, T061, T048). A cláusula de privacidade, que o contrato prometia sem forma, ganhou asserção fraca e ação (D-20, T057).

O achado desta rodada é de outra natureza, menor em número e específico em lugar: **a propagação alcançou o corpo dos artefatos e deixou para trás as contagens que os resumem.** O roadmap conta "quatro verificadores" em três pontos e "cinco" num quarto, quando o aparato tem sete; declara um artefato de dado novo em §6 e dois em §5; e descreve a `description` do manifesto como "alinhada ao catálogo" numa linha de tabela que D-17 desmente. Nenhuma dessas divergências altera o que será executado, porque o `actions.md` está correto e as documenta. Todas alteram o que será **conferido**, e uma delas é o critério que a primeira auditoria criou justamente para impedir verificador aceito sem prova.

## Findings

| ID | Severidade | Eixo | Descrição | Onde está |
|----|-----------|------|-----------|-----------|
| A001 | HIGH | Cobertura (1.2) e Consistência (2.1) | O roadmap conta **quatro** verificadores em três lugares e cinco num quarto; o aparato tem **sete**, desde que D-18 e D-20 acrescentaram o do par duplicado e o da privacidade. O critério de pronto de §10, que exige ver cada verificador reprovar, subconta em três | `roadmap.md` §3 (D-15), §5 (linha 90), §8 passo 3, §10 (linha 148) × `actions.md` T055 |
| A002 | MEDIUM | Consistência (2.1) | A linha do manifesto no delta arquitetural ainda resume a mudança como `description` "alinhada ao catálogo", leitura que D-17 substituiu pela forma negativa — não enumerar subconjunto próprio | `roadmap.md` §5 (linha 86) × D-17 × `interfaces/manifesto-pwa.md` §3 |
| A003 | MEDIUM | Consistência (2.1) | O delta no modelo de dados declara **um** artefato de dado novo; §5 do mesmo documento e o `data-delta.md` §3.1-bis declaram **dois** desde D-14 | `roadmap.md` §6 × §5 (linha 81) × `data-delta.md` §3.1-bis |
| A004 | MEDIUM | Sanidade do actions (4.1) | T046 não depende de T058, T059 nem T060, mas `e2e/calculadora.spec.ts` assevera texto de `models/insulina/regra-inicio.ts` e `e2e/puericultura.spec.ts` assevera a recusa de `models/puericultura/elegibilidade.ts` — ambos reescritos por elas | `actions.md` T046 × T058, T059 × `e2e/calculadora.spec.ts:35,42` × `e2e/puericultura.spec.ts:96` |
| A005 | MEDIUM | Cobertura (1.3) | T059 reescreve `models/puericultura/medidas.ts`, cuja prosa é asseverada por `tests/unit/dominio-puericultura/medidas.test.ts`; T062 não o alcança | `actions.md` T059, T062 × `tests/unit/dominio-puericultura/medidas.test.ts:49,50,67,68` |
| A006 | MEDIUM | Consistência (2.2) | L-14 descreve como pendente a propagação para o `roadmap.md`, o `actions.md` e os dois contratos, que já ocorreu; a fonte de verdade carrega afirmação vencida | `requirements.md` §10 (L-14) × `roadmap.md` §11 × `actions.md` §Histórico |
| A007 | LOW | Consistência (2.1) | O resumo do `actions.md` ainda fala em "as três frentes de reescrita da fase 3"; a fase 3 tem hoje dezenove ações em cinco frentes | `actions.md` §Resumo (parágrafo 1) |
| A008 | LOW | Sanidade do actions (paralelismo) | T056 e T057 dependem de T015 sem necessidade: leem arquivos diretamente e não consultam o inventário. A dependência os prende atrás de toda a cadeia de classificação | `actions.md` T056, T057 |
| A009 | LOW | Consistência (2.1) | O título do teste da linha 107 de `classificacao.test.ts` — "a transcrição preserva a concordância da fonte, destoante e tudo" — passará a afirmar o contrário do que o código faz; T040 nomeia as seis asserções e o comentário da linha 108, não o título. Achado repetido da auditoria anterior, não resolvido | `actions.md` T040 × `tests/unit/dominio-puericultura/classificacao.test.ts:107` |
| A010 | LOW | Consistência (2.1) | T062 vem marcada 🟡 derivando de D-16, que é 🟢, sem a justificativa que T059 traz nas observações de decomposição | `actions.md` T062 × `roadmap.md` D-16 |

## Impacto do finding alto

**A001 — a salvaguarda contra o modo de falha central da feature está subdimensionada em três.** O aparato de verificação cresceu em duas passagens: nasceu com quatro testes — norma, congelamento, citação e descrição da plataforma —, ganhou o quinto quando D-15 trouxe a integridade do manifesto para `tests/unit/textos/`, e ganhou o sexto e o sétimo agora, com o par duplicado (D-18) e a cláusula de privacidade (D-20). O `actions.md` acompanhou: T055 enumera as sete falhas induzidas, uma por verificador, e as observações de decomposição registram a divergência em voz alta. O roadmap não acompanhou, e o faz de quatro maneiras diferentes: D-15 diz "os quatro verificadores ... inclusive o de integridade do manifesto", o que já soma cinco na própria frase; §8 passo 3 diz quatro e os nomeia, omitindo três; §5 diz "três arquivos novos ... mais os dois", somando cinco; e §10 exige que "cada um dos quatro verificadores" seja visto reprovar.

O último é o que pesa. Aquele item de §10 não é ornamento de checklist: nasceu na primeira auditoria, quando três verificações prometidas apareceram sem capacidade de reprovar, e existe para que nenhum teste seja aceito verde sem antes ter sido visto vermelho. Um critério de pronto que pede quatro provas onde há sete verificadores admite ser marcado como cumprido com três testes jamais exercitados — entre eles o do par duplicado, que hoje passa por acidente favorável, e o da privacidade, que passa porque a cláusula ainda não foi reescrita. São exatamente os dois que mais precisam da prova pela falha, porque são os únicos que já nascem verdes. Direção para o humano: a correção pertence ao `roadmap.md`, em D-15, §5, §8 passo 3 e §10, e a via é `/reversa-plan`; o `actions.md` já está certo e não precisa de nada.

## O que foi verificado e passou

### Cobertura

- Os onze requisitos funcionais têm decisão correspondente, e os cinco acréscimos desta rodada se ligam a requisito existente: D-16 a RF-03, D-17 a RF-04, D-18 a RN-05 e RF-03, D-19 a RF-08, D-20 ao RNF de privacidade e a RF-04.
- As vinte decisões têm ao menos uma ação. As cinco novas: D-16→T058, T059, T060; D-17→T021; D-18→T035, T056; D-19→T054, T061, T048; D-20→T057.
- Os dezessete cenários Gherkin têm realização, incluídos os quatro novos: a home que nomeia o catálogo inteiro (T021, T033), o manifesto que não o descreve pela metade (T021, T035), a cláusula de privacidade que sobrevive (T057) e o literal duplicado que não vira divergente (T035, T056). O único cenário sem ação — "revisão que alteraria conteúdo clínico é recusada" — segue sem ela por decisão declarada nas duas pontas.
- A frente ampliada cobre o que a medição encontrou: os 17 arquivos de `models/**` fora de `validacao.ts` e `fonte-clinica.ts` estão repartidos entre T058, T059 e T060, sem sobra e sem sobreposição com T029, T030 e T031.
- `interface/inicio/tela.tsx` está integralmente coberto por T035: o arquivo tem exatamente dois literais próprios, o `titulo` e o `subtitulo`, e a ação trata dos dois — reescreve o segundo e declara o primeiro intocável por ser marca.
- A régua de RF-08 alcança agora o arquivo que a motivava: T061 tem `tests/unit/interface/formatar-plano.test.ts` por alvo, e T054/T048 o contam pela segunda família.

### Consistência

- A doutrina das duas formas de RF-04 está uniforme onde importa: RN-06, RF-04, os dois cenários, D-17, T021 e os dois contratos dizem a mesma coisa — positiva na home, negativa no manifesto. A exceção é A002, e é uma linha de tabela-resumo.
- O contrato do manifesto perdeu a contagem "vinte e uma posições" que contrariava L-13, e o dos metadados ganhou a forma declarada da asserção de privacidade.
- Os identificadores citados existem: D-01 a D-20 no roadmap, RF-01 a RF-11 e RN-01 a RN-10 no requirements, `MD-0012`, `MD-0014`, `MD-0015`, `MD-0017` e `MD-0018` em `.harness/decisoes/`, `W022` na linha 33 do `regression-watch.md` da 017.
- O refinamento do dimensionamento está declarado como refinamento, e não como descoberta: o roadmap §4 explica que a cifra caiu de 400–450 para 270–320 por desconto de comentários, e que a ampliação de D-16 não move a conta porque os 47 literais sempre estiveram no inventário — o que muda é quantos serão reescritos.

### Coerência com o legado

- Nenhuma decisão nova contradiz regra 🟢 de `_reversa_sdd/domain.md`. D-18 é a que mais se aproxima do limite, e o faz na direção certa: RN-05 proíbe **criar** segunda fonte, e a decisão trata de duplicação preexistente sem legitimá-la, asseverando a igualdade em vez de a dissolver.
- A justificativa de D-18 confere com o repositório: `public/manifest.webmanifest` é JSON estático servido de `public/`, sem caminho de importação a partir do TypeScript, o que sustenta o descarte da unificação técnica.
- A justificativa de D-17 confere: a `description` do manifesto tem hoje 78 caracteres, e os nomes das quatro seções de `CATALOGO` somam 63 antes de qualquer moldura.
- A medição que sustenta D-16 confere com o código: `models/insulina/regra-intensificacao.ts` traz nove literais candidatos, `models/puericultura/elegibilidade.ts` quatro, e os cinco `validacao.ts` somam dezoito.
- A de D-19 confere: `tests/unit/interface/formatar-plano.test.ts` assevera dezessete literais por `toContain`, nenhum deles alcançado pela régua das consultas do Testing Library.

### Sanidade do actions

- 62 ações, contagem idêntica à do cabeçalho; nenhum identificador reciclado nem duplicado — os sete novos seguem de T056 a T062, acima do maior ID anterior.
- Todas as dependências apontam para identificadores existentes: nenhuma dependência fantasma.
- Nenhum ciclo, conferido por travessia completa do grafo, inclusive nas dependências novas de T023, T039, T047, T048 e T055.
- Nenhum par `[//]` compartilha arquivo alvo, e a conferência foi feita ao nível de arquivo e não de coluna: T058 e T029 dividem o diretório `models/insulina/` sem dividir arquivo, o mesmo valendo para T059 × T030 e T060 × T029/T030.
- As cifras do cabeçalho conferem com a medição automática: 62 ações, 42 paralelizáveis, cadeia máxima de 16 nós — a mesma de antes, porque as frentes novas correm ao lado das existentes em vez de alongar o caminho crítico.
- Toda ação está posicionada no arquivo depois daquelas de que depende, apesar de os IDs já não ordenarem a execução; a observação de decomposição registra o fato e a conferência mecânica o confirma.
- As sete ações novas têm todas as sete colunas preenchidas e status `[ ]`, como as 55 anteriores.
