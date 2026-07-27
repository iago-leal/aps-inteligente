# Actions: Revisão da linguagem dos textos da plataforma

> Identificador: `018-revisao-linguagem-textos`
> Data: `2026-07-27`
> Roadmap: `_reversa_forward/018-revisao-linguagem-textos/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 62 |
| Paralelizáveis (`[//]`) | 42 |
| Maior cadeia de dependência | 16 (T006 → T007 → T008 → T014 → T053 → T017 → T020 → T055 → T023 → T032 → T037 → T038 → T039 → T047 → T050 → T051) |

A decomposição preserva a ordem de execução da seção 8 do `roadmap.md`: princípio antes da norma, norma antes do inventário, aparato com a suíte verde, reescritas por frente, a exceção da citação em ato único, asserções atualizadas, vigilância reconciliada. As frentes de reescrita da fase 3 — `interface/**`, `models/**`, metadados e manifesto, `README.md`, e a exceção da citação — são amplamente paralelas porque cada ação tem arquivo alvo próprio; o gargalo real é a cadeia do aparato, e dentro dela a classificação exaustiva (T009 a T013), que o roadmap §4 marca como a única premissa de risco médio. Por isso T007 vem antes dela: a contagem exata do extrator substitui a heurística de §2.1 **antes** de qualquer trabalho de classificação, e o escopo se renegocia ali se o número surpreender.

Três medições precedem a primeira reescrita, e é o que a segunda passagem acrescentou de mais importante à ordem: a linha de base da citação (T017), a contagem de asserções de entrada (T054) e a prova de que cada verificador sabe reprovar (T055). As três medem o estado anterior, e nenhuma delas pode ser feita depois — é o que a auditoria mostrou ao encontrar, três vezes, verificações que apareceriam verdes por construção.

A terceira passagem não mexeu nessa ordem: **alargou as frentes que ela governa.** A fase 3 ganhou três ações de reescrita em `models/**` (T058 a T060) porque o recorte anterior, restrito a `validacao.ts` e `fonte-clinica.ts`, deixava de fora 47 literais candidatos em 17 arquivos — mais do que os 18 que incluía. A fase 4 ganhou duas ações de atualização de asserção (T061, T062) que a régua antiga não enxergava. E a fase 2 ganhou dois verificadores (T056, T057) para invariantes que os contratos prometiam e nenhuma ação criava. O gargalo continua sendo a classificação exaustiva; o volume de reescrita é que cresceu.

### Observações de decomposição

- **Os IDs acima de T052 vieram das passagens posteriores à primeira geração**, e por isso não seguem a sequência de leitura: a regra deste skill proíbe reciclar identificadores, de modo que a renumeração ficou para trás na primeira geração. T053 a T055 nasceram na segunda passagem; T056 a T062, na terceira. A consequência a registrar, para que a próxima auditoria não a tome por defeito: **o número do ID deixou de ordenar a execução, mas a posição da linha continua ordenando.** Cada ação está escrita depois daquelas de que depende, e a conferência mecânica não encontra ciclo nem dependência fantasma. Ler de cima para baixo continua sendo ler na ordem em que se executa; somar os IDs, não.
- **T017 deixou de ser inferência.** Na primeira versão ela vinha marcada 🟡 por não derivar de decisão explícita do roadmap; D-14 e `MD-0018` a adotaram, e o `data-delta.md` §3.1-bis agora declara os dois artefatos de dado que ela pressupõe.
- **A guarda de não regeração de T053 é a forma, não a decisão.** O plano fixa que a linha de base jamais se regera; se isso se realiza por recusa do gerador a sobrescrever arquivo existente ou apenas pelo aviso gravado dentro dele é escolha da execução, e a primeira é a que serve à falha ruidosa.
- **O aparato tem sete arquivos de verificação, e esta lista é a canônica.** Norma (T018), congelamento (T019), citação (T020), descrição da plataforma nas duas formas (T021), integridade do manifesto (T022), igualdade do par duplicado (T056) e cláusula de privacidade (T057). O roadmap contava quatro em três lugares e cinco num quarto, defeito que a terceira auditoria encontrou e que a quarta passagem do plano corrigiu por remissão: §10 deixou de fixar o número e passou a apontar T055, que é onde a contagem vive. É a doutrina de L-13 aplicada ao próprio plano — número escrito em prosa envelhece, e este envelheceu três vezes.
- **T035 deixou de ser uma ação de um arquivo.** Ela agora reescreve o mesmo literal em dois lugares, `interface/inicio/tela.tsx` e `public/manifest.webmanifest`, porque D-18 exige o ato único e a decomposição não pode desfazê-lo por comodidade de granularidade. É a única ação da coleção cujo alvo são dois arquivos que precisam mudar **juntos**; separá-la em duas reintroduziria exatamente a divergência que T056 vigia.
- **T045 trocou o padrão de nome por uma lista.** O alvo era `tests/unit/dominio*/validacao.test.ts`, e o padrão não resolve para o domínio do risco cardiovascular, que não tem esse arquivo — as mensagens dele vivem em `invariantes.test.ts` e no teste de integração da tela. Alvo por padrão de nome esconde a ausência; alvo por lista a mostra.
- **T059 é a única ação da frente ampliada marcada 🟡**, e a razão é de classificação, não de execução: `models/puericultura/oms/{leitura,lms}.ts` mistura mensagem que chega à tela com mensagem interna de invariante, e a fronteira só se resolve com o inventário na mão. Se a classificação de T009 mostrar que ali tudo é interno, a ação encolhe para os quatro arquivos restantes.
- **O mapa de classificação nasce modular** (T008 a T013), com um módulo por camada sob `scripts/textos/classes/`. Além de permitir o paralelismo, evita que um arquivo único com mais de quatrocentas entradas dispare o sinal de dívida de arquivo acima de 400 linhas.
- **Dois itens do plano seguem deliberadamente sem ação.** O cenário "revisão que alteraria conteúdo clínico é recusada" não ganha verificador, por decisão registrada na segunda passagem do clarify e incorporada a RN-04: quem o faz valer são os oráculos de domínio e o congelamento de RF-06, e um teste que comparasse números dentro de literais pegaria pouco. Os gates do passo 8 (`lint`, `typecheck`, `test`, `test:e2e`) também não viram ação, por vedação deste skill; são portão de entrega, não tarefa.

## Fase 1, Preparação

<!-- Setup, scaffolding, migrações iniciais, configuração de infraestrutura local. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Executar `/reversa-principles` e criar o princípio **IX** (norma de redação do produto), no molde dos oito ativos, com exemplo de aplicação e impacto declarado nos templates dependentes; o princípio remete a `docs/redacao.md` (RF-11, D-09) | - | `[//]` | `.reversa/principles.md` | 🟢 | `[X]` |
| T002 | Redigir a primeira metade do guia: escopo, as três classes de RN-01, a exceção estrita de RN-09, os três eixos da pontuação, o teto de um par de travessões por bloco e a proibição de reticências e exclamação (RN-03), o estatuto do ponto médio (RN-10); cada regra com par antes/depois tirado do próprio produto e remissão ao princípio IX | T001 | - | `docs/redacao.md` | 🟢 | `[X]` |
| T003 | Redigir a segunda metade do guia: grafia de números, unidades e siglas pelo uso corrente (L-05); molde das mensagens de validação (L-06) e a decisão pendente de L-08 sobre justificativa clínica e referência à fonte; separador único dos `<title>` e padrão de capitalização (D-13); seção final que separa o que é verificável por máquina do que é julgamento (`investigation.md` §3.2) | T002 | - | `docs/redacao.md` | 🟡 | `[X]` |
| T004 | Apontar `docs/redacao.md` no `CLAUDE.md` do projeto como norma de redação do produto, com remissão ao princípio IX (RF-01) | T003 | `[//]` | `CLAUDE.md` | 🟢 | `[X]` |
| T005 | Apontar `docs/redacao.md` no `README.md`, na seção que orienta quem chega ao repositório (RF-01) | T003 | - | `README.md` | 🟢 | `[X]` |
| T006 | Escrever o extrator de literais: travessia da árvore sintática do TypeScript (`StringLiteral`, `NoSubstitutionTemplateLiteral`, `JsxText`), descarte de comentários, normalização de espaço em branco no `JsxText` quebrado em linhas; caminhos de leitura próprios para `public/manifest.webmanifest` (três campos por chave) e `README.md`; modo de listagem que emite candidatos sem exigir classe (D-03) | - | `[//]` | `scripts/inventariar-textos.mts` | 🟢 | `[X]` |
| T007 | Executar o extrator em modo de listagem sobre `interface/**`, `pages/**`, `models/**`, o manifesto e o `README.md`; registrar a contagem exata por camada, que passa a ser a régua canônica da superfície textual, e conferir o dimensionamento da premissa de risco médio antes de classificar. A previsão a bater é a de 270 a 320 candidatos do roadmap §4, refinada na terceira passagem; as cifras em prosa valem só como ordem de grandeza, por L-13 | T006 | - | `_reversa_forward/018-revisao-linguagem-textos/actions.md` (Notas de execução) | 🟢 | `[X]` |
| T008 | Escrever o agregador do mapa de classificação: tipo da entrada, chaveamento por arquivo mais texto do literal (jamais por linha), agregação dos módulos de `scripts/textos/classes/`, e a mensagem de erro que nomeia arquivo, linha e ensina em qual módulo declarar (D-04) | T007 | - | `scripts/textos/classificacao.mts` | 🟡 | `[X]` |
| T009 | Declarar a classe de cada literal candidato de `models/puericultura/**`, distinguindo os vinte e cinco rótulos citados da `NOTA_PROVENIENCIA` autoral e das mensagens de validação | T008 | `[//]` | `scripts/textos/classes/models-puericultura.mts` | 🟢 | `[X]` |
| T010 | Declarar a classe de cada literal candidato de `models/insulina/**` (~28 concentrados na fonte clínica) | T008 | `[//]` | `scripts/textos/classes/models-insulina.mts` | 🟢 | `[X]` |
| T011 | Declarar a classe de cada literal candidato de `models/gestacao/**`, `models/cardiopatia-isquemica/**` e `models/risco-cardiovascular/**` | T008 | `[//]` | `scripts/textos/classes/models-demais.mts` | 🟢 | `[X]` |
| T012 | Declarar a classe de cada literal candidato de `interface/**`, com atenção a `cardiologia/referencias.tsx`, que mistura enquadramento autoral e localização bibliográfica citada | T008 | `[//]` | `scripts/textos/classes/interface.mts` | 🟢 | `[X]` |
| T013 | Declarar a classe de cada literal candidato de `pages/**`, dos três campos textuais do manifesto e da prosa do `README.md` | T008 | `[//]` | `scripts/textos/classes/pages-e-arquivos.mts` | 🟢 | `[X]` |
| T014 | Completar o gerador: montagem em memória, esquema de `data-delta.md` §3.1 (`esquema`, `feature`, `geradoPor`, `aviso`, `porQueExiste`, `consumidores`, `totais`, `literais` com `arquivo`, `linha`, `classe`, `texto`, `origem`, `excecao`), escrita atômica e parada ruidosa em candidato sem classe, na disciplina de `scripts/congelar-casos-oraculo.mts` (D-02) | T006, T008 | - | `scripts/inventariar-textos.mts` | 🟡 | `[X]` |
| T053 | Acrescentar ao gerador o modo de emissão da linha de base: seleciona só as entradas de classe `citacao`, grava `arquivo`, `texto` e `origem` em `tests/apoio/citacao-linha-de-base.json`, e escreve dentro do próprio arquivo o aviso de que ele **não se regera** e a razão pela qual existe. O modo se recusa a sobrescrever arquivo já presente, para que a linha de base não se mova por descuido (D-14, `MD-0018`, `data-delta.md` §3.1-bis) | T014 | - | `scripts/inventariar-textos.mts` | 🟢 | `[X]` |
| T015 | Executar o gerador, conferir que nenhum candidato ficou órfão, que a soma por classe e por camada bate com a contagem de T007, e provar a idempotência com segunda execução de `git diff` vazio | T014, T009, T010, T011, T012, T013 | - | `tests/apoio/inventario-textual.json` | 🟢 | `[X]` |
| T016 | Documentar no `README.md` a invocação do gerador (`node scripts/inventariar-textos.mts`), o modo de emissão da linha de base e sua condição de uso único, e onde se declara a classe de um literal novo, no molde da seção que já documenta `gerar-tabelas-oms.mts` e `congelar-casos-oraculo.mts` | T014, T053 | - | `README.md` | 🟢 | `[X]` |

## Fase 2, Testes

<!-- O aparato entra com o texto ainda intocado (D-12), para que uma falha do verificador não se confunda com uma reescrita malfeita. As três medições do estado anterior (T017, T054, T055) só existem nesta janela. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T017 | Emitir a linha de base da classe citação pelo modo de T053, a partir do estado **anterior** a qualquer reescrita, e versioná-la como artefato congelado em commit próprio, para que o histórico do arquivo prove que ela não se moveu. É a única janela em que pode ser emitida: depois da primeira reescrita, o estado anterior deixa de existir no código (D-14, roadmap §8 passo 3) | T053, T015 | - | `tests/apoio/citacao-linha-de-base.json` | 🟢 | `[X]` |
| T054 | Medir e registrar a contagem de asserções de texto de **entrada**, pela régua do `onboarding.md` §3 nas suas **duas famílias** (D-19): as consultas do Testing Library (`getByText`, `getByRole(… name:`, `getByLabelText`, `toHaveTextContent`, `getByPlaceholderText`, `findByText`, `queryByText`) e as asserções literais sobre texto de produto (`toContain` e `toBe` sobre cadeia), ambas sobre `tests` e `e2e`, registradas em separado. A segunda família existe porque a primeira não via `tests/unit/interface/formatar-plano.test.ts`, o arquivo de acoplamento mais denso da suíte. São estas duas cifras, e não as varreduras em prosa de 27/07, que servem de piso a RF-08 (L-13) | - | `[//]` | `_reversa_forward/018-revisao-linguagem-textos/actions.md` (Notas de execução) | 🟢 | `[X]` |
| T018 | Teste das regras mecânicas da norma sobre a classe autoral do inventário (RF-05): travessão `—` e nunca `-` nem `--`, teto de um par por bloco, ausência de reticências e exclamação, ponto médio ladeado por espaço simples e nunca acumulado com vírgula ou travessão; a classe citação fica explicitamente isenta e a mensagem de falha aponta a regra do guia (D-07) | T015, T003 | `[//]` | `tests/unit/textos/norma.test.ts` | 🟢 | `[X]` |
| T019 | Teste de congelamento (RF-06): cada literal autoral do código é comparado ao valor registrado em `inventario-textual.json`, com mensagem que remete ao guia; o `README.md` fica fora do congelamento por D-10 | T015 | `[//]` | `tests/unit/textos/congelamento.test.ts` | 🟢 | `[X]` |
| T020 | Teste de preservação da citação (RF-07): compara a classe citação do código à linha de base de T017 e reprova qualquer delta que não sejam os dois rótulos de §2.4, exigindo que a diferença de cada um se restrinja à concordância | T017 | `[//]` | `tests/unit/textos/citacao.test.ts` | 🟢 | `[X]` |
| T021 | Teste da descrição da plataforma, em **duas formas** e não em uma (RF-04, D-05, D-17): a `description` de `pages/index.tsx` **nomeia todas** as seções de `CATALOGO`, de modo que uma quinta não entre sem revisitá-la; a do manifesto **não enumera subconjunto próprio** delas, e o teste não a obriga a enumerá-las, porque o campo tem teto prático de comprimento e é truncado na instalação. As duas asserções vivem no mesmo arquivo e leem o mesmo oráculo | T015 | `[//]` | `tests/unit/textos/descricao-plataforma.test.ts` | 🟢 | `[X]` |
| T056 | Teste de igualdade do par duplicado (D-18, RN-05): o subtítulo de `interface/inicio/tela.tsx` e a `description` de `public/manifest.webmanifest` são o mesmo literal, e continuam sendo depois da revisão; a mensagem de falha nomeia os dois arquivos e explica que a duplicação é anterior à feature. Não depende do inventário: lê os dois arquivos direto, como T022 | - | `[//]` | `tests/unit/textos/par-duplicado.test.ts` | 🟢 | `[X]` |
| T057 | Teste da cláusula de privacidade na **forma fraca** (D-20): cada uma das seis `description` afirma que o cálculo não sai do navegador, sem que a redação de hoje seja congelada — o guia pode reescrevê-la, e é justamente por isso que a asserção não pode ser literal. Não depende do inventário: lê as seis páginas direto | - | `[//]` | `tests/unit/textos/privacidade.test.ts` | 🟢 | `[X]` |
| T022 | Teste de integridade do manifesto: JSON válido, campos obrigatórios presentes, `name` e `short_name` preservados como `APS Inteligente` e `APSi`, para que a revisão não os alcance por descuido. Mora na suíte padrão, e não em `tests/contract/`, que roda só por `npm run test:api` sob configuração que exige build de produção e servidor de pé, e ficaria fora dos gates do passo 8 (D-15) | - | `[//]` | `tests/unit/textos/manifesto.test.ts` | 🟢 | `[X]` |
| T055 | Fazer cada um dos **sete** verificadores reprovar de propósito antes de aceitá-lo como verde: uma falha induzida por vez — hífen no lugar de travessão, literal autoral divergente do inventário, terceiro delta na classe citação, seção de `CATALOGO` retirada da descrição da home, `short_name` alterado no manifesto, subtítulo da home afastado da `description` do manifesto, cláusula de privacidade removida de uma das seis rotas —, conferindo que o teste correspondente falha e que a mensagem ensina a regra violada; desfazer cada indução e registrar o resultado. Verificação nova se confere primeiro pela falha (roadmap §10) | T018, T019, T020, T021, T022, T056, T057 | - | `_reversa_forward/018-revisao-linguagem-textos/actions.md` (Notas de execução) | 🟢 | `[X]` |
| T023 | Executar a suíte com o aparato instalado e o texto ainda intocado; registrar, nas notas de execução, quais verificadores já falham por desvio pré-existente (a `NOTA_PROVENIENCIA` com dois pares de travessão, o duplo separador de `/dm2/insulina`, a descrição desatualizada da home), de modo que as falhas esperadas fiquem distintas das que as reescritas produzirem (D-12). Registrar também os que já passam e por quê, entre eles o do par duplicado e o da forma negativa do manifesto, que hoje passam por acidente favorável e não por mérito da revisão | T018, T019, T020, T021, T022, T054, T055, T056, T057 | - | `_reversa_forward/018-revisao-linguagem-textos/actions.md` (Notas de execução) | 🟢 | `[X]` |

## Fase 3, Núcleo

<!-- As reescritas, por frente. Cada literal reescrito registra o par antes/depois; RN-04 recusa qualquer alteração de conteúdo clínico. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T024 | Revisar a prosa autoral do catálogo da home (~11 literais: títulos, descrições e rótulos de seção), preservando-o como fonte única de home e rotas (RN-05, D-07 da feature 007) | T023 | `[//]` | `interface/inicio/catalogo.ts` | 🟢 | `[X]` |
| T025 | Revisar a prosa autoral de `interface/calculadora/**`, com a reescrita concentrada em `rotulos.ts`, fonte única entre painel de resultado e plano copiável (RN-05, feature 006) | T023 | `[//]` | `interface/calculadora/rotulos.ts` e demais literais autorais do módulo | 🟢 | `[X]` |
| T026 | Revisar a prosa autoral de `interface/cardiologia/**` (~26 literais concentrados em `referencias.tsx`), preservando as localizações bibliográficas classificadas como citação | T023 | `[//]` | `interface/cardiologia/referencias.tsx` e demais literais autorais do módulo | 🟢 | `[X]` |
| T027 | Revisar a prosa autoral de `interface/gestacao/**` e `interface/risco-cardiovascular/**`, inclusive o bloco de proveniência do risco cardiovascular | T023 | `[//]` | `interface/gestacao/**`, `interface/risco-cardiovascular/**` | 🟢 | `[X]` |
| T028 | Revisar a prosa autoral de `interface/comum/moldura.tsx` e das quatro telas de `interface/puericultura/`, mantendo os nomes acessíveis imperativos e específicos, no molde de "Ativar tema claro" (RN-07). O `proveniencia.tsx` fica fora: pertence a T038, no ato único da citação | T023 | `[//]` | `interface/comum/moldura.tsx`, `interface/puericultura/{app,formulario,resultado,tela}.tsx` | 🟢 | `[X]` |
| T029 | Revisar as mensagens de validação de `models/insulina/validacao.ts` e `models/gestacao/validacao.ts` conforme o molde do guia: valor presente e inválido pede diagnóstico seguido de instrução, valor ausente pede instrução direta | T023 | `[//]` | `models/insulina/validacao.ts`, `models/gestacao/validacao.ts` | 🟢 | `[X]` |
| T030 | Revisar as mensagens de validação de `models/cardiopatia-isquemica/validacao.ts`, `models/risco-cardiovascular/validacao.ts` e `models/puericultura/validacao.ts` pelo mesmo molde, uniformizando as três redações da recusa por sexo conforme a decisão de L-08 tomada em T003 | T023, T003 | `[//]` | `models/cardiopatia-isquemica/validacao.ts`, `models/risco-cardiovascular/validacao.ts`, `models/puericultura/validacao.ts` | 🟡 | `[X]` |
| T031 | Revisar os literais **autorais** dos quatro `fonte-clinica.ts` fora da puericultura, deixando byte a byte tudo o que o inventário classificou como citação | T023 | `[//]` | `models/{insulina,gestacao,cardiopatia-isquemica,risco-cardiovascular}/fonte-clinica.ts` | 🟢 | `[X]` |
| T058 | Revisar a prosa autoral das regras da insulina — condutas de início, de intensificação, de titulação basal e da metformina, mais as recusas de `calculadora.ts` (~20 literais, a maior concentração da frente ampliada de D-16). É o texto que o prescritor mais lê, porque aparece no painel de resultado e no plano copiável, e não na mensagem de erro. RN-04 protege dose, unidade, meta e fármaco | T023 | `[//]` | `models/insulina/{regra-inicio,regra-intensificacao,regra-titulacao-basal,regra-metformina,calculadora}.ts` | 🟢 | `[X]` |
| T059 | Revisar a prosa autoral da puericultura fora da fonte clínica: a recusa parcial do perímetro cefálico acima de 2 anos, o alerta de idade gestacional não informada, e o que `classificacao.ts`, `medidas.ts` e `oms/{leitura,lms}.ts` exibem — distinguindo, com o inventário na mão, a mensagem que chega à tela da mensagem interna de invariante, que fica fora do escopo (D-16, RN-01) | T023 | `[//]` | `models/puericultura/{elegibilidade,calculadora,classificacao,medidas}.ts`, `models/puericultura/oms/{leitura,lms}.ts` | 🟡 | `[X]` |
| T060 | Revisar a prosa autoral dos três domínios restantes fora das fontes clínicas e das validações: a recusa de prevenção secundária do risco cardiovascular, as condutas de `cardiopatia-isquemica/conduta.ts` e as recusas de `gestacao/{calculadora,datas}.ts` (D-16) | T023 | `[//]` | `models/risco-cardiovascular/{elegibilidade,calculadora}.ts`, `models/cardiopatia-isquemica/{conduta,calculadora,probabilidade}.ts`, `models/gestacao/{calculadora,datas}.ts` | 🟢 | `[X]` |
| T032 | Reescrever a `NOTA_PROVENIENCIA` da puericultura para caber no teto de um par de travessões, preservando integralmente as afirmações sobre leitura por tendência, curvas da OMS de 2006 e referência de 2007, faixa INTERGROWTH-21st de 27 a 64 semanas pós-menstruais da p. 87 e leitura na linha publicada sem interpolação (RN-04, `data-delta.md` §2.3) | T023 | - | `models/puericultura/fonte-clinica.ts` | 🟢 | `[X]` |
| T033 | Corrigir a `description` da raiz para nomear as quatro seções vigentes de `CATALOGO`, preservada a cláusula de privacidade, e uniformizar o `<title>` ao separador único do guia (RF-04, D-05) | T023, T024 | `[//]` | `pages/index.tsx` | 🟢 | `[X]` |
| T034 | Uniformizar o separador dos `<title>` das cinco rotas restantes, eliminando o acúmulo de `—` e `·` em `/dm2/insulina`, e revisar a forma das cinco `description`, preservando a cláusula de privacidade e os nomes próprios de fonte, entre eles `TeleCondutas — Cardiopatia Isquêmica`, cujo travessão não conta para o teto de RN-03 | T023 | `[//]` | `pages/dm2/insulina.tsx`, `pages/pre-natal/idade-gestacional.tsx`, `pages/cardiologia/dor-toracica.tsx`, `pages/cardiologia/risco-cardiovascular.tsx`, `pages/puericultura/crescimento.tsx` | 🟢 | `[X]` |
| T035 | Revisar, **num ato só**, o par duplicado: o subtítulo do hero em `interface/inicio/tela.tsx` e a `description` do manifesto, hoje o mesmo literal byte a byte. A reescrita é única e se aplica aos dois arquivos, dentro do teto prático de 78 caracteres do manifesto e sem enumerar seções ali (D-17, D-18). Não tocar `name` nem `short_name`, que são a marca fixada pela feature 009, nem o `titulo` do hero, que é a mesma marca | T023, T024 | `[//]` | `interface/inicio/tela.tsx`, `public/manifest.webmanifest` | 🟢 | `[X]` |
| T036 | Revisar a prosa autoral do `README.md` contra o guia, nas regras mecânicas e na coesão, sem congelá-lo literal a literal (D-10) | T023, T016 | - | `README.md` | 🟡 | `[X]` |
| T037 | Ato único da citação, no domínio: corrigir `Comprimento adequada para idade` para `Comprimento adequado para idade` e `Baixa comprimento para idade` para `Baixo comprimento para idade` em `CORTES_COMPRIMENTO`; criar a constante congelada `NOTA_CORRECAO_DE_CONCORDANCIA` nomeando as duas formas impressas originais (D-06, RF-10); reescrever o cabeçalho do arquivo, inclusive a imprecisão da linha 9, que arrola `Muito baixo comprimento para idade` entre os desviantes quando ele está correto | T032 | - | `models/puericultura/fonte-clinica.ts` | 🟢 | `[X]` |
| T038 | Renderizar `NOTA_CORRECAO_DE_CONCORDANCIA` como parágrafo próprio no bloco de proveniência, lida do domínio pelo mesmo caminho da `NOTA_PROVENIENCIA`, sem criar segunda fonte de texto na tela (RN-05, RF-10) | T037 | - | `interface/puericultura/proveniencia.tsx` | 🟢 | `[X]` |
| T039 | Conferir RF-07 com o verificador de T020: a comparação acusa exatamente **dois** deltas na classe citação, ambos de concordância, ambos de §2.4; qualquer terceiro delta reprova e volta à frente que o produziu | T037, T038, T024, T025, T026, T027, T028, T029, T030, T031, T033, T034, T035, T036, T058, T059, T060 | - | `tests/unit/textos/citacao.test.ts` | 🟢 | `[X]` |

## Fase 4, Integração

<!-- Asserções atualizadas, nenhuma removida (RF-08); vigilância da 017 reconciliada (D-11). -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T040 | Atualizar as seis asserções dos dois rótulos corrigidos e reescrever o comentário da linha 108, que hoje justifica a concordância destoante como fidelidade à fonte e passaria a explicar o oposto do que o código faz. Reescrever junto o **título** do teste da linha 107, "a transcrição preserva a concordância da fonte, destoante e tudo", que é prosa como as outras duas e passaria a afirmar o contrário do que o teste verifica | T037 | `[//]` | `tests/unit/dominio-puericultura/classificacao.test.ts` | 🟢 | `[X]` |
| T041 | Atualizar a asserção da linha 59 ao rótulo corrigido | T037 | `[//]` | `tests/unit/dominio-puericultura/fachada.test.ts` | 🟢 | `[X]` |
| T042 | Atualizar a asserção da linha 81 e o comentário da linha 80, e acrescentar a asserção que prova a presença da declaração de RF-10 na proveniência renderizada | T037, T038, T028 | `[//]` | `tests/integration/interface/puericultura.test.tsx` | 🟢 | `[X]` |
| T043 | Atualizar as asserções de texto e de nome acessível dos testes de integração de cardiologia, gestação e risco cardiovascular, afetadas pelas reescritas de T026 e T027 | T026, T027 | `[//]` | `tests/integration/interface/{cardiologia,gestacao,risco-cardiovascular}.test.tsx` | 🟢 | `[X]` |
| T044 | Atualizar as asserções de texto e de nome acessível dos testes de integração de início, moldura, resultado, formulário e relator de erros, afetadas pelas reescritas de T024, T025, T028 e T035. O `relator-de-erros.test.tsx` entra porque assevera o aviso "Não prescreva" de `interface/calculadora/resultado.tsx`, que a frente de T025 alcança | T024, T025, T028, T035 | `[//]` | `tests/integration/interface/{inicio,moldura,resultado,formulario,relator-de-erros}.test.tsx` | 🟢 | `[X]` |
| T045 | Atualizar as asserções de mensagem de validação nos testes de unidade dos domínios, afetadas por T029, T030 e T031. Os alvos se nomeiam um a um porque o domínio do risco cardiovascular **não tem** arquivo `validacao.test.ts`, e um alvo por padrão de nome deixaria as mensagens dele sem cobertura declarada; ali as asserções vivem em `invariantes.test.ts` e no teste de integração da tela | T029, T030, T031 | `[//]` | `tests/unit/dominio/validacao.test.ts`, `tests/unit/dominio-{cardiopatia,gestacao,puericultura}/validacao.test.ts`, `tests/unit/dominio-risco-cardiovascular/invariantes.test.ts` | 🟢 | `[X]` |
| T061 | Atualizar as asserções literais de `tests/unit/interface/**`, que a régua antiga não via e que as reescritas de T025 e T058 quebram: dezessete `toContain` sobre a cadeia do plano copiável em `formatar-plano.test.ts`, nascidos de `rotulos.ts` e das condutas da insulina. Atualizar, jamais remover — é o arquivo em que a remoção passaria mais despercebida (D-19, RF-08) | T025, T058 | `[//]` | `tests/unit/interface/{formatar-plano,agrupar-recomendacoes}.test.ts` | 🟢 | `[X]` |
| T062 | Atualizar as asserções de conduta, recusa e alerta nos testes de unidade de domínio afetados pela frente ampliada de D-16: intensificação, titulação basal, início, metformina e referências da insulina; conduta da cardiopatia; elegibilidade, recusas e o aviso de conversão de medida da puericultura, que `medidas.test.ts` assevera por trecho ("somados 0,7 cm", "82,0 cm → 82,7 cm"). Marcada 🟡, e não 🟢 como D-16, pela mesma razão de T059: a fronteira entre mensagem exibida e mensagem interna de invariante só se fecha com o inventário na mão, e ela decide quantas destas asserções de fato mudam | T058, T059, T060 | `[//]` | `tests/unit/dominio/{intensificacao,titulacao-basal,inicio,metformina,referencias}.test.ts`, `tests/unit/dominio-cardiopatia/conduta.test.ts`, `tests/unit/dominio-puericultura/{elegibilidade,fachada-recusas,medidas}.test.ts` | 🟡 | `[X]` |
| T046 | Atualizar os textos asseverados nos roteiros de ponta a ponta e conferir que **nenhuma rota piora** em relação a `e2e/axe-baseline.json`, que as rotas hoje asseveradas em zero continuam em zero e que nenhum elemento interativo perde nome acessível (RN-07). O baseline é catraca, não é 0/0: tolera uma violação em `telaInicial` e uma em `telaComResultado`, dívida herdada e alheia a esta feature (L-10). O arquivo **não** é alvo da feature, e vê-lo no `git diff` significa regressão acomodada em vez de corrigida. As dependências incluem as reescritas de domínio porque os roteiros asseveram texto que nasce lá: `calculadora.spec.ts` espera "Os dados mudaram — recalcule antes de prescrever." e a conduta de início, `puericultura.spec.ts` espera a recusa "fora do escopo da fonte" | T024, T025, T026, T027, T028, T033, T034, T035, T038, T058, T059, T060 | `[//]` | `e2e/{cabecalho,calculadora,plataforma,puericultura}.spec.ts` | 🟢 | `[X]` |
| T047 | Regerar o inventário sobre o texto revisado e registrar o `git diff` como prova da mudança deliberada, marcando com `excecao` apontando `MD-0015` as duas entradas de §2.4; o congelamento de RF-06 passa a valer sobre o texto novo. A linha de base de T017 **não** é regerada, e continuar intocada é o que mantém RF-07 capaz de reprovar (D-14) | T039, T040, T041, T042, T043, T044, T045, T046, T061, T062 | - | `tests/apoio/inventario-textual.json` | 🟢 | `[X]` |
| T048 | Medir de novo as asserções de texto pela régua de T054, **nas duas famílias**, e registrar os dois pares entrada/saída, provando que nenhuma foi removida para acomodar a mudança (RF-08, D-19). A comparação se faz contra as cifras medidas, nunca contra número escrito em prosa (L-13), e a segunda família é a que guarda `tests/unit/interface/**` | T054, T040, T041, T042, T043, T044, T045, T046, T061, T062 | - | `_reversa_forward/018-revisao-linguagem-textos/actions.md` (Notas de execução) | 🟢 | `[X]` |
| T049 | Reescrever **W022** no mesmo lugar onde nasceu, com nota de superação apontando `MD-0015` e `MD-0017`: mantém a vigilância sobre os vinte e três rótulos que continuam intocáveis e passa a vigiar a permanência da declaração de RF-10, agora na constante exportada `NOTA_CORRECAO_DE_CONCORDANCIA` (D-11) | T037, T038 | `[//]` | `_reversa_forward/017-puericultura-crescimento/regression-watch.md` | 🟢 | `[X]` |

## Fase 5, Polimento

<!-- Registro auditável da revisão, reconciliação da spec e medição. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T050 | Escrever o relatório da revisão: cada literal autoral do inventário aparece como mantido, com justificativa de uma linha, ou reescrito, com o par antes/depois, de modo que a revisão seja auditável sem recorrer ao `git log` (RF-03, RNF de rastreabilidade) | T039, T047 | `[//]` | `_reversa_forward/018-revisao-linguagem-textos/relatorio-revisao.md` | 🟢 | `[X]` |
| T051 | Fechar a lista de reconciliação de RF-09 para absorção por `/reversa-sync`, incluindo obrigatoriamente `_reversa_sdd/addenda/017-puericultura-crescimento.md`, as fichas `MD-0012` e `MD-0014` e o `regression-watch.md` da 017, mais `MD-0015`, que transcreve os mesmos dois rótulos sem constar da lista de RF-09, e os demais artefatos da extração que citam literais alterados | T049, T050 | - | `_reversa_forward/018-revisao-linguagem-textos/reconciliacao-spec.md` | 🟡 | `[X]` |
| T052 | Medir a variação de bundle pelo método de `_reversa_forward/017-puericultura-crescimento/medicao-bundle.md` e declarar qualquer crescimento acima de 1 kB gzip por rota | T047 | `[//]` | `_reversa_forward/018-revisao-linguagem-textos/medicao-bundle.md` | 🟢 | `[X]` |

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.

Cinco ações depositam seu resultado aqui, por serem medições e não artefatos: T007 (contagem
exata da superfície textual), T054 (contagem de asserções de entrada nas DUAS famílias, medida
antes da primeira reescrita), T055 (prova de que cada um dos sete verificadores sabe reprovar),
T023 (falhas esperadas do aparato sobre o texto intocado) e T048 (contagens de saída, contra as
de T054).
-->

### T007 — contagem exata da superfície textual (2026-07-27)

A régua mudou por decisão do usuário durante esta execução, e a mudança precede a contagem
que vale. A primeira passagem do extrator usou só o corte de três palavras de §2.1 e
devolveu 447 candidatos — dentro da ordem de grandeza prevista. O que reprovou a régua não
foi o total: foi o que ficava de fora. Dos 1837 literais abaixo do corte, **164 são texto
exibido**, e entre eles estão rótulos de classificação transcritos da Caderneta da Criança
— `Eutrofia`, `Magreza acentuada`, `Obesidade grave`, `Sobrepeso`. São classe `citacao`, e
sob a régua antiga ficariam fora da linha de base de RF-07: **o guarda da citação nasceria
cego exatamente onde a feature mais precisa dele.**

A régua passou a ser a união de posição sintática de exibição e do corte de três palavras.
Contagem com ela:

| Camada | Candidatos | Fora da régua |
|---|---|---|
| `models/**` | 159 | 756 |
| `interface/**` | 336 | 835 |
| `pages/**` | 33 | 53 |
| `public/manifest.webmanifest` | 3 | 0 |
| `README.md` | 114 | 0 |
| **Total** | **645** | **1644** |

Por metade da régua: 198 entraram só por posição, 151 só por palavras, 296 pelas duas. Os
198 de posição são a prova de que a união era necessária.

**A premissa de dimensionamento do roadmap §4 está refutada.** Ela previa 270 a 320
candidatos; são 645, mais do que o dobro do piso e o dobro do teto. Mesmo descontado o
`README.md`, que entra por linha de prosa e não por literal, restam 531 no código. A fase
de classificação (T008 a T013) é, portanto, maior do que o plano supôs, e o roadmap §4
precisa registrar a refutação em vez de manter a faixa antiga.

**Três consequências para o plano, nenhuma resolvida nesta sessão:**

1. A régua nova é decisão técnica e ainda não tem `D-NN` no roadmap nem ficha em
   `.harness/decisoes/`. Merece as duas: ela altera D-03 e é do tipo que a próxima pessoa
   vai querer entender antes de mexer no extrator.
2. `interface/calculadora/resultado.tsx` saltou para 39 candidatos e passou a ser o
   arquivo mais denso do código, à frente de `models/puericultura/fonte-clinica.ts` (35).
   T025 o alcança pela cláusula "demais literais autorais do módulo", mas a concentração
   sugere ação própria.
3. Os 1644 fora da régua não foram inspecionados um a um. Sob a régua da união eles são,
   em quase totalidade, nome de classe CSS e discriminante de tipo — mas "quase" não é
   "todos", e a conferência pertence a T015.

### T015 — o inventário gerado, e a régua que a conferência corrigiu de novo (2026-07-27)

O gerador roda, é idempotente e nenhum candidato ficou órfão. As cifras finais da fase de
classificação:

| Camada | Literais distintos |
|---|---|
| `models/**` | 156 |
| `interface/**` | 303 |
| `pages/**` | 33 |
| `public/manifest.webmanifest` | 3 |
| `README.md` | 129 |
| **Total** | **624** |

Por classe: **472 autorais, 108 citações, 44 identificadores.** O total de candidatos é 703
e o de literais distintos é 624, porque o mesmo texto no mesmo arquivo colapsa numa
declaração só — `Eutrofia` aparece nas duas tabelas de IMC, e tem uma classe, não duas.

**A conferência exigida por esta ação encontrou o mesmo defeito de T007, num domínio novo.**
Inspecionados os literais abaixo do corte, oito tinham cara de prosa exibida, e três eram
**citação**: `Angina típica`, `Angina atípica` e `dor musculoesquelética`, todos do
TeleCondutas, todos com duas palavras, todos invisíveis à metade sintática da régua por
morarem em valor de `Record` e em item de array. Em T007 a cegueira custaria os rótulos da
Caderneta; aqui custaria os do TeleCondutas. O corte caiu de três para duas palavras, e
entrou junto a exclusão estrutural da **diretiva de prólogo** (`"use client"`), que o corte
menor traria vinte e duas vezes e que é instrução ao compilador, não texto.

Depois da correção, a mesma conferência não encontra **nenhum** suspeito de prosa entre os
1601 literais que restam fora da régua. A recalibração está em `MD-0019`, seção ESTADO, e
em D-21 do roadmap.

**Duas observações de execução, nenhuma bloqueante:**

1. **O `README.md` teve a classe declarada por arquivo, e não literal a literal.** A
   justificativa vive em `scripts/textos/classes/pages-e-arquivos.mts`, em `UNIFORMES`:
   sua prosa é integralmente autoral por §2.1, de modo que não existe a decisão que a
   declaração literal a literal serve para tomar; e a forma literal congelaria o README
   por via oblíqua — não por teste que se atualiza com o oráculo, mas pela parada do
   gerador a cada parágrafo —, contra D-10. Esta própria execução o demonstrou: as quinze
   linhas que T005 acrescentou teriam exigido quinze declarações antes que algo voltasse a
   rodar. A porta é estreita e a razão vai escrita ao lado.
2. **Template com interpolação continua fora do inventário, por desenho do extrator.** As
   recusas de `elegibilidade.ts` e o aviso de conversão de `medidas.ts` são montados em
   tempo de execução e não existem como literal único; a revisão os alcança pela frente de
   T059 e T060, que se declara por arquivo, mas o congelamento de RF-06 não os cobre. É
   limitação declarada, não achado.

### T054 — asserções de texto de ENTRADA, nas duas famílias (2026-07-27)

Medidas antes da primeira reescrita, pela régua do `onboarding.md` §3 nas suas duas
famílias (D-19). São estas duas cifras, e não as varreduras em prosa, que servem de piso a
RF-08.

| Família | Régua | Ocorrências | Arquivos |
|---|---|---|---|
| 1 — consultas do Testing Library | `getByText`, `getByRole(… name:`, `getByLabelText`, `toHaveTextContent`, `getByPlaceholderText`, `find/query/getAllByText`, `getByAltText`, `getByTitle` | **267** | 14 |
| 2 — asserções literais sobre texto | `toContain(`, `.toBe(` sobre cadeia | **373** | 40 |

Concentração da família 1: `e2e/plataforma.spec.ts` (54), `tests/integration/interface/resultado.test.tsx`
(32), `.../gestacao.test.tsx` (30). Da família 2: `tests/unit/dominio-puericultura/classificacao.test.ts`
(50), `.../fachada.test.ts` (33), `tests/unit/dominio/metformina.test.ts` (24).

A segunda família existe porque a primeira não via `tests/unit/interface/formatar-plano.test.ts`,
o arquivo mais acoplado ao texto da suíte. Ela mede 13 ali, e é justamente o arquivo que a
reescrita de `rotulos.ts` quebra. Régua e roteiro em
`scratchpad/medir-assercoes.py`, reexecutável contra o estado de saída em T048.

### T055 — os sete verificadores, provados pela falha (2026-07-27)

Cada verificador foi visto **reprovar** por falha induzida de propósito, e cada indução foi
desfeita. A coluna "base" é o número de falhas antes da indução, porque três verificadores
já reprovam por desvio pré-existente e sem ela a prova não distinguiria uma coisa da outra.

| # | Verificador | Falha induzida | Base → com indução |
|---|---|---|---|
| 1 | `norma.test.ts` | hífen fazendo ofício de travessão em literal autoral | 2 → **3** |
| 2 | `congelamento.test.ts` | literal do código divergente do inventário | 0 → **2** |
| 3 | `citacao.test.ts` | terceiro delta na classe citação | 0 → **2** |
| 4a | `descricao-plataforma.test.ts`, forma positiva | — | **1 → 1** |
| 4b | `descricao-plataforma.test.ts`, forma negativa | manifesto enumerando subconjunto próprio | 1 → **2** |
| 5 | `manifesto.test.ts` | `short_name` alterado | 0 → **1** |
| 6 | `par-duplicado.test.ts` | subtítulo da home afastado do manifesto | 0 → **1** |
| 7 | `privacidade.test.ts` | cláusula removida de uma das seis rotas | 0 → **1** |

**A linha 4a merece leitura própria, e é a melhor notícia da tabela.** A forma positiva não
precisou de indução: ela já reprova, e reprova pelo caso real — a `description` da raiz
nomeia duas das quatro seções do catálogo, que é o defeito de §2.3. Prova pelo caso real é
mais forte que prova por indução, porque não depende de o indutor ter escolhido bem o que
quebrar.

**Dois achados da execução destas induções, ambos incorporados:**

1. **O gerador e o verificador guardam coisas diferentes, e a primeira indução mostrou
   como.** Ao trocar um literal no código, o gerador **parou** por classe não declarada
   antes que o verificador de norma chegasse a ver o texto novo. As duas guardas se
   somam em vez de se substituir, e a indução teve de entrar na camada certa de cada uma:
   no fonte para o congelamento, no inventário para a norma e a citação.
2. **O teto do manifesto era número escrito em prosa.** O contrato `interfaces/manifesto-pwa.md`
   dizia 78 caracteres; a medição encontrou 81, e o verificador nasceria vermelho sobre
   texto sem defeito — o modo mais rápido de ensinar alguém a afrouxar um teste. O teste
   passou a comparar contra o comprimento **medido** antes da revisão, e o contrato foi
   corrigido com a razão escrita. É L-13 outra vez, e a terceira nesta feature.

### T023 — o aparato sobre o texto intocado (2026-07-27)

Suíte dos sete verificadores com o texto ainda como estava: **26 passam, 3 falham**. As três
falhas são **esperadas** e nomeiam desvios que a fase 3 corrige, o que é a propriedade que
D-12 construiu — a partir daqui, falha nova é falha da reescrita, e não do aparato.

| Falha | Verificador | Desvio pré-existente | Quem corrige |
|---|---|---|---|
| descrição da home nomeia 2 de 4 seções | `descricao-plataforma` | defeito de exatidão de §2.3 | T033 |
| `NOTA_PROVENIENCIA` com dois pares de travessão | `norma` (teto de §3.2) | `models/puericultura/fonte-clinica.ts:276` | T032 |
| reticências no `README.md:107` | `norma` (§3.3) | `` `Heading`…) `` | T036 |

**Os que passam, e por que convém dizer por quê.** O do par duplicado e a forma negativa da
descrição do manifesto passam hoje **por acidente favorável**, e não por mérito de revisão
nenhuma: os dois literais coincidem porque alguém os copiou, e o manifesto não enumera
seções porque nunca as enumerou. É exatamente por isso que eles precisaram da indução de
T055 — um verificador que nasce verde não se distingue, na suíte, de um verificador que não
sabe reprovar. Os de congelamento, citação, integridade do manifesto e privacidade passam
por mérito: o inventário bate com o código, a linha de base bate com a citação, a marca está
intacta e as seis rotas afirmam a privacidade.

**Uma falha esperada NÃO apareceu, e vale registrar.** O duplo separador de `/dm2/insulina`
(`Calculadora de Insulina — DM2 · APS Inteligente`), que o plano previa como desvio
detectável, **não é apanhado por nenhuma regra mecânica**: um travessão só está dentro do
teto, e o ponto médio está bem formado. O acúmulo dos dois separadores na mesma linha é
desvio de **forma do `<title>`**, fixado em `docs/redacao.md` §6.1, e é julgamento — T034 o
corrige, e nenhum teste o vigiaria. É o tipo de coisa que a seção 7 do guia existe para
manter visível.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-27 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-07-27 | Quarta passagem, sobre os achados A004, A005, A007 a A010 da terceira auditoria. Nenhuma ação nova, seis alteradas: **T046** ganha as dependências das reescritas de domínio, porque `calculadora.spec.ts` e `puericultura.spec.ts` asseveram texto que T035, T058, T059 e T060 reescrevem; **T062** alcança `medidas.test.ts`, que assevera por trecho o aviso de conversão de medida, e passa a justificar o próprio 🟡; **T056** e **T057** perdem a dependência de T015, que não tinham por que ter — leem arquivos direto, como T022, e a dependência as prendia atrás de toda a cadeia de classificação; **T040** passa a reescrever também o título do teste da linha 107, prosa como o comentário da 108; o resumo deixa de falar em "três frentes". As três métricas do cabeçalho não se moveram | reversa |
| 2026-07-27 | Terceira passagem, propagando as cinco decisões novas do roadmap (D-16 a D-20) e fechando a metade de L-14 que faltava. Sete ações novas: **T056**, o teste de igualdade do par duplicado home ↔ manifesto (D-18); **T057**, a asserção fraca da cláusula de privacidade (D-20); **T058**, **T059** e **T060**, a reescrita da prosa autoral de `models/**` fora de `validacao.ts` e `fonte-clinica.ts` (D-16); **T061**, a atualização das asserções literais de `tests/unit/interface/**`, que a régua antiga não via (D-19); **T062**, a atualização das asserções de conduta e recusa que a frente ampliada quebra. Ações alteradas: T021 passa a asseverar as duas formas de RF-04, positiva na home e negativa no manifesto (D-17); T035 vira ato único sobre dois arquivos (D-18); T045 troca o padrão de nome por lista explícita, porque o risco cardiovascular não tem `validacao.test.ts`; T044 absorve `relator-de-erros.test.tsx`; T054 e T048 medem as duas famílias; T055 cobre sete verificadores; T007 passa a conferir contra a previsão refinada de 270 a 320; T023, T039 e T047 ganham as dependências novas | reversa |
| 2026-07-27 | Segunda passagem, propagando as decisões da segunda rodada de `/reversa-clarify` e `/reversa-plan` (L-12) e os achados de `audit/cross-check.md`. Três ações novas: **T053**, o modo de emissão da linha de base no gerador (D-14); **T054**, a contagem de asserções de entrada, sem a qual RF-08 perderia o piso de comparação (L-13); **T055**, a falha induzida em cada verificador antes de aceitá-lo como verde (roadmap §10). T017 deixa de ser inferência 🟡 e passa a derivar de D-14; T022 sai de `tests/contract/` para `tests/unit/textos/` (D-15, A004); T046 abandona o "0/0 por rota" pela catraca real e perde `e2e/axe-baseline.json` da coluna de alvo (A003, A009); T028 explicita as quatro telas e exclui o `proveniencia.tsx` (A014); T048 passa a comparar contra a medição de T054 (A005); T051 acrescenta `MD-0015` (A013); T016 documenta também o modo de uso único do gerador | reversa |
