# ADR 0012 — Ritual de revisão é específico da prescrição de dose

> Retroativo, reconstruído pelo Reversa Detective (2026-07-23, re-extração nº 2) a partir da decisão D-08 das features 007 e 010. Confiança: 🟢

## Contexto
A calculadora de insulina exige, antes de "Pronto para prescrever" e do botão **Copiar plano**, que o médico marque "Revisei a dose e a fonte" (ritual de revisão, features 004–006). Ao criar as calculadoras de idade gestacional (007) e de dor torácica (010), colocou-se a questão de replicar o mesmo gate.

## Decisão
O ritual de revisão **não** se replica fora da insulina (D-08). A gestação **data** (calcula IG/DPP) e a cardiopatia **estratifica** (probabilidade pré-teste + conduta de investigação); nenhuma das duas **prescreve dose**. O gate de responsabilização existe onde há um número que vira prescrição direta — a dose de insulina —, não onde a saída é uma datação ou uma estratificação de risco que o médico ainda traduzirá em conduta. As telas de gestação e cardiopatia mantêm todos os outros invariantes de UI (invalidação por edição, painel honesto, privacidade), sem o checkbox.

## Alternativas consideradas
- **Replicar o ritual em toda tela** — descartado: transformaria um gate de segurança clínica significativo num clique ritualístico esvaziado, e "usada com frequência, a ênfase deixa de enfatizar".
- **Remover o ritual também da insulina** — fora de escopo: a feature 006 justamente *funcionalizou* o ritual (Copiar plano gated pelo checkbox), reforçando-o.

## Consequências
- `EstadoIg` e `EstadoCardiologia` não têm a flag `revisaoConfirmada` — máquinas de estado mais simples que `EstadoResultado`.
- A distinção "prescreve dose × informa" fica explícita no produto e orienta futuras calculadoras: só as que emitem dose prescritível ganham o ritual.

## Status
Ativa. Critério para telas futuras: o ritual de revisão acompanha a prescrição de dose, não o cálculo clínico em geral.
