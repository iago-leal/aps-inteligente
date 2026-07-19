# Arquitetura — aps-inteligente

> Gerado pelo Reversa Architect em 2026-07-19.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA
> Detalhes: `c4-context.md` · `c4-containers.md` · `c4-components.md` · `erd-complete.md` · `traceability/spec-impact-matrix.md`

## 1. Estilo arquitetural

🟢 **Aplicação web estática com domínio embarcado no cliente**, em três camadas com dependência unidirecional e regra clínica isolada de framework (ADR 0003):

```
pages (shell Next.js)  →  interface/calculadora (React)  →  models/insulina (TypeScript puro)
```

Propriedades estruturais deliberadas, todas rastreáveis a decisão registrada:

| Propriedade | Mecanismo | Decisão |
|---|---|---|
| Privacidade por arquitetura | Sem backend com estado, sem fetch, sem telemetria; `EventoDeErro` só transporta nome de classe | ADR 0002/0007 |
| Rastreabilidade clínica | Toda saída carrega `ReferenciaClinica` (página/figura do guia); catálogo único `REFERENCIAS`/`CONSTANTES` congelado | ADR 0001 |
| Erros como valores | `SaidaCalculo` union; exceção só para bug interno (`ErroDeInvariante` → painel honesto) | ADR 0004 |
| Apoio à decisão, não decisão | Faixa em vez de dose no início; condutas equivalentes devolvidas sem escolha; teto como alerta | ADR 0005/0006 |
| Escopo = fonte | Fora do guia → `ForaDoEscopoDaFonte`; NPH/Regular apenas | ADR 0009 |
| Determinismo | Sem feature flag, sem parâmetro de ambiente, constantes congeladas | verificado por property tests |

## 2. Containers e componentes

🟢 Um único container de runtime (aplicação web servida pela Vercel; localStorage só para tema) e um container fantasma (`pages/api/v1/` vazio — ADR 0008). Componentes-chave: fachada `CalculadoraInsulinaDM2` orquestrando validação → escopo → regras (`inicio`, `titulacao-basal`, `intensificacao`) → pós-processamento; UI com máquina `EstadoResultado`, validação espelhada via `CONSTANTES` e ritual de revisão. Diagramas nos arquivos C4.

## 3. Dados

🟢 Sem banco (ausência por design). O ERD (`erd-complete.md`) modela as entidades em memória: `EntradaCalculo` → `SaidaCalculo` (4 variantes) com composição imutável e invariantes por value objects. Gatilho registrado: a futura etapa de banco reabre LGPD, autenticação e specs (ADR 0002, `permissions.md`).

## 4. Integrações externas

🟢 **Nenhuma em runtime.** Vercel é build/CDN; a fonte clínica é dependência editorial (dev-time). A API v1 é intenção não realizada: quando renascer, o padrão decidido é "rotas sem dado clínico, guarda comportamental + teste de contrato" (ADR 0008).

## 5. Qualidade e testes

- 🟢 Pirâmide atual: 7 suítes de unidade do domínio (inclui property-based com fast-check) + 3 de integração da UI; threshold 90% em `models/**`.
- 🔴 Ausentes desde a refundação: e2e (Playwright configurado no `package.json`, sem config/specs), teste de contrato de API, CI (D-07), lint de fronteira de camadas (D-01).

## 6. Dívidas técnicas

| # | Dívida | Evidência | Gravidade |
|---|---|---|---|
| 1 | CI inexistente (lint+typecheck+testes rodam só à mão) | sem `.github/workflows/` | alta — Produto exige CI (Princípio nº 5 global) |
| 2 | Fronteira de camadas sem verificação automática (D-01 perdida) | eslint.config.mjs sem regra de import | alta — invariante central da arquitetura confiada à disciplina |
| 3 | Scripts quebrados `test:api` / `test:e2e` | configs inexistentes; placeholders vazios | média — falha barulhenta, mas polui o contrato do package.json |
| 4 | `formulario.tsx` 532 LOC · `globais.css` 699 LOC | limite de 400 do mantenedor | média — sinal 5.6 do CLAUDE.md global |
| 5 | `let proximoId` módulo-global em `formulario.tsx` | `formulario.tsx:114` | baixa — frágil sob HMR/StrictMode |
| 6 | Rastreabilidade órfã: código cita specs que só existem no bundle | RF/RN/R/AMB/MD nos comentários | alta — matriz não fecha até o Writer reconstituir as specs |
| 7 | Quatro divergências clínicas aprovadas no design, ausentes do domínio | memória do projeto; `domain.md` §7 | alta — mudanças de conduta clínica pendentes de spec |
| 8 | CSP e cabeçalhos de segurança não verificados na estrutura nova | existiam no repo antigo (`ebad6a5`) | média — privacidade por arquitetura sem verificação de regressão |

🟢 Sem dívida de dependências: stack recente (Next 16, React 19, TS 6, Vitest 4), versões pinadas, lockfile commitado. Sem duplicação de código relevante: a única "duplicação" (faixas de validação UI/motor) é espelhamento deliberado importando a mesma constante.

## 7. Mapa de artefatos da extração

| Pergunta | Artefato |
|---|---|
| O que existe e onde | `inventory.md`, `dependencies.md` |
| Como funciona por dentro | `code-analysis.md`, `flowcharts/`, `data-dictionary.md` |
| Por que é assim | `domain.md`, `adrs/`, `state-machines.md`, `permissions.md` |
| Como se estrutura | `architecture.md` (este), `c4-*.md`, `erd-complete.md` |
| O que impacta o quê | `traceability/spec-impact-matrix.md` |
