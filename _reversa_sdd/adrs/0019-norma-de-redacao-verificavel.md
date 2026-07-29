# ADR 0019 — A prosa do produto tem norma declarada, e a norma é verificável

> Retroativo, reconstruído pelo Reversa Detective (2026-07-28, re-extração nº 4) a partir da feature 018 (`018-revisao-linguagem-textos`), do adendo 018 e sua emenda, do princípio **IX** de `.reversa/principles.md`, do guia `docs/redacao.md` e das fichas `MD-0014` a `MD-0021` e `MD-0026`/`MD-0027`. Confiança: 🟢

## Contexto

A prosa da plataforma nasceu feature a feature, sem norma declarada. Cada tela trouxe o estilo de quem a escreveu, e as decisões de pontuação, de caixa e de separador foram tomadas caso a caso, sem lugar onde conferi-las.

O risco específico deste produto não é estético. Uma parte substancial do texto exibido é **transcrição de fonte clínica** — rótulo de classificação, conduta, localização bibliográfica —, e o médico confere a tela contra o impresso que tem na mão. Uma revisão de estilo que alcançasse essa parte criaria divergência onde a fonte não tem nenhuma, e o faria em silêncio.

## Decisão

Todo literal que o produto exibe pertence a exatamente **uma de três classes**, e a classe é **declarada**, jamais inferida do diretório onde o literal mora:

- **autoral**, escrito pelo produto, e sujeito à norma;
- **citação**, transcrita da fonte clínica, que permanece **byte a byte**;
- **identificador** (chave, `id`, nome de campo, valor de `data-*`), fora do alcance da revisão.

A norma autoral vive em `docs/redacao.md`, versionada, e o princípio **IX** a fixa como regra do projeto. A norma se divide pelo que dela se pode provar: o que é **regra dura** (pontuação pelos três eixos, grafia de números, unidades e siglas) é verificado por teste no mesmo portão dos demais, com mensagem que aponta a regra violada; o que é **julgamento** (coesão, progressão, ausência de ornamento) vive no guia como par "antes/depois" tirado do próprio produto. O guia diz qual é qual, para que ninguém confunda "a suíte passou" com "o texto está bom".

Quatro decisões subordinadas dão à norma a forma que ela tem hoje:

1. **A exceção da citação é estrita em três sentidos** (`MD-0015`): só desvio de **concordância**, sobre **lista fechada**, e **inseparável da declaração ao leitor**. Corrigir sem informar trocaria um desvio gramatical por um desvio de transparência, e este é o pior dos dois numa ferramenta que se confere contra o impresso. A mesma disciplina se estendeu depois ao **conteúdo**, quando a fonte imprime campo inaplicável a quem o recebe (`MD-0026`).
2. **A superfície textual virou dado** (`MD-0016`): 1.187 literais com arquivo, linha e classe, gerados por extrator que lê árvore sintática. Literal novo sem classe declarada **faz o gerador parar**, nomeando arquivo e linha.
3. **O eixo expressivo sai da prosa autoral** (`MD-0020`): nenhum travessão, nenhuma reticência, nenhuma exclamação, em régua única para tela, metadado, manifesto e `README.md`. A razão é de eixo e não de dose: uma ferramenta que informa dose, escore e probabilidade não tem subjetividade a marcar.
4. **A exceção única é o nome pelo qual a fonte se publica**, e ele chega à tela **pelo domínio**, por `NOME_PUBLICADO` em cada `fonte-clinica.ts` (`MD-0021`).

## Alternativas consideradas

- **Guia de estilo sem verificação**, como recomendação em prosa: descartada porque é exatamente o que já existia na cabeça de quem escrevia, e não impediu nenhuma das divergências que a medição encontrou.
- **Classificar os literais por diretório** (tudo em `models/*/fonte-clinica.ts` é citação, o resto é autoral): descartada porque erraria nas duas direções e erraria em **silêncio**, revisando citação por omissão. A classe vem da origem do texto, não do arquivo (`MD-0014`).
- **Extrair os literais por expressão regular**: descartada porque este repositório é denso em comentário longo, e a regex confunde literal exibido com a mesma sequência dentro de um comentário.
- **Conferir a exceção do travessão contra lista escrita no teste**: descartada, e a escolha se provou. O verificador lê `NOME_PUBLICADO` no domínio, e foi isso que expôs o drift de três nomes de fonte no `README.md`, que uma lista à mão teria aceitado. É a doutrina do oráculo aplicada ao texto: ele mora onde o dado nasce.
- **Revisar a citação junto com o resto**: descartada pela razão central do ADR.

## Consequências

- Sete verificadores em `tests/unit/textos/`, todos vistos reprovar antes de aceitos.
- **Dois artefatos de dado de propósito oposto no tempo**: `inventario-textual.json`, regerado a cada revisão, e `citacao-linha-de-base.json`, jamais regerado.
- A **descrição da plataforma deixou de ser prosa mantida à mão** e passou a ser verificada contra o `CATALOGO`, o que corrigiu um defeito real de exatidão: a `description` da raiz nomeava duas das quatro seções.
- O catálogo da home acumulou um segundo papel, o de **oráculo da descrição**, e por isso o bloco de contribuição precisou ficar fora dele.
- 🟡 **Limitação declarada:** literal montado por interpolação em tempo de execução fica fora do inventário por desenho do extrator, e o congelamento não o cobre. Daí a regra de que a flexão por sexo se faça por **par de rótulos declarado**, e não por interpolação: citação que o guarda não enxerga é pior que citação nenhuma, porque parece protegida.
- 🟡 **Ponto aberto:** a isenção nominal do verificador de citação por subárvore com oráculo próprio (`MD-0027`) foi tomada na execução e está declaradamente aberta a revisão enquanto a lista tiver uma entrada só.

## Status

Ativa, com uma emenda já incorporada (o teto do eixo expressivo passou de um par por bloco a zero, no mesmo dia em que a norma entrou). Gatilho de revisão: segunda entrada em `SUBARVORES_COM_ORACULO_PROPRIO`, momento em que a isenção deixa de ser exceção nomeada.
