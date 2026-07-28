# Delta de dados — Contribuição voluntária via PIX

> Identificador: `019-contribuicao-voluntaria-pix` · Data: 2026-07-28
> Base: `_reversa_sdd/erd-complete.md`, `_reversa_sdd/data-dictionary.md`
> Acompanha: `roadmap.md` §6

## 1. O que não muda, e importa dizer primeiro

**Nenhuma persistência nasce.** O PostgreSQL da feature 003 continua servindo só ao
healthcheck, e `saude()` segue rodando apenas `SELECT 1`. Nenhuma tabela, coluna, índice ou
migração entra nesta feature, e o gatilho de revisão do ADR 0002, que é a introdução de
persistência de dado clínico, permanece intocado.

**Nenhum durável novo no navegador.** O único item de `localStorage` continua sendo a
preferência de tema. Abrir ou fechar o painel não escreve nada, e essa ausência é verificável:
há cenário Gherkin exigindo que nenhuma chave nova exista no armazenamento após o ciclo de
abrir e fechar.

**Nenhuma entidade clínica é tocada.** Os quatro domínios de `_reversa_sdd/erd-complete.md`
seguem idênticos, e o `data-dictionary.md` não perde nem ganha campo em nenhum deles.

## 2. Estruturas novas, todas em memória

### 2.1 `ParametrosPix` — entrada do módulo puro

| Campo | Tipo | Obrigatório | Restrição | Campo EMV correspondente |
|-------|------|-------------|-----------|--------------------------|
| `chave` | `string` | sim | não vazia; comprimento útil dentro do subtemplate `26` | `26/01` |
| `nomeBeneficiario` | `string` | sim | 1 a 25 caracteres | `59` |
| `cidade` | `string` | sim | 1 a 15 caracteres | `60` |
| `valorSugerido` | `number` | não | maior que zero e finito; formatado com duas casas | `54` |
| `identificacao` | `string` | não | 1 a 25 caracteres; ausente vira `***` | `62/05` |

A estrutura é `readonly` em todos os campos, no molde das entradas dos domínios clínicos.

### 2.2 `SaidaBrCode` — união discriminada por `tipo`

```
{ tipo: "ok"; payload: string }
{ tipo: "ParametroInvalido"; ofensores: readonly OfensorPix[] }
```

O segundo ramo carrega **todos** os ofensores, e não o primeiro encontrado, pela regra 15 de
`_reversa_sdd/domain.md`, que a feature reaproveita sem alterá-la. Cada `OfensorPix` nomeia o
campo, o motivo e, quando o motivo é comprimento, o limite e o valor observado, para que a
mensagem diga o que fazer em vez de dizer apenas que algo está errado.

Não há ramo de exceção: a fachada nunca lança. Exceção continua reservada a violação de
invariante, na disciplina do ADR 0004.

### 2.3 `BENEFICIARIO` — constante congelada de configuração

Vive em `interface/contribuicao/beneficiario.ts`, na camada de apresentação e não no domínio,
porque é dado de instalação e não regra: o módulo puro recebe os valores por parâmetro e não
sabe que a constante existe. Congelada por `Object.freeze`, tipada, e com comentário dizendo o
que muda ao editá-la, no molde do `CATALOGO`.

Enquanto os valores reais não chegam (premissa de `roadmap.md` §4), o arquivo contém valores de
exemplo **declarados como tais** no próprio comentário, e o critério de pronto reprova a entrega
que os deixar passar.

## 3. Dados sensíveis, e a natureza do que entra no repositório

A chave PIX aleatória, o nome civil e a cidade do mantenedor passam a existir no repositório e,
por consequência, no bundle publicado. Três observações que fecham o assunto:

1. **Não é vazamento, é publicação deliberada.** Os três dados existem para serem exibidos; uma
   chave de recebimento que ninguém pode ver não recebe nada.
2. **A chave aleatória é a espécie que menos revela.** Não expõe CPF, telefone nem endereço
   eletrônico, e pode ser trocada no aplicativo do banco sem que nada da vida civil mude junto.
   Se um dia for preciso descontinuá-la, o custo é uma linha neste arquivo.
3. **`NEXT_PUBLIC_*` não mudaria nada disso.** Num produto client-side a variável termina no
   mesmo bundle; o que ela faria é tirar o dado do histórico do git, ao custo de três ambientes
   a manter em dia. Decidido em contrário na sessão de esclarecimento, e registrado em RN-09.

Nada disso é dado de paciente, e por isso o ADR 0002 não é reaberto: a invariante que ele guarda
é a ausência de dado clínico, e o dado do mantenedor não é dado de terceiro.

## 4. Artefatos de dado gerados, e o que acontece com eles

| Artefato | Efeito desta feature |
|----------|----------------------|
| `tests/apoio/inventario-textual.json` | **Regerado.** Cresce com os literais do painel e das mensagens de validação, cada um com classe declarada. É a operação normal de toda feature que cria texto |
| `tests/apoio/citacao-linha-de-base.json` | **Intocado.** A feature não cria nem move citação de fonte clínica. Alteração aqui é defeito, e o critério de pronto confere por `git status` em vez de presumir |
| `e2e/axe-baseline.json` | **Intocado.** Violação nova reprova a entrega em vez de ser absorvida na baseline |

## 5. Migração

Não se aplica. Não há dado a migrar, versão de esquema a subir nem retrocompatibilidade a
preservar: tudo que a feature cria nasce em memória a cada visita, e a única coisa durável que
ela acrescenta ao repositório é um arquivo de configuração de três campos.
