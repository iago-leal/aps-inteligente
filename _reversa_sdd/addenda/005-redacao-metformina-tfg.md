# Adendo: Leitura coerente das recomendações de metformina sob ajuste renal

> Feature: `005-redacao-metformina-tfg`
> Data: `2026-07-22`
> Cenário: `legado`

## Vigência

Vigente desde 2026-07-22.

## Resumo da entrega

A feature eliminou a leitura aparentemente contraditória entre "Manter a metformina..." e "TFG entre 30 e 45 mL/min/1,73 m²: reduzir a dose de metformina em 50%" na seção "Recomendações ao prescritor": quando as duas coexistem na mesma saída, a redução passa a ser renderizada como subitem recuado da manutenção, lida como conduta única (manter, com dose reduzida). A solução é integralmente de apresentação, escolhida pelo prescritor na sessão de esclarecimentos de 2026-07-22: os textos clínicos, as referências ao guia, os tipos, a ordem de saída do motor e as supressões de precedência da feature 001 permanecem byte a byte — `git diff models/` vazio. De quebra, a mesma sessão **validou clinicamente a precedência metformina×TFG** que o adendo 001 registrava como pendente ("a lógica ficou perfeita"). Beneficiário: o médico prescritor da APS. **6 de 6 ações concluídas** (T001–T006), suíte 202/202, contrato 16/16, e2e 4/4 com axe na linha de base (0).

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/code-analysis.md` | §módulo-2 (interface) | componente-novo | `interface/calculadora/agrupar-recomendacoes.ts`: função pura de apresentação `Recomendacao[] → grupos {principal, subitens}`, com mapa declarativo de um par (`REDUZIR_METFORMINA_TFG` subordinada a `MANTER_METFORMINA`) e fallback de subitem órfão (sem o pai na saída, permanece item de topo) |
| `_reversa_sdd/code-analysis.md` | §módulo-2 (`PainelResultado`) | regra-alterada | O componente `Recomendacoes` deixou de projetar a lista plana: renderiza os grupos como `<ul>` aninhada semântica; ordem fixa dos blocos do painel (RN-06 da UI) e máquina `EstadoResultado` intocadas; nenhuma regra de CSS nova (o seletor `.bloco-recomendacoes ul` já recua a sublista) |
| `_reversa_sdd/interface-calculadora/requirements.md` | Painel de resultado | regra-alterada | A apresentação da lista de recomendações ganhou um nível de subordinação no par metformina×TFG; ler a spec da UI com este delta até a re-extração |
| `_reversa_sdd/domain.md` | §3.1 (regra 3) e §3.4 (transversais, adendo 001) | regra-alterada | Somente o status de validação: a precedência clínica decidida no coding da feature 001 (TFG < 30 suprime `MANTER_METFORMINA`; TFG ≤ 45 suprime o alerta de otimização) foi **validada pelo prescritor em 2026-07-22** — a pendência anotada no adendo 001 está encerrada; comportamento e textos sem qualquer mudança |
| `_reversa_sdd/architecture.md` | §5 (testes) | regra-alterada | Suíte nova `tests/unit/interface/agrupar-recomendacoes.test.ts` (5 casos) e describe "Feature 005" em `resultado.test.tsx` (4 cenários do requirements §7); total 202 testes de unidade/integração |

## Regras sob vigilância

Watch items desta entrega: **W001–W003** — ver `_reversa_forward/005-redacao-metformina-tfg/regression-watch.md`. Observação sem peso de regressão registrada lá: a extensão do agrupamento à titulação com fracionamento deriva de premissa 🟡 aguardando validação do prescritor em uso real.

## Fontes

- `_reversa_forward/005-redacao-metformina-tfg/legacy-impact.md`
- `_reversa_forward/005-redacao-metformina-tfg/regression-watch.md`
- `_reversa_forward/005-redacao-metformina-tfg/requirements.md`
- `_reversa_forward/005-redacao-metformina-tfg/relatorio.md`
- `_reversa_forward/005-redacao-metformina-tfg/progress.jsonl`
