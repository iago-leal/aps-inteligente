# interface/estilos — Camada de estilo (cola de layout sobre Primer)

> `requirements.md` · Re-extração 3 (2026-07-23). Nasce na feature 004 (globais) e cresce em 008 (inicio), 009 (cabecalho), 010 (cardiologia), **011/013 (cabeçalho consolidado)** e **014 (risco-cardiovascular)**.

## Visão Geral

**Cinco** folhas CSS que fornecem apenas a "cola de layout" que os componentes Primer não cobrem — grade da página, cartões, cabeçalho, home e peças das telas. A identidade visual é do Primer: toda regra usa `var(--*)` funcional, sem cor, fonte ou sombra própria. Arquivos separados para respeitar o teto de 400 linhas por arquivo. **Dívida resolvida:** na re-extração 2, `globais.css` estava em exatamente 400 linhas (no teto); a consolidação da família `.cabecalho*` em `cabecalho.css` (features 011/013) baixou `globais.css` para **364** — abaixo do teto, sem folha acima de 400. 🟢

## Responsabilidades

- `globais.css` (364) — reset, grade da página, cartões, espaçamentos. 🟢
- `cabecalho.css` (116) — família `.cabecalho*` inteira: layout base + logo APSi + a refatoração das features 011/013 (barra de ações icônica, `.cabecalho-selo` na identidade, proporções da variante `padrao` alinhadas à coluna do corpo e à logo da home, 44/36 de respiro). 🟢
- `inicio.css` (188) — hero em variante destaque, seções, cartões e stretched link da home. 🟢
- `cardiologia.css` (47) — peças da tela de cardiologia (radios, blocos). 🟢
- `risco-cardiovascular.css` (8) — peças mínimas da tela de risco (proveniência/contexto). 🟢

## Regras de Negócio

- **RN-01/RN-05 (004)** Só tokens `var(--*)` do Primer; nenhuma cor/fonte/sombra própria. 🟢
- **Teto de 400 linhas** cada preocupação em folha própria; o layout do cabeçalho saiu de `globais.css` (que encostara em 400) para `cabecalho.css`, trazendo `globais.css` a 364 linhas (re-extração 2). 🟢
- **Ordem de import** As folhas entram em `_app.tsx` após os primitivos e `globais.css`, nesta ordem: globais → cabecalho → inicio → cardiologia. 🟢
- **Variante por atributo** O hero reage a `.pagina[data-apresentacao="destaque"]`; o tema, a `data-tema`. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-04 (004) | Cola de layout sobre tokens Primer | Must | Nenhum valor de cor literal; só `var(--*)` |
| RF-01 (009) | Camada de logo preservando proporção | Should | Altura fixa, largura automática (314×138) |
| RF-01..04 (008) | Layout do hero, seções e cartões | Should | Coluna clínica de 720px; stretched link funcional |
| RF-08/RF-10 (010) | Estilo das peças da cardiologia | Should | Radios e blocos alinhados, sobre tokens |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Manutenibilidade | Um arquivo por preocupação; teto de 400 linhas respeitado (todas < 400) | `globais.css` (364), `cabecalho.css` (72), `inicio.css` (188), `cardiologia.css` (47) | 🟢 |
| Consistência de tema | Regras sobre `data-tema` / `data-apresentacao` | `inicio.css` (hero), `globais.css` | 🟢 |
| Sem terceiros | Nenhuma fonte/CDN externa (CSP) | `pages/_app.tsx:7-25` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado qualquer regra de estilo da plataforma
Quando inspecionada
Então usa var(--*) do Primer, sem cor/fonte/sombra literal própria

Dado a home com data-apresentacao="destaque"
Quando renderizada
Então o hero e as seções compartilham a coluna clínica de 720px
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Cola de layout sobre tokens (RF-04) | Must | Base visual de toda tela |
| Layout da home (008) | Should | Apresentação da porta de entrada |
| Camada de logo (009) e cardiologia (010) | Should | Incrementos por feature |

## Rastreabilidade de Código

| Arquivo | Escopo | Cobertura |
|---------|--------|-----------|
| `interface/estilos/globais.css` | reset, grade, cartões, espaçamentos | 🟢 |
| `interface/estilos/cabecalho.css` | família `.cabecalho*` (layout base + logo APSi) | 🟢 |
| `interface/estilos/inicio.css` | hero, seções, cartões, stretched link | 🟢 |
| `interface/estilos/cardiologia.css` | radios e blocos da cardiologia | 🟢 |
