# `interface/estilos` — Camada de estilo (cola de layout sobre o Primer)

> `requirements.md` · **Re-extração 4 (2026-07-28)**. Nasce na feature 004 e cresce em 008,
> 009, 010, 011/013, 014 e, nesta passagem, **015 a 021**.

## Visão Geral

**Nove** folhas CSS, contra cinco na passagem anterior, que fornecem apenas a cola de layout
que os componentes do Primer não cobrem. A identidade visual continua sendo do Primer: toda
regra usa `var(--*)` funcional, sem cor, fonte ou sombra própria. 🟢

A mudança estrutural desta passagem é a chegada de `moldura.css`: o enquadramento horizontal
deixou de valer por repetição de classe e passou a ter **sede única**, aplicada ao `<main>` da
Moldura por seletor de atributo (ADR 0021). 🟢

## Responsabilidades

| Folha | Linhas | Papel |
|-------|--------|-------|
| `globais.css` | 367 | Reset, grade da página, cartões, espaçamentos. |
| `inicio.css` | 185 | Hero, seções e cartões da home. Reduzida ao mínimo pela feature 021. |
| `contribuicao.css` | 133 | Painel de apoio, comandos de cópia e QR. |
| `cabecalho.css` | 121 | Família `.cabecalho*` inteira, com as proporções das features 011/013. |
| `consulta-puericultura.css` | 113 | Arranjo da ficha e do registro. |
| `moldura.css` | 79 | **Coluna do corpo** — a sede única do eixo horizontal. |
| `cardiologia.css` | 47 | Peças da tela de cardiologia. |
| `puericultura.css` | 33 | Peças da tela de crescimento. |
| `risco-cardiovascular.css` | 8 | Peças mínimas da tela de risco. |

## Regras de Negócio

| ID | Regra | Confiança |
|----|-------|-----------|
| RN-01 | Só tokens `var(--*)` do Primer; nenhuma cor, fonte ou sombra própria. | 🟢 |
| RN-02 | Teto de 400 linhas por arquivo, com uma preocupação por folha. Nenhuma folha o excede hoje. | 🟢 |
| RN-03 | **A ordem de importação em `_app.tsx` importa**: primitivos do Primer, `globais.css`, `moldura.css`, e depois as folhas de tela, que declaram o eixo vertical sobre a coluna que a moldura estabelece. | 🟢 |
| RN-04 | **(021)** O eixo **horizontal** — largura máxima, centralização, recuo — mora só em `moldura.css`. O **vertical** fica na folha de cada tela, porque varia com legitimidade: 28/56 px nas calculadoras, 40/64 na home, 32/64 no bloco de apoio. | 🟢 |
| RN-05 | As variantes reagem a atributo: `data-apresentacao` para a coluna e o hero, `data-tema` para o tema. | 🟢 |
| RN-06 | Folha nova em vez de acréscimo a `globais.css` é a convenção desde a feature 013. | 🟢 |
| RN-07 | Nenhuma fonte ou folha de terceiro; a CSP não admite origem externa. | 🟢 |

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|--------------------|
| RF-01 | Fornecer a cola de layout sobre tokens do Primer. | Must | Nenhum valor de cor literal. |
| RF-02 | Estabelecer a coluna do corpo por apresentação. | Must | `padrao` em 1.180 px, `destaque` em 720 px, ambas com recuo de 32 px. |
| RF-03 | Calibrar o cabeçalho contra a mesma coluna. | Must | Guardas geométricas em `e2e/cabecalho.spec.ts`: cabeçalho e corpo na mesma faixa. |
| RF-04 | Preservar a proporção da logo. | Should | Altura fixa e largura automática. |
| RF-05 | Estilizar as peças de cada tela em folha própria. | Should | Uma folha por tela nova. |
| RF-06 | Manter toda folha abaixo do teto de 400 linhas. | Must | `globais.css` em 367, a maior. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Manutenibilidade | Uma preocupação por folha; teto respeitado nas nove. | `wc -l interface/estilos/*` | 🟢 |
| Consistência | Regras sobre `data-tema` e `data-apresentacao`, sem duplicação de largura. | `moldura.css` | 🟢 |
| Sem terceiros | Nenhuma fonte ou CDN externa. | `pages/_app.tsx` | 🟢 |
| Previsibilidade | A tela nova nasce enquadrada, sem declarar largura. | ADR 0021 | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: tokens
  Dado qualquer regra de estilo da plataforma
  Quando inspecionada
  Então usa var(--*) do Primer, sem cor, fonte ou sombra literal própria

Cenário: coluna por apresentação
  Dado uma calculadora
  Então o main tem no máximo 1180px, centralizado, com 32px de recuo
  Dado a home
  Então o main tem no máximo 720px, com o mesmo recuo

Cenário: tela nova
  Dado uma sétima tela que declare apenas o seu eixo vertical
  Então ela aparece enquadrada como as demais, sem declarar largura

Cenário: teto de linhas
  Quando se medem as nove folhas
  Então nenhuma passa de 400 linhas
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Coluna do corpo em sede única | Must | Sem ela a invariante volta a depender de coincidência de nome de classe. |
| Tokens do Primer, sem valor próprio | Must | Identidade e temas dependem disso. |
| Uma folha por preocupação | Must | Teto de 400 linhas e legibilidade. |
| Ordem de importação | Must | Trocá-la quebra o enquadramento sem erro em teste unitário. |
| Peças por tela | Should | Cresce com o produto. |

## Rastreabilidade de Código

| Arquivo | Escopo | Cobertura |
|---------|--------|-----------|
| `interface/estilos/moldura.css` | Coluna do corpo, por `data-apresentacao` | 🟢 |
| `interface/estilos/cabecalho.css` | Família `.cabecalho*` e as proporções 011/013 | 🟢 |
| `interface/estilos/globais.css` | Reset, grade, cartões, espaçamentos | 🟢 |
| `interface/estilos/inicio.css` | Hero, seções, cartões, stretched link | 🟢 |
| `interface/estilos/contribuicao.css` | Painel de apoio, cópias e QR | 🟢 |
| `interface/estilos/consulta-puericultura.css` | Ficha e registro | 🟢 |
| `interface/estilos/puericultura.css` | Tela de crescimento | 🟢 |
| `interface/estilos/cardiologia.css` · `risco-cardiovascular.css` | Telas de cardiologia | 🟢 |

> **Nota de contagem:** os adendos 019 e 020 declararam-se **ambos** "a sétima folha", por
> terem corrido em paralelo. O total corrente é **nove**, aferido em 2026-07-28.
