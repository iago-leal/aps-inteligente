# `pages/api/v1/status` — Design Técnico

> `design.md` · **Re-extração 4 (2026-07-28)**. Rota de API do Pages Router.
> **O handler passou a `async` na feature 022** e é, hoje, o único código de aplicação que faz
> I/O em servidor.

## Interface

| Método | Caminho | Entrada | Saída | Códigos |
|--------|---------|---------|-------|---------|
| GET | `/api/v1/status` | — | seis chaves, ver `contracts.md` | 200 |
| outros | `/api/v1/status` | — | `{ erro }` com `Allow: GET` | 405 |

| Campo | Origem |
|-------|--------|
| `atualizado_em` | `new Date().toISOString()` |
| `versao` | `package.json.version` |
| `commit` | `VERCEL_GIT_COMMIT_SHA`, ou `"local"` |
| `publicado_em` | `APS_PUBLICADO_EM`, ou `null` |
| `ambiente` | `VERCEL_ENV`, traduzido |
| `banco` | `verificarBanco()` |

## Fluxo Principal

1. Método diferente de `GET`: define `Allow: GET` e responde `405`.
2. **`await verificarBanco()`** — a consulta real, que a extração anterior não conhecia.
3. Define `Cache-Control: no-store`.
4. Responde `200` com as seis chaves, qualquer que seja o estado do banco.

## A tradução do erro em estado

A cadeia tem três degraus, e cada um reduz o que pode escapar:

| Camada | Papel |
|--------|-------|
| `infra/database.ts` | Executa a consulta de saúde e converte a falha em `ErroDeBanco` com uma das quatro causas. |
| `infra/saude.ts` | Converte `ErroDeBanco` em `EstadoDoBanco`; erro **fora** do contrato vira log estruturado e cai em `degradado`/`consulta`. |
| `pages/api/v1/status.ts` | Publica o estado, sem decidir código HTTP a partir dele. |

O terceiro degrau é o que materializa ADR 0020: **a dependência não essencial não governa o
código HTTP**. O banco é acessório ao produto — as seis calculadoras rodam inteiras no cliente
—, e derrubar a resposta por causa dele afirmaria uma indisponibilidade que não existe. 🟢

## Fluxos Alternativos

- **Banco fora:** `200` com `degradado`/`conexao`. Reproduzível por `npm run db:down`.
- **Teto estourado:** `200` com `degradado`/`tempo_esgotado`. Reproduzível por
  `APS_TIMEOUT_SAUDE_MS=1` com o banco de pé.
- **`DATABASE_URL` ausente ou malformada:** `degradado`/`configuracao`.
- **Rejeição fora do contrato:** log estruturado e `degradado`/`consulta`.
- **Ambiente local:** `commit` igual a `"local"` e `ambiente` igual a `"local"`.

## Dependências

- `next` — tipos de requisição e resposta.
- `package.json` — o manifesto, importado para a versão.
- `infra/saude.ts` → `infra/database.ts` → `pg`.
- Variáveis: `VERCEL_GIT_COMMIT_SHA`, `VERCEL_ENV`, `APS_PUBLICADO_EM`, `DATABASE_URL`,
  `APS_TIMEOUT_SAUDE_MS`.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Sem estado, sem autenticação, sem dado clínico. | ADR 0008 | 🟢 |
| `no-store` para status sempre fresco. | `status.ts` | 🟢 |
| Versionamento por caminho; acréscimo de campo não é incompatível. | `contracts.md` | 🟢 |
| `200` em todo estado do banco. | `MD-0031`, ADR 0020 | 🟢 |
| A tradução de erro em estado mora em `infra/saude.ts`, e não no handler. | `infra/saude.ts` | 🟢 |
| O teto de tempo é configurável por ambiente, com padrão de 3.000 ms. | `infra/database.ts` | 🟢 |

## Estado Interno

Nenhum no handler. O pool de conexões, esse sim, é estado de módulo em `infra/database.ts`, e
sobrevive entre requisições na mesma instância. 🟢

## Observabilidade

O endpoint é, ele próprio, a observabilidade da plataforma: expõe versão, SHA, data de
publicação, ambiente e saúde do banco. O consumidor de referência é
`scripts/conferir-producao.mts`. 🟢

## Riscos e Lacunas

- 🟡 **`ehEstouroDeTempo` reconhece o estouro de conexão por uma frase do driver** — "Connection
  terminated due to connection timeout". Atualização de `pg` é gatilho de revisão. É o watch
  **W007** da feature 022, o único de tipo redação.
- 🟡 **O campo `ambiente` em pré-visualização ainda não foi observado** em deploy real
  (`O-22-03`): verificável no primeiro preview.
- 🟢 O contrato é verificado por suíte com caso negativo, o que a passagem anterior não tinha.
