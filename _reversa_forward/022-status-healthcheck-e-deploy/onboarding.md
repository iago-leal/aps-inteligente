# Onboarding: como testar a feature 022 com as próprias mãos

> Identificador: `022-status-healthcheck-e-deploy`
> Data: `2026-07-28`
> Público: quem for verificar a entrega pela primeira vez, inclusive o autor daqui a seis meses

Cada passo diz **o que rodar**, **o que esperar** e **o que significa se vier diferente**. Os
comandos são executáveis do diretório do projeto; nenhum exige painel de provedor, e é esse o ponto
da feature.

## 0. Antes de começar

Nesta máquina, o banco local escuta na **porta 5433**, e é isso que `.env.local` e `.env.test.local`
já declaram — a porta 5432 estava ocupada por outro Postgres. O `.env.example`, que é gabarito,
mostra 5432; não o siga cegamente.

```bash
node --version          # >= 24, como declara o campo engines
docker info > /dev/null # o serviço precisa estar de pé para o passo 1
```

## 1. Subir o banco local

```bash
npm run db:up
```

Esperado: o compose sobe o contêiner e o comando só retorna quando o healthcheck do próprio Postgres
passa (`--wait`).

Se falhar por porta ocupada, ajuste `POSTGRES_PORT` e a porta da `DATABASE_URL` em `.env.local`, e
replique a URL ajustada em `.env.test.local` — o loader do Next ignora `.env.local` em modo de
teste, por design.

## 2. Rodar a suíte que não precisa de servidor

```bash
npm run typecheck
npm run lint
npm test
```

Esperado: verde nos três. O que interessa aqui, especificamente desta feature, são os testes de
unidade de `infra/saude.ts`: eles cobrem o estado íntegro e os quatro degradados sem servidor e sem
banco, com o duplo no lugar de `saude()`.

## 3. Subir o build de produção e olhar o corpo

```bash
npm run build
npm start &
curl -s http://localhost:3000/api/v1/status | jq
```

Esperado, com o banco do passo 1 de pé:

```json
{
  "atualizado_em": "2026-07-28T20:03:11.482Z",
  "versao": "0.1.0",
  "commit": "local",
  "publicado_em": "2026-07-28T20:01:57.900Z",
  "ambiente": "local",
  "banco": { "estado": "integro" }
}
```

O que conferir, campo a campo:

- `commit` vale `"local"` porque não há provedor aqui. Correto.
- `ambiente` vale `"local"` pela mesma razão.
- `publicado_em` é **anterior** a `atualizado_em`, e por poucos segundos: é o instante do
  `npm run build`, não o da requisição.
- `banco.estado` vale `"integro"`. Se vier `"degradado"` com causa `configuracao`, falta
  `DATABASE_URL` no ambiente do servidor: `npm start` lê `.env.local`, e o passo 1 precisa ter
  rodado antes.

## 4. Provar que `publicado_em` não se confunde com `atualizado_em`

```bash
curl -s http://localhost:3000/api/v1/status | jq -r '.atualizado_em, .publicado_em'
sleep 2
curl -s http://localhost:3000/api/v1/status | jq -r '.atualizado_em, .publicado_em'
```

Esperado: `atualizado_em` muda entre as duas consultas; `publicado_em` permanece **idêntico**. É o
critério de aceite de RF-03, e é a razão de o campo existir.

Se `publicado_em` vier `null`, a substituição de `env` do `next.config.ts` não alcançou o bundle da
rota — é a premissa que o roadmap marcou 🟡, e o plano B está em `investigation.md` §4.

## 5. Derrubar o banco e ver a plataforma continuar de pé

Em outro terminal, com o servidor do passo 3 ainda rodando:

```bash
npm run db:down
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/api/v1/status
curl -s http://localhost:3000/api/v1/status | jq '.banco'
```

Esperado: **200**, e não 503. O corpo traz `{"estado":"degradado","causa":"conexao"}`.

E o mais importante, que é o argumento de `MD-0031`: abra `http://localhost:3000` no navegador e use
qualquer calculadora. Todas funcionam, porque o cálculo é integralmente cliente. É por isso que o
código de status não cai.

Confira também que nada vazou:

```bash
curl -s http://localhost:3000/api/v1/status | grep -Ei 'postgres|localhost|senha|password|select|5433' || echo "nada vazou"
```

Esperado: `nada vazou`. Se algum host, URL ou trecho de SQL aparecer, RF-06 está violado, e isso é
bloqueio de entrega, não observação.

Suba o banco de volta antes de seguir:

```bash
npm run db:up
```

## 6. Provocar o estouro de tempo

O teto é configurável justamente para poder ser exercitado. Derrube o servidor do passo 3 e suba-o
com um teto absurdo de pequeno:

```bash
APS_TIMEOUT_SAUDE_MS=1 npm start &
curl -s http://localhost:3000/api/v1/status | jq '.banco'
```

Esperado: `{"estado":"degradado","causa":"tempo_esgotado"}`, com resposta chegando de imediato — e
não `conexao`, que significaria banco fora, o que não é o caso.

Prove que a conexão não ficou pendurada, que é a razão de o cancelamento ser no servidor:

```bash
for i in $(seq 1 10); do curl -s http://localhost:3000/api/v1/status | jq -r '.banco.causa'; done
```

Esperado: dez respostas, todas imediatas. Se a partir da sexta o servidor começar a demorar ou
travar, as cinco conexões do pool ficaram presas — é o risco que D-03 existe para eliminar.

Derrube esse servidor e suba um normal antes de seguir.

## 7. Rodar a suíte de contrato

Com o build de produção de pé na porta 3000 e o banco acessível:

```bash
npm run test:api
```

Esperado: verde. Para exercitar também o alvo degradado, como o CI faz, suba um segundo servidor
sobre o mesmo build apontado a um endereço que recusa conexão:

```bash
DATABASE_URL='postgres://ninguem:nada@127.0.0.1:9/fora' PORT=3001 npm start &
API_BASE_URL_DEGRADADO=http://localhost:3001 npm run test:api
```

Esperado: verde, agora com as asserções do estado degradado — incluindo a denylist sobre o corpo
realmente serializado, que é o que um duplo de teste não provaria.

## 8. Rodar o comando de conferência

```bash
npm run status:conferir
```

Esperado, contra a produção: o veredito de defasagem que ele já dava, mais duas linhas novas — há
quanto tempo o deploy subiu e em que estado está o banco. O código de saída continua respondendo à
**defasagem**: 0 em dia, 1 defasada, 2 erro de apuração.

```bash
npm run status:conferir -- --json | jq '{em_dia, publicado_em: .producao.publicado_em, banco: .producao.banco}'
npm run status:conferir -- --exigir-saudavel; echo "saída: $?"
```

Esperado: com o banco de produção respondendo, `--exigir-saudavel` não muda nada. Com ele
degradado, a saída passa a ser diferente de zero mesmo estando em dia — que é a razão da opção.

Detalhe que vale entender antes de estranhar: se a produção ainda estiver no deploy **anterior** a
esta feature, os campos novos não existem no corpo, e o comando há de exibir "desconhecido" para
eles, sem falhar. Ausência de campo não é erro de contrato aqui, e é isso que D-09 protege.

## 9. Depois do deploy

```bash
npm run status:conferir
curl -s https://apsinteligente.app/api/v1/status | jq '{ambiente, publicado_em, banco}'
```

Esperado: `ambiente` vale `"producao"`. Essa é a conferência que fecha a única premissa 🟡 do
roadmap (D-05); se vier `"local"`, a variável do provedor não chegou ao runtime, e a correção é de
uma linha.

Aponte a mesma consulta a uma URL de pré-visualização e confira que `ambiente` **não** diz
`producao`. É o cenário "a URL consultada por engano se denuncia", e é o único jeito de exercitá-lo
de verdade.
