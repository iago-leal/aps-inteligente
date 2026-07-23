# Relatório da feature 007-idade-gestacional-e-home

> Data: 2026-07-23 · Executada por `/reversa-coding` (19/19 ações)

## 1. O que foi entregue

- **`models/gestacao/`** — segunda unit de domínio da plataforma (5 arquivos, todos < 200 linhas): datação pela DUM (p. 31), DPP pela regra de Naegele calendárica (p. 32), datação por ultrassom via DUM equivalente, trimestres, validação com coleta total e fachada com a comparação DUM×USG (margens da p. 32; veredito informativo, nunca escolha).
- **`interface/gestacao/`** — tela da calculadora de IG sem ritual de revisão (D-08), com invalidação por edição, painel honesto e destaque da USG quando a DUM sai da margem.
- **`interface/inicio/` + `interface/comum/`** — home por seções renderizada do catálogo tipado (D-07) sobre a moldura comum extraída byte a byte de `tela.tsx` (D-09; oráculo: 56/56 testes da insulina intactos).
- **Rotas** — `/` vira home; insulina preservada em `/dm2/insulina`; IG em `/pre-natal/idade-gestacional`.

## 2. Exemplos reais das três saídas (data de referência 2026-07-23)

1. **Só DUM** (2026-01-01): "Idade gestacional: 29 semanas e 0 dias — 3.º trimestre · Data provável do parto: 08/10/2026", notas de confiabilidade e estimativa, fonte "p. 31/p. 32".
2. **Só ultrassom** (2026-06-10, 12s3d): "18 semanas e 4 dias — 2.º trimestre · DPP 22/12/2026 · DUM equivalente 15/03/2026".
3. **Entrada dupla divergente** (DUM 2026-01-01 + USG 2026-03-10 8s0d): as duas datações lado a lado e o aviso "A DUM diverge da datação do exame em 12 dias, além da margem de 7 dias do 1.º trimestre: pela fonte, a DUM deve ser desconsiderada — a datação pelo ultrassom passa a ser a referência."

## 3. Verificação (critério de pronto do roadmap §10)

| Verificação | Resultado |
|---|---|
| Unidade + integração | **274/274** (20 arquivos; +42 unidade gestação, +17 integração) |
| Cobertura `models/**` | 97,5% global; `models/gestacao` 93,75% (limiar 90) |
| Contrato (`test:api`) | **16/16** — CSP e cabeçalhos byte a byte; status intocado |
| E2E (`test:e2e`) | **10/10** — 5 da calculadora (rota nova) + 5 da plataforma |
| Axe | Telas novas na linha de base **zero** (`home`, `telaIdadeGestacional`, `telaIdadeGestacionalComResultado`); telas da insulina inalteradas |
| Privacidade | Zero requisição externa na home e na IG (teste dedicado) |
| Motor de insulina | `git diff models/insulina/` **vazio** |
| Limites | Maior arquivo novo: 183 linhas (teto 400) |

## 4. Decisões e registros de execução

- **Transbordo de Naegele**: dia inexistente no mês destino transborda para os primeiros dias do mês seguinte (ex.: DUM 24/05/2026 → +7d = 31/05 → fev/2027 sem dia 31 → DPP 03/03/2027), comportamento do `Date.UTC` documentado em `investigation.md#4` e fixado em teste.
- **Harness e2e tem UM viewport** (Desktop Chrome), não dois como o roadmap/onboarding presumiram do histórico da feature 004 — correção de premissa, sem impacto no critério (axe cobre as três telas).
- **Asserções precisadas**: duas consultas de T006 mudaram de `getByText` para `getByRole("heading")` e uma do e2e ganhou âncora textual maior — colisões legítimas de texto (o mesmo termo no cabeçalho e na mensagem da RN-11), não mudança de comportamento.
- **Incidente de ambiente**: um `next start` antigo segurava a porta 3000 servindo o build anterior (todos os e2e falharam); encerrado o processo, 10/10.
- **`preferencia-de-tema.ts`** permaneceu em `interface/calculadora/` (o provedor de tema e a suíte apontam para lá); a moldura comum importa de lá — realocação anotada para a re-extração.

## 5. Candidatos a watch (premissas 🟡 do roadmap §4)

1. Cortes de trimestre 13+6/27+6 (convenção; o guia não define) — validar com o prescritor.
2. Limites de validação (DUM ≤ 44 semanas retroativas; laudo 0–42 semanas) — validar em uso.
3. Ausência do ritual de revisão na tela de IG — observar se o prescritor sente falta do gate.
4. USG de 3.º trimestre sem veredito de margem (fonte não parametriza) — observar recepção da mensagem de julgamento clínico.
5. Drift potencial entre catálogo e rotas se uma página nascer fora do fluxo do README.

## 6. Pendências deliberadas

Nenhuma ação aberta. Fora do escopo (RN-10): FIV/FET, DPP inversa, calendário gestacional, conteúdo à paciente.
