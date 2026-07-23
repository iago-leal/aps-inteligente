# interface/comum — Design Técnico

> `design.md` · Re-extração 2. Componente `Moldura` (React client component).

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `Moldura` | `(props: PropsMoldura)` | `JSX` | Casca com cabeçalho + `<main>{children}</main>` |

`PropsMoldura` (`moldura.tsx:28`):

| Prop | Tipo | Default | Observação |
|------|------|---------|------------|
| `titulo` | `string` | — | Vira o h1 (ou o `alt` da logo, na home) |
| `subtitulo` | `string` | — | Texto pequeno sob o título |
| `apresentacao` | `"padrao" \| "destaque"` | `"padrao"` | Só CSS (`data-apresentacao`) |
| `logoComoTitulo` | `boolean` | `false` | Só a home usa `true` |
| `children` | `ReactNode` | — | Conteúdo da tela |

## Fluxo Principal

1. Lê o tema com `useSyncExternalStore(assinarTema, lerTema, lerTemaNoServidor)`. `moldura.tsx:43` 🟢
2. Deriva `logoSrc` do tema (`/apsi-dark.png` ou `/apsi-light.png`). `moldura.tsx:44` 🟢
3. Renderiza `<div className="pagina" data-tema data-apresentacao>` com `<header>` e `<main>`. `moldura.tsx:46-92` 🟢
4. No cabeçalho, decide a apresentação da logo por `logoComoTitulo`: dentro do h1 (home) ou marca decorativa + h1 textual (calculadoras). `moldura.tsx:50-74` 🟢
5. Renderiza selo de privacidade e botão de tema (`gravarTema` inverte claro↔escuro). `moldura.tsx:79-90` 🟢

## Fluxos Alternativos

- **SSR:** `lerTemaNoServidor` fornece valor estável, evitando flash de tema. 🟢
- **Logo como título (home):** `<img>` dentro do `h1`, `alt={titulo}` — nome acessível intacto. 🟢
- **Logo decorativa (calculadoras):** `alt=""`, `aria-hidden`, fora do heading — sem segundo h1. 🟢

## Dependências

- `@primer/react` (`Button`, `Heading`, `Label`, `Text`). 🟢
- `interface/calculadora/preferencia-de-tema` — store de tema (assinar/ler/gravar). Import cruzado; candidato a realocar para `interface/comum` numa próxima feature (nota no cabeçalho do arquivo). 🟡
- Ativos `public/apsi-{light,dark}.png` (same-origin, sob a CSP `img-src 'self'`). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Moldura extraída byte a byte (feature 007, D-09) | `moldura.tsx:1-9` | 🟢 |
| Variante só por CSS, semântica preservada (feature 008, RN-02) | `moldura.tsx:47` | 🟢 |
| Logo por tema lido no próprio componente (feature 009, D-02) | `moldura.tsx:43-44` | 🟢 |
| `<img>` cru sem `next/image` (ativo leve em public/, D-02) | `moldura.tsx:52-53,63-64` | 🟢 |

## Estado Interno

Nenhum estado local; o tema vive no store externo (`preferencia-de-tema`), lido de forma reativa. 🟢

## Observabilidade

Nenhuma emissão própria. O `data-tema` serve de sonda observável para testes e2e. 🟢

## Riscos e Lacunas

- 🟡 Import cruzado de `preferencia-de-tema` a partir de `interface/calculadora/`: acoplamento a realocar, sinalizado no próprio código.
- 🟢 Semântica de acessibilidade (um h1, logo decorativa) verificada por axe-baseline nas features 008/009.
