# ADR 0011 — Uma fonte clínica por unit de domínio (plataforma multi-fonte guarda-chuva)

> Retroativo, reconstruído pelo Reversa Detective (2026-07-23, re-extração nº 2) a partir das features 007 e 010 e do RN-06 da 007. Estende e generaliza o ADR 0001 (que fixava a fonte única da insulina). Confiança: 🟢

## Contexto
O ADR 0001 fixou uma fonte clínica única para a calculadora de insulina. Ao virar plataforma guarda-chuva (features 007 e 010), o sistema passou a hospedar **três domínios clínicos** com origens editoriais distintas: *Guia Rápido Diabetes Mellitus* (SMS-Rio, 2023), *Guia Rápido Pré-Natal* (SMS-Rio, 2025) e *TeleCondutas — Cardiopatia Isquêmica* (TelessaúdeRS-UFRGS, 2017). Mesclar constantes, referências ou vocabulário entre fontes produziria drift clínico silencioso — o número de um guia lido sob a autoridade de outro.

## Decisão
Cada unit de `models/*` tem **uma, e apenas uma, fonte clínica**, com catálogo próprio de `REFERENCIAS` e `CONSTANTES` congeladas em seu `fonte-clinica.ts`. Nenhuma constante, referência ou texto cruza a fronteira entre units. A calculadora cobre exatamente o que a sua fonte cobre, nada além (MD-0009 aplicado a cada domínio): fora do escopo, recusa honesta em vez de extrapolar. Toda calculadora nova nasce declarando sua fonte no catálogo de navegação (`interface/inicio/catalogo.ts`) antes do código.

## Alternativas consideradas
- **Catálogo de referências compartilhado entre domínios** — descartado: acoplaria clinicamente guias sem relação e facilitaria drift.
- **Fonte múltipla por calculadora** (combinar diretrizes) — descartado: a fonte única é o que torna cada saída auditável página a página.

## Consequências
- Adicionar um domínio é aditivo e isolado (`git diff` dos outros motores vazio — comprovado nas features 007 e 010).
- Nova edição de qualquer guia é gatilho de revisão registrado, restrito à sua unit (MD-0008).
- Os PDFs das três fontes ficam fora do versionamento (MD-0008); a conferência depende de o usuário fornecê-los.

## Status
Ativa. É princípio de produto: toda calculadora futura entra com sua própria fonte única e catálogo próprio.
