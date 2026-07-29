# Confidence Report — aps-inteligente

> Gerado pelo Reversa Reviewer na **re-extração 4 (2026-07-28)**, após revisão das **21 units**
> (14 da base, 7 novas) e dos artefatos globais.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA
> Revisão cruzada: **não realizada** — o Codex não está disponível nesta sessão, como já
> ocorrera na re-extração 3.

## Resumo por artefato

| Unit / artefato | 🟢 | 🟡 | 🔴 | Observação |
|---|---|---|---|---|
| `models-insulina/` | ~96% | ~3% | ~1% | Motor intocado desde a feature 001; 🟡 é o PDF (G-01) |
| `models-gestacao/` | ~90% | ~10% | 0 | Fórmulas 🟢 por propriedade; 🟡 são 4 convenções (Q-G1..G4) |
| `models-cardiopatia-isquemica/` | ~90% | ~10% | 0 | Oráculo das 24 células; 🟡 são premissas (Q-C1..C5) |
| `models-risco-cardiovascular/` | ~90% | ~10% | 0 | PCE 🟢 por oráculo; 🟡 são premissas (Q-R1..R4) |
| 🆕 `models-puericultura/` | ~88% | ~12% | 0 | Algoritmo, fronteiras e tabelas 🟢, com **12.964** posições L/M/S e **356** casos de oráculo conferidos nesta revisão; 🟡 são as sete premissas Q-P1..P7 |
| 🆕 `models-puericultura-consulta/` | ~90% | ~10% | 0 | Montagem, filtro por sexo e notas 🟢; 🟡 são Q-S1..S3, todas declaradas ao leitor pelo próprio código |
| 🆕 `models-contribuicao/` | ~95% | ~5% | 0 | CRC 🟢 por vetor conhecido (`29B1`) e propriedade; 🟡 é a conferência de ponta fora do CI (Q-X1) |
| `interface-comum/` | ~96% | ~4% | 0 | Contrato novo (`comInicio`) e coluna do corpo verificados no código; 🟡 é o acoplamento de tema |
| `interface-calculadora/` | ~96% | ~4% | 0 | Delta de superfície (016/018/021) conferido |
| `interface-gestacao/` · `interface-cardiologia/` · `interface-risco-cardiovascular/` | ~95% | ~5% | 0 | Reconfirmadas, sem mudança nesta passagem |
| 🆕 `interface-puericultura/` | ~94% | ~6% | 0 | Máquina de cinco estados verificada; 🟡 são acessibilidade herdada e confiança no relógio do aparelho |
| 🆕 `interface-puericultura-consulta/` | ~93% | ~7% | 0 | Derivação e identidade exibido↔copiado verificadas no código; 🟡 é a ausência de relator |
| 🆕 `interface-contribuicao/` | ~95% | ~5% | 0 | Ordem do DOM e guarda do exemplo verificadas; 🟡 é o peso da dependência nova |
| `interface-inicio/` | ~96% | ~4% | 0 | Quatro seções e seis fichas conferidas no catálogo; bloco de apoio fora do `map` |
| `interface-estilos/` | ~97% | ~3% | 0 | **Nove** folhas medidas nesta sessão; nenhuma acima de 400 linhas |
| `pages-next/` | ~95% | ~5% | 0 | Sete rotas de página conferidas; 🟡 são a 404 e a ordem das folhas sem guarda |
| `pages-api-v1-status/` | ~97% | ~3% | 0 | Contrato de seis chaves; 🟡 é `ambiente` em pré-visualização, ainda não observado |
| `infra/` | ~94% | ~6% | 0 | Quatro causas e tetos verificados; 🟡 é a dependência de frase do driver (W007) |
| 🆕 `scripts/` | ~90% | ~7% | ~3% | Camada nova; 🔴 é a limitação declarada do inventário (L-01), 🟡 é a dívida de 684 linhas |
| Globais (architecture, C4, ERD, domain, state-machines, permissions, **21 ADRs**, matrizes, user-stories, OpenAPI) | ~93% | ~6% | ~1% | Regenerados para 5 domínios clínicos, 1 não clínico e a camada dev-time |

## Confiança geral

**~93% 🟢**, praticamente estável em relação aos ~94% da passagem anterior — e a estabilidade
tem explicação: a extração cresceu em superfície (14 → 21 units) absorvendo um domínio dos mais
ramificados da plataforma, e ainda assim manteve o percentual, porque a maior parte do que
entrou é verificável contra oráculo congelado ou contra vetor conhecido.

## O que esta revisão verificou por conta própria

Nem tudo o que o Redator escreveu veio do Arqueólogo sem conferência. Foram reaferidos:

| Afirmação | Método | Resultado |
|-----------|--------|-----------|
| 816 testes em 67 arquivos | `npx vitest run` | ✅ confirmado, 11,4 s |
| 201 testes de puericultura e 54 da consulta | execução por diretório | ✅ confirmado |
| 12.964 posições L/M/S | soma das declarações nos 14 módulos | ✅ confirmado |
| 356 casos da OMS no oráculo | leitura do JSON congelado | ✅ confirmado |
| 1.596 células do INTERGROWTH-21st | 228 semanas × 7 desvios publicados | ✅ confirmado |
| 1.187 literais no inventário | leitura do JSON gerado | ✅ confirmado |
| 5.517 LOC em 23 arquivos `.mts` | contagem direta | ✅ confirmado |
| Nove folhas de estilo, nenhuma acima de 400 linhas | `wc -l` | ✅ confirmado, maior é 367 |
| O vetor `29B1` do CRC existe em teste | busca no arquivo | ✅ confirmado |
| A varredura de invariantes cobre React, Next, Primer e leitura de relógio | busca no teste | ✅ confirmado |

## Correções aplicadas nesta revisão

| # | Correção | Onde |
|---|----------|------|
| 1 | As três telas novas citavam apenas o teste de integração e **omitiam o e2e correspondente**. Acrescentados `e2e/puericultura.spec.ts`, `e2e/consulta-puericultura.spec.ts` e `e2e/contribuicao.spec.ts`. | `interface-puericultura/`, `interface-puericultura-consulta/`, `interface-contribuicao/` |

Nenhuma afirmação 🟢 precisou ser rebaixada, e nenhuma 🟡 foi promovida sem chancela humana.

## Cobertura de units

As 21 pastas de módulo de `surface.json` têm unit de spec correspondente. Nenhuma unit esperada
ficou por gerar, e nenhuma unit gerada corresponde a módulo inexistente.

## Lacunas 🔴 remanescentes

Duas, ambas em `gaps.md`, e nenhuma bloqueia a reimplementação:

1. **L-01** — literal montado por interpolação em tempo de execução fica fora do inventário
   textual, por desenho do extrator.
2. **L-02** — as duas provas de ponta do BR Code não rodam em CI.

## Premissas 🟡 pendentes de chancela

**Vinte e três** ao todo: onze novas desta passagem (Q-P1..P7, Q-S1..S3, Q-X1) e doze herdadas
(Q-G1..G4, Q-C1..C5, Q-R1..R4), mais a pendência de insumo G-01. Detalhe em `questions.md`.

## Revisão cruzada

- Engine externa consultada: **nenhuma** (Codex indisponível).
- Consequência: a revisão desta passagem é de uma só engine, e a verificação independente das
  premissas clínicas continua dependendo de chancela humana.
