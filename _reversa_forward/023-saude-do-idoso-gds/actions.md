# Actions: Saúde do idoso — Escala de Depressão Geriátrica (GDS)

> Identificador: `023-saude-do-idoso-gds`
> Data: `2026-07-30`
> Roadmap: `_reversa_forward/023-saude-do-idoso-gds/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 34 |
| Paralelizáveis (`[//]`) | 8 |
| Maior cadeia de dependência | 12 (T006 → T010 → T011 → T013 → T016 → T018 → T019 → T021 → T028 → T032 → T033 → T034) |

**Ordem que não é negociável, e por quê.** T004 vem antes de qualquer literal transcrito:
sem a entrada nominal em `SUBARVORES_COM_ORACULO_PROPRIO`, a suíte reprova por construção
no instante em que a primeira citação nova existir (D-10, `MD-0027`), e quem encontrasse a
barreira com pressa seria tentado a regerar a linha de base, que é o que `MD-0018` proíbe.
Pela mesma razão, T002 precede T004: a isenção só é legítima se o oráculo que a substitui
já existir.

**Sobre a fase da conferência humana** (`MD-0023`): T033 espera por pessoa e não por
máquina, e por isso está partida de T032, que é inteiramente mecânica. T034 existe para
que o resultado da conferência tenha onde ser registrado, mesmo quando for "nada a mudar".

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Escrever o congelador da fonte: lê a cópia datada em `referencias/saude-do-idoso/…-20260730.html`, extrai os quinze enunciados, a resposta que pontua em cada um (pela marcação de célula, `MD-0038`), os três rótulos com seus cortes e a providência, e emite JSON ordenado e estável. **Lê arquivo local, jamais a rede** (D-09, `MD-0040`); falha barulhenta se o arquivo faltar ou se o `sha256` não bater | - | `[//]` | `scripts/congelar-fonte-gds.mts` | 🟢 | `[X]` |
| T002 | Executar o congelador e versionar o oráculo, lendo o conteúdo gerado item a item contra a fonte aberta ao lado — é a única leitura humana que separa uma transcrição correta de uma plausível | T001 | - | `tests/apoio/gds-fonte-congelada.json` | 🟢 | `[X]` |
| T003 | Criar os dois módulos de classe de texto, ainda vazios, e registrá-los no agregador com os predicados de caminho: um para o domínio novo, outro para a tela nova, que inicia a partição pedida pela dívida 3 em vez de engordar `interface.mts` (D-11) | - | `[//]` | `scripts/textos/classes/{models-depressao-geriatrica,interface-saude-do-idoso}.mts` e `scripts/textos/classificacao.mts` | 🟢 | `[X]` |
| T004 | Declarar `models/depressao-geriatrica/` em `SUBARVORES_COM_ORACULO_PROPRIO`, nomeando o oráculo de T002 e o teste de T005. Não tocar em `citacao-linha-de-base.json`, não alargar `AFASTAMENTOS_AUTORIZADOS`, e preservar o alcance: a isenção vale para **surgimento**, e sumiço ou alteração continuam reprovando (D-10) | T002 | - | `tests/unit/textos/citacao.test.ts` | 🟢 | `[X]` |

## Fase 2, Testes

<!-- Todos nascem vermelhos e assim devem ser vistos antes de qualquer linha de domínio. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Teste de transcrição: confere, contra o congelado, os quinze enunciados byte a byte, a resposta que pontua de cada item, os três rótulos com os seus limites e o texto da providência. A mensagem de falha nomeia o item divergente | T002 | `[//]` | `tests/unit/dominio-depressao-geriatrica/transcricao.test.ts` | 🟢 | `[X]` |
| T006 | Teste do escore e das faixas: varredura **exaustiva** dos dezesseis escores possíveis, afirmando o rótulo de cada um; os dois extremos por respostas completas (todas na direção que pontua e todas na oposta); e a ausência de buraco ou sobreposição entre faixas | - | `[//]` | `tests/unit/dominio-depressao-geriatrica/escore.test.ts` | 🟢 | `[X]` |
| T007 | Teste de validação: item faltante vira ofensor nomeado; três faltantes produzem três ofensores de uma vez; entrada sem resposta alguma produz quinze; nenhum caminho de erro devolve escore parcial | - | `[//]` | `tests/unit/dominio-depressao-geriatrica/validacao.test.ts` | 🟢 | `[X]` |
| T008 | Teste de propriedade sobre a fachada: para qualquer conjunto completo de respostas, a saída é `resultado`, o escore fica em 0–15, `referencias` nunca é vazia, a providência está presente em toda faixa e duas chamadas iguais devolvem valores iguais | - | `[//]` | `tests/unit/dominio-depressao-geriatrica/invariantes.test.ts` | 🟢 | `[X]` |
| T009 | Guarda de camada varrendo `models/depressao-geriatrica/**`: reprova se algum arquivo importar de fora de `models/`, mencionar framework ou sistema de design, ou ler o relógio. Molde da varredura que a 017 instalou (RF-17) | - | `[//]` | `tests/unit/dominio-depressao-geriatrica/camada.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T010 | Contratos do domínio: `ReferenciaClinica`, item, respostas por `id`, resultado, faixa, providência, advertência, ofensor com o código `ITEM_NAO_RESPONDIDO`, union discriminada e `ErroDeInvariante`. **Sem variante `ForaDoEscopoDaFonte`**, que este domínio não tem (D-07) | T006, T007 | - | `models/depressao-geriatrica/tipos.ts` | 🟢 | `[X]` |
| T011 | Os quinze itens como dado congelado, cada um com `id`, número, enunciado transcrito e a resposta que pontua, com `Object.freeze` profundo e comentário de origem (D-02) | T010 | - | `models/depressao-geriatrica/itens.ts` | 🟢 | `[X]` |
| T012 | Constantes da fonte e do produto, separadas por comentário: `FONTE_ID`, `VERSAO_EDICAO` pela data de acesso, `NOME_PUBLICADO`, `referencia()`, `REFERENCIAS` congelado, a providência como citação, e as duas notas autorais — a advertência de que rastreia e não diagnostica, e o público a que o instrumento se dirige (D-05, D-06) | T010 | - | `models/depressao-geriatrica/fonte-clinica.ts` | 🟢 | `[X]` |
| T013 | Cálculo do escore percorrendo o dado dos itens, sem condicional por item; devolve inteiro de 0 a 15 | T011 | - | `models/depressao-geriatrica/escore.ts` | 🟢 | `[X]` |
| T014 | Faixas como dado ordenado com limites inclusivos e rótulo literal, mais a função que resolve o escore em faixa; a cobertura de 0 a 15 é propriedade do dado, não do código que o lê (D-04) | T012 | - | `models/depressao-geriatrica/classificacao.ts` | 🟢 | `[X]` |
| T015 | Validação com coleta total: percorre os quinze itens e devolve um ofensor por resposta ausente, todos de uma vez, nomeando o item; nunca lança (D-03) | T011 | - | `models/depressao-geriatrica/validacao.ts` | 🟢 | `[X]` |
| T016 | Fachada `EscalaDepressaoGeriatrica.avaliar`: `validar → escore → faixa → montar resultado com providência, advertência e referências`. Erro esperado é valor; exceção só para bug (D-01) | T013, T014, T015 | - | `models/depressao-geriatrica/calculadora.ts` | 🟢 | `[X]` |
| T017 | Declarar a classe de cada literal do domínio no módulo de T003 — itens e rótulos como citação com a origem, providência como citação, notas do produto como autorais, códigos e `id` como identificadores — e rodar o inventariador até ele não parar | T003, T011, T012, T014, T016 | - | `scripts/textos/classes/models-depressao-geriatrica.mts` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T018 | Contêiner e casca da tela: `Moldura` com `comInicio` e subtítulo por concatenação com `NOME_PUBLICADO`, mais a máquina `vazio → sucesso \| erro \| falha-inesperada`, com invalidação por edição, painel honesto e relator de erros injetável (D-07) | T016 | - | `interface/saude-do-idoso/{tela,app}.tsx` | 🟢 | `[X]` |
| T019 | Formulário dos quinze itens: um grupo de duas opções por item, **sem valor pré-selecionado**, rotulado pelo enunciado, navegável por teclado, com o botão de calcular e a propagação de alteração ao contêiner (D-08) | T018 | - | `interface/saude-do-idoso/formulario.tsx` | 🟢 | `[X]` |
| T020 | Painel de resultado: escore, faixa na redação da fonte, providência em qualquer faixa, advertência de rastreamento, referências e o aviso de desatualizado; nos demais estados, a lista de itens faltantes e o painel honesto | T018 | - | `interface/saude-do-idoso/resultado.tsx` | 🟢 | `[X]` |
| T021 | Décima folha de estilo, sobre tokens já usados, cuidando do arranjo vertical do questionário e **sem nenhuma propriedade horizontal de coluna** (D-12), mais o `import` em `_app.tsx` na ordem existente | T019, T020 | - | `interface/estilos/saude-do-idoso.css` e `pages/_app.tsx` | 🟢 | `[X]` |
| T022 | Rota da calculadora: casca de metadados mais tela, com título e descrição na forma da feature 018 | T018 | - | `pages/saude-do-idoso/depressao-gds.tsx` | 🟢 | `[X]` |
| T023 | Quinta seção no catálogo, `id` `saude-do-idoso`, título "Saúde da pessoa idosa", uma ficha apontando para a rota; diff estritamente aditivo, com as seis fichas anteriores intocadas | T022 | - | `interface/inicio/catalogo.ts` | 🟢 | `[X]` |
| T024 | Quinto par `id → ícone` no mapa de ícones da home, mantido o fallback | T023 | - | `interface/inicio/icones.tsx` | 🟢 | `[X]` |
| T025 | Atualizar a lista ordenada exaustiva da home para cinco seções e sete fichas, preservando a asserção de que o bloco de apoio fica fora do `map` do catálogo | T023 | - | `tests/integration/interface/inicio.test.tsx` | 🟢 | `[X]` |
| T026 | Teste de integração da tela: os quatro estados, a coleta total exibida, a invalidação por edição, a ausência de ritual de revisão, a ausência de campo de idade e a presença da advertência e da providência | T019, T020 | - | `tests/integration/interface/saude-do-idoso.test.tsx` | 🟢 | `[X]` |
| T027 | Declarar a classe dos literais da tela e da rota no módulo de T003, incluindo os metadados, e regerar o inventário textual lendo o diff | T003, T019, T020, T022 | - | `scripts/textos/classes/interface-saude-do-idoso.mts` e `tests/apoio/inventario-textual.json` | 🟢 | `[X]` |
| T028 | Roteiro e2e da rota nova: percurso completo por teclado, resultado exibido e `axe` em zero **por asserção direta**, sem entrada na baseline | T021, T022 | - | `e2e/saude-do-idoso.spec.ts` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T029 | Rodar a guarda geométrica e conferir que ela passou a cobrir **oito** rotas por derivação do catálogo, sem que nenhuma lista tenha sido editada à mão | T021, T023 | - | `e2e/plataforma.spec.ts` | 🟢 | `[X]` |
| T030 | Acrescentar a calculadora e a sua fonte ao `README.md`, com o nome publicado exatamente como o domínio o declara, para não repetir o drift que a 018 encontrou | T023 | `[//]` | `README.md` | 🟡 | `[X]` |
| T031 | Ver o oráculo reprovar: inverter temporariamente a resposta que pontua de um item, confirmar que T005 falha nomeando-o, e desfazer. Teste que nunca foi visto vermelho não é guarda, é decoração | T005, T011 | - | `models/depressao-geriatrica/itens.ts` | 🟢 | `[X]` |
| T032 | Verificação mecânica completa: `lint`, `typecheck`, suíte padrão com cobertura de `models/**` acima de 90%, inventário sem parar, e os dois roteiros e2e. Registrar as cifras, que a re-extração há de citar como medidas e não transcritas (`MD-0033`) | T026, T027, T028, T029 | - | — | 🟢 | `[X]` |
| T033 | **Espera por humano.** Conferência clínica pelo prescritor: comparar a tela com a fonte aberta ao lado, item a item, mais a leitura da prosa que diz a quem o instrumento se dirige, que aqui substitui uma regra de recusa, e o aval estético da tela | T032 | - | — | 🟡 | `[X]` |
| T034 | Registrar o desfecho de T033: aplicar o que a conferência pedir ou anotar que nada mudou, com a data. Conferência sem registro é conferência que não aconteceu | T033 | - | `_reversa_forward/023-saude-do-idoso-gds/actions.md` | 🟢 | `[X]` |

## Notas de execução

**Duas ações que o plano não previu, ambas impostas por oráculo que já existia.**

1. **A descrição da home teve de acompanhar o catálogo.**
   `tests/unit/textos/descricao-plataforma.test.ts` exige que a `description` de
   `pages/index.tsx` nomeie **todas** as seções de `CATALOGO`, e a entrega ficou vermelha
   entre T023 e T027 até a quinta entrar na enumeração. Tocados `pages/index.tsx` e a sua
   declaração em `scripts/textos/classes/pages-e-arquivos.mts`. É a única alteração de
   literal **existente** desta feature, e está no `legacy-impact.md` como MEDIUM.
2. **O travessão da linha nova do `README.md` reprovou a norma.** `norma.test.ts` só admite
   travessão na prosa autoral quando ele pertence ao **nome publicado** da fonte; o das
   Linhas de Cuidado não o traz, ao contrário do "Guia Rápido Diabetes Mellitus — SMS-Rio"
   das linhas vizinhas. Reescrito com vírgula.

**Um teste a mais em T006, para cobrir a guarda de faixa.** `faixaDoEscore` lançando
`ErroDeInvariante` é inalcançável pela fachada, e por isso foi exercitada na função. Sem
isso, o unit ficava com 88,6% de instruções; com ela, 95,45%.

**T031 verificado com inversão real.** Trocada a resposta que pontua do item 7, três testes
reprovaram e o primeiro nomeou o item. Desfeito em seguida, e a suíte voltou a 79/79 no
domínio.

**Ruído de formatação desfeito de propósito.** `prettier --write` reformatou três arquivos
**existentes** que a feature apenas emendou (`interface/inicio/catalogo.ts`,
`scripts/textos/classificacao.mts`, `scripts/textos/classes/pages-e-arquivos.mts`). As três
reformatações foram revertidas: o diff de `catalogo.ts` é, ao fim, **estritamente aditivo**
— 15 inserções e zero remoções —, que é o que RN-13 promete. O repositório inteiro reprova
`prettier --check` (655 arquivos), de modo que formatar por arrasto misturaria dívida
antiga com entrega nova.

**T033 conferida e T034 registrada em 2026-08-09.** O prescritor comparou a tela com a
fonte aberta ao lado, item a item, e as quinze perguntas conferem. Chancelou também as duas
outras metades que a ação previa: a indicação do instrumento, isto é, a prosa que diz a quem
a escala se dirige e que aqui faz as vezes de regra de recusa, e o aval estético da tela.
**Nada pediu alteração**, de modo que esta nota é o desfecho inteiro: nenhum literal,
nenhuma regra e nenhum arquivo mudaram por força da conferência.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-30 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-07-30 | Execução de T001 a T032 por `/reversa-coding`; notas de execução acrescentadas | reversa |
| 2026-08-09 | Conferência clínica de T033 aprovada pelo prescritor, sem alteração pedida; T033 e T034 fechadas | iagoleal |
