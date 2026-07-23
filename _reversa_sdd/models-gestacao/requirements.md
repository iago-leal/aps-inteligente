# models/gestacao — Motor de datação gestacional

> `requirements.md` · Foca no QUE a unit faz. Re-extração 2 (2026-07-23), absorvendo a feature `007-idade-gestacional-e-home`.
> Fonte clínica única: *Guia Rápido Pré-Natal* — SMS-Rio, 4.ª ed., 2025 (pp. 31–32 e 113).

## Visão Geral

Segunda unit de domínio da plataforma, no molde de `models/insulina`: a partir da última menstruação (DUM), do último ultrassom, ou de ambos, calcula a idade gestacional (IG) e a data provável do parto (DPP) numa data de referência informada. Quando as duas datações coexistem, informa um veredito de concordância pela margem de erro da USG, sem escolher a datação pelo prescritor. Domínio puro e determinista: não lê relógio nem rede, e todo erro esperado é valor, nunca exceção. 🟢

## Responsabilidades

- Validar a entrada com coleta total de ofensores, revalidando tudo sem confiar na UI. 🟢
- Calcular a IG em semanas completas e dias a partir da DUM (ou da DUM equivalente do ultrassom) até a data de referência. 🟢
- Calcular a DPP pela regra de Naegele calendárica (+7 dias, +9 meses). 🟢
- Retroprojetar a DUM equivalente de um laudo de ultrassom (`dataExame − (semanas×7 + dias)`). 🟢
- Classificar o trimestre pelos cortes 13+6 / 27+6. 🟡
- Com as duas datações presentes, comparar DUM e DUM equivalente da USG e emitir veredito informativo pela margem do trimestre do exame. 🟢
- Anexar notas fixas ao prescritor (confiabilidade da DUM; caráter de estimativa) e garantir referência clínica em toda saída. 🟢

## Regras de Negócio

- **RN-01** IG = ⌊dias decorridos da DUM até a referência ÷ 7⌋ semanas + resto em dias (p. 31). 🟢
- **RN-02** DPP pela regra de Naegele calendárica: soma 7 dias à DUM, depois 9 meses (p. 32). 🟢
- **RN-03** DUM equivalente do ultrassom: `dataExame − (semanas×7 + dias do laudo)`. 🟢
- **RN-04** Trimestre pelos cortes convencionais 13+6 (1.º→2.º) e 27+6 (2.º→3.º); o guia usa os trimestres sem defini-los numericamente. 🟡
- **RN-05** Validação com limites de plausibilidade: DUM não futura e no máximo 44 semanas retroativa; IG do laudo entre 0–42 semanas e 0–6 dias; exame não futuro. 🟡 (os limites numéricos são premissa)
- **RN-06** Nenhuma saída de resultado sem ao menos uma referência clínica; violação é bug interno (`ErroDeInvariante`). 🟢
- **RN-07** A data de referência é injetada pela UI; o motor não lê o relógio do sistema. 🟢
- **RN-11** Com DUM e USG: se a divergência excede a margem do trimestre do exame (7 dias no 1.º, 14 no 2.º), a fonte manda desconsiderar a DUM; no 3.º trimestre a fonte não parametriza margem e o motor devolve `sem-parametro-na-fonte`. O motor informa o veredito, não escolhe a datação. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Calcular IG e DPP a partir da DUM | Must | DUM 2025-01-01, ref. 2025-04-02 → IG 13s0d, DPP por Naegele; `referencias` não vazia |
| RF-02 | Calcular IG e DPP a partir do ultrassom (retroprojeção) | Must | Exame 2025-03-01 com laudo 10s0d → `dumEquivalente` = 2024-12-20; IG na referência coerente |
| RF-03 | Coletar TODOS os ofensores da entrada de uma vez | Must | Entrada com DUM futura e USG incompleta → `ofensores` contém os dois códigos |
| RF-04 | Anexar referência clínica em toda saída de resultado | Must | Qualquer resultado válido tem `referencias.length ≥ 1` sem duplicatas |
| RF-07 | Anexar notas fixas ao prescritor (confiabilidade DUM, estimativa) | Should | Resultado por DUM inclui nota `CONFIABILIDADE_DUM`; todo resultado inclui `ESTIMATIVA_NA_DATA_DE_REFERENCIA` |
| RF-09 | Comparar DUM × USG e emitir veredito informativo | Must | Entrada dupla dentro da margem → `dum-confirmada`; além da margem → `dum-fora-da-margem`; 3.º trimestre → `sem-parametro-na-fonte` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Determinismo | Aritmética de datas inteira sobre `Date.UTC`, sem fuso local nem horário de verão | `models/gestacao/datas.ts:1-7` | 🟢 |
| Robustez | Data de calendário impossível (ex.: 30/02) vira `null`, não normaliza silenciosamente | `models/gestacao/datas.ts:18-26` | 🟢 |
| Privacidade | Sem `Date` de relógio, sem I/O, sem rede; a referência temporal é parâmetro | `models/gestacao/tipos.ts:32`, `calculadora.ts` | 🟢 |
| Falha explícita | Invariantes violados lançam `ErroDeInvariante` (bug), separados de erro de entrada (valor) | `models/gestacao/tipos.ts:114-120` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma DUM válida e uma data de referência posterior
Quando calcular a datação
Então retorna IG em semanas completas e dias, DPP por Naegele, trimestre e referências não vazias

Dado um laudo de ultrassom completo (data do exame e IG)
Quando calcular a datação
Então retroprojeta a DUM equivalente e datação por ultrassom coerente

Dado DUM e ultrassom cuja divergência excede a margem do trimestre do exame
Quando calcular a datação
Então o veredito é "dum-fora-da-margem" e a mensagem manda usar o ultrassom como referência

Dado nenhuma datação informada (sem DUM e sem ultrassom)
Quando calcular a datação
Então retorna erro-validacao com o ofensor NENHUMA_DATACAO_INFORMADA

Dado uma DUM no futuro em relação à referência
Quando calcular a datação
Então retorna erro-validacao com o ofensor DUM_FUTURA
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Cálculo de IG/DPP por DUM (RF-01) | Must | Caminho crítico e mais comum da datação |
| Validação com coleta total (RF-03) | Must | Porta de entrada; sem ela o cálculo opera sobre lixo |
| Referência clínica em toda saída (RF-04/RN-06) | Must | Invariante de domínio, sem fallback |
| Veredito DUM × USG (RF-09/RN-11) | Must | Regra clínica central da entrada dupla |
| Notas ao prescritor (RF-07) | Should | Ressalvas importantes, mas não bloqueiam o cálculo |
| Classificação de trimestre (RN-04) | Should | Necessária para a margem, porém premissa numérica 🟡 |

> Prioridade inferida por frequência de uso e posição na cadeia (validação → datação → comparação).

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `models/gestacao/calculadora.ts` | `CalculadoraIdadeGestacional.calcular` / `.comparar` | 🟢 |
| `models/gestacao/datacao.ts` | `igEntre` `dppPorNaegele` `dumEquivalente` `trimestreDaIg` | 🟢 |
| `models/gestacao/datas.ts` | `paraDiasEpoch` `deDiasEpoch` `somarDias` `somarMeses` | 🟢 |
| `models/gestacao/validacao.ts` | `validarEntrada` | 🟢 |
| `models/gestacao/fonte-clinica.ts` | `REFERENCIAS` `CONSTANTES` `TEXTO_NOTAS` | 🟢 |
| `models/gestacao/tipos.ts` | contratos e `ErroDeInvariante` | 🟢 |
