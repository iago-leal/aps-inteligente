# Requirements: Logo APSi no cabeçalho e como ícone do app

> Identificador: `009-logo-apsi-no-cabecalho`
> Data: `2026-07-23`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA
> Categoria (Princípio nº 4): **Aplicação** — evolução de identidade visual de ferramenta com usuários, sem novo domínio.

## 1. Resumo executivo

A plataforma passa a ter identidade de marca: a logo **APSi** (wordmark manuscrito) substitui o texto do wordmark no cabeçalho e se torna o ícone do app (favicon e ícone de tela inicial). A entrega é inteiramente de **apresentação** — não toca domínio, catálogo, rotas, textos clínicos nem o motor de nenhuma calculadora. Resolve a lacuna de a home e as abas do navegador exibirem apenas texto/ícone genérico, dando à Atenção Primária uma marca reconhecível, coerente com o azul de ênfase do Primer nos dois temas e sem qualquer recurso de rede a terceiros.

## 2. Contexto a partir do legado

O usuário forneceu, junto dos ativos, um **brief de integração** (`ativos-origem/brief-integracao.dc.html`) que fixa o mapeamento peça→uso e as cores, reproduzido na seção 4.

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/addenda/008-design-mais-bonito-da-home.md#impacto-por-artefato` | `Moldura` (`interface/comum/moldura.tsx`) é o cabeçalho único de todas as telas; o h1 é o `titulo`, o selo de privacidade e o alternador de tema completam o cabeçalho; a variante `apresentacao` é só CSS, semântica idêntica | 🟢 |
| `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` | Identidade visual é o Primer; azul de ênfase `#0969da` (claro) / `#4493f8` (escuro); gate de bundle **D-08** (< 100 kB gzip no first load) vigente | 🟢 |
| `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md` (feature 002, RN-06) | CSP sem terceiros; `next.config.ts` define `img-src 'self' data:` — imagens same-origin já permitidas, nenhuma origem externa | 🟢 |
| `_reversa_sdd/code-analysis.md#módulo-3` | Shell `pages/_document.tsx` (com `<Head/>` vazio hoje) e `pages/_app.tsx` são os pontos de injeção de `<link>` de favicon e de importação de estilos | 🟢 |
| `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md` / `0007-telemetria-nula-fase-1.md` | Zero rede com dado clínico, zero telemetria: a logo não pode introduzir requisição externa | 🟢 |
| Código atual: `interface/comum/moldura.tsx`, `interface/inicio/tela.tsx`, `interface/calculadora/tela.tsx`, `interface/gestacao/tela.tsx` | Só a **home** passa `titulo="APS Inteligente"` (o wordmark); as calculadoras passam o próprio nome como h1 e trazem "APS Inteligente" no prefixo do subtítulo; não há `public/` no projeto | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Prescritor(a) da APS | Reconhecer a ferramenta e confiar na origem | Abre a home e vê a logo APSi no cabeçalho, coerente com o tema ativo |
| Prescritor(a) que fixa o app | Achar o app entre abas/ícones | Fixa a página na tela inicial e vê o ícone APSi; identifica a aba pelo favicon |
| Mantenedor (single maintainer) | Evoluir a identidade sem risco de regressão | Adiciona a logo sem alterar domínio, testes de comportamento ou a CSP |

## 4. Regras de negócio novas ou alteradas

> Mapeamento das peças, conforme o brief de integração do usuário. `apsi-white` e `apsi-navy` **não** são usadas na web nesta feature (reservadas a sobre-foto/impressão); ficam versionadas para uso futuro.

1. **RN-01 — Ativo estático same-origin, sob a CSP vigente.** A logo é um ativo versionado no repositório, servido pela própria origem; nenhuma requisição a terceiros, nenhuma origem nova na CSP (`img-src 'self' data:` já cobre). Preserva ADR 0002/0007 e a RN-06 da feature 002. 🟢 — Tipo: nova.
2. **RN-02 — Nome acessível e semântica de heading preservados.** Onde a logo substitui o wordmark textual, ela é imagem com texto alternativo **"APS Inteligente"** dentro do `<h1>`; o nome acessível do heading permanece **idêntico** ao atual e o `axe-baseline` não aumenta. 🟢 — Tipo: alterada (refina a apresentação do h1 sem mudar semântica; ver O-08-01 do adendo 008).
3. **RN-03 — Variante por tema.** `apsi-light.png` (`#0969da`) no tema claro; `apsi-dark.png` (`#4493f8`) no tema escuro; respeita o mecanismo de tema vigente (`data-tema` na Moldura) sem flash de hidratação. 🟢 — Tipo: nova.
4. **RN-04 — Identidade instalável a partir de `apsi-tile.png`.** Tile arredondado 512×512 (wordmark branco sobre azul de destaque) serve favicon, `apple-touch-icon` e o conjunto de ícones do `manifest.webmanifest` (512 px original + 192 px derivado por redução); deve reduzir legível a 16 px na aba. O manifesto declara `name` "APS Inteligente" e `theme_color` no azul de destaque. 🟡 — Tipo: nova.
5. **RN-05 — Marca de cabeçalho não duplica heading.** A logo é persistente no cabeçalho de todas as telas, mas substitui o texto do `<h1>` **apenas na home** (onde o wordmark é o próprio h1). Nas calculadoras, cujo `<h1>` é o nome da calculadora, a logo é marca de brand **fora** do heading — sem criar segundo `<h1>`, sem alterar o nome acessível do h1 e sem alterar a contagem de links asserida na suíte (feature 008). 🟢 — Tipo: nova.

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | No cabeçalho da **home**, o wordmark textual "APS Inteligente" é substituído pela logo APSi | Must | O `<h1>` da home renderiza a imagem da logo; nome acessível permanece "APS Inteligente"; subtítulo, selo "Nada é salvo nem enviado" e alternador de tema intactos | 🟢 |
| RF-02 | A logo do cabeçalho troca de variante conforme o tema | Must | Alternar para escuro exibe `apsi-dark`; para claro, `apsi-light`; sem flash na hidratação | 🟢 |
| RF-03 | O app ganha identidade instalável (PWA): favicon, `apple-touch-icon` e `manifest.webmanifest` a partir do tile | Must | `pages/_document.tsx` declara `<link rel="icon">`, `apple-touch-icon` e `<link rel="manifest">`; o manifesto same-origin traz `name` "APS Inteligente", `theme_color` e ícones 512/192 px derivados do tile; a aba exibe o favicon e o app é instalável | 🟢 |
| RF-04 | Os ativos da logo ficam versionados no repositório, serviveis pela própria origem | Must | PNGs (e o manifesto) commitados (p.ex. em `public/`); nenhuma URL externa referenciada | 🟢 |
| RF-05 | Logo persistente no cabeçalho de **todas as telas** | Must | Na home substitui o wordmark (RF-01); nas calculadoras aparece como marca de brand **sem** substituir o `<h1>` do nome da calculadora — nome acessível do h1 e **contagem de links** asseridos na suíte preservados (marca decorativa ou, se virar link para a home, testes atualizados por decisão explícita no plano; ver RN-05) | 🟢 |
| RF-06 | A suíte existente permanece verde, com asserções de comportamento byte a byte | Must | `lint` + `typecheck` + unidade/integração + contrato 16/16 + e2e verdes; asserções de nome acessível e `axe-baseline` inalteradas (a substituição preserva o nome acessível) | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | Impacto ~nulo no gate **D-08** (first load JS): imagens são ativos estáticos same-origin, fora do bundle JS; peso por variante ~12 kB, carregado uma vez | `addenda/004` (gate D-08); Next serve `public/` como recurso separado | 🟢 |
| Segurança / Privacidade | Nenhum dado clínico, nenhuma rede a terceiros; CSP e cabeçalhos byte a byte — `img-src 'self' data:` cobre as imagens e `manifest-src` recai em `default-src 'self'`, ambos same-origin | `next.config.ts`; ADR 0002/0007; `addenda/002` | 🟢 |
| Acessibilidade | Texto alternativo "APS Inteligente" na logo do h1; contraste adequado nos dois temas (cores alinhadas ao azul de ênfase Primer); `axe` não aumenta sobre a linha de base | `addenda/008` O-08-01; brief de integração | 🟢 |
| Manutenção / Reprodutibilidade | Origem dos ativos preservada em `ativos-origem/`; ícone de 192 px derivado do tile de 512 no build/coding; `apsi-white`/`apsi-navy` versionadas para uso futuro (sobre-foto/impressão), não referenciadas na web | Princípio nº 5.3; brief de integração | 🟡 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Home exibe a logo no tema claro
  Dado que abro a raiz da plataforma no tema claro
  Quando o cabeçalho da home é renderizado
  Então vejo a logo APSi (variante clara) no lugar do texto "APS Inteligente"
  E o nome acessível do h1 continua sendo "APS Inteligente"
  E o subtítulo, o selo de privacidade e o alternador de tema seguem presentes

Cenário: Logo acompanha a troca de tema
  Dado que estou na home no tema claro
  Quando aciono o alternador para o tema escuro
  Então a logo passa a exibir a variante escura, sem flash

Cenário: Ícone do app na aba e na tela inicial
  Dado que abro qualquer rota da plataforma
  Quando o documento é carregado
  Então a aba do navegador exibe o favicon APSi
  E o ícone de tela inicial (apple-touch-icon) aponta ao tile da logo

Cenário (negativo): Nenhuma requisição externa é introduzida
  Dado que a página carrega sob a CSP de produção
  Quando os ativos da logo são requisitados
  Então todos vêm da própria origem
  E nenhuma violação de CSP nem requisição a terceiros ocorre

Cenário (negativo): Regressão de acessibilidade barrada
  Dado que a logo substitui o texto do h1
  Quando a suíte de testes roda
  Então o nome acessível do h1 permanece "APS Inteligente"
  E o axe-baseline não aumenta
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (logo no h1 da home) | Must | Núcleo da demanda: dar rosto à marca |
| RF-02 (variante por tema) | Must | Coerência visual e contraste nos dois temas |
| RF-03 (favicon/ícone + manifest PWA) | Must | Identidade na aba, na tela inicial e app instalável (decisão de esclarecimento) |
| RF-04 (ativos versionados) | Must | Reprodutibilidade e CSP sem terceiros |
| RF-05 (logo em todas as telas) | Must | Marca persistente do cabeçalho (decisão de esclarecimento), sem tocar o h1 das calculadoras |
| RF-06 (suíte verde) | Must | Barreira anti-regressão de comportamento/acessibilidade |
| RNF de desempenho (gate D-08) | Should | Delta de bundle esperado ~nulo, mas medir |

## 9. Esclarecimentos

### Sessão 2026-07-23

- **Q:** A logo APSi deve aparecer em quais telas?
  **R:** **Em todas as telas.** Marca persistente do cabeçalho; na home substitui o wordmark textual do `<h1>` (RF-01), nas calculadoras é marca de brand fora do heading, sem tocar o `<h1>` do nome da calculadora (RF-05, RN-05).
- **Q:** Qual a abrangência do ícone do app (apsi-tile)?
  **R:** **PWA instalável completo.** Favicon + `apple-touch-icon` + `manifest.webmanifest` (nome "APS Inteligente", `theme_color`, ícones 512/192 px) — app instalável (RF-03, RN-04).

## 10. Lacunas

- 🟡 Comportamento da marca de brand nas calculadoras — **decorativa** (`aria-hidden`) ou **link para a home** (afeta a contagem de links asserida na suíte da feature 008). Preferência default: decorativa, para não mexer nos testes; se for link, o `/reversa-plan` registra a atualização deliberada dos testes. Não bloqueia o plano.
- 🟡 Convenção de local dos ativos servíveis (`public/` novo vs. import por componente) — decisão técnica do `/reversa-plan`, sem impacto de requisito.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-23 | Sessão de esclarecimento: escopo → todas as telas (RF-05 Must, RN-05); ícone → PWA completo (RF-03, RN-04); 3 `[DÚVIDA]` resolvidos | reversa-clarify |
