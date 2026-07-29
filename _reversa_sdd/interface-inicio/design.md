# `interface/inicio` — Design Técnico

> `design.md` · **Re-extração 4 (2026-07-28)**. Features 007, 008, 014, 016, 018, 019 e 020.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `CATALOGO` | `readonly SecaoDaPlataforma[]` | — | Fonte única de navegação, congelada. Quatro seções, seis fichas. |
| `TelaInicio` | `()` | `JSX` | Home sobre a Moldura em `destaque`. |
| `IconeDaSecao` | `({ id })` | `JSX \| null` | Ícone decorativo por seção. |

Tipos:
- `FichaCalculadora`: `{ titulo, descricao, rota }`.
- `SecaoDaPlataforma`: `{ id, titulo, calculadoras }`.

## O catálogo hoje

| Seção | Fichas |
|-------|--------|
| `dm2` — Diabetes Mellitus tipo 2 | Calculadora de insulina |
| `pre-natal` — Pré-natal | Calculadora de idade gestacional |
| `cardiologia` — Cardiologia | Probabilidade pré-teste de cardiopatia isquêmica; risco cardiovascular em 10 anos |
| `puericultura` — Puericultura | Avaliação do crescimento infantil; ficha de consulta de puericultura |

Cada descrição cita a fonte clínica com autoria e ano, o que faz do catálogo, desde a feature
018, também o **oráculo da descrição da plataforma**: o que se afirma em `<title>`, `<meta>` e
manifesto precisa corresponder ao que ele lista. 🟢

## Fluxo Principal

1. `TelaInicio` monta a `Moldura` com `apresentacao="destaque"` e **sem** `comInicio`.
2. Itera o catálogo, produzindo uma `<section aria-labelledby>` por seção.
3. Em cada seção, ícone decorativo e `h2`, seguidos da lista de cartões.
4. Cada cartão traz o título em `Link`, a seta decorativa e a descrição.
5. Depois do `map`, e **fora** dele, o `BlocoDeApoio`.

## Por que o bloco de apoio fica fora do `map`

O catálogo significa "as calculadoras da plataforma", e desde a feature 018 essa afirmação é
aferida contra ele. Um item que não calcula nada dentro do `map` corromperia o significado do
catálogo em duas frentes ao mesmo tempo: a navegação passaria a listar o que não é ferramenta
clínica, e o oráculo da descrição passaria a contar contribuição como funcionalidade. A
separação estrutural é o que impede as duas coisas de uma vez. 🟢

## Fluxos Alternativos

- **Seção sem ícone mapeado:** o componente devolve nulo e o layout segue.
- **Nova seção:** entra no catálogo e, opcionalmente, no mapa de ícones.
- **Nova calculadora:** entra no catálogo primeiro; a rota vem depois.

## Dependências

- `@primer/octicons-react`, pinado, com tree-shaking.
- `@primer/react` — `Heading`, `Text`.
- `next/link`.
- `interface/comum/moldura`.
- `interface/contribuicao/bloco-de-apoio`.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Catálogo tipado e congelado como fonte única. | `catalogo.ts` | 🟢 |
| Ícones fora do catálogo, em mapa separado com fallback nulo. | `icones.tsx` | 🟢 |
| Stretched link: um `<a>` por cartão, sem JavaScript. | `tela.tsx` | 🟢 |
| Variante `destaque` só na home. | `tela.tsx` | 🟢 |
| **(019)** Bloco de apoio ancorado fora do `map`. | `tela.tsx`, comentário in loco | 🟢 |
| **(016)** A home não recebe `comInicio`, e a identidade é a mesma das demais telas. | `tela.tsx` | 🟢 |

## Estado Interno

Nenhum. Renderização pura sobre dados congelados. 🟢

## Observabilidade

Nenhuma. 🟢

## Riscos e Lacunas

- 🟡 **O stretched link depende do CSS de `inicio.css`**: acoplamento visual, não semântico.
  Desde a feature 021, `inicio.css` está reduzida ao mínimo, e a coluna vem de `moldura.css`.
- 🟢 A direção estética permanece dentro do vocabulário Primer, com axe zerado na home.
- 🟡 **O catálogo cresceu de três para quatro seções e de quatro para seis fichas** nesta
  passagem. O arranjo em grade suporta duas fichas por seção; três ainda não foi exercitado.
