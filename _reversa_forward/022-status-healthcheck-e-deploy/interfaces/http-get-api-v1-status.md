# Contrato HTTP — `GET /api/v1/status` (revisão da feature 022)

> Feature: `022-status-healthcheck-e-deploy`
> Data: 2026-07-28
> Realiza: RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-09 (RN-01 a RN-06)
> Estende `_reversa_forward/002-producao-pagina-e-api-status/interfaces/http-get-api-v1-status.md`, que permanece vigente naquilo que este documento não altera.
> Decisões: `MD-0031` (200 em todo estado do banco), `MD-0032` (verificação incondicional, com gatilho de revisão)

## Propósito

O mesmo da 002, com um acréscimo: além de confirmar **qual** estado está publicado, a resposta passa
a confirmar **quando** ele subiu, **onde** está rodando e se a dependência que a arquitetura atribui
a este endpoint responde. Endpoint público, sem autenticação, sem estado, sem dado clínico (ADR
0008).

## Natureza da mudança

🟢 **Aditiva, dentro de `/api/v1`.** A seção "Propriedades" do contrato da 002 declara
"Versionamento: dentro de `/api/v1`, apenas mudanças aditivas de campos", e é exatamente o caso:
`atualizado_em`, `versao` e `commit` permanecem na raiz, com o mesmo nome, o mesmo tipo e a mesma
semântica. Nenhum reaninhamento, nenhuma remoção, nenhuma troca de significado. `/api/v2` não é
necessário e não se abre.

## Request

Inalterado em relação à 002.

| Aspecto | Valor |
|---------|-------|
| Método | `GET` |
| Caminho | `/api/v1/status` |
| Parâmetros | nenhum — query e corpo ignorados; o handler jamais lê corpo (guarda ADR 0008) |
| Autenticação | nenhuma |
| Headers exigidos | nenhum |

🟢 **Não existe parâmetro que ligue ou desligue a verificação do banco** (`MD-0032`): a verificação é
incondicional, e é assim que o caminho padrão deixa de mentir.

## Response

### `200 OK` — em todo estado do banco

Headers obrigatórios, todos inalterados:

| Header | Valor |
|---|---|
| `Content-Type` | `application/json; charset=utf-8` |
| `Cache-Control` | `no-store` (RN-05 da 002: resposta jamais servida de cache) |
| `Set-Cookie` | **ausente**, invariável |

🟢 **O código é 200 mesmo com o banco fora** (`MD-0031`). O produto é integralmente cliente: as seis
calculadoras seguem servindo com a dependência caída, e um 503 afirmaria queda de uma plataforma que
está no ar. O código responde se a rota funcionou; o corpo responde o que ela apurou.

#### Corpo — plataforma íntegra

```json
{
  "atualizado_em": "2026-07-28T19:45:00.000Z",
  "versao": "0.1.0",
  "commit": "5db2cb42eb77cc402b40028851c6dc012f48b9d9",
  "publicado_em": "2026-07-28T19:12:31.004Z",
  "ambiente": "producao",
  "banco": { "estado": "integro" }
}
```

#### Corpo — banco degradado

```json
{
  "atualizado_em": "2026-07-28T19:46:02.117Z",
  "versao": "0.1.0",
  "commit": "5db2cb42eb77cc402b40028851c6dc012f48b9d9",
  "publicado_em": "2026-07-28T19:12:31.004Z",
  "ambiente": "producao",
  "banco": { "estado": "degradado", "causa": "conexao" }
}
```

#### Campos

| Campo | Tipo | Presença | Semântica |
|---|---|---|---|
| `atualizado_em` | string ISO 8601 UTC | sempre | Momento em que **esta resposta** foi gerada. Prova de frescor; muda a cada consulta |
| `versao` | string | sempre | Versão do manifesto do projeto no build publicado |
| `commit` | string | sempre | SHA do commit publicado; `"local"` quando fora do provedor |
| `publicado_em` | string ISO 8601 UTC ou `null` | sempre presente, valor podendo ser nulo | Instante em que o build deste deploy foi gerado. **Idêntico entre duas consultas ao mesmo deploy** e distinto entre deploys. `null` quando o build não carimbou o valor |
| `ambiente` | `"producao"` \| `"pre-visualizacao"` \| `"local"` | sempre | Onde este deploy está servindo. Vocabulário próprio: o valor do provedor é traduzido, jamais repassado cru |
| `banco.estado` | `"integro"` \| `"degradado"` | sempre | Resultado da verificação de conectividade desta requisição |
| `banco.causa` | `"conexao"` \| `"consulta"` \| `"configuracao"` \| `"tempo_esgotado"` | só quando `degradado` | Por que a verificação falhou, em vocabulário público fechado |

🟢 **A distinção que RN-04 exige** está entre `atualizado_em` e `publicado_em`: o primeiro mede a
resposta, o segundo mede o deploy. Confundi-los é o erro que a feature corrige.

#### Vocabulário de `banco.causa`

| Valor | Significa | Não significa |
|---|---|---|
| `conexao` | O banco não foi alcançado, ou recusou a conexão | Nada sobre host, porta ou credencial: esses ficam no log, com host mascarado |
| `consulta` | A conexão abriu, e a consulta de saúde não devolveu o resultado esperado | Nenhum trecho de SQL acompanha o valor |
| `configuracao` | A conexão não está definida ou está malformada no ambiente | A URL jamais é ecoada, nem parcialmente |
| `tempo_esgotado` | O teto de tempo da verificação foi atingido, e a consulta foi cancelada no servidor | Não é sinônimo de banco fora: a instância pode estar apenas despertando da suspensão |

### `405 Method Not Allowed` — método diferente de GET

Inalterado, e com uma garantia a mais: **o banco não é consultado**. A discriminação de método
precede qualquer I/O.

| Header | Valor |
|---|---|
| `Allow` | `GET` |

Corpo: JSON de erro simples, sem eco da requisição.

### `500` — falha inesperada

Continua improvável, e a feature amplia a razão disso: a falha da dependência é **valor**, tratada
antes de chegar ao handler (`infra/saude.ts` não lança). Um 500 aqui é bug interno, e permanece
falha barulhenta, sem dado de requisição no corpo.

## Tempo de resposta

| Aspecto | Antes | Depois |
|---|---|---|
| I/O na rota | nenhum | uma consulta de saúde, uma tentativa só |
| Tempo típico | ~0,3 s medidos de fora | ~0,3 s a ~0,6 s com a instância quente |
| Teto da verificação | n/a | **3 000 ms**, configurável por `APS_TIMEOUT_SAUDE_MS`; excedido, `banco.causa` vale `tempo_esgotado` |
| Retentativa | n/a | **nenhuma** (RN-06): repetir mascararia a intermitência que o healthcheck existe para revelar |

## Denylist de privacidade (RN-02, invariável)

Herdada da 002 e **estendida ao estado degradado**, que é onde o vazamento seria mais provável. A
resposta serializada jamais contém, em nenhum estado do banco: segredo, token, chave, header de
autorização, variável de ambiente (exceto o SHA público do commit), host ou URL de conexão, trecho
de SQL, duração de consulta, nem dado clínico ou pessoal (padrões: paciente, prontuário, glicemia,
CPF, CNS, nascimento).

🟢 A regra de ouro, e ela é operacional: **o que `infra/database.ts` mascara no log, o corpo público
não pode revelar.** O log emite host mascarado e nome do erro; o corpo emite menos que isso, apenas
a causa.

## Propriedades

- **Idempotência:** total — leitura pura, sem efeito colateral de negócio. O único efeito
  observável fora do processo é despertar a instância suspensa do banco, aceito em `MD-0032`.
- **Cache:** proibido (`no-store`). Nem no cliente, nem no servidor: cachear o resultado da
  verificação foi descartado em `MD-0032` por pôr estado e não-determinismo na única rota de
  observabilidade do sistema.
- **Timeout:** o da plataforma para a rota; o da verificação, 3 000 ms por `APS_TIMEOUT_SAUDE_MS`.
- **Versionamento:** dentro de `/api/v1`, apenas mudanças aditivas de campos. Remover `banco`,
  renomear `publicado_em` ou passar a responder 503 seriam mudanças incompatíveis, e exigiriam
  `/api/v2`.

## Consumidores conhecidos

1. Mantenedor via `npm run status:conferir`, que passa a exibir a idade do deploy e o estado do
   banco, e ganha `--exigir-saudavel` para quem quiser degradação refletida no código de saída.
2. Mantenedor via `curl` ou navegador.
3. Suíte de contrato (`npm run test:api`), local e no CI, contra o build de produção, nos dois
   estados do banco.
4. Futuro, e é o **gatilho registrado em `MD-0032`**: monitor externo que consulte em laço. Surgindo
   um, a verificação de dependência migra para rota própria, e `banco` passa a ser projeção dela,
   sem que os campos de hoje mudem.

## Verificação

Cada linha deste contrato é asserção em `tests/contract/api/v1/status.test.ts`, executado contra um
servidor de pé — dois, no CI: um com o banco acessível, outro com a conexão inalcançável. Contrato
que não é verificado é intenção, e a intenção era o defeito de origem desta feature.
