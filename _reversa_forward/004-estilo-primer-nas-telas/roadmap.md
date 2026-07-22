# Roadmap: Primer como base de estilo das telas da plataforma

> Identificador: `004-estilo-primer-nas-telas`
> Data: `2026-07-21`
> Requirements: `_reversa_forward/004-estilo-primer-nas-telas/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A feature troca a base de estilo artesanal (`interface/estilos/globais.css`, 699 linhas) pela identidade integral do Primer, pela única via com manutenção ativa: `@primer/react` v38 (variante CSS Modules, sem styled-components), com peer range que já cobre o React 19.2.4 pinado no repo. O caminho tem quatro movimentos, na ordem que protege o comportamento: primeiro nasce o harness Playwright + axe e a linha de base (acessibilidade e bundle) sobre a tela atual; depois a fundação — dependências pinadas, `ThemeProvider` + `BaseStyles` no shell `pages/_app.tsx`, adaptador entre `preferencia-de-tema.ts` e o color mode do Primer; em seguida a migração da calculadora inteira, componente a componente, sem tocar em `models/insulina/**` nem nas máquinas de estado da UI; por fim a redução de `globais.css` a resíduo abaixo de 400 linhas e a re-medição contra a linha de base. A tipografia IBM Plex sai junto com os tokens do design superado: a identidade Primer usa a pilha de fontes do sistema, o que elimina download de fonte e reforça a privacidade por arquitetura. A CSP vigente (`style-src 'self' 'unsafe-inline'`, `font-src 'self'`) acomoda tudo sem alteração.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. Invariante-mãe: a spec é a fonte de verdade | O requirements travado (lacunas zeradas em 2026-07-21) origina este roadmap; a autoridade visual migra do projeto Claude Design para o Primer por decisão de spec (RN-05), não por deriva de código | respeita |
| II. Cadeia de derivação | Cada decisão D-NN abaixo cita o RF/RN que a motiva; nenhum componente entra sem origem (o veto a `@primer/css` e `view_components` deriva da RN-03) | respeita |
| III. Clarificação precede solução | As cinco dúvidas da sessão de 2026-07-21 foram resolvidas antes deste plano; nenhuma `[DÚVIDA]` virou premissa | respeita |
| IV. Portão G1 | Requirements sem lacunas abertas antes do roadmap | respeita |
| V. Fase 2 proporcional | Feature de apresentação: sem molde de API nem de dados novos; `data-delta.md` registra o vazio justificado e `interfaces/` é omitido por não haver contrato externo afetado | respeita |
| VI. Rastreabilidade bidirecional | O critério de pronto exige a matriz atualizada; a migração visual não pode apagar os cabeçalhos RF-NN dos componentes existentes | respeita |
| VII. Testes: metade da fonte de verdade | As 3 suítes de integração da UI são o oráculo comportamental da migração (RF-02); o harness e2e + axe nasce nesta feature com linha de base capturada antes de qualquer mudança (RF-05) | respeita |
| VIII. Proporcionalidade | Categoria Produto (tela clínica em produção): rigor pleno na preservação de comportamento, mas sem artefatos de dados/API que a superfície não tem | respeita |

Nenhum conflito de princípio identificado.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Adotar `@primer/react` **38.33.0** pinado (+ `@primer/primitives` na faixa que ele consome, também pinado), npm com lockfile | RF-01/RN-03: única via do Primer com manutenção ativa; peers `react 18.x \|\| 19.x` cobrem o React 19.2.4 do repo; v38 já é a variante CSS Modules exigida pelo RNF de desempenho | `@primer/css` (KTLO, vetado pela RN-03); `@primer/view_components` (Rails, vetado); manter CSS artesanal (nega a Demanda) | 🟢 |
| D-02 | Fundação no shell: `ThemeProvider` + `BaseStyles` envolvendo `Component` em `pages/_app.tsx`, com o CSS dos temas do `@primer/primitives` importado no mesmo arquivo | RF-01: o Pages Router concentra o bootstrap no `_app.tsx`, exatamente onde hoje entram `globais.css` e as fontes; um único ponto de fundação preserva a previsibilidade de pastas | Provider por página (duplicação); App Router (migração de framework fora de escopo) | 🟢 decisão · 🟡 caminhos exatos de import do primitives, a confirmar no coding contra a doc do v38 |
| D-03 | Tema: `preferencia-de-tema.ts` permanece a fonte de verdade (localStorage `aps-inteligente:tema`, `useSyncExternalStore`); um adaptador fino no shell traduz `claro/escuro` → `day/night` do `colorMode` do ThemeProvider | RN-04/RF-03: preserva chave, degradação graciosa e comportamento SSR atual (servidor nasce claro); troca só o consumidor do valor | Reescrever a preferência sobre a API de color mode do Primer (perderia a chave persistida e o contrato testado); `auto` por `prefers-color-scheme` (muda comportamento — alternância é manual por spec) | 🟢 |
| D-04 | Tipografia: remover IBM Plex Sans/Mono (`next/font`) do `_app.tsx`; valem as pilhas de fonte do Primer (sistema + mono do sistema para dados clínicos) | RN-05: identidade Primer integral, decidida no esclarecimento 1; elimina download de fonte (nenhum recurso de fonte no bundle), reforçando RN-02 e a CSP `font-src 'self'` | Manter IBM Plex sobre componentes Primer (híbrido descartado no esclarecimento 1) | 🟢 |
| D-05 | Migrar a calculadora componente a componente na ordem de risco crescente: `tela.tsx` (moldura) → `resultado.tsx` → `formulario.tsx` e subcomponentes (`glicemias-por-momento`, `antidiabeticos-orais`, `esquema-atual`) — mapeando para `Button`, `TextInput`, `FormControl`, `Flash`, `Checkbox` etc. | RF-02: as 3 suítes de integração rodam verdes após cada componente migrado; `EstadoResultado`, validação espelhada via `CONSTANTES` e ritual de revisão são intocáveis (`code-analysis.md` §módulo-2) | Big-bang de tela inteira num passo (janela de quebra maior, diagnóstico pior) | 🟢 |
| D-06 | `globais.css` vira resíduo: ficam reset/layout específicos que nenhum componente Primer cobre; saem os tokens do design superado (paleta verde-clínica, variáveis `--fonte-*`) | RF-04: quita a dívida técnica nº 4 (`architecture.md` §6); o que for componente vai para o design system | Zerar o arquivo (irrealista: sempre resta cola de layout); CSS Modules próprios por componente (adia a quitação) | 🟢 |
| D-07 | Harness e2e nesta feature: `playwright.config.ts` + specs em `e2e/` usando `@playwright/test` 1.61.1 e `@axe-core/playwright` 4.12.1 **já pinados** no repo; linha de base de acessibilidade capturada sobre a tela atual antes de qualquer mudança visual | RF-05: quita a parte e2e da dívida técnica nº 3 (`dependencies.md` marca os pacotes como "à frente do código"); baseline-antes é a única forma de provar "não regride" | axe em jsdom (não exercita build real); conferência manual (não reproduzível) | 🟢 |
| D-08 | Medição de bundle: `next build` antes e depois, registrando o first load (gzip) da página da calculadora no relatório da feature; delta > 100 kB gzip **reabre este roadmap como decisão**, sem gate bloqueante no CI | Esclarecimento 4; o v38 reduziu bundle na migração para CSS Modules, mas as dependências transitivas (octicons, tanstack-virtual, polyfills) não são desprezíveis — medir, não presumir | Gate numérico no CI (rejeitado no esclarecimento); não medir (cegueira) | 🟢 |
| D-09 | Nenhuma mudança em `next.config.ts`: a CSP vigente já cobre o Primer (CSS estático via bundle = `style-src 'self'`; atributos inline = `'unsafe-inline'` já presente; sem fontes externas) | RN-02: o teste de contrato dos cabeçalhos segue como vigia; se o coding descobrir violação de CSP, é sinal de pacote errado, não de CSP a afrouxar. *Nota do coding:* o arquivo recebeu apenas `transpilePackages: ["@primer/react"]` (diretiva de bundling); CSP byte a byte idêntica, contrato verde | Afrouxar a CSP para acomodar estilo (inverte a hierarquia: a privacidade condiciona o pacote) | 🟢 |
| D-10 | **Gate do D-08 resolvido: delta de bundle aceito.** First load 126,3 → 279,1 kB gzip (+152,8 kB, acima do limiar de 100 kB); decisão do usuário em 2026-07-21 (opção 1 do menu do coding) | App de tela única usada repetidamente: o custo é do primeiro acesso e o CDN cacheia os assets; a contrapartida (design system mantido por terceiro, axe 1→0, `globais.css` −43%) realiza a Demanda. `optimizePackageImports` testado sem efeito — o restante é código usado | Mitigação por poda de CSS funcional (~10–20 kB, não muda a ordem de grandeza); reverter para tokens-only (contradiria os esclarecimentos 1 e 3) | 🟢 |

## 4. Premissas

Nenhuma: o requirements fechou sem marcadores `[DÚVIDA]` (sessão de esclarecimentos de 2026-07-21, cinco dúvidas resolvidas).

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Shell (`pages/_app.tsx`) | `_reversa_sdd/code-analysis.md#módulo-3--pages-shell-nextjs` | regra-alterada | Entra `ThemeProvider` + `BaseStyles` + CSS do primitives; saem `next/font` (IBM Plex) e o par `--fonte-texto`/`--fonte-dados` |
| UI da calculadora (`interface/calculadora/*.tsx`) | `_reversa_sdd/code-analysis.md#módulo-2--interfacecalculadora-apresentação` | regra-alterada | Recomposição visual com componentes `@primer/react`; `EstadoResultado`, validação espelhada, ritual de revisão e `RelatorDeErros` inalterados |
| `interface/calculadora/preferencia-de-tema.ts` | `_reversa_sdd/state-machines.md#3-tema` | regra-alterada | Contrato e chave preservados; ganha só o consumo pelo adaptador de color mode no shell |
| `interface/estilos/globais.css` | `_reversa_sdd/architecture.md#6-dívidas-técnicas` (dívida 4) | regra-alterada | De 699 linhas de identidade própria para resíduo < 400 de cola de layout; tokens do design superado removidos |
| Harness e2e (`playwright.config.ts`, `e2e/`) | `_reversa_sdd/architecture.md#5-qualidade-e-testes` (ausência 🔴) | componente-novo | Nasce o nível e2e da pirâmide com verificação axe; script `test:e2e` deixa de ser quebrado (dívida 3, parte e2e) |
| Dependências de runtime | `_reversa_sdd/dependencies.md#runtime` | componente-novo | O trio Next/React ganha `@primer/react` + `@primer/primitives`, pinados; primeira dependência de UI de terceiro |
| `models/insulina/**` | `_reversa_sdd/architecture.md#1-estilo-arquitetural` | sem mudança | RN-01: fronteira explícita da feature |
| `pages/api/v1/status.ts` e `next.config.ts` | `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md` | sem mudança | Contrato do status e cabeçalhos de segurança intocados; teste de contrato segue vigia (D-09) |

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhum — feature estritamente de apresentação; entidades em memória e o único localStorage (tema, chave preservada) permanecem como estão.
- Detalhe completo em: `_reversa_forward/004-estilo-primer-nas-telas/data-delta.md`

## 7. Delta de contratos externos

Nenhum contrato externo afetado: `GET /api/v1/status` intocado, CSP inalterada, nenhuma origem externa nova em runtime. Diretório `interfaces/` omitido por isso.

## 8. Plano de migração

1. **Linha de base (antes de qualquer mudança visual):** montar `playwright.config.ts` + spec e2e mínima da calculadora com verificação axe; capturar e registrar a linha de base de acessibilidade e o first load do `next build` atual.
2. **Fundação:** instalar e pinar `@primer/react`/`@primer/primitives`; provider + adaptador de tema no `_app.tsx`; app builda e roda com a tela antiga ainda estilizada pelo CSS legado (coexistência transitória).
3. **Migração da tela:** componente a componente na ordem do D-05, com as suítes de integração verdes a cada passo.
4. **Limpeza:** remover IBM Plex e os tokens superados; reduzir `globais.css` a < 400 linhas; arquivar a referência ao Claude Design como histórica (RN-05).
5. **Verificação final:** suítes completas + teste de contrato + e2e/axe contra a linha de base + re-medição de bundle registrada; delta > 100 kB gzip reabre decisão (D-08).

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Acréscimo de bundle acima de 100 kB gzip (dependências transitivas do `@primer/react`) | médio | médio | D-08: medição antes/depois; estourou, reabre como decisão (ex.: importar componentes seletivamente) em vez de seguir cego |
| Flash ou divergência de hidratação no color mode (servidor nasce claro, cliente ajusta) | médio | médio | D-03 preserva o mecanismo atual já testado; usar o recurso de SSR-safe color mode do ThemeProvider; cenário de recarga com tema escuro coberto no e2e |
| Suítes de integração acopladas a marcação antiga (seletores/classes) quebrarem sem mudança de comportamento | médio | alto | Ajustar apenas seletores, nunca asserções comportamentais (critério do RF-02); revisar diff dos testes separadamente do diff dos componentes |
| Acessibilidade regredir em componentes recompostos (rótulos, ordem de foco) | alto | baixo | Linha de base axe capturada antes; violações novas bloqueiam o pronto (RF-05); componentes Primer são acessíveis por padrão |
| Caminhos de import do primitives divergirem entre versões (🟡 do D-02) | baixo | médio | Confirmar na doc do v38 no primeiro passo do coding; erro aqui falha no build, nunca silenciosamente |
| Texto clínico mudar por efeito colateral da recomposição | alto | baixo | Critério "byte a byte nos textos clínicos" do Gherkin; textos vêm do domínio intocado (RN-01), e as suítes os asserem |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Suítes de unidade + integração verdes sem asserções comportamentais alteradas (RF-02)
- [ ] Teste de contrato dos cabeçalhos de segurança verde sem mudança na CSP (RN-02/D-09)
- [ ] `test:e2e` funcional com axe; violações ≤ linha de base (RF-05)
- [ ] `wc -l interface/estilos/globais.css` < 400 (RF-04)
- [ ] Delta de bundle medido e registrado no relatório da feature (D-08)
- [ ] `@primer/css` e `@primer/view-components` ausentes do manifesto (cenário negativo do requirements)
- [ ] Matriz de rastreabilidade consistente (Princípio VI)
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-21 | Versão inicial gerada por `/reversa-plan` | reversa |
| 2026-07-21 | D-10: gate de bundle do D-08 disparado no coding (+152,8 kB gz) e resolvido pelo usuário — delta aceito; nota de execução no D-09 (`transpilePackages`) | reversa (decisão: iago) |
