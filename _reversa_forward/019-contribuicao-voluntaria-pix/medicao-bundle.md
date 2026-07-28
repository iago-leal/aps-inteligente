# Medição de bundle — feature 019-contribuicao-voluntaria-pix

> Ação **T032**, exigida pelo RNF de desempenho: "acréscimo de bundle declarado por rota, e o
> custo do desenho do QR fora do caminho crítico da primeira pintura, carregado só quando o
> painel abre". Medido em **2026-07-28**, Next.js 16.2.10 com Turbopack.

## Como o número foi obtido

Mesmo método das features 017 e 018, e pela mesma razão: o Turbopack não imprime mais as
colunas `Size` e `First Load JS`. Os bytes vêm do artefato. O `.next/build-manifest.json`
mapeia cada rota aos chunks do primeiro acesso; somam-se os comuns (`rootMainFiles` mais os de
`/_app`) e os próprios da rota, e o valor gzip é o do `zlib.gzipSync` sobre cada arquivo.
Script reaproveitado da sessão anterior, em `scratchpad/medir-bundle.mjs`.

A linha de base foi medida **no mesmo repositório**, com o trabalho da feature guardado em
`git stash -u` e restaurado logo depois. Não em *worktree*: o Turbopack recusa `node_modules`
alcançado por symlink fora da raiz, limitação registrada desde a 017.

## Resultado, e a correção que a medição provocou

A primeira medição reprovou o desenho, e vale registrar o número que ela deu, porque é ele que
justifica a forma final do código.

| Rota | Antes (gzip) | Import estático | Import dinâmico (entregue) |
|---|---:|---:|---:|
| `/` | 175 543 | 190 466 (**+14 923 B**) | 178 077 (**+2 534 B**) |
| `/_app` | 129 762 | 129 879 | 129 792 (+30 B) |
| `/_error` | 141 880 | 141 035 | 141 910 (+30 B) |
| `/cardiologia/dor-toracica` | 236 831 | 235 879 | 237 157 (+326 B) |
| `/cardiologia/risco-cardiovascular` | 235 810 | 234 855 | 236 111 (+301 B) |
| `/dm2/insulina` | 244 536 | 243 608 | 244 884 (+348 B) |
| `/pre-natal/idade-gestacional` | 235 083 | 234 086 | 235 404 (+321 B) |
| `/puericultura/crescimento` | 316 288 | 315 294 | 316 561 (+273 B) |

## Leitura

1. **Montar o painel só quando aberto não bastava, e a medição foi quem disse.** O componente
   já era condicional, mas o `import` estático arrastava o `Dialog` do Primer e a biblioteca do
   QR para o primeiro carregamento da home: **quase 15 kB gzip** cobrados de toda visita por
   uma tela que a maioria nunca abre. Com `next/dynamic` e `ssr: false`, esse código virou
   chunk sob demanda e o custo da home caiu para **+2,5 kB gzip**, que é o bloco de apoio em si.
   Os cerca de 12,4 kB que saíram do caminho crítico só chegam ao navegador de quem aciona o
   comando.

2. **O acréscimo de +2,5 kB na home fica declarado, e não escondido.** Está acima do limiar de
   1 kB que a feature 018 se impôs, e é esperado que esteja: aquele limiar valia para uma
   troca de literais, que não deveria custar nada; esta feature acrescenta interface nova. O
   que o RNF exige aqui é declaração, e é isto.

3. **As demais rotas se movem em algumas centenas de bytes**, para cima nesta medição e para
   baixo na anterior, sobre o mesmo código de aplicação. É rearranjo de chunks comuns do
   Turbopack entre builds, e não custo desta feature: nenhuma delas importa qualquer arquivo de
   `interface/contribuicao` ou de `models/contribuicao`.

4. **A guarda de rede do e2e continua verdadeira com o chunk tardio.** Ela afere requisição a
   terceiro e busca de dado (`fetch`, `xhr`, `websocket`), e não carregamento de script da
   própria origem. O chunk do painel é script da própria origem, dentro da CSP sem terceiros:
   nenhum dado é buscado para montar o payload ou desenhar o código.
