# ADR 0013 — Aritmética de datas gestacionais em dias epoch UTC

> Retroativo, reconstruído pelo Reversa Detective (2026-07-23, re-extração nº 2) a partir da decisão D-02 da feature 007 (`models/gestacao/datas.ts`). Confiança: 🟢

## Contexto
A datação gestacional é toda feita de diferenças de dias entre datas civis: idade gestacional (dias entre DUM e a referência), DPP por Naegele (soma de dias e meses), retroprojeção da DUM equivalente do ultrassom. Fuso horário e horário de verão tornariam "diferença de dias" ambígua — a mesma DUM poderia dar IGs distintas conforme o relógio local do dispositivo, e a UI injeta a data de referência do próprio dispositivo (RN-07).

## Decisão
Toda a aritmética de datas de `models/gestacao` roda sobre `Date.UTC` convertido a **dias epoch inteiros**, nunca sobre datas locais. `paraDiasEpoch` rejeita calendário impossível (ex.: 30 de fevereiro) devolvendo `null`, **nunca normalizando em silêncio** — data inválida é ofensor de validação (`DATA_INVALIDA`), não um valor corrigido às escondidas. A regra de Naegele (`+7 dias / +9 meses`) permanece calendárica: o dia excedente transborda ao mês seguinte, preservando a semântica clínica da soma de meses.

## Alternativas consideradas
- **Datas locais do dispositivo** — descartado: introduz dependência de fuso/DST e quebra o determinismo exigido pelo property-based testing.
- **Biblioteca de datas (date-fns, Luxon, dayjs)** — descartado: acoplaria o domínio puro a uma dependência externa (viola ADR 0003) para uma aritmética que cabe em funções pequenas e auditáveis.
- **Normalizar datas impossíveis** (JS faz isso por padrão: `new Date(2025,1,30)` vira 2 de março) — descartado: corromperia a entrada do médico sem aviso.

## Consequências
- O motor é determinístico e testável sem mockar o relógio; a data de referência é sempre entrada explícita.
- Erros de calendário são barulhentos (ofensor), coerentes com a preferência do mantenedor por falha explícita.
- Nenhuma dependência externa no domínio de datação.

## Status
Ativa. Padrão para qualquer domínio futuro que faça aritmética de datas civis.
