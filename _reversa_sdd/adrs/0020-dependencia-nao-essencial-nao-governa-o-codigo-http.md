# ADR 0020 — Dependência que não serve o produto não governa o código HTTP da rota que a verifica

> Retroativo, reconstruído pelo Reversa Detective (2026-07-28, re-extração nº 4) a partir da feature 022 (`022-status-healthcheck-e-deploy`), do adendo 022 e das fichas `MD-0030`, `MD-0031` e `MD-0032`. Confiança: 🟢

## Contexto

`GET /api/v1/status` respondia 200 quando o servidor da aplicação respondia, e nada além disso. O banco provisionado pela feature 003 para comprovar conectividade, o pool que o abre e a função `saude()` que o consulta existiam e eram testados, mas **o único importador de `infra/database.ts` em todo o repositório era o próprio teste de contrato**. A extração afirmava, desde a primeira passagem, um vínculo que o código não realizava: o status responderia 200 com o banco caído.

A feature 022 reconciliou o código com a spec e, ao fazê-lo, deu à rota uma dependência e, portanto, um modo de falhar. A pergunta que se abriu foi qual código HTTP devolver quando o banco não responde.

## Decisão

`GET /api/v1/status` responde **200 em todo estado do banco**. A falha da dependência chega ao consumidor como **campo do corpo**, num objeto `banco` com estado e causa em vocabulário público, e nunca como código de status.

A regra que isso fixa vale além do endpoint: **dependência que não serve o produto não governa o código HTTP da rota que a verifica**. O código responde se a rota funcionou; o corpo responde o que ela apurou.

A razão é factual e não de gosto: as seis calculadoras são **integralmente cliente** e seguem servindo com o banco fora. Um 503 afirmaria a queda de uma plataforma que está no ar, e um monitor que reagisse a ele acordaria alguém para um incidente que não existe.

Três decisões subordinadas sustentam a disciplina da chamada:

1. **A discriminação de método precede todo I/O**: 405 com `Allow: GET` não desperta a instância suspensa.
2. **O teto é imposto no servidor**, por `connectionTimeoutMillis` e `statement_timeout` derivados de `APS_TIMEOUT_SAUDE_MS` (padrão 3.000 ms), e não pelo `query_timeout` do driver, que é temporizador de cliente, não cancela nada e devolveria ao pool um cliente com resposta pendente. Valor malformado cai no padrão **registrando log**, porque um `NaN` desligaria a proteção em silêncio.
3. **A verificação fica na mesma rota** (`MD-0032`), incondicional, sem parâmetro que a torne opcional e sem cache, aceito o custo de despertar a instância. O gatilho que autoriza separá-la fica escrito e é **observável**: aparecendo consumidor que consulte o status em laço, a verificação migra para rota própria, e a migração é barata porque o campo já existe e o contrato é aditivo.

## Alternativas consideradas

- **503 quando o banco não responde**: descartada pela razão central. Seria verdadeira apenas se o banco servisse o produto, e ele não serve: existe para comprovar conectividade.
- **Campo booleano `banco_ok`**: descartada por perder a causa. A distinção entre não abrir conexão, credencial recusada, teto estourado e falha de consulta é o que torna o campo acionável, e foi ela que motivou a quarta causa `tempo_esgotado`, que **retira** casos das outras duas e impede que instância suspensa a despertar seja lida como banco fora.
- **Rota separada para a dependência**, desde já: descartada como "resposta certa para um problema que ainda não existe" (`MD-0032`), com o gatilho registrado em vez de antecipado.
- **Tornar a verificação opcional por parâmetro**: descartada porque um healthcheck que só verifica quando se pede volta a ser o que a feature veio corrigir.
- **Nomear o ambiente pelos nomes do provedor**: descartada. `ambiente` sai em vocabulário **do produto** (`producao` / `pre-visualizacao` / `local`), porque amarrá-lo à marca faria a troca de hospedagem virar mudança incompatível de contrato. A mesma fronteira vale para a prosa da spec (`MD-0030`): a âncora cita a marca, o requisito cita a função.

## Consequências

- O contrato cresce de três para **seis** chaves, de forma **aditiva**: `atualizado_em`, `versao` e `commit` permanecem intocados em nome, tipo e semântica, e cabem em `/api/v1` pela regra que o próprio contrato escreveu para si. `openapi/status.yaml` precisa acompanhar.
- A rota **deixou de ser pura**, e a guarda de privacidade da ADR 0008 teve o alcance ampliado: "não vazar" passou a incluir não vazar host, URL de conexão nem trecho de SQL no corpo, aferido sobre o corpo serializado **nos dois estados do banco**.
- Nasce `infra/saude.ts`, adaptador de uma função só, único importador de `saude()` em produção, o que preserva `database.ts` como ponto de acesso exclusivo ao banco. Exceção fora do contrato interno não escapa dele: cai no balde `consulta` e faz barulho, porque derrubar o healthcheck trocaria degradação por indisponibilidade.
- 🔴 **O acoplamento mais frágil da plataforma** entrou aqui: `ehEstouroDeTempo` reconhece o estouro de conexão por uma **frase** que o driver emite, e precisa reconhecê-la antes do erro de conexão, que casaria com o prefixo comum. Atualização de `pg` é gatilho de revisão (watch W007).
- A conferência de um deploy deixa de exigir o painel do provedor: `npm run status:conferir` lê o SHA, a idade do deploy e o estado do banco.

## Status

Ativa. Gatilho de revisão registrado e observável: consumidor que consulte o status em laço move a verificação para rota própria.
