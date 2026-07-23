# Investigation — 008-design-mais-bonito-da-home

> Data: 2026-07-23
> Pesquisa de fundo que sustenta as decisões do `roadmap.md`.

## 1. Estado real da home (EXAME_DO_REAL)

- `interface/inicio/tela.tsx` referencia quatro classes (`inicio-secoes`, `inicio-secao`, `inicio-cartoes`, `inicio-cartao`) que **não existem** em `interface/estilos/globais.css` (grep vazio nas 397 linhas). A home renderiza como lista crua: `<ul>` default, links azuis, sem superfície de cartão.
- A `Moldura` (`interface/comum/moldura.tsx`) já concentra h1, subtítulo, selo (`Label variant="success"`) e alternador de tema; o CSS correspondente (`.pagina`, `.cabecalho*`) vive em `globais.css` sobre tokens (`--bgColor-inset`, `--bgColor-default`, `--borderColor-default`, `--fgColor-muted`).
- `playwright.config.ts` tem um único projeto (`chromium`, Desktop Chrome); nenhum spec manipula viewport hoje — a checagem móvel do RF-03 será necessariamente aditiva.

## 2. Vocabulário Primer disponível (sem dependência nova)

Tokens funcionais do `@primer/primitives` já importados via temas no `_app` — cobrem tudo o que os cartões e o hero precisam:

- Superfícies: `--bgColor-default`, `--bgColor-muted`, `--bgColor-inset`
- Bordas: `--borderColor-default`, `--borderColor-muted`, `--borderColor-accent-emphasis` (foco/hover)
- Texto: `--fgColor-default`, `--fgColor-muted`, `--fgColor-accent`
- Sombras: `--shadow-resting-small`, `--shadow-resting-medium`, `--shadow-floating-small` (elevação no hover)
- Raio e espaçamento: `--borderRadius-medium`, escala `--base-size-*`

Componentes `@primer/react` úteis já no bundle: `Heading`, `Text`, `Label`, `Button`, `Link` (o de navegação continua `next/link`). O `@primer/react` **não** exporta um componente `Card` (cartões no GitHub são CSS sobre tokens) nem um `Hero` (esse é do Primer Brand, pacote distinto e fora do vocabulário aprovado) — confirma a via CSS do D-01/D-05.

## 3. Ícones — `@primer/octicons-react`

- Versão corrente no npm: **19.29.2**; peer `react >= 16.3` (compatível com React 19.2.4 pinado); ~1,1 MB unpacked, mas com export nomeado por ícone — o bundler inclui apenas os importados (delta esperado de poucos kB gzip).
- Candidatos por seção (mapa `id → ícone` na apresentação, D-03): sugestões a validar na fase visual — um ícone clínico-neutro por seção (ex.: `SyringeIcon`/`BeakerIcon` para DM2, `CalendarIcon` para pré-natal) e `ArrowRightIcon`/`ChevronRightIcon` como affordance do cartão, sempre `aria-hidden` (decorativos: o nome acessível permanece o título do link).
- Longevidade: pacote oficial da organização GitHub, release contínua, mesmo ciclo do design system já adotado — passa o filtro de longevidade do mantenedor.

## 4. Padrão *stretched link* (cartão inteiro clicável)

Padrão consolidado (Bootstrap `stretched-link`, GitHub usa variações): o link mantém seu texto como nome acessível e um pseudo-elemento expande a área de clique ao ancestral posicionado:

```css
.inicio-cartao { position: relative; }
.inicio-cartao a::after { content: ""; position: absolute; inset: 0; }
```

Propriedades que interessam aos critérios: um único elemento `<a>` por cartão (asserções `getByRole("link")` e contagem por região intactas); teclado, middle-click, "abrir em nova aba" e leitores de tela funcionam como em qualquer link; foco visível aplicado ao cartão via `:focus-within` + `outline` com token de acento. Custo conhecido: a descrição deixa de ser selecionável por arrasto (risco registrado no roadmap §9).

## 5. Grade responsiva

`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` — colapsa a uma coluna abaixo de ~280 px de célula sem media query e escala a N colunas em desktop. Com duas calculadoras hoje, o `auto-fill` (e não `auto-fit`) evita cartão único esticado em tela larga quando uma seção tem um só item.

## 6. Interação com os gates vigentes

- **Gate de bundle D-08 (feature 004):** limiar de +100 kB gzip no first load; medição por `next build` antes/depois. Octicons tree-shaken deve ficar ordens de grandeza abaixo; ainda assim a medição entra no critério de pronto.
- **Axe baseline (`e2e/axe-baseline.json`):** `home: 0`, telas de IG 0, telas da insulina 1 — aumentar é proibido; o refino da moldura roda sob as três auditorias existentes.
- **Contrato 16/16:** nenhum cabeçalho ou rota muda; o teste de contrato é a guarda de regressão da CSP (RN-04).

## 7. Método visual

A skill `frontend-design` (RN-06, decisão do usuário) entra na fase de coding como método: direção intencional de hierarquia, espaçamento e ritmo tipográfico, restrita ao vocabulário Primer de fábrica (clarify 1a). Evidência de resultado: screenshots das três telas × dois temas anexados ao `relatorio.md` (D-08), já que estética não é capturável por asserção.

## 8. Fontes

- Código do repo: `interface/inicio/tela.tsx`, `interface/comum/moldura.tsx`, `interface/estilos/globais.css`, `playwright.config.ts`, `e2e/axe-baseline.json`, `package.json`
- Extração e adendos: `_reversa_sdd/architecture.md`, `_reversa_sdd/dependencies.md`, `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md`, `_reversa_sdd/addenda/007-idade-gestacional-e-home.md`
- npm registry: `@primer/octicons-react` (versão/peers consultados em 2026-07-23)
- Documentação Primer (primitives/tokens e octicons) — design system já adotado na feature 004
