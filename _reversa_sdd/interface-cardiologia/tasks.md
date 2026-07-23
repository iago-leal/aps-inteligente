# interface/cardiologia — Tarefas de Implementação

> `tasks.md` · Re-extração 2.

## Pré-requisitos

- [ ] Motor `models/cardiopatia-isquemica` disponível
- [ ] `Moldura` comum e `relator-de-erros` disponíveis
- [ ] Estilos de cardiologia (`interface/estilos/cardiologia.css`) carregados

## Tarefas

- [ ] **T-01** Definir `EstadoCardiologia` e o painel de resultado
  - Origem no legado: `interface/cardiologia/resultado.tsx`
  - Critério de pronto: quatro variantes (sucesso, fora-do-escopo, erro, falha-inesperada) + vazio; advertência em destaque
  - Confiança: 🟢

- [ ] **T-02** Construir o formulário da avaliação
  - Origem no legado: `interface/cardiologia/formulario.tsx`
  - Critério de pronto: 3 características, fatores de risco, idade, sexo, impedimento e instabilidade; `onCalcular`/`onAlteracao`
  - Confiança: 🟢

- [ ] **T-03** Montar `AppCardiologia` com estado efêmero e invalidação
  - Origem no legado: `interface/cardiologia/app.tsx`
  - Critério de pronto: `useMemo` do motor; `estadoDaSaida`; painel honesto em exceção; remonte por `key`; SEM ritual de revisão
  - Confiança: 🟢

- [ ] **T-04** Construir os blocos de referência complementar
  - Origem no legado: `interface/cardiologia/referencias.tsx`
  - Critério de pronto: 4 `<details>` (CCS, tratamento+Tabela 1, seguimento, agudo) citando página
  - Confiança: 🟢

- [ ] **T-05** Compor a tela sobre a Moldura
  - Origem no legado: `interface/cardiologia/tela.tsx`
  - Critério de pronto: `Moldura` com título/subtítulo da fonte + `AppCardiologia`
  - Confiança: 🟢

## Tarefas de Teste

- [ ] **TT-01** Renderização das 4 variantes de estado
- [ ] **TT-02** Invalidação por edição marca desatualizado
- [ ] **TT-03** Advertência de angina instável aparece com instabilidade
- [ ] **TT-04** Sem ritual de revisão; sem rede/storage (relator só nome de erro)
- [ ] **TT-05** axe-baseline da cardiologia 0/0

## Ordem Sugerida

1. T-01 e T-02 (painel e formulário).
2. T-03 (contêiner) integra ambos; T-04 (referências) e T-05 (tela) fecham.

## Lacunas Pendentes (🔴)

Nenhuma. Pendência 🟡 de fidelidade dos blocos em `models-cardiopatia-isquemica/questions.md` Q-05.
