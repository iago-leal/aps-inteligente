# Legacy Impact: Fundação de banco de dados relacional

> Identificador: `003-banco-de-dados-psql-pg`
> Data: `2026-07-21`
> Âncora: extração de legado (`_reversa_sdd/architecture.md` + `domain.md`, 2026-07-19) e adendo `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md`

## 1. Arquivos afetados

| Arquivo afetado | Componente (extração) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `infra/compose.yaml` | Infraestrutura local — placeholder de `domain.md` §7 | componente-novo | LOW | Intenção declarada e não realizada torna-se serviço Postgres pinado (`postgres:17.10-alpine`), volume nomeado, healthcheck, porta parametrizada (D-01) |
| `infra/database.ts` | Camada de infraestrutura — quarto vértice fora do fluxo `pages → interface → models` (`architecture.md` §1; ADR 0003) | componente-novo | MEDIUM | Único ponto de acesso ao banco (RN-02): pool preguiçoso, consultas parametrizadas, `ErroDeBanco`, log com host mascarado. Nenhum módulo existente o importa |
| `infra/database.js` | Vestígio untracked de 2026-07-21 (fora da extração) | componente-extinto | LOW | Arquivo vazio substituído pelo módulo tipado (esclarecimento 4a do requirements) |
| `tests/contract/infra/banco.test.ts` | Pirâmide de testes, nível `contract` (adendo 002) | regra-alterada | LOW | A suíte de contrato passa a cobrir a saúde do banco com caso negativo; `status.test.ts` intocado (RN-03) |
| `vitest.api.config.ts` | Suíte de contrato (adendo 002) | regra-alterada | MEDIUM | Ganha carregamento de env via `@next/env` e repasse aos workers por `test.env`; include e ambiente inalterados |
| `.github/workflows/ci.yml` | CI/CD de três jobs (adendo 002) | regra-alterada | MEDIUM | Job **contrato** ganha service container Postgres (mesma imagem pinada) e `DATABASE_URL` de job; verificação e deploy intocados (D-08) |
| `package.json`, `package-lock.json` | Manifesto e lockfile (`architecture.md` §6, "versões pinadas") | regra-alterada | LOW | `pg` 8.22.0 e `@types/pg` 8.20.0 exatos; scripts `db:up`/`db:down`/`db:psql` lendo `.env.local` via `--env-file` |
| `.env.example`, `.env.test` | Configuração fora do código (princípio global 5.1; RN-04) | componente-novo | LOW | Gabarito commitado e env de teste com credencial local descartável (idêntica ao compose); nenhum segredo real |
| `.gitignore` | Governança do repositório | regra-alterada | LOW | A CLI da Vercel acrescentou `.env*` (engoliria `.env.example`/`.env.test`); linha revertida, entradas originais preservadas |
| `README.md` | Documentação MVP | regra-alterada | LOW | Seção nova responde subir/configurar/verificar/derrubar + sessão interativa (RF-05, RF-03) |
| Instância Neon `neon-indigo-lever` (externa) | Integrações externas (`architecture.md` §4: "nenhuma em runtime") | delta-de-contrato-externo | MEDIUM | Primeira dependência externa de dados (plano Free, marketplace); `DATABASE_URL` injetada em production/preview/development; fora do runtime da calculadora |
| `.claude/skills/neon*`, `.agents/skills/neon*`, `skills-lock.json` | — (colateral não previsto no plano) | componente-novo | LOW | Instalados automaticamente pela CLI da Vercel junto da integração; decidir no commit se ficam |

## 2. Diff conceitual por componente

**Infraestrutura local.** O placeholder `infra/compose.yaml` — registrado na extração como intenção declarada e não realizada (`domain.md` §7) — passa a declarar o serviço Postgres reproduzível da fundação. A porta do host é parametrizada (`POSTGRES_PORT`), mitigação que se provou necessária já na primeira execução: um Postgres nativo ocupava a 5432 desta máquina, e o ambiente local roda na 5433 sem tocar o serviço alheio (risco previsto no roadmap §9).

**Camada de acesso a dados.** Nasce o quarto vértice arquitetural (`infra/database.ts`), fora do fluxo unidirecional `pages → interface → models`. O domínio clínico e a interface permanecem com zero dependências novas: nenhum arquivo existente importa o módulo nesta feature — o acoplamento é somente da suíte de contrato para com ele. Erros são nomeados (`ErroDeBanco`, causas `conexao`/`consulta`/`configuracao`), a URL e a senha jamais aparecem em mensagem ou log, e não há retentativa automática.

**Suíte de contrato.** O nível `contract` da pirâmide (criado pela 002) amplia-se com `tests/contract/infra/banco.test.ts`: caso positivo, consulta parametrizada, caso negativo com porta fechada (erro nomeado dentro do tempo-limite) e caso de configuração ausente. O contrato de `GET /api/v1/status` permanece byte a byte o mesmo; a suíte local fechou 16/16.

**CI/CD.** O job contrato ganha um service container efêmero com a mesma imagem pinada do compose; a estrutura de três jobs e o gate de deploy não mudam. O CI não conhece a instância de produção (D-08): o smoke contra a Neon é manual e pontual (D-10), executado verde nesta entrega (4/4).

**Integrações externas.** A afirmação da extração "nenhuma integração externa em runtime" ganha um adendo: existe agora uma dependência externa de **dados** (Neon, plano Free), que não participa do runtime da calculadora nem do endpoint de status. Major confirmado em produção: PostgreSQL 17.10, paridade exata com o pin local — a premissa D-05 fechou sem ajuste.

**Colaterais da CLI.** A instalação da integração trouxe, sem participação do plano, duas skills (`neon`, `neon-postgres`) em `.claude/skills/` e `.agents/skills/`, um `skills-lock.json` e a linha `.env*` no `.gitignore` (revertida por engolir arquivos versionáveis). As skills são inofensivas e potencialmente úteis; a decisão de commitá-las ou removê-las fica para o commit da feature.

## 3. Preservadas (regras 🟢 do `domain.md` intactas)

- §3.1–3.4, regras 1–20: todo o motor clínico (`models/insulina/`) — nenhum arquivo tocado.
- §3.5, regras 21–23: privacidade por construção, invalidação por edição, UI espelhando `CONSTANTES` — interface intocada.
- §4: catálogo único congelado em `fonte-clinica.ts`; motor determinístico, sem parâmetro de ambiente novo no domínio.
- §5: decisões AMB-01..10 — inalteradas.
- §6: todas as fronteiras de escopo, com **alcance ampliado** em duas delas: MD-0003 (nenhum dado clínico persistido) passa a valer também dentro do banco (RN-01), e MD-0011 segue vigente — o status não consulta o banco (RN-03). O gatilho LGPD/autenticação de `permissions.md#vigilância-futura` permanece armado, não disparado: o schema `public` nasce e permanece vazio.
- Adendo 002: contrato fixo de `GET /api/v1/status` (W006 da 002) e gate de deploy — verificados verdes na suíte.

## 4. Modificadas

Nenhuma regra 🟢 do `domain.md` foi alterada ou removida. As modificações incidem sobre afirmações 🟢 da **extração arquitetural**, que a próxima re-extração deve reescrever:

- `architecture.md` §3 ("Sem banco — ausência por design") → existe banco de fundação, **sem esquema de negócio**, confinado à camada de infraestrutura.
- `architecture.md` §4 ("nenhuma integração externa em runtime") → primeira dependência externa de dados (Neon), fora do runtime clínico.
- `domain.md` §7 (intenção não realizada: `infra/compose.yaml` vazio) → realizada por esta feature.
- Adendo 002 (suíte de contrato e job de CI) → ampliados conforme §2 acima, sem quebra de contrato.
