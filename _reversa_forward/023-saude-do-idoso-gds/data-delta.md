# Data delta — 023-saude-do-idoso-gds

> Data: `2026-07-30`
> Diff conceitual sobre o modelo extraído em `_reversa_sdd/erd-complete.md` e
> `_reversa_sdd/data-dictionary.md`.

## 1. O que não muda

**Nenhuma persistência, nenhuma migração, nenhum esquema.** A plataforma continua sem DDL,
sem ORM e sem tabela de negócio (`_reversa_sdd/architecture.md#3-dados`); o PostgreSQL do
healthcheck segue com a sua única consulta `SELECT $1::int AS ok`, e nenhum arquivo de
`infra/**` é aberto. O único durável do sistema continua sendo a preferência de tema.

As respostas do paciente **existem apenas no estado do componente** e morrem com a aba: não
há `localStorage`, `sessionStorage`, cookie, `fetch` nem query string. É a aplicação direta
da ADR 0002, e nesta feature ela pesa mais do que nas anteriores, porque o dado é
sintomatologia psíquica de pessoa identificável na consulta.

## 2. Entidades novas, todas em memória

### 2.1 `ItemDaEscala` — dado congelado, quinze instâncias

| Campo | Tipo | Origem | Observação |
|---|---|---|---|
| `id` | `string` | produto | Identificador estável, classe **identificador**; nunca exibido |
| `numero` | `number` | fonte | 1 a 15, na ordem impressa |
| `texto` | `string` | fonte | Enunciado transcrito byte a byte, classe **citação** |
| `respostaQuePontua` | `"sim" \| "nao"` | fonte | Lida da marcação de célula da tabela da fonte (`MD-0038`) |

Congelado por `Object.freeze` profundo, no molde de `REFERENCIAS`. Dez itens com `"sim"`,
cinco com `"nao"` (os de número 1, 5, 7, 11 e 13).

### 2.2 `RespostasDaEscala` — entrada do motor

Mapa de `id` do item para `"sim" | "nao"`. **A ausência de chave é a ausência de resposta**,
e é o que a validação coleta (D-03 do roadmap). Não há terceiro valor explícito, e não há
ordem significativa.

### 2.3 `ResultadoDaEscala` — saída de sucesso

| Campo | Tipo | Observação |
|---|---|---|
| `tipo` | `"resultado"` | Discriminante da union, no molde dos cinco units |
| `escore` | `number` | Inteiro de 0 a 15 |
| `faixa` | `FaixaDeResultado` | Rótulo literal da fonte mais os limites que o produziram |
| `providencia` | `Providencia` | Citação da fonte, com referência; presente em toda faixa |
| `advertencias` | `readonly Advertencia[]` | Contém a advertência de rastreamento, que não é diagnóstico |
| `referencias` | `readonly ReferenciaClinica[]` | Nunca vazia; invariante verificado por propriedade |

### 2.4 `FaixaDeResultado` — dado congelado, três instâncias

| Campo | Tipo | Valor |
|---|---|---|
| `de` / `ate` | `number` | `0`–`5`, `6`–`10`, `11`–`15`, inclusivos nas duas pontas |
| `rotulo` | `string` | Redação literal da fonte, classe **citação** |

Cobrem 0–15 sem buraco nem sobreposição, propriedade afirmada por varredura exaustiva dos
dezesseis escores possíveis.

### 2.5 `Ofensor` — mesma forma dos demais units

`{ campo, codigo, mensagem }`, com o código novo `ITEM_NAO_RESPONDIDO`, um por item
faltante, coletados todos de uma vez.

### 2.6 `EntradaInvalida` e `ErroDeInvariante`

Idênticos em forma aos dos units existentes. **Não há `ForaDoEscopoDaFonte` neste unit**, e
a ausência é deliberada: a fonte não publica faixa etária, de modo que não existe recusa a
modelar (RN-07). É a primeira unit clínica sem essa variante, e o fato merece nota na
próxima re-extração, porque contraria a leitura de que todo domínio clínico tem recusa.

## 3. Artefatos de dado em disco

| Artefato | Versionado | Regerável | Papel |
|---|---|---|---|
| `referencias/saude-do-idoso/escala-de-depressao-geriatrica-linhas-de-cuidado-ms-20260730.html` | **não** (`.gitignore` cobre `referencias/`) | não | Cópia datada da fonte; âncora de conferência, `sha256` `bb74f9bc…` |
| `tests/apoio/gds-fonte-congelada.json` | **sim** | sim, por `scripts/congelar-fonte-gds.mts` a partir da cópia acima | Oráculo de transcrição: enunciados, chave de pontuação, rótulos com cortes e providência |
| `tests/apoio/inventario-textual.json` | sim | sim, a cada revisão | Cresce com os literais desta feature, cada um com classe declarada |
| `tests/apoio/citacao-linha-de-base.json` | sim | **nunca** (`MD-0018`) | **Intocado por esta feature.** A citação nova passa pela isenção nominal de `MD-0027`, e não por regeneração |

Note-se a assimetria deliberada entre as duas primeiras linhas: a **fonte** fica fora do git,
como todas as outras fontes clínicas (`MD-0008`), e o que entra no repositório é o
**extrato conferível** dela. Quem clonar o repositório sem a cópia da fonte consegue rodar a
suíte inteira; o que não consegue é **regerar** o congelado, e é assim que se comporta a
cadeia da OMS desde a feature 017.

## 4. Impacto no dicionário de dados da extração

Termos a acrescentar na próxima passagem do `/reversa-sync` ou da re-extração:

- **GDS** — Escala de Depressão Geriátrica, instrumento de rastreamento em quinze itens.
- **Item da escala** — enunciado transcrito com a resposta que pontua declarada no dado.
- **Escore** — soma dos itens pontuados, inteiro de 0 a 15.
- **Faixa de resultado** — rótulo literal da fonte para um intervalo fechado de escore.
- **Providência da fonte** — recomendação transcrita, exibida sem limiar do produto.

Sem alteração no ERD: nenhuma entidade nova se relaciona com o banco, e todas são
composição de objetos imutáveis, como as dos seis units existentes.
