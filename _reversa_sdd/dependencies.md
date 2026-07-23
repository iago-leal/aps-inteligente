# Dependências — aps-inteligente

> Gerado pelo Reversa Scout em 2026-07-19 · **Re-extração 2 em 2026-07-23**.
> Fonte: `package.json` (versões pinadas, sem `^`/`~`) + `package-lock.json` commitado. Node >= 24 (`engines`).

## Runtime

| Pacote | Versão | Papel |
|---|---|---|
| next | 16.2.10 | Framework web (Pages Router, Turbopack) |
| react | 19.2.4 | Biblioteca de UI |
| react-dom | 19.2.4 | Renderização DOM |
| @primer/react | 38.33.0 | Sistema de design GitHub Primer (componentes) — feature 004 |
| @primer/primitives | 11.9.0 | Tokens de design Primer (cores, espaçamentos, tipografia) |
| @primer/octicons-react | 19.29.2 | Ícones Octicons (home por seções) — feature 008 |
| pg | 8.22.0 | Driver PostgreSQL — usado só no healthcheck `/api/v1/status` (feature 003) |

## Desenvolvimento

### Testes

| Pacote | Versão | Papel |
|---|---|---|
| vitest | 4.1.10 | Runner de testes (unidade + integração + contrato) |
| @vitest/coverage-v8 | 4.1.10 | Cobertura (threshold alto em `models/**`) |
| @testing-library/react | 16.3.2 | Testes de integração de componentes React |
| jsdom | 29.1.1 | DOM virtual para os testes de integração |
| fast-check | 4.9.0 | Property-based testing do domínio |
| @playwright/test | 1.61.1 | E2E |
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

## Observações

🟢 **Versões pinadas exatas** (sem `^`/`~`) — build determinístico, alinhado ao Princípio nº 5.3. Lock file (`package-lock.json`) commitado.

🟢 **Sem acoplamento a bibliotecas externas dentro do domínio:** `models/**` não importa nenhum pacote de terceiros; Primer/React vivem só na camada de interface, `pg` só na infraestrutura (Princípio nº 5.1, ADR 0003).

🟢 **Superfície de rede zero no cliente:** nenhuma dependência de telemetria, analytics ou fetch de terceiros; CSP sem terceiros (ADR 0002/0007). O único consumidor de rede é o servidor no `/api/v1/status`, que fala com o Postgres via `pg`.

🟡 **Ritual de manutenção (Princípio nº 5.7):** dependências no ecossistema Next 16 / React 19 / Primer 38 — todas com release recente; revisão trimestral aplicável, sem sinais de abandono.
