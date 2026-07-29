# `interface/comum` — Moldura comum da plataforma

> `requirements.md` · **Re-extração 4 (2026-07-28)**. Nasce da feature 007 (extração da
> Moldura) e evolui nas features 008, 009, 011, 013 e, nesta passagem, **016 e 021**.
> Mudança de contrato desta passagem: `logoComoTitulo` **removida**, `comInicio`
> acrescentada; e a Moldura passa a ser **dona do enquadramento horizontal** de toda tela.

## Visão Geral

Casca visual compartilhada por todas as telas: cabeçalho com identidade (logo APSi, título,
subtítulo e selo de privacidade), barra de ações e o `<main>` que enquadra o conteúdo. É o
único acoplamento horizontal entre as telas, e desde a feature 021 é também a **sede única da
coluna do corpo**. 🟢

O que mudou nesta passagem, e é o que mais confunde quem lê a base antiga: a prop
`logoComoTitulo` **não existe mais**. A identidade foi unificada na feature 016 — a logo é
sempre marca decorativa acima de um `h1` textual, **inclusive na home**. O que distingue a
home das calculadoras hoje é a ausência do comando de início, e não o tratamento da logo. 🟢

## Responsabilidades

- Renderizar o cabeçalho: logo por tema, título, subtítulo, selo "Nada é salvo nem enviado" e
  a barra de ações. 🟢
- Ler e alternar a preferência de tema por `useSyncExternalStore`, expondo `data-tema`. 🟢
- Oferecer a variante de apresentação `padrao` / `destaque`, que hoje governa **duas** coisas:
  o estilo e a **largura da coluna do corpo**. 🟢
- **(021)** Estabelecer o enquadramento horizontal do conteúdo no próprio `<main>`, de modo que
  toda tela nasça enquadrada sem saber que existe largura de coluna. 🟢
- **(016)** Oferecer o comando de retorno à home por `comInicio`, ausente na própria home. 🟢

## Regras de Negócio

| ID | Regra | Confiança |
|----|-------|-----------|
| RN-01 | A logo é **sempre** marca decorativa (`alt=""`, `aria-hidden`) acima de um `h1` textual, em toda tela, inclusive a home. `logoComoTitulo` foi removida na feature 016. | 🟢 |
| RN-02 | A variante de apresentação governa o estilo **e** a largura da coluna: 1.180 px em `padrao`, 720 px em `destaque`. A semântica do DOM é idêntica nas duas. | 🟢 |
| RN-03 | **A Moldura é dona do eixo horizontal.** Largura máxima, centralização e recuo lateral moram em `moldura.css`, aplicados por seletor de atributo ao `<main>`. O eixo **vertical** continua na folha de cada tela, porque varia com legitimidade. | 🟢 |
| RN-04 | O `<main>` permanece sem classe e sem atributo próprio: a chave de estilo é o `data-apresentacao` do contêiner, o mesmo por onde o cabeçalho já se calibrava. | 🟢 |
| RN-05 | O alternador de tema exibe o glifo do tema-**alvo** (sol quando escuro, lua quando claro), é `type="button"` e não tem `href`. | 🟢 |
| RN-06 | O comando de início é o único link do cabeçalho, aparece só com `comInicio`, e é ausente na home. | 🟢 |
| RN-07 | O selo de privacidade fica na zona de identidade, sob o subtítulo, com `ShieldLockIcon` decorativo. Nenhuma tela o desativa. | 🟢 |
| RN-08 | `data-tema` no contêiner é o marcador observável da preferência. | 🟢 |
| RN-09 | A logo troca de arquivo conforme o tema já lido: `/apsi-dark.png` no escuro, `/apsi-light.png` no claro. | 🟢 |
| RN-10 | Um único `h1` por tela, e ele é textual. | 🟢 |

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|--------------------|
| RF-01 | Renderizar logo por tema. | Must | Tema escuro usa `/apsi-dark.png`; claro, `/apsi-light.png`. |
| RF-02 | Renderizar título como `h1` textual e subtítulo abaixo. | Must | Um só `h1`, com o texto do título. |
| RF-03 | Exibir o selo de privacidade em toda tela. | Must | Rótulo presente em todas as sete rotas de tela. |
| RF-04 | Oferecer a variante de apresentação. | Should | `destaque` muda `data-apresentacao` e a largura da coluna. |
| RF-05 | Alternar tema, refletindo em `data-tema`. | Must | Clicar troca claro↔escuro e troca a logo. |
| RF-06 | **(016)** Oferecer o comando de início sob `comInicio`. | Must | Presente nas seis telas, ausente na home. |
| RF-07 | **(021)** Enquadrar o conteúdo pela coluna correspondente à apresentação. | Must | Guardas geométricas em `e2e/cabecalho.spec.ts`: o corpo e o cabeçalho ocupam a mesma faixa. |
| RF-08 | Compor o conteúdo por `children` dentro do `<main>`. | Must | Toda tela monta o seu conteúdo ali. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Sem rede e sem armazenamento remoto; o tema vive em store local. | `interface/comum/moldura.tsx` | 🟢 |
| Acessibilidade | Um `h1` por tela; logo decorativa; ícones com nome acessível. | `moldura.tsx` | 🟢 |
| SSR | `lerTemaNoServidor` evita o piscar de tema. | `moldura.tsx` | 🟢 |
| Coesão de estilo | O enquadramento horizontal tem sede única, e a sétima tela nasce enquadrada. | `interface/estilos/moldura.css` | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: identidade unificada
  Dado qualquer tela da plataforma, inclusive a home
  Quando a Moldura renderiza
  Então a logo é decorativa, com alt vazio e aria-hidden
  E o único h1 é o título textual da tela

Cenário: comando de início
  Dado uma calculadora
  Então há um link de início no cabeçalho
  Dado a home
  Então não há link de início

Cenário: coluna do corpo
  Dado a variante padrao
  Então o main tem largura máxima de 1180px, centralizado, com recuo de 32px
  E a faixa ocupada pelo corpo coincide com a do cabeçalho

Cenário: alternância de tema
  Dado o tema claro
  Quando o usuário aciona o alternador
  Então data-tema vira "escuro", a logo troca de arquivo e o ícone passa a ser o sol
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Cabeçalho, selo e tema | Must | Casca de toda tela. |
| Enquadramento horizontal na Moldura | Must | Sem ele, a invariante voltaria a depender de coincidência de nome de classe. |
| Comando de início por prop | Must | Navegação de retorno das seis telas. |
| Composição por `children` | Must | Contrato de uso. |
| Variante de apresentação | Should | Só a home usa `destaque`. |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `interface/comum/moldura.tsx` | `Moldura`, `PropsMoldura` | 🟢 |
| `interface/estilos/moldura.css` | Coluna do corpo, por `data-apresentacao` | 🟢 |
| `interface/estilos/cabecalho.css` | Calibração do cabeçalho contra a mesma coluna | 🟢 |
| `interface/calculadora/preferencia-de-tema.ts` | `assinarTema`, `lerTema`, `gravarTema` | 🟡 (candidata a realocar para `interface/comum`) |

> **Dívida encerrada nesta passagem:** L-07 — `domain.md` §7.2 descrevia a Moldura governada
> por `logoComoTitulo`, prop que o componente não tem mais desde a feature 016.
