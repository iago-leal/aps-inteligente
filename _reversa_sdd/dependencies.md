# Dependências — aps-inteligente

> Gerado pelo Reversa Scout em 2026-07-19. Fonte: `package.json` (versões pinadas, sem `^`/`~`) + `package-lock.json` commitado.

## Runtime

| Pacote | Versão | Papel |
|---|---|---|
| next | 16.2.10 | Framework web (Pages Router, Turbopack) |
| react | 19.2.4 | Biblioteca de UI |
| react-dom | 19.2.4 | Renderização DOM |

## Desenvolvimento

### Testes

| Pacote | Versão | Papel |
|---|---|---|
| vitest | 4.1.10 | Runner de testes (unidade + integração) |
| @vitest/coverage-v8 | 4.1.10 | Cobertura (threshold 90% em `models/**`) |
| @testing-library/react | 16.3.2 | Testes de componentes React |
| jsdom | 29.1.1 | DOM simulado para testes de UI |
| fast-check | 4.9.0 | Property-based testing (invariantes do domínio) |
| @playwright/test | 1.61.1 | E2E (🔴 sem config no repo) |
| @axe-core/playwright | 4.12.1 | Auditoria de acessibilidade nos E2E |

### Qualidade e tipos

| Pacote | Versão | Papel |
|---|---|---|
| typescript | 6.0.3 | Type checker (strict) |
| eslint | 9.39.5 | Linter (flat config) |
| eslint-config-next | 16.2.10 | Regras Next.js |
| prettier | 3.9.5 | Formatador |
| @types/node | 26.1.1 | Tipos Node |
| @types/react | 19.2.17 | Tipos React |
| @types/react-dom | 19.2.3 | Tipos react-dom |

## Observações

- 🟢 **Todas as versões estão pinadas** (sem ranges) e o `package-lock.json` está commitado — build determinístico, alinhado ao princípio de reprodutibilidade temporal do mantenedor.
- 🟢 Dependências de runtime enxutas: apenas o trio Next/React — **o domínio (`models/insulina/`) não depende de biblioteca externa alguma**, condição a confirmar pelo Arqueólogo.
- 🟢 Node exigido: `>= 24` (campo `engines`).
- 🟢 Gerenciador: **npm**.
- 🔴 Playwright e axe-core estão declarados mas inativos (sem `playwright.config.*` nem specs `e2e/`) — dependências à frente do código.
