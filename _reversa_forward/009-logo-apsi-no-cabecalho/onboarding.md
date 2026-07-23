# Onboarding — testar a logo APSi pela primeira vez

> Feature `009-logo-apsi-no-cabecalho` · 2026-07-23
> Passo a passo executável para conferir a feature de ponta a ponta.

## Pré-requisitos

- Node e dependências instaladas (`npm ci` na raiz do projeto).
- Ativos de origem já disponíveis em `_reversa_forward/009-logo-apsi-no-cabecalho/ativos-origem/`.

## 1. Dev — logo no cabeçalho e troca por tema

```bash
npm run dev
```

- Abra `http://localhost:3000/` (home). **Esperado:** a logo APSi (azul claro, variante `apsi-light`) ocupa o lugar do texto "APS Inteligente"; subtítulo, selo "Nada é salvo nem enviado" e o botão de tema seguem presentes.
- Clique em **"Tema escuro"**. **Esperado:** a logo troca para a variante `apsi-dark` (azul mais claro sobre fundo escuro), sem quebrar o layout.
- Navegue para `http://localhost:3000/dm2/insulina`. **Esperado:** a logo aparece como marca no topo do cabeçalho; **abaixo**, o `<h1>` textual "Calculadora de Insulina — DM2" e o subtítulo "APS Inteligente · Fonte única…". A logo não vira link (nada acontece ao clicar nela).
- Repita em `http://localhost:3000/pre-natal/idade-gestacional`.

## 2. Favicon e ícone do app

- Observe a **aba do navegador**: deve exibir o favicon APSi (tile azul).
- Abra o DevTools → Application → Manifest. **Esperado:** `name` "APS Inteligente", `theme_color` `#0969da`, ícones 192 e 512 listados, sem erros.

## 3. Produção — CSP e instalação

```bash
npm run build && npm run start
```

- Abra o app e o **console**: nenhuma violação de CSP ao carregar as imagens ou o manifesto.
- No Chrome, menu → **Instalar app** (ícone na barra de endereço). **Esperado:** instala com nome "APS Inteligente" e ícone APSi.
- iOS/Safari → Compartilhar → **Adicionar à Tela de Início**. **Esperado:** ícone do tile APSi.

## 4. Acessibilidade

- Com o leitor de tela (VoiceOver/NVDA) na home, o cabeçalho anuncia o heading **"APS Inteligente"** (nome acessível vindo do `alt` da logo).
- Nas calculadoras, o heading anunciado é o nome da calculadora; a marca da logo é silenciosa (`aria-hidden`).

## 5. Suíte automatizada

```bash
npm run lint && npm run typecheck && npm test && npm run test:api && npm run test:e2e
```

- **Esperado:** tudo verde; asserções da suíte 008 inalteradas; `axe-baseline` sem aumento; contrato 16/16.

## Verificação de saúde (rápida)

- `git diff models/` e `git diff interface/inicio/catalogo.ts` **vazios**.
- Delta de first load JS abaixo do gate D-08 (comparar `npm run build` com a base medida em T001).
