# APS Inteligente

Plataforma web dedicada à prática médica na APS. O primeiro módulo é a **calculadora de
insulina para DM2**, 100% client-side: nenhum dado clínico sai do navegador (ADR 0002;
fonte clínica única: Guia SMS-Rio). Next.js (Pages Router) com domínio puro em
`models/insulina/`, interface em `interface/calculadora/` e shell em `pages/`.

## Como rodar

```bash
npm ci          # Node >= 24 (campo engines)
npm run dev     # desenvolvimento (CSP desligada para o HMR)
```

Gate de qualidade local: `npm run lint && npm run typecheck && npm test`.

## Estilo das telas (Primer, feature 004)

A base de estilo é o **Primer** (design system do GitHub) pela via React: `@primer/react`
(componentes, CSS Modules) + `@primer/primitives` (tokens e temas claro/escuro), ambos
pinados e servidos pelo bundle próprio — nenhum recurso de estilo sai de origem externa
(CSP intocada). O CSS próprio (`interface/estilos/globais.css`) é resíduo de layout:
cores sempre por `var(--*)` do Primer, nunca hexadecimal local. `@primer/css` e
`@primer/view-components` são vetados (sem manutenção plena).

Para **criar uma tela nova**:

1. O provider já está no shell (`pages/_app.tsx` → `interface/calculadora/provedor-tema.tsx`,
   que liga a preferência persistida em `localStorage["aps-inteligente:tema"]` ao color
   mode do Primer). Nenhum setup adicional por página.
2. Componha a tela com componentes de `@primer/react` (`Button`, `FormControl`,
   `TextInput`, `Flash`, `Heading`…); recorra ao `globais.css` apenas para cola de
   layout, usando variáveis funcionais do Primer.
3. Mensagens de erro de formulário usam `interface/calculadora/erro-de-campo.tsx`
   (contrato `role="alert"` asserido pelos testes).
4. Cubra a tela no e2e (`e2e/*.spec.ts`) incluindo a varredura axe; a linha de base de
   acessibilidade vive em `e2e/axe-baseline.json` e só muda por decisão registrada.

## Banco de dados (fundação, feature 003)

PostgreSQL local em container (`infra/compose.yaml`, imagem pinada `postgres:17.10-alpine`)
e, em produção, instância gerenciada Neon (plano Free) via Vercel Marketplace, que injeta
`DATABASE_URL` nos ambientes do projeto. Acesso programático **somente** por
`infra/database.ts` (pool preguiçoso, consultas parametrizadas, `ErroDeBanco` nomeado).
Sem esquema de negócio nesta fase; nenhum dado clínico ou pessoal é persistido (RN-01).

```bash
cp .env.example .env.local   # configurar: DATABASE_URL local (ajuste a porta se a 5432 estiver ocupada)
npm run db:up                # subir (idempotente; aguarda o healthcheck)
npm run test:api             # verificar saúde: inclui tests/contract/infra/banco.test.ts
npm run db:psql              # sessão interativa (psql de dentro do container)
npm run db:down              # derrubar e remover o volume (próxima subida parte do zero)
```

A suíte de teste lê `.env.test` (o modo de teste do loader ignora `.env.local`); se mudar
a porta local, replique a `DATABASE_URL` em `.env.test.local`. Contra a Neon, a primeira
conexão pode sofrer cold start (autosuspend do plano Free) — limites e roteiro completo em
`_reversa_forward/003-banco-de-dados-psql-pg/onboarding.md`.

## Como verificar saúde

Local, contra o build de produção (CSP ativa):

```bash
npm run build && npm start          # http://localhost:3000
npm run test:api                    # suíte de contrato (tests/contract/)
npm run test:e2e                    # e2e Playwright + axe (sobe o build sozinho)
curl -i http://localhost:3000/api/v1/status
```

Produção (URL padrão do provedor):

```bash
curl -i https://aps-inteligente.vercel.app/api/v1/status
```

Esperado: `200` com `{atualizado_em, versao, commit}`, `Cache-Control: no-store` e, em
produção, `commit` igual ao SHA do último commit de `main`. A raiz (`/`) deve renderizar
a calculadora. Roteiro completo de verificação:
`_reversa_forward/002-producao-pagina-e-api-status/onboarding.md`.

## Como publicar

Push em `main` → CI (`.github/workflows/ci.yml`): verificação → contrato contra o build
de produção → deploy na Vercel. O auto-deploy por push está desligado (`vercel.json`);
**o CI é o único caminho para produção** e exige os secrets `VERCEL_TOKEN`,
`VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` no repositório GitHub.

## Documentação

- Specs e extração reversa: `_reversa_sdd/` (arquitetura, domínio, ADRs, ERD).
- Ciclo forward por feature: `_reversa_forward/<feature>/` (requirements → roadmap →
  actions → legacy-impact → regression-watch).
- Registro de bugs: `_reversa_bugs/`.
