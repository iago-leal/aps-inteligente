# Delta de dados: nenhum

> Feature: `021-coluna-da-ficha-de-consulta`
> Data: `2026-07-28`
> Modelo de referência: `_reversa_sdd/erd-complete.md`, `_reversa_sdd/data-dictionary.md`

## 1. Resumo

A feature **não altera o modelo de dados em ponto algum**, e a afirmação é verificável por
`git diff` vazio nos caminhos abaixo. Ela é de apresentação, e o escopo negativo está declarado
em RN-03 e em RF-09 do `requirements.md`.

## 2. O que permanece intocado, e por quê importa dizê-lo

| Artefato de dado | Estado | Razão de constar aqui |
|---|---|---|
| `models/puericultura/consulta/fichas/*` | inalterado | São 278 campos com página de origem, verificados contra o congelado das pp. 66–76 pelo oráculo de transcrição da 020. Qualquer toque aqui reabriria aquele oráculo |
| `models/puericultura/consulta/tipos.ts` | inalterado | O `Campo`, a `Resposta` e o `RegistroDaConsulta` seguem como estão |
| `models/{insulina,gestacao,cardiopatia-isquemica,risco-cardiovascular,puericultura}` | inalterado | Os quatro domínios e as tabelas da OMS não entram no alcance de uma correção de enquadramento |
| `interface/inicio/catalogo.ts` | **lido, jamais escrito** | A guarda geométrica passa a derivar dele a lista de rotas (D-05). Ler não é alterar, e RF-09 continua satisfeito |
| `e2e/axe-baseline.json` | inalterado | RF-06 exige diff vazio; o DOM não muda |
| `scripts/textos/classes/*` | inalterado | A feature não cria literal exibido. RF-07 mantém o portão do inventário mesmo assim |
| `openapi/status.yaml` | inalterado | Nenhum contrato externo é tocado |

## 3. Migração

Não se aplica. Não há persistência: a plataforma é integralmente cliente, e o preenchimento da
ficha vive em memória por RN-13 da 020, descartado ao recarregar. Não há banco a migrar, esquema
a versionar nem dado em repouso a converter.

## 4. Verificação

```
git diff --stat -- models/ interface/inicio/catalogo.ts pages/api/ e2e/axe-baseline.json
```

Saída esperada: vazia. É o critério de aceite literal de RF-09 e de RF-06.
