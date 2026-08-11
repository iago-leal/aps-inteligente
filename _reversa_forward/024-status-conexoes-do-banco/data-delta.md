# Delta de dados — 024, conexões do banco no status

> Data: `2026-08-10`
> Feature: `024-status-conexoes-do-banco`
> Base: `_reversa_sdd/data-dictionary.md` e `_reversa_sdd/erd-complete.md`

## 1. O que não muda, e por que isto abre o documento

**Nenhuma tabela, nenhuma coluna, nenhum índice, nenhuma migração.** O banco continua sem esquema de
negócio, como a feature 003 o deixou e como `_reversa_sdd/erd-complete.md` registra. Esta feature
**lê** metadados que o servidor já mantém sobre si mesmo, e nada persiste. Abrir por aqui evita que
alguém procure em `erd-complete.md` um delta que não existe.

O que muda é a forma de dois valores que atravessam a fronteira do código, e um deles é público.

## 2. Delta de tipos

### `saude()` — `infra/database.ts`

| Antes | Depois |
|---|---|
| `Promise<{ ok: true }>` | `Promise<LeituraDeSaude>` |

```ts
// Depois
type LeituraDeSaude = {
  readonly teto_de_conexoes: number;   // inteiro positivo
  readonly conexoes_abertas: number;   // inteiro ≥ 1: a própria consulta se conta
  readonly versao: string;             // só o prefixo numérico, molde "17.10"
};
```

Os nomes seguem em `snake_case` porque este tipo **é a forma de fio**: pela D-08 o handler insere o
valor de `verificarBanco()` inteiro no corpo, sem remapear chave alguma, e o que estiver escrito
aqui é literalmente o que o cliente lê. A convenção `camelCase` do módulo cede ao contrato.

O campo `ok` desaparece do **retorno**, e não da verificação: ele continua a ser exigido na linha
devolvida pelo servidor, e continua a ser o primeiro motivo de `ErroDeBanco("consulta")` quando não
vale `1`. O que se elimina é publicar para o chamador um booleano cujo único valor possível era
`true`, o que nunca informou nada.

### `EstadoDoBanco` — `infra/saude.ts`

| Antes | Depois |
|---|---|
| `{ estado: "integro" }` | `{ estado: "integro" } & LeituraDeSaude` |
| `{ estado: "degradado"; causa: CausaDeErroDeBanco }` | inalterado |

O ramo degradado não muda em nada. É essa assimetria que realiza a RN-02 sem condicional: os três
valores não existem no ramo onde não poderiam ser apurados.

### `CausaDeErroDeBanco`

Inalterada, e isto é decisão, não omissão. A falha de apuração cai em `consulta`, que já significa
"a conexão abriu e a consulta de saúde não devolveu o resultado esperado". Uma quinta causa
`estatistica` diria ao leitor do healthcheck algo que ele não pode acionar, e ainda quebraria o
vocabulário fechado do contrato público.

## 3. Delta do corpo público

### Antes, banco íntegro

```json
"banco": { "estado": "integro" }
```

### Depois, banco íntegro

```json
"banco": {
  "estado": "integro",
  "teto_de_conexoes": 100,
  "conexoes_abertas": 1,
  "versao": "17.10"
}
```

### Depois, banco degradado

```json
"banco": { "estado": "degradado", "causa": "conexao" }
```

Idêntico ao de hoje, byte a byte.

## 4. Dicionário dos campos novos

| Campo | Tipo | Presença | Universo | Semântica |
|---|---|---|---|---|
| `teto_de_conexoes` | inteiro positivo | só no ramo íntegro | **o servidor alcançado** | Valor de `max_connections` da instância que respondeu. Não é o teto da pilha de conexões da aplicação, que vale cinco e vive em `MAXIMO_DE_CONEXOES` |
| `conexoes_abertas` | inteiro ≥ 1 | só no ramo íntegro | **o banco corrente** | Conexões abertas contra o banco desta aplicação no instante da consulta. **Inclui a própria requisição**, de modo que o piso é um |
| `versao` | texto | só no ramo íntegro | o servidor alcançado | Versão do servidor, só o prefixo numérico. A cadeia completa nomearia o produto e a arquitetura, e cairia na denylist |

**A ressalva que o contrato precisa carregar:** teto e contagem descrevem escopos diferentes, porque
a contagem filtra pelo banco corrente e o teto é da instância inteira. Medido no ambiente local, a
diferença foi de seis conexões no cluster contra uma no banco corrente. A razão entre os dois números
é indicativa, jamais uma taxa de ocupação exata.

## 5. Impacto sobre `_reversa_sdd/data-dictionary.md`

| Entrada | Tipo de impacto | Delta |
|---|---|---|
| API, `GET /api/v1/status` | delta-de-contrato-externo | O ramo íntegro de `banco` passa de uma chave para quatro, por acréscimo, dentro de `/api/v1` |
| `ErroDeBanco` | sem impacto | As quatro causas permanecem, com o mesmo significado |
| `EstadoDoBanco` | delta-de-dados | O ramo íntegro deixa de ser objeto de campo único |

Nenhum impacto em `_reversa_sdd/erd-complete.md`. 🟢

## 6. Migração

`n/a`. Não há dado persistido, não há esquema, não há rollback de dados a planejar. O rollback da
feature é o rollback do deploy, e um cliente escrito contra o corpo anterior continua válido nos dois
sentidos, porque os seis campos da raiz não mudam e o ramo degradado é idêntico.
