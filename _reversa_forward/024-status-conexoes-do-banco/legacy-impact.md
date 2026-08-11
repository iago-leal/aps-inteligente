# Legacy impact — feature 024, o healthcheck passa a dizer quanto do banco está em uso

> Identificador: `024-status-conexoes-do-banco`
> Data: 2026-08-10
> Âncora: extração de legado (`_reversa_sdd/architecture.md`, `_reversa_sdd/code-analysis.md`,
> `_reversa_sdd/pages-api-v1-status/`), 4.ª re-extração, mais os adendos 015 a 023
> Ações executadas: 24 de 24. Quinze fecharam na passagem de codificação de 10/08; as nove restantes
> fecharam na passagem de reconciliação do mesmo dia, discriminada em "Ações fechadas na reconciliação"

O que esta feature muda no legado cabe numa frase: **a linha que a verificação de saúde já
percorria passa a trazer três colunas a mais**. A rota continua fazendo uma ida ao banco por
requisição, sob o mesmo teto e sem retentativa; o que cresce é a largura do que essa ida devolve, e
com ela a forma do valor que a rota publica. A feature 022 fez o healthcheck verificar o que
prometia; a 024 faz o que ele verifica virar informação legível.

Uma pendência bloqueante atravessou a entrega e foi desfeita antes do fecho: o nome dos três campos
no corpo publicado não era o nome que o contrato público fixa. O registro do defeito, da causa e da
decisão está na seção "Pendência resolvida", e vale a leitura porque a causa foi documental.

## Tabela de impacto

| Arquivo afetado | Componente | Tipo | Severidade | Delta |
|---|---|---|---|---|
| `infra/database.ts` | Módulo 14 (`infra`) | `regra-alterada` | **HIGH** | `saude()` deixa de devolver `{ ok: true }` e passa a devolver `LeituraDeSaude`, tipo novo exportado. A consulta vira quatro colunas numa ida, com `current_setting('max_connections')`, `count(*)` de `pg_stat_activity` filtrado por `datname = current_database()` e `current_setting('server_version')`. Três validações novas, todas com causa `consulta`, e sanitização da versão para o prefixo numérico |
| `infra/saude.ts` | Módulo 14 (`infra`) | `regra-alterada` | **HIGH** | O ramo íntegro de `EstadoDoBanco` passa de `{ estado: "integro" }` para a interseção `{ estado: "integro" } & LeituraDeSaude`, e `verificarBanco` espalha a leitura. O ramo degradado não muda, e é a assimetria que realiza a RN-02 por tipo |
| `pages/api/v1/status.ts` | Módulo 13 (`pages/api/v1/status`) | `delta-de-contrato-externo` | **HIGH** | Nenhuma linha executável muda (D-08): só o comentário de contrato do cabeçalho. O delta público chega pelo tipo do valor inserido sob `banco`, e é aditivo dentro de `/api/v1` |
| `_reversa_sdd/openapi/status.yaml` | contrato publicado (Grupo A) | `regra-alterada` | **HIGH** | `BancoIntegro` passa de uma para quatro propriedades, as três novas obrigatórias, com `additionalProperties: false` preservado nos dois ramos. O esquema valida o corpo real dos dois alvos, e os três exemplos do próprio documento. Os exemplos ainda tiveram versão e commit corrigidos, que vinham defasados da re-extração 4 |
| `scripts/conferir-producao.mts` | fora da árvore de módulos (operação) | `regra-alterada` | MEDIUM | Lê os três campos como opcionais, exibe `íntegro · 3/100 conexões` ou `ocupação desconhecida`, e reemite os campos no `--json`. Nada muda nos códigos de saída. Contra o alvo local desta entrega imprime `banco íntegro · 1/100 conexões`; contra um duplo do corpo anterior, `ocupação desconhecida`, com saída 0 |
| `tests/contract/api/v1/status.test.ts` | Módulo 13 | `regra-alterada` | MEDIUM | O ramo íntegro deixa de aceitar `toEqual({ estado: "integro" })`; entram quatro asserções novas (teto, contagem com piso e não-excedência, prefixo da versão, ausência estrutural no degradado). A denylist permanece intocada item a item |
| `tests/unit/infra/saude.test.ts` | Módulo 14 | `regra-alterada` | MEDIUM | O arquivo passa a exercitar **duas** unidades: `verificarBanco` sobre `saude()` duplicado, como antes, e `saude()` sobre o driver duplicado, alcançado por `vi.importActual`, onde vivem a validação das quatro colunas e a sanitização da versão |
| `tests/contract/infra/banco.test.ts` | Módulo 14 | `regra-alterada` | LOW | As três asserções `resolves.toEqual({ ok: true })` viram `conferirLeitura()`, que afere forma, piso um, não-excedência e prefixo numérico. Um teste novo compara o prefixo publicado com o `server_version` cru da imagem em uso |
| `README.md` | documentação | `regra-alterada` | LOW | A seção "Como verificar saúde" descreve o ramo íntegro de quatro chaves, declara os dois universos de medida e explica por que a contagem nunca vale zero |
| `.reversa/active-requirements.json` | governança do ciclo | `regra-alterada` | LOW | Estado da feature ativa. Está **fora** da lista de escopo declarada na tarefa, e o diff ainda reformatou `stages-completed` de linha única para vetor multilinha |
| `next-env.d.ts` | shell Next.js | `delta-de-dados` | LOW | Subproduto de ferramenta, não da entrega: o ponteiro migrou de `.next/types` para `.next/dev/types` durante a verificação. A reverter antes de qualquer commit |

Não foram tocados, e a ausência é resultado verificado por `git status`: `models/`, `interface/`,
qualquer tela, `.github/workflows/ci.yml` (o job de contrato já sobe os dois alvos desde a 022),
`.env.example` e `tests/apoio/inventario-textual.json`. O último é pendência, não escolha, e está
registrado como `O-24-03` no `regression-watch.md`.

`.reversa/_config/files-manifest.json` aparece modificado e **não pertence a esta feature**: já
constava do instantâneo de abertura da sessão, e o diff só acrescenta hashes de skills novas.

## Pendência resolvida: o corpo publicava `tetoDeConexoes`, o contrato exigia `teto_de_conexoes`

O corpo servido pelo alvo íntegro ao fim da codificação, colhido por `curl` contra
`postgres:17.10-alpine`, era este:

```json
"banco":{"estado":"integro","tetoDeConexoes":100,"conexoesAbertas":1,"versao":"17.10"}
```

Dos três campos novos, só `versao` chegava com o nome prometido, porque é o único que se grafa igual
nos dois moldes. A causa não foi descuido de implementação: foram três decisões escritas, cada uma
cumprida à risca, e conjuntamente impossíveis.

1. `interfaces/conexao-banco.md` §1 e `data-delta.md` §2 declaravam `LeituraDeSaude` em camelCase.
2. O §2 do mesmo contrato define o ramo íntegro como `({ estado: "integro" } & LeituraDeSaude)`.
3. A D-08 proíbe o handler de compor ou remapear, e `pages/api/v1/status.ts` insere `banco` inteiro.

Somadas, publicavam camelCase, contra o `snake_case` que `interfaces/http-get-api-v1-status.md`, o
`requirements.md` (RF-01, RF-02), o `openapi/status.yaml` e o `scripts/conferir-producao.mts` fixam.
O defeito era do documento, e não do executável, o que é precisamente o caso que o Princípio I
prevê: a spec é fonte de verdade, e spec errada se corrige por decisão registrada, jamais por
adaptação silenciosa do código ao engano.

A decisão está no roadmap como **D-12**: `LeituraDeSaude` declara os campos em `snake_case`, contra
a convenção do módulo, porque pela D-08 este tipo **é** a forma de fio, e não um tipo interno. A
alternativa, remapear em `infra/saude.ts`, foi descartada por contradizer o §2 do contrato interno e
por devolver ao adaptador a interpretação que a D-06 tirou dele.

O que se tocou para desfazê-la: os três campos em `infra/database.ts`, as chaves de
`tests/unit/infra/saude.test.ts` e de `tests/contract/infra/banco.test.ts`, e as duas declarações de
documento, cada uma agora acompanhada da razão da exceção. `infra/saude.ts` e `pages/api/v1/status.ts`
não mudaram uma linha, que é o sinal de que a D-08 sobreviveu intacta.

As três consequências observadas desapareceram, e a verificação foi refeita: os 31 testes de
contrato passam nos dois alvos, o corpo real valida contra `openapi/status.yaml` nos dois estados, e
`npm run status:conferir` imprime `banco íntegro · 1/100 conexões`. A janela ajudou: a cláusula de
versionamento de `http-get-api-v1-status.md` só proíbe renomear os campos a partir da publicação, e
a 024 ainda não foi publicada, de modo que o renome custou zero. Depois do deploy, custaria
`/api/v2`.

## Diff conceitual por componente

### Módulo 14 — `infra`

`saude()` era uma pergunta de sim ou não: `SELECT $1::int AS ok`, e o valor devolvido não carregava
informação alguma além da própria ausência de erro. Passa a ser leitura, e a leitura tem forma que
pode reprovar. As três validações novas são irmãs da que já existia sobre `ok`, e de propósito
compartilham a causa `consulta`: o vocabulário público de `banco.causa` é fechado, e uma causa
`estatistica` diria a quem lê o healthcheck algo que ele não pode acionar.

A escolha de `current_setting('server_version')` em lugar de `version()` é de privacidade, não de
conveniência. `version()` devolve `PostgreSQL 17.10 on aarch64-unknown-linux-musl…`, que casa com
`/postgres/i` da denylist verificada e ainda revela arquitetura e compilador. Medido nesta entrega,
a sanitização sustenta-se também contra imagem Debian, cujo `server_version` é
`17.10 (Debian 17.10-1.pgdg13+1)` e chega ao corpo como `17.10`.

`infra/saude.ts` mudou de natureza sem mudar de tamanho. Antes devolvia `{ estado: "integro" }` e
era **estruturalmente incapaz** de transportar qualquer coisa. Hoje espalha a leitura, de modo que
todo campo acrescentado a `LeituraDeSaude` passa a ser publicado sem uma linha de mudança na camada
HTTP. É a consequência estrutural mais consequente da entrega, e vive no `regression-watch.md` como
W012.

### Módulo 13 — `pages/api/v1/status`

Nada no executável. O handler já serializava `banco` inteiro, de modo que a forma do valor cresceu e
a do handler não. Isso é o que a D-08 quis, e é também o que transferiu para `infra/` a decisão de
o que atravessa a fronteira pública.

### Operação: o conferidor e o README

O conferidor ganhou a ocupação como razão `abertas/teto`, e nunca como percentual: os dois números
descrevem universos diferentes, o teto sendo do servidor e a contagem do banco corrente, de modo que
a divisão mentiria. O README carrega as duas ressalvas sem as quais o número engana quem investiga,
e a terceira, a de que a própria rota se conta.

## Preservadas

Regras 🟢 do legado que continuam intactas, conferidas nesta entrega:

| Regra | Origem | Como se conferiu |
|---|---|---|
| Privacidade por construção: nenhum dado clínico ou pessoal sai na resposta | `domain.md` §7.7 (ADR 0002, ADR 0008); RN-02 da 022 | Os 23 padrões das duas denylists aferidos sobre o corpo serializado nos estados íntegro, degradado e de tempo esgotado, contra imagem Alpine e contra imagem Debian: nenhum casamento |
| A denylist não perde item, e nenhuma aferição migra de corpo inteiro para campo | RN-05; D-07 | O diff não altera um byte entre `const DENYLIST = [` e o fecho de `DENYLIST_DE_CONEXAO`; os padrões novos são constantes acrescentadas acima delas |
| `infra/database.ts` é o único ponto de acesso ao banco, e `infra/saude.ts` o único importador de `saude()` em produção | `architecture.md` §1 (ADR 0003); W012 da 022 | Nenhum import novo de `infra/database` fora de `infra/` e dos testes |
| Banco sem esquema de negócio: nenhuma tabela, coluna ou migração | W003 e W004 da 003 | A consulta continua sendo leitura de catálogo e de configuração; `pg_stat_activity` é view do sistema |
| Uma ida ao banco por requisição, sem retentativa, sob teto imposto no servidor | RN-01; W005 e W006 da 022 | Quatro colunas numa linha só, com o parâmetro `$1` preservado; o teste de unidade afere `toHaveBeenCalledOnce` |
| 200 em todo estado do banco, com `no-store` e sem `Set-Cookie` | `MD-0031`; W003 da 022 | Cabeçalhos conferidos na resposta crua dos dois alvos |
| `CausaDeErroDeBanco` tem quatro valores | W004 da 022 | Nenhuma causa nova entrou; a reprovação de estatística usa `consulta` |
| O CI mantém três jobs, e o estado degradado é passo dentro do job de contrato | W014 da 022 | `.github/workflows/ci.yml` não foi tocado |
| Log estruturado com host mascarado, sem URL, sem credencial, sem SQL | RN-05; contrato da 003 | Linhas colhidas dos alvos degradado e de tempo esgotado. Uma exceção, em `O-24-07` |
| Ausência de campo no corpo é desconhecido, jamais erro de apuração | D-09 da 022 | `bancoOpcional` e `inteiroOpcional` devolvem ausência; os códigos de saída seguem respondendo à defasagem |

## Modificadas

| Regra | Origem | O que era | O que passa a ser |
|---|---|---|---|
| **`saude()` devolve `{ ok: true }`** | contrato da 003 §2; contrato da 022 §1 | Booleano de valor único, sem informação | `LeituraDeSaude`, com teto, contagem e versão. O tipo é exportado e vira parte do contrato interno |
| **O ramo íntegro de `EstadoDoBanco` tem uma chave** | contrato da 022 §2 | `{ estado: "integro" }` | `({ estado: "integro" } & LeituraDeSaude)`, com quatro chaves. O ramo degradado segue idêntico |
| **`banco` no corpo público tem uma chave quando íntegro** | contrato da 002 e da 022; `openapi/status.yaml` | `{"estado":"integro"}` | Quatro chaves, aditivas dentro de `/api/v1`. Renomear, remover ou reaninhar qualquer delas passa a exigir `/api/v2` |
| **A consulta de saúde é `SELECT $1::int AS ok`** | contrato da 003 §1 | Uma coluna | Quatro colunas na mesma ida, com o parâmetro preservado |
| **A validação da linha olha só `ok` e o número de linhas** | contrato da 022 §1 | Duas condições | Cinco condições, com a mesma causa `consulta`: `ok`, número de linhas, teto inteiro positivo, contagem inteira com piso um, versão com prefixo numérico |
| **`infra/saude.ts` não transporta valor** | `code-analysis.md` Módulo 20 | Traduzia desfecho em estado, e nada mais | Traduz desfecho em estado **e transporta a leitura**. Continua a não interpretar: não calcula proporção, não classifica ocupação |
| **`scripts/conferir-producao.mts` exibe só o estado do banco** | D-09 da 022 | `banco íntegro` | `banco íntegro · 3/100 conexões`, ou `ocupação desconhecida` quando os campos faltarem |

## Ações fechadas na reconciliação

As nove ações que a codificação deixou `[ ]` fecharam em 10/08, e o motivo de cada uma está em
`actions.md`, nas notas de execução. Em resumo, e com o que serviu de prova:

| Ação | Como fechou |
|---|---|
| T002 | O contrato `conexao-banco.md` foi editado, e a fonte de verdade voltou ao lugar: o §1 declara o tipo em `snake_case` e diz por quê |
| T003 | A linha de base verde foi reconstruída num worktree do `HEAD` anterior, `84738fe`: 73 arquivos, 935 testes. Depois da entrega, 73 e 941 |
| T005 | Decidida, e não executada como estava escrita: a D-12 fixa a forma embutida, porque exportar só para testar alarga a superfície pública do módulo em troca de nada |
| T015 | Verde: 31 de 31 na suíte de contrato, e as três conferências a olho confirmadas contra o alvo local |
| T017 | Provada por duas vias, contra a produção real ainda no SHA anterior e contra um duplo local servindo o corpo de uma chave |
| T019 | O corpo real valida nos dois estados, e os três exemplos do documento também |
| T021 | O caminho novo passou a logar, e a disciplina virou teste: causa, colunas reprovadas e host mascarado, sem URL, sem credencial e sem o texto da consulta |
| T022 | Portões completos, na ordem de custo: typecheck, lint, 941 de 941, build, 31 de 31 nos dois alvos, 61 de 61 no e2e e o inventário até a idempotência |
| T023 | Escopo conferido: nada de `models/`, nada de `interface/`, nenhuma tela, e o único arquivo de `pages/` é a rota, com mudança restrita ao comentário. `next-env.d.ts` voltou sozinho no `build` |

O inventário de textos merece nota, porque justificou a si mesmo: ao rodar depois da T020, a norma
de `docs/redacao.md` reprovou uma linha real do `README.md`, um ponto médio em fim de linha, que
seguiria para o repositório se o portão tivesse ficado de fora.
