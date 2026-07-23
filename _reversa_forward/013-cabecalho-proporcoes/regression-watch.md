# Regression Watch — Proporções do cabeçalho da calculadora (padrão)

> Feature `013-cabecalho-proporcoes` · 2026-07-23

Itens que a próxima re-extração (`/reversa`) deve reconfirmar. Nenhuma regra de **domínio** foi alterada; os itens abaixo vigiam a camada de **apresentação** (regras 🟢 das specs de interface que esta feature mudou ou introduziu).

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-------------------------------|---------------------|-------------------|
| W001 | `interface/estilos/cabecalho.css` (`.cabecalho`) | O cabeçalho `padrao` encaixa o conteúdo na coluna do corpo (`.calc-regioes`, 1180px) via `padding: 44px max(32px, calc(50% - 558px)) 36px` | presença/redação | Padding volta a `20px 32px` (borda a borda) ou a coluna deixa de bater com o corpo |
| W002 | `interface/estilos/cabecalho.css` (`.cabecalho-marca`) | A marca da logo tem 34px de altura, igual ao wordmark da home (`.cabecalho-logo`) | presença/redação | Altura da marca diverge da home (ex.: volta a 24px) |
| W003 | `interface/comum/moldura.tsx` (RN-02/RN-03/RN-05 de `interface-comum`) | Semântica do cabeçalho intocada: h1, subtítulo, selo, alternador, comando de início e logo decorativa (`aria-hidden`, sem link, sem segundo h1) | presença | Qualquer alteração de DOM/nome acessível do cabeçalho |
| W004 | `interface/estilos/cabecalho.css` (RN-01/004 de `interface-estilos`) | Só tokens `var(--*)` do Primer no cabeçalho; nenhuma cor/fonte/sombra própria | redação | Surge valor literal de cor/fonte/sombra |
| W005 | `interface/estilos/inicio.css` (variante `destaque`) | A home (`destaque`) permanece intocada: `padding: 44px max(32px, calc(50% - 328px)) 36px`, `align-items: flex-end`, coluna de 656px | presença | O override `destaque` é afetado pela mudança na base |

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso quando `/reversa` rodar de novo. -->

## Arquivadas

<!-- Vazio nesta rodada. -->

## Observações (sem peso de regressão)

- **T004 / D-05 (🟡):** o respiro do `@media (max-width: 900px)` (`padding: 28px 20px 24px`) foi calibrado por conferência visual; valor ajustável sem impacto estrutural.
- **RN-04 (🟡):** a coluna de referência escolhida foi a do corpo da calculadora (1180px), não a de 720px da home; se o usuário preferir a coluna estreita, basta trocar a constante do `calc()`.
