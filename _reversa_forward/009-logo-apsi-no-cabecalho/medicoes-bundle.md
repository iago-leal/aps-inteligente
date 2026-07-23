# Medições de bundle — feature 009

> Gate D-08 (feature 004): o **delta** de first load JS da feature deve ficar < 100 kB gzip.
> A logo é ativo estático em `public/`, fora do bundle JS; o único JS novo é a lógica da
> `Moldura` (condicional + `<img>`) e os `<link>` do `_document`. Delta esperado ~nulo.

## Método (determinístico, reprodutível)

Após `npm run build`, soma-se o gzip de cada arquivo de first load (união de `rootMainFiles`,
`/_app` e os chunks da página no `.next/build-manifest.json`), dedup por nome, uma vez cada.
O proxy inicial (soma bruta de `.next/static/chunks/*.js`) e a soma via HTML servido foram
descartados: variam com o re-hash/reordenação de chunks entre builds e produzem ruído de dezenas de kB.

## Resultado (first load JS, gzip)

| Rota | Base (T001) | Final (T011) | Delta |
|------|-------------|--------------|-------|
| `/` (home) | 191,0 kB | 191,2 kB | **+150 B** (0,15 kB) |
| `/dm2/insulina` | 282,1 kB | 282,2 kB | **+137 B** (0,13 kB) |
| `/pre-natal/idade-gestacional` | 272,5 kB | 272,6 kB | **+136 B** (0,13 kB) |

**Veredito:** delta de ~0,15 kB gzip por rota — três ordens de grandeza abaixo do gate D-08 (100 kB).
Nenhuma decisão de exceção (molde D-10 da feature 004) necessária. Os valores absolutos altos são
herança da base Primer da feature 004, já aceita pela decisão D-10.

## Comando

```sh
npm run build
# soma gzip de rootMainFiles + /_app + chunks da página no build-manifest, dedup por nome
```
