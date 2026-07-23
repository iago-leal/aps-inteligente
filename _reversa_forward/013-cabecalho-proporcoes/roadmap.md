# Roadmap: Proporções do cabeçalho da calculadora (padrão) alinhadas à home

> Identificador: `013-cabecalho-proporcoes`
> Data: `2026-07-23`
> Requirements: `_reversa_forward/013-cabecalho-proporcoes/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Correção só de apresentação, contida em `interface/estilos/cabecalho.css`. A regressão é geométrica: o cabeçalho `padrao` (calculadoras) estende-se de borda a borda da página (`padding: 20px 32px`), enquanto o corpo (`.calc-regioes`) vive numa coluna centrada de 1180px com gutter de 32px — daí o desalinho — e a faixa ficou baixa. A home já resolveu o mesmo problema na variante `destaque`, usando padding lateral com `max()` para encaixar o conteúdo na coluna do corpo, mais respiro vertical. Replicamos exatamente essa técnica no cabeçalho `padrao`, calibrando o `max()` para a coluna de 1180px da calculadora (não os 720px da home) e restaurando o respiro vertical. Nenhuma alteração em `moldura.tsx`, domínio ou catálogo. A validação é visual (capturas home×calculadora, dois temas) somada à suíte existente verde.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. A spec é a fonte de verdade | `requirements.md` precede o código; este roadmap deriva dela | respeita |
| V. Fase 2 proporcional | Escopo mínimo (uma folha CSS), rigor calibrado a uma correção de apresentação | respeita |
| VII. Testes em dois papéis | Nenhuma regra de domínio muda; a suíte de integração/e2e/axe permanece verde sem alterar asserções de conteúdo; guarda de regressão adicional é geométrica e opcional | respeita |
| VIII. Proporcionalidade | Delta de apresentação numa Aplicação: sem novos testes de domínio, verificação visual + suíte intacta | respeita |

Nenhum conflito de princípio.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Alinhar o conteúdo do cabeçalho `padrao` à coluna do corpo via padding lateral com `max()`, replicando a técnica já provada no hero `destaque` de `inicio.css` | Reusa doutrina aprovada; sem wrapper de DOM novo; um só ponto de mudança | (a) inserir um `<div>` wrapper de largura máxima em `moldura.tsx` — mexeria no DOM/JSX; (b) `margin: 0 auto` no conteúdo — quebra o `justify-content: space-between` que separa identidade e ações | 🟢 |
| D-02 | Calibrar o `max()` para a coluna de 1180px da calculadora: `padding-inline: max(32px, calc(50% - 558px))` | O conteúdo do corpo começa em `(100% − 1180)/2 + 32 = 50% − 558px`; abaixo de 1180px de viewport clampa em 32px, igual ao gutter do corpo | Copiar o `calc(50% - 328px)` da home (coluna de 720px) — desalinharia o cabeçalho do corpo de 1180px | 🟢 |
| D-03 | Restaurar o respiro vertical do `padrao` para o ritmo da home (referência 44px topo / 36px base), ajustado por conferência visual | Segundo atributo pedido ("altura"); a home é a referência explícita | Manter 20px (regressão) — descartado | 🟡 |
| D-04 | Aplicar a mudança na regra base `.cabecalho` (que na prática é o `padrao`, pois `destaque` sobrescreve padding e `align-items` por maior especificidade) | Um só ponto; a home permanece intocada porque seu seletor `.pagina[data-apresentacao="destaque"] .cabecalho` vence | Criar seletor `.pagina[data-apresentacao="padrao"]` dedicado — verboso, sem ganho, já que `destaque` sobrescreve | 🟢 |
| D-05 | Reconciliar o `@media (max-width: 900px)` do cabeçalho para respiro reduzido coerente, sem transbordo, mantendo o gutter móvel de 20px | RF-05 pede preservar o responsivo | — | 🟡 |
| D-06 | Verificação por captura visual (home×calculadora × claro/escuro) mais medição de `getBoundingClientRect` (bordas do cabeçalho vs. coluna do corpo, tolerância ≤ 2px); guarda e2e geométrica opcional | Geometria CSS não é unit-testável de forma significativa; a alinhamento é medível objetivamente | Só olhar a tela — descartado por não deixar rastro reprodutível | 🟢 |
| D-07 | Igualar `.cabecalho-marca` à altura da logo da home: `height: 34px` (de 24px) | O usuário pediu tamanho de logo consistente entre home e calculadora; revê o "degrau menor" da feature 009 sem tocar a semântica (marca segue decorativa) | Manter 24px (o usuário considera regressão); tamanho intermediário — sem referência que o justifique | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| A coluna de referência do cabeçalho `padrao` é o corpo da própria calculadora (1180px), não os 720px da home (RN-04) | §4 RN-04, §5 RF-01 | Baixo: se o usuário quiser a coluna estreita da home, basta trocar a constante do `calc()`; a estrutura da correção é a mesma |
| O respiro vertical alvo espelha o 44/36 da home (D-03) | §5 RF-02 | Baixo: valor calibrável na conferência visual, sem mudança estrutural |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| interface/estilos (`cabecalho.css`) | `_reversa_sdd/interface-estilos/requirements.md` | regra-alterada | Padding do cabeçalho base ganha coluna centrada via `max()` e respiro vertical restaurado; `.cabecalho-marca` sobe de 24px para 34px (igual à home); só tokens Primer |
| interface/comum (`Moldura`) | `_reversa_sdd/interface-comum/requirements.md` | inalterado | Nenhuma mudança de DOM/JSX; semântica byte a byte (RN-02) |

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhuma. Feature exclusivamente de apresentação (CSS).
- Detalhe completo em: `_reversa_forward/013-cabecalho-proporcoes/data-delta.md`

## 7. Delta de contratos externos

n/a — nenhum contrato externo (HTTP/fila/gRPC/GraphQL) é tocado. `/api/v1/status` é alheio a esta feature. Diretório `interfaces/` omitido.

## 8. Plano de migração

n/a — mudança de CSS sem estado persistido; sem migração.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Alterar a base `.cabecalho` vazar para a home | alto | baixa | O override `destaque` vence por especificidade; verificar a home pixel-idêntica na conferência visual (RF-04) |
| Transbordo horizontal em viewport estreito pelo `max()` | médio | baixa | O `max(32px, …)` garante gutter mínimo; testar 375px (critério negativo) |
| Respiro vertical exagerado para o título de 20px da calculadora | baixo | média | Calibrar D-03 visualmente; começar em 44/36 e reduzir se necessário |
| Desalinho residual por padding do `.calc-regioes` divergir entre breakpoints | médio | baixa | Medir bordas com `getBoundingClientRect` em ≥1180, 900 e 375px |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] Bordas do cabeçalho `padrao` alinhadas à coluna do corpo (tolerância ≤ 2px) em viewport ≥ 1180px, medido
- [ ] Respiro vertical restaurado, conferido visualmente contra a home
- [ ] Home (variante `destaque`) pixel-idêntica ao estado anterior
- [ ] Suíte de integração + e2e + axe verde, sem alterar asserção de conteúdo
- [ ] `git diff` em `models/` e `catalogo.ts` vazio
- [ ] `regression-watch.md` gerado
- [ ] Capturas home×calculadora × claro/escuro salvas em `screenshots/`

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-plan` | reversa |
