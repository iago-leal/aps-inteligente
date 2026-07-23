# Roadmap: Cabeçalho unificado entre home e calculadoras

> Identificador: `015-cabecalho-unificado`
> Data: `2026-07-23`
> Requirements: `_reversa_forward/015-cabecalho-unificado/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA
> Categoria (Princípio nº 4 / VIII): **Aplicação**, feature de **apresentação** — só CSS + guarda de teste; domínio, catálogo e DOM intocados.

## 1. Resumo da abordagem

A divergência é de CSS, não de componente: uma única `Moldura` (`interface/comum/moldura.tsx`) serve todas as telas, mas o alinhamento vertical da barra de ações está bifurcado — `align-items: center` na regra-base (`cabecalho.css:27`, variante `padrao`) contra `align-items: flex-end` no override da home (`inicio.css:15`, variante `destaque`). Como a identidade da home é mais alta (hero da feature 008), "centro" e "base" caem em alturas diferentes: daí os ícones "mais altos" numa tela que na outra. A correção é unificar o critério de alinhamento numa **regra-única em `cabecalho.css`, ancorando os controles ao topo** (`flex-start`), e remover o override de `inicio.css`, que passa a conter apenas o peso tipográfico do hero. Como a logo/marca tem altura fixa e igual (34px) nas duas telas — invariante já guardada pela feature 013 —, ancorar os ícones ao topo faz a linha-base dos `IconButton` coincidir entre home e calculadora, **preservado o hero** (RF-02). Nenhuma linha da `Moldura` muda; o contrato semântico e de acessibilidade permanece (RF-04). Uma guarda geométrica nova, no molde das da 013, congela a coincidência.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. Spec é a fonte de verdade | Os RF derivam do requirements travado; o CSS é projeção. Ao alterar o alinhamento, os cabeçalhos dos arquivos e o adendo de sync serão reconciliados | respeita |
| II. Cadeia de derivação | Cada decisão D-NN cita o RF-NN que a motiva (RF-01..RF-05) | respeita |
| III. Clarificação precede solução | Escopo, referência e controles foram decididos em `/reversa-clarify` (sessão 2026-07-23); o alinhamento tem >1 saída defensável → 3 alternativas em D-01 | respeita |
| VI. Rastreabilidade bidirecional | As folhas CSS e o e2e citarão os RF; a matriz será atualizada no `/reversa-sync` | respeita |
| VII. Testes em dois papéis | Guarda geométrica de **validação** (RF-01/RF-02) e de **regressão** (não voltar a divergir) no e2e | respeita |
| VIII. Proporcionalidade | Feature de apresentação: sem pirâmide inteira; um teste e2e geométrico + axe basta, coerente com 011/013 | respeita |

Sem conflitos com princípios.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Ancorar a barra de ações ao **topo** do cabeçalho (`align-items: flex-start`) numa **regra-única** em `cabecalho.css`, válida para `padrao` e `destaque` (RF-01/RF-02) | A logo tem altura fixa igual (34px) nas duas telas (guarda 013); ancorando ao topo, os ícones ficam sempre à altura da logo — a diferença de altura da identidade (hero) deixa de mover os ícones. Resolve a queixa mantendo o hero | (b) `align-items: center` unificado — o centro varia com a altura da identidade, hero maior empurra os ícones para baixo; (c) `flex-end` unificado — a base varia igual, não estabiliza | 🟢 |
| D-02 | `inicio.css` perde o `align-items` e mantém **só** o delta tipográfico do hero (h1 28px, subtítulo 14px, `gap` 6px, coluna de 328px, `borderColor-muted`) e seu breakpoint (RF-03) | Concentra o alinhamento na folha-base; a variante `destaque` fica reduzida ao que a justifica — peso de porta de entrada | Mover todo o hero para `cabecalho.css` com seletor `[data-apresentacao]` — junta preocupações e incha a folha do cabeçalho; a home já tem folha própria | 🟢 |
| D-03 | **Não tocar** `interface/comum/moldura.tsx` nem `preferencia-de-tema.ts` | A mudança é puramente de alinhamento CSS; DOM, ordem, aria-labels e a presença condicional do comando de início (RN-03) ficam idênticos | Reorganizar o JSX (ex.: mover ações) — alteraria o contrato sem necessidade | 🟢 |
| D-04 | Estender a guarda geométrica (molde da 013) com uma asserção de **coincidência vertical do alternador de tema** entre home e calculadora, na mesma viewport; alojar em `e2e/cabecalho.spec.ts` por coesão de assunto | Congela RF-01/RF-02 como teste de validação e regressão; `cabecalho.spec.ts` já é o lar do assunto (feature 011) | Deixar as guardas só em `plataforma.spec.ts` — dispersa o assunto cabeçalho por dois specs | 🟡 |

## 4. Premissas

Nenhuma. As três `[DÚVIDA]` iniciais foram resolvidas em `/reversa-clarify` (requirements §9, sessão 2026-07-23); nada foi adotado como premissa não validada.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `interface/estilos` — `cabecalho.css` | `_reversa_sdd/interface-estilos/requirements.md#responsabilidades` | regra-alterada | `align-items: center` → `flex-start` como regra-única do alinhamento vertical (D-01) |
| `interface/estilos` — `inicio.css` | `_reversa_sdd/interface-estilos/requirements.md#responsabilidades` | regra-alterada | Remove o override `align-items: flex-end`; mantém só a tipografia do hero (D-02) |
| `interface/comum` — `moldura.tsx` | `_reversa_sdd/interface-comum/requirements.md` | inalterado | Escopo negativo explícito (D-03) — citado para deixar claro que **não** muda |
| `e2e` — `cabecalho.spec.ts` | `_reversa_sdd/code-analysis.md#testes` | teste-novo | Guarda geométrica de coincidência dos ícones home↔calculadora (D-04) |

## 6. Delta no modelo de dados

- Resumo das mudanças: **n/a** — a plataforma não tem modelo de dados persistido; esta feature é apresentação (CSS). Nenhum campo, tipo ou estado de domínio muda.
- Detalhe completo em: `_reversa_forward/015-cabecalho-unificado/data-delta.md`

## 7. Delta de contratos externos

**n/a.** Nenhum contrato externo é tocado. O `/api/v1/status` (única superfície HTTP, `_reversa_sdd/openapi/status.yaml`) permanece idêntico. Diretório `interfaces/` omitido.

## 8. Plano de migração

**n/a.** Mudança de estilo sem estado persistido: não há dados a migrar. O deploy é o próprio build estático (Vercel); a reversão é um `git revert` do commit de CSS.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| `flex-start` altera o wrapping quando `flex-wrap` ativa em viewport estreita | baixo | baixa | Verificar visualmente nos breakpoints 900px e 544px; as guardas geométricas rodam em viewport largo, complementar com captura móvel no onboarding |
| A home muda de aparência (ícones no topo, antes na base) e desagrada esteticamente | médio | média | É consequência esperada da harmonização; validar por captura antes/depois no onboarding e submeter à aprovação estética antes do commit |
| Guarda geométrica frágil (tolerância apertada demais) | baixo | baixa | Tolerância de 2px, mesma das guardas da 013; medir contra `.cabecalho-acoes`/alternador por `boundingBox` |
| Regressão silenciosa em `axe-baseline` | baixo | baixa | Rodar axe por rota; baseline permanece 0/0 (RF-04) |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `align-items` unificado em `cabecalho.css`; `inicio.css` sem regra de alinhamento (só tipografia do hero)
- [ ] `moldura.tsx` byte a byte intocado (`git diff` vazio no arquivo)
- [ ] Guarda geométrica nova verde: alternador de tema coincide (±2px) entre home e calculadora
- [ ] `axe-baseline` 0/0 por rota; sem cor/fonte/sombra literal (só `var(--*)`)
- [ ] Nenhuma folha CSS acima de 400 linhas
- [ ] Suíte verde (vitest + Playwright + axe); captura antes/depois aprovada esteticamente
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa não exigida (delta de apresentação; `/reversa-sync` cobre via adendo)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-plan` | reversa |
