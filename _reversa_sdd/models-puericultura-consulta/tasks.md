# `models/puericultura/consulta` — Tarefas de Implementação

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `020-consulta-puericultura-soap`.

## Pré-requisitos

- [ ] A unit `models/puericultura` implementada, ao menos nos contratos: `IdadesDerivadas`,
      `ResultadoAvaliacao`, `IndiceCalculado`, `ReferenciaClinica` e a função `referencia`.
- [ ] Exemplar da Caderneta da Criança (MS, 2.ª ed., 2020), pp. 66–75, para a transcrição das
      dez fichas.
- [ ] Congelado de transcrição em `tests/apoio/fichas-caderneta-congeladas.json`, que prova a
      permanência do que foi transcrito.

## Tarefas

- [ ] T-01, Declarar os contratos: as quatro naturezas de campo, a resposta correspondente a
      cada uma, a ficha com faixa em dias, e o registro com seções, notas e referências.
  - Origem no legado: `models/puericultura/consulta/tipos.ts`
  - Critério de pronto: `Preenchimento` é `ReadonlyMap`; `sexos` é opcional no campo, e a
    ausência significa "vale para os dois".
  - Confiança: 🟢

- [ ] T-02, Escrever a fábrica de campos que carimba a página da caderneta em cada um.
  - Origem no legado: `models/puericultura/consulta/fichas/campos.ts`
  - Critério de pronto: nenhuma ficha declara página campo a campo; a página vem da fábrica.
  - Confiança: 🟢

- [ ] T-03, Transcrever as dez fichas das pp. 68–74, cada uma com título, página, faixa em
      dias e seções numeradas.
  - Origem no legado: `models/puericultura/consulta/fichas/*.ts`
  - Critério de pronto: as faixas são contíguas de 0 em diante, sem lacuna nem sobreposição, e
    a última é aberta à direita; a transcrição confere com o congelado.
  - Confiança: 🟢

- [ ] T-04, Declarar a fonte clínica do submódulo: a referência de cobertura, a referência por
      ficha e as quatro notas — organização em SOAP, fichas ausentes, supressão de campo e
      nada é salvo.
  - Origem no legado: `models/puericultura/consulta/fonte-clinica.ts`
  - Critério de pronto: cada nota é constante exportada, verificável por teste de citação.
  - Confiança: 🟢

- [ ] T-05, Implementar a sugestão de ficha pela idade cronológica, com a espécie declarada.
  - Origem no legado: `models/puericultura/consulta/selecao.ts:sugerirFicha`
  - Critério de pronto: prematuro de 60 dias de vida recebe a ficha do 1.º mês; idade sem
    ficha lança `ErroDeInvariante`.
  - Confiança: 🟢

- [ ] T-06, Implementar o filtro de campos por sexo e o rótulo flexionado por par declarado.
  - Origem no legado: `models/puericultura/consulta/selecao.ts`
  - Critério de pronto: campo sem `sexos` aparece para ambos; campo com `["masculino"]` some
    na ficha feminina; nenhuma interpolação de sufixo no rótulo.
  - Confiança: 🟢

- [ ] T-07, Implementar a projeção de cada natureza de resposta em valor de registro.
  - Origem no legado: `models/puericultura/consulta/registro.ts:valorDaResposta`
  - Critério de pronto: medida em branco e texto em branco projetam em nada; escolha com
    complemento usa o travessão como separador.
  - Confiança: 🟢

- [ ] T-08, Implementar a transposição dos índices calculados: objetivos para O, estado
      nutricional para A, com preferência do IMC sobre o peso.
  - Origem no legado: `models/puericultura/consulta/registro.ts:itensDaCalculadora`
  - Critério de pronto: nenhum escore é recalculado; a referência de cada índice é a que veio
    do motor de crescimento.
  - Confiança: 🟢

- [ ] T-09, Implementar o agrupamento nas quatro seções com descarte da seção vazia.
  - Origem no legado: `models/puericultura/consulta/registro.ts:agrupar`
  - Critério de pronto: seção sem item não aparece, nem com cabeçalho.
  - Confiança: 🟢

- [ ] T-10, Implementar as notas e as referências da montagem, sem repetir localização.
  - Origem no legado: `models/puericultura/consulta/registro.ts:notasDe`, `referenciasDe`
  - Critério de pronto: a nota de supressão aparece só quando houve supressão; duas
    referências com a mesma localização entram uma vez.
  - Confiança: 🟢

- [ ] T-11, Implementar a descrição da idade em prosa.
  - Origem no legado: `models/puericultura/consulta/registro.ts:descreverIdade`
  - Critério de pronto: 1 dia, 18 dias, 1 mês, 2 meses e 3 dias — singular e plural corretos.
  - Confiança: 🟢

- [ ] T-12, Montar a fachada com as três operações e o catálogo injetável.
  - Origem no legado: `models/puericultura/consulta/calculadora.ts`
  - Critério de pronto: a fachada não expõe nada além de `catalogo`, `sugerir` e `montar`.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Seleção de ficha nas fronteiras de todas as dez faixas, dos dois lados.
- [ ] TT-02, Filtro por sexo, incluindo o campo restrito e a nota que o declara.
- [ ] TT-03, Montagem completa, com ficha e avaliação, conferindo em que seção cada coisa cai.
- [ ] TT-04, Omissão: campo sem resposta, resposta em branco, e seção que perde todos os itens.
- [ ] TT-05, Invariantes: toda montagem traz as duas notas obrigatórias; nenhuma referência
      se repete; todo item transposto conserva referência.
- [ ] TT-06, Transcrição das dez fichas contra o congelado.

> Aferido em 2026-07-28: 54 testes em 5 arquivos `consulta-*`.

## Tarefas de Migração de Dados

Não se aplica: a unit não persiste nada, e o preenchimento vive no navegador até o recarregar.

## Ordem Sugerida

1. T-01 e T-02 primeiro: sem os contratos e a fábrica, as fichas não têm forma.
2. T-03 e T-04 em seguida, e são o grosso do esforço — dez fichas transcritas do impresso.
3. T-05 a T-07 podem correr em paralelo; nenhuma depende das outras.
4. T-08 depende de a fachada de crescimento existir, ao menos no tipo.
5. T-09 e T-10 fecham a montagem; T-12 apenas a expõe.
6. TT-06 exige o congelado gerado antes, por `scripts/congelar-fichas-caderneta.mts`.

## Lacunas Pendentes (🔴)

Nenhuma. As três premissas em aberto — a ficha imediatamente anterior, a atribuição editorial
de cada campo a uma seção do SOAP e a lista de um item só na supressão por sexo — estão
declaradas no `design.md` e não bloqueiam a reimplementação, porque em todas elas o código
declara ao leitor o que decidiu.
