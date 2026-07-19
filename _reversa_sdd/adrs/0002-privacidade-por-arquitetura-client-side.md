# ADR 0002 — Privacidade por arquitetura: cálculo 100% client-side, sem persistência de dado clínico

> Retroativo, reconstruído pelo Reversa Detective (2026-07-19) a partir de MD-0003 e MD-0011 (bundle). Confiança: 🟢

## Contexto
Produto de domínio clínico (responsabilidade médico-legal) mantido por um único mantenedor intermitente; a LGPD seria um custo contínuo de processo se houvesse coleta.

## Decisão
Nenhum dado de paciente (peso, glicemias, esquema) é enviado a servidor nem armazenado: a LGPD resolve-se por arquitetura — sem coleta, não há base legal a administrar nem vazamento possível. A invariante evoluiu de "SSG puro, sem rotas de API" para **"privacidade"** (MD-0011): rotas de API são permitidas desde que nenhum dado clínico trafegue ou persista por elas (a antiga guarda comportamental: sem leitura de corpo, sem `Set-Cookie`). No código atual isso se materializa em: nenhum `fetch`, único localStorage é o tema, e o tipo `EventoDeErro` (só nome da classe) torna vazamento estruturalmente impossível.

## Status
Ativa. Gatilho de revisão: a etapa futura do banco de dados, que exigirá reabrir a análise LGPD por emenda consciente de spec, nunca por brecha silenciosa.
