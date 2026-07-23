# Onboarding — Testar as proporções do cabeçalho

> Feature `013-cabecalho-proporcoes` · 2026-07-23

Passo a passo para quem for verificar a feature pela primeira vez.

## Pré-requisitos

- Node instalado; dependências já resolvidas (`npm ci` se for a primeira vez).
- Não precisa de banco: home e calculadoras são client-side puras.

## Subir a aplicação

```bash
cd ~/dev/aps-inteligente
npm run dev
# abre em http://localhost:3000
```

## Roteiro de verificação visual

1. Abra `http://localhost:3000/` (home) — esta é a **referência** de proporção: cabeçalho encaixado na coluna dos cartões, com respiro vertical.
2. Abra `http://localhost:3000/dm2/insulina` (calculadora).
   - A borda esquerda do bloco "APSi / Calculadora de Insulina — DM2 / subtítulo / selo" deve **coincidir** com a borda esquerda dos cartões do formulário abaixo (não colar na borda da página).
   - Os botões de ação (casa + tema) devem alinhar à **borda direita** da coluna do corpo.
   - A faixa do cabeçalho deve **respirar** (não a versão comprimida antiga).
3. Repita em `http://localhost:3000/pre-natal/idade-gestacional` e na calculadora de cardiologia — o comportamento deve ser idêntico (todas usam a Moldura `padrao`).
4. Alterne o tema (botão sol/lua) e confira nos dois temas.
5. Reduza a janela para ~375px de largura: nada deve transbordar na horizontal; o respiro fica reduzido.

## Verificação objetiva do alinhamento (opcional, no console do navegador)

```js
const cab = document.querySelector('.cabecalho-identidade').getBoundingClientRect();
const corpo = document.querySelector('.calc-regioes').getBoundingClientRect();
const gutter = 32; // padding lateral do .calc-regioes
console.log('esquerda cabeçalho:', Math.round(cab.left), '| esquerda conteúdo corpo:', Math.round(corpo.left + gutter));
// devem coincidir (tolerância ≤ 2px) em viewport ≥ 1180px
```

## Suíte automatizada

```bash
npm run test        # unidade + integração (vitest)
npm run test:e2e    # Playwright + axe
npm run lint && npm run typecheck
```

Esperado: tudo verde, sem alteração de asserção de conteúdo do cabeçalho.
