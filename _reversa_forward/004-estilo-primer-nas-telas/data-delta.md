# Data delta: Primer como base de estilo das telas da plataforma

> Identificador: `004-estilo-primer-nas-telas`
> Data: `2026-07-21`
> Base: `_reversa_sdd/erd-complete.md` (entidades em memória) e `_reversa_sdd/addenda/003-banco-de-dados-psql-pg.md` (banco de fundação vazio)

## 1. Resumo

**Nenhum delta de dados.** A feature é estritamente de apresentação (RN-01): não cria, altera nem remove entidade, campo, tabela ou migração.

## 2. Verificação por superfície de dados

| Superfície | Estado antes | Estado depois | Delta |
|---|---|---|---|
| Entidades em memória (`EntradaCalculo` → `SaidaCalculo`, 4 variantes) | modelo único do sistema | idêntico | nenhum |
| Banco (local `postgres:17.10-alpine` e Neon; schema `public` vazio de fundação) | sem esquema de negócio | intocado — a feature nem importa `infra/database.ts` | nenhum |
| localStorage | única chave: `aps-inteligente:tema` ∈ {`claro`, `escuro`} | **mesma chave, mesmos valores** (RN-04/D-03); só muda o consumidor (adaptador → color mode do Primer) | nenhum |
| Cookies, sessionStorage, IndexedDB | inexistentes | inexistentes | nenhum |

## 3. Invariante vigiada

A preservação da chave `aps-inteligente:tema` com os valores literais `claro`/`escuro` é a única obrigação de dados da feature: preferências já gravadas por usuários reais devem sobreviver à migração sem conversão. Qualquer mecanismo interno do Primer que queira persistir color mode por conta própria está proibido de introduzir chave nova — a fonte de verdade permanece `preferencia-de-tema.ts`.

## 4. Migrações necessárias

n/a — nada a migrar em nenhuma superfície.
