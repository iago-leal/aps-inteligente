# Roadmap: Conexões do banco no status

> Identificador: `024-status-conexoes-do-banco`
> Data: `2026-08-10`
> Requirements: `_reversa_forward/024-status-conexoes-do-banco/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A consulta de saúde deixa de perguntar só se o banco responde e passa a trazer, na mesma linha de
resultado, o teto de conexões do servidor, a contagem de conexões abertas no banco corrente e a
versão. Uma ida ao banco, como hoje; o que muda é a largura da linha, não o número de viagens. Os
três valores sobem por `infra/database.ts`, atravessam `infra/saude.ts` alojados no ramo íntegro de
`EstadoDoBanco`, e chegam ao corpo pela mesma linha `banco` que o handler já serializa.

O ponto que define o tamanho desta entrega é esse último: **`pages/api/v1/status.ts` não tem uma
linha executável a mudar**, porque ele insere o valor de `verificarBanco()` inteiro no corpo. O
delta inteiro cabe em `infra/`, e a única alteração fora dela, tirando testes e contrato, é o
conferidor de produção, que ganha um campo a exibir. A ausência dos campos no estado degradado sai
de graça pelo tipo discriminado: eles vivem no ramo `integro`, que é o único onde poderiam existir,
de modo que a RN-02 é garantida pelo compilador e não por condicional.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. A spec é a fonte de verdade | O contrato HTTP e o `openapi/status.yaml` mudam **antes** do código, e a suíte de contrato afere o que eles afirmam. Nenhum campo é publicado sem contrato que o descreva | respeita |
| II. Cadeia de derivação | Cada ação nasce de um RF do `requirements.md`, e cada RF nasce do pedido validado na sessão de esclarecimento de 2026-08-10 | respeita |
| III. Clarificação precede solução | A queixa foi "adicione dois campos"; a clarificação revelou três conflitos com regras próprias, e a demanda ficou reduzida a três campos em vocabulário próprio, sem `/api/v2`. A premissa P-02 foi resolvida por exame do real, e não por hipótese | respeita |
| IV. Portão G1 | Requirements sem dúvida em aberto antes deste roadmap | respeita |
| V. Fase 2 proporcional | Categoria **Produto** (responsabilidade clínica). Ainda assim a superfície é uma rota de observabilidade sem dado clínico: não há molde de dados de negócio a projetar, porque não há esquema | respeita |
| VI. Rastreabilidade bidirecional | `infra/database.ts` e `infra/saude.ts` citam no cabeçalho os RF desta feature; `pages/api/v1/status.ts` tem o comentário de contrato atualizado, ainda que o executável não mude | respeita |
| VII. Testes em dois papéis | Validação por unidade em `tests/unit/infra/saude.test.ts` e por contrato nos dois alvos. Nenhum bug conhecido origina esta feature, de modo que não nasce teste de regressão em `tests/regression/` | respeita |
| VIII. Proporcionalidade | Cinco arquivos de produção tocados, nenhum domínio clínico, nenhuma tela. Sem ADR nova: a decisão de fundo já está em ADR 0008 e ADR 0020 | respeita |
| IX. Norma de redação | O conferidor ganha texto de saída, mas `scripts/` está **fora** das três camadas varridas por `scripts/inventariar-textos.mts` (`models`, `interface`, `pages`), de modo que não há classe a declarar. Os nomes de campo do JSON são identificadores, fora do alcance da revisão de estilo | respeita |

Nenhum conflito com princípio ativo. 🟢

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | A consulta de `saude()` passa de `SELECT $1::int AS ok` para uma linha de quatro colunas, com o teto, a contagem e a versão apurados junto | Uma ida só, como a RN-01 exige. Medido no Postgres do projeto: 1 a 4 ms para a linha inteira | (a) três consultas no molde da referência, que estouraria o orçamento na instância suspensa; (b) segunda função chamada em paralelo, que dobraria conexões; (c) view ou função no banco, que exigiria migração num projeto que não tem esquema | 🟢 |
| D-02 | A contagem filtra por `datname = current_database()`; o teto sai de `current_setting('max_connections')` | Cumpre a RN-08. Medido: cluster inteiro devolveu 6 contra 1 do banco corrente, de modo que os universos diferem de fato | contar o cluster inteiro, que misturaria consumidores de outros bancos da mesma instância | 🟢 |
| D-03 | A versão sai de `current_setting('server_version')`, sanitizada para o prefixo numérico, e **jamais** de `version()` | `version()` devolve `PostgreSQL 17.10 on aarch64-unknown-linux-musl…`, que casa com `/postgres/i` da denylist e ainda revela arquitetura e compilador. Realiza a RN-06 | (a) `version()` cru, que reprovaria a suíte; (b) `server_version_num` (`170010`), que perderia a forma legível | 🟢 |
| D-04 | Os três campos moram no ramo `integro` do tipo discriminado `EstadoDoBanco` | A ausência no estado degradado deixa de ser condicional em runtime e passa a ser impossível por construção. Realiza a RN-02 sem uma linha de `if` | campos opcionais no mesmo nível, que permitiriam `undefined` no ramo errado e exigiriam guarda em cada consumidor | 🟢 |
| D-05 | Valor fora do formato esperado em qualquer das quatro colunas vira `ErroDeBanco("consulta")`, no mesmo molde da validação que `saude()` já faz sobre `ok` | Realiza a RN-03 e o RF-07 reaproveitando a disciplina existente, em vez de inventar caminho de erro novo | degradar só quando `ok` falha, tolerando estatística ausente, que contrariaria a decisão da sessão de esclarecimento | 🟢 |
| D-06 | `infra/saude.ts` continua a não formatar, não ler ambiente e não compor resposta: só transporta os valores para dentro do ramo íntegro | Preserva a razão de existir do módulo, descrita em `_reversa_sdd/code-analysis.md#módulo-20--infra` | formatar a ocupação como texto no adaptador, o que poria apresentação na camada errada | 🟢 |
| D-07 | A denylist da suíte de contrato permanece **intocada**, inclusive o padrão numérico `/54(32\|33)/` | A RN-05 declara que nenhum item é revogado. O falso positivo teórico (teto que contivesse `5432`) é implausível nos tamanhos de instância em uso e vira item de vigilância, não motivo para enfraquecer uma guarda de privacidade | aferir a denylist campo a campo em vez de sobre o corpo inteiro, o que afrouxaria a regra de ouro herdada da 022 | 🟢 |
| D-08 | `pages/api/v1/status.ts` não muda no executável; muda só o comentário de contrato no cabeçalho | O handler já serializa `banco` inteiro. Alterá-lo seria mexer em código que não precisa mudar; o comentário muda por exigência do Princípio VI | reescrever o handler para compor os campos, o que espalharia conhecimento do banco por uma camada que não o tem | 🟢 |
| D-09 | No `openapi/status.yaml`, os três campos entram como **obrigatórios** no ramo `BancoIntegro`, com `additionalProperties: false` preservado nos dois ramos | Pela D-04 e pela D-05, um corpo íntegro sem os três campos é impossível: torná-los opcionais descreveria um estado que o código não produz | opcionais, que enfraqueceriam o contrato sem ganho | 🟢 |
| D-10 | O conferidor exibe a ocupação como `abertas/teto` ao lado do estado, lendo os três campos como **opcionais** | Mesmo molde da D-09 da feature 022: o conferidor roda contra deploys antigos, e campo ausente é estado normal, não erro | exigir os campos, o que quebraria a conferência contra qualquer deploy anterior a esta entrega | 🟢 |
| D-11 | O teto publicado é o que o servidor alcançado reporta, seja ele a instância de cálculo ou o que estiver à frente dela | Não há como decidir isto sem a `DATABASE_URL` de produção, que não está nesta máquina. A verificação é observável **depois** do deploy, pelo próprio campo | fixar no contrato que o número é o da instância de cálculo, o que seria afirmação não verificada | 🟡 |
| D-12 | `LeituraDeSaude` declara os campos em `snake_case`, contra a convenção `camelCase` do módulo, e a interpretação da linha continua **embutida** em `saude()`, com auxiliares privados | Duas correções de rota da passagem de reconciliação, e a mesma razão as une: o tipo não é interno. Pela D-08 o handler publica o valor inteiro, de modo que os nomes deste tipo **são** os nomes do corpo, e um `camelCase` aqui publicaria `tetoDeConexoes` ou exigiria um tradutor que a D-08 proíbe. Pelo mesmo motivo a interpretação não precisa virar função exportada: exportá-la alargaria a superfície pública do módulo só para servir ao teste, que já a alcança por `vi.importActual` | remapear em `infra/saude.ts`, que contradiria o §2 do contrato interno e devolveria ao adaptador a interpretação que a D-06 tirou dele; e extrair a função pública prevista na T005, que trocaria encapsulamento por conveniência de teste | 🟢 |

## 4. Premissas

Nenhuma premissa nasce de `[DÚVIDA]` não resolvida: o `requirements.md` fechou com zero marcadores.
As três premissas declaradas na seção 10 daquele documento tiveram o seguinte desfecho:

| Premissa | Origem (`requirements.md` seção) | Desfecho | Risco se errada |
|----------|----------------------------------|----------|-----------------|
| P-01, os três valores são apuráveis numa leitura só | 10 | **Confirmada por medição** em 2026-08-10, contra `postgres:17.10-alpine` | n/a |
| P-02, o papel de conexão enxerga as estatísticas e o teto | 10 | **Confirmada por medição** com papel `NOSUPERUSER`, fora de `pg_monitor`, com apenas `CONNECT` concedido: leu os dois valores | n/a |
| P-03, a contagem é dominada por outros consumidores, e a rota conta a si mesma | 10 | **Mantida**, e agora explicitada no contrato: a própria requisição aparece na contagem | Leitura ingênua de "1 conexão aberta" como sinal de ociosidade, quando é a própria consulta |

Uma incógnita permanece, e está registrada como D-11 com confidência 🟡: o tipo de ponto de acesso
que a `DATABASE_URL` de produção usa. Ela não bloqueia a entrega, porque o campo publicado é a
própria resposta à pergunta.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `infra/database.ts`, função `saude()` | `_reversa_sdd/code-analysis.md#módulo-20--infra` | contrato-alterado | Devolve a leitura completa em vez de `{ ok: true }`; a consulta ganha três colunas e a validação, três verificações |
| `infra/saude.ts`, `EstadoDoBanco` | `_reversa_sdd/code-analysis.md#módulo-20--infra` | contrato-alterado | O ramo `integro` deixa de ser um objeto de um campo e passa a carregar teto, abertas e versão |
| `pages/api/v1/status.ts` | `_reversa_sdd/code-analysis.md#módulo-19--pagesapiv1status` | regra-alterada | Sem mudança executável. O comentário de contrato passa a citar os RF desta feature |
| `GET /api/v1/status` | `_reversa_sdd/architecture.md#4-integrações-externas` | contrato-alterado | O ramo íntegro de `banco` passa de uma chave para quatro, por acréscimo, dentro de `/api/v1` |
| `_reversa_sdd/openapi/status.yaml` | `_reversa_sdd/openapi/status.yaml` | contrato-alterado | `BancoIntegro` ganha três propriedades obrigatórias |
| `scripts/conferir-producao.mts` | `_reversa_sdd/code-analysis.md#módulo-21--scripts` | regra-alterada | Passa a exibir a ocupação, lendo os campos como opcionais |
| Suíte de contrato e de unidade | `_reversa_sdd/architecture.md#5-qualidade-e-testes` | regra-alterada | `tests/contract/api/v1/status.test.ts`, `tests/contract/infra/banco.test.ts` e `tests/unit/infra/saude.test.ts` cobrem os campos novos e o caminho de falha de apuração |

Nada muda em `models/`, em `interface/`, em `pages/` fora do comentário citado, nem em qualquer
tela. A matriz de rastreabilidade permanece com `∅` em todos os domínios clínicos. 🟢

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhuma tabela, nenhuma coluna, nenhuma migração. O banco segue sem esquema
  de negócio, como a feature 003 o deixou. O que muda é a **forma do valor lido**, e ela vive no
  código, não no banco. Muda também o tipo `EstadoDoBanco`, que é dado do contrato público.
- Detalhe completo em: `_reversa_forward/024-status-conexoes-do-banco/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| `GET /api/v1/status` | HTTP | `_reversa_forward/024-status-conexoes-do-banco/interfaces/http-get-api-v1-status.md` |
| Acesso ao banco por `infra/` | interno, versionado como contrato desde a 003 | `_reversa_forward/024-status-conexoes-do-banco/interfaces/conexao-banco.md` |

## 8. Plano de migração

Não há migração de dados. A migração é de **contrato**, e a ordem importa:

1. Atualizar os dois contratos em `interfaces/`, que são a fonte de verdade da entrega.
2. Estender `saude()` em `infra/database.ts`, com a consulta e as validações novas.
3. Estender `EstadoDoBanco` em `infra/saude.ts`, alojando os valores no ramo íntegro.
4. Atualizar `_reversa_sdd/openapi/status.yaml` para o corpo que passará a existir.
5. Estender as suítes: unidade primeiro, contrato depois, nos dois alvos.
6. Atualizar `scripts/conferir-producao.mts` e a seção "Como verificar saúde" do `README.md`.
7. Publicar e conferir em produção pelo próprio campo, o que resolve a D-11.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| O ponto de acesso de produção ser agrupado, e o teto descrever camada diferente da contagem | médio | médio | D-11: o contrato declara os dois universos, e o valor publicado responde à pergunta no primeiro deploy. Vira item de vigilância |
| `server_version` trazer sufixo de distribuição em alguma imagem, contaminando o campo | baixo | baixo | D-03: sanitização para o prefixo numérico, com teste de unidade sobre uma cadeia com sufixo |
| Teto de conexões que contenha `5432` reprovar a denylist sem vazamento algum | baixo | muito baixo | D-07: guarda preservada, falso positivo registrado como item de vigilância |
| A linha mais larga custar tempo suficiente para aproximar o teto de 3.000 ms | baixo | muito baixo | Medido em 1 a 4 ms contra instância local. O teto segue configurável, e o caminho de estouro já existe e é testado |
| Leitura ingênua da contagem, que inclui a própria requisição | baixo | médio | O contrato diz, em texto, que a rota se conta; o conferidor exibe `abertas/teto`, e não um número solto |
| Um deploy antigo, sem os campos, fazer o conferidor falhar | médio | baixa | D-10: campos opcionais, com cenário de aceite dedicado |

## 10. Critério de pronto

- [X] Todas as ações do `actions.md` marcadas `[X]`
- [X] `cross-check.md` (se executado) sem CRITICAL nem HIGH — não executado nesta feature
- [X] `regression-watch.md` gerado
- [X] `npm run typecheck` e `npm run lint` verdes
- [X] Suíte de unidade verde, com os casos novos de `infra/saude.ts` — 941 de 941, contra 935 na linha de base do `HEAD` anterior
- [X] Suíte de contrato verde nos **dois** alvos, com banco acessível e inalcançável — 31 de 31
- [X] Corpo real validado contra `openapi/status.yaml` nos dois estados, e os três exemplos do próprio documento junto
- [X] `README.md` descrevendo o corpo que a rota passou a devolver
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-08-10 | Versão inicial gerada por `/reversa-plan`, com P-01 e P-02 confirmadas por medição contra `postgres:17.10-alpine` antes da redação | reversa |
| 2026-08-10 | Passagem de reconciliação: acrescentada a D-12, que decide o `snake_case` de `LeituraDeSaude` e a forma embutida da interpretação, desfazendo a pendência bloqueante do `legacy-impact.md`. Critério de pronto fechado, com os números de cada portão | reversa |
