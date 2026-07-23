# Arquitetura — aps-inteligente

> Regenerado pelo Reversa Architect em 2026-07-23 (**re-extração nº 3** — absorve as features 011–014 sobre a base 001–010).
> Substitui a versão de 2026-07-19, que cobria só a calculadora de insulina, a API v1 como container fantasma e o banco como ausência por design.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA
> Detalhes: `c4-context.md` · `c4-containers.md` · `c4-components.md` · `erd-complete.md` · `traceability/spec-impact-matrix.md`

## 1. Estilo arquitetural

🟢 **Plataforma web de calculadoras clínicas com domínio embarcado no cliente**, hoje com **quatro domínios clínicos independentes** sob uma casca comum. A calculadora única de insulinização (extração 1) tornou-se, pelas features 007, 010 e 014, uma **plataforma guarda-chuva**: uma home por seções despacha para quatro telas, cada qual sobre um domínio puro e uma fonte clínica única (ADR 0001/0011).

Três camadas com dependência estritamente unidirecional e regra clínica isolada de framework (ADR 0003):

```
pages (shell Next.js: home, rotas, PWA, API route)
  → interface/* (React + Primer: Moldura comum, telas, formulários, painéis, home)
    → models/* (quatro domínios puros: insulina, gestacao, cardiopatia-isquemica, risco-cardiovascular)
infra/database.ts (pool pg) — usada SÓ pelo healthcheck /api/v1/status; nunca toca dado clínico
```

🟢 Os quatro domínios são reconhecíveis como uma **família arquitetural** pelos invariantes que compartilham, todos rastreáveis a decisão registrada:

| Propriedade | Mecanismo | Decisão |
|---|---|---|
| Domínio puro | `models/*` não importa React, Next nem biblioteca externa | ADR 0003 |
| Uma fonte clínica por unit | Cada calculadora cobre só o que a sua fonte cobre; mescla proibida | ADR 0001/0011 |
| Erros como valores | `Saida*` union discriminada por `tipo`; exceção só para bug (`ErroDeInvariante` → painel honesto) | ADR 0004 |
| Rastreabilidade clínica | Toda saída carrega `ReferenciaClinica`; catálogo `REFERENCIAS`/`CONSTANTES` congelado por `Object.freeze` | ADR 0001 |
| Coleta total de ofensores | A validação nunca para no primeiro erro | regra 15 do `domain.md` |
| O motor informa, não escolhe | Insulina devolve `condutasAlternativas`; gestação, `veredito`; cardiopatia, estrato + conduta; risco CV, `riscoPct` + categoria | ADR 0005/0006 |
| Escopo = fonte | Fora do guia → `ForaDoEscopoDaFonte` (insulinas não NPH/Regular; idade fora de 30–69; 3.º trimestre; risco CV fora de 40–79 ou DCV prévia) | ADR 0009 |
| Privacidade por construção | Sem `fetch`/`storage` de dado clínico; único durável é o tema; `EventoDeErro` só transporta nome de classe | ADR 0002/0007 |
| Ritual de revisão só na insulina | Gestação, cardiopatia e risco CV não têm checkbox de confirmação — datar, estratificar e estimar risco não prescrevem dose | ADR 0012, D-08 |
| Aritmética de datas em dias epoch UTC | Gestação roda diferença de datas sobre `Date.UTC`, sem fuso local | ADR 0013 |
| Fonte de risco calibrada com a conduta | Risco CV usa as PCE, não a AHA PREVENT, porque o limiar de estatina da USPSTF foi calibrado sobre as PCE | ADR 0014 |

## 2. Containers e componentes

🟢 A superfície de runtime cresceu além do container único da extração 1. Hoje são **três containers reais** (diagramas em `c4-containers.md`):

1. **Aplicação web** — Next.js 16 (Pages Router, Turbopack) servida pela Vercel; o motor dos quatro domínios roda no cliente. Componentes-chave por camada em `c4-components.md`: as quatro fachadas de domínio (`CalculadoraInsulinaDM2`, `CalculadoraIdadeGestacional`, `CalculadoraCardiopatiaIsquemica`, `CalculadoraRiscoCardiovascular`) e a `Moldura` comum que embala home e telas. A produção é servida no domínio próprio `apsinteligente.app` (feature 012, apex → `www` 308).
2. **API route `/api/v1/status`** (feature 002) — antes fantasma, hoje realizada: Vercel Function pública, sem estado, sem dado clínico, contrato fixo (ADR 0008).
3. **Banco PostgreSQL** (feature 003) — antes ausência por design, hoje presente **sem dado clínico**: existe só para o healthcheck comprovar conectividade (Neon em produção; `compose.yaml` local na porta 5433).

Persiste um container de borda: `localStorage`, exclusivamente para a preferência de tema.

## 3. Dados

🟢 **Nenhum dado clínico é persistido** (ADR 0002). As entidades de cálculo dos quatro domínios são estruturas em memória, efêmeras por request; o ERD (`erd-complete.md`) as modela como composição de objetos imutáveis, com invariantes por value object. O banco PostgreSQL existe (feature 003) mas **não guarda nada de clínico**: `saude()` roda apenas `SELECT 1`. O único dado durável do sistema é o tema em `localStorage`. Gatilho registrado: introduzir persistência de dado clínico reabre LGPD, autenticação e specs (ADR 0002, `permissions.md`).

## 4. Integrações externas

🟢 **Nenhuma integração de runtime toca dado clínico.** O mapa de integrações:

| Integração | Natureza | Momento | Dado clínico |
|---|---|---|---|
| Vercel (`apsinteligente.app`, feature 012) | Build, CDN e execução de Function; domínio próprio à frente do deploy | runtime (deploy/serve) | não |
| Neon (Postgres, Vercel Marketplace) | Banco gerenciado do healthcheck | runtime (só `/api/v1/status`) | **não** — só `SELECT 1` |
| 4 fontes clínicas (SMS-Rio DM, SMS-Rio Pré-Natal, TeleCondutas Cardiopatia, ACC/AHA PCE 2013) | Dependência **editorial** (PDFs/guideline fora do repo) | dev-time (extração determinística) | fundamenta constantes |
| Link à AHA PREVENT (`professional.heart.org`) | `<a>` nativo no `ContextoDaFonte` do risco CV | navegação do usuário (não é fetch) | não — sai da CSP como navegação, não requisição |

🟢 A API v1, intenção não realizada na extração 1, é hoje um contrato explícito: `GET /api/v1/status` devolve `{atualizado_em, versao, commit}`, `Cache-Control: no-store`, 405 + `Allow: GET` para não-GET. Mudança incompatível do corpo exigiria `/api/v2` (ADR 0008).

## 5. Qualidade e testes

- 🟢 Pirâmide realizada: **37 arquivos de teste** (Vitest + Playwright + fast-check + axe-core). Unidade property-based por domínio (toda saída referenciada, doses realizáveis, determinismo, oráculo das 24 células do Quadro 2 na cardiopatia; equação PCE contra valores conhecidos e invariantes de risco 0–100/categoria/referência no risco CV); integração via Testing Library nas quatro telas; e2e Playwright + axe-baseline (0/0) por rota, com guardas geométricas de cabeçalho (features 011/013); contrato do `/api/v1/status` em suíte própria. Threshold alto em `models/**`.
- 🟡 Lint de fronteira de camadas (D-01) ainda confiado à disciplina — não há regra automática impedindo `models/*` de importar framework. Verificado hoje por revisão, não por ferramenta.

## 6. Dívidas técnicas

| # | Dívida | Evidência | Gravidade |
|---|---|---|---|
| 1 | Fronteira de camadas sem verificação automática (D-01) | `eslint.config.mjs` sem regra de import boundary | média — invariante central confiado à disciplina; hoje respeitado |
| 2 | Acoplamento residual `interface/comum` → `interface/calculadora` | `preferencia-de-tema.ts` não realocado (comentado no código) | baixa — dívida declarada, realocação adiada |
| 3 | ~~`globais.css` no teto de 400 linhas~~ **RESOLVIDA** | consolidação em `cabecalho.css` (011/013) baixou `globais.css` para 364 | — dívida amarela da re-extração 2 encerrada; nenhuma folha acima de 400 |
| 4 | `let proximoId` módulo-global em `formulario.tsx` (insulina) | ids de linhas dinâmicas | baixa — frágil sob HMR/StrictMode, funcional |
| 5 | Premissas clínicas 🟡 pendentes de validação | gestação (cortes 13+6/27+6, limites DUM/laudo); cardiopatia (estrato "baixa", cap ×2–×3); risco CV (faixas de clamp, cortes 5/7,5/20%, `raca="outra"`→branco, transportabilidade ao Brasil) | média — decisões de projeto, não bugs; a confirmar pelo prescritor |
| 6 | PDFs/guideline das quatro fontes fora do versionamento | MD-0008 | baixa por design — no risco CV, coeficientes validados contra `CVrisk`/`PooledCohort` mitigam parcialmente |

🟢 **Sem dívida de dependências:** stack recente (Next 16.2.10, React 19.2.4, TS 6, Primer 38, Vitest 4, pg 8.22), versões pinadas exatas, lockfile commitado. As features 011–014 não introduziram dependência nova. Sem duplicação de código relevante: o único "espelhamento" (faixas de validação UI/motor) importa a mesma constante — acoplamento deliberado anti-drift.

🟢 **Reconciliação:** as lacunas 🔴 de infraestrutura da extração 1 já estavam resolvidas na re-extração 2 (API v1, banco, specs). Nesta 3ª passagem, a dívida amarela remanescente (`globais.css` no teto) foi **encerrada** pela consolidação do cabeçalho; o novo domínio chega com fonte única, referências, testes e ADR próprio (0014).

## 7. Mapa de artefatos da extração

| Pergunta | Artefato |
|---|---|
| O que existe e onde | `inventory.md`, `dependencies.md` |
| Como funciona por dentro | `code-analysis.md`, `flowcharts/`, `data-dictionary.md` |
| Por que é assim | `domain.md`, `adrs/` (0001–0015), `state-machines.md`, `permissions.md` |
| Como se estrutura | `architecture.md` (este), `c4-*.md`, `erd-complete.md` |
| O que impacta o quê | `traceability/spec-impact-matrix.md` |
