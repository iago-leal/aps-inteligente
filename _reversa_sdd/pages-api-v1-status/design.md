# pages/api/v1/status — Design Técnico

> `design.md` · Re-extração 2. Next.js Pages Router API route.

## Interface

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/api/v1/status` | — | `{ atualizado_em, versao, commit }` | 200 |
| (outros) | `/api/v1/status` | — | `{ erro }` + `Allow: GET` | 405 |

Corpo de sucesso:

| Campo | Tipo | Origem |
|-------|------|--------|
| `atualizado_em` | ISO 8601 string | `new Date().toISOString()` |
| `versao` | string | `package.json.version` |
| `commit` | string | `VERCEL_GIT_COMMIT_SHA` ?? `"local"` |

## Fluxo Principal

1. Se `method !== "GET"`: seta `Allow: GET`, responde `405` com `{ erro }`. `status.ts:11-15` 🟢
2. Seta `Cache-Control: no-store`. `status.ts:18` 🟢
3. Responde `200` com o corpo de status. `status.ts:19-23` 🟢

## Fluxos Alternativos

- **Método não-GET:** `405` com `Allow` (RN-04). 🟢
- **Sem variável de commit (ambiente local):** `commit: "local"`. 🟢

## Dependências

- `next` (`NextApiRequest`/`NextApiResponse`). 🟢
- `package.json` (import do manifesto para a versão). 🟢
- `process.env.VERCEL_GIT_COMMIT_SHA` (injetada pela Vercel no build). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Sem estado, sem autenticação, sem dado clínico (ADR 0008) | `status.ts:5-7` | 🟢 |
| `no-store` para status sempre fresco (RN-05) | `status.ts:18` | 🟢 |
| Versionamento por caminho (`/api/v1` → `/api/v2`) | `status.ts:6-7` | 🟢 |

## Estado Interno

Nenhum. Handler puro por requisição. 🟢

## Observabilidade

O próprio endpoint é observabilidade: expõe versão e SHA do deploy para monitoramento externo. 🟢

## Riscos e Lacunas

- 🟢 Contrato fixado e verificado por suíte de contrato (16/16) e regression-watch das features.
