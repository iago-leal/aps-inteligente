# ADR 0005 — O motor não escolhe entre condutas que o guia dá como equivalentes

> Retroativo, reconstruído pelo Reversa Detective (2026-07-19) a partir das decisões AMB-03 e AMB-10 (requirements 001 §9, bundle). Confiança: 🟢

## Contexto
Em dois pontos o guia oferece condutas alternativas sem hierarquia: o braço AJ ≥ 130 com NPH no café (aumentar NPH +2 **ou** iniciar Regular 4 UI antes do almoço) e as proporções do fracionamento (½+½ **ou** ⅔+⅓).

## Decisão
O motor devolve **todas as condutas rotuladas** (`condutasAlternativas`), nunca decide pelo prescritor. No fracionamento, ½+½ vem como principal por ser a preferencial do guia; ⅔+⅓ como alternativa rotulada. A escolha clínica pertence ao médico, na tela de resultado — coerente com o produto ser apoio à decisão, não prescritor automático (mesma filosofia da AMB-01: faixa em vez de dose única no início).

## Status
Ativa. É princípio de produto: qualquer regra futura com equivalência no guia deve seguir o mesmo padrão.
