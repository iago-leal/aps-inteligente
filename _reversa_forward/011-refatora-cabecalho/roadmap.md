# Roadmap: Refatoração do cabeçalho — toggle icônico e navegação de retorno

> Identificador: `011-refatora-cabecalho`
> Data: `2026-07-23`
> Requirements: `_reversa_forward/011-refatora-cabecalho/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A mudança é inteiramente contida em `interface/comum/moldura.tsx` e `interface/estilos/cabecalho.css`, sem tocar nenhum motor de domínio (`models/*`) nem o catálogo. O alternador de tema — hoje um `Button` textual do Primer — passa a ser um `IconButton` do mesmo sistema, exibindo o glifo do tema-alvo (sol quando escuro, lua quando claro) e carregando o nome acessível "Ativar tema claro"/"Ativar tema escuro". O comando de início é um segundo `IconButton`, renderizado como link interno (`next/link`, `href="/"`, ícone casa, `aria-label="Início"`), presente apenas quando a Moldura **não** recebe `logoComoTitulo` — ou seja, nas calculadoras, nunca na home. O selo de privacidade permanece intocado. O trabalho de acompanhamento maior é reconciliar as asserções de teste que fixavam o texto antigo do toggle e a ausência de links na calculadora.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. A spec é a fonte de verdade | Requirements e este roadmap precedem o código; asserções de teste seguem a spec, não o inverso | respeita |
| II. Cadeia de derivação | Cada ação rastreará um RF-NN (RF-01..07); nenhum controle novo entra sem RF de origem | respeita |
| ADR 0002 (privacidade client-side) | Nenhuma coleta/telemetria nova; navegação de início é link interno; selo preservado (RF-06) | respeita |
| ADR 0003 (domínio puro fora do framework) | Mudança confinada à camada de apresentação; `models/*` intocados | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Trocar o `Button` textual do tema por `IconButton` do `@primer/react` com `icon` sol/lua e `aria-label` dinâmico | Mantém a identidade Primer (ADR 004) e o nome acessível textual (RN-05); a lógica de alternância e persistência não muda | Button com ícone + texto oculto (`sr-only`) próprio — reinventa o que o IconButton já resolve | 🟢 |
| D-02 | Glifo do toggle = tema-alvo: `SunIcon` quando escuro, `MoonIcon` quando claro; rótulo "Ativar tema claro/escuro" | Esclarecimento do usuário (Sessão 2026-07-23); alinha ícone e rótulo à ação, não ao estado | Glifo = tema atual | 🟢 |
| D-03 | Comando de início como `IconButton` renderizado por `next/link` (`as={Link}`/wrapper), `href="/"`, `HomeIcon`, só-ícone | Navegação client-side idiomática do Next; anchor real é acessível e testável por `role="link"`; só-ícone atende ao esclarecimento do usuário | `Button` + `router.push` (não é anchor, pior a11y/SEO); `<a>` puro sem IconButton (foge do vocabulário Primer) | 🟢 |
| D-04 | Exibir o comando de início apenas quando `logoComoTitulo` for falso (calculadoras); a home o omite | Esclarecimento do usuário; a Moldura já usa `logoComoTitulo` como discriminante home×calculadora (feature 009) | Prop nova dedicada (`mostrarInicio`) — redundante com o sinal já existente | 🟡 |
| D-05 | Ícones (`SunIcon`, `MoonIcon`, `HomeIcon`) importados de `@primer/octicons-react` já pinado (19.29.2), tree-shaken | Dependência já presente (feature 008/009); custo de bundle desprezível | Novo pacote de ícones | 🟢 |
| D-06 | Reconciliar asserções: e2e do tema passam a buscar "Ativar tema claro/escuro"; o teste da Moldura da 009 deixa de exigir zero `<a>` na calculadora e passa a afirmar que a logo não é link E existe o link "Início" para `/` | A feature introduz deliberadamente um link na calculadora; a asserção antiga (`a.length === 0`) verificava que a logo decorativa não virou link — reescrita para preservar essa intenção sem barrar o novo link | Manter as asserções antigas (bloqueariam a feature) | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| Discriminar home×calculadora por `logoComoTitulo` é suficiente e estável | §10 (resolvido) / D-04 | Baixo — se surgir uma tela sem logo que também deva ocultar o início, extrai-se prop dedicada |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Moldura (cabeçalho) | `_reversa_sdd/architecture.md#moldura-comum` (`interface/comum/moldura.tsx`) | regra-alterada | Toggle textual → icônico; novo comando de início condicional |
| Folha do cabeçalho | `interface/estilos/cabecalho.css` | regra-alterada | Estilos dos controles icônicos (alinhamento, tamanho) sobre tokens Primer |
| Suíte da Moldura | `tests/integration/interface/moldura.test.tsx` | regra-alterada | Asserções do toggle e de links reconciliadas (D-06) |
| e2e de tema | `e2e/plataforma.spec.ts`, `e2e/calculadora.spec.ts` | regra-alterada | Seletores do toggle atualizados; +cenário de navegação início→home |
| Domínio / catálogo / API status | `models/*`, `interface/inicio/catalogo.ts`, `pages/api/v1/status` | inalterado | Nenhuma mudança — regressão a vigiar |

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhum. A preferência de tema já persiste via `interface/calculadora/preferencia-de-tema`, inalterada; nenhum campo, tabela ou storage novo.
- Detalhe completo em: `_reversa_forward/011-refatora-cabecalho/data-delta.md`

## 7. Delta de contratos externos

Nenhum contrato externo é afetado. O contrato `GET /api/v1/status` permanece byte a byte (item de regressão, não de delta). Diretório `interfaces/` omitido.

## 8. Plano de migração

n/a — mudança puramente de apresentação/navegação, sem estado persistido novo nem migração.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Toggle só-ícone sem rótulo derruba a baseline axe (a11y) | alto | baixo | `IconButton` exige `aria-label`; teste de integração afirma nome acessível; axe-baseline reconferido |
| Novo link na calculadora quebra o invariante "logo não é link" (D-04 da 009) | médio | baixo | Link de início é elemento distinto da logo; teste reescrito afirma que a logo segue não-link |
| Seletores e2e por texto exato quebram silenciosamente | médio | alta (esperado) | D-06 atualiza os seletores no mesmo passo da mudança |
| `IconButton` renderizado como link com `next/link` diverge de SSR | médio | baixo | Seguir padrão `as={Link}`/wrapper testado; e2e cobre a navegação real |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `regression-watch.md` gerado
- [ ] Toggle icônico com nome acessível; comando de início só nas calculadoras, navegando para `/`
- [ ] Selo de privacidade preservado em todas as telas
- [ ] Suíte unidade/integração verde; e2e verde (incl. axe-baseline ≤ base); lint + typecheck verdes
- [ ] `models/*`, catálogo e contrato `/api/v1/status` sem diff
- [ ] Nenhum arquivo > 400 linhas

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-plan` | reversa |
