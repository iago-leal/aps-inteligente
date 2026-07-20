# Contrato HTTP — `GET /api/v1/status`

> Feature: `002-producao-pagina-e-api-status`
> Data: 2026-07-19
> Realiza: RF-02, RF-03, RF-05 (RN-01, RN-02, RN-04, RN-05)
> Substitui o contrato histórico `_reversa_forward/002-endpoints-status-api-v1/interfaces/http-get-api-v1-status.md` (bundle, commit `e5e52a8`): o corpo deixa de ser evolutivo e o cache passa a ser proibido.

## Propósito

Observabilidade mínima do deploy: responder 200 confirma que a aplicação está no ar; os campos do corpo confirmam **qual** estado está publicado. Endpoint público, sem autenticação, sem estado, sem dado clínico (ADR 0008).

## Request

| Aspecto | Valor |
|---------|-------|
| Método | `GET` |
| Caminho | `/api/v1/status` |
| Parâmetros | nenhum (query e corpo ignorados; o handler jamais lê corpo — guarda ADR 0008) |
| Autenticação | nenhuma |
| Headers exigidos | nenhum |

## Response

### `200 OK` — site no ar

Headers obrigatórios:

| Header | Valor |
|---|---|
| `Content-Type` | `application/json; charset=utf-8` |
| `Cache-Control` | `no-store` (RN-05: resposta jamais servida de cache) |
| `Set-Cookie` | **ausente** (RN-02, invariável) |

Corpo (contrato fixo; mudança incompatível exige `/api/v2`):

```json
{
  "atualizado_em": "2026-07-20T00:45:00.000Z",
  "versao": "0.1.0",
  "commit": "31c7346abc..."
}
```

| Campo | Tipo | Semântica |
|---|---|---|
| `atualizado_em` | string ISO 8601 UTC | Momento em que a resposta foi gerada (prova de frescor) |
| `versao` | string | Versão do manifesto do projeto no build publicado |
| `commit` | string | SHA do commit publicado; `"local"` quando fora do provedor |

### `405 Method Not Allowed` — método diferente de GET

| Header | Valor |
|---|---|
| `Allow` | `GET` |

Corpo: JSON de erro simples (sem eco da requisição).

### `500` — falha inesperada

Improvável (handler sem I/O); se ocorrer, é bug interno — falha barulhenta, registrada pelo painel do provedor, sem dado de requisição no corpo.

## Denylist de privacidade (RN-02, invariável)

A resposta serializada jamais contém: segredo, token, chave, header de autorização, variável de ambiente (exceto o SHA público do commit), nem dado clínico ou pessoal (padrões: paciente, prontuário, glicemia, CPF, CNS, nascimento). Herdada do teste de contrato histórico e verificada por `tests/contract/api/v1/status.test.ts`.

## Propriedades

- **Idempotência:** total — leitura pura, sem efeito colateral.
- **Cache:** proibido (`no-store`); consumidores podem confiar que um 200 é sempre atual.
- **Timeout:** padrão da plataforma; irrelevante (sem I/O).
- **Versionamento:** dentro de `/api/v1`, apenas mudanças aditivas de campos.

## Consumidores conhecidos

1. Mantenedor via `curl`/navegador (verificação de deploy — `onboarding.md` §5).
2. Suíte de contrato (`npm run test:api`), local e no CI (job de contrato, contra o build de produção).
3. Futuro (fora desta feature): monitor externo de disponibilidade.
