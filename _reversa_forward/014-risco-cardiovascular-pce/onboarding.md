# Onboarding: testar a calculadora de risco cardiovascular (PCE)

> Identificador: `014-risco-cardiovascular-pce`
> Data: `2026-07-23`
> Público: quem for verificar a feature pela primeira vez, após `/reversa-coding`.

## 0. Pré-requisitos

- Node ≥ 24 (engine declarado no `package.json`).
- Dependências instaladas: `npm install` (lockfile commitado; build determinístico).
- Nenhum segredo nem banco: o cálculo roda 100% no cliente; o Postgres só serve ao healthcheck e não é exercido por esta feature.

## 1. Subir a aplicação

```bash
npm run dev
```

Abrir a home. Na seção **Cardiologia**, devem aparecer **duas** fichas: a de probabilidade pré-teste (feature 010, inalterada) e a nova, "Risco cardiovascular (Pooled Cohort Equations)". Clicar na nova leva a `/cardiologia/risco-cardiovascular`.

## 2. Caminho feliz (golden case de referência)

Preencher, na tela nova:

- Sexo **masculino**, raça **branco**, sem DCV prévia
- Idade **55**, colesterol total **213**, HDL **50**, PAS **120**
- **Sem** anti-hipertensivo, **sem** diabetes, **não** tabagista

Solicitar o cálculo. Esperado: risco de ASCVD em 10 anos **≈ 5,4%**, categoria **limítrofe**, com a referência às Pooled Cohort Equations e a **nota de proveniência** visível. Nenhuma recomendação de estatina deve aparecer.

> Outros casos rápidos (mesmas demais entradas): mulher negra baseline → **≈ 3,0%** (baixo); homem branco com idade 54, TC 170, HDL 50, PAS 157 não-tratada, fumante e diabético → **≈ 20,8%** (alto). Lista completa em `investigation.md` §6.

## 3. Recusas honestas

- **Idade fora da faixa:** trocar a idade para **35** (ou **85**). Esperado: "fora do escopo da fonte", sem número, explicando que as PCE cobrem 40 a 79 anos.
- **DCV prévia:** marcar "DCV prévia". Esperado: a calculadora não estima e explica que as PCE são de prevenção primária.

## 4. Validação e alertas

- **Coleta total de ofensores:** deixar colesterol e HDL em branco (ou ambos absurdos). Esperado: os **dois** ofensores reportados de uma vez, não um por vez.
- **Clamp (alerta, não trava):** colesterol total **400** (acima de 320). Esperado: o cálculo ocorre com o valor-limite (320) e um **aviso** de possível superestimativa — nunca uma trava.

## 5. Invalidação por edição

Após um cálculo bem-sucedido, alterar qualquer campo. Esperado: o resultado exibido marca-se como **desatualizado** até novo cálculo. Não há checkbox de revisão (esse ritual só existe na insulina).

## 6. Privacidade

Abrir o painel de rede do navegador e refazer um cálculo. Esperado: **nenhuma** requisição com dado clínico; o `<meta>` da rota reafirma o cálculo local.

## 7. Suíte automatizada

```bash
npm run test          # vitest: unidade (golden cases + invariantes) e integração
npm run test:e2e      # playwright: navegação + axe (0/0) na rota nova
npm run lint          # eslint
npx tsc --noEmit      # typecheck
```

Tudo verde é o critério de pronto (ver `roadmap.md` §10). Os *golden cases* das PCE ficam em `tests/unit/dominio-risco-cardiovascular/equacao.test.ts`, com tolerância ±0,1 pp.

## 8. Verificação de isolamento

```bash
git diff --stat models/insulina models/gestacao models/cardiopatia-isquemica
```

Esperado: **vazio** — a feature é aditiva e não toca nenhum motor existente.
