# Requirements: Design mais bonito da página inicial

> Identificador: `008-design-mais-bonito-da-home`
> Data: `2026-07-23`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A home nascida na feature 007 organiza as calculadoras em seções, mas nunca recebeu tratamento visual: as classes `inicio-secoes`, `inicio-secao`, `inicio-cartoes` e `inicio-cartao`, presentes no JSX de `interface/inicio/tela.tsx`, não têm um único seletor em `interface/estilos/globais.css` — a página é hoje uma lista crua de links sob a moldura comum. Esta feature dá à home uma apresentação digna de porta de entrada da plataforma: área introdutória de destaque, cartões com aparência de cartão e inteiros clicáveis, hierarquia visual entre seções, layout responsivo e coerência nos dois temas, com refinamento também da moldura comum — que propaga às telas das calculadoras —, tudo dentro da identidade Primer vigente e sem alterar comportamento, rotas, textos do catálogo ou o motor de nenhuma calculadora.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/addenda/007-idade-gestacional-e-home.md#resumo-da-entrega` | A raiz serve a home por seções renderizada do catálogo tipado (`interface/inicio/catalogo.ts`, D-07), sobre a moldura comum (`interface/comum/moldura.tsx`, D-09); nenhuma seção nasce vazia (RN-08) | 🟢 |
| `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md#resumo-da-entrega` | O Primer é a base de estilo integral da plataforma: `@primer/react@38.33.0` + `@primer/primitives@11.9.0` pinados; `@primer/css` e `view_components` vetados; `globais.css` com zero cor própria, resíduo de layout 100% sobre `var(--*)` do Primer | 🟢 |
| `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md#impacto-por-artefato-da-extração` | Gate de bundle D-08 (limiar de +100 kB gzip no first load) existe e já disparou uma vez, resolvido por decisão explícita do usuário (D-10) | 🟢 |
| `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md#cabeçalhos-vigiados` | CSP sem terceiros: nenhum recurso externo (fonte, imagem, script) pode entrar; assets servidos pelo bundle próprio | 🟢 |
| Código vivo: `interface/inicio/tela.tsx` × `interface/estilos/globais.css` | As quatro classes `inicio-*` do JSX não possuem regra CSS correspondente (grep vazio em `globais.css`, 397 linhas); a estilização da home é inexistente, não apenas tímida | 🟢 |
| Testes vigentes: `tests/integration/interface/inicio.test.tsx` e `e2e/plataforma.spec.ts` | Asserções ancoradas em papéis e nomes acessíveis (headings literais das seções, links com o título das calculadoras, `region`/`main`/`h1`, selo "Nada é salvo nem enviado") e em axe com linha de base `home: 0` nos dois viewports | 🟢 |
| `_reversa_sdd/addenda/007-idade-gestacional-e-home.md#impacto-por-artefato-da-extração` | A moldura comum é compartilhada pelas três telas (home, insulina, IG): mudança nela propaga às calculadoras | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Prescritor da APS (Atenção Primária à Saúde): médico ou enfermeiro | Chegar à calculadora certa em segundos, a partir da raiz do site | Abre `aps-inteligente.vercel.app` no consultório, reconhece a seção clínica pelo título e clica no cartão da calculadora desejada 🟢 |
| Prescritor em primeiro contato | Entender de relance o que a plataforma é e que nada é salvo nem enviado | A home comunica propósito, escopo (seções clínicas) e o selo de privacidade sem exigir leitura densa 🟡 |
| Mantenedor (usuário do projeto) | Adicionar calculadoras futuras sem retrabalho visual | Uma entrada nova no `catalogo.ts` herda o estilo de cartão automaticamente, sem CSS ad hoc por calculadora 🟢 |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A identidade visual da home permanece integralmente Primer: componentes de `@primer/react` e tokens `var(--*)` de `@primer/primitives`; nenhuma cor, fonte ou sombra própria fora dos tokens; ícones, quando houver, exclusivamente de `@primer/octicons-react`, pinada e sujeita ao gate D-08 (esclarecido em 2026-07-23). 🟢
   - Origem no legado: `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` (RN-03/RN-05 daquela feature)
   - Tipo: nova (estende à home a regra vigente das calculadoras)
2. **RN-02:** O redesign é puramente de apresentação: catálogo (`catalogo.ts`), rotas, títulos e descrições literais e a semântica acessível (papéis, nomes, landmarks) permanecem byte a byte; a moldura comum pode mudar de apresentação (escopo confirmado em 2026-07-23), mas o selo de privacidade, o alternador de tema e o `h1` permanecem presentes com os mesmos nomes acessíveis — nenhuma asserção de teste existente muda. 🟢
   - Origem no legado: `_reversa_sdd/addenda/007-idade-gestacional-e-home.md` (RN-08, D-07) e precedente das features 004/005 (migração visual sem alterar asserções)
   - Tipo: nova
3. **RN-03:** Toda apresentação nova funciona nos dois temas (claro/escuro) comandados por `data-tema`/`preferencia-de-tema`, sem estado visual próprio da home. 🟢
   - Origem no legado: `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` (RN-04 daquela feature, adaptador de tema)
   - Tipo: nova
4. **RN-04:** Privacidade por arquitetura intocada: zero requisição de rede nova, zero recurso externo (CSP, Content Security Policy, sem terceiros), zero storage novo; ilustrações, se houver, entram como SVG inline ou asset do bundle. 🟢
   - Origem no legado: `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md` e `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md`
   - Tipo: nova (reafirmação vinculante para assets visuais)
5. **RN-05:** O estilo dos cartões deriva do catálogo, não de casos particulares: calculadora futura adicionada ao `catalogo.ts` herda o visual sem CSS específico por item. 🟢
   - Origem no legado: `_reversa_sdd/addenda/007-idade-gestacional-e-home.md` (D-07, fonte única anti-drift; diretriz do README "como adicionar calculadora")
   - Tipo: nova
6. **RN-06:** A direção estética do redesign será conduzida com a skill `frontend-design` (decisão do usuário em 2026-07-23), como método de projeto visual na fase de implementação — intencionalidade e hierarquia acima de defaults genéricos —, aplicada estritamente dentro do vocabulário Primer de fábrica: componentes `@primer/react`, tokens `var(--*)` e ícones `@primer/octicons-react`; a RN-01 permanece íntegra (esclarecido em 2026-07-23, opção "estritamente Primer"). 🟢
   - Origem no legado: n/a (diretiva nova do usuário nesta feature; contexto: a orientação análoga da fase pré-004 fora superada pelo adendo 004)
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Cartões de calculadora com aparência de cartão: contorno/superfície, espaçamento interno, título e descrição hierarquizados e affordance de interação (hover/focus visíveis) | Must | Na home, cada calculadora é um cartão visualmente delimitado; estados hover e focus são perceptíveis; o link mantém o nome acessível igual ao título do catálogo | 🟢 |
| RF-02 | Hierarquia visual entre as seções clínicas: títulos de seção destacados, agrupamento e respiro que tornem a varredura visual imediata | Must | As duas seções são distinguíveis de relance; os headings `h2` literais permanecem e continuam sendo os rótulos das `region` | 🟢 |
| RF-03 | Layout responsivo da grade de cartões: uso confortável em celular (uma coluna) e em desktop (cartões lado a lado quando couber) | Must | Nos dois viewports do e2e a home não apresenta transbordo horizontal e os cartões permanecem clicáveis; axe segue na linha de base 0 | 🟢 |
| RF-04 | Apresentação da identidade da plataforma na home (título, subtítulo e selo de privacidade com peso visual de porta de entrada, área de destaque introdutória acima das seções) | Must | O h1, o subtítulo e o selo "Nada é salvo nem enviado" permanecem presentes e visíveis, com composição melhorada; e2e e integração inalterados | 🟢 |
| RF-05 | Área inteira do cartão clicável (não apenas o texto do link), preservando um único link acessível por cartão | Must | Clicar em qualquer ponto do cartão navega à rota; `getAllByRole("link")` por região continua contando um link por calculadora | 🟢 |
| RF-06 | Registro visual da fonte clínica no cartão (ex.: guia e ano já presentes na descrição ganham tratamento tipográfico próprio) | Could | A informação de fonte clínica é distinguível da descrição sem alterar o texto do catálogo | 🟡 |
| RF-07 | Refinamento visual da moldura comum (identidade, selo, alternador de tema), propagado às telas de insulina e de idade gestacional | Should | As três telas exibem o cabeçalho refinado; suítes de integração e e2e das calculadoras permanecem verdes sem alterar asserções | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Acessibilidade | Axe permanece na linha de base `home: 0` nos dois viewports; contraste dos novos estilos aprovado nos dois temas; navegação por teclado com focus visível | `e2e/plataforma.spec.ts` + `e2e/axe-baseline.json` (adendos 004/007) | 🟢 |
| Desempenho | Gate de bundle D-08 respeitado: única dependência nova admitida é `@primer/octicons-react`, pinada (esclarecido em 2026-07-23); delta de first load pequeno, medido contra o limiar de 100 kB gzip | `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` (D-08/D-10) | 🟢 |
| Segurança/Privacidade | CSP byte a byte; nenhum recurso externo; contrato 16/16 verde | `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md` | 🟢 |
| Manutenibilidade | Estilos da home concentrados em `globais.css` (ou módulo equivalente já existente), sobre tokens Primer, seguindo o padrão das demais telas; arquivo permanece < 400 linhas por unidade | Padrão vigente do repo (globais.css 397 linhas, zero cor própria) | 🟡 |
| Compatibilidade | Nenhuma asserção de teste alterada: 274 unidade/integração + 16 contrato + 10 e2e seguem verdes sem edição de expectativa (exceto acréscimos novos) | Precedente das features 004/005/007 | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: home com cartões estilizados preserva a navegação
  Dado que o prescritor abre a raiz do site
  Quando a home é renderizada
  Então as seções "Diabetes Mellitus tipo 2" e "Pré-natal" aparecem visualmente distintas
  E cada calculadora aparece como cartão delimitado com título e descrição
  E clicar no cartão da calculadora de insulina leva a /dm2/insulina

Cenário: cartão inteiro clicável (RF-05)
  Dado que o prescritor está na home
  Quando clica na descrição do cartão da calculadora de idade gestacional (IG)
  Então a navegação leva a /pre-natal/idade-gestacional
  E cada região de seção continua expondo exatamente um link acessível por calculadora

Cenário: temas claro e escuro
  Dado que o prescritor está na home no tema claro
  Quando alterna para o tema escuro pelo botão da moldura
  Então os cartões e seções mudam de superfície e contraste pelos tokens do Primer
  E nenhum texto perde legibilidade (axe permanece em 0)

Cenário: responsividade sem regressão
  Dado a home aberta no viewport móvel do e2e
  Quando a página é auditada
  Então não há transbordo horizontal, os cartões empilham em coluna única
  E todas as asserções existentes de integração e e2e permanecem verdes

Cenário negativo: conteúdo e comportamento intocados
  Dado o redesign aplicado
  Quando se comparam catálogo, rotas, textos e semântica acessível com o estado anterior
  Então não há diferença: apenas a camada de apresentação (CSS/composição visual) mudou
  E git diff models/ permanece vazio
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (cartões) | Must | É o núcleo da queixa: hoje os cartões não têm estilo algum |
| RF-02 (hierarquia de seções) | Must | Sem ela a home continua lendo como lista crua |
| RF-03 (responsivo) | Must | Uso primário em consultório inclui celular; e2e audita dois viewports |
| RF-04 (identidade/porta de entrada) | Must | Confirmado na sessão de esclarecimentos de 2026-07-23 (área de destaque acima das seções) |
| RF-05 (cartão inteiro clicável) | Must | Comportamento confirmado na sessão de esclarecimentos de 2026-07-23 |
| RF-06 (fonte clínica destacada) | Could | Refinamento tipográfico; só sem alterar texto do catálogo |
| RF-07 (moldura comum refinada) | Should | Escopo confirmado em 2026-07-23; propaga às calculadoras sem alterar asserções |
| RNF de desempenho (gate D-08) | Must | Gate vigente do projeto; segunda violação exigiria nova decisão explícita |

## 9. Esclarecimentos

### Sessão 2026-07-23

- **Q:** Até onde a skill `frontend-design` pode ir em relação à identidade Primer vigente (adendo 004)?
  **R:** Estritamente Primer "de fábrica": só componentes `@primer/react` e tokens, composição discreta (opção a). A RN-01 permanece íntegra; a skill atua na intencionalidade da composição, não na criação de vocabulário visual próprio.
- **Q:** O redesign toca o cabeçalho compartilhado (`interface/comum/moldura.tsx`)?
  **R:** Sim: a moldura também melhora, propagando o visual novo às telas de insulina e de idade gestacional (opção b). Virou o RF-07.
- **Q:** A home deve ganhar uma área de destaque de porta de entrada?
  **R:** Sim, com destaque visual claro acima das seções (opção a). RF-04 promovido a Must.
- **Q:** Cartão inteiro clicável?
  **R:** Sim: qualquer ponto do cartão navega, mantendo um único link acessível por cartão (opção a). RF-05 promovido a Must.
- **Q:** Aceita-se dependência nova para ícones?
  **R:** Sim, apenas `@primer/octicons-react` (ícones oficiais do Primer), pinada e sujeita ao gate D-08 (opção b). Incorporado à RN-01 e ao RNF de desempenho.

## 10. Lacunas

- Nenhuma lacuna pendente: as três dúvidas da versão inicial foram resolvidas na sessão de esclarecimentos de 2026-07-23.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-23 | Sessão de esclarecimentos (5 perguntas: 1a, 2b, 3a, 4a, 5b): RN-01/RN-02/RN-06 consolidadas, RF-04 e RF-05 promovidos a Must, RF-07 criado (moldura comum), `@primer/octicons-react` admitida, lacunas zeradas | reversa (`/reversa-clarify`) |
