# Investigação — 023-saude-do-idoso-gds

> Data: `2026-07-30`
> Pesquisa de fundo do `/reversa-plan`. O que aqui se registra é o **porquê** das escolhas
> do `roadmap.md`, incluindo o que se descartou e o que se descobriu ao ler o real.

## 1. O que a leitura do legado mostrou

**O análogo estrutural é a cardiopatia isquêmica, não a puericultura.** As duas telas de
puericultura são as mais recentes e as mais lembradas, mas a sua complexidade vem do acervo
tabular e das três idades, que aqui não existem. `models/cardiopatia-isquemica` tem sete
arquivos e 575 linhas para um problema da mesma forma que o nosso: entradas booleanas,
contagem, faixa nomeada, conduta transcrita e recusa honesta. `interface/cardiologia`
resolve a tela em 606 linhas com quatro arquivos e uma máquina de quatro estados.

**A máquina cabe em três estados, e não quatro.** `_reversa_sdd/state-machines.md#3` e `#4`
mostram que a variante `fora-do-escopo` existe onde o domínio recusa: idade fora de 30–69 na
cardiopatia, idade fora de 40–79 ou DCV prévia no risco cardiovascular. Sem recusa etária
(RN-07), a variante ficaria inalcançável, e estado inalcançável é código morto que a
próxima leitura tomará por esquecimento.

**A guarda geométrica já cobre a rota nova sem nenhum ajuste.** `e2e/plataforma.spec.ts`
deriva os alvos de `CATALOGO.flatMap(...)`, mais a home. Foi a correção da feature 021,
depois que a 013 descobriu, pelo lado caro, que uma lista de rotas escrita à mão envelhece
em silêncio. Consequência prática: **entrar no catálogo é o que põe a calculadora sob a
guarda**, e por isso a ação do catálogo precede a da folha de estilo no plano de execução.

**O verificador de citação reprova por construção quem traz fonte nova.** Este foi o achado
que mais mudou o plano. `tests/unit/textos/citacao.test.ts` compara o conjunto corrente de
literais de classe `citacao` contra `tests/apoio/citacao-linha-de-base.json`, congelado em
27/07 e **jamais regerado** (`MD-0018`). Citação que surge depois disso só passa se a sua
subárvore constar em `SUBARVORES_COM_ORACULO_PROPRIO`, com o oráculo declarado — a saída
que `MD-0027` abriu para a feature 020 e deixou deliberadamente estreita. Hoje a lista tem
uma entrada só; esta feature acrescenta a segunda, e é a primeira vez que a porta é usada
por quem não a abriu.

## 2. Alternativas avaliadas

### 2.1 Nome e fronteira do unit

Três candidatos: `models/depressao-geriatrica` (domínio), `models/saude-do-idoso` (seção) e
`models/gds` (sigla). O critério que decidiu foi olhar o que os cinco units existentes
fazem: todos nomeiam o domínio clínico. Que `models/puericultura` coincida com a seção
"Puericultura" da home é acidente, e a coincidência se desfaria no dia em que a seção
recebesse um instrumento de outra fonte — que é exatamente o que a seção "Saúde da pessoa
idosa" fará, quando outros instrumentos da avaliação multidimensional entrarem.

Avaliou-se também **abstrair um "questionário" genérico**, já prevendo esses instrumentos
futuros. Descartado por prematuro: a plataforma tem um caso, e abstração desenhada sobre um
caso só costuma acertar o formato errado. O segundo instrumento é que dirá o que se
repete — e, se repetir, a extração fará a fatoração aparecer.

### 2.2 Forma da entrada e o problema do "não respondido"

A entrada podia ser array de quinze `boolean`, array de `boolean | null` ou mapa por `id`.
O array de `boolean` é o mais simples e o único que **impossibilita** a regra: sem terceiro
valor, "não respondeu" e "respondeu Não" colapsam, e a coleta total de ofensores perderia
objeto. O array de `boolean | null` exprime, mas amarra o domínio à ordem em que a tela
renderiza. O mapa por `id` desacopla e deixa a validação nomear cada item faltante, que é o
que RF-05 pede em critério de aceite.

Corolário de tela (D-08): **nenhum grupo nasce pré-selecionado**. Um padrão "Não" faria o
formulário responder pelo paciente, e a soma sairia numericamente válida — o pior desfecho
possível, porque não deixa rastro.

### 2.3 Oráculo da transcrição

Quatro caminhos foram considerados.

1. **Nenhum oráculo**, confiando na revisão humana. Descartado: a chave de pontuação é
   invisível ao olho no texto renderizado, e é justamente ela que decide o escore.
2. **JSON escrito à mão** a partir da leitura. Descartado por circularidade: o oráculo
   viria da mesma mão que escreve o domínio, e provaria apenas consistência interna. É o
   erro que `MD-0010` nomeia ao exigir cadeia independente.
3. **Conferir contra a URL em tempo de teste.** Descartado por tornar a suíte dependente de
   rede, contra a disciplina de toda a plataforma, e por contrariar `MD-0039`.
4. **Congelar da cópia local**, que é a escolha. `scripts/congelar-fonte-gds.mts` lê o HTML
   datado de `referencias/`, extrai os quinze enunciados, a chave — pela marcação de célula
   que `MD-0038` documenta —, os três rótulos com seus cortes e a providência, e emite
   `tests/apoio/gds-fonte-congelada.json`. O teste compara o domínio com esse congelado.

A propriedade que isso instala: **trocar a resposta que pontua em qualquer item reprova**,
e reprova nomeando o item. É a mesma relação que os 356 casos da OMS têm com o motor de
escore z.

### 2.4 Isenção do verificador de citação

Uma vez decidido o oráculo, a entrada em `SUBARVORES_COM_ORACULO_PROPRIO` é consequência, e
não escolha. O que se avaliou foi **o alcance**: manter a isenção restrita a surgimento,
como está, ou estendê-la a alteração dentro da subárvore. Manteve-se restrita — alterar um
item transcrito continua reprovando, porque é precisamente o evento contra o qual o guarda
existe. Quem alterar terá de mexer no congelado, e o `git diff` do congelado é leitura
humana obrigatória.

Vale registrar o que **não** se fez: não se tocou em `citacao-linha-de-base.json`. `MD-0018`
é explícita sobre por quê, e a tentação de regerar é o modo natural de o gate morrer.

### 2.5 Onde declarar as classes de texto

`scripts/textos/classes/interface.mts` está em 684 linhas, acima do teto de 400, e é a
dívida 3 de `architecture.md`. A saída que a própria extração propõe é parti-lo por camada
de tela. Duas opções: engordá-lo com os literais desta tela, adiando a partição, ou criar
`interface-saude-do-idoso.mts` e registrá-lo no agregador. A segunda custa o mesmo e move a
dívida na direção certa, de modo que a feature paga o seu quinhão do refactor budget sem
abrir frente própria.

### 2.6 O que se decidiu não construir

- **Registro copiável para o prontuário** (RF-16, `Won't`): cada texto emitido é contrato de
  forma para consumo externo, e a plataforma já mantém dois. A hora de assumir o terceiro
  não é a de estrear um domínio.
- **Conferidor automático da URL**: recusado pelo prescritor, com o custo declarado em
  `MD-0039`. Convém não confundi-lo com o oráculo de 2.3, que é local e entra: um confere
  **o produto contra a cópia**, o outro conferiria **a cópia contra a fonte publicada**.
- **Faixa etária inventada**: a fonte não a publica; declarar piso próprio seria emitir
  regra do produto com aparência de citação.

## 3. Fontes externas consultadas

| Fonte | Uso | Observação |
|---|---|---|
| `https://linhasdecuidado.saude.gov.br/portal/tabagismo/escala-depressao-geriatrica/` | Fonte clínica única da unit | Lida em 30/07/2026; cópia congelada em `referencias/saude-do-idoso/`, `sha256` `bb74f9bc…` |
| `J Psychiatr Res. 1982-1983; 17(1): 37-49` | Referência **que a fonte cita** | Não é fonte do produto; entra apenas como parte da citação da localização |
| `Arq Neuropsiquiatr. 1999; 57(2-B): 421-426` | Referência **que a fonte cita** | Idem |
| `https://linhasdecuidado.saude.gov.br/resources/escala-de-depressao-geriatrica.pdf` | Impresso anunciado pela página | **404** em 30/07; conferido que o prefixo é válido, pois um ativo vizinho responde 200 |

## 4. Padrões aplicáveis do próprio repositório

| Padrão | Onde já existe | Como se aplica aqui |
|---|---|---|
| Fachada única por unit, erro como valor | `models/cardiopatia-isquemica/calculadora.ts` | `EscalaDepressaoGeriatrica.avaliar` |
| Constantes clínicas congeladas com comentário de origem | `models/*/fonte-clinica.ts` | Itens, rótulos, cortes, providência e `NOME_PUBLICADO` |
| Nota do produto dentro do domínio | `NOTA_PROVENIENCIA` do risco cardiovascular | Advertência de rastreamento e público do instrumento |
| Contêiner com invalidação por edição e painel honesto | `interface/cardiologia/app.tsx` | Mesmo esqueleto, três estados |
| Subtítulo por concatenação, e não interpolação | `interface/cardiologia/tela.tsx` | Preserva a visibilidade do literal ao extrator |
| Oráculo congelado por cadeia própria | `tests/unit/dominio-puericultura/` | `transcricao.test.ts` desta feature |
| Guarda de camada por varredura | `models/puericultura/**` em `invariantes.test.ts` | Estendida ao unit novo (RF-17) |
