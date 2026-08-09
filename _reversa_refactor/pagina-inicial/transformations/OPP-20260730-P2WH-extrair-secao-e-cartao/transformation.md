---
schema_version: 1
id: OPP-20260730-P2WH
verb: restructure
state: applied
safety_net:
  kind: characterization
  green_before: true
  green_after: true
preservation:
  method: equivalence-proof
  evidence:
    - safety-net/dom-antes.html
    - safety-net/dom-depois.html
    - safety-net/resultado.md
measurement:
  before: "TelaInicio: 1 função, 3 responsabilidades (moldura, projeção do catálogo, rodapé), 2 map aninhados, profundidade máxima de JSX 7 níveis"
  after: "3 funções nomeadas, 1 responsabilidade cada; TelaInicio com 1 map e profundidade 3; DOM emitido idêntico byte a byte"
change_set:
  - chg: CHG-001
    file: interface/inicio/tela.tsx
    purpose: Extract Function (x2) — CartaoDaCalculadora e SecaoDaHome; TelaInicio fica com a composição
  - chg: CHG-001
    file: tests/apoio/inventario-textual.json
    purpose: artefato gerado, reemitido — dois literais mudaram de linha, e só de linha
approval:
  by: user
  at: 2026-07-30T00:00:00-03:00
  mode: autonomous
reversible_via: [CHG-001.diff]
---

# Extração de `SecaoDaHome` e `CartaoDaCalculadora`

## Refatorações aplicadas, por passo nomeado

**Passo 1 — Extract Function: `CartaoDaCalculadora`.** O `<li>` do `map` interno, com o
título, o link esticado, a seta e a descrição, virou função de um parâmetro
(`calculadora: FichaCalculadora`). O `key` permaneceu no sítio de chamada, onde React o
exige e de onde ele não chega ao DOM.

**Passo 2 — Extract Function: `SecaoDaHome`.** A `<section>` rotulada, com o cabeçalho, o
ícone e a `<ul>`, virou função de um parâmetro (`secao: SecaoDaPlataforma`), chamando a
anterior.

**Passo 3 — nada.** `TelaInicio` não foi reescrita: ela ficou com o que sobrou, que é
exatamente a sua responsabilidade — compor a moldura, iterar as seções e ancorar o bloco de
apoio fora do catálogo. O comentário da feature 019, que explica por que o bloco fica fora
do `map`, permanece byte a byte no lugar onde estava.

O que **não** entrou, e a ausência é deliberada: nenhum `props` novo, nenhuma condicional,
nenhum estado. A oportunidade existe para preparar o terreno da busca, e preparação que já
antecipa a feature deixa de ser refatoração. É o critério de `MD-0042` aplicado ao passo.

Os dois componentes ficaram **no mesmo arquivo**. Promovê-los a módulos próprios é
redistribuição de módulo, que é ato de `modularize` e não de `restructure`; e não há hoje
razão que a justifique, porque não existe segundo consumidor e o arquivo tem 95 linhas. A
promoção fica disponível para o dia em que alguma das duas coisas mude.

## Prova de preservação

A promessa é DOM idêntico, de modo que a prova direta dela é a comparação do DOM, e não a
leitura do diff. A caracterização renderizou `TelaInicio` em jsdom e gravou
`container.innerHTML` antes e depois:

```
diff dom-antes.html dom-depois.html   ->  vazio   (14712 bytes de cada lado)
```

O teste de caracterização foi **temporário** e não ficou no repositório. Um snapshot do DOM
inteiro da home reprovaria a cada feature que a mudasse de propósito, e isso é ruído de
suíte, não rede de segurança. Ele serviu ao passo e saiu com ele; a evidência ficou aqui.

Rede existente, verde nas duas pontas: `vitest` 920/920 em 73 arquivos, `playwright` 26/26
em `plataforma` e `cabecalho`, `tsc` e `eslint` em zero, `prettier` limpo no arquivo tocado.

## Efeito colateral declarado

`tests/apoio/inventario-textual.json` mudou em duas linhas: os dois literais de `tela.tsx`
passaram das linhas 19 e 20 para 80 e 81. Arquivo, texto e classe são os mesmos, e a
contagem segue em 1245.

Não é mudança de comportamento, e a razão está escrita no cabeçalho de `classificacao.mts`:
a chave do mapa é arquivo + texto, **nunca** a linha, precisamente porque a linha se move a
cada edição. O campo existe para nomear o lugar na mensagem de erro, e nenhum teste o
afirma. O arquivo é gerado, e reemiti-lo é a resposta correta a um literal que mudou de
lugar.

## Fronteiras preservadas

RN-04 de `interface-inicio` exige um único `<a>` por cartão, e é ele que o stretched link de
`inicio.css` expande; a asserção que o prende continua verde e a razão foi escrita na
documentação da função extraída, que é onde ela passa a ser lida. RN-03 exige que o ícone
seja decorativo e não participe do nome acessível da região; idem. RN-05 exige o bloco de
apoio fora do `map` do catálogo, e ele não foi tocado.
