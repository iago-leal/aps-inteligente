# interface/estilos — Tarefas de Implementação

> `tasks.md` · Re-extração 2.

## Pré-requisitos

- [ ] `@primer/primitives` e `@primer/react` disponíveis
- [ ] Classes/atributos contratados com os componentes (`.pagina`, `data-tema`, etc.)

## Tarefas

- [ ] **T-01** `globais.css`: reset, grade da página, cartões e base do cabeçalho
  - Origem no legado: `interface/estilos/globais.css`
  - Critério de pronto: só `var(--*)` do Primer; ≤ 400 linhas
  - Confiança: 🟢

- [ ] **T-02** `cabecalho.css`: camada da logo (proporção 314×138, wordmark × marca)
  - Origem no legado: `interface/estilos/cabecalho.css`
  - Critério de pronto: altura fixa, largura automática; importado após globais
  - Confiança: 🟢

- [ ] **T-03** `inicio.css`: hero em destaque, seções, cartões e stretched link
  - Origem no legado: `interface/estilos/inicio.css`
  - Critério de pronto: coluna clínica de 720px; stretched link cobre o cartão
  - Confiança: 🟢

- [ ] **T-04** `cardiologia.css`: radios e blocos da tela de cardiologia
  - Origem no legado: `interface/estilos/cardiologia.css`
  - Critério de pronto: sobre tokens; classes genéricas herdadas de globais
  - Confiança: 🟢

- [ ] **T-05** Ordem de import em `_app.tsx`
  - Origem no legado: `pages/_app.tsx:22-25`
  - Critério de pronto: primitivos → globais → cabecalho → inicio → cardiologia
  - Confiança: 🟢

## Tarefas de Teste

- [ ] **TT-01** Inspeção: nenhuma cor/fonte/sombra literal própria (só tokens)
- [ ] **TT-02** Nenhum arquivo de estilo > 400 linhas
- [ ] **TT-03** e2e visual: hero e seções na coluna de 720px; stretched link clicável

## Ordem Sugerida

1. T-01 (base) primeiro; T-02..T-04 sobrepõem; T-05 fixa a cascata.

## Lacunas Pendentes (🔴)

Nenhuma. Débito 🟡: `globais.css` no teto de 400 linhas.
