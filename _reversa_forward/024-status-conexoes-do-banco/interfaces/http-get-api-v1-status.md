# Contrato HTTP — `GET /api/v1/status` (revisão da feature 024)

> Feature: `024-status-conexoes-do-banco`
> Data: 2026-08-10
> Realiza: RF-01, RF-02, RF-03, RF-04, RF-06, RF-07, RF-08 (RN-02, RN-04 a RN-09)
> Estende `_reversa_forward/022-status-healthcheck-e-deploy/interfaces/http-get-api-v1-status.md`, que permanece vigente naquilo que este documento não altera.
> Decisões: D-01 a D-11 do `roadmap.md` desta feature.

## Propósito

O mesmo da 022, com um acréscimo de grau, não de natureza: além de dizer **se** a dependência
respondeu, a resposta passa a dizer **quanto dela resta**. Endpoint público, sem autenticação, sem
estado, sem dado clínico (ADR 0008).

## Natureza da mudança

🟢 **Aditiva, dentro de `/api/v1`.** Os seis campos da raiz permanecem com o mesmo nome, o mesmo
tipo e a mesma semântica; o ramo `degradado` de `banco` permanece idêntico byte a byte. O que cresce
é o ramo `integro`, de uma chave para quatro. Nenhum reaninhamento, nenhuma remoção, nenhuma troca de
significado. `/api/v2` não é necessário e não se abre.

🟢 **O que foi deliberadamente não reproduzido**, embora conste do endpoint que serviu de referência:

| Não reproduzido | Razão registrada |
|---|---|
| Aninhamento sob `dependencies` e nomes em inglês | Reaninhar e renomear é incompatível pela regra do próprio contrato; decidido em 2026-08-10 |
| Bloco `latency`, com três medições | A denylist proíbe duração de consulta, e três medições contrariam a apuração numa ida só |
| Bloco `webserver` (`provider`, `aws_region`, `vercel_region`, autor e mensagem do commit) | `ambiente`, `versao`, `commit` e `publicado_em` já cobrem o terreno em vocabulário próprio; autoria de commit é dado pessoal |

## Request

Inalterado em relação à 022. `GET`, sem parâmetros, sem autenticação, sem headers exigidos. Não
existe parâmetro que ligue ou desligue a apuração das conexões: ela é parte da verificação, e não um
modo dela.

## Response

### `200 OK` — em todo estado do banco

Headers obrigatórios, todos inalterados: `Content-Type: application/json; charset=utf-8`,
`Cache-Control: no-store`, e `Set-Cookie` ausente, invariável.

#### Corpo — banco íntegro

```json
{
  "atualizado_em": "2026-08-10T23:45:00.000Z",
  "versao": "0.1.0",
  "commit": "5db2cb42eb77cc402b40028851c6dc012f48b9d9",
  "publicado_em": "2026-08-10T23:12:31.004Z",
  "ambiente": "producao",
  "banco": {
    "estado": "integro",
    "teto_de_conexoes": 100,
    "conexoes_abertas": 3,
    "versao": "17.10"
  }
}
```

#### Corpo — banco degradado

```json
{
  "atualizado_em": "2026-08-10T23:46:02.117Z",
  "versao": "0.1.0",
  "commit": "5db2cb42eb77cc402b40028851c6dc012f48b9d9",
  "publicado_em": "2026-08-10T23:12:31.004Z",
  "ambiente": "producao",
  "banco": { "estado": "degradado", "causa": "conexao" }
}
```

#### Campos novos

| Campo | Tipo | Presença | Semântica |
|---|---|---|---|
| `banco.teto_de_conexoes` | inteiro positivo | **só** quando `integro` | `max_connections` do servidor alcançado |
| `banco.conexoes_abertas` | inteiro ≥ 1 | **só** quando `integro` | Conexões abertas contra o banco corrente no instante da consulta |
| `banco.versao` | string | **só** quando `integro` | Versão do servidor, só o prefixo numérico, no molde `"17.10"` |

Os seis campos da raiz e o `banco.causa` do ramo degradado seguem exatamente como a 022 os
descreve.

## As três ressalvas que este contrato assume, e que quem lê o corpo precisa saber

🟢 **1. Os dois números descrevem escopos diferentes.** `teto_de_conexoes` é do **servidor**;
`conexoes_abertas` é do **banco corrente**. A instância pode hospedar outros bancos, cujas conexões
entram no teto e não na contagem. A razão entre os dois é indicativa, e não uma taxa exata de
ocupação.

🟢 **2. A rota se conta.** A própria requisição mantém uma conexão aberta enquanto apura, de modo
que `conexoes_abertas` jamais vale zero. Um vale um significa banco ocioso, e não banco vazio.

🟡 **3. O teto é o do servidor que a aplicação alcança.** Havendo agrupador de conexões no caminho,
o valor publicado é o da camada que respondeu. O primeiro deploy resolve a dúvida pelo próprio
campo, e a confidência sobe a 🟢 quando o valor for observado.

## Denylist de privacidade (RN-02, invariável)

Herdada da 022 **sem revogação de item algum**, e estendida em alcance aos campos novos. Em
particular:

- A versão sai **só como número**. A cadeia completa que o servidor devolve nomeia o produto, a
  arquitetura e o compilador, e cairia no padrão `/postgres/i` da suíte.
- Nenhum número de conexão vem acompanhado de host, usuário, nome de banco, endereço, trecho de SQL
  ou duração de consulta.

🟢 A regra de ouro segue operacional e inalterada: **o que `infra/database.ts` mascara no log, o
corpo público não pode revelar.**

## Propriedades

- **Idempotência:** total, leitura pura. O único efeito observável fora do processo continua sendo
  despertar a instância suspensa.
- **Cache:** proibido (`no-store`).
- **Tempo:** o teto da verificação permanece em 3 000 ms por `APS_TIMEOUT_SAUDE_MS`, e a apuração
  não acrescenta ida ao banco. Medido em ambiente local: 1 ms a 4 ms para a linha inteira.
- **Retentativa:** nenhuma, como na 022.
- **Versionamento:** dentro de `/api/v1`, apenas acréscimo. Remover qualquer dos três campos novos,
  renomeá-los ou movê-los para a raiz passariam a ser mudanças incompatíveis a partir desta entrega.

## Consumidores conhecidos

1. `scripts/conferir-producao.mts`, que passa a exibir a ocupação e continua a ler todo campo
   posterior à 002 como **opcional**, de modo a funcionar contra deploys antigos.
2. Mantenedor via `curl` ou navegador.
3. Suíte de contrato, local e na integração contínua, contra os dois alvos.
4. Futuro monitor externo, com o gatilho de `MD-0032` inalterado: surgindo um, a verificação migra
   para rota própria e este bloco vira projeção dela.

## Verificação

Cada linha deste contrato é asserção em `tests/contract/api/v1/status.test.ts`, nos dois alvos. Três
asserções nascem aqui e merecem nome: a ausência dos três campos no alvo degradado, o piso de um em
`conexoes_abertas`, e a versão sem o nome do produto. Contrato que não é verificado é intenção, e a
intenção era o defeito de origem da feature 022.
