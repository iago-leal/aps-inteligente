# Rede de segurança — OPP-20260730-R8FJ

Prova de preservação: o inventário textual é GERADO a partir do mapa de classes.
Se uma declaração se perdesse na partição, o gerador pararia com FalhaDeClassificacao;
se uma mudasse de classe, a contagem mudaria. Idêntico byte a byte é prova direta.

## Antes (HEAD, monólito de 689 linhas)
```
md5  0f133e2cc8fa7fd6b59423c16870e2c8  tests/apoio/inventario-textual.json
1245 literais — 680 autorais, 498 citações, 67 identificadores
vitest tests/unit/textos: 30 passed (7 files)
```

## Depois (9 módulos por unit)
```
MD5 (tests/apoio/inventario-textual.json) = 0f133e2cc8fa7fd6b59423c16870e2c8
✓ tests/apoio/inventario-textual.json
  1245 literais — 680 autorais, 498 citações, 67 identificadores
  por camada: models 574, interface 401, pages 43, manifesto 3, readme 224
  Confira com `git diff`: vazio significa que a superfície textual não mudou.

git diff tests/apoio/inventario-textual.json:
  linhas de diff:        0
```

## Suíte completa e guardrails
```
vitest run          920 passed (73 files)
tsc --noEmit        0
eslint scripts/     0
prettier --check    9 módulos novos limpos; classificacao.mts já reprovava em HEAD,
                    na linha 197 (predicado de pages-e-arquivos), que não foi tocada.
```
