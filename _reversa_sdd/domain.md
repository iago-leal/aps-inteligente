# Domínio — aps-inteligente

> Regenerado pelo Reversa Detective em 2026-07-23 (**re-extração nº 3** — absorve as features 011–014 sobre a base 001–010).
> Substitui a versão de 2026-07-19, que cobria só o domínio da insulina.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA
> Fontes: código em `models/{insulina,gestacao,cardiopatia-isquemica,risco-cardiovascular}/` e `interface/`; histórico git atual; adendos `_reversa_sdd/addenda/001–014`; requirements/regression-watch das features em `_reversa_forward/`; microdecisões pré-refundação (MD-0001..0011, AMB-01..10) recuperáveis no bundle `~/dev/aps-inteligente-backup.bundle`.

## 1. O sistema em uma frase

🟢 **Plataforma de calculadoras clínicas de apoio à decisão para a Atenção Primária à Saúde**, dirigida ao médico prescritor, 100% client-side no cálculo clínico. Nasceu como calculadora única de insulinização no DM2 (feature 001+) e, pelas features 007, 010 e 014, tornou-se uma **plataforma guarda-chuva com quatro domínios clínicos independentes**, cada um com **uma fonte clínica única** e um catálogo próprio de referências. A regra editorial atravessa a plataforma inteira: cada calculadora cobre exatamente o que a sua fonte cobre, nada além (MD-0009).

| Domínio | Calculadora | Fonte clínica única | Feature |
|---|---|---|---|
| `models/insulina` | Insulina DM2 (início, titulação, intensificação, antidiabéticos orais) | *Guia Rápido Diabetes Mellitus* — SMS-Rio, 2.ª ed. atualizada, 2023 | 001+ |
| `models/gestacao` | Idade gestacional, DPP, trimestre (DUM × USG) | *Guia Rápido Pré-Natal* — SMS-Rio, 4.ª ed., 2025 (pp. 31–32, 113) | 007 |
| `models/cardiopatia-isquemica` | Dor torácica e probabilidade pré-teste de DAC | *TeleCondutas — Cardiopatia Isquêmica* — TelessaúdeRS-UFRGS, 2017 | 010 |
| `models/risco-cardiovascular` | Risco de ASCVD em 10 anos (Pooled Cohort Equations) | *2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk* (Goff et al., 2014) | 014 |

## 2. Glossário

### 2.1 Transversal à plataforma

| Termo | Significado |
|---|---|
| **APS** | Atenção Primária à Saúde, contexto assistencial do produto (SUS) |
| **Fonte clínica** | O documento-guia de um domínio; toda saída carrega `ReferenciaClinica` com página/quadro/figura |
| **Uma fonte por unit** | Cada calculadora tem uma única fonte, sem mescla entre domínios (RN-06 da 007; ADR 0011) |
| **Domínio puro** | Camada `models/*` sem `import` de React/Next/biblioteca externa; só TypeScript (ADR 0003) |
| **Erro como valor** | Erro esperado é variante de union discriminada por `tipo`, nunca exceção (ADR 0004) |
| **`ErroDeInvariante`** | Única exceção lançada; sinaliza **bug interno**, leva ao painel honesto na UI |
| **Ofensor** | Violação de validação de entrada; a validação coleta **todos**, nunca para no primeiro |
| **Fora do escopo da fonte** | Saída honesta quando o cenário é plausível mas não coberto pelo guia — recusa em vez de extrapolar |
| **Painel honesto** | Tela de falha inesperada: "não prescreva/decida a partir desta tela" |
| **O motor informa, não escolhe** | Diante de condutas equivalentes ou de datações divergentes, o motor devolve as opções/veredito; a decisão é do médico (ADR 0005) |
| **Prescritor (anônimo)** | Único papel do sistema: médico usando a calculadora no navegador; nenhum dado sai do dispositivo |
| **MD-xxxx / AMB-xx** | Microdecisões e ambiguidades do guia decididas pelo usuário médico (ver §7 e §8) |

### 2.2 Insulina (DM2)

| Termo | Significado |
|---|---|
| **DM2** | Diabetes mellitus tipo 2, condição-alvo da calculadora |
| **NPH / Regular** | Insulina basal (ação intermediária) / prandial (ação rápida) do guia |
| **Início / Titulação** | Primeira prescrição para virgem de insulina / ajuste de esquema existente por glicemias |
| **Titulação basal** | Ajuste da NPH pela glicemia de jejum (+4 / +2 / 0 / −4 UI) |
| **Fracionamento** | Divisão da NPH única em duas aplicações (NPH > 30 UI **ou** > 0,4 UI/kg/dia) |
| **Intensificação** | Introdução/ajuste da Regular pelas pré-prandiais (braços AA/AJ/AD) |
| **AA / AJ / AD** | **A**ntes do **A**lmoço / do **J**antar / ao **D**eitar (momentos de aferição) |
| **Esquema** | `basal` (0 Regular) / `basal-plus` (1) / `basal-bolus` (≥ 2) |
| **NPH "mais noturna"** | Aplicação de NPH que recebe o ajuste do jejum: 1.ª na ordem `ao_deitar → antes_jantar → antes_almoco → antes_cafe` |
| **Faixa plena** | 0,5–1,0 UI/kg/dia (p. 61); acima de 1,0 gera alerta, não trava (AMB-04) |
| **Caneta SUS** | 1–60 UI por aplicação, graduação de 1 UI (limite físico inviolável) |
| **Ritual de revisão** | Checkbox "Revisei a dose e a fonte" que habilita "Pronto para prescrever" e o botão **Copiar plano**; qualquer edição o desfaz. **Específico da insulina** (ADR 0012) |

### 2.3 Gestação (pré-natal)

| Termo | Significado |
|---|---|
| **DUM** | Data da última menstruação; base de datação por regra de Naegele |
| **USG / laudo** | Ultrassom obstétrico: `dataExame` + IG do laudo (semanas 0–42, dias 0–6) |
| **IG** | Idade gestacional em semanas + dias, `⌊dias/7⌋` sem/`dias % 7` d (RN-01) |
| **DPP** | Data provável do parto por Naegele: `DUM + 7 dias + 9 meses`, calendárica (RN-02, D-03) |
| **DUM equivalente** | DUM retroprojetada do USG: `dataExame − (semanas×7 + dias)` (RN-03) |
| **Trimestre** | 1.º `< 14×7 d`, 2.º `< 28×7 d`, 3.º senão — cortes 13+6/27+6 (RN-04, premissa 🟡) |
| **Margem da USG** | Tolerância DUM×USG por trimestre no dia do exame: 7 d (1.º), 14 d (2.º), **sem parâmetro no 3.º** |
| **Data de referência** | Data do dispositivo injetada pela UI; o motor **não lê o relógio** (RN-07) |
| **Veredito de comparação** | `dum-confirmada` / `dum-fora-da-margem` / `sem-parametro-na-fonte` — o motor informa, não escolhe (D-04/D-05) |

### 2.4 Cardiopatia isquêmica (dor torácica)

| Termo | Significado |
|---|---|
| **DAC** | Doença arterial coronariana, condição-alvo da estimativa pré-teste |
| **Quadro 1 (3 características)** | Dor retroesternal · provocada por esforço/estresse · alivia com repouso/nitrato |
| **Classificação da dor** | 3 características → **típica**; 2 → **atípica**; ≤ 1 → **não anginosa** (RN-01) |
| **Probabilidade pré-teste** | Lookup na matriz do Quadro 2: `[classificação][sexo][faixa etária]`, 24 células (RN-02) |
| **Faixa etária** | `30-39` / `40-49` / `50-59` / `60-69` (eixo do Quadro 2) |
| **Fatores de risco** | Diabetes · tabagismo · hipertensão · dislipidemia; ≥ 1 ajusta a probabilidade (RN-03) |
| **Estrato** | `baixa` (< 10%) / `intermediaria` / `alta` (> 90%) — decisão descritiva, não puramente numérica (RN-04) |
| **Ergometria × método não invasivo** | Exame padrão é ergometria; `impedimentoErgometria` (ECG basal altera interpretação ou paciente não pode exercitar) → método não invasivo alternativo (RN-05) |
| **Angina instável** | `sinaisInstabilidade` → advertência de encaminhamento emergencial, fora do fluxo eletivo (RN-07) |
| **Material complementar** | CCS I–IV, tratamento + Tabela 1, seguimento, manejo agudo: referência consultável **fora do cálculo** (RN-08/RF-10) |

### 2.5 Risco cardiovascular (`models/risco-cardiovascular`, feature 014)

| Termo | Significado |
|---|---|
| **ASCVD** | Doença cardiovascular aterosclerótica; desfecho "hard" (IAM, morte coronariana, AVC fatal/não fatal) estimado em 10 anos |
| **Pooled Cohort Equations (PCE)** | Modelos de Cox sexo- e raça-específicos (Goff et al., 2013) que estimam o risco de ASCVD em 10 anos |
| **Grupo PCE** | `homem-branco` / `homem-negro` / `mulher-branca` / `mulher-negra` — cada um com seu conjunto de coeficientes |
| **Coeficiente de PAS** | A pressão sistólica entra por **um** de dois coeficientes mutuamente exclusivos: tratada × não-tratada |
| **Clamp fisiológico** | Valor válido mas fora da faixa (colesterol 130–320, HDL 20–100, PAS 90–200) é cortado ao limite e sinalizado por `Aviso`, sem travar (RN-07) |
| **Categoria de risco** | `baixo` < 5% / `limítrofe` 5–<7,5% / `intermediário` 7,5–<20% / `alto` ≥ 20% (cortes 2019 ACC/AHA) |
| **Fora do escopo** | Idade fora de 40–79 ou DCV prévia (prevenção secundária) → recusa honesta, sem número (RN-02) |
| **Nota de proveniência** | Limitação de transportabilidade das PCE ao Brasil: coorte dos EUA, categorias raciais norte-americanas (RN-09) |

---

## 3. Regras de domínio — Insulina (`models/insulina`) 🟢

As regras estão 🟢 confirmadas no código e conferidas contra as constantes de `fonte-clinica.ts`, cada uma citando página/figura do guia.

### 3.1 Início de insulinização (`regra-inicio.ts`)
1. Saída é **faixa, nunca dose única** (AMB-01): 10–15 UI/dia **e** `round(0,1×kg)`–`round(0,2×kg)`; sugestão fixa de NPH ao deitar. O médico fixa o número.
2. Alerta `INDICACAO_INSULINA` quando HbA1c ≥ 10% (AMB-08, leitura conservadora "≥") **ou** jejum ≥ 300 mg/dL.
3. Recomendações fixas: manter metformina; manter sulfonilureia salvo `usoSulfonilureia === false`; aferir jejum 3×/semana por 15 dias.

### 3.2 Titulação basal (`regra-titulacao-basal.ts`)
4. Jejum agrega por **média**, mas **hipoglicemia prevalece**: qualquer ≤ 70 → −4 UI + alerta, independentemente da média (AMB-06).
5. Tabela sobre o jejum agregado: ≤ 70 → −4; ≥ 180 → +4 (AMB-09: em 180 vale +4); ≥ 130 e < 180 → +2; 71–129 → na meta, delta 0 (AMB-02/05).
6. O ajuste incide na **NPH mais noturna**; esquema sem NPH: o jejum não titula nada.
7. Toda dose **clampada em 1–60 UI** (caneta SUS); quando o clamp atua, alerta `TETO_POR_APLICACAO`.
8. **Fracionamento** quando NPH única > 30 UI ou > 0,4 UI/kg/dia: principal ½ café (`ceil`) + ½ ao deitar; alternativa ⅔ café (`round`) + ⅓ ao deitar (AMB-10 — o motor não escolhe). Ao fracionar com sulfonilureia em uso explícito: recomendar suspendê-la; sempre manter metformina.

### 3.3 Intensificação (`regra-intensificacao.ts`)
9. **Gate de HbA1c** (R-13/R-18): ≤ 7% sem Regular → manter, repetir HbA1c em 6 meses; ≤ 7% com Regular → ajustar e avaliar encaminhamento ao endócrino; > 7% → pode iniciar Regular, mas sem pré-prandiais → recomendar aferir AA/AJ/AD e parar; HbA1c ausente → só prossegue se já intensificado **e** com pré-prandiais (recomendando `DOSAR_HBA1C`/repetir em 3 meses — reforçado pela correção do BUG-20260719-RHZ5).
10. Mapeamento **deslocado** aferição→aplicação (R-14..R-17): AA → Regular antes do **café**; AJ → antes do **almoço**; AD → antes do **jantar**.
11. Por braço: hipo ≤ 70 → alerta + Regular −2 se existir; média < 130 → manter; ≥ 130 com Regular → +2; sem Regular e gate aberto → iniciar Regular 4 UI.
12. **Caso especial AJ** (AMB-03): com NPH no café, o guia oferece duas condutas equivalentes; o motor devolve ambas como `condutasAlternativas`.
13. Titulação da Regular **espelha** a lógica do jejum (AMB-07) — inferência espelhada, citada como tal na referência.
14. **NG-07**: intensificado, HbA1c acima da meta e nada ajustado → recomendar aferição pós-prandial, explicitando que o guia não parametriza esse ajuste.

### 3.4 Antidiabéticos orais — metformina × TFG (`regra-metformina.ts`, feature 005) 🟢
15. Regra transversal aos dois modos, extraída para arquivo próprio na feature 005. **Precedência por TFG:** `SUSPENDER_METFORMINA_TFG` quando TFG < 30; `REDUZIR_METFORMINA_TFG` quando 30 ≤ TFG ≤ 45; o alerta `METFORMINA_NAO_OTIMIZADA` é **suprimido** em faixa de ajuste renal (`!tfgEmFaixaDeAjuste`) — "otimizar" contradiria a conduta renal do guia. A fachada remove `MANTER_METFORMINA` quando há suspensão. Precedência clínica **validada pelo prescritor em 22/07** (pendência do adendo 001 encerrada).

### 3.5 Regras transversais da insulina (fachada e validação)
16. Validação coleta **todos** os ofensores: peso 0 < p ≤ 350; glicemias 10–1000; HbA1c 3–20% se presente; titulação exige esquema não vazio, doses 1–60, ≥ 1 glicemia; **EC-10**: pré-prandiais + esquema sem Regular exigem HbA1c. O motor revalida tudo (EC-08).
17. Insulina fora de NPH/Regular → `ForaDoEscopoDaFonte`, nunca cálculo parcial.
18. Dose > 1,0 UI/kg/dia → alerta `DOSE_ACIMA_FAIXA_PLENA` + compartilhar cuidado com especialista (AMB-04).
19. Houve ajuste → reavaliar em 3 dias (cadência da Figura 4).
20. Alertas ordenados por severidade fixa (HIPOGLICEMIA=0 … METFORMINA_NAO_OTIMIZADA=5); recomendações deduplicadas por `tipo`, referências por `localizacao`.

---

## 4. Regras de domínio — Gestação (`models/gestacao`, feature 007) 🟢

Datação gestacional pura; a comparação DUM × USG é o coração clínico. Premissas 🟡 herdadas do roadmap 007, a validar pelo prescritor, marcadas onde ocorrem.

21. **IG (RN-01, p. 31):** entre DUM (ou DUM equivalente) e a data de referência, `⌊dias/7⌋` semanas + `dias % 7` dias.
22. **DPP (RN-02, p. 32, Naegele — D-03):** `somarMeses(somarDias(DUM, +7), +9)`, calendárica; dia excedente transborda ao mês seguinte, sem normalização silenciosa.
23. **DUM equivalente do USG (RN-03):** `dataExame − (semanas×7 + dias)`, permitindo comparar as duas datações na mesma base.
24. **Trimestre (RN-04) — premissa 🟡:** cortes convencionais 13+6/27+6 (`< 14×7` → 1.º; `< 28×7` → 2.º; senão 3.º). O guia usa os trimestres sem defini-los numericamente.
25. **Comparação DUM × USG (RN-11, D-04/D-05):** com as duas datações, compara pela **margem do trimestre no dia do exame** — 7 d (1.º), 14 d (2.º); **o 3.º trimestre não tem parâmetro na fonte** → veredito `sem-parametro-na-fonte`. Diferença > margem → `dum-fora-da-margem` (a USG passa a referência, conforme a fonte); senão → `dum-confirmada`. **O motor informa o veredito, não escolhe a datação** (ADR 0005).
26. **Data de referência como entrada (RN-07):** injetada pela UI; o motor não lê o relógio — determinismo e testabilidade.
27. **Aritmética em dias epoch UTC (D-02, ADR 0013):** toda diferença de datas roda sobre `Date.UTC` em dias inteiros; fuso e horário de verão tornariam "diferença de dias" ambígua. `paraDiasEpoch` rejeita calendário impossível (ex.: 30 de fevereiro) devolvendo `null`, nunca normalizando.
28. **Validação — coleta total:** DUM futura, DUM > 44 semanas 🟡, exame futuro, laudo fora de 0–42 sem / 0–6 dias 🟡, USG parcial (`DATACAO_ULTRASSOM_INCOMPLETA`), nenhuma datação informada (`NENHUMA_DATACAO_INFORMADA`, RN-05 — DUM ou USG, ao menos uma).

---

## 5. Regras de domínio — Cardiopatia isquêmica (`models/cardiopatia-isquemica`, feature 010) 🟢

Cascata do TeleCondutas: classificar → estimar → ajustar → conduzir → advertir. Feature aditiva; nenhuma regra dos outros domínios foi tocada.

29. **Classificação (RN-01, Quadro 1):** contagem booleana das 3 características → `tipica` (3) / `atipica` (2) / `nao-anginosa` (≤ 1).
30. **Probabilidade-base (RN-02, Quadro 2):** lookup na matriz **congelada** de 24 células `PROBABILIDADE_PRE_TESTE[classificacao][sexo][faixaEtaria]` (3 classes × 2 sexos × 4 faixas), transcrição fiel de DUNCAN et al., 2013. Tabela completa no `data-dictionary.md` §"Matriz".
31. **Ajuste por fatores de risco (RN-03, nota * do Quadro 2, D-03):** sem fator → sem ajuste (`undefined`); com ≥ 1 fator → faixa `base×2`–`base×3`, capada em **99%** (`PCT_MAX_EXIBIVEL`) para não exibir > 100%; `excedeAlta` sinaliza extremo > 90% (redação ">90%").
32. **Estrato (RN-04, nota ** do Quadro 2) — leitura descritiva 🟡:** `"baixa"` ⟺ dor **não anginosa E sem fatores de risco** (uma dor não anginosa pode tabelar até 27%, mas a conduta "não investigar" vem da descrição clínica, não do número); `"alta"` ⟺ probabilidade efetiva > 90%; o resto é `"intermediaria"`. **Qualquer fator de risco impede o estrato "baixa".**
33. **Conduta (RN-04/RN-05):** `baixa` → exame não indicado + causas não cardíacas; `intermediaria` → exame não invasivo; `alta` → estratificação + encaminhamento. Exame padrão **ergometria**, salvo `impedimentoErgometria` → **método não invasivo alternativo**.
34. **Fora de escopo (RN-06):** idade plausível (0–120, ofensor de validação) mas fora de **30–69** → `ForaDoEscopoDaFonte` com `IDADE_FORA_DA_TABELA`, **sem número estimado** — recusa honesta (MD-0009 aplicado à terceira fonte).
35. **Advertência (RN-07):** `sinaisInstabilidade` → `Advertencia` de angina instável (encaminhamento emergencial), exibida em destaque fora do fluxo eletivo.
36. **Material complementar (RN-08/RF-10):** CCS I–IV, tratamento + Tabela 1, seguimento na APS, manejo agudo entram como **referência textual consultável em `<details>`, fora do núcleo calculado**.

---

## 6. Regras de domínio — Risco cardiovascular (`models/risco-cardiovascular`, feature 014) 🟢

Estimativa das Pooled Cohort Equations: validar → escopo → clamp → equação → categoria. Feature aditiva; nenhuma regra dos outros domínios foi tocada. Fonte única: 2013 ACC/AHA Guideline (Goff et al., 2014).

37. **Equação PCE (RF-06/RN-03):** `Risco₁₀ = 1 − S₀^exp(Σ(β·X) − mean_grupo)`, com idade, colesterol total, HDL e PAS em **logaritmo natural** e termos de interação `ln(idade)×X`. A PAS entra por **um** de dois coeficientes mutuamente exclusivos (tratada × não-tratada). Coeficientes, `BASELINE_SURVIVAL` e `MEANS` congelados em `fonte-clinica.ts`, transcritos da Tabela A de Goff 2013 em **precisão estendida** validada contra os pacotes R `CVrisk` e `PooledCohort`.
38. **Seleção de grupo (RN-05, D-05) — premissa 🟡:** `raca="outra"` adota os coeficientes de **branco**, como o ASCVD Risk Estimator Plus oficial; só `afro-americano` usa o modelo negro. Escolha herdada da ferramenta de referência, a validar pelo prescritor.
39. **Dois níveis de entrada (D-07):** ofensor **trava** (sexo/raça inválidos, idade não-inteira ou fora de 0–120, valor não positivo — coleta total, RN-08); valor fora da faixa fisiológica **não trava** — é **clampado** ao limite e sinalizado por `Aviso` com a direção do viés. Faixas 🟡: colesterol 130–320, HDL 20–100, PAS 90–200.
40. **Fora de escopo (RF-05/RN-02, D-06):** DCV prévia (prevenção secundária) ou idade fora de **40–79** → `ForaDoEscopoDaFonte` com motivo distinto (`DCV_PREVIA` / `IDADE_FORA_DA_FAIXA`), **sem número** — recusa honesta, molde da cardiopatia (MD-0009).
41. **Categoria (RF-07) — premissa 🟡:** cortes do 2019 ACC/AHA Primary Prevention — `baixo` < 5%, `limítrofe` 5–<7,5%, `intermediário` 7,5–<20%, `alto` ≥ 20%.
42. **Proveniência (RF-10/RN-09, D-09):** `NOTA_PROVENIENCIA` é texto único congelado no domínio (coorte dos EUA, sem calibração para o Brasil). A tela lê a constante, não a duplica. O `ContextoDaFonte` (D-10, pós-coding) explica **por que PCE e não a AHA PREVENT** — porque a recomendação de estatina da USPSTF (2022) foi calibrada sobre as PCE; link `<a>` nativo à PREVENT, sem requisição de rede (ADR 0002 preservado). **O motor informa o risco, nunca a conduta** (ADR 0005).

---

## 7. Invariantes transversais aos quatro domínios 🟢

O que torna as quatro units reconhecíveis como uma "família" arquitetural (verificado por property-based testing em cada domínio):

1. **Domínio puro** — nenhum `import` de framework (ADR 0003).
2. **Erros esperados são valores** (union por `tipo`); `ErroDeInvariante` só para bug (ADR 0004).
3. **Toda saída carrega `ReferenciaClinica`** — resultado sem referência é invariante violado.
4. **Coleta total de ofensores** na validação — nunca para no primeiro erro.
5. **Constantes clínicas congeladas** (`Object.freeze`) em `fonte-clinica.ts`, comentadas com o RN/Quadro de origem — fonte numérica única anti-drift.
6. **O motor informa, não escolhe** (ADR 0005): insulina devolve `condutasAlternativas`; gestação devolve `veredito` de comparação; cardiopatia devolve estrato + conduta; risco cardiovascular devolve `riscoPct` + categoria, nunca "a decisão".
7. **Privacidade por construção** (ADR 0002): nenhum domínio nem tela faz `fetch`/`storage` de dado clínico. Único `localStorage`: a preferência de tema (`aps-inteligente:tema`). Único acesso a rede: o healthcheck `/api/v1/status`, sem dado clínico. `EventoDeErro` transporta **só o nome da classe** do erro — vazamento de payload é estruturalmente impossível.

### 7.1 Regras da interface com força de domínio
8. **Invalidação por edição:** qualquer edição de formulário marca o resultado como `desatualizado`; nas quatro telas. Na insulina, desfaz também o ritual de revisão.
9. **A UI espelha as faixas do domínio** importando as constantes — não há segunda fonte de números em nenhuma tela.
10. **Ritual de revisão só na insulina** (ADR 0012, D-08): gestação, cardiopatia e risco cardiovascular não têm checkbox de confirmação — datar, estratificar e estimar risco não prescrevem dose.

### 7.2 Regras da interface com força de navegação (features 011/013)
11. **Comando de início só nas calculadoras** (D-03/D-04): a `Moldura` renderiza o `IconButton` de casa (`HomeIcon`, `next/link`) apenas quando `logoComoTitulo` é falso — na home seria redundante. É o único link do cabeçalho da calculadora.
12. **Alternador de tema exibe o tema-ALVO** (D-01/D-02): `SunIcon` quando o vigente é escuro (acionar clareia), `MoonIcon` quando é claro; nome acessível "Ativar tema claro/escuro". Só apresentação; a preferência e sua semântica (`data-tema`) são idênticas às da feature 004.

---

## 8. Fronteiras de escopo (o que o sistema recusa por design) 🟢

- **Insulinas fora de NPH/Regular** → `ForaDoEscopoDaFonte` (MD-0009).
- **Idade fora de 30–69** na cardiopatia → `ForaDoEscopoDaFonte`, sem extrapolar (RN-06).
- **Idade fora de 40–79 ou DCV prévia** no risco cardiovascular → `ForaDoEscopoDaFonte`, sem estimar (RN-02 da 014); as PCE só foram validadas em prevenção primária, 40–79 anos.
- **3.º trimestre na comparação DUM×USG** → `sem-parametro-na-fonte` (a fonte não dá margem).
- **Orientações ao paciente:** excluídas da fase 1; o resultado dirige-se só ao prescritor (MD-0009).
- **Persistência de dado clínico:** excluída por arquitetura (MD-0003); rotas de API só sem dado clínico (MD-0011, realizado na feature 002).
- **Mescla de fontes clínicas:** proibida — uma fonte por unit (ADR 0011). Nova edição de qualquer guia é gatilho de revisão registrado (MD-0008).
- **Ajuste pós-prandial (insulina):** o guia não parametriza; o motor apenas recomenda a aferição (NG-07).
- **Calibração das PCE ao Brasil:** não há; declarada na `NOTA_PROVENIENCIA` como limitação de transportabilidade, não corrigida no cálculo (RN-09 da 014).

---

## 9. Estado das intenções da extração 1 (reconciliação) 🟢

A extração 1 (§7 antiga) listava intenções aprovadas e ausentes do código, e três lacunas 🔴 de infraestrutura. As re-extrações 2–3 as reconciliam:

| Intenção da extração 1 | Estado em 2026-07-23 |
|---|---|
| Capturar dose de metformina + alertar quando não otimizada | 🟢 **Realizado** (feature 001): campo `doseMetforminaMgDia`, alerta `METFORMINA_NAO_OTIMIZADA` |
| Capturar TFG para ajustar/contraindicar metformina | 🟢 **Realizado** (features 001/005): campo `tfg`, `REDUZIR_/SUSPENDER_METFORMINA_TFG`, precedência validada pelo prescritor em 22/07 |
| `SUSPENDER_SULFONILUREIA` ampliada (uso não informado; esquema já fracionado) | 🟢 **Realizado** (feature 001): gatilhos ampliados na fachada |
| Entrada de glicemias por momento em campos separados | 🟢 **Realizado** (feature 001): `glicemias-por-momento.tsx` |
| API v1 (`/api/v1/status`, observabilidade do deploy) | 🟢 **Realizado** (feature 002): contrato fixo, ADR 0008; o `index.js` vazio não existe mais |
| Infra (`compose.yaml`, configs de teste `test:api`/`test:e2e`) | 🟢 **Realizado** (features 002/003): `infra/database.ts`, `vitest.api.config.ts`, `playwright.config.ts`, Neon em produção |
| Domínio próprio de marca (fora do escopo da feature 002 à época) | 🟢 **Realizado** (feature 012): `apsinteligente.app` no ar (apex → `www` 308); `*.vercel.app` segue válido; contrato do `/api/v1/status` verificado byte a byte no host novo |

🟡 **Premissas de projeto ainda a validar pelo prescritor** (não são bugs; são decisões marcadas 🟡 para confirmação clínica): (a) gestação — cortes de trimestre 13+6/27+6 e limites de plausibilidade DUM ≤ 44 sem, laudo 0–42 sem/0–6 dias; (b) cardiopatia — leitura descritiva do estrato "baixa" (não anginosa E sem fatores) e o cap ×2–×3 da faixa por fatores de risco; (c) **risco cardiovascular** — faixas fisiológicas de clamp (130–320/20–100/90–200), cortes de categoria (5/7,5/20%), adoção dos coeficientes de branco para `raca="outra"`, e a transportabilidade das PCE ao contexto brasileiro (declarada, não corrigida). Correspondem às observações O-07-*, O-10-* e O-14-* dos regression-watch, sem peso de regressão.

---

## 10. Lacunas 🔴

1. Os PDFs/guidelines das quatro fontes (`referencias/…`) estão fora do versionamento (MD-0008); a conferência das constantes depende de o usuário fornecê-los. No risco cardiovascular, os coeficientes das PCE foram validados contra os pacotes R `CVrisk` e `PooledCohort` (concordância cruzada), mitigando parcialmente a lacuna, mas sem conferência página a página do guideline original.
2. Não há logs de produção nem telemetria além do healthcheck (`RelatorDeErros` nulo, ADR 0007): nenhuma evidência de comportamento em uso real.
3. As premissas 🟡 de gestação, cardiopatia e risco cardiovascular (§8) seguem pendentes de validação clínica formal — registradas, não resolvidas.
