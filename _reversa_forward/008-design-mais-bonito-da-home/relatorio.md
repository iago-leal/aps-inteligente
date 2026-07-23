# Relatório — 008-design-mais-bonito-da-home

> Data: 2026-07-23
> Categoria: Aplicação (camada de apresentação)
> Ações: 13/13 (T001–T013)

## O que mudou

A página inicial, que na feature 007 nasceu funcional mas sem estilo algum (as classes
`inicio-*` do JSX não tinham um único seletor em CSS, e a home renderizava como lista
crua de links), ganhou identidade de porta de entrada:

- **Hero** (variante `destaque` da `Moldura` comum): título, subtítulo e selo de
  privacidade com peso visual acima das seções (RF-04).
- **Seções** com chip de ícone (`@primer/octicons-react`) e hierarquia clara (RF-02).
- **Cartões** delimitados por superfície, borda, raio e sombra em tokens do Primer, com
  hover e foco visíveis (RF-01), **inteiros clicáveis** pelo padrão *stretched link* sem
  JavaScript — um único link acessível por cartão (RF-05).
- **Grade responsiva** `auto-fit`: cartão único estica até a coluna de 720px, dois ou
  mais ficam lado a lado; uma coluna no móvel, sem transbordo horizontal (RF-03).
- **Moldura refinada** (mais respiro e hierarquia tipográfica), propagada às telas de
  insulina e de idade gestacional sem mudança de props (RF-07).

Direção visual conduzida com a skill `frontend-design` (RN-06), estritamente no
vocabulário Primer de fábrica (RN-01): nenhuma cor, fonte ou sombra fora dos tokens.

## Evidência estética (screenshots)

Em `screenshots/` (três telas nos dois temas):

- `home-claro.png` / `home-escuro.png` — desktop 1280×900, coluna de 720px centralizada,
  cartões esticados, ícones de seção, seta de navegação.
- `home-movel-claro.png` — 375px, coluna única, hero compacto, sem rolagem horizontal.

> A palavra final sobre "mais bonito" é do prescritor/mantenedor. Divergências viram
> ajuste antes do encerramento definitivo.

## Ajuste de rota durante a execução

- **Grade `auto-fill` → `auto-fit`** (revisão visual na fase de design): com um único
  cartão por seção, `auto-fill` criava colunas fantasma e deixava o cartão pequeno e
  solitário à esquerda, com grande vazio à direita. `auto-fit` colapsa trilhas vazias e
  o cartão único estica até a coluna; a coluna encolheu de 960 para 720px para concentrar
  a leitura. Melhoria de apresentação, sem efeito em comportamento ou testes.
- **Teste RF-05 com `force: true`**: o *stretched link* faz o `<a>` interceptar os
  eventos de ponteiro sobre a descrição — que é exatamente o comportamento sob teste. O
  actionability check do Playwright recusava o clique no `<p>` coberto; `force` expressa
  a asserção real (o clique na coordenada da descrição navega).
- **`globais.css` de 404 → 400 linhas**: o refino do cabeçalho empurrou o arquivo além
  do limite de 400 do mantenedor (sinal 5.6); o comentário e um refino tipográfico
  marginal foram enxugados de volta a 400.

## Verificação (critério de pronto do roadmap §10)

| Gate | Resultado |
|------|-----------|
| `lint` + `typecheck` | verdes |
| Unidade + integração | 281/281 (7 novos aditivos; asserções antigas byte a byte) |
| Contrato de API | 16/16 (CSP e cabeçalhos byte a byte) |
| E2E | 12/12 (2 novos: cartão clicável e viewport móvel) |
| Axe | home 0, telas de IG 0, insulina 1 — sem aumento sobre `e2e/axe-baseline.json` |
| `git diff models/` | vazio |
| `git diff interface/inicio/catalogo.ts` | vazio |
| Bundle (gate D-08) | delta home +3,9 kB gzip (folga de ~96 kB); ver `medicoes-bundle.md` |
| Arquivos > 400 linhas | nenhum (`globais.css` = 400, `inicio.css` = 188) |

## Candidatos a vigilância (watch)

- **W-08-01** — Seleção de texto da descrição sob o *stretched link*: o `::after` do link
  cobre o cartão, o que dificulta selecionar a descrição por arrasto. Validar em uso real;
  se incomodar, aplicar `pointer-events` seletivo no texto.
- **W-08-02** — Drift da variante `destaque` da `Moldura`: manter uma única `Moldura` com
  prop, jamais dois componentes; a variante é só CSS via `[data-apresentacao]`.
- **W-08-03** — Axe da insulina segue em 1 (herdado, não introduzido por esta feature):
  reduzir quando possível, nunca aumentar.

## Arquivos tocados

Novos: `interface/estilos/inicio.css`, `interface/inicio/icones.tsx`,
`tests/integration/interface/moldura.test.tsx`.
Editados: `interface/comum/moldura.tsx`, `interface/inicio/tela.tsx`,
`interface/estilos/globais.css`, `pages/_app.tsx`,
`tests/integration/interface/inicio.test.tsx`, `e2e/plataforma.spec.ts`,
`package.json`, `package-lock.json`, `README.md`.
Intocados: `models/**`, `interface/inicio/catalogo.ts`, `pages/**` (rotas), CSP e API.
