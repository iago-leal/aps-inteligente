# pages/api/v1/status — Contrato Externo

> `contracts.md` · Re-extração 2. Contrato HTTP público e versionado. Espelha `_reversa_forward/002-producao-pagina-e-api-status/interfaces/http-get-api-v1-status.md`.

## Endpoint

`GET /api/v1/status` — público, sem autenticação, sem estado.

## Requisição

Sem corpo, sem parâmetros, sem cabeçalhos obrigatórios.

## Resposta 200 (sucesso)

```http
HTTP/1.1 200 OK
Cache-Control: no-store
Content-Type: application/json
```

```json
{
  "atualizado_em": "2026-07-23T12:34:56.789Z",
  "versao": "1.0.0",
  "commit": "036c0b0..."
}
```

| Campo | Tipo | Semântica |
|-------|------|-----------|
| `atualizado_em` | string ISO 8601 (UTC) | Instante da resposta |
| `versao` | string (semver) | `package.json.version` no build |
| `commit` | string | SHA do commit (`VERCEL_GIT_COMMIT_SHA`) ou `"local"` fora da Vercel |

## Resposta 405 (método não permitido)

```http
HTTP/1.1 405 Method Not Allowed
Allow: GET
Content-Type: application/json
```

```json
{ "erro": "Método não permitido; use GET." }
```

## Invariantes do contrato

- `Cache-Control: no-store` **sempre** presente na resposta de sucesso (RN-05). 🟢
- Métodos diferentes de `GET` recebem `405` com `Allow: GET` (RN-04). 🟢
- O corpo nunca contém dado clínico nem segredo (ADR 0008). 🟢
- **Estabilidade:** mudança incompatível no corpo exige novo caminho `/api/v2` — `/api/v1` não substitui campos existentes. 🟢

## Verificação

- Suíte de contrato (16/16) valida status, cabeçalhos e forma do corpo.
- Regression-watch das features 002+ acompanha byte a byte este contrato.
