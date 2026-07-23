# Actions: Design mais bonito da página inicial

> Identificador: `008-design-mais-bonito-da-home`
> Data: `2026-07-23`
> Roadmap: `_reversa_forward/008-design-mais-bonito-da-home/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 13 |
| Paralelizáveis (`[//]`) | 8 |
| Maior cadeia de dependência | 7 (T004 → T006 → T008 → T009 → T010 → T011 → T012) |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T001 | Medir a linha de base do bundle: `npm run build` no estado atual e registrar o first load gzip das três rotas (`/`, `/dm2/insulina`, `/pre-natal/idade-gestacional`) em nota da feature, para a comparação do gate D-08 (roadmap D-04; RNF de desempenho) | - | `[//]` | `_reversa_forward/008-design-mais-bonito-da-home/` | 🟢 | `[X]` |
| `[//]` T002 | Instalar `@primer/octicons-react@19.29.2` pinada (sem range) via npm, lockfile commitável; conferir peer `react >= 16.3` satisfeita pelo React 19.2.4 (roadmap D-04; RN-01) | - | `[//]` | `package.json` | 🟢 | `[X]` |
| `[//]` T003 | Criar `interface/estilos/inicio.css` (esqueleto comentado citando RF-01..RF-04, sobre tokens `var(--*)`, zero cor própria) e importá-lo em `pages/_app.tsx` logo após `globais.css` (roadmap D-01) | - | `[//]` | `interface/estilos/inicio.css` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T004 | Testes de integração aditivos (nascem falhando): novo `tests/integration/interface/moldura.test.tsx` — `Moldura` nas duas apresentações (`padrao` default e `destaque`) mantém h1, selo "Nada é salvo nem enviado" e alternador com os mesmos nomes acessíveis (RF-04/RF-07; RN-02); acréscimos em `inicio.test.tsx` — home usa a variante `destaque` (marcador observável `data-apresentacao`), ícones de seção decorativos (`aria-hidden`) não alteram nomes acessíveis, segue um link por cartão (RF-05) | - | `[//]` | `tests/integration/interface/moldura.test.tsx` | 🟢 | `[X]` |
| `[//]` T005 | Testes e2e aditivos em `e2e/plataforma.spec.ts` (asserções existentes byte a byte): clique na *descrição* do cartão da IG navega para `/pre-natal/idade-gestacional` (RF-05, nasce falhando); viewport móvel 375×667 via `page.setViewportSize` — sem transbordo horizontal (`scrollWidth ≤ clientWidth`), cartões visíveis e clicáveis, axe da home ≤ linha de base 0 no móvel (RF-03; roadmap D-07) | - | `[//]` | `e2e/plataforma.spec.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T006 | `interface/comum/moldura.tsx`: prop opcional `apresentacao?: "padrao" \| "destaque"` (default `"padrao"`), exposta como `data-apresentacao` para CSS e teste; refinar as regras `.cabecalho*` existentes em `globais.css` (espaçamento, hierarquia tipográfica) mantendo tokens e < 400 linhas; parte de T004 verde, telas das calculadoras sem mudança de props (RF-04/RF-07; roadmap D-05) | T004 | `[//]` | `interface/comum/moldura.tsx` | 🟢 | `[X]` |
| `[//]` T007 | Criar `interface/inicio/icones.tsx`: mapa `id da seção → Octicon` (imports nomeados, `aria-hidden`, tamanho por token), fallback `null` para seção futura sem ícone; `catalogo.ts` byte a byte (RF-01; RN-02/RN-05; roadmap D-03/D-04) | T002 | `[//]` | `interface/inicio/icones.tsx` | 🟢 | `[X]` |
| T008 | `interface/inicio/tela.tsx`: usar `apresentacao="destaque"` na moldura, compor os cartões com ícone da seção, título como link único, descrição e affordance de navegação (octicon decorativo), classes para o *stretched link*; papéis, nomes acessíveis e contagem de links intactos; T004 verde por completo (RF-01/RF-04/RF-05; roadmap D-02/D-03/D-05) | T006, T007 | - | `interface/inicio/tela.tsx` | 🟢 | `[X]` |
| T009 | Estilizar `interface/estilos/inicio.css` conduzido pela skill `frontend-design` (RN-06, estritamente vocabulário Primer): hero da variante `destaque`, seções com respiro e hierarquia, grade `repeat(auto-fill, minmax(~280px, 1fr))` colapsando a uma coluna no móvel, cartões com superfície/borda/raio/sombra por token, estados hover e `:focus-within` visíveis, `::after` do *stretched link*; T005 verde (RF-01/RF-02/RF-03; roadmap D-01/D-02/D-06/D-08) | T003, T008 | - | `interface/estilos/inicio.css` | 🟡 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T010 | Verificação integrada: `lint` + `typecheck` + `npm test` + `test:api` 16/16 + `test:e2e` verdes; diff das suítes existentes mostra apenas adições (nenhuma asserção alterada); axe sem aumento sobre `e2e/axe-baseline.json` (home 0, IG 0, insulina ≤ 1); `git diff models/` e `git diff interface/inicio/catalogo.ts` vazios; nenhum arquivo > 400 linhas (roadmap §10) | T005, T009 | - | `_reversa_forward/008-design-mais-bonito-da-home/` | 🟢 | `[X]` |
| T011 | Medir o bundle final (`npm run build`) e comparar com a linha de base de T001 contra o gate D-08 (< 100 kB gzip no first load); se estourar, parar e registrar decisão explícita do usuário no molde da D-10 da feature 004 (RNF de desempenho) | T001, T010 | - | `_reversa_forward/008-design-mais-bonito-da-home/` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T012 | Consolidar `relatorio.md` da feature com screenshots das três telas nos dois temas (evidência do D-08 do roadmap, para aprovação estética do usuário), medições de bundle (T001/T011) e candidatos a watch: seleção de texto sob *stretched link*, drift futuro da variante `destaque`, axe da insulina em 1 | T011 | `[//]` | `_reversa_forward/008-design-mais-bonito-da-home/relatorio.md` | 🟢 | `[X]` |
| `[//]` T013 | Atualizar o README: estilos da home vivem em `interface/estilos/inicio.css`; diretriz "como adicionar calculadora" ganha a nota do ícone de seção opcional no mapa `interface/inicio/icones.tsx` (fallback sem ícone) | T010 | `[//]` | `README.md` | 🟢 | `[X]` |

## Notas de execução

<!-- Reservado para /reversa-coding. -->

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-to-do` | reversa |
