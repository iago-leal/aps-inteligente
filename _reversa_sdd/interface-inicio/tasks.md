# interface/inicio — Tarefas de Implementação

> `tasks.md` · Re-extração 2.

## Pré-requisitos

- [ ] `@primer/octicons-react` e `@primer/react` disponíveis (versões pinadas)
- [ ] `Moldura` comum disponível
- [ ] Estilos da home (`interface/estilos/inicio.css`) carregados

## Tarefas

- [ ] **T-01** Definir o catálogo tipado congelado
  - Origem no legado: `interface/inicio/catalogo.ts`
  - Critério de pronto: `FichaCalculadora`/`SecaoDaPlataforma` e `CATALOGO` com `Object.freeze`; nenhuma seção vazia
  - Confiança: 🟢

- [ ] **T-02** Mapear ícones por seção com fallback null
  - Origem no legado: `interface/inicio/icones.tsx`
  - Critério de pronto: `ICONES_POR_SECAO` (dm2→Beaker, pre-natal→Calendar, cardiologia→Heart); id desconhecido → `null`; `aria-hidden`
  - Confiança: 🟢

- [ ] **T-03** Renderizar a home a partir do catálogo
  - Origem no legado: `interface/inicio/tela.tsx`
  - Critério de pronto: seções rotuladas (`aria-labelledby`), cartões com stretched link, Moldura em destaque + `logoComoTitulo`
  - Confiança: 🟢

## Tarefas de Teste

- [ ] **TT-01** Home renderiza uma seção por entrada do catálogo, cada uma com seus cartões
- [ ] **TT-02** Clique em qualquer ponto do cartão navega para a rota (stretched link)
- [ ] **TT-03** Seção sem ícone mapeado não quebra (fallback null)
- [ ] **TT-04** axe-baseline da home 0/0; um único h1 (na Moldura)

## Ordem Sugerida

1. T-01 (catálogo) antes de tudo.
2. T-02 (ícones) e T-03 (tela) consomem o catálogo.

## Lacunas Pendentes (🔴)

Nenhuma.
