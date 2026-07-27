# Medição de bundle — feature 018-revisao-linguagem-textos

> Ação **T052**, exigida pelo RNF de desempenho: "variação de bundle desprezível, por se
> tratar de troca de literais; qualquer crescimento acima de **1 kB gzip por rota** deve ser
> declarado". Medido em **2026-07-27**, Next.js com Turbopack, `npm run build` nos dois lados.

## Como o número foi obtido

Mesmo método da feature 017, e pela mesma razão: o Next com Turbopack não imprime mais as
colunas `Size` e `First Load JS` na tabela de rotas. A comparação vem do artefato, que é a
fonte mais confiável de todo modo — `.next/build-manifest.json` mapeia cada rota aos chunks
que ela carrega no primeiro acesso, e os bytes vêm do disco. Somam-se os chunks comuns
(`rootMainFiles` mais os de `/_app`) e os próprios da rota; o valor em gzip é o do
`zlib.gzipSync` sobre cada arquivo. Script em `scratchpad/medir-bundle.mjs` da sessão.

A linha de base foi medida **no mesmo repositório**, com os vinte e cinco arquivos de
aplicação tocados pela revisão revertidos por `git checkout --` e restaurados de cópia logo
depois. Não em *worktree*: o Turbopack recusa `node_modules` alcançado por symlink fora da
raiz do projeto, limitação já registrada na 017.

## Resultado

Bytes do *first load* (soma dos chunks JS), antes e depois da revisão de linguagem:

| Rota | Antes (gzip) | Depois (gzip) | Δ gzip | Δ bruto |
|---|---:|---:|---:|---:|
| `/` | 214 221 | 214 228 | **+7 B** | +30 |
| `/_app` | 163 460 | 163 460 | **0** | 0 |
| `/_error` | 175 578 | 175 578 | **0** | 0 |
| `/cardiologia/dor-toracica` | 289 721 | 289 731 | **+10 B** | +37 |
| `/cardiologia/risco-cardiovascular` | 288 702 | 288 726 | **+24 B** | +47 |
| `/dm2/insulina` | 297 811 | 297 803 | **−8 B** | −28 |
| `/pre-natal/idade-gestacional` | 287 987 | 287 989 | **+2 B** | −1 |
| `/puericultura/crescimento` | 369 045 | 369 227 | **+182 B** | +530 |

## Leitura

1. **Nada a declarar pelo RNF.** O maior crescimento é de **182 bytes gzip**, cinco vezes e
   meia abaixo do limiar de 1 kB que obrigaria declaração. As demais rotas se movem em
   dezenas de bytes, e `/_app` e `/_error` não se movem: nenhum literal delas foi tocado.

2. **O crescimento se concentra onde a feature acrescentou conteúdo, e não onde ela
   reescreveu forma.** Os 182 bytes de `/puericultura/crescimento` são, quase inteiros, a
   `NOTA_CORRECAO_DE_CONCORDANCIA` — 430 caracteres de texto novo, exigidos por RF-10 para
   que a correção dos dois rótulos venha declarada ao leitor. É o preço da transparência que
   `MD-0015` impôs como condição, e é barato.

3. **Uma rota encolheu, e o sinal negativo merece leitura.** `/dm2/insulina` perdeu 8 bytes
   gzip porque as reescritas de `interface/calculadora/resultado.tsx` trocaram travessões
   por dois-pontos e encurtaram duas frases. Não é ganho perseguido nem relevante; serve
   como conferência de que a medição responde ao que de fato mudou, em vez de oscilar por
   ruído de build.

4. **O `/` cresceu 7 bytes, e é a descrição corrigida.** A `description` da raiz passou a
   nomear as quatro seções do catálogo em vez de duas — mais 63 caracteres de texto —, e o
   que sobra depois da compressão são sete bytes, porque os nomes das seções já viviam no
   bundle, dentro do próprio `CATALOGO`.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-27 | Versão inicial, medida por `/reversa-coding` na ação T052 | reversa |
