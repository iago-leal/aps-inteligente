# Vigilância de regressão — feature 018-revisao-linguagem-textos

> Gerado por `/reversa-coding` em **2026-07-27**.
> O que precisa continuar verdadeiro nas próximas extrações. Cada item nasce de uma regra
> 🟢 **modificada** por esta feature (`legacy-impact.md` §4) ou de um invariante que ela
> instalou e cuja perda seria silenciosa.
>
> Os itens 🟡 e 🔴 vão para "Observações", sem peso de regressão.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo | Sinal de violação |
|---|---|---|---|---|
| W001 | `.reversa/principles.md` — princípio IX | O princípio **IX** existe, nomeia `docs/redacao.md` como sua materialização operacional, e o guia remete de volta a ele. As duas direções, não uma | presença | Princípio removido, ou remissão quebrada num dos lados. Guia sem princípio vira preferência de uma tarde; princípio sem guia vira exortação |
| W002 | `docs/redacao.md` §2 | As **três** classes de RN-01 continuam sendo três, e a classe continua vindo da **origem** do texto, jamais do diretório | redação | Quarta classe, ou regra de classificação por caminho de arquivo. Classificar por pasta erraria nas duas direções, e erraria em silêncio |
| W003 | `docs/redacao.md` §2.2 | A exceção da citação continua estreita nos **três** sentidos: só concordância, sobre lista fechada, e inseparável da declaração | redação | Exceção descrita como "corrigir o português da fonte", sem um dos três limites. Cada limite ausente a converte em licença geral |
| W004 | `docs/redacao.md` §7 | O guia continua dizendo **qual regra é verificada por teste e qual é julgamento**, e a tabela aponta o arquivo de teste de cada uma | presença | Seção 7 removida ou reduzida a lista de regras sem a separação. É ela que impede alguém de confundir "a suíte passou" com "o texto está bom" |
| W005 | `scripts/textos/classificacao.mts` — `declaracaoDe` | Literal candidato **sem classe declarada** faz o gerador **parar**, nomeando arquivo, linha e o módulo em que declarar | presença | Classe padrão, inferência por caminho, ou `catch` que segue adiante. Classe default "autoral" faria a citação ser revisada por omissão — o pior modo de falha desta feature |
| W006 | `scripts/inventariar-textos.mts` — `emitirLinhaDeBase` | O modo `--linha-de-base` **recusa sobrescrever** arquivo existente, e diz por quê | presença | Recusa removida, ou trocada por aviso. Aviso depende de alguém o ler; a recusa não depende de ninguém |
| W007 | `tests/apoio/citacao-linha-de-base.json` | O arquivo existe, tem **108** citações, e o seu `git log` mostra **um único commit** — o de 27/07/2026 | ausência | Segundo commit no arquivo. Regerada, a comparação de RF-07 passa a ser do estado corrente consigo mesmo: verde para sempre, incapaz de reprovar, e sem produzir sinal nenhum |
| W008 | `tests/unit/textos/citacao.test.ts` | A comparação contra a linha de base acusa **exatamente dois** deltas na classe citação, ambos de concordância, ambos de §2.4, ambos com `excecao: "MD-0015"` | presença | Terceiro delta, ou delta sem ficha declarada. Correção sem declaração é violação de RN-09, não cumprimento parcial dela |
| W009 | `models/puericultura/fonte-clinica.ts` — `CORTES_COMPRIMENTO` | `Comprimento adequado para idade` e `Baixo comprimento para idade` são exibidos assim; `Muito baixo comprimento para idade` permanece **como a fonte imprime** | redação | Terceiro rótulo "corrigido" — ele já concorda —, ou os dois primeiros revertidos à forma impressa sem a declaração ser removida junto |
| W010 | `models/puericultura/fonte-clinica.ts` — `NOTA_CORRECAO_DE_CONCORDANCIA` | A constante existe, é exportada, **nomeia as duas formas impressas** e é renderizada pela proveniência | presença | Constante ausente, ou presente e não renderizada. Sem ela a correção autorizada vira desvio silencioso, que é o que `MD-0015` impôs como condição para autorizá-la |
| W011 | `interface/puericultura/proveniencia.tsx` | O bloco lê **as duas** notas do domínio pelo mesmo caminho, e não escreve texto próprio | ausência | Texto escrito direto no componente. Seria a segunda fonte que RN-05 e o anti-drift daquele arquivo existem para impedir |
| W012 | `tests/unit/textos/descricao-plataforma.test.ts` | A `description` de `pages/index.tsx` **nomeia todas** as seções de `CATALOGO`, comparada contra a constante | presença | Asserção trocada por lista de seções escrita à mão no teste. A quinta seção passaria a entrar sem quebrar nada, que é como o defeito de §2.3 nasceu |
| W013 | idem | A `description` do manifesto **não enumera subconjunto próprio** das seções, e o teste **não** a obriga a enumerá-las todas | ausência | Forma positiva aplicada ao manifesto: o campo tem teto prático de comprimento e seria truncado na tela de instalação |
| W014 | `tests/unit/textos/par-duplicado.test.ts` | O subtítulo de `interface/inicio/tela.tsx` e a `description` do manifesto permanecem **idênticos** | presença | Divergência entre os dois. Revisar um lado só converte duplicação em divergência, que é o estado que RN-05 existe para impedir |
| W015 | `tests/unit/textos/manifesto.test.ts` | `name` continua `APS Inteligente` e `short_name` continua `APSi`; a `description` não passa do comprimento medido antes da revisão | presença | Marca alterada. Ela vive sob o ícone de quem instalou até a reinstalação: alterá-la renomeia o produto na tela inicial de alguém |
| W016 | `tests/unit/textos/privacidade.test.ts` | As **seis** `description` continuam afirmando que o cálculo não sai do navegador, na forma **fraca** | presença | Rota nova sem a cláusula, ou asserção endurecida para a redação exata. Congelá-la poria o RNF a vetar a revisão que a feature existe para fazer |
| W017 | `tests/unit/textos/norma.test.ts` | O verificador alcança **só a classe autoral**; citação e identificador ficam explicitamente isentos | ausência | Norma aplicada à citação. Produziria falha em texto que não se pode alterar, e a saída seria afrouxar a regra |
| W018 | `tests/unit/textos/congelamento.test.ts` | O `README.md` continua **no inventário** e **fora** do congelamento | ausência | README congelado literal a literal: toda atualização de documentação viraria atualização de oráculo (D-10) |
| W019 | `scripts/textos/classes/pages-e-arquivos.mts` — `UNIFORMES` | A declaração de classe **por arquivo** continua valendo só para o `README.md`, com a razão escrita ao lado | ausência | Arquivo de código acrescentado a `UNIFORMES`. É exatamente ali que a inferência por diretório erraria, e a porta é estreita de propósito |
| W020 | `_reversa_forward/017-.../regression-watch.md` — W022 | `W022` continua reescrito **no lugar**, com a nota de superação apontando `MD-0015` e `MD-0017`, e continua vigiando os vinte e três rótulos **mais** a declaração | presença | Item apagado, ou contornado por item novo noutro arquivo. Apagá-lo perderia a vigilância sobre a maior parte do que ele guardava |
| W021 | `models/*/validacao.ts` (cinco domínios) | Nenhuma mensagem de validação carrega **localização bibliográfica**; a `ReferenciaClinica` continua sendo o único lugar dela | ausência | `(p. NN)` ou `(Quadro N)` de volta dentro de mensagem de validação. Seria segunda fonte do que a referência já carrega |
| W022 | `e2e/axe-baseline.json` | O arquivo **não** foi alterado por esta feature, e as rotas que asseveram zero continuam em zero | ausência | Entrada nova ou valor elevado no baseline. Alterá-lo para acomodar regressão é desfazer o gate em vez de passar por ele |
| W023 | `tests/apoio/inventario-textual.json` | O gerador é **idempotente**: segunda execução deixa o `git diff` vazio, e o cabeçalho declara `geradoPor` e o aviso de não editar à mão | reprodutibilidade | Diff no JSON sem diff correspondente no gerador ou no mapa de classes — edição à mão de um arquivo gerado |
| W024 | `interface/calculadora/rotulos.ts` | Continua sendo fonte única de texto entre o painel de resultado e o plano copiável | presença | Rótulo reescrito só num dos dois consumidores. As dezessete asserções `toContain` de `formatar-plano.test.ts` são o sinal, e não quebraram nesta feature justamente porque a fonte única segurou |

## Observações (sem peso de regressão)

- **O template com interpolação fica fora do inventário, por desenho do extrator.** As
  recusas de `models/puericultura/elegibilidade.ts` e o aviso de conversão de `medidas.ts`
  são montados em tempo de execução e não existem como literal único. A revisão os alcança
  pela frente declarada por camada; o **congelamento de RF-06 não os cobre**. É limitação
  declarada, não achado — mas é onde uma reescrita futura passaria silenciosa, e vale
  ficar sabendo.
- **A régua de candidatura foi recalibrada duas vezes no mesmo dia**, e as duas pelo mesmo
  motivo: ela media o tamanho do literal, não o fato de ele ser exibido. Perdeu os rótulos
  da Caderneta em T007 e os do TeleCondutas em T015. Está em `MD-0019`, e a regra que fica é
  que **medição nova se confere contra o caso que ela deveria acusar**. Se um domínio novo
  entrar com rótulos curtos noutra posição sintática, conferir de novo.
- **Três cifras em prosa envelheceram durante esta execução** — o teto de 78 caracteres do
  contrato do manifesto (eram 81), a previsão de 270 a 320 candidatos (eram 645) e a
  contagem de verificadores do roadmap (contava quatro, eram sete). É L-13 outra vez, e o
  padrão é forte o bastante para merecer vigilância cultural: número escrito em prosa
  envelhece, e o dano não é o engano, é o verificador que nasce vermelho sobre texto sem
  defeito e ensina alguém a afrouxá-lo.
- **A revisão foi de vinte e sete literais em trezentos e quarenta e quatro**, e o número
  baixo é o resultado certo. A prosa não estava malfeita: estava sem norma. Quem reler isto
  daqui a doze meses e achar a revisão tímida deve reler a seção 1 do
  `relatorio-revisao.md` antes de reabrir o assunto.
- **`L-10` continua aberta**, e é dívida alheia a esta feature: `e2e/axe-baseline.json`
  tolera uma violação em `telaInicial` e uma em `telaComResultado`, ambas da calculadora de
  insulina. Merece ticket de manutenção próprio.
- **`L-07` e `L-11` continuam abertas**, e pertencem à re-extração nº 4: `domain.md` §7.2
  ainda descreve a prop `logoComoTitulo`, removida pelo adendo 016; `architecture.md` §5
  ainda declara 37 arquivos de teste e baseline "0/0 por rota", quando são 59 e duas
  tolerâncias.

## Histórico de re-extrações

### Re-extração 2026-07-28 23:50

> Re-extração nº 4 · 24 watch items verificados contra o SDD regenerado e contra o código.

| ID | Veredito | Observação |
|----|----------|------------|
| W001..W006, W008..W020, W022, W024 | 🟢 verde | princípio IX e `docs/redacao.md` íntegros; classe declarada e nunca inferida; a linha de base tem **108 citações e um único commit**; os dois rótulos de concordância corrigida e a `NOTA_CORRECAO_DE_CONCORDANCIA` presentes e renderizados; `axe-baseline.json` sem alteração desde a feature 014 |
| W021 | 🔴 **vermelho** | **a condição declarada não se verifica, e não por regressão.** `models/insulina/validacao.ts:179` traz localização bibliográfica dentro de mensagem de validação: “… o catálogo coberto é NPH e Regular (p. 59).”. `git log -S` mostra que a linha vem do commit de refundação `04e0493`, **anterior** à feature 018 — o watch nasceu afirmando um estado que o repositório não tinha. Triagem necessária: ou a mensagem perde a localização, ou o item passa a declarar a exceção da insulina |
| W023 | 🟡 amarelo | idempotência do inventário não reexecutada nesta sessão; `git status` limpo em `tests/apoio/inventario-textual.json` |

<!-- Preenchido pelo agente reverso quando `/reversa` rodar de novo. -->

## Arquivadas

<!-- Vazio. -->
