# `pages/api/v1/status` — Endpoint de status do deploy

> `requirements.md` · **Re-extração 4 (2026-07-28)**. Features 002 e **022**.
> **A inversão desta passagem.** Até aqui, a extração afirmava e o código negava: `infra/database.ts`
> era descrita como usada pelo healthcheck, e o seu único importador era um teste. A partir da
> feature 022 é o contrário — o handler consulta o banco de verdade, e a extração é que estava
> atrasada.

## Visão Geral

Health-check público da plataforma. `GET /api/v1/status` devolve **seis** chaves: carimbo de
tempo, versão do manifesto, SHA do commit, data de publicação, ambiente e o estado do banco.
Sem autenticação, sem estado próprio e sem qualquer dado clínico (ADR 0008). Contrato
versionado: mudança incompatível do corpo exige `/api/v2`. 🟢

## Responsabilidades

- Responder `200` a `GET` com as seis chaves. 🟢
- Consultar o banco e traduzir o resultado em `integro` ou `degradado` com causa. 🟢
- Rejeitar métodos diferentes de `GET` com `405` e `Allow: GET`. 🟢
- Impedir cache da resposta. 🟢
- Declarar o ambiente de execução: produção, pré-visualização ou local. 🟢

## Regras de Negócio

| ID | Regra | Confiança |
|----|-------|-----------|
| RN-01 | O Pages Router entrega qualquer método ao handler; a discriminação é do próprio código. | 🟢 |
| RN-02 | Status cacheado mente: a resposta nunca sai de cache. | 🟢 |
| RN-03 | **Responde `200` em todo estado do banco, inclusive degradado.** As seis calculadoras são integralmente cliente e seguem servindo com o banco fora; um `503` afirmaria uma queda que não houve (`MD-0031`). | 🟢 |
| RN-04 | O estado do banco é `integro` ou `degradado`, e o degradado traz a causa entre quatro: `conexao`, `consulta`, `configuracao` e `tempo_esgotado`. | 🟢 |
| RN-05 | Erro fora do contrato de `saude()` é registrado em log estruturado e reduzido a `degradado` com causa `consulta` — jamais propagado. | 🟢 |
| RN-06 | O ambiente vem de `VERCEL_ENV`, com `local` como padrão. | 🟢 |
| RN-07 | A data de publicação vem de `APS_PUBLICADO_EM`, e é nula quando ausente. | 🟢 |
| RN-08 | Público, sem autenticação, sem estado, sem dado clínico. | 🟢 |
| RN-09 | Corpo incompatível exige nova versão de caminho. | 🟢 |
| RN-10 | **A dependência não essencial não governa o código HTTP** (ADR 0020): o banco é infraestrutura acessória ao produto, e a sua queda não derruba a resposta. | 🟢 |

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|--------------------|
| RF-01 | Responder `GET` com as seis chaves. | Must | `200` com `atualizado_em`, `versao`, `commit`, `publicado_em`, `ambiente` e `banco`. |
| RF-02 | Consultar o banco a cada requisição. | Must | Suíte de contrato com caso negativo: banco fora produz `degradado`, causa `conexao`. |
| RF-03 | Impedir cache. | Must | `Cache-Control: no-store`. |
| RF-04 | Rejeitar não-`GET`. | Must | `405` com `Allow: GET` e corpo de erro. |
| RF-05 | Responder `200` também no estado degradado. | Must | Teste com banco derrubado. |
| RF-06 | Declarar o ambiente. | Should | `producao`, `pre-visualizacao` ou `local`. |
| RF-07 | Respeitar o teto de tempo configurado. | Must | `APS_TIMEOUT_SAUDE_MS=1` com banco de pé produz causa `tempo_esgotado`. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Sem autenticação, sem estado, sem dado clínico; o host do banco sai mascarado nos logs. | `pages/api/v1/status.ts`; `infra/database.ts:hostMascarado` | 🟢 |
| Disponibilidade | A rota responde com o banco fora; a degradação é informada, não propagada. | `infra/saude.ts` | 🟢 |
| Desempenho | Teto de tempo derivado de `APS_TIMEOUT_SAUDE_MS`, padrão de 3.000 ms, aplicado à conexão e à consulta. | `infra/database.ts` | 🟢 |
| Observabilidade | Erro fora do contrato vira log estruturado em JSON, com nível, origem e causa. | `infra/saude.ts` | 🟢 |
| Cache | `no-store` explícito. | `status.ts` | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: banco íntegro
  Dado o banco disponível
  Quando GET /api/v1/status é processado
  Então retorna 200 com as seis chaves
  E banco.estado é "integro"

Cenário: banco fora
  Dado o banco derrubado
  Quando GET /api/v1/status é processado
  Então retorna 200, e não 503
  E banco.estado é "degradado" com causa "conexao"

Cenário: teto de tempo
  Dado APS_TIMEOUT_SAUDE_MS igual a 1 e o banco de pé
  Quando GET /api/v1/status é processado
  Então banco.estado é "degradado" com causa "tempo_esgotado"

Cenário: método não permitido
  Dado uma requisição POST
  Então retorna 405 com Allow: GET e corpo de erro
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Seis chaves no corpo | Must | Razão de existir do endpoint. |
| `200` em todo estado do banco | Must | O produto continua servindo; outro código mentiria. |
| Consulta real ao banco | Must | Sem ela, o healthcheck não verificava o que prometia. |
| Sem cache | Must | Status cacheado é status falso. |
| Rejeitar não-`GET` | Must | Contrato HTTP correto. |
| Ambiente declarado | Should | Distingue produção de pré-visualização na conferência. |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `pages/api/v1/status.ts` | `status` (handler `async`), `ambiente` | 🟢 |
| `infra/saude.ts` | `verificarBanco`, `EstadoDoBanco` | 🟢 |
| `infra/database.ts` | `saude`, `ErroDeBanco`, `CausaDeErroDeBanco` | 🟢 |
| `package.json` | `version`, lida no corpo | 🟢 |
| `scripts/conferir-producao.mts` | Consumidor do endpoint | 🟢 |

> **Dívida encerrada nesta passagem:** a descrição da rota como sem I/O, que `code-analysis.md`
> e `architecture.md` §1, §2 e §4 mantinham desde a primeira extração.
