# Investigação: o que sustenta as decisões do roadmap 022

> Identificador: `022-status-healthcheck-e-deploy`
> Data: `2026-07-28`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. O achado que originou a feature

🟢 A busca por importadores de `infra/database.ts` em todo o repositório devolve um só arquivo, e
ele é um teste (`tests/contract/infra/banco.test.ts`). O handler `pages/api/v1/status.ts` tem
vinte e quatro linhas, nenhuma delas de I/O, e um único commit no histórico, o da feature 002; a
feature 003, que trouxe o banco, jamais o alterou.

O ponto que merece registro não é o defeito, e sim como ele sobreviveu a três extrações. A
`architecture.md` afirma o vínculo em três lugares — §1, §2 e §4 — e nenhum deles é falso como
**intenção**: o banco de fato existe só para o healthcheck, e não guarda dado clínico. O que a
extração não checou é se alguém chama. A lição, anotada para a re-extração nº 4: afirmação da forma
"X é usado só por Y" é verificável por grafo de importação, e vale checá-la mecanicamente em vez de
lê-la do propósito declarado no cabeçalho do módulo.

## 2. Como se impõe um teto de tempo a uma consulta com `pg`

Três mecanismos existem, e eles diferem no que acontece com a consulta depois que o chamador
desiste. A diferença é a razão de D-03.

| Mecanismo | Onde roda | Cancela a consulta | Estado da conexão depois |
|---|---|---|---|
| `Promise.race` no chamador | processo Node | não | ocupada até o servidor terminar; conexão consumindo o pool depois de a resposta ter saído |
| `query_timeout` do `pg` | cliente | não | o cliente devolve erro e ignora o resultado tardio; a consulta segue viva no servidor |
| `statement_timeout` do Postgres | servidor | **sim** | o servidor aborta e responde `57014`; a sessão fica utilizável |

🟢 Evidência para a segunda linha, lida na cópia instalada (`pg` 8.22.0): em
`node_modules/pg/lib/client.js:660` o valor de `query_timeout` vem de `config.query_timeout ||
this.connectionParameters.query_timeout` — logo, **é parametrizável por chamada**, o que era a
dúvida inicial. Mas o que ele faz ao expirar, nas linhas seguintes, é criar um `Error("Query read
timeout")`, entregá-lo ao `callback`, substituir o `callback` por uma função vazia e tirar a
consulta da fila local. Nada é dito ao servidor. É temporizador de leitura, não cancelamento.

🟢 O `pg` também aceita `statement_timeout` no nível de configuração da conexão
(`node_modules/pg/lib/connection-parameters.js:121` e `client.js:549`), e nesse caso o valor viaja
nos parâmetros de inicialização da sessão. Isso resolve o caminho quente sem custo, mas fixa o teto
para toda a vida da conexão.

🟢 Para variar o teto por chamada sem abrir mão do cancelamento, resta `SET statement_timeout`. Como
`SET` não aceita parâmetro de vínculo, e como o contrato da 003 exige consulta sempre parametrizada,
a forma correta é `SELECT set_config('statement_timeout', $1, false)`, que é a função equivalente e
aceita parâmetro. O terceiro argumento `false` diz "vale para a sessão", e não só para a transação.

🟡 Custo: um round-trip a mais quando o teto pedido difere do padrão. Por isso D-03 emite o
`set_config` apenas nesse caso, e deixa o caminho de produção com o teto que já viajou no startup.

### Consequência para a classificação de erro

🟢 O cancelamento por `statement_timeout` chega ao driver como erro com `code` `57014`
(`query_canceled`). O `CODIGOS_DE_CONEXAO` de `infra/database.ts` não o contém, de modo que hoje ele
cairia em `consulta` — o mesmo balde de "SQL inválido". Daí a quarta causa de D-02. O estouro na
fase de conexão é outro caminho: chega como `ETIMEDOUT`, ou como a mensagem "timeout exceeded when
trying to connect" que o módulo já reconhece, e hoje é classificado `conexao`. Ambos passam a ser
`tempo_esgotado` quando o teto for a razão da parada, porque é o tempo, e não a recusa, que os
explica.

## 3. Padrões públicos de healthcheck, e por que não adotamos o formato canônico

🟡 Existe um esboço de padronização na IETF para respostas de verificação de saúde de APIs, com
media type `application/health+json` e um campo `status` de três valores (`pass`, `warn`, `fail`),
mais um mapa `checks` por dependência. É um `draft`, não um RFC publicado, e a memória sobre o
número da versão corrente não é confiável o bastante para citá-lo com precisão aqui.

O formato foi considerado e não adotado, por três razões, e todas dizem respeito ao que já existe:

1. Adotá-lo exigiria trocar o media type e reorganizar a raiz do corpo, isto é, **mudança
   incompatível**, que o contrato da 002 manda levar para `/api/v2`. O ganho seria interoperabilidade
   com monitores genéricos que o projeto não usa.
2. O terceiro estado, `warn`, não tem referente aqui: o banco responde ou não responde.
3. O vocabulário do corpo é em português, coerente com `atualizado_em`, `versao` e `commit`. Um
   `status: "pass"` no meio deles seria mistura sem contrapartida.

🟢 O que se aproveita do padrão é a ideia que sustenta `MD-0031`, e que ele já praticava: a resposta
de um healthcheck deve responder **por dependência**, no corpo, e o código HTTP não é o lugar de
codificar a gravidade de cada uma.

## 4. Como datar um deploy sem consultar o painel do provedor

🟢 As variáveis de ambiente do provedor cobrem a identidade do que está publicado — o SHA do commit,
a referência do branch, o identificador do deploy — e não a **data** em que ele subiu. O commit tem
data, mas ela responde a outra pergunta: quando alguém escreveu, não quando aquilo passou a ser
servido. Entre as duas há o intervalo em que o código esperou pelo push e pelo CI.

🟢 O instante que responde exatamente à pergunta é o do build, e a forma de congelá-lo é a chave
`env` do `next.config.ts`, que faz substituição estática no bundle em tempo de build. A chave
continua no esquema de configuração do Next 16 instalado
(`node_modules/next/dist/server/config-schema.js:542`).

🟡 O que não se verificou sem executar um build é se a substituição alcança o bundle da rota de API
sob Turbopack. Daí o campo ser `string | null` e o teste de contrato exigir a presença: se a
premissa cair, ela cai ruidosamente e antes do merge.

**Plano B, caso caia:** gerar um módulo pequeno no `prebuild` — um arquivo com uma constante
exportada, escrito por script e ignorado pelo git —, que é substituição por artefato em vez de
substituição por compilador. Custa uma etapa de build e um arquivo gerado, e por isso é plano B, não
plano A.

## 5. O que o comando de conferência já resolvia, e o que passa a resolver

🟢 `scripts/conferir-producao.mts`, entregue em `5db2cb4`, resolveu a pergunta difícil: a de saber se
o publicado **contém** o último commit de aplicação, em vez de comparar SHA com o `HEAD`, que
acusava defasagem falsa sempre que commits de governança ficavam à frente. A régua é conservadora
por construção — tudo conta como aplicação, exceto os diretórios de governança nomeados.

O que ele ainda não resolvia é a pergunta fácil, e que só o corpo pode responder: **quando** aquilo
subiu. Ele exibe `atualizado_em`, que muda a cada consulta e por isso não diz nada sobre o deploy.
Daí RF-03 e D-09.

🟢 Um cuidado que a investigação tornou explícito: o comando é executado **contra a produção que
existe**, e ela pode ser anterior a esta feature. Se ele exigir os campos novos, a primeira execução
depois do merge, antes do deploy, morrerá com "corpo fora do contrato" — código 2, erro de apuração
— justamente quando a resposta correta é "defasada", código 1. Por isso os campos novos são
opcionais na leitura, e ausência não é erro.

## 6. Onde o cenário degradado pode ser observado

🟢 O job `contrato` do CI já sobe um serviço de Postgres efêmero na mesma imagem pinada do
`compose.yaml`, e roda `npm start` com `DATABASE_URL` apontada a ele. O estado íntegro, portanto,
sai de graça.

Para o degradado, a suíte precisa de um alvo cujo banco não responda. A alternativa de derrubar o
serviço no meio do job torna a execução sequencial e frágil; a de simular com duplo prova a lógica,
mas não o corpo — e RF-06 fala do corpo. O caminho escolhido é o mais barato dos fiéis: um segundo
`npm start` sobre o **mesmo build**, em porta distinta, com `DATABASE_URL` apontada a um endereço
que recusa conexão de imediato (`127.0.0.1:9`, o padrão que `tests/contract/infra/banco.test.ts` já
usa para o mesmo fim). O teste de contrato lê o alvo por variável de ambiente, como já faz com
`API_BASE_URL`.

## 7. Fontes consultadas

| Fonte | O que forneceu |
|---|---|
| `node_modules/pg/lib/client.js`, `connection-parameters.js`, `defaults.js` (pg 8.22.0) | Semântica real de `query_timeout` e `statement_timeout`; parametrização por chamada |
| `node_modules/next/dist/server/config-schema.js` (Next 16.2.10) | Presença da chave `env` no esquema de configuração |
| `_reversa_forward/002-.../interfaces/http-get-api-v1-status.md` | Regra de versionamento aditivo dentro de `/api/v1`, denylist de privacidade, consumidores conhecidos |
| `_reversa_forward/003-.../interfaces/conexao-banco.md` | Superfície de `infra/database.ts`, timeouts de 5 000 ms, e a cláusula do §4 que esta feature revoga |
| `_reversa_sdd/architecture.md`, `code-analysis.md`, `c4-context.md` | O vínculo afirmado entre healthcheck e banco; inventário dos catorze módulos |
| `_reversa_sdd/adrs/0002`, `0008`; `domain.md` §7 | Privacidade por construção; guarda comportamental da rota de API |
| `.harness/decisoes/MD-0031`, `MD-0032` | Código 200 em todo estado do banco; verificação incondicional com gatilho de revisão |
| `.github/workflows/ci.yml` | Estrutura dos três jobs e o serviço de Postgres do job de contrato |
| `scripts/inventariar-textos.mts`, `scripts/textos/classes/pages-e-arquivos.mts` | Que `pages/**` está sob a varredura textual, e que o arquivo da rota já tem entrada declarada |
