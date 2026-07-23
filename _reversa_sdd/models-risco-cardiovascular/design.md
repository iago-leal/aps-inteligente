# models/risco-cardiovascular — Design

> `design.md` · Foca no COMO. Re-extração 3 (2026-07-23), feature `014-risco-cardiovascular-pce`.
> Domínio puro (ADR 0003), erros como valores (ADR 0004), o motor informa e não prescreve (ADR 0005), uma fonte por unit (ADR 0011), PCE sobre AHA PREVENT (ADR 0014).

## Arquitetura interna

Sete arquivos, ~600 LOC, no molde da família de domínios. A fachada `CalculadoraRiscoCardiovascular` orquestra um pipeline determinístico; cada etapa é uma função pura em seu próprio arquivo.

| Arquivo | Papel |
|---|---|
| `tipos.ts` | Contratos: `EntradaEstimativa`, `SaidaEstimativa = ResultadoEstimativa \| ForaDoEscopoDaFonte \| EntradaInvalida`; `Aviso` (clamp) distinto de `Ofensor` (validação); `ErroDeInvariante` |
| `fonte-clinica.ts` | Constantes congeladas: `COEFICIENTES` (4×13), `BASELINE_SURVIVAL`, `MEANS`, `FAIXAS`, `CATEGORIAS`, `REFERENCIAS`, `NOTA_PROVENIENCIA` |
| `validacao.ts` | `validarEntrada` (coleta total de ofensores) + `clamparEntrada` (faixa fisiológica → `Aviso`) |
| `elegibilidade.ts` | `foraDoEscopo` — DCV prévia ou idade fora de 40–79 → `ForaDoEscopoDaFonte` |
| `equacao.ts` | `grupoDe(sexo,raca)` + `riscoAscvdPct(grupo,v)` — núcleo de Cox log-linear |
| `categoria.ts` | `categoriaDe(riscoPct)` — cortes 5/7,5/20% |
| `calculadora.ts` | Fachada: valida → escopo → clamp → equação → categoria → resultado |

## Pipeline da fachada (`calculadora.ts`)

1. `validarEntrada(entrada)` → se há ofensores, retorna `{ tipo: "erro-validacao", ofensores }` (coleta total). 🟢
2. `foraDoEscopo(entrada)` → se não-nulo, retorna o `ForaDoEscopoDaFonte` (DCV prévia tem precedência sobre idade). 🟢
3. `clamparEntrada(entrada)` → `{ variaveis, avisos }`, com valores fisiológicos cortados à faixa. 🟢
4. `grupoDe(sexo, raca)` → `GrupoPce`; `riscoAscvdPct(grupo, variaveis)` → risco em pontos percentuais. 🟢
5. Monta `referencias = [equacoes, categorias]`; se vazias, lança `ErroDeInvariante` (RF-08, invariante). 🟢
6. Retorna `ResultadoEstimativa` com `riscoPct`, `categoriaDe(riscoPct)`, `avisos`, `notaProveniencia`, `referencias`. 🟢

## Equação (`equacao.ts`)

`Risco₁₀ = 1 − S₀[grupo]^exp(somaIndividual − mean[grupo])`, onde `somaIndividual` soma:
- `lnIdade·ln(idade)` + `lnIdade2·ln(idade)²`
- `lnColesterolTotal·ln(CT)` + `lnIdadeXlnColesterol·ln(idade)·ln(CT)`
- `lnHdl·ln(HDL)` + `lnIdadeXlnHdl·ln(idade)·ln(HDL)`
- `termoPas` = (tratada ? `lnPasTratada·ln(PAS) + lnIdadeXlnPasTratada·ln(idade)·ln(PAS)` : os homólogos não-tratada)
- `tabagismo·fuma` + `lnIdadeXtabagismo·ln(idade)·fuma`
- `diabetes·temDiabetes`

🟢 A estrutura de `RegistroCoeficientes` é uniforme (13 termos); um termo ausente no modelo tem coeficiente 0. `grupoDe` mapeia `afro-americano`→modelo negro, qualquer outra raça→modelo branco (RN-05).

## Dois níveis de tratamento de entrada (D-07)

- **Ofensor** (`validarEntrada`) — tipo/domínio inválido → **trava** com `EntradaInvalida`, todos de uma vez.
- **Aviso** (`clamparEntrada`) — valor válido fora da faixa fisiológica → **clampa** e sinaliza o viés, não trava.
- **Fora de escopo** (`foraDoEscopo`) — idade plausível fora de 40–79, ou DCV prévia → recusa honesta, sem número.

Fluxograma completo em `flowcharts/models-risco-cardiovascular.md`.

## Decisões de projeto

- 🟢 **PCE, não AHA PREVENT** (ADR 0014): a recomendação de estatina da USPSTF (2022) foi calibrada sobre as PCE; usar a PREVENT desalinharia número e conduta.
- 🟢 **Coeficientes em precisão estendida** validados contra `CVrisk`/`PooledCohort` (concordância cruzada), reproduzindo o ASCVD Risk Estimator Plus. Correção documentada do `mean` de homens negros (19.5425, D-04).
- 🟢 **Nota de proveniência única** congelada no domínio: a limitação de transportabilidade é declarada, não corrigida no cálculo (RN-09).
- 🟡 **`raca="outra"` → branco** (RN-05, D-05): premissa herdada da ferramenta de referência, a validar pelo prescritor.

## Contratos-chave (`tipos.ts`)

- `EntradaEstimativa`: sexo, raca, idadeAnos, colesterolTotalMgDl, hdlMgDl, pasMmHg, emTratamentoAntiHipertensivo, diabetes, tabagismoAtual, dcvPrevia.
- `ResultadoEstimativa`: riscoPct, categoria, avisos[], notaProveniencia, referencias[] (nunca vazia).
- `ForaDoEscopoDaFonte`: motivo (`IDADE_FORA_DA_FAIXA` | `DCV_PREVIA`), mensagem, referencia.
- `EntradaInvalida`: ofensores[] (coleta total).
