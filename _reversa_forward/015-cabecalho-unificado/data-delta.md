# Data-delta: Cabeçalho unificado

> Feature `015-cabecalho-unificado` · 2026-07-23

## Resumo

**n/a — sem delta de dados.**

A plataforma APS Inteligente não possui modelo de dados persistido no cliente afetado por esta feature: os cálculos rodam 100% no navegador e nada é salvo nem enviado (`_reversa_sdd/domain.md`, invariante de privacidade). A única superfície de dados do repositório é o endpoint `/api/v1/status`, que esta feature não toca.

Esta é uma feature de **apresentação** (CSS + guarda de teste). Não há:

- novos campos ou tipos de domínio;
- campos removidos ou renomeados;
- mudança em `EstadoRiscoCardiovascular` ou em qualquer máquina de estado (`_reversa_sdd/state-machines.md`);
- migração de esquema, índice ou store local.

O único "estado" observável — a preferência de tema em `data-tema` (`preferencia-de-tema.ts`) — permanece intocado (roadmap D-03).

Nada a migrar. Ver `roadmap.md` §6 e §8.
