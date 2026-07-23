# Contrato — `manifest.webmanifest` (PWA)

> Feature `009-logo-apsi-no-cabecalho` · 2026-07-23
> Novo contrato externo servido pela aplicação e consumido pelo navegador/SO.

## Requisição

- **Método:** `GET`
- **Caminho:** `/manifest.webmanifest`
- **Origem:** referenciado por `<link rel="manifest" href="/manifest.webmanifest">` em `pages/_document.tsx`
- **Autenticação:** nenhuma (recurso público estático)

## Resposta

- **Status:** `200 OK`
- **MIME:** `application/manifest+json` (servido automaticamente pelo Next para arquivos em `public/`)
- **Corpo (esquema proposto):**

```json
{
  "name": "APS Inteligente",
  "short_name": "APSi",
  "description": "Calculadoras clínicas para a Atenção Primária à Saúde · cálculo 100% no navegador",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#0969da",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/apsi-tile-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/apsi-tile.png", "sizes": "512x512", "type": "image/png", "purpose": "any" }
  ]
}
```

## Erros

- Nenhum caminho de erro dinâmico: arquivo estático. Ausência do arquivo → `404`, degradação graciosa (o app segue funcionando sem instalação).

## Idempotência e cache

- **Idempotente:** sim — `GET` de recurso estático, sem efeito colateral.
- **Cache:** cabeçalhos padrão de `public/` do Next; conteúdo versionado no repositório.

## Timeouts

- n/a — servido junto do restante do site, mesmo host; sem chamada a terceiros (preserva CSP e ADR 0002/0007).

## Notas de confidência

- 🟢 Campos `name`, `short_name`, `theme_color`, `icons` derivam diretamente do brief e do RF-03/RN-04.
- 🟡 `background_color`, `display`, `description` são escolhas convencionais de PWA mínimo; ajustáveis sem impacto de contrato.
