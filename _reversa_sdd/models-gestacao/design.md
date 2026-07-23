# models/gestacao — Design Técnico

> `design.md` · Foca no COMO a unit é construída, a partir do código legado lido. Re-extração 2.

## Interface

API pública única: a fachada `CalculadoraIdadeGestacional`, com um método.

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `CalculadoraIdadeGestacional.calcular` | `(entrada: EntradaDatacao)` | `SaidaDatacao` | Validação → datação → comparação; pura e determinista |

Entrada (`EntradaDatacao`, `tipos.ts:31`):

| Campo | Tipo | Obrigatório | Observação |
|-------|------|-------------|------------|
| `dataReferencia` | `DataIso` (`AAAA-MM-DD`) | sim | Injetada pela UI; o motor não lê o relógio (RN-07) |
| `dum` | `DataIso?` | não | Ao menos uma datação (dum ou ultrassom) é exigida |
| `ultrassom` | `DatacaoUltrassom?` | não | `{ dataExame?, semanas?, dias? }`; parcial é ofensor |

Saída (`SaidaDatacao = ResultadoDatacao | ErroValidacao`, união discriminada por `tipo`):

- `ResultadoDatacao` (`tipo: "resultado"`): `porDum?`, `porUltrassom?`, `comparacao?`, `notas[]`, `referencias[]` (nunca vazia).
- `ErroValidacao` (`tipo: "erro-validacao"`): `ofensores[]` com `{ campo, codigo, mensagem }`.

## Fluxo Principal

1. `calcular` invoca `validarEntrada` (`validacao.ts`); havendo ofensores, retorna `erro-validacao` imediatamente. `calculadora.ts:44-48` 🟢
2. Se há `dum`, calcula `igEntre(dum, dataReferencia)`, `dppPorNaegele(dum)` e `trimestreDaIg`; empilha as referências da datação pela DUM, da regra de Naegele, e a nota de confiabilidade da DUM. `calculadora.ts:53-68` 🟢
3. Se há `ultrassom`, retroprojeta `dumEquivalente(dataExame, semanas, dias)`, calcula IG/DPP/trimestre a partir dela e guarda a IG do exame em dias para a comparação. `calculadora.ts:70-91` 🟢
4. Com as duas datações, chama `comparar(dum, dumEquivalenteUsg, igNoExameDias)` e empilha a referência das margens. `calculadora.ts:93-101` 🟢
5. Empilha a nota `ESTIMATIVA_NA_DATA_DE_REFERENCIA`, deduplica referências por `localizacao` e, se o resultado ficaria sem referência, lança `ErroDeInvariante` (RN-06). `calculadora.ts:103-113` 🟢
6. Monta `ResultadoDatacao` incluindo apenas os blocos presentes (spread condicional). `calculadora.ts:115-124` 🟢

## Fluxos Alternativos

- **Ultrassom incompleto atravessa a validação:** `ErroDeInvariante` em `calculadora.ts:75-79` — nunca deve ocorrer, pois a validação já barra (defesa em profundidade). 🟢
- **Comparação no 3.º trimestre:** `margemPorTrimestre` retorna `undefined`; veredito `sem-parametro-na-fonte`, a arbitragem fica ao julgamento clínico (D-05). `calculadora.ts:141-150` 🟢
- **Divergência dentro da margem:** veredito `dum-confirmada`; além dela, `dum-fora-da-margem` com instrução de usar o ultrassom. `calculadora.ts:152-170` 🟢
- **Data de calendário impossível:** `paraDiasEpoch` devolve `null`, virando ofensor `DATA_INVALIDA` na validação, jamais normalização silenciosa. `datas.ts:18-26` 🟢

## Dependências

- `fonte-clinica.ts` — constantes numéricas e catálogo de referências/textos (fonte única anti-drift). 🟢
- `datacao.ts` — regras puras (IG, Naegele, retroprojeção, trimestre), pré-condição: datas já validadas. 🟢
- `datas.ts` — aritmética de datas em dias epoch UTC. 🟢
- `validacao.ts` — coleta total de ofensores. 🟢
- Nenhuma dependência de framework ou de `models/insulina`: motores independentes. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Aritmética de datas em dias epoch UTC, sem fuso local (ADR 0013 / D-02) | `datas.ts:1-7,17` | 🟢 |
| Erro esperado é valor; exceção só para invariante (ADR 0004) | `tipos.ts:106-120`, `datas.ts:11` | 🟢 |
| O motor informa o veredito, não escolhe a datação (ADR 0005 / D-04, D-05) | `calculadora.ts:126-171` | 🟢 |
| Uma fonte clínica por unit, sem mescla com o guia de diabetes (ADR 0011) | `fonte-clinica.ts:1-9` | 🟢 |
| Naegele calendárica: dia inexistente transborda para o mês seguinte (Date.UTC) | `datas.ts:46-58` | 🟢 |
| Deduplicação de referências por `localizacao` | `calculadora.ts:26-35` | 🟢 |

## Estado Interno

Nenhum. A unit é uma função pura embrulhada em fachada: cada `calcular` é independente, sem memória entre chamadas. 🟢

## Observabilidade

A unit não emite logs nem métricas por construção (privacidade e pureza). O canal de "erro barulhento" é o `ErroDeInvariante`, que sobe como exceção nomeada quando um invariante de domínio é violado. 🟢

## Riscos e Lacunas

- 🟡 Cortes de trimestre 13+6 / 27+6 (RN-04): convenção obstétrica adotada; o guia não os define numericamente. A validar com o prescritor.
- 🟡 Limites de plausibilidade (RN-05): DUM até 44 semanas retroativa, IG do laudo 0–42 semanas / 0–6 dias. Números arbitrados, não citados na fonte.
- 🟢 Fórmulas do motor (IG, Naegele, retroprojeção, margens) promovidas a CONFIRMADO nesta re-extração (observações O-01..O-04 do watch 007), verificadas por testes property-based.
