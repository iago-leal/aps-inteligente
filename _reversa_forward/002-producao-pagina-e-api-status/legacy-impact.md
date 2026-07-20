# Legacy Impact: Publicação em produção da primeira página e API de saúde (status)

> Identificador: `002-producao-pagina-e-api-status`
> Data: `2026-07-19`
> Âncora: extração de legado (`_reversa_sdd/architecture.md`, `_reversa_sdd/domain.md`, 2026-07-19)
> Commit da entrega: `e719b61`

## 1. Impacto por arquivo

| Arquivo afetado | Componente (extração) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `pages/api/v1/status.ts` | API v1 — container fantasma (`architecture.md` §2; ADR 0008) | componente-novo | MEDIUM | Materializa a rota de saúde prevista e nunca reconstituída (`domain.md` §7); pública, sem dado clínico (MD-0011) |
| `pages/api/v1/index.js` (removido) | API v1 — placeholder vestigial (`architecture.md` §2; `domain.md` §7) | componente-extinto | LOW | Vestígio declarado da refundação; substituído pelo artefato real (D-01) |
| `tests/integration/api/v1/index.js` (removido) | Pirâmide de testes (`architecture.md` §5) | componente-extinto | LOW | Placeholder vazio que poluía o nível de integração (D-01) |
| `next.config.ts` | Shell Next.js (`architecture.md` §6, dívida 8) | regra-alterada | HIGH | Bloco `headers()` reconstituído de `ebad6a5`: CSP sem terceiros em produção + `Referrer-Policy` + `nosniff` em toda resposta (RN-06/RF-07; ADR 0002) |
| `vitest.api.config.ts` | Pirâmide de testes (`architecture.md` §6, dívida 3) | componente-novo | LOW | O script `test:api` do manifesto volta a funcionar; nível `contract` ganha config própria (D-05) |
| `tests/contract/api/v1/status.test.ts` | Pirâmide de testes — nível `contract` novo | componente-novo | LOW | Verifica o contrato fixo do status, denylist de privacidade e 405 (RF-02..05) |
| `tests/contract/plataforma/cabecalhos.test.ts` | Pirâmide de testes — nível `contract` novo | componente-novo | LOW | Verifica CSP e cabeçalhos de segurança contra o build de produção (RF-07) |
| `.github/workflows/ci.yml` | CI/CD (`architecture.md` §6, dívida 1) | componente-novo | MEDIUM | Três jobs: verificação (todo push), contrato contra `next start` e deploy gateado só em `main` (RF-06; D-07) |
| `vercel.json` | Publicação (`c4-context.md`; `architecture.md` §4) | delta-de-contrato-externo | MEDIUM | Auto-deploy por push desligado: o CI passa a ser o único caminho para produção (D-08) |
| — rota pública `GET /api/v1/status` | Integrações externas (`architecture.md` §4) | delta-de-contrato-externo | MEDIUM | Primeiro contrato HTTP público do sistema; corpo fixo, cache proibido (`interfaces/http-get-api-v1-status.md`) |

## 2. Diff conceitual por componente

**API v1.** O container fantasma da extração (pasta vazia respondendo falha não-deliberada) vira componente real: uma única rota de observabilidade, pura e sem I/O, que responde 200 com `{atualizado_em, versao, commit}` e 405 fora do GET. A fronteira MD-0011 permanece intacta — nenhum dado clínico ou pessoal trafega; a denylist do teste de contrato a vigia mecanicamente.

**Shell Next.js.** A dívida 8 é quitada: a CSP sem terceiros e os dois cabeçalhos de segurança que existiam no repo pré-refundação voltam, agora verificados por teste de contrato. A privacidade por arquitetura (ADR 0002) deixa de depender de disciplina e passa a ter verificação de regressão.

**Pirâmide de testes.** Nasce o nível `contract` previsto na doutrina: duas suítes que rodam contra o build de produção via `test:api` — script que estava quebrado desde a refundação (dívida 3, parte API). A parte e2e da dívida permanece aberta, fora do escopo desta feature.

**CI/CD e publicação.** A dívida 1 é quitada com gate de ponta a ponta: push em `main` só chega a produção se verificação e contrato passarem contra o mesmo alvo que vai ao ar. O contrato implícito com o provedor muda: a Vercel deixa de publicar por push (`vercel.json`) e passa a receber deploy do CI com secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).

**Domínio e interface.** `models/insulina/`, `interface/calculadora/` e as máquinas de estado da UI não foram tocados — zero linhas alteradas.

## 3. Preservadas (regras 🟢 da extração que continuam valendo)

- Todas as regras de domínio de `domain.md` §3 (início, titulação basal, intensificação, transversais e regras de interface com força de domínio) — nenhum arquivo de `models/` ou `interface/` foi alterado.
- `domain.md` §6, fronteiras de escopo: NPH/Regular apenas (MD-0009), sem orientações ao paciente, **sem persistência de dado clínico (MD-0003) e rotas de API só sem dado clínico (MD-0011)** — esta última deixou de ser hipotética e passou a ser exercida e testada.
- `architecture.md` §3: sem banco de dados, por design; o corpo do status é metadado público de build, nunca persistido.
- ADR 0002 (privacidade por arquitetura client-side), ADR 0005/0006 (motor não escolhe condutas; teto como alerta) — intocadas.
- Constantes clínicas (`domain.md` §4) e decisões AMB-01..10 — intocadas.

## 4. Modificadas (afirmações 🟢 da extração que a feature altera)

- `architecture.md` §2: "um container fantasma (`pages/api/v1/` vazio — ADR 0008)" — **deixa de valer**: o container agora é real, com a rota de status implementada.
- `architecture.md` §4: "A API v1 é intenção não realizada" — **realizada** nesta feature, exatamente no padrão que a própria ADR 0008 previa (rota sem dado clínico, guarda comportamental + teste de contrato).
- `architecture.md` §4 (implícito no c4-context): a Vercel como "build/CDN" com deploy implícito por push — **alterada**: deploy passa a ser explícito, via CI, com auto-deploy desligado.
- Contrato histórico do status (bundle `e5e52a8`, corpo evolutivo) — **substituído** pelo contrato fixo; registrado no cabeçalho de `interfaces/http-get-api-v1-status.md`.
