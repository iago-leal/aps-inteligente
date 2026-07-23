# interface/comum — Moldura comum da plataforma

> `requirements.md` · Re-extração 3 (2026-07-23). Nasce da feature 007 (extração da Moldura) e evolui nas features 008, 009, **011 e 013** (cabeçalho refatorado).

## Visão Geral

Casca visual compartilhada por todas as telas: cabeçalho com identidade (logo APSi), selo de privacidade e barra de ações, sobre o qual cada calculadora e a home montam seu conteúdo. É o único acoplamento horizontal entre as telas da plataforma; extraída byte a byte de `interface/calculadora/tela.tsx` na feature 007. As features 011/013 refatoraram o cabeçalho (toggle de tema icônico, comando de retorno à home, selo movido para a identidade) sem tocar domínio nem catálogo. 🟢

## Responsabilidades

- Renderizar o cabeçalho: logo, título, subtítulo, selo "Nada é salvo nem enviado" e a barra de ações. 🟢
- Ler e alternar a preferência de tema via `useSyncExternalStore`, expondo `data-tema` observável. 🟢
- Trocar a logo (clara/escura) conforme o tema já lido. 🟢
- Oferecer variante de apresentação `padrao` / `destaque` (só CSS, semântica idêntica). 🟢
- Tratar a logo como `h1` (home, `logoComoTitulo`) ou como marca decorativa (calculadoras, `aria-hidden`). 🟢
- **(011)** Alternar tema por `IconButton` que exibe o glifo do tema-ALVO (sol/lua), com nome acessível "Ativar tema claro/escuro". 🟢
- **(011)** Oferecer comando de retorno à home (`IconButton as={Link} href="/"`) apenas nas calculadoras (`!logoComoTitulo`). 🟢

## Regras de Negócio

- **RN-02** A variante de apresentação é puramente visual (`data-apresentacao`); a semântica (h1, selo, alternador) é idêntica nas duas. 🟢
- **RN-03/RN-05** Com `logoComoTitulo`, a logo é `<img>` dentro do `h1` com `alt` igual ao título (nome acessível preservado); sem a prop, é marca decorativa (`alt=""`, `aria-hidden`), sem segundo h1 nem link novo (D-04). 🟢
- **RN-01/RN-03 (011)** O alternador exibe o tema-alvo, não o vigente (sol quando escuro, lua quando claro); é `type="button"`, sem `href`. Só apresentação: a preferência e sua semântica são idênticas às da feature 004. 🟢
- **D-03/D-04 (011)** O comando de início é o único link do cabeçalho da calculadora; ausente na home (seria redundante — a logo já é o h1). 🟢
- **Ajuste 23/07** O selo de privacidade desceu da barra de ações para a zona de identidade, sob o subtítulo, com `ShieldLockIcon` (`.cabecalho-selo`). Mesmo texto e nome acessível; a barra de ações fica coesa com os dois botões irmãos (início + tema). 🟢
- **RN-04** `data-tema` no contêiner é o marcador observável da preferência de tema. 🟢
- **Privacidade** O selo "Nada é salvo nem enviado" é fixo; nenhuma tela desativa. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-04 | Variante de apresentação opcional | Should | `apresentacao="destaque"` só muda `data-apresentacao`; DOM semântico igual |
| RF-05 | Alternador de tema com `data-tema` | Must | Clicar troca claro↔escuro; `data-tema` reflete; logo troca de `src` |
| RF-07 | Selo de privacidade sempre visível | Must | Label "Nada é salvo nem enviado" presente em toda tela |
| RF-08 | Composição de conteúdo via `children` | Must | `<main>` recebe o conteúdo da tela |
| RF-01/RF-02 (009) | Logo APSi no cabeçalho, por tema | Must | Tema escuro → `/apsi-dark.png`; claro → `/apsi-light.png` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Sem rede nem storage; tema via store local | `interface/comum/moldura.tsx:43` | 🟢 |
| Acessibilidade | Um único h1 por tela; logo decorativa aria-hidden | `moldura.tsx:50-74` | 🟢 |
| SSR | `lerTemaNoServidor` evita flash de tema | `moldura.tsx:43` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado a home com logoComoTitulo
Quando a Moldura renderiza
Então a logo é uma <img> dentro do único h1 com alt="APS Inteligente"

Dado uma calculadora sem logoComoTitulo
Quando a Moldura renderiza
Então a logo é marca decorativa (aria-hidden, alt vazio) e o h1 é o nome da calculadora

Dado o tema claro ativo
Quando o usuário clica no alternador
Então data-tema vira "escuro" e a logo troca para /apsi-dark.png
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Cabeçalho + selo + tema (RF-05/RF-07) | Must | Casca de toda tela |
| Composição por children (RF-08) | Must | Contrato de uso pelas telas |
| Logo por tema (RF-01/RF-02) | Must | Identidade da marca (feature 009) |
| Variante de apresentação (RF-04) | Should | Só a home usa `destaque` |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `interface/comum/moldura.tsx` | `Moldura` `PropsMoldura` | 🟢 |
| `interface/calculadora/preferencia-de-tema.ts` | `assinarTema` `lerTema` `gravarTema` (dependência) | 🟡 (candidata a realocar) |
