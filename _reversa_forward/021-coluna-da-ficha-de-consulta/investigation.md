# Investigação: onde mora a coluna, e por que a guarda não a viu sair

> Feature: `021-coluna-da-ficha-de-consulta`
> Data: `2026-07-28`

## 1. A pergunta que a investigação respondeu

O `requirements.md` nasceu com a causa direta já apurada: `.consulta-regioes` foi declarada com
`display: flex`, `flex-direction: column` e `gap`, e mais nada. O que faltava era decidir **onde**
a coluna deveria passar a morar, e a resposta mudou a proposta inicial.

## 2. O que a leitura do código revelou

Três achados, cada um verificável por arquivo e linha:

1. **A `Moldura` já envolve o corpo de toda tela num `<main>`** (`interface/comum/moldura.tsx:115`),
   e já emite `data-apresentacao` no elemento `.pagina` (`moldura.tsx:72`). Existe, portanto, um
   elemento comum a todas as telas, presentes e futuras, e uma chave que as reparte em duas famílias.
2. **O cabeçalho já é calibrado por essa mesma chave.** `cabecalho.css:31` usa
   `padding: 44px max(32px, calc(50% - 558px)) 36px` para a variante `padrao`, e `inicio.css:28`
   usa `calc(50% - 328px)` para a `destaque`. Os dois números são metade da coluna menos o recuo:
   `1180/2 − 32 = 558` e `720/2 − 32 = 328`.
3. **Só o corpo não conhecia a chave.** `.calc-regioes` (`globais.css:33`) e `.inicio-secoes`
   (`inicio.css:34`) declaram cada uma a sua largura, e as cinco primeiras telas herdaram a coluna
   por reusarem `.calc-regioes`. A sexta precisou de outro arranjo interno, escreveu classe própria
   e não herdou nada.

O terceiro achado é o diagnóstico completo: a coincidência de nome de classe era a única coisa
segurando a invariante, e ela não sobreviveu à primeira tela com arranjo diferente.

## 2b. O terceiro declarante, que a leitura inicial não viu

A auditoria de `audit/cross-check.md` (A002) acrescentou um quarto achado, e ele muda o alcance
da correção: **os donos da coluna são três, e não dois**. `.contribuicao-bloco`
(`contribuicao.css:21`) declara `max-width: 720px`, `margin: 0 auto` e recuo lateral por conta
própria, e `interface/inicio/tela.tsx:58` põe o `BlocoDeApoio` dentro da mesma `Moldura` da home
— logo, dentro do mesmo `<main>` que passará a ser a sede da coluna. Sem subtraí-lo, o bloco
ficaria com recuo de 64px, o dobro do resto da página, numa coluna de 720px aninhada em outra de
720px.

O que torna a omissão instrutiva é que a guarda **não** a pegaria: ela mede o `<main>`, e o
`<main>` estaria correto. É a mesma classe de erro que a feature corrige, um nível abaixo, e o
que a encontrou foi uma busca de `max-width` nas oito folhas — três linhas de resultado onde a
leitura inicial contara duas.

Duas particularidades da folha, apuradas na conferência do código e registradas em D-09, porque
uma conversão desatenta as perde:

- A regra declara `padding: 0 32px 64px` e, sete linhas abaixo, `padding-top: 32px`, que
  sobrescreve o zero do atalho. O eixo vertical efetivo é `32px … 64px`, e é isso que
  `padding-block` há de preservar.
- `.contribuicao-bloco` **não tem media query própria**: mantém 32px de recuo lateral em toda
  largura, ao passo que `.inicio-secoes` cai para 16px abaixo de 544px. Hoje, portanto, o bloco
  de apoio já está desalinhado das seções acima dele no telefone. Ceder a coluna ao `<main>`
  alinha os dois, o que é correção — e mudança visível, declarada como premissa do roadmap para
  não ser confundida com regressão.

## 3. Alternativas avaliadas

| Alternativa | Por que foi descartada |
|---|---|
| **Correção pontual** em `.consulta-regioes` | Resolve hoje e deixa a armadilha armada para a sétima tela. A guarda de 013 já provou que armadilha armada dispara |
| **Propriedade personalizada** de coluna em `globais.css`, consumida pelas folhas | É a mesma armadilha com outro nome: a folha nova ainda precisa lembrar de consumir o token, e esquecer o token reproduz o defeito de hoje |
| **Classe `.coluna`** aplicada no JSX das seis telas | Toca seis arquivos de interface para obter o que a `Moldura` dá num só, e mantém a obrigação de memória na sétima tela |
| **Largura própria para a ficha longa** | Custa uma terceira calibração de cabeçalho sem evidência de uso. O caminho de volta continua barato: variante nova de `apresentacao` |
| **Coluna no `<main>` da `Moldura`** ✅ | A sétima tela nasce enquadrada por construção; a tela deixa de saber que existe largura; a `Moldura` passa a ser dona íntegra do enquadramento |

Registro completo, com as seis alternativas e o estado da decisão, em `.harness/decisoes/MD-0029.md`.

## 4. Por que a guarda de 013 não pegou o defeito

`e2e/plataforma.spec.ts:372` mede o alinhamento em `/dm2/insulina`, com `page.locator(".calc-regioes")`
e `const GUTTER = 32`. Três coisas chumbadas, e as três erradas pelo mesmo motivo: descrevem **uma**
tela, quando a invariante é da plataforma. A rota nova nasceu fora do alcance da guarda, e a classe
nova também.

A generalização ataca as três. As rotas passam a vir de `interface/inicio/catalogo.ts`, que a
feature 007 estabeleceu como fonte única anti-drift (D-07); o alvo passa a ser o `<main>`, que
existe por construção; e o recuo passa a ser lido do estilo computado, em vez de repetido no teste.
Sobra chumbada apenas a tolerância de 2px, que é a afirmação que a guarda faz.

Vale notar o que o teste **não** deve fazer: parametrizar o seletor de classe por rota. Isso
reintroduziria, no teste, exatamente o acoplamento a nome de classe que é a causa raiz do defeito
no CSS.

## 5. Padrões aplicáveis

- **Contêiner de layout único, conteúdo agnóstico.** O elemento que enquadra não sabe o que
  enquadra; o conteúdo não sabe onde está enquadrado. É o que separa a decisão de largura da
  decisão de arranjo interno, e é o que RN-02 pede em texto e D-01 realiza em estrutura.
- **Separação de eixos.** O horizontal é contrato entre cabeçalho e corpo; o vertical é ritmo de
  cada tela. Tratá-los como uma propriedade só é o que faria RF-04 depender de sorte.
- **Fonte única para a lista, no teste como no código.** O catálogo já governa a home; passa a
  governar também a cobertura da guarda.

## 6. Fontes

Todas internas ao repositório; a feature não introduz dependência nem consulta externa.

- `interface/comum/moldura.tsx`, `interface/inicio/{tela.tsx,catalogo.ts}`
- `interface/estilos/{globais,cabecalho,inicio,contribuicao,consulta-puericultura}.css`
- `e2e/plataforma.spec.ts`, `e2e/cabecalho.spec.ts`
- `_reversa_forward/021-coluna-da-ficha-de-consulta/audit/cross-check.md` (achado A002)
- `_reversa_sdd/addenda/013-cabecalho-proporcoes.md`, `015-cabecalho-unificado.md`,
  `016-estrutura-cabecalho-home.md`, `017-puericultura-crescimento.md`
- `.reversa/principles.md` (VI, VII, VIII)
- `.harness/decisoes/MD-0029.md`
