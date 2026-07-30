# Regression watch — 023-saude-do-idoso-gds

> Feature: `023-saude-do-idoso-gds` · Gerado por `/reversa-coding` em `2026-07-30`
> O que esta lista pede à próxima re-extração: que **reconfira**, no código de então, cada
> linha abaixo. Verde é continuar verdadeiro; vermelho é ter deixado de ser, com ou sem
> intenção. Itens 🟡 e 🔴 de origem ficam em "Observações", sem peso de regressão.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|---|---|---|---|---|
| W001 | `tests/unit/textos/citacao.test.ts`, `SUBARVORES_COM_ORACULO_PROPRIO` | A subárvore `models/depressao-geriatrica/` consta da lista, **nomeando** o oráculo que a guarda | presença | A entrada sumiu, ou passou a existir sem nomear oráculo; ou a lista virou regra genérica do tipo "arquivo novo é isento" |
| W002 | `tests/apoio/citacao-linha-de-base.json` | Permanece o congelado de 27/07, **jamais regerado** (`MD-0018`) | ausência | O arquivo mudou de tamanho ou de conteúdo, ou existe script que o reemita fora de `--linha-de-base` |
| W003 | `tests/unit/textos/citacao.test.ts`, `AFASTAMENTOS_AUTORIZADOS` | Continua com os **dois** afastamentos de `MD-0015`, e nenhum terceiro | ausência | Terceira entrada na lista, ou entrada sem ficha que a autorize |
| W004 | `models/depressao-geriatrica/tipos.ts` | O unit **não tem** `ForaDoEscopoDaFonte`, e a ausência vem declarada no cabeçalho | ausência | A variante apareceu sem que a fonte tenha passado a publicar faixa etária; ou a nota do cabeçalho sumiu, e a ausência virou aparente esquecimento |
| W005 | `models/depressao-geriatrica/fonte-clinica.ts`, `TEXTO_PROVIDENCIA` | A providência é exibida em **toda** faixa, sem nenhum número do produto decidindo quando | presença | Condicional por escore em volta da providência, ou limiar escrito em qualquer camada |
| W006 | `models/depressao-geriatrica/fonte-clinica.ts`, `TEXTO_PUBLICO_DO_INSTRUMENTO` | A prosa que diz a quem o instrumento se dirige vive no **domínio**, e a tela a lê | presença | O literal migrou para `interface/**`, ou foi duplicado lá; ou sumiu, deixando a tela sem dizer para quem a escala serve |
| W007 | `models/depressao-geriatrica/itens.ts` | Dez itens pontuam com "Sim" e cinco com "Não" — os de número 1, 5, 7, 11 e 13 | redação | Qualquer outra distribuição. A inversão de um item só já reprova, e reprova nomeando-o |
| W008 | `tests/apoio/gds-fonte-congelada.json` | O oráculo de transcrição existe, é gerado da cópia datada e é consumido por `transcricao.test.ts` | presença | O congelado sumiu, passou a ser escrito à mão, ou o teste que o consome deixou de existir |
| W009 | `interface/saude-do-idoso/formulario.tsx` | Nenhum grupo de opções nasce pré-selecionado, e não existe campo de idade | ausência | Valor padrão em qualquer item, ou campo que peça idade, ou recusa etária em qualquer camada |
| W010 | `interface/saude-do-idoso/**` | Não há ritual de revisão nesta tela (ADR 0012) | ausência | Checkbox de revisão, ou gating de qualquer ação por confirmação do prescritor |
| W011 | `interface/estilos/saude-do-idoso.css` | A folha não declara largura, recuo horizontal nem centragem do corpo (`MD-0029`) | ausência | `max-width`, `margin-inline: auto` ou `padding-inline` sobre o contêiner da tela |
| W012 | `e2e/plataforma.spec.ts` | Os alvos da guarda geométrica continuam **derivados** de `CATALOGO`, mais a home | presença | Lista de rotas escrita à mão, ou rota do catálogo excluída da varredura |
| W013 | `interface/inicio/catalogo.ts` | As sete fichas convivem, e as seis anteriores à feature 023 permanecem byte a byte | redação | Alteração de título, descrição ou rota de qualquer ficha anterior; ou reordenação |
| W014 | `pages/index.tsx`, `<meta name="description">` | A descrição da home nomeia **todas** as seções do catálogo vigente | presença | Seção do catálogo ausente da descrição. O oráculo é `descricao-plataforma.test.ts`, e foi ele que reprovou esta entrega até a correção |
| W015 | `scripts/textos/classes/interface-saude-do-idoso.mts` | O módulo existe, e os literais da tela nova **não** estão em `interface.mts` | presença | Literais de `interface/saude-do-idoso/**` declarados no módulo grande; ou `interface.mts` acima de 684 linhas por causa desta tela |
| W016 | `scripts/textos/classificacao.mts`, `MODULOS` | A ordem dos predicados mantém `models/depressao-geriatrica/` antes de `models/`, e `interface/saude-do-idoso/` antes de `interface/` e de `pages/` | presença | Reordenação. O sintoma é sutil: a mensagem de erro do inventariador passa a mandar declarar o literal no módulo errado |
| W017 | `models/depressao-geriatrica/**` | O domínio permanece puro: sem framework, sem relógio, sem disco, sem importe de fora de `models/` | ausência | Qualquer importe não relativo, menção a React/Next/sistema de design, `Date.now()` ou leitura de arquivo |
| W018 | `models/depressao-geriatrica/classificacao.ts` | As três faixas cobrem 0 a 15 com limites inclusivos, sem buraco nem sobreposição | presença | Faixa que comece antes do fim da anterior, ou escore sem faixa. A varredura exaustiva dos dezesseis valores é o que o prova |

## Observações

Sem peso de regressão. Origem 🟡, ou fatos da execução que a próxima leitura precisa
conhecer para não os tomar por defeito:

- **O-023-01 (🟡).** A conferência de que a **página publicada** continua igual à cópia
  datada é **manual** (`MD-0039`). O oráculo de W008 compara o produto contra a cópia, e
  nunca a cópia contra a fonte viva. Confundir os dois é o modo natural de a dívida sumir de
  vista.
- **O-023-02 (🟡).** `TEXTO_PUBLICO_DO_INSTRUMENTO` carrega sozinho o papel que noutras telas
  é de uma regra de recusa. Não há ofensor que barre a aplicação fora do público previsto, e
  isso é contrapartida assumida de não inventar fronteira que a fonte não tem.
- **O-023-03.** Cobertura do unit novo: 95,45% de instruções e 97,61% de linhas, com **87,5%
  de ramos**. O ramo descoberto é o `throw` de "resultado sem referência clínica", inalcançável
  pela fachada — o mesmo padrão que `models/cardiopatia-isquemica/calculadora.ts:76` já traz.
  O limiar de 90% do `vitest.config.ts` é global e passa (95,02% de ramos).
- **O-023-04.** Dois achados de execução alteraram o change set previsto, ambos por oráculo
  que já existia: a descrição da home (W014) e o travessão da linha nova do `README.md`, que
  `norma.test.ts` reprovou por não pertencer ao nome publicado da fonte.
- **O-023-05.** `prettier --check .` reprova 655 arquivos no repositório inteiro, e não
  apenas o `README.md` da dívida 10. Os arquivos novos desta feature nascem formatados; a
  reformatação que o Prettier propôs em três arquivos **existentes** foi desfeita de
  propósito, para manter o diff de `catalogo.ts` estritamente aditivo e não misturar ruído de
  estilo com a entrega.
- **O-023-06.** T033 (conferência clínica e aval estético) e T034 (registro do desfecho)
  permanecem `[ ]`: dependem de pessoa, e marcar como feito o que ninguém conferiu seria
  transformar o gate em formalidade.

## Histórico de re-extrações

_(vazio: será preenchido pelo agente reverso na próxima execução de `/reversa`)_

## Arquivadas

_(vazio)_
