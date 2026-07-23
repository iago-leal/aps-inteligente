# Adendo 007 — Calculadora de idade gestacional e página inicial por seções

> Feature: `007-idade-gestacional-e-home`
> Data: 2026-07-23
> Cenário: legado

## Vigência

Vigente desde 2026-07-23.

## Resumo da entrega

A feature realiza a promessa de "plataforma guarda-chuva" registrada na extração: entrega a segunda calculadora clínica — idade gestacional (IG) e data provável do parto (DPP) a partir da DUM, do último ultrassom ou de ambos, com divergência explicitada segundo a regra da p. 32 do *Guia Rápido Pré-Natal* (SMS-Rio, 4.ª ed., 2025) — e a página inicial que organiza as ferramentas em duas seções (Diabetes Mellitus tipo 2 e Pré-natal). A raiz do site deixa de montar a calculadora de insulina e passa a servir a home, sem redirecionamento; a insulina vive em `/dm2/insulina` com metadados e comportamento preservados. O motor de insulina permanece byte a byte intocado (`git diff models/insulina/` vazio).

Ações concluídas: **19/19** (T001–T019), incluindo TDD do domínio novo (42 testes de unidade com property-based), 17 testes de integração, suíte total 274/274, contrato 16/16, e2e 10/10, cobertura de `models/` em 97,5% e lint+typecheck verdes.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/architecture.md` | `#1-estilo-arquitetural` | componente-novo | Nasce `models/gestacao/` (tipos, fonte-clinica, datas, datacao, validacao, calculadora), segunda unit de domínio no molde de `models/insulina`, pura e sem dependência entre motores; ver legacy-impact.md da feature |
| `_reversa_sdd/domain.md` | `#6-fronteiras-de-escopo` | regra-nova | Segunda fonte clínica da plataforma: *Guia Rápido Pré-Natal* SMS-Rio 4.ª ed. 2025 (pp. 31–32 e 113), com catálogo próprio de referências — "uma fonte por unit", sem mescla com o guia de diabetes (RN-06/W006) |
| `_reversa_sdd/domain.md` | `#3-regras-de-domínio-por-modo` | regra-nova | Regras RN-01..RN-05, RN-07 e RN-11 do motor de gestação: IG por DUM (⌊dias/7⌋), DPP por Naegele, retroprojeção da USG, trimestres 13+6/27+6, validação com coleta total, data de referência como entrada e entrada dupla com arbitragem pela margem da USG |
| `_reversa_sdd/code-analysis.md` | `#módulo-3` (pages) | regra-alterada | "index.tsx monta TelaCalculadora" deixou de valer: a raiz monta a home (`interface/inicio/tela.tsx`), decisão do usuário de 2026-07-23, sem redirecionamento |
| `_reversa_sdd/code-analysis.md` | `#módulo-3` (pages) | componente-novo | Rotas novas `pages/dm2/insulina.tsx` e `pages/pre-natal/idade-gestacional.tsx`; a insulina preserva os metadados da antiga raiz |
| `_reversa_sdd/code-analysis.md` | `#módulo-2` (interface) | componente-novo | `interface/gestacao/` (app, formulario, resultado, tela) e `interface/inicio/` (catalogo.ts como fonte única de navegação, tela.tsx); padrões do legado herdados (invalidação, painel honesto), sem ritual de revisão na IG — datação não prescreve |
| `_reversa_sdd/code-analysis.md` | `#módulo-2` (`tela.tsx`) | regra-alterada | Moldura (cabeçalho + selo + tema) extraída byte a byte para `interface/comum/moldura.tsx`; `tela.tsx` da insulina vira composição fina — realocação, não redesenho (oráculo 56/56 verde); imports cruzados de tema/erros seguem em `calculadora/`, candidatos à realocação na re-extração |
| `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` | harness e2e | regra-alterada | `e2e/calculadora.spec.ts` passa a apontar para `/dm2/insulina` com asserções intactas; nasce `e2e/plataforma.spec.ts`; `axe-baseline.json` ganha três chaves novas em zero, chaves antigas byte a byte |
| `_reversa_sdd/architecture.md` | `#5` (testes) | componente-novo | `tests/unit/dominio-gestacao/*` (+42, com property-based) e `tests/integration/interface/{gestacao,inicio}.test.tsx` (+17) |
| `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` | diretriz de telas | regra-alterada | README ganha a diretriz "como adicionar calculadora" via catálogo; `.gitignore` estende MD-0008 (`referencias/` fora do versionamento) à segunda fonte |

Contratos externos: nenhum delta — `GET /api/v1/status`, CSP e cabeçalhos byte a byte (contrato 16/16); zero requisição de rede nova. Regras 🟢 do `domain.md` §3.1–§3.5 preservadas (privacidade, invalidação e espelhamento estendidos, não alterados, às telas novas).

## Regras sob vigilância

W001, W002, W003, W004, W005, W006 — ver `_reversa_forward/007-idade-gestacional-e-home/regression-watch.md` (inclui observações O-01..O-04 sem peso de regressão, entre elas as fórmulas do motor de gestação a promover a 🟢 na re-extração e os imports cruzados candidatos a `interface/comum/`).

## Fontes

- `_reversa_forward/007-idade-gestacional-e-home/legacy-impact.md`
- `_reversa_forward/007-idade-gestacional-e-home/regression-watch.md`
- `_reversa_forward/007-idade-gestacional-e-home/requirements.md`
- `_reversa_forward/007-idade-gestacional-e-home/progress.jsonl`
