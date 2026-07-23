# Data-delta — Logo APSi no cabeçalho e como ícone do app

> Feature `009-logo-apsi-no-cabecalho` · 2026-07-23

## Resumo

**Sem delta no modelo de dados.** A feature é inteiramente de apresentação e de ativos estáticos. O domínio (`models/**`) permanece byte a byte; não há banco, ORM, esquema nem persistência nova.

## Modelo extraído (`_reversa_sdd/`) — impacto

| Entidade / estrutura | Origem na extração | Delta |
|----------------------|--------------------|-------|
| Motor de insulina / gestação (`models/**`) | `_reversa_sdd/domain.md`, `erd-complete.md` | nenhum |
| Catálogo da plataforma (`interface/inicio/catalogo.ts`) | `_reversa_sdd/addenda/007` | nenhum |
| Preferência de tema (`aps-inteligente:tema` em `localStorage`) | `_reversa_sdd/addenda/004` (RN-04) | nenhum — chave e valores inalterados; a logo apenas **lê** o tema já computado |

## Novos artefatos estáticos (não são dados de domínio)

| Artefato | Natureza | Observação |
|----------|----------|------------|
| `public/apsi-light.png`, `apsi-dark.png` | imagem | logo do cabeçalho por tema |
| `public/apsi-tile.png` (512), `apsi-tile-192.png` (192) | imagem | ícone do app / favicon / manifesto |
| `public/apsi-white.png`, `apsi-navy.png` | imagem | versionadas para uso futuro (sobre-foto/impressão), sem referência web |
| `public/manifest.webmanifest` | JSON estático | contrato PWA — ver `interfaces/pwa-manifest.md` |
| favicon | imagem | ícone da aba |

## Migração

n/a — nenhuma migração de dados. Nenhum dado do usuário é criado, movido ou apagado.
