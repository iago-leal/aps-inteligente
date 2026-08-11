# Onboarding — 024, conexões do banco no status

> Data: `2026-08-10`
> Feature: `024-status-conexoes-do-banco`
> Para quem vai **testar a feature pela primeira vez**, inclusive o mantenedor depois de uma pausa

## 0. Antes de tudo, a armadilha de ambiente desta máquina

A `DATABASE_URL` de `.env.local` aponta para `localhost:5433`, e em 2026-08-10 essa porta estava
ocupada por um contêiner de **outro projeto** (`comentarios-enem-postgres`). O sintoma é enganoso:
a porta responde, e a autenticação falha com `28P01`, que se lê como "senha errada" quando o
problema é "banco errado".

Confira antes de acusar a credencial:

```bash
docker ps --format '{{.Names}}\t{{.Ports}}' | grep 543
```

Aparecendo um contêiner que não seja `aps-inteligente-banco`, escolha uma porta livre e use-a nos
dois lugares, `.env.local` e `.env.test.local`:

```bash
POSTGRES_PORT=5455 npm run db:up     # a variável de ambiente vence o --env-file
```

## 1. Subir o banco e a aplicação

```bash
npm run db:up                        # ou com POSTGRES_PORT, conforme o passo 0
npm run build && npm start           # http://localhost:3000, com CSP ativa
```

## 2. O caminho feliz

```bash
curl -s http://localhost:3000/api/v1/status | python3 -m json.tool
```

Esperado, no ramo do banco:

```json
"banco": {
  "estado": "integro",
  "teto_de_conexoes": 100,
  "conexoes_abertas": 1,
  "versao": "17.10"
}
```

**Três coisas a conferir com o olho, que nenhum teste conferirá por você:**

1. `conexoes_abertas` **nunca** é zero. O piso é um, porque a própria requisição se conta. Vendo
   zero, algo está contando o universo errado.
2. `versao` traz só o número. Vendo `PostgreSQL 17.10 on aarch64…`, a implementação usou `version()`
   em vez de `current_setting('server_version')`, e a suíte de contrato há de reprovar.
3. `teto_de_conexoes` é o do **servidor**, não os cinco da pilha da aplicação. Contra o contêiner
   local, o valor esperado é 100.

Para ver a contagem se mexer, abra uma sessão paralela e consulte de novo:

```bash
npm run db:psql        # deixe aberto num terminal
curl -s http://localhost:3000/api/v1/status | grep -o '"conexoes_abertas":[0-9]*'
```

## 3. O caminho degradado

Os três campos precisam **sumir**, e não valer zero:

```bash
npm run db:down                      # derruba o banco (remove o volume)
curl -s http://localhost:3000/api/v1/status | python3 -m json.tool
```

Esperado: `200`, com `"banco": {"estado":"degradado","causa":"conexao"}` e **nenhum** dos três
campos novos. O código HTTP continua sendo 200: degradado significa banco fora, não produto fora.

## 4. O caminho do teto de tempo

```bash
npm run db:up
APS_TIMEOUT_SAUDE_MS=1 npm start     # noutro terminal
curl -s http://localhost:3000/api/v1/status | grep -o '"causa":"[a-z_]*"'
```

Esperado: `"causa":"tempo_esgotado"`, sem os campos novos.

## 5. As suítes

```bash
npm run typecheck && npm run lint
npm test                             # unidade e integração, inclui tests/unit/infra/saude.test.ts
npm run test:api                     # contrato; exige o servidor do passo 1 de pé
```

Para o alvo degradado, que é o que prova a ausência dos campos, a suíte lê
`API_BASE_URL_DEGRADADO` e pula os casos quando a variável falta. Subir dois servidores é o que a
integração contínua faz dentro do job `contrato`.

## 6. A conferência de produção

```bash
npm run status:conferir
```

A linha de veredito passa a trazer a ocupação ao lado do estado do banco, no molde
`banco íntegro · 12/901 conexões`. Contra um deploy **anterior** a esta entrega, os campos não
existem, e o comando precisa dizer `ocupação desconhecida` sem falhar: é o cenário de aceite do
consumidor antigo, e vale a pena exercitá-lo apontando o comando para um deploy velho com
`--url`.

## 7. O passo que fecha a decisão D-11

Publicado o deploy, **leia o valor de `teto_de_conexoes` em produção**. Ele responde sozinho a
pergunta que não pôde ser respondida nesta máquina:

- Valor na casa da centena baixa indica que a rota fala com a instância de cálculo do plano
  gratuito, e que teto e contagem descrevem camadas compatíveis.
- Valor na casa dos milhares indica um agrupador de conexões no caminho, e então o teto publicado é
  o dele, e não o da instância. Nesse caso a ressalva da RN-08 deixa de ser precaução e vira o fato
  central a documentar no contrato.

Anote o valor observado no `regression-watch.md` da feature. É a diferença entre uma decisão 🟡 e uma
decisão 🟢.
