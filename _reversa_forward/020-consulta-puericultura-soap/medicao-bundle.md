# Medição de bundle — feature 020-consulta-puericultura-soap

> Ação **T043**, exigida por RF-11 e pelo RNF de desempenho: "as sete rotas existentes não
> pagam nada pela feature; a rota nova carrega a calculadora de crescimento só ao abrir o
> painel". Medido em **2026-07-28**, Next.js 16.2.10 com Turbopack.

## Como o número foi obtido

Mesmo método das features 017, 018 e 019, e pela mesma razão: o Turbopack não imprime as
colunas `Size` e `First Load JS`. Os bytes vêm do artefato. O `.next/build-manifest.json`
mapeia cada rota aos chunks do primeiro acesso; somam-se os comuns (`rootMainFiles` mais os de
`/_app`) e os próprios da rota, e o valor gzip é o do `zlib.gzipSync` sobre cada arquivo.
Script reaproveitado da sessão anterior, em `scratchpad/medir-bundle.mjs`.

A linha de base foi medida **no mesmo repositório**, com o trabalho da feature guardado em
`git stash push -u` e restaurado logo depois. Não em _worktree_: o Turbopack recusa
`node_modules` alcançado por symlink fora da raiz, limitação registrada desde a 017.

## Resultado

| Rota                                | Antes (gzip) | Depois (gzip) |     Delta |
| ----------------------------------- | -----------: | ------------: | --------: |
| `/`                                 |      217 270 |       217 719 |    +449 B |
| `/_app`                             |      163 730 |       163 948 |    +218 B |
| `/_error`                           |      175 848 |       176 067 |    +219 B |
| `/cardiologia/dor-toracica`         |      290 885 |       291 709 |    +824 B |
| `/cardiologia/risco-cardiovascular` |      289 839 |       290 664 |    +825 B |
| `/dm2/insulina`                     |      298 994 |       299 841 |    +847 B |
| `/pre-natal/idade-gestacional`      |      289 132 |       289 960 |    +828 B |
| `/puericultura/crescimento`         |      370 289 |       371 637 |  +1 348 B |
| `/puericultura/consulta`            |            — |   **302 139** | rota nova |

## Leitura

1. **A rota nova não paga as tabelas antropométricas, e a prova não é o número.** Ela é
   direta: quatro valores `L/M/S` colhidos de `peso-idade-0-5-masculino.ts` foram procurados
   nos chunks do primeiro carregamento de cada rota. Eles aparecem em
   `/puericultura/crescimento`, que importa o acervo estaticamente, e **não aparecem** em
   `/puericultura/consulta` nem em `/`. O `next/dynamic` de D-08 está fazendo o que promete, e
   quem não abre o painel não recebe as 12 964 linhas da OMS.

2. **A rota nova custa 69,5 kB gzip MENOS que a do crescimento**, apesar de ter interface
   maior — dez fichas, cerca de 380 literais e cinco componentes de campo. São 7 chunks contra 19. A diferença é o acervo tabular, que ali é caminho crítico e aqui é chunk sob demanda.

3. **As oito rotas existentes se movem entre +218 B e +1 348 B**, e nenhuma delas importa
   qualquer arquivo de `models/puericultura/consulta` ou de `interface/puericultura/consulta`.
   É rearranjo de chunks comuns do Turbopack entre builds, o mesmo fenômeno que a medição da
   019 registrou em ambas as direções. O `/puericultura/crescimento` se move mais que as
   outras por partilhar com a rota nova o `models/puericultura` que as duas consomem.

4. **A guarda de rede do e2e continua verdadeira com o chunk tardio.** Ela afere requisição a
   terceiro e busca de dado, e não carregamento de script da própria origem. O chunk do painel
   é script da própria origem, dentro da CSP sem terceiros, e nenhum dado é buscado para
   avaliar o crescimento: as tabelas vêm no próprio módulo.

## Reprodução

```bash
npm run build
node scratchpad/medir-bundle.mjs        # primeiro carregamento por rota, em gzip
```

Para a linha de base, `git stash push -u`, `npm run build`, medir, e `git stash pop` — nesta
ordem, restaurando `next-env.d.ts` antes do `pop`, que o build reescreve.
