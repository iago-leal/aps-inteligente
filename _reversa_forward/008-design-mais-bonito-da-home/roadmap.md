# Roadmap: Design mais bonito da página inicial

> Identificador: `008-design-mais-bonito-da-home`
> Data: `2026-07-23`
> Requirements: `_reversa_forward/008-design-mais-bonito-da-home/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A feature é pura camada de apresentação: nenhum motor, rota, contrato ou texto de catálogo muda. O caminho técnico tem quatro movimentos. Primeiro, os estilos da home (hoje inexistentes: as classes `inicio-*` não têm CSS) nascem num arquivo próprio `interface/estilos/inicio.css`, sobre tokens `var(--*)` do Primer, porque `globais.css` está a 397 linhas do limite de 400. Segundo, a `Moldura` comum ganha uma variante de apresentação opcional (`destaque`) que a home usa como área introdutória (RF-04), enquanto o cabeçalho padrão recebe refinamento apenas de CSS, propagado às calculadoras sem mudança de props (RF-07). Terceiro, os cartões viram superfícies delimitadas com ícone de seção (`@primer/octicons-react`, única dependência nova), estados de hover/focus e clique estendido ao cartão inteiro pelo padrão *stretched link* — um único link acessível por cartão, sem JavaScript (RF-01/RF-05). Quarto, a grade responde por CSS Grid (`auto-fill`/`minmax`), uma coluna no móvel (RF-03). A direção visual é conduzida com a skill `frontend-design` na fase de coding, estritamente dentro do vocabulário Primer (RN-06). Cobertura de teste é aditiva: casos novos de integração e um e2e com viewport móvel; nenhuma asserção existente muda.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. Spec é a fonte de verdade | O redesign deriva do `requirements.md` clarificado; RN-02 fixa que asserções e semântica não mudam — divergência observada no código será reconciliada na spec antes do fix | respeita |
| II. Cadeia de derivação | Cada delta abaixo cita o RF-NN que o motiva; nada entra sem RF (o mapa de ícones, por exemplo, realiza RF-01/RN-01, não é adorno espontâneo) | respeita |
| III. Clarificação precede solução | Sessão de 2026-07-23 com cinco respostas (1a, 2b, 3a, 4a, 5b) resolveu escopo, alcance estético, hero, clique e dependência antes deste plano | respeita |
| IV. Portão G1 | Requirements sem `[DÚVIDA]` e com decisões do usuário registradas: seed travado | respeita |
| V. Fase 2 proporcional | Feature de apresentação: roadmap + investigation + data-delta "n/a" + onboarding; sem molde de API (nenhuma superfície) | respeita |
| VI. Rastreabilidade bidirecional | Arquivos novos/editados citarão RF-NN no cabeçalho; `interfaces/` omitido por não haver contrato | respeita |
| VII. Testes como metade da fonte | Sem domínio novo → sem unidade nova; integração e e2e aditivos cobrem RF-04/RF-05/RF-03; property-based n/a | respeita |
| VIII. Proporcionalidade | Rigor de Aplicação/Produto mantido (CI, gates), mas pirâmide proporcional ao caráter visual da mudança | respeita |

Nenhum conflito de princípio identificado.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Estilos novos da home em arquivo próprio `interface/estilos/inicio.css`, importado em `pages/_app.tsx` ao lado de `globais.css`; na moldura, apenas ajuste das regras já existentes em `globais.css` | `globais.css` tem 397 linhas (limite 400, sinal 5.6 do mantenedor); coesão — estilos da home vivem juntos | (a) inchar `globais.css` além de 400; (b) `sx`/styled inline, destoando do padrão de classes da feature 004 | 🟢 |
| D-02 | Cartão inteiro clicável pelo padrão *stretched link*: `.inicio-cartao { position: relative }` e pseudo-elemento do link cobrindo o cartão; zero JavaScript | Mantém um único link acessível com nome = título (asserções de `getByRole("link")` intactas); preserva abrir-em-nova-aba e navegação por teclado | (a) `onClick` + `router.push` no `<li>` (quebra semântica, middle-click e teclado); (b) envolver o cartão inteiro num `<Link>` (nome acessível viraria título+descrição, poluindo o rótulo) | 🟢 |
| D-03 | Ícones por seção via mapa `id → Octicon` na camada de apresentação (`interface/inicio/`), com fallback sem ícone para seção futura; `catalogo.ts` byte a byte | RN-02 congela o catálogo; ícone é apresentação, não navegação; RN-05 preserva o "herda sem CSS ad hoc" | (a) campo `icone` no catálogo (viola RN-02); (b) SVG desenhado à mão (usuário escolheu octicons na sessão de clarify, opção 5b) | 🟢 |
| D-04 | `@primer/octicons-react@19.29.2` pinada (peer `react >= 16.3`, compatível com React 19.2.4); imports por ícone nomeado (tree-shaking); delta medido contra o gate D-08 da feature 004 | Única dependência aprovada no clarify; família oficial do Primer, coerente com RN-01 | (a) sem ícones; (b) biblioteca genérica de ícones (fora do vocabulário Primer) | 🟢 |
| D-05 | `Moldura` ganha prop opcional `apresentacao?: "padrao" \| "destaque"` (default `"padrao"`); a home usa `destaque` (hero: mais respiro, hierarquia tipográfica maior, selo em evidência); calculadoras não mudam de props | RF-04 sem duplicar `h1` (o único h1 continua o da moldura); RF-07 realizado por CSS no cabeçalho padrão; asserções de heading/selo intactas | (a) hero próprio na home com segundo h1 (fere a11y e arrisca asserções); (b) hero dentro de `children` repetindo título (redundância visual) | 🟢 |
| D-06 | Grade dos cartões por CSS Grid `repeat(auto-fill, minmax(~280px, 1fr))`, colapsando a uma coluna no móvel; sem breakpoint JS | RF-03 com CSS puro, determinista e sem estado; padrão consolidado | (a) flexbox com larguras fixas; (b) media queries por dispositivo enumerado | 🟢 |
| D-07 | Cobertura aditiva: casos novos em `tests/integration/interface/inicio.test.tsx` (variante `destaque`, um link por cartão) e teste e2e novo com `page.setViewportSize` móvel em `e2e/plataforma.spec.ts`; nenhum projeto novo no `playwright.config.ts` | O config só tem Desktop Chrome; um projeto móvel global rodaria toda a suíte em dois viewports e tocaria asserções existentes — o teste local realiza o critério do RF-03 sem esse efeito | (a) projeto `mobile` no config (duplicaria a suíte inteira); (b) confiar só em inspeção manual | 🟢 |
| D-08 | Direção visual conduzida com a skill `frontend-design` na fase de coding (RN-06), com captura de screenshots das três telas nos dois temas para o `relatorio.md` | Decisão do usuário; verificação visual não é capturável por asserção — evidência vai ao relatório | (a) codificar direto sem método visual; (b) harness de regressão visual novo (fora de escopo e de orçamento da feature) | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| n/a — nenhuma `[DÚVIDA]` restante; as cinco respostas do clarify de 2026-07-23 cobrem escopo, estética, hero, clique e dependência | §9 Esclarecimentos | — |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `interface/estilos/inicio.css` | `_reversa_sdd/architecture.md#1-estilo-arquitetural` (camada interface) | componente-novo | Estilos da home (hero, seções, grade, cartões) sobre tokens Primer; realiza RF-01/RF-02/RF-03/RF-04 |
| `interface/comum/moldura.tsx` | `_reversa_sdd/addenda/007-idade-gestacional-e-home.md` (D-09 daquela feature) | regra-alterada | Prop opcional `apresentacao` (D-05); semântica (h1, selo, alternador) intacta; realiza RF-04/RF-07 |
| `interface/inicio/tela.tsx` | `_reversa_sdd/addenda/007-idade-gestacional-e-home.md` (módulo interface/inicio) | regra-alterada | Usa `destaque`, cartões com ícone por seção (D-03) e stretched link (D-02); papéis e nomes acessíveis intactos |
| `interface/estilos/globais.css` | `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` (dívida 4 quitada) | regra-alterada | Refinamento das regras existentes do cabeçalho (`.cabecalho*`) para RF-07; permanece < 400 linhas e sem cor própria |
| `package.json` / lockfile | `_reversa_sdd/dependencies.md#runtime` | componente-novo | `@primer/octicons-react@19.29.2` pinada (D-04), sujeita ao gate D-08 da feature 004 |
| `tests/integration/interface/inicio.test.tsx` | `_reversa_sdd/addenda/007-idade-gestacional-e-home.md` (§testes) | regra-alterada | Casos aditivos (D-07); asserções existentes byte a byte |
| `e2e/plataforma.spec.ts` | `_reversa_sdd/addenda/007-idade-gestacional-e-home.md` (harness e2e) | regra-alterada | Teste móvel aditivo (D-07); axe permanece contra `e2e/axe-baseline.json` sem aumento |

Intocados: `models/**` (`git diff models/` vazio), `pages/**` (rotas e metadados), `interface/calculadora/**` e `interface/gestacao/**` (exceto zero mudança de props — apenas herdam o CSS refinado da moldura), `catalogo.ts`, API/CSP/cabeçalhos (contrato 16/16).

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhum — sem banco, sem storage novo, sem campo novo; o único localStorage segue sendo o tema (chave `aps-inteligente:tema`, intocada).
- Detalhe completo em: `_reversa_forward/008-design-mais-bonito-da-home/data-delta.md`

## 7. Delta de contratos externos

Nenhum contrato externo afetado — `GET /api/v1/status`, CSP e cabeçalhos permanecem byte a byte (RN-04); diretório `interfaces/` omitido.

## 8. Plano de migração

n/a — mudança de apresentação sem dado persistido, sem rota alterada e sem redirecionamento; deploy normal pela Vercel.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Refino da moldura regride axe das telas da insulina (linha de base `telaInicial`/`telaComResultado` = 1) | médio | baixo | Rodar o e2e de axe nas três telas; a linha de base nunca aumenta (RNF de acessibilidade) |
| Stretched link degrada seleção de texto da descrição do cartão | baixo | médio | Padrão consolidado; descrição curta; validar no uso real e registrar em watch se incomodar |
| Delta de bundle do octicons dispara o gate D-08 | médio | baixo | Import por ícone (tree-shaking); medir `next build` antes/depois; segunda violação exigiria decisão explícita como a D-10 da feature 004 |
| Contraste insuficiente de superfícies/bordas novas no tema escuro | médio | baixo | Só tokens funcionais do Primer (pensados por tema); conferência axe + inspeção nos dois temas (D-08) |
| "Bonito" é juízo subjetivo — entrega pode não satisfazer o usuário | médio | médio | Método `frontend-design` (RN-06/D-08) + screenshots no relatório para validação humana antes do encerramento |
| Variante `destaque` diverge da padrão com o tempo (drift de moldura) | baixo | baixo | Uma única `Moldura` com prop, jamais dois componentes; registrado para a re-extração |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `lint` + `typecheck` + `npm test` verdes; suíte existente sem asserção alterada (diff dos testes mostra apenas adições)
- [ ] `test:api` 16/16 (CSP e cabeçalhos byte a byte)
- [ ] `test:e2e` verde, incluindo o teste móvel novo; axe sem aumento sobre `e2e/axe-baseline.json` (home 0, telas de IG 0, insulina ≤ 1)
- [ ] `git diff models/` vazio; `catalogo.ts` byte a byte
- [ ] Delta de first load medido e abaixo do gate D-08 (100 kB gzip) ou decisão explícita registrada
- [ ] Nenhum arquivo > 400 linhas; cabeçalhos RF-NN nos arquivos tocados
- [ ] Screenshots das três telas nos dois temas anexados ao `relatorio.md` e aprovados pelo usuário
- [ ] `regression-watch.md` gerado

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-plan` | reversa |
