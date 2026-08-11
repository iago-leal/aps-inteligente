# Investigação — 024, conexões do banco no status

> Data: `2026-08-10`
> Feature: `024-status-conexoes-do-banco`

## 1. O exame do real, e o que ele decidiu

O `requirements.md` fechou com três premissas declaradas, e duas delas eram bloqueantes: se a
apuração não coubesse numa consulta, a RN-01 cairia; se o papel de conexão não enxergasse as
estatísticas, a RN-03 faria **toda** requisição responder degradado. Nenhuma das duas se resolve por
raciocínio, e ambas foram medidas antes de o roadmap ser escrito.

**Ambiente da medição.** Contêiner do próprio projeto, `postgres:17.10-alpine`, subido por
`infra/compose.yaml` com `POSTGRES_PORT=5455`, porque a 5433 declarada em `.env.local` estava
ocupada por um contêiner de outro projeto desta máquina. Isso é achado de ambiente, não da feature,
e está registrado no `onboarding.md`.

### Consulta candidata

```sql
SELECT $1::int AS ok,
       current_setting('max_connections')::int AS teto_de_conexoes,
       (SELECT count(*) FROM pg_stat_activity
         WHERE datname = current_database())::int AS conexoes_abertas,
       current_setting('server_version') AS versao
```

Resultado: `{"ok":1,"teto_de_conexoes":100,"conexoes_abertas":1,"versao":"17.10"}`, entre 1 ms e
4 ms, numa ida só. **P-01 confirmada.** 🟢

### Permissão

| Papel | `rolsuper` | Membro de `pg_monitor` | Leu o teto | Leu a contagem |
|---|---|---|---|---|
| `aps` | sim | sim | sim | sim |
| `aps_limitado` (`NOSUPERUSER NOCREATEDB NOCREATEROLE`, só `GRANT CONNECT`) | não | não | **sim** | **sim** |

**P-02 confirmada.** 🟢 A razão é estrutural, e vale a pena registrar para o eu de daqui a doze
meses: `pg_stat_activity` restringe **colunas**, não **linhas**. Um papel sem privilégio vê todas as
linhas e recebe `NULL` em `query` e em outros campos sensíveis; `count(*)` não depende de nenhum
deles. E `max_connections` não é parâmetro de leitura restrita, de modo que `current_setting` o
devolve a qualquer papel. O papel de teste foi removido e o contêiner, parado.

### Versão, e a armadilha da denylist

| Expressão | Devolveu |
|---|---|
| `version()` | `PostgreSQL 17.10 on aarch64-unknown-linux-musl, compiled by …` |
| `current_setting('server_version')` | `17.10` |
| `current_setting('server_version_num')` | `170010` |

A primeira casa com `/postgres/i`, que é padrão vigente de `DENYLIST_DE_CONEXAO` em
`tests/contract/api/v1/status.test.ts`, e ainda revela arquitetura e compilador. Publicá-la
reprovaria a suíte, e com razão. Daí a **RN-06** do requirements e a **D-03** do roadmap.

A imagem alpine devolve `server_version` limpo. Imagens derivadas de Debian costumam anexar sufixo
entre parênteses, e por isso a decisão não é "use `server_version`" e sim "use `server_version`
**sanitizado** para o prefixo numérico".

### Os dois universos

| Contagem | Valor |
|---|---|
| `SELECT count(*) FROM pg_stat_activity` | 6 |
| `… WHERE datname = current_database()` | 1 |

A diferença não é ruído: são processos de manutenção e conexões a outros bancos da mesma instância.
Publicar a contagem do banco corrente ao lado do teto do servidor é comparar grandezas de escopos
diferentes, e é exatamente por isso que a **RN-08** obriga o contrato a declarar cada universo.

## 2. Alternativas avaliadas

### Para o número de consultas

| Alternativa | Por que foi descartada |
|---|---|
| Três consultas, no molde `latency` da referência | Contraria a RN-01, triplica o custo da única rota de observabilidade e arrisca fazer a própria medição causar o `tempo_esgotado`. Descartada também no requirements, como escopo negativo (RF-12) |
| Duas idas: a de saúde e outra para estatísticas | Dobra o custo e a chance de degradação por intermitência, sem ganho de informação |
| Função ou view criada no banco | Exigiria migração e esquema num projeto que deliberadamente não tem nenhum dos dois desde a feature 003 |
| **Uma consulta com quatro colunas** | **Escolhida.** Mesma viagem, mesma disciplina de teto e de descarte de cliente |

### Para o lugar dos campos no corpo

| Alternativa | Por que foi descartada |
|---|---|
| Raiz do corpo, ao lado de `ambiente` | Os valores descrevem o banco, e não o deploy. Na raiz, ficariam órfãos de sujeito e ninguém saberia a que estado se referem quando o banco estivesse fora |
| Bloco `dependencies` novo, no molde da referência | Reaninhamento é mudança incompatível pela regra do próprio contrato, e custaria `/api/v2`. Decidido na sessão de esclarecimento |
| Campos opcionais nos dois ramos de `EstadoDoBanco` | Permitiria `undefined` no ramo degradado e obrigaria cada consumidor a se defender. O tipo discriminado já resolve |
| **Ramo `integro` do tipo discriminado** | **Escolhida.** A RN-02 passa a ser verdade por construção |

### Para o nome dos campos

O pedido original trazia `max_connections` e `opened_connections`, do endpoint de referência; a
sessão de esclarecimento decidiu por português. Três pares foram considerados:

| Par | Avaliação |
|---|---|
| `maximo_de_conexoes` / `conexoes_abertas` | Colide com `MAXIMO_DE_CONEXOES` de `infra/database.ts`, que nomeia coisa diferente: o teto da **pilha da aplicação**, que vale cinco. Dois nomes iguais para grandezas distintas é a receita de erro de leitura em investigação |
| `conexoes_maximas` / `conexoes_abertas` | Sem colisão, mas "conexões máximas" soa artificial em português |
| **`teto_de_conexoes` / `conexoes_abertas`** | **Escolhido.** "Teto" é o termo que o projeto já usa para limite, em `TETO_PADRAO_MS` e em toda a prosa da feature 022, e não colide com nada |

## 3. Padrões aplicáveis

- **Erro esperado é valor** (invariante 2 do `domain.md`, ADR 0004). A falha de apuração não vira
  exceção que escapa: vira `ErroDeBanco` classificado, que `infra/saude.ts` converte em estado.
- **Tipo discriminado como guarda de contrato.** O mesmo recurso que a feature 022 usou para atar
  `causa` ao estado `degradado` agora ata os três valores ao estado `integro`. É a diferença entre
  uma regra que o teste vigia e uma regra que o compilador impõe.
- **Campo novo lido como opcional pelo consumidor** (D-09 da feature 022). O conferidor roda contra
  produção, que pode estar num deploy anterior; campo ausente é estado normal.

## 4. Fontes

- `https://www.tabnews.com.br/api/v1/status`, lido em 2026-08-10, origem da forma de referência.
- Medição própria contra `postgres:17.10-alpine`, descrita na seção 1, em 2026-08-10.
- `tests/contract/api/v1/status.test.ts`, para os vinte e três padrões da denylist verificada.
- `_reversa_sdd/code-analysis.md`, módulos 19, 20 e 21.
- `_reversa_forward/022-status-healthcheck-e-deploy/interfaces/`, os dois contratos que esta feature
  estende.

## 5. O que ficou por saber

Uma só coisa, e ela não bloqueia: o tipo de ponto de acesso que a `DATABASE_URL` de produção usa. A
`.env.local` desta máquina aponta para o Postgres local, e a variável de produção é injetada pela
integração do provedor, fora do alcance desta sessão. A pergunta é respondida pelo próprio campo no
primeiro deploy, o que está registrado como D-11 e como passo final do `onboarding.md`.
