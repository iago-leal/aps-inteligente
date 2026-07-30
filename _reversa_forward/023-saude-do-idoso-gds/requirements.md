# Requirements: Saúde do idoso — Escala de Depressão Geriátrica (GDS)

> Identificador: `023-saude-do-idoso-gds`
> Data: `2026-07-30`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A plataforma ganha a sua **quinta seção** e a **sétima calculadora**: rastreamento de
depressão na pessoa idosa pela Escala de Depressão Geriátrica em quinze itens, na
redação que o portal Linhas de Cuidado do Ministério da Saúde publica, sob a rota
`/saude-do-idoso/...`. O prescritor responde aos itens da escala com a pessoa idosa
diante de si, e a tela devolve o escore, a faixa que a fonte nomeia e a referência
bibliográfica que a sustenta, sem que nenhum dado saia do navegador. O sexto domínio
clínico nasce no molde já assentado da plataforma: fonte única, erros como valores,
recusa honesta fora do escopo e o motor informando sem escolher. É a primeira
calculadora dirigida à pessoa idosa e a primeira cujo insumo é inteiramente um
questionário respondido pelo paciente, e não uma medida aferida pelo profissional.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#1-estilo-arquitetural` | Cinco camadas com dependência unidirecional; a tabela de invariantes declara o **alcance** de cada linha, e unit clínico novo herda as seis linhas de alcance clínico (fonte única, `ReferenciaClinica`, constantes congeladas, escopo igual à fonte) | 🟢 |
| `_reversa_sdd/architecture.md#5-qualidade-e-testes` | A guarda geométrica percorre as rotas que o `CATALOGO` declarar: **calculadora nova cai sob a guarda ao entrar no catálogo**; e2e com `axe` em zero por asserção direta | 🟢 |
| `_reversa_sdd/domain.md#10-invariantes-transversais` | Os oito invariantes da família e o alcance de cada um; domínio puro, erro como valor, coleta total de ofensores, o motor informa e não escolhe | 🟢 |
| `_reversa_sdd/domain.md#101-regras-da-interface-com-força-de-domínio` | Invalidação por edição vale nas cinco telas de cálculo; ritual de revisão é exclusivo da insulina (ADR 0012); a UI espelha as faixas do domínio sem segunda fonte de números | 🟢 |
| `_reversa_sdd/domain.md#102-regras-da-interface-com-força-de-navegação-e-enquadramento` | `comInicio` nas calculadoras; a `Moldura` é dona do enquadramento horizontal (`MD-0029`), e **quem declarava a coluna deixa de declará-la** | 🟢 |
| `_reversa_sdd/domain.md#103-a-norma-de-redação` | Todo literal exibido tem classe declarada em `scripts/textos/classes/`; a citação é byte a byte; o eixo expressivo fica fora da prosa autoral (`MD-0020`), salvo o nome publicado da fonte (`MD-0021`) | 🟢 |
| `_reversa_sdd/domain.md#11-fronteiras-de-escopo` | Recusa por design quando o caso é plausível mas não coberto pelo guia; a idade fora da faixa da fonte produz `ForaDoEscopoDaFonte`, sem estimativa | 🟢 |
| `_reversa_sdd/code-analysis.md#módulo-3--modelscardiopatia-isquemica` | Molde mais próximo desta feature: questionário booleano, contagem, faixa nomeada e conduta; matriz congelada e recusa fora de 30–69 anos | 🟢 |
| `_reversa_sdd/code-analysis.md#módulo-16--interfaceinicio` | `catalogo.ts` é fonte única das seções e **oráculo da descrição da plataforma**; diff aditivo aferido por lista ordenada exaustiva; `icones.tsx` mapeia `id → Octicon` com fallback `null` | 🟢 |
| `_reversa_sdd/code-analysis.md#módulo-18--pages` | Cada rota é casca `<Head>` + tela; os metadados seguem o separador único e a caixa de frase fixados na feature 018 | 🟢 |
| `_reversa_sdd/inventory.md#fontes-clínicas-versionadas` | `referencias/` guarda as fontes primárias fora do bundle. A fonte desta feature entrou em 30/07/2026 como **cópia datada da página**, e não como PDF: `referencias/saude-do-idoso/escala-de-depressao-geriatrica-linhas-de-cuidado-ms-20260730.html`, `sha256` `bb74f9bc285f9ae2d235cf41d42e6ac04691dfe617f2ecff3fe4fdf4e04802ef` | 🟢 |
| Fonte clínica: *Escala de Depressão Geriátrica (GDS)*, Linhas de Cuidado, Ministério da Saúde, `https://linhasdecuidado.saude.gov.br/portal/tabagismo/escala-depressao-geriatrica/` | Quinze itens, chave de pontuação por destaque na tabela, três faixas de resultado, providência recomendada e as duas referências bibliográficas que a página cita | 🟢 |
| `_reversa_sdd/adrs/` (0001, 0002, 0003, 0004, 0005, 0009, 0011, 0012, 0019, 0021) | Referência clínica em toda saída, privacidade por construção, domínio puro, erro como valor, o motor informa, escopo igual à fonte, uma fonte por unit, ritual só na insulina, norma de redação, enquadramento na `Moldura` | 🟢 |
| `_reversa_sdd/addenda/bug-BUG-20260728-ZAHV-v001.md` | Único adendo vigente; a proveniência se declara na tela e não viaja no texto emitido (`MD-0035`). Alcança esta feature **se** ela emitir texto para o prontuário | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico de família na APS | Rastrear sintomas depressivos em consulta de rotina da pessoa idosa | Aplica a escala item a item durante a consulta e lê o escore com a faixa que a fonte nomeia, para decidir a conduta |
| Médico de família na APS | Reaplicar a escala em seguimento | Repete o instrumento meses depois e compara o escore com o anterior, que ele mesmo registrou no prontuário |
| Médico plantonista ou recém-formado | Aplicar um instrumento que não domina de cor | Confere na tela a redação exata dos itens e o corte, com a referência bibliográfica à vista, sem recorrer a memória |

Frequência esperada: uso pontual por consulta, sem sessão, sem histórico e sem retorno
à plataforma; o registro do resultado é do prontuário, não daqui (ADR 0002).

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O sexto domínio clínico nasce como unit próprio de `models/`, com **uma
   fonte única** declarada em `fonte-clinica.ts` e catálogo `REFERENCIAS` congelado por
   `Object.freeze`. Nenhuma constante da escala é escrita fora desse arquivo. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#10-invariantes-transversais` (invariantes 5 e 7; ADR 0001/0011)
   - Tipo: nova
2. **RN-02:** Os itens da escala, a chave de pontuação de cada item e os cortes são
   **transcrição fiel da fonte**, na classe **citação**, byte a byte, inclusive a grafia
   com desdobramento de gênero entre parênteses que a fonte adota. Nenhum item é reescrito
   por estilo, e nenhuma pontuação é importada de outra publicação da escala. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#103-a-norma-de-redação` (regras 19 e 20; princípio IX)
   - Tipo: nova. Os quinze itens, na redação da fonte, com a resposta que pontua:

   | # | Item | Pontua |
   |---|---|---|
   | 1 | Está satisfeito(a) com sua vida? | Não |
   | 2 | Interrompeu muitas de suas atividades? | Sim |
   | 3 | Acha sua vida vazia? | Sim |
   | 4 | Aborrece-se com frequência? | Sim |
   | 5 | Sente-se bem com a vida na maior parte do tempo? | Não |
   | 6 | Teme que algo ruim lhe aconteça? | Sim |
   | 7 | Sente-se alegre a maior parte do tempo? | Não |
   | 8 | Sente-se desamparado com frequência? | Sim |
   | 9 | Prefere ficar em casa a sair e fazer coisas novas? | Sim |
   | 10 | Acha que tem mais problemas de memória que outras pessoas? | Sim |
   | 11 | Acha que é maravilhoso estar vivo(a)? | Não |
   | 12 | Sente-se inútil? | Sim |
   | 13 | Sente-se cheio(a) de energia? | Não |
   | 14 | Sente-se sem esperança? | Sim |
   | 15 | Acha que os outros têm mais sorte que você? | Sim |
3. **RN-03:** O escore é a **soma dos itens pontuados**, um ponto por item, mínimo 0 e
   máximo 15, e a direção da pontuação é **dado, e não condicional**: cada item declara
   qual resposta pontua, porque a escala mistura os dez itens em que pontua o "Sim" com os
   cinco em que pontua o "Não". É aí que a transcrição de instrumentos costuma errar, e a
   lista precisa ter um lugar só. A instrução da fonte é "Considerar 1 ponto quando os
   itens em cinza (sim ou não) estiverem marcados". 🟢
   - Origem no legado: `_reversa_sdd/domain.md#74-a-classificação` (regra 53: cortes como dado, não cadeia de `if`)
   - Tipo: nova
4. **RN-04:** A faixa de resultado é **rótulo literal da fonte**, com os três cortes
   transcritos e modelados como dado: **0 a 5** "se considera normal", **6 a 10** "indica
   depressão leve", **11 a 15** "depressão severa". As faixas cobrem a amplitude inteira
   do escore, sem buraco nem sobreposição, o que dispensa aqui a espécie de fronteira
   dupla que a puericultura precisou declarar. O produto não inventa categoria que a fonte
   não nomeie. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#74-a-classificação` (regras 53 e 56)
   - Tipo: nova
4b. **RN-04b:** A **providência recomendada pela fonte** é transcrita como citação e
   acompanha o resultado: "escores elevados sugerem encaminhamento para avaliação
   neuropsicológica específica". A fonte **não quantifica "elevados"**, e o produto não
   o quantifica por ela: exibe a recomendação como está, sem convertê-la em gatilho
   numérico próprio. É a mesma disciplina da comparação DUM × USG no terceiro trimestre,
   onde a ausência de parâmetro se declara em vez de se preencher. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#4-regras-de-domínio--gestação` (regra 25); ADR 0005
   - Tipo: nova
5. **RN-05:** **A escala rastreia, não diagnostica.** A saída carrega advertência
   declarada, constante própria do domínio, dizendo que o escore não estabelece
   diagnóstico e que a conduta é do médico. O motor informa e não escolhe. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#10-invariantes-transversais` (invariante 6; ADR 0005), e `NOTA_PROVENIENCIA` da feature 014 como molde
   - Tipo: nova
6. **RN-06:** **Coleta total de ofensores.** Item sem resposta é ofensor, e a validação
   devolve **todos** os itens faltantes de uma vez, nomeando-os. Não existe escore
   parcial: instrumento somado pela metade produz número que parece resultado e não é. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#10-invariantes-transversais` (invariante 4)
   - Tipo: nova
7. **RN-07:** **Escopo igual ao da fonte, e a fonte não declara faixa etária.** A página
   não publica idade mínima, máxima nem população de aplicação: o único indicativo é o
   nome do instrumento. Decidido em 30/07: **a calculadora não pede idade e não recusa por
   idade.** Não há campo, não há ofensor e não há variante de recusa etária; o público a
   que o instrumento se dirige é dito **em prosa autoral** na tela, e a responsabilidade
   pela indicação permanece de quem aplica. Inventar piso etário seria inventar fonte, e
   nomear como recusa da fonte o que seria regra do produto é o desvio de transparência que
   a plataforma evita desde `MD-0015`. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#11-fronteiras-de-escopo`; ADR 0009; e o precedente `sem-parametro-na-fonte` da regra 25
   - Tipo: nova
8. **RN-08:** **Erro é valor, exceção é bug.** A fachada nunca lança para caso esperado;
   `ErroDeInvariante` fica reservado a estado impossível por construção, e leva ao painel
   honesto da tela. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#10-invariantes-transversais` (invariante 2; ADR 0004)
   - Tipo: nova
9. **RN-09:** **Domínio puro.** O unit não importa framework de interface, sistema de
   design nem biblioteca externa, e não lê o relógio. Sendo o domínio novo o sexto sob a mesma disciplina, a
   guarda executável hoje restrita a `models/puericultura/**` **passa a valer também
   aqui**, o que reduz a dívida 1 de `architecture.md` em vez de a repetir. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#6-dívidas-técnicas` (dívida 1); ADR 0003
   - Tipo: nova
10. **RN-10:** **Nada é salvo e nada é enviado.** Nenhum `fetch`, nenhum `storage`, nenhum
    durável novo. As respostas vivem no estado do componente e morrem com a aba. 🟢
    - Origem no legado: `_reversa_sdd/domain.md#10-invariantes-transversais` (invariante 8; ADR 0002/0007)
    - Tipo: nova
11. **RN-11:** **A tela invalida por edição.** Alterar qualquer resposta marca o resultado
    como `desatualizado`, como nas cinco telas de cálculo. **Não há ritual de revisão**:
    esta tela não prescreve dose (ADR 0012). 🟢
    - Origem no legado: `_reversa_sdd/domain.md#101-regras-da-interface-com-força-de-domínio` (regras 9 e 11)
    - Tipo: nova
12. **RN-12:** **A tela não declara coluna própria.** O enquadramento horizontal é da
    `Moldura`, e a folha de estilo da seção cuida apenas do eixo vertical e do arranjo
    interno do questionário. 🟢
    - Origem no legado: `_reversa_sdd/domain.md#102-regras-da-interface-com-força-de-navegação-e-enquadramento` (regra 16; `MD-0029`)
    - Tipo: nova
13. **RN-13:** **A seção entra no `CATALOGO` antes da rota existir na cabeça de quem lê.**
    O catálogo é fonte única das seções e oráculo da descrição da plataforma: entrada nova
    é diff aditivo, e as seis fichas anteriores permanecem byte a byte. 🟢
    - Origem no legado: `_reversa_sdd/code-analysis.md#módulo-16--interfaceinicio`
    - Tipo: alterada (o catálogo ganha a quinta seção)
14. **RN-14:** **Classe declarada para todo literal novo.** Os itens da escala e os
    rótulos de faixa são **citação**; a prosa da tela, o subtítulo e os metadados são
    **autoral**, sob `docs/redacao.md`; chaves e `id` são **identificador**. Literal sem
    entrada em `scripts/textos/classes/` faz `node scripts/inventariar-textos.mts` parar. 🟢
    - Origem no legado: `_reversa_sdd/domain.md#103-a-norma-de-redação` (regra 19); princípio IX
    - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Unit de domínio novo em `models/`, com fachada única que recebe as respostas e devolve resultado ou erro | Must | Existe fachada com um método público; `tests/unit/dominio-<unit>` cobre `models/**` no limiar de 90% do `vitest.config.ts` | 🟢 |
| RF-02 | `fonte-clinica.ts` com `FONTE_ID`, `VERSAO_EDICAO`, `NOME_PUBLICADO`, `referencia()` e `REFERENCIAS` congelado | Must | Toda saída de sucesso, de recusa e de advertência carrega `ReferenciaClinica` com localização bibliográfica preenchida | 🟢 |
| RF-03 | Os quinze itens como dado congelado, cada um com identificador, texto transcrito e a resposta que pontua, na tabela de RN-02 | Must | O motor não contém condicional por item; trocar a chave de pontuação é editar dado, e o teste reprova se a soma divergir do oráculo | 🟢 |
| RF-04 | Escore de 0 a 15 e faixa nomeada pela fonte | Must | Escore e rótulo batem nos seis valores de fronteira (0, 5, 6, 10, 11, 15); as quinze respostas que não pontuam dão 0 e as quinze que pontuam dão 15 | 🟢 |
| RF-04b | Providência da fonte exibida junto do resultado, como citação, sem limiar inventado | Must | O literal aparece na tela em qualquer faixa, e nenhum número do produto decide quando ele aparece | 🟢 |
| RF-05 | Validação com coleta total: itens não respondidos voltam todos, nomeados, sem escore | Must | Entrada com três itens em branco produz erro com os três ofensores, e nenhum campo de resultado | 🟢 |
| RF-06 | Sem campo de idade e sem recusa etária; a tela diz em prosa a quem o instrumento se dirige | Must | Nenhum campo de idade no formulário, nenhuma variante de recusa por idade no domínio, e o literal do público existe na tela, declarado como autoral | 🟢 |
| RF-07 | Advertência declarada de que o instrumento rastreia e não diagnostica, como constante do domínio lida pela tela | Must | A constante existe em `models/**`, a tela a lê em vez de duplicar o texto, e o teste de interface afirma a presença | 🟢 |
| RF-08 | Tela em `interface/saude-do-idoso/` com `Moldura`, `comInicio`, subtítulo com o nome publicado da fonte e máquina de estado `vazio → sucesso \| fora-do-escopo \| erro \| falha-inesperada` | Must | Teste de integração percorre os quatro estados; o painel honesto aparece na falha inesperada | 🟢 |
| RF-09 | Questionário acessível: cada item é um grupo de opções rotulado, navegável por teclado e associado ao seu enunciado | Must | A verificação automática de acessibilidade da rota nova fica em zero violação, por asserção direta e sem entrada na linha de base; a navegação por teclado percorre os itens na ordem | 🟢 |
| RF-10 | Invalidação por edição, sem ritual de revisão | Must | Alterar uma resposta após o cálculo marca o resultado como desatualizado; não existe checkbox de revisão na tela | 🟢 |
| RF-11 | Rota `pages/saude-do-idoso/depressao-gds.tsx`, casca de metadados mais tela, com título e descrição na forma fixada na feature 018 | Must | Os metadados passam nos verificadores de `tests/unit/textos/`; o separador e a caixa de frase seguem os das outras seis rotas | 🟢 |
| RF-12 | Quinta seção no `CATALOGO`, `id` `saude-do-idoso` e título exibido "Saúde da pessoa idosa", com uma ficha apontando para `/saude-do-idoso/depressao-gds`, mais o par `id → ícone` no mapa de ícones da home | Must | `inicio.test.tsx` afirma cinco seções e sete fichas em lista ordenada exaustiva, com as seis anteriores byte a byte; a home exibe a seção nova | 🟢 |
| RF-13 | Folha de estilo própria da seção, sobre os tokens do sistema de design já adotado, sem cor própria e **sem coluna** | Must | A folha não declara `max-width` nem recuo horizontal do corpo; a guarda geométrica da rota nova passa sem ajuste | 🟢 |
| RF-14 | Classes de texto declaradas para todo literal novo, em `scripts/textos/classes/` | Must | `node scripts/inventariar-textos.mts` roda sem parar; o inventário cresce apenas com os literais desta feature, e os itens transcritos entram como citação | 🟢 |
| RF-15 | Nenhuma dependência de runtime nova e nenhum acesso à rede | Must | `package.json` sem entrada nova em `dependencies`; o roteiro e2e da rota não registra requisição além dos ativos da própria página | 🟢 |
| ~~RF-16~~ | ~~Texto de registro copiável para o prontuário~~ **Fora desta entrega, por decisão de 30/07** | Won't | A tela exibe e o prescritor transcreve; a plataforma não ganha um terceiro contrato de forma emitido para consumo externo nesta feature | 🟢 |
| RF-17 | Guarda de camada executável estendida ao unit novo, no molde de `invariantes.test.ts` | Should | A varredura reprova se algum arquivo do unit importar de fora de `models/`, mencionar framework ou ler o relógio | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | O cálculo é soma de quinze inteiros e classificação por faixa; nenhum acervo tabular, nenhum módulo gerado, nenhum carregamento sob demanda | Contraste deliberado com a puericultura, cujos 344 kB de tabelas exigiram carregamento sob demanda (`architecture.md#3-dados`) | 🟢 |
| Desempenho | O acréscimo de bundle da rota nova fica na ordem das telas de formulário simples, e não na das telas com acervo | `code-analysis.md#módulo-11--interfacecardiologia` como referência de porte | 🟡 |
| Segurança e privacidade | Nenhum dado de saúde mental é transmitido, persistido ou registrado; o instrumento é respondido e descartado | ADR 0002/0007; `domain.md#10` invariante 8. Dado de sofrimento psíquico é o mais sensível que a plataforma já manipulou, e a arquitetura já o protege por construção | 🟢 |
| Segurança | A política de segurança de conteúdo (CSP) de produção permanece sem terceiros; a rota nova não a afrouxa | `inventory.md#configuração` (`next.config.ts`) | 🟢 |
| Acessibilidade | Zero violação de acessibilidade na rota nova, aferida por asserção direta e sem entrada na linha de base; um grupo de opções corretamente rotulado por item da escala | `architecture.md#5-qualidade-e-testes` | 🟢 |
| Robustez | Nenhuma concorrência, retentativa ou tempo limite a considerar: o cálculo é síncrono, local e sem entrada e saída. O único caminho de rede da plataforma continua sendo o healthcheck, que esta feature não toca | `architecture.md#2-containers-e-componentes`; `domain.md#10` invariante 8 | 🟢 |
| Redação | Toda prosa autoral obedece a `docs/redacao.md`; nenhum travessão, reticência ou exclamação fora do nome publicado da fonte | Princípio IX; `MD-0020`/`MD-0021` | 🟢 |
| Manutenibilidade | Nenhum arquivo acima de 400 linhas; o mapa de classes de `interface.mts`, já em 684 linhas, **não** é agravado sem necessidade | `architecture.md#6-dívidas-técnicas` (dívida 3) | 🟡 |
| Observabilidade | Nenhum log, nenhuma telemetria, nenhum contador de uso; a plataforma continua sem saber quem calculou o quê | ADR 0007; `domain.md#13-lacunas` item 2 | 🟢 |
| Rastreabilidade | Cada arquivo novo cita no cabeçalho o `RF-NN` que o originou, e a matriz fecha o circuito | Princípio VI | 🟢 |
| Reprodutibilidade da citação | A fonte é página web e se confere **à mão**, contra a cópia datada com `sha256` em `referencias/`; nenhum script relê a URL nesta entrega | Decisão de 30/07 registrada em `MD-0039`; a conferência automatizada fica como dívida declarada | 🟡 |

## 7. Critérios de Aceitação

```gherkin
Cenário: escore e faixa a partir das respostas completas
  Dado que o prescritor respondeu a todos os itens da escala
  Quando solicita o resultado
  Então a tela exibe o escore total, o rótulo de faixa na redação literal da fonte
  E exibe a referência bibliográfica com a localização na fonte
  E exibe a advertência de que o instrumento rastreia e não estabelece diagnóstico

Cenário: item sem resposta não produz escore parcial
  Dado que três itens permaneceram sem resposta
  Quando o prescritor solicita o resultado
  Então a tela lista os três itens faltantes, nomeando-os
  E nenhum escore é exibido

Cenário: escore nos dois extremos
  Dado que nenhuma resposta pontua
  Quando o resultado é calculado
  Então o escore é 0 e a faixa é a que a fonte considera normal
  E, respondidas todas as quinze na direção que pontua, o escore é 15 e a faixa é a de depressão severa

Cenário: a providência da fonte não ganha limiar do produto
  Dado um resultado em qualquer das três faixas
  Quando a tela o exibe
  Então a recomendação de encaminhamento aparece na redação da fonte
  E nenhum corte inventado pelo produto decide quando ela aparece

Cenário: edição depois do cálculo invalida o resultado
  Dado um resultado já exibido
  Quando o prescritor altera a resposta de um item
  Então o resultado é marcado como desatualizado
  E nenhum checkbox de revisão é exigido, porque esta tela não prescreve dose

Cenário: a plataforma não transmite as respostas
  Dado que o prescritor respondeu à escala inteira
  Quando o resultado é calculado
  Então nenhuma requisição de rede parte da página além dos ativos que a servem
  E nada é gravado em `localStorage` além da preferência de tema

Cenário: a home ganha a seção sem alterar as anteriores
  Dado o catálogo com quatro seções e seis fichas
  Quando a seção de saúde do idoso entra com a sua calculadora
  Então a home exibe cinco seções e sete fichas
  E as seis fichas anteriores permanecem idênticas, byte a byte

Cenário: literal novo sem classe declarada barra a entrega
  Dado um item da escala transcrito na tela
  Quando o inventário textual é gerado
  Então o literal aparece no inventário com a classe citação
  E o gerador para, nomeando arquivo e linha, se algum literal novo ficar sem classe

Cenário: a tela nova não declara coluna própria nem fura a camada de domínio
  Dado o unit de domínio e a folha de estilo da seção
  Quando as guardas executáveis da suíte percorrem a rota nova e os arquivos do unit
  Então a largura do corpo é a que a moldura fixa para a variante da tela
  E nenhum arquivo do domínio importa de fora de `models/`, menciona framework ou lê o relógio

Cenário: falha inesperada não silencia
  Dado um estado impossível por construção dentro do motor
  Quando a tela o encontra
  Então exibe o painel honesto, que instrui a não decidir a partir daquela tela
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01, RF-02, RF-03, RF-04, RF-05 | Must | Sem motor, fonte declarada, itens como dado, faixa e coleta total, não há calculadora: há um formulário que soma números |
| RF-07 | Must | Instrumento de rastreamento exibido sem a advertência convida à leitura diagnóstica, que é o erro clínico que esta tela pode induzir |
| RF-08, RF-09, RF-10, RF-11 | Must | A tela, a acessibilidade, a invalidação e a rota são o mínimo para a calculadora existir no molde da plataforma |
| RF-12, RF-13, RF-14 | Must | Catálogo, enquadramento e classes de texto são portões já executáveis: reprovam no CI se ignorados |
| RF-15 | Must | Dependência nova ou acesso à rede contradiz a ADR 0002 e o filtro de longevidade do projeto |
| RF-06 | Should | A fonte não declara faixa etária: qualquer regra de idade é decisão do produto, e depende da dúvida 1 da seção 10 |
| RF-17 | Should | Estende disciplina existente ao unit novo e reduz a dívida 1; não bloqueia a entrega |
| RNF de acessibilidade e de redação | Must | Ambos têm verificador executável no CI |
| RNF de desempenho | Should | O porte da tela torna o risco pequeno; medir é barato e vale como linha de base |
| RF-16 | Won't | Decidido em 30/07: a tela exibe e o prescritor transcreve. Ampliaria a superfície de contrato emitido, e a plataforma já mantém dois |

**Escopo negativo declarado.** Não entram nesta feature: acompanhamento longitudinal ou
comparação entre aplicações; qualquer persistência do escore; sugestão de conduta
terapêutica ou de prescrição a partir do resultado; outros instrumentos da avaliação
multidimensional da pessoa idosa, como rastreio cognitivo, funcionalidade, quedas ou
fragilidade; e orientações dirigidas ao paciente, excluídas da plataforma desde a fase 1
(`_reversa_sdd/domain.md#11-fronteiras-de-escopo`).

**Nomes e formato, fixados em 30/07.** A seção recebe `id` `saude-do-idoso` e título
exibido "Saúde da pessoa idosa"; a rota da calculadora é `/saude-do-idoso/depressao-gds`,
no molde `seção/calculadora` das seis existentes; a escala é aplicada e pontuada em uma
única passagem, sem triagem em duas etapas; e a versão de quinze itens é a que a fonte
publica, e não mais hipótese de trabalho.

**Premissa que segue aberta ao `/reversa-plan`.** O unit de domínio é nomeado pelo domínio
clínico, e não pela seção, como nos cinco anteriores. É a única escolha de nomenclatura que
o plano ainda pode rever sem custo.

## 9. Esclarecimentos

### Sessão 2026-07-30

- **Q:** Qual documento será a fonte clínica única desta unit?
  **R:** *Escala de Depressão Geriátrica (GDS)*, do portal Linhas de Cuidado do Ministério
  da Saúde, em `https://linhasdecuidado.saude.gov.br/portal/tabagismo/escala-depressao-geriatrica/`.
  A página cita, por sua vez, `J Psychiatr Res. 1982-1983; 17(1): 37-49` e
  `Arq Neuropsiquiatr. 1999; 57(2-B): 421-426`, que ficam como referências **da fonte**, e
  não como fontes do produto: a unit continua com uma fonte só (ADR 0011).

- **Q:** Qual versão da escala o produto transcreve?
  **R:** A que a fonte publica, e a leitura de 30/07/2026 mostrou serem **quinze itens**.

- **Q (levantada na leitura da fonte):** Como se lê a chave de pontuação, que a página
  descreve como "os itens em cinza"?
  **R:** O destaque é visual, e não textual: na tabela da página, a célula que pontua traz
  a classe `bg-table-light-grey`. A chave foi lida daí, item a item, e está transcrita em
  RN-02. Dez itens pontuam com "Sim" e cinco com "Não" — os de número 1, 5, 7, 11 e 13.
  A procedência é **marcação de estilo**, não prosa, e por isso vai declarada aqui: quem
  reconferir a transcrição precisa saber onde olhar, porque o texto extraído da página não
  carrega a informação.

- **Q (levantada na leitura da fonte):** O impresso oficial entra em `referencias/`?
  **R:** Não pode: o link "Fazer download da versão para impressão (PDF)" da própria página
  responde **404** no servidor do Ministério, e a conferência do prefixo confirma que o
  caminho é o correto (um ativo vizinho responde 200 no mesmo prefixo). A fonte é a página.
  Ficou congelada em `referencias/saude-do-idoso/escala-de-depressao-geriatrica-linhas-de-cuidado-ms-20260730.html`,
  com `sha256` `bb74f9bc285f9ae2d235cf41d42e6ac04691dfe617f2ecff3fe4fdf4e04802ef`, fora do
  versionamento como as demais fontes.

- **Q:** O escopo desta entrega abrange outros instrumentos da avaliação da pessoa idosa?
  **R:** Não. Apenas a GDS neste momento, como o escopo negativo da seção 8 já previa.

### Sessão 2026-07-30, segunda rodada

- **Q:** A idade entra como campo, e com que consequência?
  **R:** Sem campo de idade e sem recusa etária. A tela diz em prosa a quem o instrumento
  se dirige. Ver RN-07 e RF-06.

- **Q:** O resultado sai da tela como texto para colar no prontuário?
  **R:** Não nesta entrega. A tela exibe e o prescritor transcreve; RF-16 passa a `Won't`,
  e a plataforma segue com dois contratos de forma emitidos, não três.

- **Q:** A conferência da fonte-página vira script em `scripts/`?
  **R:** Não. Conferência **manual**, como nas fontes em PDF, apoiada na cópia datada com
  `sha256`. A recomendação era automatizar; a escolha contrária vai registrada com o seu
  custo em `MD-0039`, e a dívida aparece no requisito não funcional de reprodutibilidade
  da citação.

- **Q:** Como se chamam a seção e a rota?
  **R:** Seção com `id` `saude-do-idoso` e título exibido "Saúde da pessoa idosa"; rota
  `/saude-do-idoso/depressao-gds`.

**Consequências para o documento.** RN-02, RN-03, RN-04 e RF-03/RF-04 passaram de 🔴 e 🟡
a 🟢, com o conteúdo transcrito; nasceram RN-04b e RF-04b para a providência recomendada;
e RN-07 mudou de sentido, porque a fonte **não declara faixa etária alguma**, o que
transforma a antiga dúvida sobre a idade em decisão do produto, e não em leitura da fonte.

## 10. Lacunas

**Nenhuma dúvida bloqueante em aberto.** As três iniciais foram resolvidas em 30/07, nas
duas rodadas registradas na seção 9: a fonte clínica, o tratamento da idade e a emissão de
texto para o prontuário. Permanecem dois pontos de atenção, ambos com decisão tomada e
custo declarado, que o `/reversa-plan` herda como premissas e não como perguntas:

- 🟡 **A fonte é página, e página muda sem aviso, e a conferência será manual.** Não há
  número de edição a citar, de modo que `VERSAO_EDICAO` se apoia na data de acesso e a
  reconferência depende da cópia congelada com `sha256`. A automatização foi recomendada e
  recusada; `MD-0039` registra a escolha, o gatilho que a revisaria e o que se perde
  enquanto ela vigorar.
- 🟡 **A prosa que diz a quem o instrumento se dirige é autoral, e substitui uma regra.**
  Não havendo campo de idade, esse literal é a única coisa entre o produto e uma aplicação
  fora do público previsto. Ele merece cuidado de redação maior que o de um subtítulo, e o
  `/reversa-plan` deve tratá-lo como conteúdo, não como enfeite de tela.

## Pendências de Qualidade

Sobreviveram ao ciclo de auto-validação, e ficam declaradas em vez de contornadas:

- **Q-018 reprovado, pela fronteira de `MD-0030`.** A seção 2 nomeia arquivos, decisões e
  documentos da extração porque é essa nomeação que torna a âncora conferível; as seções
  4, 5 e 6 referem-se ao framework, ao sistema de design e ao verificador de
  acessibilidade **pela função que exercem**, e não pela marca. Reprovação lícita e do
  mesmo tipo já registrado na feature 022.
- ~~**Q-009 parcialmente 🔴 por origem.**~~ **Encerrada em 30/07:** fixada a fonte, RN-02,
  RN-03, RN-04, RF-03 e RF-04 passaram a 🟢 por preenchimento, e não por decurso, como
  `MD-0037` previa.
- ~~**Q-012 com um limite ainda sem número.**~~ **Encerrada em 30/07** quanto aos cortes,
  hoje transcritos em RN-04. Permanece **sem número por ausência na fonte**, e não por
  omissão do documento, a faixa etária de aplicação, que a página não publica.
- **Q-014 com uma consideração nova.** A fonte é página web, e não impresso: a
  reprodutibilidade da citação passa a depender de cópia congelada com `sha256`, e o
  documento declara isso na seção 10 em vez de supor estabilidade que uma URL não oferece.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-30 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-30 | Sessão de esclarecimentos: fonte clínica fixada e transcrita, chave de pontuação lida da marcação da tabela, cortes e providência incorporados, cópia congelada em `referencias/`; RN-04b e RF-04b criados; a dúvida da idade muda de natureza e as demais são renumeradas | reversa |
| 2026-07-30 | Segunda rodada: sem campo de idade e sem recusa etária (RN-07, RF-06), RF-16 para `Won't`, conferência manual da fonte com a dívida declarada, e nomes fixados (seção "Saúde da pessoa idosa", rota `/saude-do-idoso/depressao-gds`). Documento sem dúvidas bloqueantes | reversa |
