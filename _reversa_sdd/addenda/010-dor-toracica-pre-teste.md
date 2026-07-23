# Adendo 010 — Calculadora de dor torácica e probabilidade pré-teste de cardiopatia isquêmica

> Feature: `010-dor-toracica-pre-teste`
> Data: 2026-07-23 (ISO 8601)
> Cenário: **legado** (âncora: `_reversa_sdd/architecture.md` + `domain.md`)

## Vigência

Vigente desde 2026-07-23.

Superado pela re-extração de 2026-07-23.

## Resumo da entrega

Nasce a **terceira calculadora clínica** da plataforma guarda-chuva, para o médico da APS diante
de um paciente com dor torácica. A ferramenta operacionaliza a cascata do TeleCondutas *Cardiopatia
Isquêmica* (TelessaúdeRS-UFRGS, 2017, terceira fonte da plataforma): classifica a dor em **típica**,
**atípica** ou **não anginosa** pelas três características do Quadro 1 (RN-01); estima a **probabilidade
pré-teste de DAC** por idade, sexo e classificação, a partir do Quadro 2 congelado como matriz de 24
células (RN-02); ajusta pela presença de fatores de risco (RN-03); traduz a probabilidade em **conduta
de investigação** por estrato baixa/intermediária/alta (RN-04), orientando ergometria × método não
invasivo (RN-05); recusa honestamente idade fora de 30–69 anos (`ForaDoEscopoDaFonte`, RN-06); adverte
para encaminhamento emergencial na angina instável (RN-07); e exibe blocos de referência complementar
sem cálculo (RN-08/RF-10). Feature puramente **aditiva**, no molde da 007: nova unit de domínio
(`models/cardiopatia-isquemica/`) e nova tela (`interface/cardiologia/`), sem tocar os motores de
insulina e gestação (`git diff` vazio).

**Ações concluídas:** 30 de 30 (`actions.md` sem itens abertos; `progress.jsonl` com 30 registros).

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/architecture.md` | #1 (domínio puro em `models/`) | componente-novo | Terceira unit de domínio `models/cardiopatia-isquemica/` (`tipos`, `fonte-clinica`, `classificacao`, `probabilidade`, `conduta`, `validacao`, `calculadora`), isolada e sem dependência dos motores; ler a camada de domínio agora com três units, não duas |
| `_reversa_sdd/architecture.md` | #2 (interface / shell) | componente-novo · regra-alterada | Nova tela `interface/cardiologia/` (`app`, `formulario`, `resultado`, `referencias`, `tela`) reusando `Moldura`/`relator-de-erros`/`erro-de-campo`; `pages/_app.tsx` ganha um import de CSS após os globais (ordem preservada) |
| `_reversa_sdd/code-analysis.md` | #módulo-3 (pages) | componente-novo | Nova rota `pages/cardiologia/dor-toracica.tsx`, molde de `pages/pre-natal/idade-gestacional.tsx`; a raiz e as rotas existentes permanecem inalteradas |
| `_reversa_sdd/architecture.md` | #5 (testes) | componente-novo · regra-alterada | +81 unidade (property-based) em `tests/unit/dominio-cardiopatia/` e +9 integração em `tests/integration/interface/cardiologia.test.tsx`; `inicio.test.tsx` ganha +1 caso da seção nova (asserções antigas byte a byte) |
| `_reversa_sdd/domain.md` | #6 (fronteiras de escopo) | regra-nova | RN-06: idade fora de 30–69 → `ForaDoEscopoDaFonte`, sem extrapolar (MD-0009 aplicado à terceira fonte); RN-08/RF-10: material adicional (CCS, tratamento + Tabela 1, seguimento, manejo agudo) entra como referência textual, fora do núcleo calculado |
| `_reversa_sdd/domain.md` | #3.4 / ADR 0004 | regra-nova | Invariantes replicados na unit nova: coleta total de ofensores (`validacao.ts`), erros como valores de união, `ErroDeInvariante` só para bug, toda saída com `ReferenciaClinica` — verificados por property-based |
| `_reversa_sdd/domain.md` | #3.5 (regras da interface com força de domínio) | regra-nova | Privacidade por construção e invalidação por edição estendidas à tela nova (sem fetch/storage de dado clínico; `EventoDeErro` só transporta o nome da classe); sem ritual de revisão (D-08), espelhando a IG |
| `_reversa_sdd/addenda/007-idade-gestacional-e-home.md` | catálogo / harness e2e / diretriz de telas | regra-alterada | `interface/inicio/catalogo.ts` ganha a seção `cardiologia` (entradas antigas byte a byte); `e2e/plataforma.spec.ts` +6 casos e `axe-baseline.json` +2 chaves em zero (chaves antigas intocadas); `README.md` +1 linha na tabela de calculadoras |
| `_reversa_sdd/addenda/008-design-mais-bonito-da-home.md` | ícones da home | regra-alterada | `interface/inicio/icones.tsx` mapeia `cardiologia → HeartIcon`; fallback `null` preservado |
| `_reversa_sdd/addenda/009-logo-apsi-no-cabecalho.md` | camada de estilo | componente-novo | `interface/estilos/cardiologia.css` nova (globais.css no teto de 400 linhas), só tokens Primer |
| `_reversa_sdd/data-dictionary.md` (MD-0008) | fontes editoriais fora do git | delta-de-dados | PDF `referencias/telecondutas-*.pdf` da terceira fonte, fora do versionamento (`.gitignore` já cobre) |

Contratos externos: **nenhum delta** — `GET /api/v1/status`, CSP e cabeçalhos byte a byte
(contrato 16/16); zero requisição de rede nova. Motores `models/insulina/` e `models/gestacao/`
**byte a byte** (`git diff` vazio).

## Regras sob vigilância

**Watch principal: vazio.** A feature é aditiva e não alterou nem removeu regra 🟢 do `domain.md`;
não há regra a vigiar contra regressão na próxima re-extração
(ver `_reversa_forward/010-dor-toracica-pre-teste/regression-watch.md`).

Observações sem peso de regressão (leitura clínica a validar/promover na re-extração): **O-10-01**
a **O-10-05** — matriz `PROBABILIDADE_PRE_TESTE` das 24 células do Quadro 2, ajuste ×2–×3 capado em
99%/">90%", definição descritiva do estrato "baixa", ausência de ritual de revisão e escopo da fase 1.
Detalhe em `_reversa_forward/010-dor-toracica-pre-teste/regression-watch.md`.

## Fontes

- `_reversa_forward/010-dor-toracica-pre-teste/legacy-impact.md`
- `_reversa_forward/010-dor-toracica-pre-teste/regression-watch.md`
- `_reversa_forward/010-dor-toracica-pre-teste/requirements.md`
- `_reversa_forward/010-dor-toracica-pre-teste/progress.jsonl`
