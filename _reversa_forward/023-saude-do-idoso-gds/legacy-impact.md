# Legacy impact — 023-saude-do-idoso-gds

> Data: `2026-07-30`
> Cenário: **legado** (âncora `_reversa_sdd/architecture.md` + `domain.md`)
> Execução: `/reversa-coding`, ações T001 a T032 concluídas; T033 (conferência humana) e
> T034 (registro do desfecho) pendentes por dependerem de pessoa.

## 1. Tabela de impacto

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `models/depressao-geriatrica/tipos.ts` | `architecture.md#1-estilo-arquitetural` (camada de domínio) | componente-novo | LOW | Contrato do sexto unit clínico. **Sem `ForaDoEscopoDaFonte`**, e a ausência é a única novidade de forma da família |
| `models/depressao-geriatrica/itens.ts` | idem | componente-novo | MEDIUM | Os quinze itens como dado congelado, com a chave de pontuação lida da marcação de célula da fonte. É o arquivo que um erro de transcrição tornaria silenciosamente errado |
| `models/depressao-geriatrica/fonte-clinica.ts` | idem | componente-novo | MEDIUM | Fonte única do unit (ADR 0001/0011), mais as duas notas do produto — advertência de rastreamento e público do instrumento |
| `models/depressao-geriatrica/escore.ts` | idem | componente-novo | LOW | Soma sobre o dado dos itens, sem condicional por item |
| `models/depressao-geriatrica/classificacao.ts` | idem | componente-novo | MEDIUM | As três faixas como dado ordenado; os cortes são o segundo ponto em que a transcrição de instrumentos erra |
| `models/depressao-geriatrica/validacao.ts` | idem | componente-novo | LOW | Coleta total de ofensores, um por item sem resposta |
| `models/depressao-geriatrica/calculadora.ts` | idem | componente-novo | MEDIUM | Fachada única do unit; erro é valor, exceção só para bug |
| `interface/saude-do-idoso/tela.tsx` | `code-analysis.md#módulo-11--interfacecardiologia` (molde) | componente-novo | LOW | Moldura com `comInicio` e subtítulo por concatenação |
| `interface/saude-do-idoso/app.tsx` | idem | componente-novo | MEDIUM | Máquina de estado com **três** destinos a partir de `vazio`, e não quatro |
| `interface/saude-do-idoso/formulario.tsx` | idem | componente-novo | MEDIUM | Quinze grupos de opções sem valor pré-selecionado; nenhum campo de idade |
| `interface/saude-do-idoso/resultado.tsx` | idem | componente-novo | MEDIUM | Escore, faixa na redação da fonte, providência em toda faixa, advertência e referências |
| `interface/estilos/saude-do-idoso.css` | `code-analysis.md#módulo-17--interfaceestilos` | componente-novo | LOW | Décima folha, sem propriedade horizontal de coluna (`MD-0029`) |
| `pages/saude-do-idoso/depressao-gds.tsx` | `code-analysis.md#módulo-18--pages` | componente-novo | LOW | Oitava rota de página, casca de metadados mais tela |
| `scripts/congelar-fonte-gds.mts` | `code-analysis.md#módulo-21--scripts` | componente-novo | MEDIUM | Quinto gerador idempotente da camada dev-time; lê a cópia local da fonte, nunca a rede |
| `scripts/textos/classes/models-depressao-geriatrica.mts` | idem | componente-novo | LOW | Classe declarada dos literais do domínio novo |
| `scripts/textos/classes/interface-saude-do-idoso.mts` | idem | componente-novo | LOW | Primeiro módulo de classes particionado por tela: começa a pagar a dívida 3 |
| `tests/apoio/gds-fonte-congelada.json` | `architecture.md#3-dados` | delta-de-dados | MEDIUM | Oráculo de transcrição versionado, gerado da cópia datada da fonte |
| `tests/unit/dominio-depressao-geriatrica/*.ts` (cinco arquivos) | `architecture.md#5-qualidade-e-testes` | componente-novo | LOW | Transcrição, escore exaustivo, validação, invariantes por propriedade e guarda de camada |
| `tests/integration/interface/saude-do-idoso.test.tsx` | idem | componente-novo | LOW | Os quatro estados da tela, mais três ausências verificadas |
| `e2e/saude-do-idoso.spec.ts` | idem | componente-novo | LOW | Percurso por teclado, privacidade de rede e `axe` em zero por asserção direta |
| **`tests/unit/textos/citacao.test.ts`** | `architecture.md#5-qualidade-e-testes` (guarda da feature 018) | **regra-alterada** | **HIGH** | Alteração em guarda escrito por outra feature: `models/depressao-geriatrica/` entra em `SUBARVORES_COM_ORACULO_PROPRIO`. A linha de base **não** foi regerada e `AFASTAMENTOS_AUTORIZADOS` **não** foi alargada |
| `interface/inicio/catalogo.ts` | `code-analysis.md#módulo-16--interfaceinicio` | regra-alterada | MEDIUM | Quinta seção. Diff **estritamente aditivo**: 15 inserções, zero remoções |
| `interface/inicio/icones.tsx` | idem | regra-alterada | LOW | Quinto par `id → ícone`, fallback `null` mantido |
| `tests/integration/interface/inicio.test.tsx` | idem | regra-alterada | MEDIUM | A lista ordenada exaustiva passa a afirmar cinco seções e sete fichas |
| **`pages/index.tsx`** | `code-analysis.md#módulo-18--pages` | **regra-alterada** | **MEDIUM** | **Achado de execução**: a `description` da home enumera as seções, e `tests/unit/textos/descricao-plataforma.test.ts` reprovou a entrega até que a quinta entrasse. Não estava no `actions.md` |
| `pages/_app.tsx` | idem | regra-alterada | LOW | Um `import` de folha, na ordem existente |
| `scripts/textos/classificacao.mts` | `code-analysis.md#módulo-21--scripts` | regra-alterada | MEDIUM | O agregador ganha dois módulos, e a **ordem** dos predicados passa a importar em dois pontos novos |
| `scripts/textos/classes/interface.mts` | idem | regra-alterada | LOW | As três linhas da quinta seção do catálogo, cujo arquivo continua sendo o do catálogo |
| `scripts/textos/classes/pages-e-arquivos.mts` | idem | regra-alterada | MEDIUM | Literal existente alterado, por consequência do achado em `pages/index.tsx` |
| `tests/apoio/inventario-textual.json` | `architecture.md#3-dados` | delta-de-dados | LOW | 1.187 → 1.245 literais; diff aditivo, salvo a linha alterada da descrição da home |
| `e2e/plataforma.spec.ts` | `architecture.md#5-qualidade-e-testes` | regra-alterada | LOW | Só comentário: o número fixo de casos foi trocado por "último", porque envelhecia a cada rota nova. O alcance cresceu **sozinho**, por derivação do catálogo |
| `README.md` | `domain.md#103-a-norma-de-redação` | regra-alterada | LOW | A calculadora entra na tabela, e a home passa a ter cinco seções na prosa |

## 2. Diff conceitual por componente

**O sexto domínio clínico entra sem trazer forma nova, com uma exceção que merece ser dita.**
`models/depressao-geriatrica/` repete o arranjo dos cinco anteriores — fonte única declarada,
constantes congeladas, erro como valor, coleta total, fachada única —, mas é o **primeiro
unit clínico sem `ForaDoEscopoDaFonte`**. A ausência não é esquecimento: a fonte não publica
faixa etária nenhuma, de modo que não há recusa a modelar, e uma variante inalcançável seria
código morto que a próxima leitura tomaria por descuido. Quem reler a família concluindo que
"todo domínio clínico tem recusa" encontrará aqui o contraexemplo, e ele está escrito no
cabeçalho de `tipos.ts`.

**A chave de pontuação passou a ter cadeia de conferência própria.** A escala mistura dez
itens em que pontua o "Sim" com cinco em que pontua o "Não", e a fonte publica essa
informação **pela cor da célula**, não pelo texto. `scripts/congelar-fonte-gds.mts` extrai a
chave da cópia datada da página e a congela em `tests/apoio/gds-fonte-congelada.json`;
`transcricao.test.ts` julga o domínio contra esse congelado. A propriedade foi verificada por
inversão deliberada: trocada a resposta que pontua do item 7, três testes reprovaram e o
primeiro deles nomeou o item.

**O verificador de citação foi alterado, e é o item mais delicado desta entrega.**
`models/depressao-geriatrica/` entra em `SUBARVORES_COM_ORACULO_PROPRIO` de
`tests/unit/textos/citacao.test.ts` — a segunda entrada da lista, e a primeira aberta por
quem não abriu a porta. Três coisas **não** aconteceram, e a ausência de cada uma é o que
mantém o gate de pé: `citacao-linha-de-base.json` não foi tocado, `AFASTAMENTOS_AUTORIZADOS`
não foi alargada, e a isenção continua alcançando apenas o **surgimento** de citação —
sumiço e alteração seguem reprovando, inclusive dentro da subárvore isenta.

**O catálogo cresceu por acréscimo, e três guardas o acompanharam sozinhas.** A quinta seção
entrou com diff estritamente aditivo, e por derivação a guarda geométrica passou a cobrir
oito alvos, o e2e da contribuição continuou verde e a home ganhou a ficha sem que nenhuma
lista de rotas fosse editada à mão. É a propriedade que a feature 021 instalou funcionando
pela primeira vez em rota de outra pessoa.

**Um achado mudou o change set, e a favor de mais trabalho, não de menos.** A `description`
de `pages/index.tsx` enumera as seções da plataforma, e
`tests/unit/textos/descricao-plataforma.test.ts` exige que as nomeie **todas**. A entrega
ficou vermelha até a quinta entrar. O `actions.md` não previa a ação; o oráculo previa, e foi
por isso que ele existiu.

**Um segundo achado veio da norma de redação.** A linha nova do `README.md` nasceu com
travessão separando o nome da fonte do seu publicador, no molde visual das linhas vizinhas.
`norma.test.ts` reprovou: o travessão só é lícito quando pertence ao **nome publicado**, e o
desta fonte não o traz. Reescrita com vírgula. As linhas vizinhas continuam lícitas porque
nelas o travessão está dentro do nome.

**A dívida 3 encolheu em vez de crescer.** Os literais da tela nova foram para
`scripts/textos/classes/interface-saude-do-idoso.mts`, e não para `interface.mts`, que
permanece em 684 linhas em vez de passar de 700. O agregador ganhou dois módulos, e com eles
duas dependências de **ordem**: o predicado do domínio novo precede o de `models/`, e o da
tela nova precede tanto `interface/` quanto `pages/`.

## 3. Preservadas

Regras 🟢 de `_reversa_sdd/domain.md` que a feature deixou intactas, e que ela exercita:

- **Invariante 1 — domínio puro.** O unit novo não importa framework, sistema de design nem
  biblioteca externa, não lê o relógio e não toca disco. Agora com guarda executável própria
  (`camada.test.ts`), o que reduz a dívida 1 de `architecture.md` em vez de a repetir.
- **Invariante 2 — erro esperado é valor.** `ErroDeInvariante` ficou reservado ao impossível
  por construção, e os dois caminhos que o lançam foram exercitados na função, não pela
  fachada, porque pela fachada são inalcançáveis.
- **Invariante 4 — coleta total.** Quinze itens em branco produzem quinze ofensores de uma
  vez, e nenhum caminho de erro devolve escore parcial.
- **Invariantes 5 e 7 — fonte única e referência em toda saída.** `referencias` nunca sai
  vazia, propriedade verificada por 300 execuções sorteadas.
- **Invariante 6 — o motor informa e não escolhe.** A advertência de rastreamento acompanha
  toda faixa, e a providência da fonte não ganhou limiar do produto.
- **Invariante 8 — nada é salvo e nada é enviado.** O e2e confirma zero requisição externa,
  zero busca de dado e `localStorage` com o único durável de sempre.
- **§10.1, regra 9 — invalidação por edição** nas telas de cálculo.
- **§10.1, regra 11 — ritual de revisão é exclusivo da insulina** (ADR 0012): não há checkbox
  nesta tela, e o teste de integração afirma a ausência.
- **§10.2, regra 16 — a `Moldura` é dona do enquadramento** (`MD-0029`): a folha nova não
  declara largura, recuo lateral nem centragem, e a guarda geométrica passou nos oito alvos.
- **§10.3, regra 19 — classe declarada para todo literal**: o inventariador roda sem parar,
  com 1.245 literais.
- **§10.3, regras 20 e 21 — eixo expressivo fora da prosa autoral**, com a exceção do nome
  publicado, que foi justamente o que reprovou e corrigiu a linha nova do `README.md`.
- **§11 — escopo igual ao da fonte**: a ausência de faixa etária foi respeitada em vez de
  preenchida.

## 4. Modificadas

Regras 🟢 cujo **alcance** mudou. Nenhuma foi removida, e nenhuma teve a redação alterada:

1. **A isenção do verificador de citação deixa de ter uma entrada e passa a ter duas**
   (`MD-0027`, feature 020). A porta continua estreita — nominal, com oráculo declarado, e
   restrita a surgimento —, mas deixou de ser usada só por quem a abriu.
2. **A leitura de que todo domínio clínico modela recusa deixa de valer.**
   `models/depressao-geriatrica` é o primeiro sem `ForaDoEscopoDaFonte`, e a próxima extração
   precisa registrar a exceção em vez de a tomar por omissão.
3. **A descrição da plataforma em `pages/index.tsx` passa a enumerar cinco seções.** A regra
   ("nomeia todas") não mudou; mudou o texto que ela governa, e foi o oráculo que obrigou.
4. **O mapa de classes de tela deixa de ser um só arquivo.** `interface.mts` continua
   cobrindo `interface/**`, mas já não é o único: a partição por tela começou, e com ela a
   dependência de ordem no agregador.
5. **A guarda geométrica cobre oito alvos, e não sete.** A regra é a mesma — os alvos vêm do
   catálogo —, e o crescimento se deu sem edição de lista, que é precisamente o que ela
   promete.
