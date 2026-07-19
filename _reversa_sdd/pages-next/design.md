# pages-next — Design Técnico

> Gerado pelo Reversa Writer em 2026-07-19.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA. Fluxograma em `../flowcharts/pages.md`.

## Interface

| Arquivo | Papel | Observação |
|---------|-------|------------|
| `pages/_document.tsx` | Documento HTML base | `<Html lang="pt-BR">`; 13 LOC |
| `pages/_app.tsx` | Composição raiz | `next/font` (IBM Plex Sans + Mono), import de `interface/estilos/globais.css`, wrapper `.app-raiz`; 27 LOC |
| `pages/index.tsx` | Rota `/` | `<Head>` com title/description de privacidade; monta `TelaCalculadora`; 18 LOC |
| `pages/api/v1/index.js` | Rota `/api/v1` | 🔴 vazio — declarada sem handler |

Configuração relevante: `next.config.ts` (Turbopack `root` fixado), aliases `models/*`/`interface/*` no `tsconfig.json`. 🟢

## Fluxo Principal

1. Build gera páginas estáticas (nenhum data fetching no Pages Router). 🟢
2. `_document` define o idioma; `_app` injeta fontes (self-hosted pelo `next/font`) e CSS global, expondo `--fonte-dados` para números clínicos. 🟢
3. `/` renderiza metadados + `TelaCalculadora`; toda a interação subsequente é client-side dentro da `interface/`. 🟢

## Fluxos Alternativos

- **404:** página própria existia no repo antigo (`ebad6a5`); 🔴 não reconstituída — hoje vale o default do Next.
- **`/api/v1`:** requisição falha por handler ausente. 🔴 Estado transitório indesejado (ver `requirements.md` RF-04).

## Dependências

- `interface/calculadora` (`TelaCalculadora`) e `interface/estilos/globais.css`. 🟢
- Next.js 16.2.10 (Pages Router), React 19. 🟢
- Deploy: Vercel (`.vercel/project.json`). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Pages Router (não App Router) na refundação | estrutura `pages/`; padrão do curso.dev herdado da MD-0011 | 🟢 fato; 🟡 racional |
| Fontes self-hosted via `next/font` (IBM Plex; Mono para dados clínicos) | `_app.tsx` | 🟢 |
| Turbopack com `root` explícito | `next.config.ts` | 🟢 |
| Metadados como reforço da promessa de privacidade | `index.tsx` | 🟢 |

## Estado Interno

Nenhum. 🟢

## Observabilidade

Nenhuma no shell. 🟢 (Logs de build/deploy ficam na Vercel, fora do produto.)

## Riscos e Lacunas

- 🔴 CSP e cabeçalhos de segurança da versão antiga não verificados na estrutura atual.
- 🔴 404 própria e home com registro de módulos (repo antigo) não reconstituídas — decidir se voltam.
- 🔴 `/api/v1` vazio: implementar `GET /api/v1/status` no padrão ADR 0008 ou remover.
