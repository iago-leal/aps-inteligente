# models/cardiopatia-isquemica — Design Técnico

> `design.md` · Foca no COMO a unit é construída, a partir do código legado lido. Re-extração 2.

## Interface

API pública única: a fachada `CalculadoraCardiopatiaIsquemica`, com um método.

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `CalculadoraCardiopatiaIsquemica.avaliar` | `(entrada: EntradaAvaliacao)` | `SaidaAvaliacao` | Validação → escopo → classificação → probabilidade → conduta; pura |

Entrada (`EntradaAvaliacao`, `tipos.ts:34`):

| Campo | Tipo | Obrigatório | Observação |
|-------|------|-------------|------------|
| `idadeAnos` | `number` | sim | Inteiro 0–120 (plausibilidade); 30–69 é o escopo da tabela |
| `sexo` | `"masculino" \| "feminino"` | sim | Eixo do Quadro 2 |
| `caracteristicas` | `CaracteristicasDor` | sim | 3 booleanos do Quadro 1 |
| `fatoresDeRisco` | `FatorDeRisco[]` | sim (pode ser vazio) | diabetes, tabagismo, hipertensão, dislipidemia |
| `impedimentoErgometria` | `boolean?` | não | ECG basal altera interpretação ou paciente não pode exercitar |
| `sinaisInstabilidade` | `boolean?` | não | Padrão de angina instável / dor aguda |

Saída (`SaidaAvaliacao`), união discriminada por `tipo` com três variantes:

- `ResultadoAvaliacao` (`tipo: "resultado"`): `classificacaoDor`, `faixaEtaria`, `probabilidadeBasePct`, `probabilidadeAjustada?`, `estrato`, `conduta`, `advertencias[]`, `referencias[]` (nunca vazia).
- `ForaDoEscopoDaFonte` (`tipo: "fora-do-escopo"`): idade plausível fora de 30–69.
- `EntradaInvalida` (`tipo: "erro-validacao"`): `ofensores[]`.

## Fluxo Principal

1. `avaliar` chama `validarEntrada`; havendo ofensores, retorna `erro-validacao`. `calculadora.ts:36-39` 🟢
2. `faixaEtariaDe(idade)`; se `null` (fora de 30–69), retorna `fora-do-escopo` sem estimar. `calculadora.ts:41-49` 🟢
3. `classificarDor(caracteristicas)` conta as 3 características e mapeia típica/atípica/não anginosa. `classificacao.ts:15-20` 🟢
4. `probabilidadeBasePct(classificacao, sexo, faixa)` faz o lookup na matriz do Quadro 2. `probabilidade.ts:30-36` 🟢
5. `ajustarPorFatoresDeRisco(base, nFatores)`: sem fator, `undefined`; com fator, faixa base×2–base×3 capada em 99%. `probabilidade.ts:43-57` 🟢
6. `estratoDe(classificacao, base, ajustada)`: baixa ⟺ não anginosa e sem fator; alta ⟺ probabilidade efetiva > 90%; senão intermediária. `probabilidade.ts:67-80` 🟢
7. `condutaPara(estrato, impedimento)` e `advertenciasPara(instabilidade)`. `calculadora.ts:62-63` 🟢
8. Deduplica referências (classificação + probabilidade + ajuste? + conduta + advertências); vazia → `ErroDeInvariante` (RN-09). `calculadora.ts:65-77` 🟢

## Fluxos Alternativos

- **Idade fora de 30–69 (mas 0–120):** `fora-do-escopo` / `IDADE_FORA_DA_TABELA`, sem número. `calculadora.ts:41-49` 🟢
- **Idade fora de 0–120 ou não inteira:** ofensor de validação `IDADE_INVALIDA`. `validacao.ts:29-42` 🟢
- **Estrato baixa:** conduta `exame-nao-indicado`, exame `nenhum`, causas não cardíacas anexadas. `conduta.ts:43-51` 🟢
- **Impedimento de ergometria em estrato não-baixo:** exame `metodo-nao-invasivo-alternativo`. `conduta.ts:19-27` 🟢
- **Angina instável:** advertência `ANGINA_INSTAVEL` acrescida ao resultado. `conduta.ts:69-78` 🟢

## Dependências

- `fonte-clinica.ts` — matriz `PROBABILIDADE_PRE_TESTE` (24 células congeladas), `CONSTANTES`, `REFERENCIAS`, textos. 🟢
- `classificacao.ts`, `probabilidade.ts`, `conduta.ts`, `validacao.ts` — regras puras. 🟢
- Nenhuma dependência de framework nem dos outros motores (`insulina`, `gestacao`): unidades independentes. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Matriz do Quadro 2 congelada como fonte numérica única (transcrição das 24 células) | `fonte-clinica.ts:48-63` | 🟢 |
| Ajuste por fatores como faixa base×2–base×3 capada em 99% (D-03, 2026-07-23) | `probabilidade.ts:43-57` | 🟢 |
| "Baixa" pela descrição clínica (não anginosa E sem fatores), não pelo corte numérico | `probabilidade.ts:59-80` | 🟢 |
| Idade fora da tabela é fora-do-escopo, não erro nem extrapolação (ADR — honestidade da fonte) | `calculadora.ts:41-49` | 🟢 |
| Uma fonte clínica por unit (ADR 0011): TeleCondutas 2017, sem mescla | `fonte-clinica.ts:1-14` | 🟢 |
| Sem ritual de revisão: estratificar não prescreve dose (ADR 0012) | ausência de gate; ver `interface-cardiologia` | 🟢 |

## Estado Interno

Nenhum. Fachada sobre funções puras; cada `avaliar` é independente. 🟢

## Observabilidade

Sem logs nem métricas (privacidade e pureza). `ErroDeInvariante` é o canal de falha barulhenta para invariante violado. 🟢

## Riscos e Lacunas

- 🟡 Semântica clínica do estrato "baixa" (nota ** do Quadro 2): a leitura "não anginosa E sem fatores" foi decidida em 2026-07-23 e merece chancela do prescritor (observação O-10-03).
- 🟡 Transcrição das 24 células (observação O-10-01): oráculo de teste replica a matriz; conferir contra o PDF na validação clínica.
- 🟡 Cap da faixa por fatores de risco em 99% e leitura ">90%" (observação O-10-02).
- 🟢 Fórmulas e mapeamentos centrais verificados por property-based e oráculo das 24 células na entrega 010.
