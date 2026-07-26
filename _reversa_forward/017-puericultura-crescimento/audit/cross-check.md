# Cross-check: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-26`
> Executor: `/reversa-audit` (skill estritamente leitor)
> Artefatos analisados:
> - `_reversa_forward/017-puericultura-crescimento/requirements.md`
> - `_reversa_forward/017-puericultura-crescimento/roadmap.md`
> - `_reversa_forward/017-puericultura-crescimento/actions.md`
> Artefatos consultados como apoio (não auditados em si): `investigation.md`, `data-delta.md`,
> `onboarding.md`, `interfaces/tabelas-de-referencia.md`, `_reversa_sdd/` (re-extração nº 3),
> `.harness/decisoes/MD-0001..MD-0004`, e o código do repositório.

**Nenhum dos artefatos analisados foi alterado por esta auditoria.**

## 1. Resumo

| Severidade | Quantidade |
|---|---|
| CRITICAL | 0 |
| HIGH | 5 |
| MEDIUM | 6 |
| LOW | 5 |
| **Total** | **16** |

O plano é coerente na sua espinha dorsal: os vinte e um requisitos funcionais têm decisão
correspondente no roadmap, as treze decisões técnicas têm ação executável, e os dezoito cenários
Gherkin estão cobertos por alguma ação nomeada. Os achados concentram-se em três lugares: a
lacuna já registrada em `MD-0004` (confirmada aqui com severidade e com evidência do
repositório), as fronteiras etárias que não receberam o mesmo tratamento explícito que as duas
fronteiras dos cinco anos, e a diferença entre o raio de impacto que o roadmap declara e o que a
decomposição de fato prevê tocar.

## 2. Findings

| ID | Severidade | Eixo | Descrição | Onde está |
|----|-----------|------|-----------|-----------|
| A001 | HIGH | Consistência | `roadmap.md` §5 promete `package.json` intocado e gerador "com as ferramentas já presentes"; `onboarding.md` §3 invoca `npx tsx`. O repositório não tem `tsx` nem leitor de planilha, e não existe pasta `scripts/` | `roadmap.md` §5 × `onboarding.md` §3 × `package.json`; ação T002 |
| A002 | HIGH | Cobertura | **RF-06** (índices independentes; medida ausente suprime só o índice dependente) não é citado por nenhuma das 52 ações — é o único RF sem rastro no `actions.md` | `requirements.md` §5 RF-06 × `actions.md` (varredura de `RF-NN`) |
| A003 | HIGH | Sanidade do actions | T010 promete o "oráculo embutido" das colunas `SDn` e depende de T003, cuja saída fica em `referencias/oms/` — pasta ignorada pelo git (`.gitignore:17`). Os módulos gerados (T031) emitem apenas `l`/`m`/`s`, e o arquivo de casos-oráculo (T008) só congela valores de ±DP do INTERGROWTH-21st | `actions.md` T003, T008, T010, T031; `.gitignore` |
| A004 | HIGH | Consistência | `roadmap.md` §5 afirma "as duas alterações em arquivos existentes (catálogo e ícones)", mas o `actions.md` toca seis arquivos existentes; e `requirements.md` §1 afirma "nenhum motor existente é tocado", contradito por T022 | `roadmap.md` §5, `requirements.md` §1 × T005, T006, T022, T046, T050, T051 |
| A005 | HIGH | Cobertura | A fronteira **superior** dos 10 anos não tem decisão no roadmap nem ação/teste no actions, ao contrário das duas fronteiras dos 5 anos (D-05). Com `mês = ⌊dias/30,4375⌋` (D-06), o mês 120 cobre até 3683 dias — além dos 10 anos que RN-08/RF-07 declaram como limite | `requirements.md` RN-08/RF-07 × `roadmap.md` D-05/D-06 × `actions.md` T011, T015, T027 |
| A006 | MEDIUM | Consistência | A fronteira dos **2 anos** aparece em três formulações que não se conciliam numericamente: RN-08 ("PC informado para criança ≥ 2 anos"), RN-09 ("< 2 anos mede-se deitada") e D-04 (recorte em `Day = 730`). Nenhuma ação fixa o limiar em dias nem prevê teste de limite | `requirements.md` RN-08/RN-09 × `roadmap.md` D-04 × `data-delta.md` §3.2 × T011, T015 |
| A007 | MEDIUM | Consistência | O gerador baixa ou lê do disco? `onboarding.md` §3 ("baixa, verifica e reescreve") e o contrato §6/§7 (sha256 das origens, "qual URL falhou") pressupõem download; T003 baixa à mão e T029–T032 não preveem etapa de download | `onboarding.md` §3, `interfaces/tabelas-de-referencia.md` §6–§7 × T003, T029–T032 |
| A008 | MEDIUM | Consistência | T033 manda "conferir os valores-âncora do `onboarding.md`", mas os valores-âncora estão em `interfaces/tabelas-de-referencia.md` §5 (V7); o `onboarding.md` traz escores z esperados, verificáveis só depois de T034–T039 — dependência implícita não declarada | `actions.md` T033 × `onboarding.md` §4 × `interfaces/tabelas-de-referencia.md` §5 |
| A009 | MEDIUM | Sanidade do actions | T002 manda "reconciliar `roadmap.md` §5 e `onboarding.md` §3" durante a execução: uma ação de execução alterando artefatos de plano, o que mistura os papéis de `/reversa-plan` e `/reversa-coding` | `actions.md` T002 |
| A010 | MEDIUM | Consistência | Colisão de numeração: as fichas da feature 017 são `MD-0001`..`MD-0004` em `.harness/decisoes/`, ao passo que `domain.md` e o contrato citam `MD-0003`, `MD-0008`, `MD-0009` e `MD-0011` da série pré-refundação. Os documentos citam "MD-000X" sem qualificar a série | `requirements.md` §2/§4, `roadmap.md` §2/§3, `interfaces/tabelas-de-referencia.md` §8 × `.harness/decisoes/` |
| A011 | MEDIUM | Cobertura | T018 promete "um caso nomeado por cenário Gherkin de `requirements.md#7`" e enumera nove dos dezoito; os outros nove vivem em T009–T016, T047 e T048, sem mapa declarado — ao passo que o critério de pronto do roadmap exige o mapeamento completo | `actions.md` T018 × `requirements.md` §7 × `roadmap.md` §10 |
| A012 | LOW | Cobertura | **D-03** (LMS embarcado a partir das tabelas expandidas oficiais) não é citado por nenhuma ação; a cadeia T029–T033 o realiza implicitamente | `roadmap.md` D-03 × `actions.md` |
| A013 | LOW | Sanidade do actions | T001 e T003, ambas `[//]`, escrevem sob a mesma árvore `referencias/` (T003 em subpasta). Não há conflito real de arquivo, mas o alvo declarado se sobrepõe | `actions.md` T001, T003 |
| A014 | LOW | Sanidade do actions | T049 declara como arquivo alvo o próprio `actions.md` (seção "Notas de execução"), área que o template reserva ao registro do `/reversa-coding` | `actions.md` T049 |
| A015 | LOW | Sanidade do actions | T046 (folha de estilo) não é dependência de T044/T045: pela ordem declarada, a rota pode entrar antes do estilo existir | `actions.md` T044, T045, T046 |
| A016 | LOW | Coerência com o legado | `_reversa_sdd/domain.md` §7.2 regra 11 (🟢) ainda descreve o comando de início derivado de `logoComoTitulo`, prop removida pelo adendo 016. O plano está correto (T044 usa `comInicio`); é o artefato do legado que está atrasado | `domain.md` §7.2 × `addenda/016` × T044 |

## 3. Findings HIGH em detalhe

### A001 — a lacuna de `MD-0004`, confirmada com evidência

A divergência é real e verificável no repositório, não apenas textual. O `package.json` fixa
dependências de desenvolvimento sem `tsx` e sem qualquer leitor de `.xlsx`; a pasta `scripts/`
não existe. Como `.xlsx` é contêiner comprimido, o gerador de T029 precisa de uma das duas
coisas que `MD-0004` põe em disputa. Note-se, ainda, um agravante que a ficha não explicita: o
`npx tsx` do `onboarding.md` §3 resolve o pacote pela rede no momento da execução, fora do
`package-lock.json`, o que contraria a reprodutibilidade temporal que o próprio roadmap invoca
como justificativa de D-03 e do contrato §6. O impacto é de caminho crítico: T029 a T034 e,
por herança, T039 em diante dependem do fechamento.

Direção sugerida ao humano: fechar a escolha na ficha `MD-0004` e, conforme o resultado,
reabrir o plano por `/reversa-plan` (se entrar dependência, `roadmap.md` §5 deixa de valer como
está) ou por `/reversa-clarify`, se a decisão for de produto. Este skill não altera nenhum dos
dois artefatos.

### A002 — RF-06 sem ação que o cite

O `requirements.md` classifica RF-06 como **Must** e o roadmap o mantém no bloco Must de §8. Na
decomposição, porém, nenhuma das 52 ações o menciona: a varredura de identificadores `RF-NN` no
`actions.md` devolve vinte dos vinte e um. O comportamento existe de fato — a variante `ausente`
está prevista em T020 e o cenário "medida ausente não invalida as demais" aparece em T018 —, mas
a cadeia de derivação do Princípio VI se rompe, e a convenção declarada no cabeçalho do próprio
`actions.md` ("toda ação de código cita no cabeçalho do arquivo o `RF-NN` que a origina") deixa
esse requisito sem arquivo responsável. Na prática, um `/reversa-coding` que trabalhe ação a ação
pode implementar a independência dos índices sem teste dedicado.

Direção sugerida: reabrir o `actions.md` por `/reversa-to-do`, acrescentando a citação de RF-06
a T018 e a T020 (ou a ação própria de teste, se o mantenedor quiser um caso nomeado).

### A003 — o oráculo da OMS não tem onde viver

T010 promete que "medida igual a `SDn` devolve `z = n`" e declara dependência de T003. Ora, T003
deposita os `.xlsx` em `referencias/oms/`, e `referencias/` está no `.gitignore` (linha 17), por
decisão registrada em `MD-0008`. Ao mesmo tempo, T031 emite os módulos só com `l`, `m` e `s` — as
colunas `SD1neg`…`SD4`, que são o oráculo, são consumidas pelo gerador na verificação V6 e
descartadas na emissão. E T008, que congela casos-oráculo em arquivo versionado, refere apenas
"valores em ±1/±2/±3 DP das tabelas do INTERGROWTH-21st". O resultado é um teste unitário que só
passa na máquina onde o download foi feito: em clone limpo, em CI ou no "eu de daqui a doze
meses", ele falha por arquivo ausente — exatamente o modo de falha que a estratégia de congelar
os oráculos (investigation §6) existia para evitar.

Direção sugerida: por `/reversa-to-do`, estender T008 para congelar também os pares
`(medida em SDn, n)` da OMS, e trocar a dependência de T010 de T003 para T008. Alternativa
equivalente: emitir as colunas `SDn` em módulo separado no gerador, ao custo de volume.

### A004 — o raio de impacto declarado é menor que o previsto

O `roadmap.md` §5 afirma que a feature altera dois arquivos existentes, catálogo e ícones. A
decomposição prevê seis: `interface/inicio/catalogo.ts` (T005), `interface/inicio/icones.tsx`
(T006), `models/gestacao/datas.ts` (T022), o shell que importa a folha de estilo — hoje
`pages/_app.tsx`, verificado (T046) —, `vitest.config.ts` (T050, condicional) e `README.md`
(T051). Dois desses casos merecem nota. O primeiro é T022: `requirements.md` §1 promete "nenhum
motor existente é tocado" e §4 abre com "nenhuma regra dos quatro domínios existentes é alterada";
a edição é de comentário e não muda comportamento, mas a decisão D-07 descartou a alternativa (b)
justamente porque "tocaria motor existente, contra a spec", e a decomposição toca o mesmo arquivo
por outra via. O segundo é a folha de estilo: `interface/estilos/` não aparece em §5 como
componente alterado, embora o shell precise ganhar um `import` novo — e §5 lista `e2e/axe-baseline.json`
com a ressalva "só se necessário", mostrando que o critério de listagem era outro.

O impacto prático é de subdimensionamento do delta na hora de gerar `legacy-impact.md` e
`regression-watch.md`: o que não está no §5 tende a não entrar na vigilância de regressão.

Direção sugerida: reabrir por `/reversa-plan` para completar o §5, ou registrar as quatro
alterações adicionais como adendo ao plano antes do `/reversa-coding`.

### A005 — a fronteira superior dos dez anos ficou sem dono

O plano tratou com rigor exemplar as duas fronteiras dos cinco anos: D-05 as separa, o risco
correspondente aparece em §9, e T011 fixa os quatro pontos de teste (1825, 1826, 1855, 1856). A
fronteira superior, que fecha a cobertura da fonte, não recebeu o mesmo tratamento. RN-08 e RF-07
dizem "idade fora de 0–10 anos", sem tradução em dias; D-06 estabelece `mês = ⌊dias / 30,4375⌋`,
e a tabela de 5 a 10 anos vai até o mês 120 — que, por essa conta, cobre até 3683 dias, cerca de
um mês além dos dez anos. Falta decidir se o corte é 3652 dias, o mês 120 ou o mês 121, e
nenhuma ação testa esse limite: T015 exercita `IDADE_FORA_DA_COBERTURA` sem valor declarado, e
T011 só cobre os limites do meio. Os dois modos de falha são simétricos e ambos indesejáveis:
recusar uma criança que a caderneta cobre, ou classificar uma criança de dez anos e três semanas
como se a fonte a cobrisse.

Direção sugerida: `/reversa-clarify` se a leitura for de produto (o que a caderneta considera
"dez anos"), ou `/reversa-plan` para uma decisão irmã de D-05, com o ponto de teste
correspondente em T011.

## 4. Verificações que passaram

### Cobertura

- Vinte dos vinte e um RF do `requirements.md` são citados por pelo menos uma ação (exceção em A002).
- As treze decisões técnicas do roadmap têm ação executável; doze são citadas por ID (exceção em A012).
- Os dezoito cenários Gherkin de `requirements.md` §7 estão cobertos: T018 (fachada), T009–T016
  (unidade), T047 (integração) e T048 (e2e). Nenhum cenário ficou órfão.
- Os itens `Won't` de §8 (plotagem de curva, histórico/tendência, conduta) não têm ação
  correspondente — como deve ser.
- Os requisitos não funcionais têm ação: privacidade (T043, `RelatorDeErros` nulo), desempenho
  (T049), manutenibilidade (T052), acessibilidade (T048), rastreabilidade (convenção do cabeçalho
  do `actions.md`), testabilidade (T007, injeção por construtor).

### Consistência

- O vocabulário é estável nos três documentos: "escore z", "índice antropométrico", "idade
  corrigida", "idade pós-menstrual", "padrão", "fora do escopo da fonte", "coleta total de
  ofensores", "recusa honesta". Não há sinônimo concorrente para nenhum deles.
- Os identificadores citados existem: `ADR 0002, 0003, 0004, 0005, 0007, 0011, 0012, 0013`
  (todos em `_reversa_sdd/adrs/`), `domain.md` §7 e §8, `code-analysis.md` Módulos 2, 4, 9 e 10,
  `architecture.md` §6 dívida 5 (premissas clínicas 🟡 — o precedente invocado é exatamente esse),
  `addenda/016` e `.reversa/principles.md`.
- O contrato de `interfaces/tabelas-de-referencia.md` aparece no roadmap (§7) e tem ações que o
  realizam ponto a ponto: V1–V7 em T030, transformação §4 em T031, idempotência §6 em T032.
- As contagens fecham: 14 arquivos `.xlsx` no contrato §2, 14 módulos no `data-delta.md` §3.2,
  14 recortes em T032 e T033.
- Os números de fronteira são os mesmos nos três documentos: 27 e 64 semanas pós-menstruais,
  1826 e 1856 dias, 2 e 3 anos de idade corrigida, ±0,7 cm, `|z| > 3`.

### Coerência com o legado

- Os sete invariantes de `domain.md` §7 têm realização declarada: pureza (T017, RF-01),
  erro como valor (T020, união discriminada), `ReferenciaClinica` em toda saída (T017, T039),
  coleta total (T026), constantes congeladas (T023 e os módulos gerados com `Object.freeze`),
  o motor informa e não escolhe (RN-12, sem ação de conduta), privacidade (nenhuma ação
  introduz `fetch` ou `storage`).
- A regra 10 de §7.1 (ritual de revisão só na insulina) é respeitada por T043 e pelo teste
  negativo de T047.
- A fronteira de escopo de `domain.md` §8 (MD-0009) é aplicada em três motivos discriminados
  (T015, T027), com a novidade do motivo **parcial** declarada como tal.
- Todos os componentes do legado citados existem e estão onde o plano diz:
  `interface/inicio/catalogo.ts` (três seções hoje — a nova é de fato a quarta),
  `interface/inicio/icones.tsx`, `models/gestacao/datas.ts` com `paraDiasEpoch`,
  `models/risco-cardiovascular/{validacao,elegibilidade}.ts`,
  `interface/risco-cardiovascular/proveniencia.tsx` com `NOTA_PROVENIENCIA` congelada no domínio,
  `pages/cardiologia/risco-cardiovascular.tsx`, `interface/estilos/risco-cardiovascular.css`,
  `tests/apoio/construtores.ts`, `e2e/axe-baseline.json`.
- `SmileyIcon` existe na versão pinada de `@primer/octicons-react` (19.29.2), como D-12 afirma.
- `ErroDeCampo` vive em `interface/calculadora/erro-de-campo.tsx` e já é importado pelas telas de
  gestação, cardiologia e risco cardiovascular: o uso previsto em T040 segue precedente aceito.
- O limiar de cobertura de `models/**` do roadmap §10 (≥ 90%) é o que `vitest.config.ts` já
  aplica, com `include: ["models/**"]` — T050 é coerente com a configuração existente.
- A convenção de nomes das suítes (`tests/unit/dominio-<dominio>/`, `tests/integration/interface/`,
  `e2e/<nome>.spec.ts`) é a do repositório.

### Sanidade do actions

- Os 52 IDs são sequenciais e sem buraco (T001 a T052); toda dependência aponta para um ID
  existente e menor, de modo que **não há ciclo** — o grafo é um DAG por construção.
- A maior cadeia declarada no resumo (12 elos, T002 → … → T049) confere com o grafo.
- As 27 ações `[//]` tocam arquivos alvo distintos entre si (a única sobreposição é a de A013,
  que é de pasta, não de arquivo).
- As fases estão ordenadas de modo coerente: preparação sem dependência, testes antes ou junto do
  núcleo, integração depois da fachada, polimento por último.

## 5. Nota de método

Este relatório é o único arquivo que a auditoria escreveu. `requirements.md`, `roadmap.md`,
`actions.md`, `data-delta.md`, `investigation.md`, `onboarding.md` e `interfaces/` permanecem
byte a byte como estavam. Os IDs `A001`…`A016` valem dentro deste documento e não se
comunicam com os identificadores dos demais artefatos.
