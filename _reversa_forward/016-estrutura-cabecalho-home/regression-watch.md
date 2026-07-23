# Regression-watch: estrutura do cabeçalho da home unificada

> Feature `016-estrutura-cabecalho-home` · 2026-07-23
> Itens que a próxima extração `/reversa` deve reencontrar verdadeiros. Só regras
> originalmente 🟢 entram no watch principal; premissas 🟡 vão para "Observações".

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-------------------------------|---------------------|-------------------|
| W001 | `interface/comum/moldura.tsx`; `legacy-impact.md#modificadas` | A identidade do cabeçalho é unificada: a logo é **sempre** marca decorativa (`.cabecalho-marca`, `aria-hidden`, `alt=""`) fora do `h1`; o `h1` é **sempre** textual, em toda tela (inclusive a home) | presença/ausência | Existe `<img>` dentro de um `h1`, ou reaparece `.cabecalho-logo` |
| W002 | `interface/comum/moldura.tsx`; `interface-comum/requirements.md` | O contrato da `Moldura` expõe `comInicio` (default `false`) e **não** expõe `logoComoTitulo`; o ⌂ aparece só com `comInicio` | presença/ausência | `logoComoTitulo` volta a existir no contrato, ou o ⌂ passa a derivar de outra flag |
| W003 | `interface/comum/moldura.tsx`; `domain.md#7.2` (regra 11) | O comando de início está **ausente na home** e **presente nas quatro calculadoras** — comportamento da regra 11 preservado sob o novo mecanismo | presença | Home exibe ⌂, ou uma calculadora deixa de exibi-lo |
| W004 | `e2e/cabecalho.spec.ts`; `tests/unit/interface/cabecalho-sem-altura-fixa.test.ts` | A altura do `.cabecalho` coincide (±2px) em todas as rotas por construção, **sem** `height`/`min-height` no seletor `.cabecalho` | presença/ausência | Alguma rota diverge em altura, ou surge altura fixa no container `.cabecalho` |
| W005 | `interface/estilos/inicio.css`; `legacy-impact.md#modificadas` | A variante `destaque` guarda só a coluna de 720px e a borda `muted`; a tipografia de hero (h1 28/24px, subtítulo 14px, `max-width:60ch`, `gap` 6px) está **ausente** | ausência | Reaparece regra de tipografia de hero na variante `destaque` |

## Observações (sem peso de regressão)

- **O-016-01 (🟡, premissa D-06):** a coincidência de altura pressupõe o subtítulo da home em **uma linha** na coluna de 720px. Confirmado na entrega (home = 209px = calculadoras; subtítulo em uma linha, texto intacto). Se o subtítulo crescer ou a coluna estreitar, pode voltar a quebrar em duas linhas e reabrir a divergência — o gate é a guarda de altura W004, cuja falha aciona o encurtamento previsto em D-06.

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso ao rodar /reversa novamente. -->

## Arquivadas

<!-- Nenhum item arquivado. -->
