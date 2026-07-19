# ADR 0003 — Domínio puro fora do framework, em três camadas com dependência unidirecional

> Retroativo, reconstruído pelo Reversa Detective (2026-07-19) a partir de MD-0004/MD-0005 (bundle) e do código atual. Confiança: 🟢

## Contexto
A regra clínica tem responsabilidade médico-legal e precisa ser testável isolada de framework: reproduzir os exemplos numéricos do guia como testes de validação e property-based, sem DOM nem servidor.

## Decisão
Três componentes com dependência unidirecional: `models/insulina` (domínio puro em TypeScript, zero imports de React/Next, única camada com regra clínica) ← `interface/calculadora` (React, consome o motor pela fachada `CalculadoraInsulinaDM2`) ← `pages` (shell Next.js). A UI importa `CONSTANTES` do domínio para espelhar validação — não existe segunda fonte de números. As specs se organizam **por módulo** (MD-0005), 1:1 com essa fronteira. Pacote npm separado para o motor foi descartado (infra de release desproporcional); a fronteira era garantida por lint (D-01) — 🔴 a regra de lint de fronteira não foi reconstituída após a refundação.

## Status
Ativa e visível na estrutura atual (`models/` renomeado de `src/dominio/` na refundação). Pendência: restaurar a verificação automática da fronteira de camadas.
