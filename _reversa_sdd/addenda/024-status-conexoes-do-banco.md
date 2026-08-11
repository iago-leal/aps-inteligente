# Adendo 024 — O status passa a dizer quanto do banco resta, e o nome do campo esteve em litígio

> Feature: `024-status-conexoes-do-banco`
> Data: `2026-08-10`
> Cenário: `legado`

## Vigência

Vigente desde 2026-08-10, e **parcial**, por três razões que este documento declara antes de
qualquer outra coisa, porque elas governam a leitura de tudo o que vem depois:

1. **O corpo publicado não é o corpo contratado.** Os campos saem em `tetoDeConexoes` e
   `conexoesAbertas`, e o contrato, o `requirements.md`, o `openapi/status.yaml` e o `README.md`
   fixam `teto_de_conexoes` e `conexoes_abertas`. A divergência é observada em execução, não
   deduzida, e está descrita na seção própria abaixo.
2. **A entrega não foi escriturada.** As 24 ações de `actions.md` permanecem `[ ]`, e
   `progress.jsonl`, `legacy-impact.md` e `regression-watch.md` não existem. Os watch items que
   a T024 abriria vão aqui como lista provisória, e não como referência a arquivo.
3. **Nada foi commitado nem publicado.** O código vive na árvore de trabalho, de modo que a
   produção segue servindo o corpo da feature 022, e a D-11 permanece sem resposta.

Resolvidos os três pontos, uma reexecução do `/reversa-sync` acrescenta seção de atualização ao
final, no molde do adendo 023, sem tocar no que está escrito acima dela.

> **Os três pontos foram resolvidos no mesmo 2026-08-10.** A vigência é **plena** a partir da seção
> "Atualização 2026-08-10", ao final deste documento, que registra o desfecho de cada um. Tudo o que
> se lê entre esta linha e aquela seção é o estado da entrega ao fim da codificação, preservado como
> registro histórico: onde as duas descrições divergirem, vale a atualização.

## Resumo da entrega

`GET /api/v1/status` dizia se o banco respondeu, e nada sobre quanto dele restava. A entrega
acrescenta ao ramo íntegro de `banco` o teto de conexões do servidor, a contagem de conexões
abertas no banco corrente e a versão, de modo que a distância até o limite se veja antes de virar
indisponibilidade. A referência de forma foi o `GET /api/v1/status` do TabNews, e a medida da
reprodução ficou decidida na sessão de esclarecimento de 2026-08-10: reproduz-se o conteúdo do
bloco de banco, em vocabulário próprio, sem aninhamento novo, sem `/api/v2`, sem o bloco de
servidor de aplicação e sem as medidas de latência.

O delta cabe em `infra/`. A consulta de saúde passou de `SELECT $1::int AS ok` para uma linha de
quatro colunas, com `current_setting('max_connections')`, a contagem de `pg_stat_activity`
filtrada por `datname = current_database()` e `current_setting('server_version')`, medida em 1 a
4 ms contra `postgres:17.10-alpine`. Uma ida só, como a RN-01 exige: o que cresce é a largura da
linha, não o número de viagens. `saude()` deixou de devolver um booleano de valor único e passa a
devolver a leitura; `EstadoDoBanco` aloja os três valores no ramo íntegro, de modo que a ausência
deles no ramo degradado é garantida pelo compilador e não por condicional. `pages/api/v1/status.ts`
não teve uma linha executável alterada, e o comentário de cabeçalho mudou por exigência de
rastreabilidade.

Portões medidos com o banco de pé: `typecheck` e `lint` verdes, **940 testes de unidade e
integração em 73 arquivos**, `build` em 11 rotas, e a suíte de contrato nos dois alvos em **31
testes, com 3 falhas**, todas em `tests/contract/api/v1/status.test.ts` e todas com a mesma causa,
que é o litígio de nomes. O alvo degradado passou inteiro, inclusive a ausência estrutural dos três
campos. O escopo foi conferido por `git status`: nada em `models/`, nada em `interface/`, nenhuma
tela, e o único arquivo de `pages/` é o da rota, com mudança restrita ao comentário.

## A divergência que a próxima leitura precisa encontrar primeiro

O corpo realmente servido, colhido por `curl` contra o alvo íntegro, é
`"banco":{"estado":"integro","tetoDeConexoes":100,"conexoesAbertas":1,"versao":"17.10"}`. Dos três
campos novos, só `versao` chega com o nome prometido, e apenas porque se grafa igual nos dois
moldes.

A causa não é descuido de implementação: são três decisões escritas, cada uma cumprida à risca, e
conjuntamente impossíveis. A §1 de `interfaces/conexao-banco.md` declara `LeituraDeSaude` em
camelCase, e `data-delta.md` §2 repete a declaração; a §2 do mesmo contrato define o ramo íntegro
como `({ estado: "integro" } & LeituraDeSaude)`; e a D-08 proíbe o handler de compor ou remapear,
com a frase "nenhuma linha executável da rota muda". Somadas, as três publicam camelCase contra o
`snake_case` que o contrato HTTP, o `requirements.md` e o esquema fixam. **O defeito é do documento,
e não do código**, e por isso nenhum conserto é possível sem editar artefato de contrato, o que é
decisão de projeto.

A divergência tem quatro manifestações, e três delas nenhum portão acusa:

| Onde | O que acontece |
|---|---|
| Suíte de contrato | Três testes reprovam, um deles por igualdade exata do conjunto de chaves do ramo íntegro |
| `openapi/status.yaml` | O corpo real **não valida** contra o esquema desta própria entrega: faltam três propriedades obrigatórias e sobram duas sob `additionalProperties: false`. Reprova o RF-09 e o critério de pronto do roadmap §10 |
| `scripts/conferir-producao.mts` | Lê `teto_de_conexoes` e imprime `banco íntegro · ocupação desconhecida` contra um deploy **da própria 024**. A tolerância da D-10, desenhada para deploys anteriores, absorve em silêncio a falha, e o comando sai com 0. A RF-11 nasceu inerte, e o script não tem teste algum |
| Guarda da RN-02 | O teste que prova a ausência dos campos no ramo degradado percorre a lista em `snake_case` e passaria mesmo que o ramo publicasse `tetoDeConexoes: 0`. Quem segura a regra hoje é a asserção herdada da 022, que exige as chaves exatamente iguais a `["causa","estado"]` |

Custo medido de cada saída, para quem for decidir. **Renomear os três campos de `LeituraDeSaude`**
toca quatro linhas de produção em `infra/database.ts`, as chaves de dois arquivos de teste e dois
documentos da feature; preserva a D-08 intacta e deixa `EstadoDoBanco` serializável sem tradutor.
**Remapear em `infra/saude.ts`** contradiz a §2 do contrato interno e não toca teste algum. A
janela importa: a cláusula de versionamento do contrato HTTP só proíbe o renome "a partir desta
entrega", de modo que, enquanto a 024 não for publicada, o renome é livre; depois, custa `/api/v2`.

## O que esta entrega tem de estrutural, além da divergência

**A rota passou a publicar metadados de infraestrutura que a guarda de privacidade não alcança.**
A denylist foi conferida sobre o corpo serializado em três alvos, incluindo uma imagem Debian criada
para o exame, e os 23 padrões saem limpos nos dois estados, também na forma `snake_case`. A
sanitização da versão sustenta-se ponta a ponta: `17.10 (Debian 17.10-1.pgdg13+1)` chega ao corpo
como `17.10`, e a cadeia de `version()` reprova por inteiro, degradando em vez de publicar. O que
escapa da lista é de outra natureza. `conexoes_abertas` é sensor público, em tempo real e sem limite
de taxa, da presença de terceiros no banco: com seis sessões alheias abertas, o corpo passou de 1
para 7. Consultado em laço, ele produz justamente a série temporal que a ADR 0007 decidiu não
guardar. E `versao` publica o nível de correção exato do servidor, que a D-09 tornou obrigatório no
ramo íntegro, de modo que retirá-lo depois será mudança incompatível.

**A D-08 promoveu um tipo de `infra/` a contrato público.** Antes da 024, `saude()` devolvia
`{ ok: true }` e era estruturalmente incapaz de transportar qualquer coisa; hoje `verificarBanco()`
devolve `{ estado: "integro", ...leitura }` e o handler insere o objeto inteiro. Todo campo que
alguém acrescente a `LeituraDeSaude` por conveniência de depuração passa a ser publicado sem uma
linha de mudança na camada HTTP e sem que ninguém precise abrir o contrato. A única guarda restante
é a asserção de conjunto de chaves da suíte de contrato, que exige servidor de pé.

**A única degradação sem rastro de log é a que esta feature criou.** A reprovação de formato das
estatísticas lança `ErroDeBanco` fora de `query()`, de modo que não passa por `registrar()`, e
`infra/saude.ts` a converte em valor sem `console.error`. Toda outra causa de degradação deixa linha
estruturada. O cenário que a RN-03 nomeia como o mais grave, papel de conexão sem permissão de
leitura das estatísticas, produziria degradação perpétua indistinguível de queda do banco, sem uma
linha que diga qual coluna reprovou.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/architecture.md` | §2, Containers e componentes | — | Sem impacto. O container 2 segue devolvendo **seis** chaves na raiz, e o crescimento é do valor de uma delas. A leitura "com I/O", que a 022 instalou, permanece exata |
| `_reversa_sdd/architecture.md` | §4, Integrações externas | delta-de-contrato-externo | A linha da Neon diz "só `SELECT $1::int AS ok`", e a consulta passou a ser uma linha de quatro colunas, com `max_connections`, contagem de `pg_stat_activity` e `server_version`. A coluna "dado clínico: não" permanece verdadeira, e o teto de 3.000 ms e a frequência por requisição não mudaram |
| `_reversa_sdd/architecture.md` | §4, Integrações externas | delta-de-contrato-externo | Onde se lê que `GET /api/v1/status` devolve seis chaves, as seis permanecem, e o `banco` do ramo íntegro passa de **uma** chave para **quatro**. O acréscimo é aditivo e cabe em `/api/v1` pela regra que o próprio contrato escreveu para si |
| `_reversa_sdd/architecture.md` | §5, Qualidade e testes | regra-alterada | A cifra de 67 arquivos e 816 testes está duplamente defasada: o adendo 023 a levou a 73 arquivos e 920 testes, e esta entrega a leva a **940** nos mesmos 73 arquivos. A suíte de contrato passa de 26 para **31** testes, com o alvo duplo e a estrutura do job de CI inalterados: o arranjo da 022 serviu esta feature sem uma linha de mudança |
| `_reversa_sdd/code-analysis.md` | Módulo 19, `pages/api/v1/status` | delta-de-contrato-externo | A linha do campo `banco`, que descreve `{estado:"integro"}` ou `{estado:"degradado", causa}`, está superada no primeiro ramo. Permanecem exatos o `async`, as seis chaves da raiz, o 200 em todo estado, o `no-store` e o 405 antes de qualquer I/O. O módulo **não teve linha executável alterada**, e a razão é estrutural: ele insere o valor de `verificarBanco()` inteiro sob a chave `banco` |
| `_reversa_sdd/code-analysis.md` | Módulo 20, `infra` | contrato-alterado | `saude()` deixa de devolver `{ ok: true }` e passa a devolver `LeituraDeSaude`, tipo exportado com `tetoDeConexoes`, `conexoesAbertas` e `versao`. `EstadoDoBanco` aloja a leitura no ramo íntegro por interseção. O módulo cresce de **326 para 405 LOC** entre os dois arquivos |
| `_reversa_sdd/code-analysis.md` | Módulo 20, `infra` | regra-nova | A validação de `saude()` ganha três verificações irmãs da que já existia, todas com causa `consulta`: teto inteiro positivo, contagem inteira com piso um, versão com prefixo numérico. `CausaDeErroDeBanco` **não** ganha causa nova, e isso é decisão registrada, porque o vocabulário público é fechado. Registre-se que essa reprovação é a única que não passa por `registrar()`, de modo que degrada sem log |
| `_reversa_sdd/code-analysis.md` | Módulo 20, `infra` | regra-nova | A versão sai de `current_setting('server_version')` e **jamais** de `version()`, sanitizada pelo prefixo numérico ancorado no início. A cadeia completa nomeia produto, arquitetura e compilador, e casaria com `/postgres/i` da denylist. A ausência de prefixo reprova a leitura em vez de publicar valor duvidoso |
| `_reversa_sdd/code-analysis.md` | Módulo 21, `scripts` | regra-alterada | `conferir-producao.mts` passa de 362 para 413 linhas e ganha a ocupação na segunda linha da saída, no molde `abertas/teto` e nunca como percentual, porque os dois números descrevem universos diferentes. A leitura dos campos é opcional, no molde da D-09 da 022. **Hoje o campo lido não é o campo publicado**, de modo que a funcionalidade existe e não se observa |
| `_reversa_sdd/data-dictionary.md` | `EstadoDoBanco` (`saude.ts`) | delta-de-dados | O ramo íntegro deixa de ser `{estado:"integro"}` e passa a carregar teto, abertas e versão. O ramo degradado é idêntico byte a byte. A assimetria é o mecanismo da RN-02, e não efeito colateral |
| `_reversa_sdd/data-dictionary.md` | `ErroDeBanco` | — | Sem impacto. As quatro causas permanecem, com o mesmo significado. O que muda é o número de motivos que levam a `consulta`, que passa de um a quatro |
| `_reversa_sdd/data-dictionary.md` | API, `GET /api/v1/status` | delta-de-contrato-externo | A linha do campo `banco` descreve o ramo íntegro com uma chave, e ele passa a ter quatro. As seis chaves da raiz, o 200 em todo estado, o `no-store` e o 405 antes de I/O permanecem exatos |
| `_reversa_sdd/openapi/status.yaml` | `components.schemas` e exemplos | **já atualizado nesta entrega** | `BancoIntegro` ganhou os três campos como **obrigatórios** (D-09), com `additionalProperties: false` preservado nos dois ramos, e os exemplos `integro` e `local` passaram a trazê-los. Ressalva de peso: **o esquema não valida o corpo real** enquanto o litígio de nomes existir. Registre-se ainda que os exemplos carregam `versao: "1.0.0"` contra o `0.1.0` do manifesto e um `commit` de sete caracteres onde a descrição promete quarenta, defasagem herdada da re-extração nº 4 |
| `_reversa_sdd/pages-api-v1-status/requirements.md` | RF-01 e RN-04 | delta-de-contrato-externo | O RF-01 fixa as seis chaves, e elas permanecem. O que falta declarar é o conteúdo do ramo íntegro de `banco`, hoje descrito só pelo par estado e causa da RN-04. O Gherkin da seção 7 afere `banco.estado é "integro"` e nada além |
| `_reversa_sdd/pages-api-v1-status/contracts.md` | corpo de exemplo e tabela de estados | delta-de-contrato-externo | Documenta `"banco": { "estado": "integro" }` de uma chave só, nas linhas 31 e 47. O cabeçalho do `openapi/status.yaml` declara espelhar este arquivo, e o espelho quebrou nesta entrega |
| `_reversa_sdd/inventory.md` | Superfície de arquivos | regra-alterada | Nenhum arquivo novo entra. Mudam medidas: `infra/` passa de **326 para 405 LOC**, `scripts/conferir-producao.mts` de 362 para 413 linhas, e a contagem de testes sobe. A afirmação da seção de dados, "a consulta é `SELECT $1::int AS ok`", está superada. `pages/api/v1/status.ts` passa de 57 para 66 linhas, e o crescimento é inteiramente de comentário |
| `_reversa_sdd/traceability/spec-impact-matrix.md` | mapa de dependências e linha `api+infra` | — | Sem impacto de forma. Os dois saltos permanecem, com `infra/saude.ts` entre a Function e o banco, e a linha `api+infra` segue com `∅` em todos os domínios clínicos e telas, **verificado por `git status` nesta entrega**, e não presumido |
| `_reversa_sdd/adrs/0008` | Rota pública sem dado clínico | regra-alterada | A ADR permanece válida e a guarda continua comportamental. O que muda é o que a guarda não alcança: a rota passou a publicar metadados de infraestrutura, a saber contagem de conexões e nível de correção do servidor, que nenhum padrão da denylist proíbe e que não são dado clínico nem pessoal. A regra de ouro herdada da 022, "o que o log mascara o corpo não revela", é silenciosa aqui, porque nada disso é mascarado em log algum |
| `_reversa_sdd/adrs/0007` | Telemetria nula, fase 1 | regra-alterada | A ADR permanece válida quanto ao que a plataforma **guarda**, e ganha uma ressalva quanto ao que ela **expõe**: uma medida instantânea publicada em rota pública, sem cache e sem limite de taxa, permite a terceiros construir a série que a plataforma decidiu não construir |
| `_reversa_sdd/adrs/0020` | Dependência não essencial não governa o código HTTP | — | Sem impacto, e a entrega a **exercita**: o alvo degradado responde 200 com `{estado:"degradado","causa":"conexao"}`, idêntico ao de antes, e a ocupação, por alta que esteja, não altera o código |
| `_reversa_sdd/questions.md` | premissas 🟡 | regra-nova | Duas premissas nascem e não constam da consolidação: a contagem publicada inclui a própria requisição, de modo que o piso é um e "1 conexão aberta" significa banco ocioso e não banco vazio; e o teto publicado é o do servidor alcançado, que pode não ser a instância de cálculo se houver agrupador de conexões no caminho (D-11, 🟡) |
| `_reversa_sdd/gaps.md` | dívidas | regra-alterada | A dívida de formatação segue crescendo por conta própria: `prettier --check` reprova hoje **667 arquivos**, e nenhum deles foi tocado por esta feature. O comando não é portão do CI |

Nenhum impacto em `erd-complete.md`: o banco continua sem esquema de negócio, sem tabela, sem
coluna e sem migração. A feature **lê** metadados que o servidor já mantém sobre si mesmo, e nada
persiste. Nenhum impacto em `domain.md`, porque nenhum unit clínico foi tocado, e o invariante de
privacidade por construção permanece verdadeiro no que afirma, com a ressalva de alcance registrada
na linha da ADR 0008 acima.

## Regras sob vigilância

**`regression-watch.md` não existe**, de modo que a lista abaixo é o que a T024 abriria, mais o que
as verificações desta entrega acrescentaram. Ela vale como registro provisório até que o arquivo
seja escrito, e os identificadores são deste adendo.

Os dois que a feature já previa:

- **V-01, o universo do teto (D-11, 🟡).** Lido `teto_de_conexoes` em produção, valor na casa da
  centena baixa confirma que a rota fala com a instância de cálculo e sobe a decisão a 🟢; valor na
  casa dos milhares indica agrupador de conexões no caminho, e então a ressalva da RN-08 deixa de ser
  precaução e vira o fato central a documentar. O campo publicado é a própria resposta à pergunta.
- **V-02, o falso positivo de `/54(32|33)/` (D-07).** A denylist é aferida por subcadeia sobre o
  corpo inteiro, de modo que um teto que contivesse `5432` reprovaria a suíte sem vazamento algum.
  Verificado por varredura: 5432, 5433, 15432, 54320 e 54331 reprovam; 100, 450 e 901 passam. A
  guarda permanece intocada de propósito, e o risco é registrado em vez de acomodado.

Os que as verificações acrescentaram:

- **V-03, o litígio de nomes.** É o item de maior severidade, e cai no instante em que um dos
  artefatos de contrato for editado. Enquanto viver, três coisas o mascaram: a tolerância do
  conferidor, a guarda da RN-02 que percorre a lista errada, e a suíte de unidade, que assevera
  positivamente os nomes de hoje em dois arquivos.
- **V-04, `LeituraDeSaude` como conduto.** Campo acrescentado ao tipo chega ao corpo público sem
  mudança na camada HTTP. Vigiar que o conjunto de chaves do ramo íntegro permaneça exatamente
  quatro, e que a asserção que o afere não seja afrouxada.
- **V-05, a reprovação de estatística sem log.** É a única causa de degradação que não deixa linha
  estruturada. Sob a consequência aceita da RN-03, ela produziria degradação perpétua sem dizer qual
  coluna reprovou.
- **V-06, a denylist nunca aferida contra produção.** O job de contrato roda contra o servidor local
  e contra um alvo sintético inalcançável. A sanitização da versão está provada contra Alpine e
  Debian, e jamais contra a cadeia que o servidor gerenciado devolve. Como a reprovação degrada em
  vez de publicar, o residual é de disponibilidade, e não de vazamento.
- **V-07, a RF-11 sem teste.** `scripts/conferir-producao.mts` não é coberto por unidade, integração
  nem e2e, de modo que a única funcionalidade da entrega voltada ao operador não tem portão algum.

Duas observações sem peso de regressão. A primeira: a T005 manda extrair a interpretação da linha
para função pura **exportada**, e o código a manteve embutida em `saude()`, com dois auxiliares
privados, de modo que a T010 foi realizada em `tests/unit/infra/saude.test.ts` por
`vi.importActual`, e não no arquivo que o plano fixou. Funciona, está verde, e o plano discorda do
código quanto ao arquivo e à superfície exportada. A segunda: `next-env.d.ts` aparece modificado na
árvore por subproduto de ferramenta, com o ponteiro migrando de `.next/types` para `.next/dev/types`,
e há de ser revertido antes de qualquer commit.

## Fontes

- `_reversa_forward/024-status-conexoes-do-banco/requirements.md`
- `_reversa_forward/024-status-conexoes-do-banco/roadmap.md`
- `_reversa_forward/024-status-conexoes-do-banco/investigation.md`
- `_reversa_forward/024-status-conexoes-do-banco/onboarding.md`
- `_reversa_forward/024-status-conexoes-do-banco/data-delta.md`
- `_reversa_forward/024-status-conexoes-do-banco/actions.md`
- `_reversa_forward/024-status-conexoes-do-banco/interfaces/http-get-api-v1-status.md`
- `_reversa_forward/024-status-conexoes-do-banco/interfaces/conexao-banco.md`
- `git diff` de `infra/database.ts`, `infra/saude.ts`, `pages/api/v1/status.ts`,
  `scripts/conferir-producao.mts`, `README.md`, `_reversa_sdd/openapi/status.yaml` e das três
  suítes tocadas, mais os corpos colhidos por `curl` nos alvos íntegro e degradado
- Microdecisões `MD-0031` e `MD-0032`, hoje cartões 31 e 32 do quadro

**Ausentes por não terem sido escritos:** `progress.jsonl`, `legacy-impact.md` e
`regression-watch.md`. `.reversa/active-requirements.json` declara o estágio `plan`, e não `coding`.

---

## Atualização 2026-08-10 — o litígio de nomes fechado, e a entrega escriturada

Os três pontos que tornavam esta vigência parcial deixaram de valer no mesmo dia, e por trabalho, não
por reinterpretação.

**1. O corpo publicado passou a ser o corpo contratado.** A decisão está no roadmap da feature como
**D-12**: `LeituraDeSaude` declara os campos em `snake_case`, contra a convenção `camelCase` do
módulo, porque pela D-08 este tipo **é** a forma de fio, e não um tipo interno — o handler publica o
valor inteiro, de modo que os nomes do tipo são os nomes do corpo. A alternativa registrada,
remapear em `infra/saude.ts`, foi descartada por contradizer a §2 do contrato interno e por devolver
ao adaptador a interpretação que a D-06 tirou dele. Tocaram-se três campos em `infra/database.ts`,
as chaves de dois arquivos de teste e as duas declarações de documento, cada uma agora com a razão
da exceção escrita ao lado. `infra/saude.ts` e `pages/api/v1/status.ts` não mudaram uma linha, que é
o sinal de que a D-08 sobreviveu intacta.

O corpo servido hoje pelo alvo íntegro:
`"banco":{"estado":"integro","teto_de_conexoes":100,"conexoes_abertas":1,"versao":"17.10"}`.

Com ele caem, uma a uma, as quatro manifestações da tabela acima: a suíte de contrato fecha em 31 de
31 nos dois alvos; o corpo real valida contra `openapi/status.yaml` nos dois estados, e os três
exemplos do próprio documento junto; `npm run status:conferir` imprime `banco íntegro · 1/100
conexões`; e a guarda da RN-02, que era tautológica, passou a valer de fato. O **V-03** desta lista
está encerrado.

**2. A entrega foi escriturada.** As 24 ações de `actions.md` estão `[X]`, com a prova de cada uma
nas notas de execução, e `progress.jsonl`, `legacy-impact.md` e `regression-watch.md` existem. Os
itens provisórios V-01 a V-07 deste adendo têm agora endereço definitivo: V-01 é o **W013**, V-02 é
o **W014**, V-04 é o **W012**, e V-06 e V-07 seguem como observações da feature. O V-05 foi quitado,
e não migrado: a reprovação de estatística fora de formato passou a emitir linha estruturada antes
de lançar, com causa `consulta`, host mascarado e as colunas reprovadas, jamais os valores, e a
disciplina virou teste que afere também a ausência de URL, credencial e texto de consulta.

**3. Nada foi commitado nem publicado, e isto permanece.** O código segue na árvore de trabalho, de
modo que a produção continua servindo o corpo da feature 022 e a **D-11 segue sem resposta**: o
`W013` só se lê depois do deploy.

### Números que substituem os do "Resumo da entrega"

| Portão | Antes desta atualização | Agora |
|---|---|---|
| `npm test` | 940 em 73 arquivos | **941 em 73 arquivos**, contra 935 na linha de base do `HEAD` anterior, reconstruída em worktree |
| `npm run test:api` | 31 testes, **3 falhas** | **31 de 31**, nos dois alvos |
| `npm run test:e2e` | não executado | **61 de 61** |
| Inventário de textos | não executado | **1259 literais**, idempotente. Reprovou uma linha real do `README.md`, um ponto médio em fim de linha, corrigida por refluxo |
| Validação contra o `openapi` | reprovava no alvo íntegro | valida nos dois alvos e nos três exemplos |

### Correções em artefatos da extração, já aplicadas

- `_reversa_sdd/openapi/status.yaml`: os exemplos passaram a trazer `versao: "0.1.0"`, que é a do
  manifesto, e `commit` de quarenta caracteres, que é o que a descrição do campo promete. A citação
  de regra na descrição de `versao` corrigiu-se de RN-02 para **RN-06**, que é a regra da
  sanitização. O esquema em si não mudou nesta passagem.
- A linha do Módulo 20 na tabela de impacto acima nomeia o tipo em camelCase: leia-se
  `teto_de_conexoes`, `conexoes_abertas` e `versao`.

Permanece pendente, e fora do escopo desta feature, o que a tabela já registrava:
`_reversa_sdd/pages-api-v1-status/contracts.md` segue documentando `"banco": { "estado": "integro" }`
de uma chave só, e só a re-extração reconcilia. O `next-env.d.ts` voltou sozinho ao conteúdo
versionado durante o `npm run build`.
