# Adendo 023 — A plataforma ganha a quinta seção, e o primeiro domínio clínico sem recusa

> Feature: `023-saude-do-idoso-gds`
> Data: `2026-08-09`
> Cenário: `legado`

## Vigência

Vigente desde 2026-08-09.

## Resumo da entrega

A plataforma passa a rastrear depressão na pessoa idosa pela Escala de Depressão Geriátrica em
quinze itens, na redação que o portal Linhas de Cuidado do Ministério da Saúde publica, sob
`/saude-do-idoso/depressao-gds`. É a **quinta seção** e a **sétima calculadora**. O prescritor
responde aos itens com a pessoa diante de si, e a tela devolve o escore, a faixa que a fonte
nomeia e a referência que a sustenta, sem que nenhum dado saia do navegador.

É a primeira calculadora dirigida à pessoa idosa e a primeira cujo insumo é inteiramente um
questionário respondido pelo paciente, e não uma medida aferida pelo profissional. O domínio
novo é o **sexto unit clínico**, contando as duas fachadas da puericultura como uma unit só,
conforme a ADR 0017.

**32 de 34 ações concluídas**, nenhuma falhou. As duas restantes, T033 e T034, são a
conferência clínica pelo prescritor e o registro do seu desfecho: dependem de pessoa e
permanecem `[ ]` de propósito, porque marcar como feito o que ninguém conferiu transformaria o
gate em formalidade. Este adendo é, portanto, uma **sincronização parcial**; quando a
conferência ocorrer, uma reexecução do `/reversa-sync` acrescentará seção de atualização ao
final, sem tocar no que está escrito acima dela.

Portões da entrega: `typecheck` e `lint` verdes, **920 testes** de unidade e integração em 73
arquivos, cobertura de `models/**` em 97,2% de linhas, **60 roteiros e2e** com `axe` em zero na
rota nova por asserção direta, e o inventário textual idempotente em **1.245 literais**. Commit
`0f5e897`, pushado para `aps-inteligente/main`.

## O que esta entrega tem de estrutural

Três coisas, e nenhuma delas é a calculadora.

**A primeira é uma ausência.** `models/depressao-geriatrica/` é o primeiro unit clínico **sem**
`ForaDoEscopoDaFonte`. A fonte não publica faixa etária nenhuma, de modo que não há recusa a
modelar, e uma variante inalcançável seria código morto que a próxima leitura tomaria por
descuido. Quem reler a família concluindo que "todo domínio clínico tem recusa" encontrará aqui
o contraexemplo, e por isso a ausência vai declarada no cabeçalho de `tipos.ts`. O que ocupa o
lugar da regra é **uma frase**, `TEXTO_PUBLICO_DO_INSTRUMENTO`, e ela vive no domínio
justamente porque faz o trabalho que noutras telas é de regra, e não de rótulo.

**A segunda é a porta que se usou pela primeira vez sem ter sido quem a abriu.**
`models/depressao-geriatrica/` entra em `SUBARVORES_COM_ORACULO_PROPRIO` de
`tests/unit/textos/citacao.test.ts`, a segunda entrada da lista que `MD-0027` criou na feature
020. Três coisas **não** aconteceram, e é a ausência de cada uma que mantém o gate de pé:
`citacao-linha-de-base.json` não foi tocado, `AFASTAMENTOS_AUTORIZADOS` não foi alargada, e a
isenção continua alcançando apenas o **surgimento** de citação, de modo que sumiço e alteração
seguem reprovando inclusive dentro da subárvore isenta. É o item de maior severidade da
entrega, porque altera guarda escrita por outra feature.

**A terceira é uma cadeia de conferência que a fonte obrigou a inventar.** A escala mistura dez
itens em que pontua o "Sim" com cinco em que pontua o "Não", os de número 1, 5, 7, 11 e 13, e a
fonte publica essa informação **pela cor da célula**, não pelo texto. `scripts/congelar-fonte-gds.mts`
extrai a chave da cópia datada e a congela em `tests/apoio/gds-fonte-congelada.json`;
`transcricao.test.ts` julga o domínio contra o congelado. A propriedade foi verificada por
inversão deliberada do item 7: três testes reprovaram, e o primeiro nomeou o item.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/architecture.md` | §1, Estilo arquitetural | componente-novo | A camada de domínio ganha o oitavo diretório, `models/depressao-geriatrica/`, no arranjo dos anteriores: fonte única declarada, constantes congeladas, erro como valor, coleta total, fachada única. A dependência unidirecional das cinco camadas permanece exata, agora com guarda executável própria em `camada.test.ts` |
| `_reversa_sdd/architecture.md` | §3, Dados | delta-de-dados | Nasce `tests/apoio/gds-fonte-congelada.json`, quarto oráculo congelado da camada dev-time ao lado dos de puericultura, das fichas da caderneta e da linha de base da citação, gerado da cópia datada da fonte e jamais escrito à mão. O inventário textual passa de 1.187 para **1.245** literais |
| `_reversa_sdd/architecture.md` | §5, Qualidade e testes | componente-novo | Entram cinco arquivos de unidade em `tests/unit/dominio-depressao-geriatrica/` (transcrição, escore exaustivo, validação, invariantes por propriedade e guarda de camada), um de integração e um roteiro e2e. A contagem de arquivos de teste sobe para **73**, e a de casos para 920 |
| `_reversa_sdd/architecture.md` | §5, Qualidade e testes | **regra-alterada** | O item mais delicado. `tests/unit/textos/citacao.test.ts` foi alterado por esta feature, e é guarda escrita pela 018: `SUBARVORES_COM_ORACULO_PROPRIO` passa de uma entrada a duas. Ler a lista como "arquivo novo é isento" seria o erro; ela é nominal, exige oráculo declarado e alcança só o surgimento |
| `_reversa_sdd/architecture.md` | §6, Dívidas técnicas | regra-alterada | A dívida 3 **encolheu** em vez de crescer: os literais da tela nova foram para `scripts/textos/classes/interface-saude-do-idoso.mts`, e `interface.mts` permaneceu em 684 linhas. A partição por tela começou aqui, e desde então foi levada a termo fora do ciclo forward, por `OPP-20260730-R8FJ` |
| `_reversa_sdd/domain.md` | entre §8 e §9 | **regra-nova** | Falta a seção do sexto unit clínico, `models/depressao-geriatrica`. Ela precisa declarar: os quinze itens como dado congelado com a chave de pontuação por item, as três faixas cobrindo 0 a 15 com limites inclusivos e sem buraco, a providência exibida em toda faixa, e a advertência de que o instrumento rastreia e não diagnostica. Com ela, a contribuição desloca-se para §10 |
| `_reversa_sdd/domain.md` | §2, Glossário | regra-nova | Faltam os verbetes do instrumento: escala em quinze itens, escore de 0 a 15, faixa, providência, e a distinção entre rastrear e diagnosticar, que é o que a advertência do produto sustenta |
| `_reversa_sdd/domain.md` | §10, Invariantes transversais | regra-alterada | Onde a coluna Alcance lê "Os 7 units", leia-se **oito**. Os invariantes 1, 2, 4, 5, 6, 7 e 8 valem no unit novo e foram exercitados: pureza com guarda executável, `ErroDeInvariante` reservado ao impossível, quinze ofensores de uma vez, `referencias` nunca vazia sob 300 execuções sorteadas, e zero requisição externa no e2e |
| `_reversa_sdd/domain.md` | §11, Fronteiras de escopo | **regra-alterada** | A lista enumera o que cada unit recusa, e o novo **não recusa nada**. A próxima extração precisa registrar a exceção como decisão, e não como omissão: a fonte não publica faixa etária, e o que ocupa o lugar da recusa é `TEXTO_PUBLICO_DO_INSTRUMENTO`, prosa que diz a quem o instrumento se dirige sem barrar ninguém |
| `_reversa_sdd/domain.md` | §10.3, A norma de redação | regra-alterada | A tabela do `README.md` ganha a linha da calculadora, e a prosa passa a dizer cinco seções. A linha nasceu com travessão e `norma.test.ts` reprovou, porque o eixo expressivo só é lícito dentro do **nome publicado** da fonte, e o desta não o traz. Reescrita com vírgula; as vizinhas seguem lícitas porque nelas o travessão pertence ao nome |
| `_reversa_sdd/code-analysis.md` | módulo novo, após o 21 | componente-novo | Faltam dois módulos: `models/depressao-geriatrica` (sete arquivos, fachada única em `calculadora.ts`) e `interface/saude-do-idoso` (quatro arquivos, com máquina de estado de **três** destinos a partir de `vazio`, e não quatro) |
| `_reversa_sdd/code-analysis.md` | Módulo 16, `interface/inicio` | regra-alterada | O catálogo passa a sete fichas em cinco seções, com diff **estritamente aditivo**: 15 inserções, zero remoções. `icones.tsx` ganha o quinto par `id → ícone`, com o fallback `null` intacto. Três guardas acompanharam por derivação, sem que nenhuma lista de rotas fosse editada à mão |
| `_reversa_sdd/code-analysis.md` | Módulo 17, `interface/estilos` | componente-novo | Décima folha, `saude-do-idoso.css`, sem propriedade horizontal de coluna, porque o enquadramento é da `Moldura` (`MD-0029`, ADR 0021). A guarda geométrica passou a cobrir oito alvos, e o crescimento se deu sem edição de lista |
| `_reversa_sdd/code-analysis.md` | Módulo 18, `pages` | regra-alterada | Oitava rota de página, `saude-do-idoso/depressao-gds.tsx`, casca de metadados mais tela. E um achado de execução que o `actions.md` não previa: a `description` de `pages/index.tsx` enumera as seções, e `descricao-plataforma.test.ts` reprovou a entrega até a quinta entrar. Foi a única alteração de literal preexistente da feature |
| `_reversa_sdd/code-analysis.md` | Módulo 21, `scripts` | componente-novo | `congelar-fonte-gds.mts` é o quinto gerador idempotente da camada dev-time, e lê a cópia local da fonte, nunca a rede. Entram também dois módulos de classes, `models-depressao-geriatrica.mts` e `interface-saude-do-idoso.mts` |
| `_reversa_sdd/code-analysis.md` | Módulo 21, `scripts` | regra-alterada | `classificacao.mts` ganha duas dependências de **ordem**, e o sintoma de as inverter é sutil: o predicado do domínio novo precede o de `models/`, e o da tela nova precede `interface/` e `pages/`. Trocada a ordem, o inventariador manda declarar o literal no módulo errado, e continua verde |
| `_reversa_sdd/data-dictionary.md` | tipos do domínio | componente-novo | Faltam as estruturas do unit: o item da escala com a resposta que pontua, o resultado com escore, faixa e referências, e o ofensor de validação. Sem `ForaDoEscopoDaFonte`, ao contrário dos cinco anteriores |
| `_reversa_sdd/inventory.md` | Superfície de arquivos | componente-novo | Entram `models/depressao-geriatrica/` (sete arquivos), `interface/saude-do-idoso/` (quatro), `interface/estilos/saude-do-idoso.css`, `pages/saude-do-idoso/depressao-gds.tsx`, `scripts/congelar-fonte-gds.mts`, dois módulos de classes, `tests/apoio/gds-fonte-congelada.json`, cinco units de teste, um de integração e `e2e/saude-do-idoso.spec.ts` |
| `_reversa_sdd/traceability/spec-impact-matrix.md` | matriz de units × telas | regra-alterada | A matriz cresce em uma linha e uma coluna. O unit novo é ortogonal a todos os demais: não importa nenhum, e nenhum o importa |
| `_reversa_sdd/flowcharts/` | — | componente-novo | Falta `models-depressao-geriatrica.md`. O fluxo é o mais simples da família, porque não há ramo de recusa: quinze respostas, soma, faixa |
| `_reversa_sdd/adrs/0018` | Camada dev-time e oráculo congelado | regra-alterada | A ADR permanece válida e ganha o quinto caso, com uma diferença que merece registro: é o primeiro congelado cuja fonte é uma **página**, e não um arquivo publicado, de modo que a conferência da cópia contra a fonte viva é manual por desenho (`MD-0038`, `MD-0039`, `MD-0040`) |
| `_reversa_sdd/questions.md` | premissas 🟡 | regra-nova | Duas premissas nascem desta entrega e não constam da consolidação: a conferência manual da página publicada contra a cópia datada, e o fato de `TEXTO_PUBLICO_DO_INSTRUMENTO` carregar sozinho o papel que noutras telas é de regra de recusa, sem ofensor que barre a aplicação fora do público previsto |
| `_reversa_sdd/gaps.md` | dívidas | regra-alterada | A medição de `prettier --check` registrada como 655 arquivos está defasada: em 09/08/2026 são **674**, e a dívida cresce sozinha a cada feature. Registra-se também que a cobertura de ramos do unit novo é de 87,5%, abaixo dos 90 do limiar, que passa por ser global |

Nenhum impacto em `erd-complete.md`: o unit novo não toca banco, não persiste e não emite. Nenhum
impacto nas ADRs 0002 (cálculo no cliente) e 0012 (ritual de revisão exclusivo da insulina), que a
entrega **exercita** em vez de alterar: o e2e confirma zero requisição externa, e o teste de
integração afirma a ausência de checkbox de revisão nesta tela.

## Regras sob vigilância

Dezoito watch items nascem desta entrega, **W001** a **W018**, em
`_reversa_forward/023-saude-do-idoso-gds/regression-watch.md`.

Três merecem leitura antes dos demais. **W001** a **W003** formam um conjunto e só valem juntos:
vigiam, respectivamente, que a subárvore isenta nomeie o oráculo que a guarda, que a linha de base
da citação permaneça o congelado de 27/07 e jamais regerado, e que os afastamentos autorizados
sigam sendo dois. Verificar um sem os outros dois deixa passar exatamente a forma como a porta se
alargaria. **W004** vigia uma **ausência**, a de `ForaDoEscopoDaFonte`, mais a nota do cabeçalho que
a declara: sumindo a nota, a ausência volta a parecer esquecimento. E **W007** é o que guarda a
chave de pontuação, dez itens por "Sim" e cinco por "Não", e reprova nomeando o item invertido.

Seis observações sem peso de regressão acompanham a lista. Duas interessam à próxima re-extração:
`O-023-01` registra que a conferência da página publicada contra a cópia datada é manual, e que o
oráculo compara o produto contra a cópia, nunca a cópia contra a fonte viva; `O-023-06` registra
que T033 e T034 seguem abertas por dependerem de pessoa, que é a razão de este adendo ser parcial.

## O intervalo que este adendo cobre

Até a feature 022, a extração descrevia o sistema como ele era. A partir desta, ela descreve uma
plataforma de **quatro** seções e **sete** units, e o repositório tem cinco e oito. O adendo é o
que sustenta a leitura correta nesse intervalo, e o intervalo é maior do que o usual: entre o
commit `0f5e897`, de 30/07/2026, e a redação deste arquivo, em 09/08/2026, correram dez dias em
que a extração esteve defasada sem aviso.

Registra-se também, porque a próxima re-extração há de esbarrar nisso, que o registro de decisões
mudou de lugar em 09/08/2026: as fichas `MD-00NN` deixaram `.harness/decisoes/` e passaram a ser
cartões do quadro em `.vscode/vscode-kanban.json`, com o identificador do cartão igual ao número da
ficha. Os caminhos `.harness/decisoes/MD-00NN.md` citados neste arquivo e nos adendos anteriores são
registro histórico e resolvem-se pelo cartão de mesmo número.

## Fontes

- `_reversa_forward/023-saude-do-idoso-gds/requirements.md`
- `_reversa_forward/023-saude-do-idoso-gds/roadmap.md`
- `_reversa_forward/023-saude-do-idoso-gds/investigation.md`
- `_reversa_forward/023-saude-do-idoso-gds/data-delta.md`
- `_reversa_forward/023-saude-do-idoso-gds/legacy-impact.md`
- `_reversa_forward/023-saude-do-idoso-gds/regression-watch.md`
- `_reversa_forward/023-saude-do-idoso-gds/actions.md`
- `_reversa_forward/023-saude-do-idoso-gds/progress.jsonl`
- Microdecisões `MD-0018`, `MD-0027`, `MD-0029`, `MD-0038`, `MD-0039`, `MD-0040` e `MD-0041`, hoje
  cartões 18, 27, 29, 38, 39, 40 e 41 do quadro
