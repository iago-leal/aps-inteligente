# interface/inicio — Design Técnico

> `design.md` · Re-extração 2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `CATALOGO` | `readonly SecaoDaPlataforma[]` | — | Fonte única de navegação (congelada) |
| `TelaInicio` | `()` | `JSX` | Home sobre a Moldura em destaque |
| `IconeDaSecao` | `({ id })` | `JSX \| null` | Ícone decorativo por seção |

Tipos (`catalogo.ts:6-16`):
- `FichaCalculadora`: `{ titulo, descricao, rota }`.
- `SecaoDaPlataforma`: `{ id, titulo, calculadoras: FichaCalculadora[] }`.

## Fluxo Principal

1. `TelaInicio` monta a `Moldura` com `apresentacao="destaque"` e `logoComoTitulo`. `tela.tsx:16-22` 🟢
2. Itera `CATALOGO`, produzindo uma `<section aria-labelledby>` por seção. `tela.tsx:24-34` 🟢
3. Em cada seção, `IconeDaSecao` + `<h2>`, depois `<ul>` de cartões. `tela.tsx:30-49` 🟢
4. Cada cartão tem título em `<Link>` (stretched link via CSS), seta decorativa e descrição. `tela.tsx:37-49` 🟢
5. `IconeDaSecao` busca `ICONES_POR_SECAO[id]`; ausente → `null`. `icones.tsx:18-27` 🟢

## Fluxos Alternativos

- **Seção sem ícone mapeado:** `IconeDaSecao` retorna `null`, o layout segue. 🟢
- **Nova seção:** entra no `CATALOGO` (e, opcionalmente, em `ICONES_POR_SECAO`). 🟢

## Dependências

- `@primer/octicons-react` (`ArrowRightIcon`, `BeakerIcon`, `CalendarIcon`, `HeartIcon`) pinado. 🟢
- `@primer/react` (`Heading`, `Text`). 🟢
- `next/link`. 🟢
- `interface/comum/moldura`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Catálogo tipado congelado como fonte única (D-07) | `catalogo.ts:18` | 🟢 |
| Ícones fora do catálogo, mapa separado com fallback null (008) | `icones.tsx:1-4,12-16` | 🟢 |
| Stretched link: um `<a>` por cartão, sem JS (008) | `tela.tsx:37-44` | 🟢 |
| Moldura em destaque só na home (008) | `tela.tsx:20-21` | 🟢 |

## Estado Interno

Nenhum. Componentes de renderização pura sobre dados congelados. 🟢

## Observabilidade

Nenhuma. 🟢

## Riscos e Lacunas

- 🟢 Direção estética conduzida dentro do vocabulário Primer (features 008); axe-baseline da home 0/0.
- 🟡 O stretched link depende do CSS de `inicio.css` (ver `interface-estilos`); acoplamento visual, não semântico.
