# `interface/comum` — Design Técnico

> `design.md` · **Re-extração 4 (2026-07-28)**. Componente `Moldura` (React client component).
> Contrato alterado pela feature 016 e escopo ampliado pela 021 (ADR 0021).

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `Moldura` | `(props: PropsMoldura)` | `JSX` | Casca com cabeçalho e `<main>{children}</main>`. |

`PropsMoldura`:

| Prop | Tipo | Padrão | Observação |
|------|------|--------|------------|
| `titulo` | `string` | — | Vira o `h1` textual, em toda tela. |
| `subtitulo` | `string` | — | Texto pequeno sob o título. |
| `apresentacao` | `"padrao" \| "destaque"` | `"padrao"` | Governa o estilo **e a largura da coluna do corpo**. |
| `comInicio` | `boolean` | `false` | Exibe o comando de retorno à home. Substituiu `logoComoTitulo`. |
| `children` | `ReactNode` | — | Conteúdo da tela, montado no `<main>`. |

> **Mudança de contrato (016):** `logoComoTitulo` foi **removida**. Quem ler a base da
> re-extração 3 encontrará a prop antiga; ela não existe mais no componente.

## Fluxo Principal

1. Lê o tema com `useSyncExternalStore(assinarTema, lerTema, lerTemaNoServidor)`.
2. Deriva a fonte da logo a partir do tema.
3. Renderiza `<div className="pagina" data-tema data-apresentacao>` com `<header>` e `<main>`.
4. No cabeçalho: logo decorativa, `h1` textual, subtítulo, selo de privacidade na zona de
   identidade, e a barra de ações com o início opcional e o alternador de tema.
5. O `<main>` recebe `children` e é enquadrado por `moldura.css`, que casa com o
   `data-apresentacao` do contêiner.

## A Moldura como dona do enquadramento (021)

Até a feature 020, a coluna do corpo valia **por repetição**: as cinco primeiras telas
herdavam largura, centralização e recuo por reusarem a mesma classe, e não por regra enunciada
em lugar nenhum. A sexta tela precisou de outro arranjo interno, escreveu classe própria e não
herdou nada — e o cabeçalho, calibrado contra a coluna do corpo na feature 013, ficou
desalinhado do que enquadra. A coincidência de nome de classe era a única coisa segurando a
invariante, e não sobreviveu à primeira tela diferente. 🟢

A correção separou os eixos:

| Eixo | Onde mora | Por quê |
|------|-----------|---------|
| **Horizontal** — largura máxima, centralização, recuo | `moldura.css`, no `<main>` | É invariante da plataforma. |
| **Vertical** — espaçamentos | folha de cada tela | Varia com legitimidade: 28/56 px nas calculadoras, 40/64 na home, 32/64 no bloco de apoio. |

| Apresentação | Coluna | Calibração correspondente do cabeçalho |
|--------------|--------|----------------------------------------|
| `padrao` | 1.180 px, recuo 32 px | `max(32px, calc(50% - 558px))` — 1180/2 − 32 |
| `destaque` | 720 px, recuo 32 px | `calc(50% - 328px)` — 720/2 − 32 |

O `<main>` permanece **sem classe e sem atributo próprio**: a chave é o `data-apresentacao` já
emitido pelo contêiner, o mesmo por onde o cabeçalho se calibra. Dar-lhe classe exigiria tocar
o `.tsx`, que a feature manteve fora de alcance. Consequência: a sétima tela nasce enquadrada
sem precisar lembrar de nada, e deixa de saber que existe largura de coluna. 🟢

## Fluxos Alternativos

- **SSR:** `lerTemaNoServidor` fornece valor estável, evitando o piscar de tema.
- **Home:** mesma identidade das demais, sem o comando de início — ele seria redundante.
- **Tela nova:** herda a coluna por construção; só declara o eixo vertical.

## Dependências

- `@primer/react` — `IconButton`, `Heading`, `Label`, `Text`.
- `@primer/octicons-react` — `HomeIcon`, `MoonIcon`, `SunIcon`, `ShieldLockIcon`.
- `next/link` — o comando de início é link de verdade, não botão que navega.
- `interface/calculadora/preferencia-de-tema` — store de tema. Import cruzado, candidato a
  realocar para `interface/comum`. 🟡
- Ativos `public/apsi-{light,dark}.png`, same-origin, sob a CSP `img-src 'self'`.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Moldura extraída byte a byte na feature 007. | cabeçalho de `moldura.tsx` | 🟢 |
| Identidade unificada: logo sempre decorativa, `h1` sempre textual. | `moldura.tsx`; feature 016 | 🟢 |
| A Moldura é dona do eixo horizontal; a tela, do vertical. | `moldura.css`; ADR 0021 | 🟢 |
| A chave de estilo é `data-apresentacao`, e o `<main>` fica sem classe. | `moldura.css`; `MD-0029` | 🟢 |
| Alternador exibe o tema-alvo. | `moldura.tsx` | 🟢 |
| O início é o único link do cabeçalho. | `moldura.tsx` | 🟢 |
| `<img>` cru, sem `next/image`: ativo leve em `public/`. | `moldura.tsx` | 🟢 |
| Folha própria em vez de acréscimo a `globais.css`, pela convenção desde a 013. | `interface/estilos/moldura.css` | 🟢 |

## Estado Interno

Nenhum estado local. O tema vive no store externo e é lido de forma reativa. 🟢

## Observabilidade

Nenhuma emissão própria. `data-tema` e `data-apresentacao` servem de sonda observável para os
testes de ponta a ponta, inclusive as duas guardas geométricas da feature 013. 🟢

## Riscos e Lacunas

- 🟡 **Import cruzado** de `preferencia-de-tema` a partir de `interface/calculadora/`:
  acoplamento sinalizado no próprio código, ainda sem realocação.
- 🟡 **A ordem de importação das folhas importa**: `moldura.css` vem logo após `globais.css` e
  antes das folhas de tela, que declaram o eixo vertical sobre a coluna que ela estabelece.
  Trocar a ordem quebraria o enquadramento sem erro visível em teste unitário.
- 🟢 A semântica de acessibilidade — um `h1`, logo decorativa, ícones nomeados — é verificada
  por axe nos testes de ponta a ponta.
