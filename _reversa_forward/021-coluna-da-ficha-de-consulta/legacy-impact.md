# Impacto no legado: 021-coluna-da-ficha-de-consulta

> Data: `2026-07-28`
> Feature: `021-coluna-da-ficha-de-consulta`
> Âncora: extração de legado (`_reversa_sdd/architecture.md` + `domain.md`)
> Execução: 24 de 24 ações, nenhuma falha

A feature é de **apresentação e de teste**. Não toca domínio, não toca dado, não toca contrato
externo. O que ela muda no legado é o **lugar** de onde vem o enquadramento horizontal de toda
tela, e a **forma** da guarda que vigia esse enquadramento — e é essa segunda mudança, não a
primeira, que carrega a severidade alta desta entrega.

## 1. Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `e2e/plataforma.spec.ts` | guarda de regressão da plataforma | regra-alterada | **HIGH** | A rede que vigia a invariante de enquadramento trocou de forma: deixou de medir uma rota nomeada (`/dm2/insulina`) e uma classe (`.calc-regioes`) e passou a percorrer o catálogo medindo o `<main>`. Se alguém a reverter ou a reprender a uma rota, o defeito que a 021 corrige volta a ser possível **em silêncio** — foi exatamente assim que a 020 passou |
| `interface/estilos/moldura.css` | `interface/estilos` | componente-novo | MEDIUM | Nona folha do diretório. Passa a ser a sede única da coluna do corpo, para as duas variantes de `apresentacao`. Alcança **todas** as telas, presentes e futuras |
| `interface/estilos/globais.css` | `interface/estilos` | regra-alterada | MEDIUM | `.calc-regioes` cede `max-width`, `margin: 0 auto` e o recuo lateral, na regra-base e na media query de 900px, e conserva o vertical em `padding-block`. Afeta as cinco calculadoras de uma vez |
| `interface/estilos/inicio.css` | `interface/estilos` | regra-alterada | MEDIUM | Mesma subtração em `.inicio-secoes`, na regra-base e na media query de 544px |
| `interface/estilos/contribuicao.css` | `interface/estilos` | regra-alterada | MEDIUM | Mesma subtração em `.contribuicao-bloco`, terceiro declarante da coluna (D-09). É a única mudança da feature com efeito **visível** fora da tela da ficha |
| `pages/_app.tsx` | `pages` | regra-alterada | LOW | Uma linha de importação, entre `globais.css` e as folhas de tela. A ordem é parte da decisão: a coluna precisa vir antes de quem declara o eixo vertical sobre ela |
| `interface/estilos/consulta-puericultura.css` | `interface/puericultura/consulta` | regra-alterada | LOW | Uma declaração: o piso do `minmax` de `.consulta-identificacao`, de `12rem` para `22rem`. Verificado por guarda de escopo (D-10) |
| `e2e/consulta-puericultura.spec.ts` | guarda da tela da consulta | regra-nova | LOW | Dois roteiros novos, do telefone e do registro longo. Não alteram asserção existente |

## 2. Diff conceitual, por componente

### `interface/estilos` — a coluna deixa de ser repetição e passa a ser regra

Antes desta feature, a coluna do corpo não existia como enunciado em lugar algum: existia como
**coincidência**. As cinco primeiras telas herdavam largura, centralização e recuo por reusarem
`.calc-regioes`, e a home fazia o mesmo por `.inicio-secoes`. Nada dizia que aquilo era uma
invariante da plataforma; o que a sustentava era o hábito de reaproveitar a classe.

Depois, a coluna mora em `moldura.css`, presa ao `<main>` que a `Moldura` emite em toda tela e
governada pelo atributo `data-apresentacao` que o `.pagina` já carregava. Só o eixo horizontal
sobe: 1180px na variante `padrao`, 720px na `destaque`, com recuo de 32px que cai para 16px em
900px e em 544px respectivamente — os dois pontos de quebra que já existiam, mantidos distintos
de propósito. O eixo vertical fica com cada folha, porque varia com legitimidade.

A consequência estrutural é a que interessa daqui a seis meses: **a sétima tela nasce
enquadrada**. Ela não precisa saber que existe largura de coluna, e quem a escrever não precisa
lembrar de nada.

### `interface/comum` — a `Moldura` ganha responsabilidade sem ganhar código

O componente `.tsx` **não mudou**. O `<main>` de `moldura.tsx:115` continua sendo emitido sem
classe e sem atributo próprio: a regra o alcança pelo seletor `.pagina[data-apresentacao="…"] >
main`, apoiada na chave que o pai já emitia. Foi decisão explícita (D-11), porque RN-03 mantém o
`.tsx` fora do alcance de uma feature de estilo — e porque, se a coluna precisar de exceção um
dia, o lugar certo é uma variante nova de `apresentacao`, não uma classe avulsa.

### A guarda geométrica — de lista de verificação a guarda de regressão

Este é o item HIGH, e a razão é empírica: a guarda existia desde a feature 013, para exatamente
este problema, e **não pegou** o defeito da 020. Media `/dm2/insulina`, localizava o corpo por
`.calc-regioes` e repetia o recuo num `GUTTER = 32` chumbado. As três coisas descreviam uma tela,
quando a invariante é da plataforma.

Agora ela percorre as rotas que `interface/inicio/catalogo.ts` declarar — seis hoje —, acrescenta
a home como sétimo caso, mede o `<main>` e lê o recuo do estilo computado. Sobra chumbada apenas
a tolerância de 2px, que é a afirmação que ela de fato faz. Calculadora nova entra no catálogo e
cai sob a guarda no mesmo ato.

Uma propriedade da nova forma merece registro, porque não estava no plano: ao acumular as falhas
em vez de parar na primeira, a guarda **nomeia** as rotas desalinhadas. Foi isso que permitiu, em
T024, observar que ela reprova a consulta entre as seis rotas `padrao` e não reprova a home, que
é `destaque` — prova de que discrimina por variante.

### `interface/puericultura/consulta` — um piso, e só

O piso do `minmax` da identificação sobe de `12rem` para `22rem`, o que dentro da coluna
corrigida produz três campos por faixa em 1280px e um no telefone, sem media query nova. É a
única linha da folha da 020 que esta feature toca, e a restrição foi **verificada** por guarda de
escopo (D-10), não confiada à leitura do revisor: o diff tem um hunk e uma declaração trocada.

## 3. Preservadas

Regras 🟢 do `_reversa_sdd/domain.md` e ADRs que continuam intactos, conferidos por verificação e
não por presunção:

- **ADR 0002, privacidade por arquitetura.** Nenhuma requisição nova; os roteiros de privacidade
  da 020 passam sem alteração de asserção. A feature é CSS.
- **ADR 0003, domínio puro.** `git diff --stat -- models/` vazio. Os quatro domínios e as
  fichas de puericultura não foram tocados.
- **ADR 0011 e MD-0001, fonte editorial única.** Nenhuma citação clínica foi criada, alterada ou
  removida; o inventário textual fecha em 1161 literais, idênticos aos de antes.
- **D-07 da feature 007, o catálogo como fonte única anti-drift.** `interface/inicio/catalogo.ts`
  é agora **lido** pela guarda e permanece sem diff. Ler não é escrever.
- **A calibração do cabeçalho das features 013, 015 e 016.** `cabecalho.css` permanece sem diff, e
  os dois números (`558` e `328`) continuam sendo a referência contra a qual o corpo agora
  encaixa — a diferença é que agora encaixa por regra, e não por coincidência.
- **A baseline de acessibilidade.** `e2e/axe-baseline.json` sem diff; a rota da consulta segue em
  zero violação. O DOM não mudou.
- **As folhas que RF-04 nomeia intocadas:** `puericultura.css`, `cardiologia.css` e
  `risco-cardiovascular.css`, todas com `git diff --stat` vazio.
- **O contrato `interfaces/registro-soap.md` da feature 020**, válido byte a byte.

## 4. Modificadas

- **A sede do enquadramento horizontal.** Era propriedade repetida por folha de tela; passa a ser
  regra única no `<main>` da `Moldura`, governada por `data-apresentacao`. Quem redeclarar a
  coluna numa folha de tela produz coluna **aninhada**, que é o defeito que D-09 encontrou em
  `.contribuicao-bloco`.
- **O alcance e o alvo da guarda geométrica.** De uma rota nomeada e uma classe para a lista do
  catálogo mais a home, medindo o `<main>` e lendo o recuo do estilo computado.
- **O recuo lateral do bloco de apoio da home no telefone**, de 32px para 16px, alinhando-o às
  seções acima dele.
- **A largura da régua que separa o bloco de apoio**, de 720px para a largura de conteúdo da
  coluna. Efeito apurado na decomposição e declarado na terceira premissa do roadmap: é
  consequência de D-09, e vale em **toda** largura, não só no telefone.
