# Onboarding: testar o cabeçalho unificado

> Feature `015-cabecalho-unificado` · 2026-07-23
> Passo a passo para um humano validar a feature pela primeira vez. Gerenciador: **npm** (`package-lock.json`).

## 0. Pré-requisitos

Nenhum serviço externo. A feature é só front-end; o banco (`db:up`) **não** é necessário. Node instalado e dependências já resolvidas (`npm ci` se for a primeira vez).

## 1. Subir a plataforma em desenvolvimento

```bash
cd ~/dev/aps-inteligente
npm run dev
# abre em http://localhost:3000
```

## 2. Inspeção visual — o coração da validação

O objetivo é confirmar que os ícones (alternador de tema e comando de início) e a altura do cabeçalho **não "pulam"** ao trafegar entre a home e uma calculadora.

1. Abra `http://localhost:3000/` (home). Observe a posição vertical do ícone de tema (☾/☀) no canto superior direito.
2. Navegue para uma calculadora, ex.: `http://localhost:3000/dm2/insulina`. O cabeçalho agora traz **dois** ícones (⌂ início + tema).
3. **Critério (RF-01/RF-02):** o ícone de tema deve assentar na **mesma linha-base relativa** (à altura da logo) nas duas telas. A home continua com título/subtítulo maiores — o hero é preservado (RF-02) —, mas os controles não sobem nem descem entre as telas.
4. Repita alternando o tema (clique no ícone): claro↔escuro; a logo troca de `src` e o alinhamento se mantém.
5. **Responsivo:** reduza a janela para ~880px e ~500px de largura (breakpoints 900/544). Confirme que nada transborda e que os ícones seguem coerentes; o cabeçalho pode refluir (`flex-wrap`), mas sem quebra estranha.

### Captura antes/depois (para a aprovação estética)

Antes de commitar, gere capturas da home e de `/dm2/insulina` em viewport largo (1280px) e estreito (500px), nos dois temas, e compare com o estado anterior. A mudança esperada na **home**: os ícones passam a assentar no topo (antes na base). Submeta à aprovação estética.

## 3. Guardas automáticas

```bash
npm run lint          # eslint
npm run typecheck     # tsc --noEmit
npm test              # vitest run (unit + integração)
npm run test:e2e      # playwright: inclui a guarda geométrica nova + axe
```

**Critérios de verde:**

- `test:e2e` — a guarda nova (`e2e/cabecalho.spec.ts`) confirma que a posição vertical do alternador de tema coincide (±2px) entre `/` e `/dm2/insulina` na mesma viewport; as guardas da 013 (alinhamento à coluna do corpo, logo de mesmo tamanho) seguem verdes; `axe-baseline` permanece 0/0 por rota.
- `test` e `typecheck` — sem regressão (a mudança é CSS + 1 teste; nenhum módulo de domínio muda).

## 4. Verificação de contrato (escopo negativo)

```bash
git diff --stat interface/comum/moldura.tsx
# esperado: VAZIO — a Moldura não muda (roadmap D-03)

grep -nE '#[0-9a-fA-F]{3,6}|rgb\(|rgba\(' interface/estilos/cabecalho.css interface/estilos/inicio.css
# esperado: nenhuma cor literal — só var(--*) do Primer (RF-05)

wc -l interface/estilos/*.css
# esperado: nenhuma folha acima de 400 linhas
```

## 5. Como reverter

`git revert` do commit de CSS. Sem estado persistido, sem migração — a reversão é imediata e total.
