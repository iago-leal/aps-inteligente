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

## Como verificar saúde

Local, contra o build de produção (CSP ativa):

```bash
npm run build && npm start          # http://localhost:3000
npm run test:api                    # suíte de contrato (tests/contract/)
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
