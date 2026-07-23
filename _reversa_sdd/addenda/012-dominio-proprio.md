# Adendo — Domínio próprio (`apsinteligente.app`)

> Feature: `012-dominio-proprio` (mudança de infraestrutura, fora do ciclo forward)
> Data: `2026-07-23`
> Cenário: `legado`

## Vigência

Vigente desde 2026-07-23.

## Resumo da entrega

A plataforma ganhou domínio próprio, `apsinteligente.app`, apontado por configuração de
DNS ao projeto da Vercel. A produção deixou de ser servida apenas pela URL padrão do
provedor (`aps-inteligente.vercel.app`) — que permanece resolvendo em paralelo, sem
quebra de links antigos — e passou a ter endereço de marca. A direção atual do DNS é
**apex → `www`**: `https://apsinteligente.app` responde `308` e redireciona para
`https://www.apsinteligente.app`, o host que serve `200` diretamente. Registrado como
observação, caso se prefira futuramente inverter a canonicidade (apex nu como canônico).

Mudança conduzida **fora do ciclo forward por proporcionalidade** — infra de rede, sem
código de domínio nem de apresentação. O contrato de `GET /api/v1/status` foi verificado
byte a byte no domínio novo: `200`, corpo `{atualizado_em, versao, commit}`,
`Cache-Control: no-store`, CSP completa e `commit` igual ao HEAD de `main` (`07246ea`).
A migração é posterior às features 002–011; por isso é registrada adiante, e não
retroprojetada nos artefatos congelados daquelas entregas (o adendo 002 continua correto
ao dizer que, à época, "domínio próprio ficou fora do escopo").

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/openapi/status.yaml` | `servers[0].url` | regra-alterada | URL de produção passa de `https://aps-inteligente.vercel.app` para `https://apsinteligente.app`, com nota do redirect `308` apex → `www`; o contrato do corpo e os cabeçalhos permanecem byte a byte |
| `README.md` | health-check de produção | regra-alterada | Comando de verificação passa a `curl -iL https://apsinteligente.app/api/v1/status` (o `-L` segue o `308` do apex e exibe o `200`); rótulo deixa de ser "URL padrão do provedor" |
| `_reversa_sdd/domain.md` | privacidade por construção (ADR 0002/0008) | inalterado (reafirmado) | Só muda o hostname público; nenhum fetch, estado ou dado clínico novo; o health-check segue sem autenticação e sem PII |
| `_reversa_sdd/c4-components.md` | `GET /api/v1/status` | delta-de-contrato-externo (nenhum) | Mesmo contrato, mesmo `no-store`, mesma CSP; apenas o endereço de origem ganhou forma de marca |
| `_reversa_sdd/architecture.md` | integrações externas em runtime | inalterado (reafirmado) | A Vercel segue como provedor; o domínio próprio é camada de rede à frente do mesmo deploy, sem nova dependência de runtime |

## Registro histórico preservado

As referências ao antigo `aps-inteligente.vercel.app` nos artefatos append-only da
extração — `_reversa_forward/002/actions.md`, `_reversa_forward/002/progress.jsonl`,
`_reversa_sdd/addenda/002-producao-pagina-e-api-status.md`,
`_reversa_forward/007/onboarding.md` e `_reversa_forward/008/requirements.md` — **não
foram alteradas**: descrevem o estado verdadeiro no momento que registram. Apenas os
documentos vivos (o contrato OpenAPI e o README) passaram a apontar o canônico atual.

## Regras sob vigilância

Nenhum watch item novo. A única invariante em jogo — o contrato público de
`GET /api/v1/status` (corpo, `no-store`, CSP, `commit == main`) — já está coberta pelos
watch items da feature 002 (adendo 002) e foi reverificada no domínio novo nesta sessão.

Observações sem peso de regressão:

- `O-12-01` — DNS atual no sentido apex → `www` (canônico servido: `www.apsinteligente.app`); avaliar inversão para apex nu se for a preferência de marca.
- `O-12-02` — o `*.vercel.app` permanece ativo; links antigos seguem válidos, sem redirecionamento forçado para o domínio próprio.
- `O-12-03` — o domínio próprio é a URL declarada na solicitação da chave da API USPSTF (AHRQ), pendente de aprovação; ver a feature futura de rastreamento preventivo por perfil.

## Fontes

- `README.md` — health-check de produção atualizado para `apsinteligente.app`
- `_reversa_sdd/openapi/status.yaml` — `servers.url` de produção atualizado
- Verificação de liveness (2026-07-23): `curl -iL https://apsinteligente.app/api/v1/status` → `200`, contrato correto, `commit 07246ea`
- Configuração de DNS + domínio no painel da Vercel (externa ao repositório)
