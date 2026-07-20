# Data Delta: Publicação em produção da primeira página e API de saúde (status)

> Identificador: `002-producao-pagina-e-api-status`
> Data: `2026-07-19`
> Base: `_reversa_sdd/erd-complete.md` (entidades em memória; sem banco por design)

## 1. O que não muda

- Não há banco de dados e esta feature **não introduz um** (`architecture.md#3`; o gatilho LGPD/autenticação da ADR 0002 permanece inativo).
- As entidades do domínio (`EntradaCalculo`, `SaidaCalculo` e variantes) não são tocadas.
- Nenhum dado clínico ou pessoal passa a trafegar ou persistir (fronteira MD-0011 preservada).

## 2. Estrutura nova: corpo do status (dado público de build, em memória)

Única estrutura de dados nova, montada por requisição no handler e nunca persistida:

| Campo | Tipo | Origem | Exemplo |
|---|---|---|---|
| `atualizado_em` | string, ISO 8601 UTC | `new Date().toISOString()` no momento da resposta | `"2026-07-20T00:45:00.000Z"` |
| `versao` | string | `version` do manifesto do projeto | `"0.1.0"` |
| `commit` | string | Variável de ambiente do provedor com o SHA do deploy; fallback `"local"` fora do provedor | `"31c7346..."` |

Classificação de privacidade: **metadados públicos do produto** — categoria explicitamente permitida pela denylist do teste de contrato histórico ("versão, commit, dependências, fonte clínica são permitidos").

## 3. Campos removidos

Nenhum. O placeholder `pages/api/v1/index.js` removido (D-01) não continha estrutura de dados.

## 4. Migrações necessárias

n/a — sem persistência, sem migração. A primeira publicação (plano de migração do roadmap §8) é operacional, não de dados.
