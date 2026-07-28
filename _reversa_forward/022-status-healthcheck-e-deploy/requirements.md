# Requirements: O healthcheck passa a verificar o que promete

> Identificador: `022-status-healthcheck-e-deploy`
> Data: `2026-07-28`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

`GET /api/v1/status` responde 200 quando o servidor da aplicação respondeu, e nada além disso. O banco
provisionado para comprovar conectividade, o pool que o abre e a função `saude()` que o
consulta existem, são testados — e **nenhum deles é chamado em produção**: o único importador
de `infra/database.ts` em todo o repositório é o próprio teste. Hoje o status responderia 200
com o banco caído.

A feature liga o healthcheck ao que ele diz verificar e acrescenta ao corpo o que falta para
conferir um deploy sem consultar o painel do provedor: **quando** aquilo subiu, e em que
ambiente. O comando `npm run status:conferir`, entregue em `5db2cb4`, passa a consumir esses
campos.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md` §2 | "Banco PostgreSQL (feature 003) — existe **só para o healthcheck comprovar conectividade** (Neon em produção)". A extração afirma um vínculo que o código não realiza | 🟢 |
| `_reversa_sdd/architecture.md` §4 | Tabela de integrações: "Neon (Postgres, Vercel Marketplace) · Banco gerenciado do healthcheck · runtime (só `/api/v1/status`) · não toca dado clínico — só `SELECT 1`" | 🟢 |
| `_reversa_sdd/architecture.md` §1 | "`infra/database.ts` (pool pg) — usada SÓ pelo healthcheck `/api/v1/status`; nunca toca dado clínico" | 🟢 |
| `pages/api/v1/status.ts` | O handler não importa `infra/database`. Responde `{atualizado_em, versao, commit}` sem I/O algum. Um commit só no histórico, o da feature 002; a 003, que trouxe o banco, nunca o alterou | 🟢 |
| `infra/database.ts` | `saude()` roda `SELECT $1::int AS ok` parametrizado, valida a linha e lança `ErroDeBanco` com `causa` em `conexao \| consulta \| configuracao`. Pool preguiçoso, `max: 5`, timeout de 5 s, **sem retentativa** por decisão: "falha barulhenta; retry é decisão do chamador" | 🟢 |
| `infra/database.ts`, `registrar()` | O log estruturado **mascara o host** (`hostMascarado()`) e emite só o nome do erro. O que os logs escondem, o corpo público não pode revelar | 🟢 |
| `tests/contract/infra/banco.test.ts` | Único importador de `infra/database` fora do próprio módulo. A função é exercitada por teste e por mais ninguém | 🟢 |
| `_reversa_sdd/adrs/0008` | Rotas de API são permitidas desde que nenhum dado clínico ou pessoal trafegue; "a guarda é **comportamental** (sem leitura de corpo, sem `Set-Cookie`), vigiada por teste de contrato — não uma allowlist nominal" | 🟢 |
| `_reversa_sdd/domain.md` §7, invariante 7 | Privacidade por construção (ADR 0002): "único acesso a rede: o healthcheck `/api/v1/status`, sem dado clínico" | 🟢 |
| `_reversa_forward/002-.../interfaces/http-get-api-v1-status.md` | Contrato **fixo**: "mudança incompatível exige `/api/v2`". Campos hoje: `atualizado_em` (momento da resposta), `versao` (manifesto), `commit` (SHA publicado). `Cache-Control: no-store` obrigatório, `Set-Cookie` ausente e invariável | 🟢 |
| `README.md`, "Como verificar saúde" | Reescrito em `5db2cb4`: a régua de conferência é contenção do último commit de aplicação, não igualdade de SHA | 🟢 |
| `_reversa_sdd/architecture.md` §6, dívida 5 | Premissas 🟡 pendentes de validação convivem no projeto como decisões declaradas, não bugs | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Mantenedor intermitente | Saber, em um comando, se o que está publicado é o que ele entregou **e** se a plataforma está inteira | Volta ao projeto depois de semanas, roda `npm run status:conferir` e quer o veredito sem abrir o painel da Vercel nem o console da Neon |
| Mantenedor durante entrega | Confirmar que o deploy subiu, e **quando** | Acabou de pushar, o CI passou, e quer distinguir "publicado agora" de "publicado ontem" sem comparar SHA de cabeça |
| Agente automatizado (CI, cron) | Consumir o veredito por máquina | Roda o healthcheck periodicamente e precisa distinguir "no ar e íntegro" de "no ar e degradado", com código de saída ou campo estável |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O healthcheck **verifica o que promete verificar**. Enquanto o corpo declarar que a
   plataforma está saudável, essa afirmação há de cobrir as dependências que a extração atribui
   ao endpoint — hoje, o banco. Healthcheck que responde 200 sem tocar em nada não é
   observabilidade: é um `ping` com nome enganoso, e o pior defeito de um alarme é o silêncio
   quando deveria soar. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md` §1, §2 e §4, que já afirmam o vínculo
   - Tipo: nova — a regra corrige a lacuna entre o que a extração descreve e o que o código faz
2. **RN-02:** A privacidade permanece **invariante e não negociável**. Nenhum campo novo
   transporta dado clínico, pessoal, credencial, URL de conexão ou host. A guarda continua
   comportamental: sem leitura de corpo, sem `Set-Cookie`, `Cache-Control: no-store`. O que
   `infra/database.ts` já mascara no log — o host — o corpo público não pode revelar. 🟢
   - Origem no legado: `_reversa_sdd/adrs/0008`, `_reversa_sdd/adrs/0002`,
     `_reversa_sdd/domain.md` §7 invariante 7
   - Tipo: alterada — a invariante é a mesma; o que muda é a superfície sobre a qual ela incide
3. **RN-03:** **O erro do banco é valor, não exceção que escapa.** `saude()` lança
   `ErroDeBanco` com `causa` em `conexao | consulta | configuracao`; a rota traduz essa causa
   num rótulo público estável e **jamais** propaga a mensagem interna, que cita host mascarado,
   trecho de SQL e duração. Falha de dependência não pode virar 500 com rastro no corpo. 🟢
   - Origem no legado: `infra/database.ts`; `_reversa_sdd/domain.md` §7 invariante 2 (erros
     esperados são valores)
   - Tipo: nova
4. **RN-04:** **`atualizado_em` mente sobre o que o leitor precisa saber.** Ele é o momento em
   que a resposta foi gerada, e por isso muda a cada consulta; não diz quando aquele build
   subiu. Quem confere um deploy precisa do segundo, e hoje só o obtém no painel do provedor. O
   corpo passa a distinguir **frescor da resposta** de **idade do deploy**. 🟢
   - Origem no legado: `pages/api/v1/status.ts`; contrato da feature 002
   - Tipo: nova
5. **RN-05:** **A verificação é incondicional, e o custo do despertar se aceita com gatilho de
   revisão declarado.** A instância gerenciada do banco, no plano gratuito em uso, suspende-se
   por inatividade, e a consulta de saúde a desperta. Toda consulta ao status verifica o banco,
   sem parâmetro que a torne opcional: verificação opcional faria o caminho padrão voltar a ser
   o healthcheck que RN-01 corrige. O custo é hipotético enquanto o acesso for o que é hoje, a
   saber o mantenedor rodando um comando e o CI a cada push. O gatilho de revisão é observável e
   fica registrado: **aparecendo consumidor que consulte em laço**, a verificação de dependência
   migra para rota própria, mudança barata porque o campo já existirá e o contrato é aditivo. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md` §4
   - Tipo: nova — decidida na sessão de esclarecimentos (Q3); ficha `MD-0032`
6. **RN-06:** **A rota não reintroduz retentativa.** `infra/database.ts` decidiu não repetir
   consulta por conta própria — "falha barulhenta; retry é decisão do chamador" —, e o chamador,
   aqui, é um healthcheck: repetir mascararia a intermitência que ele existe para revelar, e
   multiplicaria o tempo de resposta pelo número de tentativas. Uma tentativa, um veredito. 🟢
   - Origem no legado: `infra/database.ts`, cabeçalho do módulo
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | O corpo informa a saúde do banco | Must | Com o banco no ar, o corpo traz o estado do banco como íntegro; com o banco fora, traz o estado degradado e a **causa** em vocabulário público, sem detalhe interno. O estado do banco chega como campo próprio da raiz (objeto `banco`), acréscimo puro que não reaninha os campos de hoje. Verificado por teste de contrato nos dois estados | 🟢 |
| RF-02 | A rota não quebra quando a dependência quebra | Must | Banco indisponível **não** produz 500 nem exceção não tratada; o código permanece **200 em todo estado do banco**, porque as seis calculadoras são integralmente cliente e seguem servindo (Q1). O corpo continua bem formado e os campos que não dependem do banco continuam corretos | 🟢 |
| RF-03 | O corpo informa quando o deploy subiu | Must | Campo distinto de `atualizado_em`, estável entre duas consultas ao mesmo deploy e diferente entre deploys distintos | 🟢 |
| RF-04 | O corpo informa o ambiente | Should | Distingue produção de pré-visualização, de modo que uma conferência apontada por engano a uma URL de preview seja reconhecível pelo próprio corpo | 🟡 |
| RF-05 | Os campos de hoje permanecem, com a mesma semântica | Must | `atualizado_em`, `versao` e `commit` continuam presentes e com o significado que o contrato da 002 lhes deu; nenhum consumidor existente quebra | 🟢 |
| RF-06 | A privacidade continua verificada, e não prometida | Must | O teste de contrato afere ausência de `Set-Cookie`, `Cache-Control: no-store` e ausência de host, URL de conexão, credencial ou trecho de SQL em qualquer estado do corpo, inclusive no degradado | 🟢 |
| RF-07 | A verificação do banco tem custo previsível e limitado no tempo | Must | A consulta de saúde respeita um teto de **3 segundos**, configurável por variável de ambiente, e uma tentativa só (RN-06); estourado o teto, o estado é degradado por tempo esgotado, e não erro. O valor acomoda o despertar da instância suspensa, que um teto de 2 s reprovaria com frequência, produzindo falso negativo sistemático. **Implica interface nova em `infra/database.ts`:** `saude()` passa a aceitar um teto opcional, com padrão retrocompatível, porque impor o limite por fora com `Promise.race` não cancela a consulta e deixa a conexão consumindo o pool depois de a resposta ter saído | 🟢 |
| RF-08 | `npm run status:conferir` consome os campos novos | Should | O comando passa a exibir a idade do deploy e o estado do banco. Os códigos de saída atuais permanecem com a semântica de hoje, isto é, **respondendo à defasagem**, que é a pergunta do comando: 0 em dia, 1 defasada, 2 erro de apuração. O degradado aparece no texto e como campo estruturado em `--json`; quem exigir rigor por código de saída usa `--exigir-saudavel`, que promove degradado a saída não-zero. Defasagem e degradação são eixos ortogonais, e espremê-los num inteiro criaria precedência arbitrária no caso defasada-e-degradada | 🟢 |
| RF-09 | O contrato escrito acompanha o contrato servido | Must | `interfaces/` da feature declara o corpo novo, e o teste de contrato é derivado dele; divergência entre documento e resposta reprova a suíte. O corpo novo permanece em **`/api/v1`**: o contrato da 002 já autoriza, em "Propriedades", "dentro de `/api/v1`, apenas mudanças aditivas de campos" | 🟢 |
| RF-10 | Nenhuma regra clínica, tela ou rota muda | Must | `git diff` vazio em `models/`, `interface/` e `pages/` fora de `pages/api/v1/status.ts` | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | A rota permanece utilizável como healthcheck: a consulta ao banco não pode torná-la lenta a ponto de o próprio monitor expirar | Hoje responde em ~0,3 s medidos de fora; `infra/database.ts` impõe teto de 5 s à conexão e à consulta, longo demais para um healthcheck consultado a olho, e por isso RF-07 lhe dá um teto próprio de 3 s | 🟢 |
| Custo | Despertar a instância suspensa é efeito colateral com preço, aceito enquanto o padrão de acesso for o de hoje, e revisto quando aparecer consumidor em laço | RN-05; o plano gratuito registrado em `architecture.md` §4; ficha `MD-0032` | 🟢 |
| Segurança | Nenhuma superfície nova de entrada: a rota continua sem ler corpo, sem parâmetro que altere estado e sem autenticação a proteger | ADR 0008, guarda comportamental | 🟢 |
| Observabilidade | Falha de dependência é registrada com a disciplina que `infra/database.ts` já pratica: log estruturado, host mascarado, nome do erro sem payload | `registrar()` em `infra/database.ts` | 🟢 |
| Compatibilidade | Consumidor que hoje lê `{atualizado_em, versao, commit}` continua funcionando sem alteração | RF-05; contrato da 002 | 🟢 |
| Escopo negativo | Nenhuma métrica de negócio, contagem de uso ou telemetria de usuário entra neste endpoint | ADR 0002; o endpoint é de deploy, não de produto | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: plataforma íntegra
  Dado que o banco responde
  Quando consulto GET /api/v1/status
  Então recebo 200 com o estado do banco íntegro
  E o corpo traz a versão, o commit publicado e quando o deploy subiu
  E o cabeçalho proíbe cache

Cenário: banco fora, plataforma no ar
  Dado que o banco está indisponível
  Quando consulto GET /api/v1/status
  Então a resposta é 200, e não 500 nem 503
  E o corpo declara o banco degradado, com a causa em vocabulário público
  E o commit e a versão continuam corretos

Cenário: o corpo não vaza o que o log esconde
  Dado que o banco falhou por erro de conexão
  Quando leio o corpo da resposta
  Então não encontro host, URL de conexão, credencial nem trecho de SQL

Cenário: a idade do deploy não se confunde com o frescor da resposta
  Dado que consulto o status duas vezes seguidas, sem novo deploy
  Então o campo de frescor muda entre as duas
  E o campo de quando o deploy subiu permanece idêntico

Cenário: o consumidor antigo não quebra
  Dado um cliente que lê apenas atualizado_em, versao e commit
  Quando ele consulta a rota depois desta feature
  Então os três campos continuam presentes e com a mesma semântica

Cenário: método diferente de GET
  Dado que envio POST para /api/v1/status
  Então recebo 405 com Allow: GET
  E o banco não é consultado

Cenário: a URL consultada por engano se denuncia
  Dado que aponto a conferência a uma URL de pré-visualização
  Quando leio o corpo
  Então o ambiente declarado ali não é o de produção

Cenário: o banco demora mais do que o healthcheck admite
  Dado que a consulta de saúde ultrapassa o teto de três segundos
  Então a resposta chega mesmo assim, com código 200
  E o banco é declarado degradado por tempo esgotado
  E não houve segunda tentativa
  E a consulta subjacente foi cancelada, sem deixar conexão pendurada no pool

Cenário: o comando distingue defasagem de degradação
  Dado que a produção está no commit que entreguei e o banco está fora
  Quando rodo o comando de conferência
  Então ele diz que está em dia e sai com código zero
  E o texto declara o banco degradado
  E o mesmo comando com --exigir-saudavel sai com código diferente de zero

Cenário: desenvolvimento local sem banco configurado
  Dado que rodo a aplicação sem a conexão do banco definida
  Quando consulto o status
  Então a resposta continua bem formada
  E o banco é declarado degradado por configuração ausente

Cenário: o comando de conferência entende os campos novos
  Dado que a produção está no commit que entreguei e o banco responde
  Quando rodo o comando de conferência
  Então ele diz que está em dia, informa há quanto tempo o deploy subiu
  E sai com código zero

Cenário: nada além do endpoint muda
  Dado que a feature está pronta para commit
  Quando comparo o diff com o estado anterior
  Então nenhum arquivo de domínio, de tela ou de rota de página aparece nele
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01, RF-02 | Must | São a feature: o healthcheck passa a verificar, e passa a falhar sem quebrar |
| RF-03 | Must | Sem a idade do deploy, a conferência continua dependendo do painel do provedor, que é o atrito que motivou a feature |
| RF-05, RF-06, RF-10 | Must | Obrigações que a plataforma já assumiu e que um enriquecimento de corpo não pode revogar |
| RF-07 | Must | Healthcheck que pendura é pior que healthcheck pobre: transforma degradação em indisponibilidade aparente |
| RF-09 | Must | Princípio I: o contrato é a fonte de verdade, e contrato que não é verificado é intenção |
| RF-04, RF-08 | Should | Melhoram a leitura sem serem a razão da feature |
| Métrica de negócio ou telemetria de uso | Won't | ADR 0002; este endpoint é de deploy, e misturá-lo com produto abriria a porta que a privacidade por arquitetura mantém fechada |
| Autenticação do endpoint | Won't | ADR 0008 o quer público e sem estado; não há segredo a proteger no corpo, e é RN-02 que garante isso |
| Reconstituir `pages/api/v1/index.js` ou outros endpoints | Won't | O ADR 0008 registra o vestígio; ressuscitá-lo é outra feature, com outra justificativa |

## 9. Esclarecimentos

### Sessão 2026-07-28

- **Q1:** Banco fora derruba o código de status, ou vira campo?
  **R:** **200 em todo estado do banco**, com o corpo declarando `degradado`. O produto é
  integralmente cliente por ADR 0002, e as seis calculadoras seguem servindo com o banco caído;
  um 503 afirmaria queda de uma plataforma inteira e no ar, que é alarme falso sobre software
  clínico. O código HTTP responde se a rota funcionou, o corpo responde o que ela apurou, e
  fundir as duas perguntas faria a dependência menos essencial governar o sinal mais forte.
  Descartados: 503 na falha; 503 sob parâmetro, que dá duas semânticas à mesma URL e engana o
  monitor que desconheça o parâmetro; e 503 só para configuração, cuja fronteira é arbitrária.
  Incide em RF-02 e no cenário "banco fora, plataforma no ar". Ficha `MD-0031`.

- **Q2:** Acrescentar campos ao corpo cabe em `/api/v1`, ou exige `/api/v2`?
  **R:** **Cabe em `/api/v1`, e não por arbitragem: o contrato da 002 já o autoriza.** A seção
  "Propriedades" de `interfaces/http-get-api-v1-status.md` declara "Versionamento: dentro de
  `/api/v1`, apenas mudanças aditivas de campos". A dúvida partia da premissa de que o contrato
  dizia "contrato fixo" sem definir o que torna a mudança incompatível; ele define, e adição de
  campo é o caso explicitamente permitido. A adição há de ser pura: `atualizado_em`, `versao` e
  `commit` permanecem na raiz e intocados, e o estado do banco entra ao lado como objeto
  próprio, que é um campo acrescentado e não um reaninhamento dos antigos. Incide em RF-01 e
  RF-09.

- **Q3:** Quem paga o despertar do banco suspenso?
  **R:** **Consulta sempre, custo aceito, com gatilho de revisão declarado.** Verificação por
  parâmetro foi descartada porque tornaria o caminho padrão o healthcheck mentiroso que RN-01
  existe para corrigir; cache no servidor foi descartado porque põe estado num handler hoje
  puro, e em execução distribuída o acerto do cache varia por instância, o que é
  não-determinismo dentro da observabilidade. A rota separada tem melhor coesão no papel, mas
  cobraria hoje rota, contrato e suíte novos para proteger contra consumidor que não existe.
  O gatilho fica escrito: aparecendo consumidor em laço, a verificação migra para rota própria.
  Incide em RN-05 e na linha "Custo" da seção 6. Ficha `MD-0032`.

- **Q4:** Como `npm run status:conferir` sinaliza "no ar, porém degradado"?
  **R:** **Códigos atuais preservados, degradado sob `--exigir-saudavel`.** Defasagem e
  degradação são eixos ortogonais, e um código novo criaria de imediato a precedência arbitrária
  do caso defasada-e-degradada. O comando pergunta se o publicado corresponde ao entregue, e o
  código de saída responde a essa pergunta; a saúde do banco ele exibe, no texto e como campo em
  `--json`, que é mais expressivo que um inteiro. Incide em RF-08.

- **Q5:** Qual o teto de tempo da consulta de saúde?
  **R:** **3 segundos, configurável por variável de ambiente.** O teto de 2 s originalmente
  proposto reprovaria com frequência o primeiro acesso após ociosidade, porque despertar a
  instância suspensa custa mais que a consulta quente, e isso seria falso negativo sistemático.
  A decisão traz consequência de desenho para o plano: `saude()` passa a aceitar um teto
  opcional, com padrão retrocompatível, porque impor o limite por fora com `Promise.race` não
  cancela a consulta e deixa a conexão consumindo o pool depois de a resposta ter saído. Incide
  em RF-07 e na linha "Desempenho" da seção 6.

## 10. Lacunas

Nenhuma `[DÚVIDA]` em aberto. As três que existiam foram resolvidas na sessão de 2026-07-28: as
de Q1 e Q3 por decisão do mantenedor, com ficha; a de Q2 por leitura do contrato da 002, que já
a respondia.

Permanece 🟡, e sem que nenhuma pergunta da sessão a tocasse, a proveniência do dado de ambiente
de **RF-04**, que é `Should` e não bloqueia o plano.

## Pendências de Qualidade

Uma só, e é consciente. **Q-018** ("não há nome de biblioteca, framework ou produto comercial
no documento") permanece reprovado na seção 2, onde o provedor do banco e o do deploy são
nomeados. A seção 2 é, por construção do Reversa, a que cita as fontes da extração, e citar
integração documentada é a função dela; anonimizá-la tornaria as âncoras inverificáveis. Nas
seções que definem regra e requisito — 4, 5 e 6 —, as dependências aparecem pela função que
exercem, não pela marca, de modo que nenhuma decisão de implementação foi antecipada ali.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial gerada por `/reversa-requirements`, a partir do achado de que `infra/database.ts` não tem importador em produção, apurado ao conferir o SHA publicado | reversa |
| 2026-07-28 | `/reversa-clarify`: cinco esclarecimentos integrados e as três `[DÚVIDA]` zeradas. RN-05 reescrita com gatilho de revisão (🟡→🟢); RF-07 fixa 3 s configuráveis e a interface nova de `saude()` (🟡→🟢); RF-01, RF-02, RF-08 e RF-09 precisados; dois cenários acrescentados aos critérios. Fichas `MD-0031` e `MD-0032` | reversa |
