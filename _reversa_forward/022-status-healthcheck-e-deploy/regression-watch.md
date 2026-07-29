# Regression watch — feature 022, o healthcheck passa a verificar o que promete

> Identificador: `022-status-healthcheck-e-deploy`
> Data: 2026-07-28
> Origem: a seção "Modificadas" de `legacy-impact.md`

O que esta lista vigia não é a feature: é o que precisa continuar **verdadeiro** depois dela. Cada
item nasceu de uma regra 🟢 do legado que foi alterada, e diz o sinal pelo qual a próxima extração
reconhece que ela deixou de valer.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|---|---|---|---|---|
| W001 | `interfaces/conexao-banco.md` §0; watch **W005** da feature 003 (revogado por esta) | `pages/api/v1/status.ts` **importa** `infra/saude` e a rota consulta o banco a cada requisição. A ausência da chamada deixou de ser a regra; a disciplina dela passou a ser | presença | A extração voltar a afirmar "o endpoint não consulta o banco", ou o handler deixar de chamar `verificarBanco` sem que outra spec o substitua |
| W002 | `interfaces/http-get-api-v1-status.md`, "Response" | O corpo tem **seis** chaves na raiz, e `atualizado_em`, `versao` e `commit` permanecem entre elas com o mesmo nome, tipo e semântica da feature 002 | presença | Qualquer das três antigas reaninhada, renomeada ou com significado trocado; ou chave nova na raiz sem RF que a origine |
| W003 | `interfaces/http-get-api-v1-status.md`, "200 OK"; `MD-0031` | O código é **200 em todo estado do banco**, inclusive degradado, com `no-store` e sem `Set-Cookie` | presença | 503, 500 ou qualquer não-200 em resposta a banco fora; leitura de "degradado" como "produto fora" na documentação |
| W004 | `interfaces/conexao-banco.md` §3; `data-delta.md` §2.2 | `CausaDeErroDeBanco` tem **quatro** valores, e `tempo_esgotado` é distinto de `conexao`: instância suspensa que demora a despertar não se lê como banco fora | presença | Cancelamento por tempo voltando a cair em `consulta` ou em `conexao`; quinta causa sem contrato atualizado |
| W005 | `interfaces/conexao-banco.md` §2; roadmap D-03 | O teto é imposto **no servidor**, por `statement_timeout`, e o cliente é descartado no caminho de erro. `Promise.race` e `query_timeout` seguem proibidos pelo nome | ausência | Aparecimento de `Promise.race`, `query_timeout` ou `AbortSignal.timeout` em `infra/database.ts`; consulta lenta que responde ao chamador e continua viva no servidor |
| W006 | `interfaces/conexao-banco.md` §2; achado A001 de `actions.md` | Teto explícito não contamina a conexão devolvida: o padrão é restaurado antes de o cliente voltar ao pool | presença | Consulta que passa a estourar por herdar o teto pequeno de uma chamada anterior; remoção do `finally` que restaura |
| W007 | `infra/database.ts`, `ehEstouroDeTempo`; achado A004 | O estouro na espera pela conexão é reconhecido como `tempo_esgotado`, e não como `conexao`, inclusive pela frase "Connection terminated due to connection timeout" que o driver emite | redação | Atualização de `pg` mudando a mensagem sem que a regex acompanhe; `APS_TIMEOUT_SAUDE_MS=1` com o banco de pé voltando a produzir `causa: "conexao"` |
| W008 | `interfaces/conexao-banco.md` §1; roadmap D-06 | O teto padrão é 3 000 ms, vem de `APS_TIMEOUT_SAUDE_MS`, e valor malformado cai no padrão **registrando log**, jamais em silêncio | presença | Teto chumbado no código, ou `NaN` desligando a proteção sem linha de log |
| W009 | `interfaces/http-get-api-v1-status.md`, "Denylist"; RF-06 | A denylist é aferida sobre o corpo serializado nos **dois** estados do banco, e alcança host, URL de conexão e trecho de SQL | presença | Bloco degradado do teste de contrato removido, ou denylist reduzida à lista da 002; `API_BASE_URL_DEGRADADO` desaparecendo do CI |
| W010 | `interfaces/http-get-api-v1-status.md`, campo `ambiente`; roadmap D-05 | `ambiente` é vocabulário próprio (`producao`, `pre-visualizacao`, `local`), e o valor do provedor jamais é repassado cru | presença | `production`/`preview` aparecendo no corpo; inferência de ambiente pelo `Host` da requisição |
| W011 | `interfaces/http-get-api-v1-status.md`, campo `publicado_em`; roadmap D-04 | `publicado_em` é carimbo de **build**, idêntico entre duas consultas ao mesmo deploy e distinto entre deploys | presença | Valor mudando entre consultas ao mesmo deploy (sinal de `new Date()` em runtime), ou `null` em produção |
| W012 | `interfaces/conexao-banco.md` §5, "Vigilância nova" (herdeira do W002 da 003) | O banco continua com **um consumidor só**, e agora ele se chama `infra/saude.ts`. Nenhum módulo fora de `infra/` importa `infra/database` | ausência | Import de `infra/database` em `models/`, `interface/`, `pages/` ou `scripts/` |
| W013 | roadmap D-09; RF-08 | `scripts/conferir-producao.mts` lê os campos novos como **opcionais**: ausência é "desconhecido", nunca erro de apuração, e os códigos de saída seguem respondendo à defasagem | presença | Campo ausente produzindo saída 2; `--exigir-saudavel` alterando a semântica dos códigos de hoje em vez de acrescentar-se a ela |
| W014 | roadmap D-08; watch W007 da feature 003 | O CI mantém **três** jobs; o estado degradado é exercitado por um segundo servidor dentro do job `contrato`, e `verificacao` e `deploy` seguem intocados | presença | Quarto job; segundo servidor virando job próprio; `DATABASE_URL` chegando ao job de deploy |

## Observações

Sem peso de regressão. Vigiam premissas que não eram 🟢 no legado, ou dívida herdada que esta
feature encontrou e não podia quitar.

| ID | O que é | Por que fica de fora do watch |
|---|---|---|
| O-22-01 | A norma de redação alcança o `README.md`, e dois travessões escritos aqui reprovaram `tests/unit/textos/norma.test.ts` antes de serem corrigidos | É regra já vigiada por teste próprio (`MD-0020`); o registro serve de aviso a quem tratar o README como documento interno |
| O-22-02 | `README.md` reprova `prettier --check`, e **já reprovava no `HEAD`** (conferido por `git show`) | Dívida alheia, na mesma família de `O-21-06`; corrigi-la aqui misturaria formatação de terceiros com a entrega |
| O-22-03 | `ambiente` em pré-visualização não foi observado deste repositório | Premissa 🟡 de D-05, e a única que sobrou: verificável no primeiro deploy de preview, com o passo 9 do `onboarding.md` |
| O-22-04 | A causa atribuída a erro que não é `ErroDeBanco` foi escolhida na execução (`consulta`), preenchendo lacuna do contrato | Achado A002; caminho que, pelo próprio contrato, só se atinge por bug interno |
| O-22-05 | Os literais novos da rota ficaram **abaixo da régua** do inventário textual, e T012 não teve o que declarar | Achado A003; declaração órfã seria peso morto, e órfãs não são verificadas hoje |
| O-22-06 | O contrato e o roadmap citam o watch **W006** da 003 onde deveriam citar o **W005** | Erro de referência, não de regra; corrigido em `legacy-impact.md` e a levar ao adendo por `/reversa-sync` |
| O-22-07 | A extração ainda descreve a rota de status como sem I/O em `code-analysis.md` (Módulo 13) e `architecture.md` | Só a re-extração ou o adendo reconciliam; é o inverso do defeito de origem, e agora é a extração que está atrasada em relação ao código |

## Histórico de re-extrações

### Re-extração 2026-07-28 23:50

> Re-extração nº 4 · 14 watch items verificados contra o SDD regenerado e contra o código.

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | `pages/api/v1/status.ts` importa `infra/saude` e consulta o banco a cada requisição. **A extração deixou de afirmar o contrário**: `code-analysis.md`, `architecture.md`, `pages-api-v1-status/` e `infra/` foram reescritas nesta passagem |
| W002..W004 | 🟢 verde | seis chaves na raiz, com as três antigas de nome, tipo e semântica intactos; 200 em todo estado do banco; `CausaDeErroDeBanco` com quatro valores |
| W005, W006 | 🟢 verde | **zero** ocorrências de `Promise.race`, `query_timeout` ou `AbortSignal` em `infra/database.ts`; o `finally` que restaura o teto padrão permanece |
| W007 | 🟢 verde | a frase do driver continua reconhecida como `tempo_esgotado`. Segue sendo o acoplamento mais frágil da feature, e está registrado como dívida **D-03** em `gaps.md` |
| W008, W009..W014 | 🟢 verde | teto padrão de 3.000 ms com log em valor malformado; vocabulário próprio de `ambiente`; `publicado_em` como carimbo de build; **um único importador** de `infra/database` (`infra/saude.ts`); CI com três jobs |

<!-- Preenchido pelo agente reverso ao rodar /reversa novamente. -->

| Item | Veredito | Nota |
|---|---|---|
| — | — | ainda não houve re-extração posterior a esta feature |

## Arquivadas

<!-- Itens que deixaram de valer, com a decisão que os aposentou. -->

Nenhum.
