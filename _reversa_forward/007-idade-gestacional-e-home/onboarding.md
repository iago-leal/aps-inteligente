# Onboarding: 007-idade-gestacional-e-home

> Passo a passo executável para testar a feature pela primeira vez. Pré-requisito: Node ≥ 24 e npm (`_reversa_sdd/inventory.md#tecnologias-e-frameworks`).

## 1. Preparar e subir

```bash
cd ~/dev/aps-inteligente
npm install          # lockfile pinado; determinístico
npm run dev          # http://localhost:3000
```

## 2. Verificar a home (RF-05, RF-06)

1. Abra `http://localhost:3000` — a raiz agora é a **página inicial**, não mais a calculadora de insulina.
2. Confira as duas seções, nenhuma vazia: **Diabetes Mellitus tipo 2** (card da calculadora de insulina) e **Pré-natal** (card da calculadora de idade gestacional).
3. Clique no card da insulina → `/dm2/insulina` deve abrir a calculadora exatamente como antes (mesma tela, mesmo comportamento).
4. Volte e clique no card da IG → `/pre-natal/idade-gestacional`.

## 3. Testar a calculadora de IG

Cenários de aceite do `requirements.md#7` (valores válidos para data de referência 2026-07-23; em outro dia, os valores de IG mudam — a DPP não):

| Entrada | Saída esperada |
|---|---|
| DUM `01/01/2026` | IG 29 semanas e 0 dias · DPP 08/10/2026 · 3.º trimestre · referência "Guia Rápido Pré-Natal, p. 31–32" visível |
| USG `10/06/2026` com 12 semanas e 3 dias | IG 18 semanas e 4 dias · DPP 22/12/2026 · 2.º trimestre · DUM equivalente 15/03/2026 |
| DUM `01/01/2026` **e** USG `10/03/2026` com 8 semanas e 0 dias | Duas datações lado a lado · divergência de 12 dias · destaque da USG como referência (margem de 1 semana do 1.º trimestre excedida, p. 32) |
| DUM `01/08/2026` (futura) | Nenhum resultado; ofensor "DUM no futuro" no campo |
| Data de exame futura + IG do laudo 45 semanas | Os dois ofensores exibidos de uma vez (coleta total) |

Confira também: a data de referência aparece junto ao resultado com a nota de estimativa (RF-07); **não** há checkbox de revisão nesta tela (decisão D-08 do roadmap).

## 4. Verificar privacidade e tema

1. Com o DevTools na aba Network: preencha e calcule — **zero requisição** disparada pelo cálculo ou pela navegação entre páginas (RN-09).
2. Alterne o tema na moldura: deve persistir entre home e calculadoras (chave única `aps-inteligente:tema`).

## 5. Rodar as suítes

```bash
npm run lint && npm run typecheck
npm test                 # unidade + integração (inclui models/gestacao e a home)
npm run test:coverage    # threshold 90% em models/** deve passar com a unit nova
npm run build && npm run test:api    # contrato 16/16: cabeçalhos/CSP byte a byte, status intocado
npm run test:e2e         # calculadora.spec.ts (rota nova) + plataforma.spec.ts; axe na linha de base 0
```

Observação: `test:api` usa `.env.test` e o banco local do compose (`infra/compose.yaml`, porta 5433) para o teste de saúde herdado da feature 003 — suba-o com `docker compose -f infra/compose.yaml up -d` se necessário.

## 6. Verificar em produção (após merge no `main`)

1. CI verde nos três jobs; deploy automático pelo job de produção (adendo 002).
2. `https://aps-inteligente.vercel.app/` → home com as duas seções (quem guardou o link antigo vê a home; a insulina está a um clique).
3. `https://aps-inteligente.vercel.app/api/v1/status` → contrato inalterado (`atualizado_em`, `versao`, `commit`).

## 7. Se algo falhar

- Cálculo divergente dos valores da tabela: confira a data de referência (o motor a recebe da UI; RN-07) e os edge cases do `data-delta.md#5`.
- Tela quebrada na insulina após o refactor da moldura (D-09): a suíte de integração da calculadora é o oráculo — `npm test -- resultado` e `npm run test:e2e` localizam a regressão.
- Axe fora da linha de base: rode `npm run test:e2e` e compare com `e2e/axe-baseline.json` (a linha de base é 0; qualquer violação nova é regressão da feature).
