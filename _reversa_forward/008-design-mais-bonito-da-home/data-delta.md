# Data delta — 008-design-mais-bonito-da-home

> Data: 2026-07-23
> Base: `_reversa_sdd/erd-complete.md` (entidades em memória; sem banco por design, ADR 0002)

## Resumo

**Nenhum delta de dados.** A feature é exclusivamente de apresentação:

- Nenhuma entidade, campo ou tipo do domínio muda (`models/**` intocado; `git diff models/` vazio é critério de pronto).
- Nenhum storage novo: o único localStorage segue sendo a preferência de tema (chave `aps-inteligente:tema`), intocada.
- Nenhuma tabela, migração ou índice: o banco da feature 003 (`infra/database.ts`) não é tocado.
- O catálogo tipado (`interface/inicio/catalogo.ts`) — estrutura de navegação, não dado persistido — permanece byte a byte (RN-02); o mapa de ícones por seção vive na camada de apresentação e não altera o tipo `SecaoDaPlataforma`.

## Migrações necessárias

n/a
