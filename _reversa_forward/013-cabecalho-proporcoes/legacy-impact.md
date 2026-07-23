# Legacy Impact — Proporções do cabeçalho da calculadora (padrão)

> Feature `013-cabecalho-proporcoes` · 2026-07-23 · cenário: legado (âncora `architecture.md` + `domain.md`)

## Arquivos afetados

| Arquivo afetado | Componente (`_reversa_sdd/`) | Tipo | Severidade | Justificativa |
|-----------------|------------------------------|------|------------|---------------|
| `interface/estilos/cabecalho.css` | interface/estilos (`architecture.md` → camada de estilo) | regra-alterada (apresentação) | LOW | Padding do cabeçalho base ganha coluna centrada via `max()` e respiro vertical restaurado; `.cabecalho-marca` sobe de 24px para 34px. Só apresentação, sobre tokens Primer |
| `e2e/plataforma.spec.ts` | interface/comum + interface/estilos (harness e2e) | componente-novo (teste) | LOW | Duas guardas de regressão geométricas aditivas (alinhamento e tamanho da logo); asserções anteriores byte a byte |

## Diff conceitual por componente

**interface/estilos (`cabecalho.css`).** A regra base `.cabecalho` — que na prática governa a variante `padrao` das calculadoras, já que `destaque` a sobrescreve por especificidade — deixou de estender o conteúdo de borda a borda da página (`padding: 20px 32px`) e passou a encaixá-lo na coluna do corpo (`.calc-regioes`, 1180px centrados) pela técnica de `padding: 44px max(32px, calc(50% - 558px)) 36px`, a mesma já provada no hero `destaque` de `inicio.css`. O respiro vertical voltou ao ritmo da home (44/36). A camada da logo teve `.cabecalho-marca` elevada de 24px para 34px, igualando o wordmark da home e revendo o "degrau menor" da feature 009. O `@media (max-width: 900px)` foi reconciliado para respiro reduzido coerente (gutter 20px), sem transbordo. Nenhuma cor/fonte/sombra própria; RN-01 (004) de `interface-estilos` íntegra.

**interface/comum (`Moldura`).** Não tocada. A semântica do cabeçalho (h1, subtítulo, selo, alternador, comando de início, logo decorativa `aria-hidden`) permanece byte a byte; RN-02/RN-03/RN-05 de `interface-comum` preservadas.

## Preservadas

Todas as regras 🟢 de `_reversa_sdd/domain.md` permanecem intactas — a feature não toca domínio:

- Motores de `models/insulina`, `models/gestacao` e `models/cardiopatia-isquemica` inalterados (`git diff models/` vazio).
- Catálogo tipado (`interface/inicio/catalogo.ts`) inalterado (fonte única de navegação, D-07).
- ADR-0002 (privacidade client-side): o selo "Nada é salvo nem enviado" segue presente e fixo; apresentação não o enfraquece.
- RN-01 (004) de `interface-estilos`: só tokens Primer, nenhuma cor literal.
- RN-02/RN-03/RN-05 de `interface-comum`: variante puramente visual, logo decorativa sem virar link nem segundo h1.

## Modificadas

Nenhuma regra de **domínio** modificada. Modificações restritas à camada de **apresentação**:

1. **Proporção do cabeçalho `padrao`:** de "conteúdo de borda a borda, faixa comprimida (20px)" para "conteúdo encaixado na coluna do corpo, faixa com respiro (44/36)". Origem: `_reversa_sdd/interface-estilos/requirements.md` (RF-07/008 tratava só do hero da home). Confidência da nova regra: 🟢.
2. **Tamanho da logo no `padrao`:** de "marca um degrau menor (24px)" (feature 009) para "marca igual ao wordmark da home (34px)". Origem: `_reversa_sdd/addenda/009-logo-apsi-no-cabecalho.md`. Confidência: 🟢.
