# ADR 0015 — Domínio próprio `apsinteligente.app` (apex → www)

> Retroativo, reconstruído pelo Reversa Detective (2026-07-23, re-extração nº 3) a partir da feature 012 (`012-dominio-proprio`) e do adendo 012. Confiança: 🟢

## Contexto
A produção era servida apenas pela URL padrão do provedor (`aps-inteligente.vercel.app`). O adendo 002 registrava, à época, que "domínio próprio ficou fora do escopo". Com a plataforma no ar e ganhando corpo (quatro calculadoras), um endereço de marca passou a fazer sentido — sem, contudo, quebrar links antigos nem introduzir dependência de runtime.

## Decisão
A plataforma passou a ter domínio próprio, **`apsinteligente.app`**, apontado por configuração de DNS ao projeto da Vercel. A direção canônica é **apex → `www`**: `https://apsinteligente.app` responde `308` e redireciona para `https://www.apsinteligente.app`, o host que serve `200` diretamente. A URL padrão do provedor (`*.vercel.app`) **continua resolvendo em paralelo**, sem quebra de links.

A mudança foi conduzida **fora do ciclo forward, por proporcionalidade** (Princípio nº 4): é infra de rede, sem código de domínio nem de apresentação. O contrato de `GET /api/v1/status` foi verificado byte a byte no host novo — `200`, corpo `{atualizado_em, versao, commit}`, `Cache-Control: no-store`, CSP completa, `commit` igual ao HEAD de `main`.

## Alternativas consideradas
- **Apex nu como canônico** (`apsinteligente.app` servindo `200` direto) — registrado como possível inversão futura; a direção atual privilegia `www`. Observação, não decisão fechada.
- **Manter só a URL do provedor** — descartado: sem identidade de marca; endereço menos memorável para o prescritor.
- **Retroprojetar a mudança nos artefatos das features 002–011** — descartado: a migração é posterior; os artefatos daquelas entregas permanecem corretos ao dizer que, à época, o domínio próprio estava fora do escopo. Registrada adiante (adendo 012), não reescrita para trás.

## Consequências
- Endereço de marca em produção, sem quebrar `*.vercel.app`.
- Nenhuma dependência de runtime nova: o domínio próprio é camada de rede à frente do mesmo deploy Vercel.
- A privacidade por construção (ADR 0002/0008) é reafirmada: só muda o hostname público; nenhum fetch, estado ou dado clínico novo; o health-check segue sem autenticação e sem PII.
- `openapi/status.yaml` e o README passaram a citar `https://apsinteligente.app` como URL de produção (com nota do redirect `308`).

## Status
Ativa. Reavaliar apenas se se decidir inverter a canonicidade para o apex nu.
