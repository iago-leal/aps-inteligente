# Data Delta: Fundação de banco de dados relacional

> Identificador: `003-banco-de-dados-psql-pg`
> Data: `2026-07-21`
> Modelo de referência: `_reversa_sdd/erd-complete.md` (entidades em memória)

## 1. Diff conceitual

**Nenhuma entidade de domínio muda.** O ERD extraído (`EntradaCalculo` → `SaidaCalculo` com value objects imutáveis) permanece o único modelo de dados do sistema, inteiramente em memória, no navegador. A feature adiciona um **plano de dados vazio**: um servidor PostgreSQL (local e gerenciado) sem nenhuma tabela de negócio.

## 2. Campos novos

n/a — nenhum campo, nenhuma tabela de negócio. O banco nasce com o schema default (`public`) vazio.

## 3. Campos removidos

n/a.

## 4. Migrações necessárias

n/a — não existe dado a migrar nem esquema a versionar. Decisão D-09 do roadmap: a primeira migração nasce junto do primeiro esquema, em feature futura, quando uma demanda validada (`P_n`) a originar.

## 5. Configuração de dados (novo)

| Item | Valor | Ambiente |
|---|---|---|
| `DATABASE_URL` | `postgres://<user>:<senha>@localhost:<porta>/<db>` | dev local (`.env.local`, não commitado; gabarito em `.env.example`) |
| `DATABASE_URL` | injetada pela integração Neon do marketplace (TLS obrigatório) | produção/preview (env do provedor) |
| `DATABASE_URL` | `postgres://…@localhost:5432/…` do service container | CI, job contrato (env do job) |

## 6. Fronteiras vigentes (inalteradas)

- MD-0003: nenhum dado clínico persistido — agora com alcance ampliado para dentro do banco (RN-01 do requirements).
- MD-0011: rotas de API só sem dado clínico — o endpoint de status não passa a consultar o banco (RN-03).
- Gatilho `permissions.md#vigilância-futura`: armado, não disparado — se um dia houver dado pessoal, autenticação/papéis/LGPD exigem spec própria antes do código.
