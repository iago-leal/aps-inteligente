# interface/gestacao — Tarefas de Implementação

> `tasks.md` · Re-extração 2.

## Pré-requisitos

- [ ] Motor `models/gestacao` disponível
- [ ] `Moldura` comum e `relator-de-erros` disponíveis

## Tarefas

- [ ] **T-01** Definir `EstadoIg` e o painel de resultado
  - Origem no legado: `interface/gestacao/resultado.tsx`
  - Critério de pronto: variantes vazio/sucesso/erro/falha-inesperada; IG, DPP, trimestre, veredito e notas
  - Confiança: 🟢

- [ ] **T-02** Construir o formulário DUM / ultrassom / ambos
  - Origem no legado: `interface/gestacao/formulario.tsx`
  - Critério de pronto: aceita cada modo; recebe `dataDeHoje`; `onCalcular`/`onAlteracao`
  - Confiança: 🟢

- [ ] **T-03** Montar `AppIdadeGestacional` com data de referência da UI
  - Origem no legado: `interface/gestacao/app.tsx`
  - Critério de pronto: `dataLocalDoDispositivo` injetável; `useMemo` do motor; painel honesto; remonte por `key`; SEM ritual de revisão
  - Confiança: 🟢

- [ ] **T-04** Compor a tela sobre a Moldura
  - Origem no legado: `interface/gestacao/tela.tsx`
  - Critério de pronto: `Moldura` com título/subtítulo da fonte + `AppIdadeGestacional`
  - Confiança: 🟢

## Tarefas de Teste

- [ ] **TT-01** Cálculo por DUM exibe IG/DPP/trimestre
- [ ] **TT-02** Entrada dupla exibe o veredito da comparação
- [ ] **TT-03** Data de referência injetável (`dataDeHoje`) desacopla do relógio
- [ ] **TT-04** Invalidação por edição; painel honesto em exceção
- [ ] **TT-05** Sem rede/storage (relator só nome de erro)

## Ordem Sugerida

1. T-01 e T-02 (painel e formulário).
2. T-03 (contêiner) integra; T-04 (tela) fecha.

## Lacunas Pendentes (🔴)

Nenhuma.
