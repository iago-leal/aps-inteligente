# `pages/api/v1/status` — Contrato Externo

> `contracts.md` · **Re-extração 4 (2026-07-28)**. Contrato HTTP público e versionado.
> Espelha `_reversa_forward/022-status-healthcheck-e-deploy/interfaces/`.
> **Corpo ampliado de três para seis chaves na feature 022, por acréscimo — nenhum campo
> existente mudou de nome ou de semântica**, e por isso o caminho continua em `/api/v1`.

## Endpoint

`GET /api/v1/status` — público, sem autenticação, sem estado próprio.

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
  "atualizado_em": "2026-07-28T23:41:07.412Z",
  "versao": "1.0.0",
  "commit": "a422b60...",
  "publicado_em": "2026-07-28T23:38:00.000Z",
  "ambiente": "producao",
  "banco": { "estado": "integro" }
}
```

| Campo | Tipo | Semântica |
|-------|------|-----------|
| `atualizado_em` | string ISO 8601 (UTC) | Instante da resposta. |
| `versao` | string (semver) | `package.json.version` no build. |
| `commit` | string | SHA do commit, ou `"local"` fora da Vercel. |
| `publicado_em` | string ISO 8601 ou `null` | `APS_PUBLICADO_EM`; nulo quando ausente. |
| `ambiente` | `"producao" \| "pre-visualizacao" \| "local"` | Derivado de `VERCEL_ENV`. |
| `banco` | objeto | Estado do banco, verificado a cada requisição. |

### O campo `banco`

```json
{ "estado": "integro" }
```

```json
{ "estado": "degradado", "causa": "conexao" }
```

| `estado` | `causa` | Quando |
|----------|---------|--------|
| `integro` | — | A consulta de saúde respondeu dentro do teto. |
| `degradado` | `conexao` | Recusa, reinício, host inexistente, senha inválida, autorização negada, banco inexistente ou servidor subindo. |
| `degradado` | `consulta` | Falha na execução, ou rejeição fora do contrato de `saude()`. |
| `degradado` | `configuracao` | `DATABASE_URL` ausente ou malformada. |
| `degradado` | `tempo_esgotado` | Estouro do teto na conexão ou na consulta. |

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

- **`200` em todo estado do banco, inclusive degradado.** As calculadoras são integralmente
  cliente e seguem servindo com o banco fora; `503` afirmaria uma queda que não houve
  (`MD-0031`, ADR 0020). 🟢
- `Cache-Control: no-store` sempre presente na resposta de sucesso. 🟢
- Métodos diferentes de `GET` recebem `405` com `Allow: GET`. 🟢
- O corpo nunca contém dado clínico nem segredo. O host do banco, quando aparece em log, sai
  mascarado. 🟢
- **Estabilidade:** mudança incompatível exige `/api/v2`. Acréscimo de campo, como o desta
  passagem, não é incompatível. 🟢

## Verificação

| Verificação | Onde |
|-------------|------|
| Status, cabeçalhos e forma do corpo | Suíte de contrato, com **caso negativo** de banco fora |
| Estado degradado por conexão | `npm run db:down`, depois a suíte |
| Estado degradado por tempo | `APS_TIMEOUT_SAUDE_MS=1` com o banco de pé |
| Conferência em produção | `npm run status:conferir`, com `--exigir-saudavel` opcional |

> O watch **W005** da feature 003 — "o endpoint não consulta o banco" — foi **revogado** pela
> feature 022. O **W006**, que trata da suíte de contrato com caso negativo, permanece vigente
> e foi ampliado. O `legacy-impact.md` da 022 trocou os dois números, e a correção está no
> adendo 022.
