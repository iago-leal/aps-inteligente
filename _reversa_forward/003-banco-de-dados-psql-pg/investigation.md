# Investigation: Fundação de banco de dados relacional

> Identificador: `003-banco-de-dados-psql-pg`
> Data: `2026-07-21`

## 1. Estado do host e do repositório (verificado em 2026-07-21)

- Docker 29.4.0 instalado e funcional; Node v26.1.0 (manifesto exige ≥ 24); gerenciador npm com lockfile commitado e todas as versões pinadas (`_reversa_sdd/dependencies.md`).
- `psql` **ausente** no host — motivou o D-07 (cliente interativo de dentro do container, sem instalação nova).
- `infra/compose.yaml` existe vazio desde a refundação (intenção declarada, `_reversa_sdd/domain.md#7`); `infra/database.js` vazio criado pelo mantenedor em 2026-07-21 (embrião do pedido, substituído pelo módulo tipado).
- Produção no ar com CI de três jobs (adendo 002); pendência herdada: `VERCEL_TOKEN` inválido desde 2026-07-21.

## 2. Biblioteca de acesso

- `pg` (node-postgres) está em **8.22.0**, publicada há cerca de um mês — projeto ativo, mantido, padrão de fato do ecossistema Node para Postgres. Fontes: [pg — npm](https://www.npmjs.com/package/pg), [node-postgres.com](https://node-postgres.com/), [@types/pg — npm](https://www.npmjs.com/package/@types/pg).
- Custo: gratuita (MIT). Integração: biblioteca npm, pinada no manifesto.
- Por que ela: restrição declarada do usuário, coincidente com a escolha "chata-estável" do filtro de longevidade; alternativas `postgres.js` e `pg-promise` descartadas no D-02.
- `pg` funciona com a Neon em runtime Node sem driver especial; o driver serverless da Neon só é necessário em edge runtime, que o projeto não usa (a plataforma recomenda Fluid Compute/Node). Fonte: [Vercel Postgres Transition Guide — Neon Docs](https://neon.com/docs/guides/vercel-postgres-transition-guide).

## 3. Provedor gerenciado para produção

- A plataforma de hospedagem **não oferece mais banco próprio**: o antigo Vercel Postgres migrou para a Neon em dezembro de 2024 e a oferta atual se dá pelo Vercel Marketplace. Fontes: [Postgres on Vercel](https://vercel.com/docs/postgres), [Neon for Vercel — marketplace](https://vercel.com/marketplace/neon).
- Plano do usuário Hobby dá acesso ao **plano gratuito da Neon**; a integração instala o recurso e **injeta `DATABASE_URL`** (e variantes) nos ambientes do projeto. Fontes: [Connecting with the Vercel-Managed Integration — Neon Docs](https://neon.com/docs/guides/vercel-managed-integration), [Vercel with Neon Postgres — template](https://vercel.com/templates/next.js/vercel-with-neon-postgres).
- Custo: gratuito no nível de entrada (autosuspend após inatividade — cold start na primeira conexão, tolerado no D-10). Alternativas do marketplace avaliadas: Supabase (gratuito, mas arrasta auth/storage/API REST desnecessários à fundação) e Prisma Postgres (acopla ao ORM Prisma, vetado pelo D-02/D-09).
- Filtro de longevidade: Neon é organização com produto comercial ativo, documentação extensa e integração primeira-classe na plataforma — aprovada.

## 4. Imagem local e paridade

- Imagem oficial `postgres` (Docker Hub), variante alpine, pinada em major.minor no compose. O major local deve espelhar o da instância Neon (premissa: 17), confirmado no ato do provisionamento (D-05).
- Healthcheck com `pg_isready` no compose evita corrida entre subida do serviço e primeiro teste.

## 5. Padrões aplicáveis

- **Pool preguiçoso singleton**: o pool nasce no primeiro uso e é reutilizado; módulos de teste encerram com `pool.end()` explícito — evita conexões órfãs no Vitest.
- **Consultas parametrizadas sempre** (`$1, $2, ...`): elimina injeção por concatenação desde o primeiro dia.
- **Erros nomeados**: classe `ErroDeBanco` (nome + causa), espelhando o padrão "erros como valores/exceção só para invariante" do domínio (ADR 0004, por analogia na infraestrutura).
- **Credencial nunca logada**: mensagens de erro citam host mascarado e nome do erro, jamais a URL.

## 6. Fontes externas consultadas

- [Vercel Postgres Transition Guide — Neon Docs](https://neon.com/docs/guides/vercel-postgres-transition-guide)
- [Postgres on Vercel — docs](https://vercel.com/docs/postgres)
- [Neon for Vercel — Vercel Marketplace](https://vercel.com/marketplace/neon)
- [Connecting with the Vercel-Managed Integration — Neon Docs](https://neon.com/docs/guides/vercel-managed-integration)
- [Vercel with Neon Postgres — template oficial](https://vercel.com/templates/next.js/vercel-with-neon-postgres)
- [pg — npm](https://www.npmjs.com/package/pg) · [node-postgres.com](https://node-postgres.com/) · [@types/pg — npm](https://www.npmjs.com/package/@types/pg)
