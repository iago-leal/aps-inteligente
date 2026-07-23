# models/cardiopatia-isquemica — Motor de dor torácica e probabilidade pré-teste

> `requirements.md` · Foca no QUE a unit faz. Re-extração 2 (2026-07-23), absorvendo a feature `010-dor-toracica-pre-teste`.
> Fonte clínica única: *TeleCondutas — Cardiopatia Isquêmica* (TelessaúdeRS-UFRGS, 2017), pp. 4–6 (Quadros 1 e 2).

## Visão Geral

Terceira unit de domínio da plataforma, no molde de `models/insulina` e `models/gestacao`: classifica a dor torácica pelas três características do Quadro 1, estima a probabilidade pré-teste de doença arterial coronariana (DAC) por idade e sexo pela matriz congelada do Quadro 2, ajusta pela presença de fatores de risco e traduz a probabilidade em conduta de investigação por estrato. Estratificar não é prescrever: o motor orienta a investigação, sem ritual de revisão. Domínio puro e determinista; erro esperado é valor. 🟢

## Responsabilidades

- Validar a entrada com coleta total de ofensores (idade, sexo, fatores de risco). 🟢
- Recusar honestamente idade fora de 30–69 com `ForaDoEscopoDaFonte`, sem extrapolar. 🟢
- Classificar a dor em típica / atípica / não anginosa pela contagem das três características. 🟢
- Estimar a probabilidade-base (%) por lookup na matriz de 24 células (classificação × sexo × faixa etária). 🟢
- Ajustar a probabilidade por fatores de risco como faixa base×2–base×3, capada em 99%. 🟢
- Estratificar em baixa / intermediária / alta e mapear o estrato à conduta e ao exame. 🟢
- Emitir advertência de encaminhamento emergencial na angina instável. 🟢
- Garantir referência clínica em toda saída de resultado (invariante). 🟢

## Regras de Negócio

- **RN-01** Classificação da dor (Quadro 1, p. 4): 3 características → típica; 2 → atípica; ≤ 1 → não anginosa. As três: retroesternal, provocada por esforço/estresse, aliviada por repouso ou nitrato. 🟢
- **RN-02** Probabilidade-base por lookup na matriz do Quadro 2 (p. 5), congelada como 24 células idade×sexo×classe. 🟢
- **RN-03** Com ≥ 1 fator de risco (diabetes, tabagismo, hipertensão, dislipidemia): faixa base×2 a base×3, capada em 99%; `excedeAlta` sinaliza extremo acima de 90% (redação ">90%"). 🟢
- **RN-04** Estratos < 10% / 10–90% / > 90%; a conduta "baixa" (não investigar) é definida pela descrição clínica — dor **não anginosa E sem fatores de risco** —, não pelo corte numérico isolado (nota ** do Quadro 2). Qualquer fator de risco impede "baixa". 🟢
- **RN-05** Exame recomendado: ergometria por padrão; método não invasivo quando o ECG basal impede a interpretação ou o paciente não pode exercitar (`impedimentoErgometria`). 🟢
- **RN-06** Idade plausível fora de 30–69 não é ofensor: é fora-do-escopo da fonte, sem número estimado. 🟢
- **RN-07** Sinais de angina instável / dor aguda: advertência de encaminhamento emergencial, desviando do fluxo eletivo. 🟢
- **RN-08** Blocos de referência complementar (CCS, tratamento, seguimento, manejo agudo) são material consultável, fora do cálculo. 🟡 (apresentação — ver `interface-cardiologia`)
- **RN-09** Nenhuma saída de resultado sem ao menos uma referência clínica; violação é bug interno. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Classificar a dor pelas três características | Must | 3 verdadeiras → `tipica`; 2 → `atipica`; 0–1 → `nao-anginosa` |
| RF-02 | Estimar probabilidade-base por idade×sexo×classe | Must | Homem 50-59, dor típica → 93%; mulher 30-39, não anginosa → 2% (oráculo das 24 células) |
| RF-03 | Ajustar por fatores de risco | Must | Base 20% com ≥1 fator → faixa 40–60%; base 40% → 80–99% (capa) com `excedeAlta` |
| RF-04 | Estratificar e mapear conduta | Must | Não anginosa e sem fator → baixa/`exame-nao-indicado` + causas não cardíacas |
| RF-05 | Escolher ergometria × método não invasivo | Must | `impedimentoErgometria=true` → `metodo-nao-invasivo-alternativo` |
| RF-06 | Recusar idade fora de 30–69 | Must | idade 72 → `fora-do-escopo` com `IDADE_FORA_DA_TABELA` |
| RF-07 | Advertir angina instável | Must | `sinaisInstabilidade=true` → advertência `ANGINA_INSTAVEL` |
| RF-09 | Referência clínica em toda saída | Must | `referencias.length ≥ 1` sem duplicatas |
| RF-10 | Blocos de referência complementar consultáveis | Should | Material fora do cálculo (na camada de interface) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Determinismo | Lookup em matriz congelada, funções puras | `fonte-clinica.ts:48-63`, `probabilidade.ts` | 🟢 |
| Robustez | Cap em 99% impede exibir > 100% | `probabilidade.ts:16,52-54` | 🟢 |
| Honestidade da fonte | Idade fora da tabela não extrapola: fora-do-escopo | `calculadora.ts:41-49` | 🟢 |
| Falha explícita | `ErroDeInvariante` para saída sem referência | `calculadora.ts:74-77` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado dor retroesternal, provocada por esforço e aliviada por nitrato, em homem de 55 anos
Quando avaliar
Então classifica típica, probabilidade-base 93%, estrato alta, conduta de estratificação e encaminhamento

Dado dor com uma só característica em mulher de 35 anos sem fatores de risco
Quando avaliar
Então classifica não anginosa, estrato baixa, exame não indicado, causas não cardíacas listadas

Dado uma probabilidade-base intermediária e impedimento de ergometria
Quando avaliar
Então recomenda método não invasivo alternativo

Dado idade de 72 anos
Quando avaliar
Então retorna fora-do-escopo com IDADE_FORA_DA_TABELA, sem estimar número

Dado sexo inválido e um fator de risco desconhecido
Quando avaliar
Então retorna erro-validacao com SEXO_INVALIDO e FATOR_DE_RISCO_INVALIDO

Dado sinais de instabilidade presentes
Quando avaliar
Então inclui a advertência ANGINA_INSTAVEL de encaminhamento emergencial
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Classificação + probabilidade-base (RF-01/RF-02) | Must | Núcleo do cálculo |
| Estrato → conduta (RF-04) | Must | Saída que orienta o prescritor |
| Recusa de idade fora do escopo (RF-06) | Must | Honestidade da fonte, sem fallback |
| Referência em toda saída (RF-09/RN-09) | Must | Invariante de domínio |
| Ajuste por fatores de risco (RF-03) | Should | Refina a estimativa; a base já orienta |
| Advertência de instabilidade (RF-07) | Should | Segurança; caso menos frequente na APS eletiva |
| Blocos complementares (RF-10) | Could | Material de consulta, fora do cálculo |

> Prioridade inferida por posição na cadeia (validação → escopo → classificação → probabilidade → conduta).

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `models/cardiopatia-isquemica/calculadora.ts` | `CalculadoraCardiopatiaIsquemica.avaliar` | 🟢 |
| `models/cardiopatia-isquemica/classificacao.ts` | `contarCaracteristicas` `classificarDor` | 🟢 |
| `models/cardiopatia-isquemica/probabilidade.ts` | `faixaEtariaDe` `probabilidadeBasePct` `ajustarPorFatoresDeRisco` `estratoDe` | 🟢 |
| `models/cardiopatia-isquemica/conduta.ts` | `exameRecomendado` `condutaPara` `advertenciasPara` | 🟢 |
| `models/cardiopatia-isquemica/validacao.ts` | `validarEntrada` | 🟢 |
| `models/cardiopatia-isquemica/fonte-clinica.ts` | `PROBABILIDADE_PRE_TESTE` `CONSTANTES` `REFERENCIAS` `TEXTO_*` | 🟢 |
| `models/cardiopatia-isquemica/tipos.ts` | contratos, `ForaDoEscopoDaFonte`, `ErroDeInvariante` | 🟢 |
