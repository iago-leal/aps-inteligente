# Requirements: A ficha de consulta encaixa na coluna do corpo

> Identificador: `021-coluna-da-ficha-de-consulta`
> Data: `2026-07-28`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A tela `/puericultura/consulta`, entregue pela feature 020, apresenta o corpo **colado nas
duas bordas da janela**: o aviso de não persistência, a identificação da consulta e o bloco de
proveniência começam no pixel zero e o texto vai até a borda oposta, enquanto o cabeçalho
logo acima respeita a coluna centrada que as outras cinco telas usam. A feature corrige o
enquadramento — e só ele. Nenhuma regra clínica, nenhum campo, nenhum texto e nenhuma rota
mudam. A entrega também fecha a razão de o defeito ter passado: a guarda geométrica que existe
desde a feature 013 para exatamente este problema mede uma rota fixa, e a rota nova nasceu
fora do alcance dela.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#interface/estilos` | A camada de estilo é cola de layout sobre tokens Primer; cada tela nova pode ganhar folha própria, e `globais.css` guarda o que é comum às calculadoras | 🟢 |
| `_reversa_sdd/addenda/013-cabecalho-proporcoes.md` (vigente) | O cabeçalho da variante `padrao` foi **calibrado contra a coluna do corpo**: `padding: 44px max(32px, calc(50% - 558px)) 36px`, onde 558px é metade de 1180 menos o recuo. O alinhamento do cabeçalho **depende** de o corpo estar naquela coluna | 🟢 |
| `_reversa_sdd/addenda/015-cabecalho-unificado.md` (vigente) | O alinhamento vertical do cabeçalho virou regra-única em `cabecalho.css`, válida para as duas variantes, apoiada na invariante de logo de 34px da 013 | 🟢 |
| `interface/estilos/globais.css`, `.calc-regioes` | `max-width: 1180px; margin: 0 auto; padding: 28px 32px 56px`, mais grade de duas colunas e o recuo reduzido a `20px 16px 40px` abaixo do ponto de quebra | 🟢 |
| `interface/estilos/consulta-puericultura.css`, `.consulta-regioes` | Declarada na feature 020 com **apenas** `display: flex`, `flex-direction: column` e `gap`. Sem largura máxima, sem centralização e sem recuo lateral: é a causa direta do defeito | 🟢 |
| `interface/estilos/globais.css`, `.pagina` | Dá cor de fundo e altura mínima, e **nenhum recuo**. Logo, o recuo lateral do corpo vem inteiramente da classe de regiões de cada tela | 🟢 |
| `interface/estilos/contribuicao.css`, `.contribuicao-bloco` | `max-width: 720px; margin: 0 auto; padding: 0 32px 64px`: o bloco de apoio da feature 019 declara a coluna da home por conta própria, e `interface/inicio/tela.tsx:58` o põe dentro da mesma `Moldura`. É o terceiro declarante da coluna, e o único que a leitura inicial não viu | 🟢 |
| `e2e/plataforma.spec.ts` (T002 da 013) | A guarda geométrica afere o encaixe do cabeçalho na coluna do corpo em **`/dm2/insulina`**, medindo `.calc-regioes`. Não parametriza rota nem classe | 🟢 |
| `_reversa_sdd/addenda/017-puericultura-crescimento.md` (vigente) | A tela irmã (`/puericultura/crescimento`) usa `.calc-regioes` como as demais, e é por isso que ela não apresenta o defeito | 🟢 |
| `_reversa_forward/020-consulta-puericultura-soap/regression-watch.md` | Quinze watch items da 020, nenhum deles sobre enquadramento; a feature verificou acessibilidade, privacidade e bundle, e não geometria | 🟢 |
| `.reversa/principles.md#VII` | Testes em dois papéis: validação e regressão. A guarda de 013 é de regressão e falhou em regredir porque nasceu presa a uma rota | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico de família na consulta | Percorrer a ficha sem que a leitura custe esforço | Abre a ficha no computador do consultório e lê linhas que atravessam a tela inteira, com o olho perdendo a linha na volta |
| Médico em telefone | Preencher a ficha à beira do leito | Abre a ficha no celular e vê o texto encostado nas bordas, sem a margem que as outras telas dão |
| Mantenedor | Que uma tela nova não repita um defeito já corrigido | Acrescenta a sétima calculadora e quer que a guarda geométrica a alcance sem que ele precise lembrar de estendê-la |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O corpo de **toda** tela de calculadora ocupa a mesma coluna centrada — largura máxima de 1180px, recuo lateral de 32px em viewport largo e 16px abaixo do ponto de quebra. A coluna não é preferência estética: é a referência contra a qual o cabeçalho foi calibrado na feature 013, e uma tela cujo corpo saia dela **desalinha o próprio cabeçalho**, que é o defeito visível hoje. 🟢
   - Origem no legado: `_reversa_sdd/addenda/013-cabecalho-proporcoes.md`
   - Tipo: alterada — a regra existia de fato desde a 013, mas valia por repetição da classe `.calc-regioes`, e não por enunciado. Ela passa a valer por enunciado.
2. **RN-01b:** A sede da coluna é o `<main>` da `Moldura`, governado por `data-apresentacao`, e o que ali vive é **só o eixo horizontal**: largura máxima, centralização e recuo lateral. O eixo vertical continua na folha de cada tela, porque varia com legitimidade (`.calc-regioes` usa `28px … 56px`; a home, `40px … 64px`). O par cabeçalho-corpo já é calibrado por variante em CSS, com `calc(50% - 558px)` na variante `padrao` e `calc(50% - 328px)` na `destaque`; o que faltava era o corpo obedecer à mesma chave em vez de obedecer por coincidência de nome de classe. 🟢
   - Origem no legado: `interface/comum/moldura.tsx:115` (o `<main>` comum), `interface/estilos/cabecalho.css`, `interface/estilos/inicio.css`
   - Tipo: nova — decisão da sessão de esclarecimento; ver `MD-0029`
   - **Corolário, e ele é obrigação e não consequência opcional:** quem declarava a coluna deixa de declará-la, sob pena de a coluna existir duas vezes, aninhada. São **três** os declarantes, e não dois: `.calc-regioes` (`globais.css:33`), `.inicio-secoes` (`inicio.css:34`) e `.contribuicao-bloco` (`contribuicao.css:22`), este último dentro do mesmo `<main>` por `interface/inicio/tela.tsx:58`. As três perdem `max-width`, a centralização e o recuo lateral, e conservam o recuo vertical em `padding-block`. O terceiro declarante foi apurado na auditoria de 2026-07-28, e sem ele o bloco de apoio da home ficaria com recuo lateral dobrado dentro de coluna aninhada — defeito que a guarda geométrica, por medir o `<main>`, não veria
2. **RN-02:** A coluna é a mesma; a **disposição interna** não precisa ser. `.calc-regioes` organiza formulário e painel em duas colunas, arranjo que a ficha de consulta não tem — ela é uma sequência vertical de regiões. A correção iguala o enquadramento sem impor o arranjo. 🟢
   - Tipo: nova
3. **RN-03:** Esta feature é **só apresentação**. Nenhum arquivo de `models/`, nenhum campo de ficha, nenhum rótulo, nenhuma entrada de catálogo e nenhuma rota mudam. O DOM semântico — regiões, cabeçalhos, `fieldset`/`legend` — permanece como está, porque é dele que depende a baseline `axe` em zero. 🟢
   - Origem no legado: `_reversa_sdd/adrs/0003` (domínio puro), addendum 020
   - Tipo: nova
4. **RN-04:** A guarda geométrica de regressão deixa de medir uma rota fixa e passa a alcançar **todas as telas de calculadora**, incluindo as que ainda não existem. Uma guarda que exige ser lembrada a cada tela nova não é guarda de regressão: é lista de verificação manual com aparência de teste. A generalização se faz por duas trocas, e nenhuma delas é lista escrita à mão: as rotas vêm de `interface/inicio/catalogo.ts`, que já é fonte única anti-drift por D-07, e o alvo da medição passa a ser o `<main>` de RN-01b, que existe em toda tela por construção. O `GUTTER = 32` chumbado em `e2e/plataforma.spec.ts:378` sai junto, lido do estilo computado. 🟢
   - Origem no legado: `e2e/plataforma.spec.ts` (T002 da 013), `interface/inicio/catalogo.ts` (D-07), `.reversa/principles.md#VII`
   - Tipo: alterada — o catálogo é **lido**, jamais escrito, de modo que RF-09 permanece satisfeito; ver `MD-0029`
   - A home entra como **sétimo caso**, à parte da lista derivada: ela não é calculadora e o catálogo não a declara, mas é a única tela da variante `destaque` e a que perde `max-width` em duas folhas de uma vez. Deixá-la fora da guarda seria confiar a invariância da variante inteira à inspeção visual
5. **RN-05:** O texto do registro em SOAP, que é monoespaçado e pode conter linhas longas, permanece contido na coluna: ele quebra dentro do bloco em vez de esticá-lo. A regra já está no CSS da 020 (`white-space: pre-wrap`, `overflow-wrap: anywhere`) e passa a ser verificada, porque sem coluna ela nunca foi exercitada. 🟢
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | O corpo de `/puericultura/consulta` encaixa na coluna centrada, alinhado ao cabeçalho nas duas bordas | Must | Em viewport de 1280px, a borda esquerda do conteúdo coincide com a da identidade do cabeçalho, e a direita com a da barra de ações, dentro de 2px — a mesma tolerância da guarda da 013 | 🟢 |
| RF-02 | Em viewport de telefone, o recuo lateral é o das demais telas | Must | Em 375px de largura, nenhum texto encosta na borda; o recuo é o mesmo de `/puericultura/crescimento`, medido no roteiro e2e | 🟢 |
| RF-03 | A guarda geométrica passa a alcançar a rota nova | Must | O roteiro que hoje mede `/dm2/insulina` passa a percorrer **sete casos** — as seis rotas que o catálogo declarar, mais `/` na variante `destaque`, que o catálogo não declara —, medindo o `<main>` em cada um; removida a correção do CSS, ele **reprova** nomeando `/puericultura/consulta` | 🟢 |
| RF-04 | As cinco telas anteriores permanecem visualmente idênticas | Must | Invariância verificada, e não ausência de diff: nenhuma das cinco muda de largura, de recuo ou de arranjo, o que a guarda geométrica afere nas duas bordas e a suíte e2e confirma no comportamento. As folhas que a feature altera são **nomeadas e esperadas**: `globais.css`, `inicio.css` e `contribuicao.css` perdem as propriedades horizontais por RN-01b, e `consulta-puericultura.css` muda só o piso do `minmax` por RF-08. Permanecem sem diff `puericultura.css`, `cardiologia.css` e `risco-cardiovascular.css`. A promessa de "sem alteração de asserção" vale para os roteiros de comportamento das cinco telas e **exclui nominalmente a guarda geométrica**, que é objeto de RF-03 | 🟢 |
| RF-05 | O texto do registro em SOAP não estoura a coluna | Must | Com a ficha do 1.º Mês inteira preenchida, o bloco do registro não produz rolagem horizontal na página em 1280px nem em 375px | 🟢 |
| RF-06 | A baseline de acessibilidade permanece intocada | Must | `e2e/axe-baseline.json` sem diff; a varredura da rota nova continua em zero violação | 🟢 |
| RF-07 | Nenhum literal novo escapa do inventário textual | Must | `node scripts/inventariar-textos.mts --gerar` conclui sem candidato órfão e a segunda execução deixa `git diff` vazio | 🟢 |
| RF-08 | A identificação da consulta cabe em três colunas dentro da coluna corrigida | Should | `.consulta-identificacao` continua com `auto-fit`, e o piso do `minmax` sobe de `12rem` para cerca de `22rem`, de modo que em 1280px a faixa comporte três campos e no telefone comporte um. Nenhuma media query nova, nenhum `repeat(3, 1fr)` chumbado | 🟢 |
| RF-08b | A grade das seções da ficha permanece como está | Won't | `.consulta-ficha` mantém `auto-fit, minmax(20rem, 1fr)`, o que dentro da coluna produz duas colunas de seções. As seções são numeradas na tela, e a leitura em Z de uma grade numerada não desfaz a ordem impressa. **Verificado por guarda de escopo**, e não pela leitura do revisor: o diff de `consulta-puericultura.css` restringe-se à linha do `minmax` de `.consulta-identificacao` | 🟢 |
| RF-09 | Nenhum motor, catálogo ou contrato externo muda | Must | `git diff` vazio em `models/`, `interface/inicio/catalogo.ts` e `pages/api/`; a suíte de unidade passa sem alteração de asserção | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Manutenibilidade | A coluna do corpo deixa de ser propriedade repetida em cada folha e passa a ter **um lugar** de onde as telas a herdam, que é o `<main>` da `Moldura` | O defeito de hoje nasceu de a sexta tela ter reescrito do zero o que as cinco anteriores herdavam por acidente de nome de classe. Na `Moldura`, a sétima tela nasce enquadrada por construção, sem depender de memória; e a tela deixa de saber que existe largura de coluna, sabendo só como dispõe o que é seu por dentro, que é RN-02 cumprida na estrutura e não apenas no texto | 🟢 |
| Verificabilidade | A guarda de enquadramento percorre a lista de rotas em vez de nomear uma | Princípio VII; a guarda de 013 existia e não pegou este defeito, o que é o argumento empírico | 🟢 |
| Desempenho | Custo de bundle desprezível: a feature é CSS | A medição da 020 fica como linha de base; delta esperado abaixo de 1 kB gzip por rota | 🟢 |
| Acessibilidade | Nenhuma mudança de DOM, papéis ou nomes acessíveis | A baseline em zero da 020 depende da semântica atual, e mexer nela nesta feature confundiria as duas coisas | 🟢 |
| Escopo negativo | Nenhuma revisão de texto, de rótulo ou de conteúdo clínico | A 020 acabou de passar pelo portão textual; reabrir texto aqui misturaria correção de layout com revisão de redação | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: o corpo encaixa na coluna do cabeçalho
  Dado que abro /puericultura/consulta numa janela de 1280 pixels
  Quando comparo a borda esquerda do conteúdo com a da identidade do cabeçalho
  Então elas coincidem dentro de dois pixels
  E a borda direita do conteúdo coincide com a da barra de ações, na mesma tolerância

Cenário: a ficha respira no telefone
  Dado que abro /puericultura/consulta numa janela de 375 pixels
  Então nenhum texto encosta nas bordas da janela
  E a página não rola horizontalmente

Cenário: o registro longo não estoura a coluna
  Dado que preencho a ficha do 1º Mês por inteiro
  Quando leio o bloco do registro em SOAP
  Então o texto quebra dentro do bloco
  E a página continua sem rolagem horizontal

Cenário: a guarda alcança a tela nova
  Dado que desfaço a correção do enquadramento
  Quando rodo o roteiro de ponta a ponta
  Então ele reprova nomeando a rota /puericultura/consulta

Cenário: a guarda cobre a plataforma inteira, e não uma lista escrita à mão
  Dado que a correção está aplicada
  Quando rodo a guarda geométrica
  Então ela afere as seis rotas que o catálogo declara
  E afere também a home, na variante destaque, contra a coluna de 720 pixels

Cenário: as telas anteriores não se movem
  Dado que a feature está pronta para commit
  Quando rodo a suíte inteira e a varredura de acessibilidade
  Então as cinco calculadoras anteriores passam sem alteração de asserção, excetuada a guarda geométrica
  E nenhuma delas muda de largura, de recuo ou de arranjo
  E a linha de base de acessibilidade continua intocada
  E nenhum arquivo de models, do catálogo ou de contrato externo aparece no diff
  E o diff de consulta-puericultura.css restringe-se ao piso do minmax da identificação
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01, RF-02 | Must | São a feature: a tela está com o defeito à vista de quem a abre |
| RF-03 | Must | Sem isto a correção vale para hoje e a sétima tela repete o erro. É o que separa consertar de resolver |
| RF-04, RF-06, RF-09 | Must | Obrigações que a plataforma já assumiu e que uma correção de layout não pode revogar |
| RF-05 | Must | O registro é a saída principal da 020; texto que estoura a coluna estraga a conferência antes da cópia |
| RF-07 | Must | O portão textual da 018 vale para toda feature, ainda que esta não pretenda acrescentar texto |
| RF-08 | Should | Melhora a leitura sem custar media query nova; a feature entregaria o essencial mesmo sem ela |
| RF-08b | Won't | Mexer na grade das seções ampliaria o diff sem que o uso tenha mostrado necessidade. A mudança, se vier, é de uma linha, e não terá arrastado o resto da feature consigo |
| Revisão de texto ou de conteúdo clínico | Won't | Escopo negativo declarado: a 020 acabou de passar pelo portão textual |
| Alteração de DOM, papéis ou nomes acessíveis | Won't | A baseline em zero depende da semântica atual. A introdução da coluna no `<main>` de RN-01b é mudança de folha de estilo sobre elemento que já existe, e não acréscimo de elemento |
| Extração da coluna para as seis telas de uma vez | Must | Decidida na sessão de esclarecimento: a coluna sobe para o `<main>` da `Moldura` (RN-01b). Deixou de ser lacuna. A auditoria acrescentou o alcance real: três folhas cedem a coluna, e a guarda afere sete casos, com a home |
| Correção do conteúdo do registro ou do gating da tela da 020 | Won't | Três queixas de uso apareceram nesta sessão: a vacinação na avaliação, as notas de proveniência dentro do texto copiado e o seletor de ficha travado até a data de nascimento. As três são da feature 020 e mexem em regra, em contrato ou em fluxo, não em enquadramento. Ver a seção de lacunas |

## 9. Esclarecimentos

### Sessão 2026-07-28

- **Q:** Escopo da correção: pontual ou estrutural?
  **R:** Estrutural, e num lugar que nenhuma das opções oferecidas previa. A apuração do
  código durante a sessão mostrou que a `Moldura` já envolve o corpo de toda tela num
  `<main>` (`interface/comum/moldura.tsx:115`) e já carrega a chave que distingue os dois
  enquadramentos, `data-apresentacao`. O cabeçalho, por sua vez, já é calibrado por essa mesma
  chave, com `calc(50% - 558px)` na variante `padrao` e `calc(50% - 328px)` na `destaque`.
  A coluna sobe para o `<main>`, e ali fica só o eixo horizontal. O token compartilhado, que
  fora a proposta inicial, ainda exigiria que cada folha nova lembrasse de consumi-lo, o que
  é a mesma armadilha com outro nome. Ver RN-01b e `MD-0029`.
- **Q:** A ficha longa merece a mesma largura das demais telas?
  **R:** Não; permanece nos 1180px de todas. Divergir custaria uma terceira calibração de
  cabeçalho, ou seja, mais um `max()` em `cabecalho.css` e mais um caso na guarda, sem
  evidência de uso que a justifique. O caminho de volta fica barato justamente pela decisão
  anterior: se a ficha em uso pedir mais largura, nasce uma variante de `apresentacao`, com o
  par calibrado num lugar só.
- **Q:** A identificação da consulta deve continuar em cinco colunas?
  **R:** Três, obtidas subindo o piso do `minmax` de `12rem` para cerca de `22rem`, e não por
  `repeat(3, 1fr)` chumbado, que obrigaria a media query de acompanhamento. A regra continua
  sendo uma linha declarativa, e o telefone continua resolvendo sozinho. Ver RF-08.
- **Q:** Como a guarda geométrica alcança todas as telas de calculadora?
  **R:** Derivada do catálogo, com o alvo em `<main>`. O catálogo já é fonte única anti-drift
  por D-07, e o teste passa a lê-lo em vez de nomear rotas. Com a coluna no `<main>`, a guarda
  mede um seletor que existe em toda tela por construção, e não o `.calc-regioes` de hoje, que
  é justamente o seletor que a rota nova não tinha. Pela ordem do TDD, é a primeira ação da
  feature: escrever a guarda, vê-la reprovar em `/puericultura/consulta` e passar nas cinco
  demais, e só então mexer no CSS. Ver RN-04 e RF-03.
- **Q:** A grade das seções da ficha deve mudar?
  **R:** Não. Ficam as duas colunas que `auto-fit, minmax(20rem, 1fr)` produz. O argumento é
  de escopo, e não de estética: a feature ganha em ser exatamente o que promete ser, o que
  torna a revisão do diff barata e o watch da regressão curto. Ver RF-08b.

### Sessão 2026-07-28, após a auditoria

Esta segunda sessão não nasceu de `[DÚVIDA]`, e sim dos achados do `audit/cross-check.md`. A
causa comum dos três achados de severidade alta é uma só: RF-04 foi redigido quando a correção
prevista ainda era pontual, e a sessão anterior mudou a solução de lugar sem reconciliar o
critério de aceite.

- **Q:** Como tratar `.contribuicao-bloco`, terceiro declarante da coluna, que a leitura inicial
  não viu?
  **R:** Subtrair as três propriedades horizontais, como em `.inicio-secoes`: o bloco herda a
  coluna do `<main>` e conserva o recuo vertical em `padding-block`. É o que RN-01b implica, e
  não uma exceção a ela. Sem isso, o bloco de apoio da home ficaria com recuo lateral dobrado
  dentro de coluna aninhada, defeito que a guarda, por medir o `<main>`, não veria. Ver o
  corolário de RN-01b.
- **Q:** O que RF-04 deve afirmar, já que "nenhum diff" contradiz a solução?
  **R:** Invariância visual e comportamental, verificada, com as folhas alteradas nomeadas no
  próprio requisito. Ausência de diff é proxy, e proxy que aqui aponta para o lado errado: quem
  o aplicasse ao pé da letra concluiria que a feature falhou justamente onde acertou. Três
  folhas mudam por RN-01b e uma por RF-08; três permanecem intocadas e continuam nomeadas.
- **Q:** RF-03 manda reescrever a guarda que RF-04 manda não alterar. Onde fica o limite?
  **R:** RF-04 exclui nominalmente a guarda geométrica, que é objeto de RF-03. A promessa de
  "sem alteração de asserção" passa a valer para os roteiros de comportamento das cinco telas,
  que é o que ela sempre quis dizer.
- **Q:** A home entra na cobertura da guarda?
  **R:** Sim, como sétimo caso, à parte da lista derivada do catálogo. Ela é a única tela da
  variante `destaque` e a que perde `max-width` em duas folhas de uma vez. Ver RN-04 e RF-03.
- **Q:** Quem verifica que `consulta-puericultura.css` só muda no piso do `minmax`?
  **R:** Uma guarda de escopo, e não a leitura do revisor. O critério entra em RF-08b e no
  último cenário de aceite: o diff daquela folha restringe-se à linha do `minmax` de
  `.consulta-identificacao`.

Fica registrado, por ser matéria de sequência e não de requisito: os adendos das features 019 e
020 continuam pendentes de `/reversa-sync`, e é por isso que RN-03 e o roadmap citam um "adendo
020" que ainda não existe em `_reversa_sdd/addenda/`. A rastreabilidade se fecha rodando os
dois, com o da 021 na sequência.

## 10. Lacunas

As três dúvidas de escopo foram resolvidas na sessão de 2026-07-28, e nenhum `[DÚVIDA]` resta
nesta feature. Ficam registradas duas questões que o uso levantou **fora** deste escopo:

- 🟡 **A avaliação do registro e a vacinação (feature 020).** Apurado nesta sessão, com o
  domínio exercitado: nove das dez fichas trazem `vacinas` em `A`, e o item aparece na
  avaliação assim que respondido, com o rótulo impresso da fonte e o valor `Sim` ou `Não`. A
  exceção é a **1ª Semana**, única ficha **sem campo algum em `A`**: ali a caderneta imprime
  Hepatite B e BCG, que `MD-0028` põe em `O` por serem constatação de conferência. Se o
  esperado é a avaliação dizer que a vacinação está adequada ou inadequada, a mudança é de
  regra, não de layout, e cabe à 020.
- 🟡 **As notas de proveniência dentro do texto copiado (feature 020).** O comportamento é a
  regra 7 do contrato `interfaces/registro-soap.md`, e portanto foi pedido pela spec, não é
  defeito. O que o uso mostrou é que a tela já exibe as mesmas três notas e a mesma linha de
  fonte no bloco `ProvenienciaDaConsulta`, de modo que dentro do registro elas são repetição.
  Mudar isso é emendar o contrato, e a emenda pede feature própria.
- 🔴 **O seletor de ficha só existe depois da data de nascimento (feature 020).** Apurado nesta
  sessão: `SeletorDeFicha` já trata `fichaSugerida: null` e funciona sem sugestão alguma
  (`interface/puericultura/consulta/seletor-de-ficha.tsx:55`); quem o esconde é o contêiner, que
  condiciona o bloco inteiro a `contexto !== null` (`app.tsx:170`), e o contexto exige sexo e as
  duas datas. Mais que divergência de expectativa, é **divergência interna**: o comentário de
  `app.tsx:118` promete que "a tela continua utilizável com a ficha que o usuário escolher
  (ADR 0004)", e o JSX três linhas abaixo não entrega isso. Destravar pede decidir o que fazer
  sem sexo, de que depende a flexão dos rótulos, e sem idade, de que depende a linha de idade
  declarada do registro. É feature, não ajuste de layout.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial gerada por `/reversa-requirements`, a partir da captura da tela e da apuração da causa em `interface/estilos/` e `e2e/plataforma.spec.ts` | reversa |
| 2026-07-28 | `/reversa-clarify`: as três dúvidas de escopo resolvidas e mais duas questões arbitradas. RN-01b e RF-08b nascem da sessão; RN-04, RF-03, RF-08 e o requisito de manutenibilidade sobem a 🟢. Decisão de arquitetura registrada em `MD-0029` | reversa |
| 2026-07-28 | `/reversa-clarify`, segunda sessão, sobre os achados de `audit/cross-check.md`: RN-01b ganha o corolário dos três declarantes da coluna, com `.contribuicao-bloco` incorporado; RF-04 passa de ausência de diff a invariância verificada, com as folhas alteradas nomeadas e a guarda geométrica excluída nominalmente; RF-03 e RN-04 passam a sete casos, com a home; RF-08b ganha guarda de escopo. Dois cenários de aceite acrescentados, um reescrito, e uma linha nova na tabela de contexto do legado | reversa |
