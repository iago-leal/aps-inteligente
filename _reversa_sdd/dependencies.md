# Dependências — aps-inteligente

> Gerado pelo Reversa Scout em 2026-07-19 · **Re-extração 4 em 2026-07-28** (features 015–022).
> Fonte: `package.json` (versões pinadas, sem `^`/`~`) + `package-lock.json` commitado. Node >= 24 (`engines`).
> 🟢 Delta desta passagem: **uma dependência de runtime nova**, `react-qr-code@2.2.0` (feature 019). É a primeira desde a feature 010, e desfaz a afirmação da re-extração 3 de que as features seguintes não haviam introduzido nenhuma.

## Runtime

| Pacote | Versão | Papel |
|---|---|---|
| next | 16.2.10 | Framework web (Pages Router, Turbopack) |
| react | 19.2.4 | Biblioteca de UI |
| react-dom | 19.2.4 | Renderização DOM |
| @primer/react | 38.33.0 | Sistema de design GitHub Primer (componentes) — feature 004 |
| @primer/primitives | 11.9.0 | Tokens de design Primer (cores, espaçamentos, tipografia) |
| @primer/octicons-react | 19.29.2 | Ícones Octicons (home por seções) — feature 008 |
| pg | 8.22.0 | Driver PostgreSQL — consumido em produção pelo healthcheck (feature 022) |
| 🆕 react-qr-code | 2.2.0 | Renderiza o BR Code do PIX em SVG, no cliente — feature 019 (`MD-0024`) |

🟢 **`react-qr-code` entra atrás de envoltório** (`interface/contribuicao/codigo-qr.tsx`), e não espalhada pelas telas: a decisão `MD-0024` registra que o filtro de longevidade se lê pelo que o problema é — codificação de matriz QR, especificação estável e fechada —, e não pelo calendário de releases do pacote.

🟡 **Efeito colateral registrado:** `prop-types@15.8.1` entra na árvore de **runtime** por arrasto do `react-qr-code`. É resíduo inútil sob React 19, e foi tolerado por já existir na árvore de desenvolvimento, arrastado por `eslint-plugin-react` (confirmado por `npm ls prop-types` em 28/07: as duas pontas resolvem para a mesma versão, deduplicada).

## Desenvolvimento

### Testes

| Pacote | Versão | Papel |
|---|---|---|
| vitest | 4.1.10 | Runner de testes (unidade, integração, regressão e contrato) |
| @vitest/coverage-v8 | 4.1.10 | Cobertura (limiar de 90% em `models/**`) |
| @testing-library/react | 16.3.2 | Testes de integração de componentes React |
| jsdom | 29.1.1 | DOM virtual para os testes de integração |
| fast-check | 4.9.0 | Testes de propriedade — motor do BR Code (feature 019) |
| @playwright/test | 1.61.1 | Ponta a ponta |
| @axe-core/playwright | 4.12.1 | Auditoria de acessibilidade no e2e (axe-baseline) |

### Tipos e tooling

| Pacote | Versão | Papel |
|---|---|---|
| typescript | 6.0.3 | Type checker (`tsc --noEmit`) |
| eslint | 9.39.5 | Linter |
| eslint-config-next | 16.2.10 | Regras Next.js do ESLint |
| prettier | 3.9.5 | Formatador |
| @types/node | 26.1.1 | Tipos do Node |
| @types/react | 19.2.17 | Tipos do React |
| @types/react-dom | 19.2.3 | Tipos do react-dom |
| @types/pg | 8.20.0 | Tipos do driver pg |

## A camada dev-time e suas dependências

🟢 Os 23 scripts `.mts` de `scripts/**` (features 017–020) rodam **sem dependência própria**: usam o Node e o TypeScript já presentes, mais `scripts/lib/planilha.mts`, escrito à mão para ler os `.xlsx` da OMS. Nenhuma biblioteca de planilha, de PDF ou de HTTP foi acrescentada ao manifesto por essa camada — decisão coerente com o Princípio nº 3, e que mantém o custo de manutenção da cadeia geradora dentro do repositório.

## Observações

🟢 **Versões pinadas exatas** (sem `^`/`~`) — build determinístico, alinhado ao Princípio nº 5.3. Lock file (`package-lock.json`) commitado.

🟢 **Sem acoplamento a bibliotecas externas dentro do domínio:** os seis units de `models/**` — os cinco clínicos e o não clínico `contribuicao` — não importam pacote algum de terceiros. Primer e React vivem só na camada de interface, `pg` só na infraestrutura, `react-qr-code` só no envoltório de `interface/contribuicao` (Princípio nº 5.1, ADR 0003). Desde a feature 017 essa fronteira deixou de ser afirmação da extração e passou a ser **teste executável** em `models/puericultura/**`.

🟢 **Superfície de rede zero no cliente:** nenhuma dependência de telemetria, analytics ou fetch de terceiros; CSP sem terceiros (ADR 0002/0007). O único consumidor de rede é o servidor no `/api/v1/status`, que fala com o Postgres via `pg` — e, desde a feature 022, fala de fato, a cada requisição, sob teto de 3 000 ms imposto no servidor.

🟡 **Ritual de manutenção (Princípio nº 5.7):** dependências no ecossistema Next 16 / React 19 / Primer 38, todas com release recente; revisão trimestral aplicável, sem sinais de abandono. A entrada nova (`react-qr-code`) é a única que pede leitura pelo critério de longevidade a cada revisão, por ser pacote de mantenedor único.
