# APS Inteligente

Plataforma web dedicada à prática médica na APS, 100% client-side: nenhum dado clínico
sai do navegador (ADR 0002). A raiz (`/`) é a **página inicial por seções** (feature 007);
as calculadoras vivem em rotas próprias, cada uma com sua fonte clínica citável:

| Seção | Calculadora | Rota | Fonte | Domínio |
|---|---|---|---|---|
| Diabetes Mellitus tipo 2 | Insulina (início, titulação, intensificação) | `/dm2/insulina` | Guia Rápido DM — SMS-Rio, 2023 | `models/insulina/` |
| Pré-natal | Idade gestacional (DUM e/ou ultrassom) | `/pre-natal/idade-gestacional` | Guia Rápido Pré-Natal — SMS-Rio, 2025 | `models/gestacao/` |
| Cardiologia | Dor torácica e probabilidade pré-teste de cardiopatia isquêmica | `/cardiologia/dor-toracica` | TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017) | `models/cardiopatia-isquemica/` |

Next.js (Pages Router) com domínio puro em `models/`, interface em `interface/` e shell
em `pages/`. Os PDFs das fontes ficam em `referencias/` (fora do versionamento, MD-0008).

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
(CSP intocada). O CSS próprio é cola de layout: cores sempre por `var(--*)` do Primer,
nunca hexadecimal local. `interface/estilos/globais.css` cobre a moldura e as telas das
calculadoras; `interface/estilos/inicio.css` isola os estilos da home (feature 008) e
`interface/estilos/cabecalho.css` a camada de logo do cabeçalho (feature 009), ambos
mantendo o `globais.css` dentro do limite de 400 linhas. `@primer/css` e
`@primer/view-components` são vetados (sem manutenção plena). Ícones, quando necessários,
vêm de `@primer/octicons-react` (mesma família, pinado).

### Identidade da marca (logo APSi, feature 009)

A logo vive em `public/` como ativo estático same-origin (sob a CSP, fora do bundle JS):
`apsi-light.png`/`apsi-dark.png` para o cabeçalho claro/escuro, `apsi-tile.png` (512) e
`apsi-tile-192.png` para favicon, `apple-touch-icon` e o `manifest.webmanifest` (PWA
instalável, declarado em `pages/_document.tsx`). `apsi-white.png`/`apsi-navy.png` ficam
versionadas para sobre-foto/impressão, sem uso na web. A `Moldura` troca a variante da
logo pelo tema já lido no componente.

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

## Como adicionar uma calculadora nova (feature 007)

1. **Catálogo primeiro** (fonte única anti-drift): registre título, descrição e rota em
   `interface/inicio/catalogo.ts` — a home renderiza a partir dele; seção nova só nasce
   com pelo menos uma calculadora.
2. **Domínio puro** em `models/<tema>/`, no molde de `models/gestacao/`: `tipos.ts`,
   `fonte-clinica.ts` (REFERENCIAS/CONSTANTES congeladas com página da fonte),
   `validacao.ts` (coleta total de ofensores) e fachada; erros como valores, sem ler o
   relógio nem framework. Cobertura ≥ 90% (`vitest.config.ts` já cobre `models/**`).
3. **Tela** em `interface/<tema>/` sobre a `Moldura` comum (`interface/comum/moldura.tsx`)
   e **rota** em `pages/<secao>/<calculadora>.tsx` com metadados próprios, o mesmo caminho
   declarado no catálogo. A `Moldura` exibe a logo APSi como marca decorativa do cabeçalho
   acima de um `<h1>` **textual** em toda tela — inclusive a home (feature 016): a identidade
   é unificada, o que iguala a altura do cabeçalho por construção. Passe a prop `comInicio`
   nas calculadoras para o comando de retorno à home (⌂); a home não a usa (seria redundante).
4. **Ícone da seção** (opcional, feature 008): registre `id da seção → Octicon` em
   `interface/inicio/icones.tsx`; seção sem entrada simplesmente não exibe ícone (fallback).
   O ícone é decorativo (`aria-hidden`) — o catálogo permanece a fonte de navegação.
5. **Fonte clínica**: PDF em `referencias/` (ignorado pelo git) e toda saída do motor
   carregando `ReferenciaClinica` com página/seção.

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

Produção (domínio próprio; o apex redireciona para `www`, por isso `-L`):

```bash
curl -iL https://apsinteligente.app/api/v1/status
```

Esperado: `200` com `{atualizado_em, versao, commit}`, `Cache-Control: no-store` e, em
produção, `commit` igual ao SHA do último commit de `main`. A raiz (`/`) deve renderizar
a home com as duas seções, e cada calculadora deve abrir na sua rota. Roteiro completo:
`_reversa_forward/002-producao-pagina-e-api-status/onboarding.md` e
`_reversa_forward/007-idade-gestacional-e-home/onboarding.md`.

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
