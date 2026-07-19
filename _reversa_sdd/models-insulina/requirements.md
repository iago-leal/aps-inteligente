# models-insulina — Motor de cálculo de insulina DM2

> Gerado pelo Reversa Writer em 2026-07-19. Foca no QUE a unit faz.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA. Regras completas em `../domain.md`; decisões em `../adrs/`.

## Visão Geral

🟢 Motor determinístico de apoio à insulinização no DM2, em TypeScript puro (zero dependências, zero framework), que transforma uma `EntradaCalculo` (peso, glicemias, HbA1c, esquema atual) numa `SaidaCalculo` com condutas, alertas, recomendações e referência à fonte clínica única (Guia Rápido DM — SMS-Rio, 2.ª ed. 2023). É a única camada com regra clínica do sistema.

## Responsabilidades

- Validar a entrada coletando **todos** os ofensores (defesa em profundidade: não confia na UI).
- Recusar com orientação o que a fonte não cobre (`ForaDoEscopoDaFonte`).
- Calcular: início de insulinização (faixa), titulação basal da NPH pelo jejum, fracionamento, intensificação com Regular (braços AA/AJ/AD) e titulação da Regular.
- Anexar a cada saída: alertas ordenados por severidade, recomendações deduplicadas e ≥ 1 `ReferenciaClinica`.
- Garantir realizabilidade física: doses inteiras 1–60 UI (caneta SUS).

## Regras de Negócio

Numeração R-xx conforme a tabela canônica da fonte; decisões AMB-01..10 em `../domain.md` §5.

- **RN-A (início):** saída em **faixa** 10–15 UI/dia e `round(0,1..0,2 × kg)`, NPH ao deitar; o médico fixa a dose (AMB-01). 🟢
- **RN-B (indicação):** alerta quando HbA1c ≥ 10% (AMB-08) ou jejum ≥ 300 mg/dL. 🟢
- **RN-C (comedicação no início):** manter metformina; manter sulfonilureia salvo `usoSulfonilureia === false`; aferir jejum 3×/semana por 15 dias. 🟢
- **RN-D (agregação):** jejum agrega por média; **hipoglicemia (qualquer ≤ 70) prevalece** (AMB-06). 🟢
- **RN-E (titulação basal):** ≤ 70 → −4 + alerta; ≥ 180 → +4 (AMB-09); 130–179 → +2; 71–129 → na meta, delta 0 (AMB-02/05). Incide na NPH mais noturna (`ao_deitar → antes_jantar → antes_almoco → antes_cafe`); sem NPH, jejum não titula. 🟢
- **RN-F (clamp):** toda dose clampada em 1–60 UI; clamp atuante gera `TETO_POR_APLICACAO`. 🟢
- **RN-G (fracionamento):** NPH única > 30 UI ou > 0,4 UI/kg/dia → principal ½ café (`ceil`) + ½ deitar; alternativa ⅔ (`round`) + ⅓ (AMB-10). Com sulfonilureia explícita: recomendar suspender; sempre manter metformina. 🟢
- **RN-H (gate de HbA1c):** ≤ 7% sem Regular → manter, repetir HbA1c 6 meses; ≤ 7% com Regular → ajustar + avaliar endócrino; > 7% sem pré-prandiais → recomendar aferir AA/AJ/AD e parar; ausente → só prossegue se já intensificado com pré-prandiais (repetir HbA1c 3 meses). 🟢
  ⚠️ **Divergência validada (Reviewer, 2026-07-19):** nos ramos residuais com HbA1c ausente o motor hoje retorna **silenciosamente** — o usuário médico confirmou que o comportamento desejado é **recomendar dosar HbA1c**. Registrar como bug via `/reversa-debugger` (teste de regressão antes do fix, Princípio VII); até lá, o código realiza o silêncio e esta spec documenta o as-is.
- **RN-I (braços deslocados):** AA → Regular antes do café; AJ → antes do almoço; AD → antes do jantar (R-14..R-17). Por braço: ≤ 70 → alerta + Regular −2 se existir; < 130 → manter; ≥ 130 com Regular → +2; sem Regular e gate aberto → iniciar 4 UI. 🟢
- **RN-J (equivalência AJ):** com NPH no café, devolver **duas condutas rotuladas** sem escolher (AMB-03). 🟢
- **RN-K (faixa plena):** > 1,0 UI/kg/dia → alerta + "compartilhar cuidado com especialista"; **sem trava** (AMB-04). 🟢
- **RN-L (pós-prandial):** intensificado, HbA1c alta e nada ajustado → recomendar aferição pós-prandial, explicitando que o guia não parametriza (NG-07). 🟢
- **RN-M (cadência):** houve ajuste → recomendar reavaliação em 3 dias. 🟢
- **RN-N (rastreabilidade):** toda saída, alerta, recomendação e conduta alternativa carrega `ReferenciaClinica` com página/figura. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Validar entrada coletando todos os ofensores (peso 0<p≤350; glicemias 10–1000; HbA1c 3–20 se presente; titulação: esquema não vazio, doses inteiras 1–60, ≥1 glicemia; EC-10: pré-prandiais + sem Regular exigem HbA1c) | Must | Entrada com N problemas → `ErroValidacao` com N ofensores, campos em path notation |
| RF-02 | Recusar insulina fora de NPH/Regular com `ForaDoEscopoDaFonte` + orientação | Must | Esquema com "Glargina" → `fora-do-escopo`, nunca cálculo parcial |
| RF-03 | Modo início: faixa absoluta + faixa por peso + aplicação sugerida (RN-A/B/C) | Must | Peso 80 kg → faixa 10–15 e 8–16 UI; NPH ao deitar |
| RF-04 | Modo titulação: pipeline titulação basal → fracionamento → intensificação (RN-D..RN-L) | Must | Cenários da Figura 4 reproduzidos numericamente |
| RF-05 | Pós-processar: alertas ordenados por `SEVERIDADE`, recomendações dedup por `tipo`, referências dedup por `localizacao` | Must | Ordem `HIPOGLICEMIA > DOSE_ACIMA_FAIXA_PLENA > FRACIONAR_DOSE > TETO_POR_APLICACAO > INDICACAO_INSULINA` |
| RF-06 | Sinalizar bug interno exclusivamente via `ErroDeInvariante` (value objects `Peso`, `Glicemia`, `DoseUi`) | Must | Construir `DoseUi(0.5)` lança; nenhum fluxo esperado lança |
| RF-07 | Expor catálogo `CONSTANTES` e `REFERENCIAS` congelados para consumo da UI | Should | `Object.isFrozen` verdadeiro; UI valida com as mesmas faixas |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Pureza | Zero imports de framework ou biblioteca; funções determinísticas | `models/insulina/*.ts` (só imports relativos) | 🟢 |
| Confiabilidade | Cobertura ≥ 90% em linhas, statements, funções e branches | `vitest.config.ts` (thresholds em `models/**`) | 🟢 |
| Corretude | Invariantes por propriedade: toda saída referenciada, doses realizáveis, determinismo | `tests/unit/dominio/` com fast-check | 🟢 |
| Imutabilidade | Contratos readonly; catálogos e value objects `Object.freeze` | `tipos.ts`, `fonte-clinica.ts` | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: Titulação com hipoglicemia prevalecendo sobre a média
  Dado esquema basal com NPH 20 UI ao deitar
  E glicemias de jejum 68 e 190 mg/dL (média 129)
  Quando calcular em modo titulação
  Então a NPH ao deitar vai a 16 UI (−4)
  E há alerta HIPOGLICEMIA em primeira posição
  E naMeta é falso

Cenário: Fracionamento com condutas alternativas
  Dado paciente de 70 kg com NPH única de 32 UI
  Quando a titulação elevar ou mantiver a dose acima do gatilho (>30 UI)
  Então o esquema principal divide ½ antes do café (ceil) + ½ ao deitar
  E existe conduta alternativa rotulada ⅔ + ⅓
  E há alerta FRACIONAR_DOSE

Cenário: Braço AJ com NPH no café — motor não escolhe
  Dado esquema com NPH antes do café e AJ médio ≥ 130 com gate de HbA1c aberto
  Quando calcular
  Então o resultado traz duas condutasAlternativas rotuladas
  E nenhuma é aplicada ao esquemaSugerido por conta própria

Cenário: Entrada inválida coleta todos os ofensores
  Dado peso 400 kg e glicemia 5 mg/dL
  Quando calcular
  Então a saída é erro-validacao com 2 ofensores (PESO_FORA_DE_FAIXA, GLICEMIA_FORA_DE_FAIXA)

Cenário: Fora do escopo da fonte
  Dado esquema contendo insulina Glargina
  Quando calcular
  Então a saída é fora-do-escopo com orientação e referência
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| RF-01/RF-04/RF-06 | Must | Caminho crítico clínico; erro aqui é dano ao paciente |
| RF-02/RF-03/RF-05 | Must | Fronteira de escopo e contrato com a UI |
| RF-07 | Should | Espelhamento da validação; UI poderia duplicar faixas (pior, mas possível) |

## Rastreabilidade de Código

| Arquivo | Símbolo | Cobertura |
|---------|---------|-----------|
| `models/insulina/calculadora.ts` | `CalculadoraInsulinaDM2` | 🟢 |
| `models/insulina/validacao.ts` | `validarEntrada`, `motivoForaDoEscopo` | 🟢 |
| `models/insulina/regra-inicio.ts` | `RegraInicio` | 🟢 |
| `models/insulina/regra-titulacao-basal.ts` | `RegraTitulacaoBasal`, fracionamento | 🟢 |
| `models/insulina/regra-intensificacao.ts` | `RegraIntensificacao` | 🟢 |
| `models/insulina/fonte-clinica.ts` | `REFERENCIAS`, `CONSTANTES` | 🟢 |
| `models/insulina/tipos.ts` | contratos, value objects, `ErroDeInvariante` | 🟢 |
