# Medição de bundle — feature 017-puericultura-crescimento

> Ação **T049**, verificação obrigatória de **D-09** (roadmap §5): as tabelas da OMS entram
> por `import` estático no domínio, e o isolamento do custo fica por conta do *code-splitting*
> por rota do Next. A decisão nasceu 🟡 justamente porque dependia desta medição. Medido em
> **2026-07-28**, Next.js 16.2.10 (Turbopack), `npm run build` em ambos os lados.

## Como o número foi obtido, e por que não é a tabela do `next build`

O Next 16 com Turbopack **não imprime mais as colunas `Size` e `First Load JS`** na tabela de
rotas: a saída lista as rotas e o modo de renderização, nada mais. A comparação que D-09 exige
foi então reconstruída do artefato, que é a fonte mais confiável de todo modo — `.next/build-manifest.json`
mapeia cada rota aos chunks que ela carrega no primeiro acesso, e os bytes vêm do disco.
Somam-se os chunks comuns (`rootMainFiles` + os de `/_app`) mais os próprios da rota; o valor
em gzip é o do `zlib.gzipSync` sobre cada arquivo. O script está em
`scratchpad/medir-bundle.mjs` da sessão — descartável, porque o dado que importa está aqui.

A linha de base foi medida no **mesmo repositório**, com os arquivos da feature removidos
temporariamente e o `import` da folha nova retirado de `_app.tsx` — e não num *worktree*, porque
o Turbopack recusa `node_modules` alcançado por symlink fora da raiz do projeto.

## Resultado

Bytes do *first load* (soma dos chunks JS), com e sem a feature:

| Rota | Antes (bruto) | Depois (bruto) | Antes (gzip) | Depois (gzip) | Δ gzip |
|---|---:|---:|---:|---:|---:|
| `/` | 757 243 | 757 243 | 175 536 | 175 536 | **0** |
| `/_app` | 626 130 | 626 130 | 129 762 | 129 762 | **0** |
| `/_error` | 659 527 | 659 527 | 141 880 | 141 880 | **0** |
| `/cardiologia/dor-toracica` | 934 589 | 934 589 | 236 792 | 236 792 | **0** |
| `/cardiologia/risco-cardiovascular` | 932 226 | 932 226 | 235 772 | 235 773 | **+1 B** |
| `/dm2/insulina` | 960 040 | 960 040 | 244 500 | 244 500 | **0** |
| `/pre-natal/idade-gestacional` | 929 635 | 929 635 | 235 058 | 235 058 | **0** |
| `/puericultura/crescimento` | — | 1 202 312 | — | 316 038 | rota nova |

## Leitura

1. **D-09 se confirma: o custo ficou na rota que o criou.** As sete rotas existentes têm o
   *first load* **bruto idêntico** byte a byte. O único desvio é de **1 byte em gzip** numa
   delas, com o bruto igual — ruído do compressor, não código novo. A premissa 🟡 de D-09 pode
   ser promovida a 🟢: o *code-splitting* por rota isolou as tabelas sem qualquer intervenção.
2. **A rota nova custa +80,3 kB gzip** sobre a mais próxima (316,0 kB contra 235,8 kB de
   `/cardiologia/risco-cardiovascular`), ou **+270 kB brutos**. É o preço das 12 964 linhas
   `L/M/S` da OMS mais os coeficientes do INTERGROWTH-21st, e ele aparece **só** para quem abre
   a avaliação de crescimento.
3. **A porta de D-08 permanece aberta e não precisou ser usada.** O repositório de tabelas é
   injetável pelo construtor; se um dia esses 80 kB incomodarem, a migração para carga dinâmica
   troca a implementação do repositório sem tocar na fachada nem na tela. Hoje não há motivo:
   a rota é a única que paga, e paga uma vez.

## Como repetir

```bash
npm run build
node scripts/../scratchpad/medir-bundle.mjs   # ou reescrever o somatório sobre .next/build-manifest.json
```

Para refazer a linha de base, remova `interface/puericultura/`, `pages/puericultura/` e
`interface/estilos/puericultura.css`, tire o `import` correspondente de `pages/_app.tsx`,
rode o build e compare. O `next build` reescreve `next-env.d.ts` (troca `.next/dev/types` por
`.next/types`); é artefato gerado, e restaurá-lo com `git checkout --` depois da medição
mantém o diff limpo.
