# interface/comum — Tarefas de Implementação

> `tasks.md` · Re-extração 2.

## Pré-requisitos

- [ ] `@primer/react` disponível (Button, Heading, Label, Text)
- [ ] Store de preferência de tema disponível (`preferencia-de-tema`)
- [ ] Ativos `public/apsi-light.png` e `public/apsi-dark.png` presentes

## Tarefas

- [ ] **T-01** Definir `PropsMoldura` e a assinatura do componente
  - Origem no legado: `interface/comum/moldura.tsx:28-34`
  - Critério de pronto: props `titulo`, `subtitulo`, `apresentacao?`, `logoComoTitulo?`, `children` tipadas `readonly`
  - Confiança: 🟢

- [ ] **T-02** Ler o tema reativo e derivar a fonte da logo
  - Origem no legado: `interface/comum/moldura.tsx:43-44`
  - Critério de pronto: `useSyncExternalStore` com fallback de servidor; `logoSrc` por tema
  - Confiança: 🟢

- [ ] **T-03** Montar cabeçalho (identidade, selo, alternador) e `<main>`
  - Origem no legado: `interface/comum/moldura.tsx:46-92`
  - Critério de pronto: `data-tema`/`data-apresentacao` no contêiner; selo fixo; botão inverte o tema
  - Confiança: 🟢

- [ ] **T-04** Apresentar a logo como título (home) ou marca decorativa (calculadoras)
  - Origem no legado: `interface/comum/moldura.tsx:50-74`
  - Critério de pronto: `logoComoTitulo` → img no h1 com `alt=titulo`; senão img decorativa (`alt=""`, `aria-hidden`) + h1 textual
  - Confiança: 🟢

## Tarefas de Teste

- [ ] **TT-01** Home: um único h1 com nome acessível "APS Inteligente"; logo dentro do heading
- [ ] **TT-02** Calculadora: h1 textual + logo decorativa (aria-hidden), sem segundo h1 nem link
- [ ] **TT-03** Alternador de tema: clique troca `data-tema` e a `src` da logo
- [ ] **TT-04** Variante `destaque` muda só `data-apresentacao`, DOM semântico igual
- [ ] **TT-05** axe-baseline sem violações novas

## Ordem Sugerida

1. T-01 e T-02 (props e leitura de tema).
2. T-03 (estrutura) e T-04 (logo) fecham o componente.

## Lacunas Pendentes (🔴)

Nenhuma. Débito 🟡 conhecido: realocar `preferencia-de-tema` para `interface/comum/` (não bloqueia).
