# Adendo — Calculadora de risco cardiovascular (Pooled Cohort Equations)

> Identificador: `014-risco-cardiovascular-pce`
> Data: 2026-07-23
> Cenário: legado

## Vigência

Vigente desde 2026-07-23.

Superado pela re-extração de 2026-07-23.

## Resumo da entrega

Nova calculadora clínica, aditiva, que estima o risco de doença cardiovascular aterosclerótica (ASCVD) em 10 anos pelas Pooled Cohort Equations (2013 ACC/AHA Guideline, Goff et al.), classifica o resultado em categorias de risco (2019 ACC/AHA Primary Prevention) e **apenas informa** — não emite conduta (ADR 0005). A feature replica o molde da calculadora de dor torácica (feature 010): quarta unit de domínio puro, tela sobre a `Moldura` comum, rota do Pages Router, segunda ficha na seção Cardiologia do catálogo e folha CSS própria — sem tocar nos três motores existentes. A diferença de natureza é o núcleo: quatro modelos de Cox sexo- e raça-específicos com coeficientes congelados, validados por *golden cases*.

Ações concluídas: **22/22** (`actions.md` todas `[X]`; `progress.jsonl` com 22 linhas `done`). Suíte verde: vitest 421/421, e2e 29/29, cobertura de domínio 96,6% na unit nova, typecheck e lint limpos.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | #1 Camada de domínio | componente-novo | Quarta unit `models/risco-cardiovascular/` (7 arquivos, sem barril): a família de motores puros passa de três para quatro, isolada das demais |
| `_reversa_sdd/c4-components.md` | Fachadas de domínio | componente-novo | `CalculadoraRiscoCardiovascular.estimar` junta-se às fachadas existentes; contrato erro-como-valor (ADR 0004) |
| `_reversa_sdd/architecture.md` | #2 Camada de interface | componente-novo | Nova tela `interface/risco-cardiovascular/` (`tela/app/formulario/resultado/proveniencia`) sobre a `Moldura` comum, reusando `relator-de-erros` e `erro-de-campo` |
| `_reversa_sdd/state-machines.md` | #3 Máquinas de tela | componente-novo | `EstadoRiscoCardiovascular` (`vazio → sucesso \| fora-do-escopo \| erro \| falha-inesperada`), sem ritual de revisão (D-08) |
| `_reversa_sdd/code-analysis.md` | Módulo pages | componente-novo | Rota `pages/cardiologia/risco-cardiovascular.tsx`; raiz e rotas existentes inalteradas (D-02) |
| `_reversa_sdd/addenda/010-dor-toracica-pre-teste.md` | Catálogo | regra-alterada | A seção `cardiologia` passa a expor **duas** calculadoras (cardinalidade 1:N); a ficha da dor torácica preservada byte a byte |
| `_reversa_sdd/addenda/009-logo-apsi-no-cabecalho.md` | Camada de estilo | componente-novo | Folha própria `interface/estilos/risco-cardiovascular.css` (só tokens Primer); `globais.css` intocado |
| `_reversa_sdd/data-dictionary.md` · `erd-complete.md` | Dicionário / ERD | delta-de-dados | Novos value objects em memória (entrada, saída, coeficientes PCE); sem persistência nem migração de banco |
| `_reversa_sdd/architecture.md` | #3 Plataforma / API | delta-de-contrato-externo | **Nenhum delta real**: `GET /api/v1/status` byte a byte, zero requisição de rede nova, cálculo síncrono no cliente (registrado para leitura: o contrato permanece intacto) |

## Regras sob vigilância

Watch items desta feature (conteúdo em `_reversa_forward/014-risco-cardiovascular-pce/regression-watch.md`): **W001** (isolamento dos três motores), **W002** (cardinalidade 1:N na seção Cardiologia), **W003** (motor informa, não escolhe conduta), **W004** (fonte clínica única da unit), **W005** (golden cases ±0,1 pp + invariante de referência), **W006** (contrato externo e axe intactos).

## Fontes

- `_reversa_forward/014-risco-cardiovascular-pce/legacy-impact.md`
- `_reversa_forward/014-risco-cardiovascular-pce/regression-watch.md`
- `_reversa_forward/014-risco-cardiovascular-pce/requirements.md`
- `_reversa_forward/014-risco-cardiovascular-pce/roadmap.md`
- `_reversa_forward/014-risco-cardiovascular-pce/investigation.md`
- `_reversa_forward/014-risco-cardiovascular-pce/progress.jsonl`

## Atualização 2026-07-23

Após o coding, por pedido do prescritor, a tela ganhou um bloco de contexto metodológico (`ContextoDaFonte`, em `interface/risco-cardiovascular/proveniencia.tsx`) que explica por que a ferramenta usa as Pooled Cohort Equations e não a AHA PREVENT, com link para o estimador oficial da PREVENT (`professional.heart.org`). Decisão D-10 do roadmap; materializa a decisão do requirements §9.

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | #2 Camada de interface | componente-novo | `ContextoDaFonte` renderizado sempre na tela, **fora** do `aside` de resultado (material consultável, molde de `referencias.tsx`); ADR 0005 preservado — o resultado não emite conduta |
| `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md` | — | delta-de-contrato-externo (nenhum real) | O link para a PREVENT é `<a>` nativo (navegação do usuário), não requisição de rede; o e2e de privacidade e o axe da rota seguem verdes |

Suíte reconfirmada verde: vitest 423/423 (+2 casos do contexto), e2e 29/29, typecheck e lint limpos.
