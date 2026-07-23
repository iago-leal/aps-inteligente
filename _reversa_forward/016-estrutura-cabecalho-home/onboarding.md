# Onboarding: como testar a feature 016

> Feature `016-estrutura-cabecalho-home` · 2026-07-23
> Para quem vai validar a mudança pela primeira vez, sem contexto prévio.

## O que mudou, em uma frase

O cabeçalho da home passou a ter a mesma estrutura das calculadoras (logo pequena + título textual + subtítulo), de modo que a altura é idêntica em toda a plataforma — sem que nenhum CSS fixe uma altura.

## Pré-requisitos

- Node instalado; dependências já resolvidas (`npm ci` se for a primeira vez).
- Nenhuma variável de ambiente nova; nenhum banco necessário (cálculo é 100% no navegador).

## Passo a passo (verificação visual)

1. Suba o dev server:
   ```bash
   npm run dev
   ```
2. Abra `http://localhost:3000/` (home) e confira o cabeçalho:
   - a **logo APSi** aparece pequena (34px), como marca;
   - **abaixo** dela, o título **"APS Inteligente"** em texto;
   - o **subtítulo** em uma única linha (se estiver em duas, é o gatilho da política D-06 — avise);
   - o selo **"Nada é salvo nem enviado"** sob o subtítulo;
   - **não** há botão de início (⌂) — apenas o alternador de tema.
3. Navegue para uma calculadora (`/dm2/insulina`) e volte:
   - o topo **não deve "pular"**: a faixa do cabeçalho tem a mesma altura da home;
   - aqui **há** o botão de início (⌂) à esquerda do alternador de tema.
4. Repita a conferência de altura em `/pre-natal/idade-gestacional`, `/cardiologia/dor-toracica` e `/cardiologia/risco-cardiovascular` — todas iguais entre si e à home.
5. Clique no alternador de tema em cada tela: a logo troca (clara/escura) e `data-tema` reflete; a altura não muda.

## Passo a passo (verificação automatizada)

```bash
npm run lint && npm run typecheck   # guardrails
npm test                            # vitest (integração da Moldura e home)
npm run test:e2e                    # playwright: guarda de altura + guardas 011/013/015 + axe
```

Espera-se:
- guarda de **altura** verde nas cinco rotas (tolerância ±2px);
- guarda **negativa** verde: nenhum `height`/`min-height` no seletor `.cabecalho`;
- guardas **011** (⌂ ausente na home, presente na calculadora) e **015** (alternador coincidente) seguem verdes;
- `axe-baseline` **0/0** por rota; exatamente **um** `h1` por tela.

> Os comandos exatos (`test:e2e` etc.) seguem os scripts do `package.json`; ajuste o nome se o script local diferir.

## Como reverter mentalmente o que esperar

Se a home voltar a ter a logo grande ocupando o título, ou o cabeçalho dela ficar mais baixo que o das calculadoras, a mudança **não** está aplicada. O sinal de sucesso é o topo não saltar ao navegar entre a home e qualquer calculadora.
