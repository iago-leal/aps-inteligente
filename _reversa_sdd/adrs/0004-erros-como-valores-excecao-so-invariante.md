# ADR 0004 — Erros esperados como valores; exceção reservada a bug interno

> Retroativo, reconstruído pelo Reversa Detective (2026-07-19) a partir do código (`tipos.ts`, `calculadora.ts`) e RNF-05/EC-07 citados nos comentários. Confiança: 🟢

## Contexto
Numa calculadora clínica, confundir "entrada inválida" com "bug do motor" é perigoso: o primeiro pede correção do usuário; o segundo proíbe a prescrição.

## Decisão
A saída do motor é a union discriminada `SaidaCalculo = ResultadoCalculo | ErroValidacao | ForaDoEscopoDaFonte` — erros esperados são **valores**, com todos os ofensores coletados de uma vez. Exceção (`ErroDeInvariante`, lançada pelos value objects `Peso`/`Glicemia`/`DoseUi`) sinaliza exclusivamente bug interno e leva a UI ao painel honesto (EC-07: "Não prescreva a partir desta tela") com evento anônimo ao `RelatorDeErros`.

## Status
Ativa; verificada por testes de invariantes (fast-check) e pela suíte de integração do painel.
