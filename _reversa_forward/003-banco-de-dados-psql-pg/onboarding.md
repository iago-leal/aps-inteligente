# Onboarding: Fundação de banco de dados relacional

> Identificador: `003-banco-de-dados-psql-pg`
> Data: `2026-07-21`
> Público: humano testando a feature pela primeira vez (ou o mantenedor daqui a 12 meses)

## 0. Pré-requisitos

- Docker em execução (`docker info` responde sem erro).
- Node ≥ 24 e `npm ci` executado na raiz do projeto.

## 1. Configurar o ambiente local

```bash
cp .env.example .env.local        # gabarito com DATABASE_URL local; ajuste a porta se 5432 estiver ocupada
```

## 2. Subir o banco local

```bash
npm run db:up                     # docker compose -f infra/compose.yaml up -d, com healthcheck
docker compose -f infra/compose.yaml ps   # serviço "db" deve constar como healthy
```

## 3. Verificar a saúde (o mesmo teste que roda no CI)

```bash
npm run build && npm start &      # build de produção local, como no job de contrato
npm run test:api                  # suíte de contrato: status + cabeçalhos + saúde do banco
```

Esperado: suíte verde, incluindo `tests/contract/infra/banco.test.ts`. Com o banco derrubado, esse teste deve **falhar com erro nomeado** em até 5 s — falha barulhenta é comportamento correto, não defeito.

## 4. Sessão interativa

```bash
npm run db:psql                   # abre o cliente psql de dentro do container
# dentro da sessão:  SELECT version();  \l  \q
```

## 5. Derrubar (e, se quiser, limpar)

```bash
npm run db:down                   # para o serviço, preserva o volume
npm run db:down -- -v             # para e remove o volume: próxima subida parte do zero
```

## 6. Produção (uma vez, no encerramento da feature)

1. Provisionar a Neon pelo marketplace: `npx vercel@56 install neon` (ou painel do projeto → Storage → Neon, plano gratuito). A integração injeta `DATABASE_URL` nos ambientes do projeto.
2. Puxar a variável para a máquina local: `npx vercel@56 env pull .env.producao.local`.
3. Rodar o smoke contra a instância gerenciada: `DATABASE_URL=$(grep '^DATABASE_URL=' .env.producao.local | cut -d= -f2-) npm run test:api -- tests/contract/infra/banco.test.ts`.
   - Primeira conexão pode demorar alguns segundos (autosuspend do plano gratuito); o teste tolera até o tempo-limite documentado.
4. Apagar `.env.producao.local` após o smoke (não deixar credencial em disco além do necessário).

## 7. Sinais de problema e leitura

| Sintoma | Leitura |
|---|---|
| `db:up` falha com porta em uso | Ajustar a porta no `.env.local` (variável do compose) e subir de novo |
| Teste de saúde falha com banco de pé | Conferir `DATABASE_URL` do `.env.local`; o erro nomeado indica a etapa (conexão × consulta) |
| Smoke de produção falha na 1.ª tentativa e passa na 2.ª | Cold start do free tier — esperado; só investigar se persistir |
| `Set-Cookie` ou mudança no corpo do `/api/v1/status` | Regressão do contrato da 002 (W006) — o banco jamais deveria tocá-lo |
