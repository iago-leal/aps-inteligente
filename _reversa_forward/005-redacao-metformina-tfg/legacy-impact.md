# Legacy impact: Leitura coerente das recomendações de metformina sob ajuste renal

> Identificador: `005-redacao-metformina-tfg`
> Data: `2026-07-22`
> Cenário: legado (âncora: `_reversa_sdd/architecture.md` + `_reversa_sdd/domain.md`, com adendos 001–004 vigentes)

## 1. Arquivos afetados

| Arquivo afetado | Componente (`_reversa_sdd/`) | Tipo | Severidade | Justificativa |
|-----------------|------------------------------|------|------------|---------------|
| `interface/calculadora/agrupar-recomendacoes.ts` (novo) | `code-analysis.md#módulo-2` (interface da calculadora) | componente-novo | LOW | Função pura de apresentação: agrupa a lista de recomendações para renderização; nenhum comportamento clínico novo |
| `interface/calculadora/resultado.tsx` | `code-analysis.md#módulo-2` (`PainelResultado`) | regra-alterada | LOW | Componente `Recomendacoes` passa de lista plana a lista aninhada quando `REDUZIR_METFORMINA_TFG` coexiste com `MANTER_METFORMINA`; textos, ordem dos demais blocos (RN-06 da UI) e máquina `EstadoResultado` intocados |
| `tests/unit/interface/agrupar-recomendacoes.test.ts` (novo) | `architecture.md#5` (testes) | componente-novo | LOW | Cobertura de unidade do agrupador (5 casos, incluindo fallback e não-mutação) |
| `tests/integration/interface/resultado.test.tsx` | `architecture.md#5` (testes) | regra-alterada | LOW | Describe novo "Feature 005" com os quatro cenários do requirements §7; nenhuma asserção pré-existente alterada |

## 2. Diff conceitual por componente

**Interface da calculadora (módulo 2).** A lista "Recomendações ao prescritor" deixou de ser uma projeção plana e ordenada de `recomendacoesAoPrescritor` e passou a ser uma projeção agrupada: o par clínico validado pelo prescritor (redução da metformina por TFG qualifica a manutenção) é renderizado como item + subitem em `<ul>` aninhada semântica. O agrupamento é declarativo (mapa `SUBORDINACOES` com um único par) e tem fallback: subitem cujo pai não está presente na saída permanece item de topo. Nenhuma dependência nova, nenhuma regra de CSS nova (o seletor descendente `.bloco-recomendacoes ul` já recua a sublista).

**Motor de domínio (módulo 1).** Intocado por exigência do RF-03 — `git diff models/` vazio. A ordem de saída da fachada, as supressões de precedência da feature 001 e todos os textos e referências clínicas permanecem byte a byte.

## 3. Preservadas (regras 🟢 do `domain.md` que continuam intactas)

- §3.1 regra 3 — recomendações fixas do início (manter metformina; manter sulfonilureia salvo negação; aferição 3×/semana por 15 dias), incluindo a supressão de `MANTER_METFORMINA` por `SUSPENDER_METFORMINA_TFG` (adendo 001).
- §3.2 regra 8 — fracionamento e suspensão condicional de sulfonilureia, com as quatro redações de `TEXTO_SUSPENDER_SULFONILUREIA`.
- §3.4 regras transversais de antidiabéticos orais (adendo 001) — limiares de TFG (45/30), textos e referências (p. 28/58) inalterados.
- §3.4 regra 19 — severidade e ordenação de alertas; pós-processamento da fachada sem mudança.
- §3.4 regra 15 — validação de entrada (faixas de metformina e TFG) intocada.
- ADRs 0001–0009 — em particular 0002 (client-side, nada é enviado) e 0003 (domínio puro): a feature reforça ambos ao manter a apresentação fora do domínio.

## 4. Modificadas

- **Apresentação da lista de recomendações** (spec da UI: `_reversa_sdd/interface-calculadora/requirements.md`, painel de resultado; `code-analysis.md#módulo-2`): de lista plana na ordem do motor para lista com um nível de subordinação no par `MANTER_METFORMINA` ← `REDUZIR_METFORMINA_TFG`. É a única regra alterada, e é de apresentação — origem: requirements da feature 005 (RN-01/RN-03), decisão do prescritor na sessão de esclarecimentos de 2026-07-22.
