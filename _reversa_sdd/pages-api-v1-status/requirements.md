# pages/api/v1/status — Endpoint de status do deploy

> `requirements.md` · Re-extração 2 (2026-07-23). Feature 002-producao-pagina-e-api-status.

## Visão Geral

Health-check público da plataforma: `GET /api/v1/status` devolve carimbo de tempo, versão do manifesto e SHA do commit. Observabilidade mínima do deploy, sem autenticação, sem estado e sem qualquer dado clínico (ADR 0008). Contrato versionado: mudança incompatível do corpo exige `/api/v2`. 🟢

## Responsabilidades

- Responder `200` a `GET` com `{ atualizado_em, versao, commit }`. 🟢
- Rejeitar métodos diferentes de `GET` com `405` e cabeçalho `Allow: GET`. 🟢
- Impedir cache da resposta (`Cache-Control: no-store`). 🟢

## Regras de Negócio

- **RN-04** O Pages Router entrega qualquer método ao handler; a discriminação de método é do próprio código. 🟢
- **RN-05** Status cacheado mente: a resposta jamais sai de cache (`no-store`). 🟢
- **ADR 0008** Público, sem autenticação, sem estado, sem dado clínico. 🟢
- **Versionamento** Corpo incompatível ⇒ `/api/v1` → `/api/v2`. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-02 | Responder GET com status | Must | `200` + `{ atualizado_em, versao, commit }` |
| RF-03 | Sem cache | Must | Cabeçalho `Cache-Control: no-store` |
| RF-05 | Rejeitar não-GET | Must | `405` + `Allow: GET` + `{ erro }` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Sem autenticação nem estado; sem dado clínico | `pages/api/v1/status.ts:5-7` | 🟢 |
| Cache | `no-store` explícito | `status.ts:18` | 🟢 |
| Observabilidade | SHA de commit via `VERCEL_GIT_COMMIT_SHA` (fallback "local") | `status.ts:22` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma requisição GET a /api/v1/status
Quando processada
Então retorna 200 com atualizado_em (ISO), versao (package.json) e commit, sem cache

Dado uma requisição POST a /api/v1/status
Quando processada
Então retorna 405 com Allow: GET e corpo de erro
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| GET com status (RF-02) | Must | Razão de existir do endpoint |
| Sem cache (RF-03) | Must | Status cacheado é status falso |
| Rejeitar não-GET (RF-05) | Must | Contrato HTTP correto |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `pages/api/v1/status.ts` | `status` (handler) | 🟢 |
| `package.json` | `version` (lida no corpo) | 🟢 |
