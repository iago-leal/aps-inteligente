# Onboarding: testar a refatoração do cabeçalho

> Feature: `011-refatora-cabecalho` · Data: `2026-07-23`

Passo a passo para verificar a feature pela primeira vez.

## Pré-requisitos

- Node com as dependências instaladas (`npm install`).
- Nenhum serviço externo é necessário (a feature não toca banco nem API).

## Subir a aplicação

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Roteiro de verificação manual

1. **Home (raiz `/`)**
   - O cabeçalho mostra a logo APSi como título, o subtítulo, o selo verde "Nada é salvo nem enviado" e o alternador de tema icônico.
   - **Não** deve haver comando de início (já se está na home).
2. **Toggle de tema (icônico)**
   - No tema claro, o controle exibe o ícone de **lua** e, ao passar o mouse/foco, anuncia "Ativar tema escuro".
   - Acione-o: o tema vira escuro, o ícone passa a **sol** e o rótulo a "Ativar tema claro".
   - Nenhum texto "Tema claro"/"Tema escuro" aparece mais.
3. **Entrar numa calculadora**
   - Clique num cartão (ex.: Calculadora de insulina), chegando a `/dm2/insulina`.
   - O cabeçalho agora mostra um **comando de início** (ícone de casa). O selo e o toggle continuam presentes.
4. **Retornar à home**
   - Acione o comando de início: a navegação volta para `/` e o catálogo reaparece.
5. **Acessibilidade por teclado**
   - Na calculadora, navegue só com Tab: o foco alcança o comando de início e o toggle; Enter aciona cada um.

## Verificação automatizada

```bash
npm run lint
npm run typecheck
npm run test          # unidade + integração (inclui moldura.test.tsx)
npm run test:e2e      # inclui tema icônico e navegação início→home; axe-baseline
```

Todos devem passar. O `axe-baseline.json` não deve registrar novas violações.
