# Reconciliação da spec — feature 018-revisao-linguagem-textos

> Ação **T051**, exigida por **RF-09** e pelo **Princípio I**: alterar texto no código sem
> reconciliar a spec faz a extração mentir. Esta lista fecha o circuito na direção
> código → spec, para absorção por `/reversa-sync` e, adiante, pela re-extração `/reversa`
> nº 4.
>
> Método: varredura dos artefatos de `_reversa_sdd/`, `.harness/decisoes/` e
> `_reversa_forward/` pelos literais que a revisão alterou. Não é leitura de memória — é
> `grep` sobre as formas antigas, e é por isso que a lista inclui itens que a redação de
> RF-09 não previa.

## 1. Obrigatórios por RF-09

| Artefato | O que diverge | Gravidade |
|---|---|---|
| `_reversa_sdd/addenda/017-puericultura-crescimento.md` | A linha 96 afirma que os rótulos ficam "como está, inclusive na concordância destoante do comprimento (\"Comprimento adequada para idade\")". A afirmação era verdadeira até 26/07 e deixou de ser: `MD-0015` autorizou a correção dos dois rótulos, e a 018 a executou | **alta** — é o artefato que descreve o domínio para quem chega sem contexto |
| `.harness/decisoes/MD-0012.md` | Transcreve os rótulos ao distinguir o rótulo clínico do domínio do título neutro da tela. A distinção segue de pé; as **formas transcritas** de dois deles mudaram | média |
| `.harness/decisoes/MD-0014.md` | Já em `superado-parcialmente`. A primeira metade — a classe vem da origem, não do diretório — segue regendo RN-01 e RN-02, e agora também o princípio IX. A segunda metade foi revertida por `MD-0015` e **executada** pela 018; a ficha ainda a descreve como reversão prevista, não consumada | média |
| `_reversa_forward/017-puericultura-crescimento/regression-watch.md` | **Já reconciliado nesta feature** (T049): `W022` foi reescrito no lugar, com nota de superação apontando `MD-0015` e `MD-0017`, e passou a vigiar também a permanência da declaração de RF-10 | resolvido |

## 2. Acrescentados pela varredura, e é a razão de ela existir

| Artefato | O que diverge | Gravidade |
|---|---|---|
| `.harness/decisoes/MD-0015.md` | Transcreve os mesmos dois rótulos ao registrar a arbitragem. A ficha **não constava** da lista de RF-09, e a segunda auditoria já o apontara (achado A013). Ela permanece correta no mérito — foi ela que autorizou a correção —, mas o seu estado passa de "adotado, não executado" a **executado** | média |
| `_reversa_sdd/domain.md` §7 e `_reversa_sdd/data-dictionary.md` | Ambos citam `(eixo do Quadro 2)` como localização do campo `sexo` da cardiopatia. O literal saiu da **mensagem de validação** por decisão de L-08 — a referência à fonte é vedada na mensagem, porque a `ReferenciaClinica` já a carrega. Os dois artefatos descrevem o **campo**, e não a mensagem, de modo que a citação segue correta ali; entram na lista para que a re-extração confira em vez de supor | baixa |
| `_reversa_forward/018-revisao-linguagem-textos/interfaces/metadados-html.md` | O contrato transcreve os seis `<title>` e as seis `description` na forma anterior. Todos os doze mudaram: separador único, caixa de frase e a descrição da raiz corrigida | **alta** — é o contrato da superfície que sai do navegador |
| `_reversa_forward/018-revisao-linguagem-textos/interfaces/manifesto-pwa.md` | A `description` mudou (maiúscula da segunda unidade), e o teto declarado **já foi corrigido** nesta feature: dizia 78 caracteres, e a medição encontrou 81 | parcialmente resolvido |
| `_reversa_forward/018-revisao-linguagem-textos/data-delta.md` §3.1 | O esquema do inventário ganhou o campo `especie` durante a execução, que a seção declarava 🟡 "a fixar na execução". Ele existe porque o verificador de norma precisa distinguir bloco de fragmento | baixa |
| `_reversa_sdd/architecture.md` §5 | Já registrado como L-11: declara 37 arquivos de teste e baseline "0/0 por rota". São hoje **59** arquivos e um baseline com duas tolerâncias. A 018 acrescentou sete arquivos de verificação a `tests/unit/textos/` e um de apoio | média, herdada |

## 3. Fora da lista, com a razão declarada

Estes citam formas antigas e **não** precisam de reconciliação:

- **`_reversa_forward/007/…`, `009/…`, `011/…`, `013/…`, `016/…`** — artefatos de features
  encerradas, que descrevem o estado do produto **naquela** entrega. Reescrevê-los apagaria o
  registro histórico, que é o oposto do que a rastreabilidade quer. A re-extração nº 4
  absorve o estado corrente sem tocá-los.
- **`_reversa_forward/017/actions.md` e `017/legacy-impact.md`** — mesma razão. O
  `regression-watch.md` da 017 é a exceção, e foi reconciliado, porque **vigilância** é
  afirmação sobre o presente, e não registro do passado (`MD-0017`).
- **`tests/apoio/citacao-linha-de-base.json`** — guarda as formas impressas de propósito.
  Reconciliá-lo destruiria a única prova de que a exceção continuou estreita (D-14).
- **`models/puericultura/fonte-clinica.ts`, cabeçalho** — já reescrito por T037, e continua
  nomeando as formas impressas, agora para explicar de que a correção se afasta.

## 4. Nota para a re-extração nº 4

Três coisas desta feature não são texto e pedem leitura do agente de descoberta:

1. **Um princípio novo.** `.reversa/principles.md` ganhou o **IX**, primeiro do projeto que
   rege *como o artefato fala* em vez de *como se chega a ele*.
2. **Um componente novo de tempo de desenvolvimento.** `scripts/inventariar-textos.mts` mais
   `scripts/textos/`, terceiro gerador idempotente do projeto, com dois artefatos de dado —
   um que se regera e outro que não pode.
3. **Sete verificadores novos** em `tests/unit/textos/`, todos vistos reprovar antes de
   aceitos (T055). A suíte passou de 52 para 59 arquivos.

E uma dívida herdada continua aberta: **L-10**, as duas violações axe toleradas em
`e2e/axe-baseline.json`, alheias a esta feature e merecedoras de ticket próprio.

## 5. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-27 | Versão inicial, escrita por `/reversa-coding` na ação T051 | reversa |
