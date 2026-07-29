# `interface/inicio` — Página inicial por seções

> `requirements.md` · **Re-extração 4 (2026-07-28)**. Features 007 (home por seções), 008
> (design), 014 (2.ª calculadora em Cardiologia) e, nesta passagem, **016, 018, 019 e 020**.

## Visão Geral

Porta de entrada da plataforma: organiza as calculadoras em seções temáticas a partir de um
catálogo tipado, fonte única de navegação. São **quatro seções** desde a feature 017 —
Diabetes Mellitus tipo 2, Pré-natal, Cardiologia e Puericultura —, e **seis calculadoras**,
com Cardiologia e Puericultura trazendo duas cada. 🟢

Duas mudanças de natureza nesta passagem, e nenhuma delas é estética:

1. **O catálogo virou também oráculo da descrição da plataforma** (018). O que ele contém
   define o que se pode afirmar sobre o produto em `<title>`, `<meta>` e manifesto.
2. **O bloco de apoio entra fora do `map` do catálogo** (019). Um item que não calcula nada
   dentro dele corromperia o que o catálogo significa.

## Responsabilidades

- Declarar seções, fichas e rotas no catálogo tipado congelado. 🟢
- Renderizar seções e cartões sobre a Moldura em variante `destaque`. 🟢
- Mapear cada seção a um ícone decorativo, com ausência tolerada. 🟢
- Tornar o cartão inteiro clicável por um único `<a>`, sem JavaScript. 🟢
- Ancorar o bloco de apoio **fora** do catálogo. 🟢
- Servir de oráculo à descrição da plataforma nos metadados. 🟢

## Regras de Negócio

| ID | Regra | Confiança |
|----|-------|-----------|
| RN-01 | O catálogo é a fonte única de navegação: calculadora nova entra ali primeiro. | 🟢 |
| RN-02 | Nenhuma seção nasce vazia. | 🟢 |
| RN-03 | Os ícones são decorativos; o nome acessível é o texto do cartão ou da seção. | 🟢 |
| RN-04 | Um único `<a>` por cartão cobre a área clicável. | 🟢 |
| RN-05 | **(019)** O bloco de apoio fica fora do `map` do catálogo. É a segunda camada da fronteira entre o clínico e o não clínico — a primeira é a isenção declarada no domínio. | 🟢 |
| RN-06 | **(018)** O catálogo é oráculo da descrição da plataforma: o que se afirma nos metadados precisa corresponder ao que ele lista. | 🟢 |
| RN-07 | **(016)** A home não recebe `comInicio` — o comando seria redundante — e a sua identidade é a mesma das demais telas, com logo decorativa e `h1` textual. | 🟢 |
| RN-08 | A descrição de cada ficha cita a fonte clínica da calculadora, com autoria e ano. | 🟢 |
| RN-09 | A home usa a variante `destaque`, cuja coluna é de 720 px. | 🟢 |

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|--------------------|
| RF-01 | Renderizar as seções e os cartões a partir do catálogo. | Must | Cada seção vira uma `<section>` rotulada com os seus cartões. |
| RF-02 | Servir a home na raiz, sem redirecionamento. | Must | `/` monta `TelaInicio`. |
| RF-03 | Exibir ícone decorativo por seção, tolerando id sem mapeamento. | Should | Fallback nulo, sem quebra de layout. |
| RF-04 | Usar a Moldura em `destaque`, sem `comInicio`. | Should | Sem link de início na home. |
| RF-05 | Tornar o cartão clicável por inteiro. | Should | Um `<a>` por cartão. |
| RF-06 | Exibir o bloco de apoio ao fim, fora do catálogo. | Must | Teste de integração confirma que ele não é item de seção. |
| RF-07 | Manter as quatro seções e as seis calculadoras coerentes com as rotas existentes. | Must | Toda rota do catálogo responde. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Manutenibilidade | Catálogo tipado e congelado como fonte única. | `interface/inicio/catalogo.ts` | 🟢 |
| Acessibilidade | Seções rotuladas por `aria-labelledby`; ícones `aria-hidden`. | `tela.tsx`, `icones.tsx` | 🟢 |
| Bundle | Octicons pinados e submetidos a tree-shaking. | `icones.tsx` | 🟢 |
| Exatidão editorial | A descrição da plataforma se afere contra o catálogo. | feature 018 | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: seções e cartões
  Dado o catálogo com quatro seções
  Quando a home renderiza
  Então há quatro <section> rotuladas, com seis cartões ao todo

Cenário: bloco de apoio
  Dado a home renderizada
  Então o bloco de apoio aparece depois das seções
  E não é item de nenhuma seção do catálogo

Cenário: seção sem ícone mapeado
  Quando o ícone é renderizado
  Então nada é exibido, e o layout não quebra

Cenário: cartão clicável
  Quando o usuário clica em qualquer ponto do cartão
  Então navega para a rota da calculadora, sem JavaScript
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Catálogo como fonte única | Must | Núcleo da navegação e oráculo da descrição. |
| Home na raiz | Must | Ponto de entrada. |
| Bloco de apoio fora do catálogo | Must | Preserva o significado do catálogo. |
| Ícones decorativos | Should | Apresentação, com fallback seguro. |
| Cartão clicável e variante destaque | Should | Ergonomia e hierarquia visual. |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `interface/inicio/catalogo.ts` | `CATALOGO`, `SecaoDaPlataforma`, `FichaCalculadora` | 🟢 |
| `interface/inicio/tela.tsx` | `TelaInicio` | 🟢 |
| `interface/inicio/icones.tsx` | `IconeDaSecao`, `ICONES_POR_SECAO` | 🟢 |
| `interface/contribuicao/bloco-de-apoio.tsx` | `BlocoDeApoio`, montado fora do `map` | 🟢 |
