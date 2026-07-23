# Adendo: Publicação em produção da primeira página e API de saúde (status)

> Feature: `002-producao-pagina-e-api-status`
> Data: 2026-07-21
> Cenário: legado

## Vigência

Vigente desde 2026-07-21.

Superado pela re-extração de 2026-07-23.

## Resumo da entrega

A feature publicou em produção a primeira página da plataforma — a calculadora de insulina para DM2 — e reconstituiu a API v1 com seu primeiro endpoint de saúde, `GET /api/v1/status` (contrato fixo: `{atualizado_em, versao, commit}`, `Cache-Control: no-store`, 405 fora do GET). Como condição da subida, quitou três dívidas técnicas correlatas da extração: CI inexistente (dívida 1), script `test:api` quebrado (dívida 3, parte API) e cabeçalhos de segurança não verificados (dívida 8). Produção é a URL padrão do provedor (aps-inteligente.vercel.app); domínio próprio ficou fora do escopo.

**14 de 14 ações concluídas** (T001–T014). Desvios registrados no `progress.jsonl`: o deploy inaugural saiu pelo fallback manual autorizado durante a degradação do GitHub Actions de 2026-07-20 (os runs do CI concluíram verdes depois); em 2026-07-21 o secret `VERCEL_TOKEN` tornou-se inválido, deixando o job de deploy vermelho até rotação do token (ver O-04 do `regression-watch.md`).

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/architecture.md` | §2 Containers e componentes | componente-novo | O "container fantasma" `pages/api/v1/` deixa de existir como fantasma: `pages/api/v1/status.ts` é a única rota real da API v1 (GET → 200 corpo fixo; outros métodos → 405 `Allow: GET`), pura e sem I/O |
| `_reversa_sdd/architecture.md` | §2 (e `domain.md` §7, vestígio) | componente-extinto | Os placeholders vazios `pages/api/v1/index.js` e `tests/integration/api/v1/index.js` foram removidos; a rota declarada sem handler não existe mais |
| `_reversa_sdd/architecture.md` | §6 Dívidas técnicas, nº 8 | regra-alterada | `next.config.ts` voltou a ter `headers()`: CSP sem terceiros (só produção), `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff` — agora vigiados por teste de contrato; ler a dívida 8 como quitada |
| `_reversa_sdd/architecture.md` | §6 Dívidas técnicas, nº 3 | componente-novo | `vitest.api.config.ts` existe (include `tests/contract/**`) e `npm run test:api` roda verde contra o build de produção; nasce o nível `contract` da pirâmide com duas suítes. A parte e2e da dívida segue aberta |
| `_reversa_sdd/architecture.md` | §6 Dívidas técnicas, nº 1 | componente-novo | `.github/workflows/ci.yml` com três jobs: verificação (todo push), contrato contra `next start` e deploy de produção só em `main`, condicionado aos dois primeiros |
| `_reversa_sdd/architecture.md` | §4 Integrações (e `c4-context.md`) | delta-de-contrato-externo | O provedor deixou de publicar por push: `vercel.json` desliga o auto-deploy e o CI passa a ser o único caminho para produção (deploy via CLI com secrets) |
| `_reversa_sdd/architecture.md` | §4 Integrações | delta-de-contrato-externo | Primeiro contrato HTTP público do sistema: `GET /api/v1/status` com corpo fixo e cache proibido; mudança incompatível exige `/api/v2` (`_reversa_forward/002-producao-pagina-e-api-status/interfaces/http-get-api-v1-status.md`) |
| `_reversa_sdd/domain.md` | §7 Intenções declaradas e não realizadas | regra-nova | A intenção "API v1 / feature 002 histórica de observabilidade do deploy" está realizada no padrão da ADR 0008 (rota sem dado clínico, guarda comportamental + teste de contrato); ler o §7 descontando este item |

Nota de leitura: a fronteira MD-0011 (`domain.md` §6 — rotas de API só sem dado clínico) permanece intacta, mas deixou de ser hipotética: passou a ser exercida e vigiada mecanicamente pela denylist do teste de contrato. `models/insulina/`, `interface/calculadora/` e as máquinas de estado da UI não sofreram nenhuma alteração.

## Regras sob vigilância

W001, W002, W003, W004, W005, W006 — definições em `_reversa_forward/002-producao-pagina-e-api-status/regression-watch.md` (observações O-01..O-04 sem peso de regressão, incluindo o token da CLI como secret e a parte e2e da dívida 3).

## Fontes

- `_reversa_forward/002-producao-pagina-e-api-status/legacy-impact.md`
- `_reversa_forward/002-producao-pagina-e-api-status/regression-watch.md`
- `_reversa_forward/002-producao-pagina-e-api-status/requirements.md`
- `_reversa_forward/002-producao-pagina-e-api-status/progress.jsonl`
- `_reversa_forward/002-producao-pagina-e-api-status/interfaces/http-get-api-v1-status.md`
