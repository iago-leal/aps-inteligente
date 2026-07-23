# interface/inicio — Página inicial por seções

> `requirements.md` · Re-extração 3 (2026-07-23). Features 007 (home por seções), 008 (design da home) e **014** (2.ª calculadora na seção Cardiologia).

## Visão Geral

Porta de entrada da plataforma: organiza as calculadoras em seções temáticas (Diabetes Mellitus tipo 2, Pré-natal, Cardiologia) a partir de um catálogo tipado, fonte única de navegação. Renderiza hero de destaque, ícone por seção e cartões clicáveis por inteiro (stretched link). Só apresentação; o catálogo é anti-drift. A feature 014 acrescentou a calculadora de risco cardiovascular à seção Cardiologia — **primeira seção com duas calculadoras**, exercitando a grade de múltiplos cartões por seção. 🟢

## Responsabilidades

- Declarar as seções e rotas num catálogo tipado congelado (`CATALOGO`); a seção `cardiologia` passa a ter duas fichas (dor torácica + risco cardiovascular). 🟢
- Renderizar seções e cartões a partir do catálogo, sobre a Moldura em variante `destaque`. 🟢
- Mapear cada seção a um ícone decorativo (fallback `null` para seção sem ícone). 🟢
- Tornar o cartão inteiro clicável por um único `<a>` por cartão (stretched link, sem JS). 🟢

## Regras de Negócio

- **RN-08** Duas ou mais seções, nenhuma nasce vazia (decisão do usuário 2026-07-23). 🟢
- **D-07** O catálogo é a fonte única de navegação; nova calculadora entra ali primeiro. 🟢
- **RN-02/RN-05 (008)** Ícones são decorativos (`aria-hidden`); o nome acessível é o texto do cartão/seção. 🟢
- **Stretched link** Um único `<a>` por cartão cobre a área clicável, sem JavaScript. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-05 | Seções e cartões dirigidos pelo catálogo | Must | Cada `SecaoDaPlataforma` vira uma `<section>` com seus cartões |
| RF-06 | Home na raiz, sem redirecionamento | Must | `/` monta `TelaInicio` |
| RF-01 (008) | Ícone decorativo por seção | Should | `IconeDaSecao` mapeia id→Octicon; id desconhecido → `null` |
| RF-04 (008) | Moldura em variante destaque | Should | `apresentacao="destaque"` e `logoComoTitulo` na home |
| RF-05 (008) | Cartão inteiro clicável | Should | Um `<a>` por cartão (stretched link) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Manutenibilidade | Catálogo tipado congelado como fonte única | `interface/inicio/catalogo.ts:18` | 🟢 |
| Acessibilidade | Seções rotuladas (`aria-labelledby`); ícones aria-hidden | `tela.tsx:26-34`, `icones.tsx:22-24` | 🟢 |
| Bundle | Octicons pinados e tree-shaken (+~3,9 kB gzip na home) | `icones.tsx:5-10` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o catálogo com três seções
Quando a home renderiza
Então há três <section> rotuladas, cada uma com seus cartões

Dado uma seção com id sem ícone mapeado
Quando renderiza o ícone
Então nada é exibido (fallback null), sem quebrar o layout

Dado um cartão de calculadora
Quando o usuário clica em qualquer ponto do cartão
Então navega para a rota da calculadora (stretched link)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Catálogo + seções/cartões (RF-05) | Must | Núcleo da navegação |
| Home na raiz (RF-06) | Must | Ponto de entrada |
| Ícones decorativos (RF-01/008) | Should | Apresentação; fallback seguro |
| Cartão clicável / destaque (RF-04/RF-05/008) | Should | Ergonomia e hierarquia visual |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `interface/inicio/catalogo.ts` | `CATALOGO` `SecaoDaPlataforma` `FichaCalculadora` | 🟢 |
| `interface/inicio/tela.tsx` | `TelaInicio` | 🟢 |
| `interface/inicio/icones.tsx` | `IconeDaSecao` `ICONES_POR_SECAO` | 🟢 |
