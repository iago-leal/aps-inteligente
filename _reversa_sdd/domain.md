# Domínio — aps-inteligente

> Regenerado pelo Reversa Detective em 2026-07-28 (**re-extração nº 4** — absorve as features 015–022 sobre a base 001–014).
> Substitui a versão de 2026-07-23, que cobria quatro domínios clínicos e lia a família `models/*` como homogênea.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA
> Fontes: código em `models/{insulina,gestacao,cardiopatia-isquemica,risco-cardiovascular,puericultura,puericultura/consulta,contribuicao}/`, `interface/`, `pages/`, `infra/` e `scripts/`; `git log` das features 015–022; adendos `_reversa_sdd/addenda/001–022`; microdecisões `MD-0001` a `MD-0033` em `.harness/decisoes/`; princípio **IX** de `.reversa/principles.md` e o guia `docs/redacao.md`; requirements e regression-watch das features em `_reversa_forward/`.

## 1. O sistema em uma frase

🟢 **Plataforma de calculadoras clínicas de apoio à decisão para a Atenção Primária à Saúde**, dirigida ao médico prescritor, 100% client-side no cálculo clínico. Nasceu como calculadora única de insulinização no DM2 (feature 001+) e hoje reúne **seis calculadoras sobre cinco domínios clínicos**, mais **um unit não clínico**, cada domínio clínico com **uma fonte única** e um catálogo próprio de referências. A regra editorial atravessa a plataforma: cada calculadora cobre exatamente o que a sua fonte cobre, nada além (MD-0009).

| Unit | Calculadora | Fonte única | Feature |
|---|---|---|---|
| `models/insulina` | Insulina DM2 (início, titulação, intensificação, antidiabéticos orais) | *Guia Rápido Diabetes Mellitus* — SMS-Rio, 2.ª ed. atualizada, 2023 | 001+ |
| `models/gestacao` | Idade gestacional, DPP, trimestre (DUM × USG) | *Guia Rápido Pré-Natal* — SMS-Rio, 4.ª ed., 2025 (pp. 31–32, 113) | 007 |
| `models/cardiopatia-isquemica` | Dor torácica e probabilidade pré-teste de DAC | *TeleCondutas — Cardiopatia Isquêmica* — TelessaúdeRS-UFRGS, 2017 | 010 |
| `models/risco-cardiovascular` | Risco de ASCVD em 10 anos (Pooled Cohort Equations) | *2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk* (Goff et al., 2014) | 014 |
| 🆕 `models/puericultura` | Escores z de crescimento infantil e classificação nutricional | *Caderneta da Criança* — Ministério da Saúde, 2.ª ed., 2020, pp. 85–97 | 017 |
| 🆕 `models/puericultura/consulta` | Ficha de consulta de puericultura organizada em SOAP | *Caderneta da Criança* — mesma edição, pp. 66–75 | 020 |
| 🆕 `models/contribuicao` | BR Code do PIX estático (**não clínico**, isento por escrito) | Especificação do Banco Central (EMV/QRCPS-MPM) | 019 |

🟢 **A família `models/*` deixou de ser homogênea, e é o achado de domínio desta passagem.** Três leituras que a extração nº 3 fazia como universais passam a ter exceção declarada:

1. **Uma fonte por unit não é uma fachada por unit.** `models/puericultura` tem duas fachadas sobre a mesma caderneta, em seções distintas do impresso. A ADR 0011 fala de fonte e permanece intacta (ADR 0017).
2. **Nem todo unit de `models/` é clínico.** `models/contribuicao` é isento por escrito (`MD-0022`) de fonte clínica única, de `ReferenciaClinica` e do catálogo congelado, e conserva os demais invariantes da família (ADR 0016).
3. **O produto nem sempre é um número.** A consulta em SOAP emite texto de registro, que atravessa para fora da plataforma por colagem no prontuário, com contrato de forma escrito.

## 2. Glossário

### 2.1 Transversal à plataforma

| Termo | Significado |
|---|---|
| **APS** | Atenção Primária à Saúde, contexto assistencial do produto (SUS) |
| **Fonte clínica** | O documento-guia de um domínio; toda saída clínica carrega `ReferenciaClinica` com página/quadro/figura |
| **Uma fonte por unit** | Cada unit clínico tem uma única fonte, sem mescla entre domínios (RN-06 da 007; ADR 0011). Não implica fachada única (ADR 0017) |
| **Unit não clínico** | Módulo de `models/` sem fonte clínica, isento por escrito dos invariantes de fonte e referência (`MD-0022`; ADR 0016) |
| **Domínio puro** | Camada `models/*` sem `import` de React/Next/biblioteca externa e sem leitura de relógio; só TypeScript (ADR 0003) |
| **Erro como valor** | Erro esperado é variante de union discriminada por `tipo`, nunca exceção (ADR 0004) |
| **`ErroDeInvariante`** | Única exceção lançada; sinaliza **bug interno**, leva ao painel honesto na UI |
| **Ofensor** | Violação de validação de entrada; a validação coleta **todos**, nunca para no primeiro |
| **Fora do escopo da fonte** | Saída honesta quando o cenário é plausível mas não coberto pelo guia: recusa em vez de extrapolação |
| **Painel honesto** | Tela de falha inesperada: "não prescreva/decida a partir desta tela" |
| **O motor informa, não escolhe** | Diante de condutas equivalentes, datações divergentes ou ficha sugerida, o motor devolve as opções e o veredito; a decisão é do médico (ADR 0005) |
| **Prescritor (anônimo)** | Único papel do sistema: médico usando a plataforma no navegador; nenhum dado sai do dispositivo |
| **Classe de texto** | Todo literal exibido é **autoral**, **citação** ou **identificador**; a classe é declarada, jamais inferida do diretório (princípio IX; ADR 0019) |
| **Oráculo congelado** | Conjunto de casos extraído da fonte primária por cadeia própria, contra o qual a suíte julga o motor com números que não vieram dele (`MD-0010`) |
| **Camada dev-time** | `scripts/**`: aquisição, verificação, emissão e congelamento; não entra no bundle nem é importada por código de aplicação (ADR 0018) |
| **MD-xxxx / AMB-xx** | Microdecisões e ambiguidades do guia decididas pelo usuário médico (ver §12 e §13) |

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
| **Veredito de comparação** | `dum-confirmada` / `dum-fora-da-margem` / `sem-parametro-na-fonte` (D-04/D-05) |

### 2.4 Cardiopatia isquêmica (dor torácica)

| Termo | Significado |
|---|---|
| **DAC** | Doença arterial coronariana, condição-alvo da estimativa pré-teste |
| **Quadro 1 (3 características)** | Dor retroesternal · provocada por esforço/estresse · alivia com repouso/nitrato |
| **Classificação da dor** | 3 características → **típica**; 2 → **atípica**; ≤ 1 → **não anginosa** (RN-01) |
| **Probabilidade pré-teste** | Lookup na matriz do Quadro 2: `[classificação][sexo][faixa etária]`, 24 células (RN-02) |
| **Faixa etária** | `30-39` / `40-49` / `50-59` / `60-69` (eixo do Quadro 2) |
| **Fatores de risco** | Diabetes · tabagismo · hipertensão · dislipidemia; ≥ 1 ajusta a probabilidade (RN-03) |
| **Estrato** | `baixa` / `intermediaria` / `alta` — decisão descritiva, não puramente numérica (RN-04) |
| **Ergometria × método não invasivo** | Exame padrão é ergometria; `impedimentoErgometria` → método não invasivo alternativo (RN-05) |
| **Angina instável** | `sinaisInstabilidade` → advertência de encaminhamento emergencial, fora do fluxo eletivo (RN-07) |
| **Material complementar** | CCS I–IV, tratamento + Tabela 1, seguimento, manejo agudo: referência consultável **fora do cálculo** (RN-08/RF-10) |

### 2.5 Risco cardiovascular

| Termo | Significado |
|---|---|
| **ASCVD** | Doença cardiovascular aterosclerótica; desfecho "hard" (IAM, morte coronariana, AVC fatal/não fatal) em 10 anos |
| **Pooled Cohort Equations (PCE)** | Modelos de Cox sexo- e raça-específicos (Goff et al., 2013) que estimam o risco de ASCVD em 10 anos |
| **Grupo PCE** | `homem-branco` / `homem-negro` / `mulher-branca` / `mulher-negra`, cada um com seus coeficientes |
| **Coeficiente de PAS** | A pressão sistólica entra por **um** de dois coeficientes mutuamente exclusivos: tratada × não-tratada |
| **Clamp fisiológico** | Valor válido mas fora da faixa (colesterol 130–320, HDL 20–100, PAS 90–200) é cortado ao limite e sinalizado por `Aviso`, sem travar (RN-07) |
| **Categoria de risco** | `baixo` < 5% / `limítrofe` 5–<7,5% / `intermediário` 7,5–<20% / `alto` ≥ 20% (cortes 2019 ACC/AHA) |
| **Nota de proveniência** | Limitação de transportabilidade das PCE ao Brasil: coorte dos EUA, categorias raciais norte-americanas (RN-09) |

### 2.6 🆕 Puericultura — crescimento (`models/puericultura`, feature 017)

| Termo | Significado |
|---|---|
| **Caderneta da Criança** | Fonte editorial única da unit; reproduz as curvas da OMS e do INTERGROWTH-21st (`MD-0001`) |
| **Escore z** | Distância da medida à mediana da população de referência, em desvios-padrão, pelo método **LMS** |
| **LMS** | Trio de parâmetros publicados por sexo, índice e idade: assimetria (`L`), mediana (`M`) e coeficiente de variação (`S`) |
| **Correção de cauda** | Recálculo do escore por extrapolação linear quando `|z| > 3`, no passo `SD3 − SD2` daquele lado (RN-03) |
| **Índice antropométrico** | `peso-idade` · `comprimento-estatura-idade` · `imc-idade` · `perimetro-cefalico-idade` |
| **Idade cronológica** | Dias entre nascimento e medição; governa escopo, posição de medida e a validade da correção |
| **Idade corrigida** | Cronológica menos `40 semanas − IG ao nascer`; indexa a curva da OMS enquanto a correção vale (`MD-0011`) |
| **Idade pós-menstrual** | IG ao nascer mais a idade cronológica; indexa as curvas INTERGROWTH-21st e decide se ainda valem |
| **Régua** | O padrão que produz o escore: INTERGROWTH-21st entre 27 e 64 semanas pós-menstruais, OMS depois. Escolha **por criança**, não por índice (D-01) |
| **Recusa global × parcial** | Global: nenhum índice é calculado. Parcial: só o índice fora de escopo cai, e os demais seguem válidos |
| **Fronteira de tabela × de rótulo** | 1.856 dias na leitura da tabela e 1.826 no conjunto de rótulos; de propósito **não coincidem** |
| **Conversão de posição** | ±0,7 cm entre medir deitado e medir em pé, sempre declarada em aviso (RN-09) |
| **Acervo tabular embarcado** | 12.964 linhas L/M/S em 14 módulos gerados, com `sha256` no manifesto |

### 2.7 🆕 Puericultura — consulta (`models/puericultura/consulta`, feature 020)

| Termo | Significado |
|---|---|
| **Páginas verdes** | pp. 66–75 da caderneta: as dez consultas datadas, da 1.ª Semana ao 36.º Mês |
| **Ficha** | O conjunto de campos que a caderneta imprime para uma consulta datada |
| **SOAP** | Registro orientado por problemas: **S**ubjetivo, **O**bjetivo, **A**valiação, **P**lano |
| **Campo aplicável** | Campo sem `sexos` declarado vale para os dois; a restrição é a exceção, e mora no dado (`MD-0026`) |
| **Flexão por par declarado** | `rotulo` / `rotuloFeminino`, jamais interpolação, para que o literal exista inteiro no inventário |
| **Registro derivado** | O texto não é submetido: um `useMemo` produz a cadeia que a tela exibe e o comando de cópia entrega |
| **Nota declarada** | Constante própria que diz ao leitor o que o produto fez e a fonte não: organização em SOAP, fichas ausentes, campo suprimido, nada é salvo |

### 2.8 🆕 Contribuição (`models/contribuicao`, feature 019) — não clínico

| Termo | Significado |
|---|---|
| **PIX estático** | Chave publicada uma vez, sem transação e sem que a plataforma saiba de contribuição alguma |
| **BR Code** | Cadeia EMV/QRCPS-MPM que o aplicativo do banco lê, montada no próprio navegador |
| **TLV** | A codificação de cada campo: identificador, comprimento e valor concatenados |
| **CRC16-CCITT/FALSE** | Verificação que fecha a cadeia e permite ao aplicativo recusar código corrompido |
| **Isenção declarada** | A unit não tem fonte clínica, não emite `ReferenciaClinica` e não entra no catálogo congelado (`MD-0022`) |

---

## 3. Regras de domínio — Insulina (`models/insulina`) 🟢

Reconfirmadas por leitura nesta passagem; nenhuma linha executável mudou entre as features 015 e 022. Cada regra cita página/figura do guia em `fonte-clinica.ts`.

### 3.1 Início de insulinização (`regra-inicio.ts`)
1. Saída é **faixa, nunca dose única** (AMB-01): 10–15 UI/dia **e** `round(0,1×kg)`–`round(0,2×kg)`; sugestão fixa de NPH ao deitar. O médico fixa o número.
2. Alerta `INDICACAO_INSULINA` quando HbA1c ≥ 10% (AMB-08, leitura conservadora "≥") **ou** jejum ≥ 300 mg/dL.
3. Recomendações fixas: manter metformina; manter sulfonilureia salvo `usoSulfonilureia === false`; aferir jejum 3×/semana por 15 dias.

### 3.2 Titulação basal (`regra-titulacao-basal.ts`)
4. Jejum agrega por **média**, mas **hipoglicemia prevalece**: qualquer ≤ 70 → −4 UI + alerta, independentemente da média (AMB-06).
5. Tabela sobre o jejum agregado: ≤ 70 → −4; ≥ 180 → +4 (AMB-09); ≥ 130 e < 180 → +2; 71–129 → na meta, delta 0 (AMB-02/05).
6. O ajuste incide na **NPH mais noturna**; esquema sem NPH: o jejum não titula nada.
7. Toda dose **clampada em 1–60 UI** (caneta SUS); quando o clamp atua, alerta `TETO_POR_APLICACAO`.
8. **Fracionamento** quando NPH única > 30 UI ou > 0,4 UI/kg/dia: principal ½ café (`ceil`) + ½ ao deitar; alternativa ⅔ café (`round`) + ⅓ ao deitar (AMB-10, o motor não escolhe). Ao fracionar com sulfonilureia em uso explícito: recomendar suspendê-la; sempre manter metformina.

### 3.3 Intensificação (`regra-intensificacao.ts`)
9. **Gate de HbA1c** (R-13/R-18): ≤ 7% sem Regular → manter, repetir HbA1c em 6 meses; ≤ 7% com Regular → ajustar e avaliar encaminhamento ao endócrino; > 7% → pode iniciar Regular, mas sem pré-prandiais → recomendar aferir AA/AJ/AD e parar; HbA1c ausente → só prossegue se já intensificado **e** com pré-prandiais (correção do BUG-20260719-RHZ5).
10. Mapeamento **deslocado** aferição→aplicação (R-14..R-17): AA → Regular antes do **café**; AJ → antes do **almoço**; AD → antes do **jantar**.
11. Por braço: hipo ≤ 70 → alerta + Regular −2 se existir; média < 130 → manter; ≥ 130 com Regular → +2; sem Regular e gate aberto → iniciar Regular 4 UI.
12. **Caso especial AJ** (AMB-03): com NPH no café, o guia oferece duas condutas equivalentes; o motor devolve ambas como `condutasAlternativas`.
13. Titulação da Regular **espelha** a lógica do jejum (AMB-07), citada como inferência espelhada na referência.
14. **NG-07**: intensificado, HbA1c acima da meta e nada ajustado → recomendar aferição pós-prandial, explicitando que o guia não parametriza esse ajuste.

### 3.4 Antidiabéticos orais — metformina × TFG (`regra-metformina.ts`, feature 005) 🟢
15. **Precedência por TFG:** `SUSPENDER_METFORMINA_TFG` quando TFG < 30; `REDUZIR_METFORMINA_TFG` quando 30 ≤ TFG ≤ 45; o alerta `METFORMINA_NAO_OTIMIZADA` é **suprimido** em faixa de ajuste renal, porque "otimizar" contradiria a conduta renal do guia. A fachada remove `MANTER_METFORMINA` quando há suspensão. Precedência **validada pelo prescritor em 22/07**.

### 3.5 Regras transversais da insulina
16. Validação coleta **todos** os ofensores: peso 0 < p ≤ 350; glicemias 10–1000; HbA1c 3–20% se presente; titulação exige esquema não vazio, doses 1–60, ≥ 1 glicemia; **EC-10**: pré-prandiais + esquema sem Regular exigem HbA1c. O motor revalida tudo (EC-08).
17. Insulina fora de NPH/Regular → `ForaDoEscopoDaFonte`, nunca cálculo parcial.
18. Dose > 1,0 UI/kg/dia → alerta `DOSE_ACIMA_FAIXA_PLENA` + compartilhar cuidado com especialista (AMB-04).
19. Houve ajuste → reavaliar em 3 dias (cadência da Figura 4).
20. Alertas ordenados por severidade fixa; recomendações deduplicadas por `tipo`, referências por `localizacao`.

---

## 4. Regras de domínio — Gestação (`models/gestacao`, feature 007) 🟢

Reconfirmadas. Único arquivo aberto na janela 015–022 foi `datas.ts`, e só para declarar em comentário o gêmeo de puericultura; nenhuma linha executável mudou.

21. **IG (RN-01, p. 31):** entre DUM (ou DUM equivalente) e a data de referência, `⌊dias/7⌋` semanas + `dias % 7` dias.
22. **DPP (RN-02, p. 32, Naegele, D-03):** `somarMeses(somarDias(DUM, +7), +9)`, calendárica; dia excedente transborda ao mês seguinte, sem normalização silenciosa.
23. **DUM equivalente do USG (RN-03):** `dataExame − (semanas×7 + dias)`.
24. **Trimestre (RN-04) — premissa 🟡:** cortes convencionais 13+6/27+6. O guia usa os trimestres sem defini-los numericamente.
25. **Comparação DUM × USG (RN-11, D-04/D-05):** compara pela **margem do trimestre no dia do exame**, 7 d no 1.º e 14 d no 2.º; **o 3.º não tem parâmetro na fonte** → `sem-parametro-na-fonte`. Diferença acima da margem → `dum-fora-da-margem`; senão → `dum-confirmada`. **O motor informa o veredito, não escolhe a datação** (ADR 0005).
26. **Data de referência como entrada (RN-07):** injetada pela UI; o motor não lê o relógio.
27. **Aritmética em dias epoch UTC (D-02, ADR 0013):** `paraDiasEpoch` rejeita calendário impossível devolvendo `null`, nunca normalizando.
28. **Validação, coleta total:** DUM futura, DUM > 44 semanas 🟡, exame futuro, laudo fora de 0–42 sem / 0–6 dias 🟡, USG parcial, nenhuma datação informada (RN-05).

---

## 5. Regras de domínio — Cardiopatia isquêmica (`models/cardiopatia-isquemica`, feature 010) 🟢

Reconfirmadas, intocadas nesta janela.

29. **Classificação (RN-01, Quadro 1):** contagem booleana das 3 características → `tipica` (3) / `atipica` (2) / `nao-anginosa` (≤ 1).
30. **Probabilidade-base (RN-02, Quadro 2):** lookup na matriz **congelada** de 24 células, transcrição fiel de DUNCAN et al., 2013.
31. **Ajuste por fatores de risco (RN-03, D-03):** sem fator → sem ajuste; com ≥ 1 fator → faixa `base×2`–`base×3`, capada em **99%**; `excedeAlta` sinaliza extremo acima de 90%.
32. **Estrato (RN-04) — leitura descritiva 🟡:** `"baixa"` ⟺ dor **não anginosa E sem fatores de risco**; `"alta"` ⟺ probabilidade efetiva acima de 90%; o resto é `"intermediaria"`. **Qualquer fator de risco impede o estrato "baixa".**
33. **Conduta (RN-04/RN-05):** `baixa` → exame não indicado + causas não cardíacas; `intermediaria` → exame não invasivo; `alta` → estratificação + encaminhamento. Exame padrão **ergometria**, salvo `impedimentoErgometria`.
34. **Fora de escopo (RN-06):** idade plausível mas fora de **30–69** → `ForaDoEscopoDaFonte`, **sem número estimado**.
35. **Advertência (RN-07):** `sinaisInstabilidade` → `Advertencia` de angina instável, em destaque fora do fluxo eletivo.
36. **Material complementar (RN-08/RF-10):** referência textual consultável em `<details>`, fora do núcleo calculado.

---

## 6. Regras de domínio — Risco cardiovascular (`models/risco-cardiovascular`, feature 014) 🟢

Reconfirmadas, intocadas nesta janela.

37. **Equação PCE (RF-06/RN-03):** `Risco₁₀ = 1 − S₀^exp(Σ(β·X) − mean_grupo)`, com idade, colesterol total, HDL e PAS em logaritmo natural e termos de interação `ln(idade)×X`. Coeficientes, `BASELINE_SURVIVAL` e `MEANS` congelados, validados contra os pacotes R `CVrisk` e `PooledCohort`.
38. **Seleção de grupo (RN-05, D-05) — premissa 🟡:** `raca="outra"` adota os coeficientes de branco, como o ASCVD Risk Estimator Plus oficial.
39. **Dois níveis de entrada (D-07):** ofensor **trava**; valor fora da faixa fisiológica **não trava**, é clampado e sinalizado por `Aviso` com a direção do viés. Faixas 🟡.
40. **Fora de escopo (RF-05/RN-02, D-06):** DCV prévia ou idade fora de **40–79** → `ForaDoEscopoDaFonte` com motivo distinto, **sem número**.
41. **Categoria (RF-07) — premissa 🟡:** cortes do 2019 ACC/AHA Primary Prevention.
42. **Proveniência (RF-10/RN-09, D-09):** `NOTA_PROVENIENCIA` congelada no domínio; o `ContextoDaFonte` explica por que PCE e não a AHA PREVENT, com link `<a>` nativo, sem requisição de rede.

---

## 7. 🆕 Regras de domínio — Puericultura, crescimento (`models/puericultura`, feature 017) 🟢

Quinto domínio clínico, e o mais ramificado da plataforma. A cascata é `validar → idades → elegibilidade → régua → escore → classificação`. Dezoito regras da fonte, aqui numeradas em sequência com as anteriores.

### 7.1 O escore

43. **Escore z por LMS (RN-02):** `z = ((X/M)^L − 1)/(L·S)` quando `L ≠ 0`, e `z = ln(X/M)/S` quando `L = 0`. Os parâmetros vêm das tabelas publicadas, por sexo, índice e idade.
44. **Correção de cauda (RN-03):** quando `|z| > 3`, o escore é recalculado por extrapolação linear a partir do último ponto confiável, no passo `SD3 − SD2` daquele lado. Aplica-se **só aos dois indicadores baseados em peso** (`peso-idade`, `imc-idade`), e a lista de índices corrigíveis é **dado, não `if`**, para que a pergunta tenha um lugar só. Omitir a correção desloca o escore em até 10,4 unidades de IMC.
   - 🟡 **O dado real é silencioso sobre a outra metade** (D-10.1): em comprimento/estatura e perímetro cefálico, `L = 1` nas 14 tabelas, e com `L = 1` a LMS já é linear. A prova de que a cauda **não** se aplica a esses dois vive em acervo sintético com `L ≠ 1`.
45. **Sem interpolação (D-06):** até 5 anos lê-se o **dia** inteiro; de 5 a 10, o **mês completo** `⌊dias/30,4375⌋`. Nenhum valor usado no cálculo é estimado, e a divergência assumida contra o software oficial da OMS vai declarada na nota de proveniência.
46. **A leitura informa a ausência de linha, e não recusa clinicamente** (`MD-0009` da série da feature): faltando linha para a idade, a leitura devolve ausência; quem tem a fonte na mão decide o que fazer com ela.

### 7.2 As três idades e a régua

47. **Três idades, três papéis** (`MD-0011`), a distinção que atravessa o domínio:
   - a **cronológica** governa o escopo da fonte, a posição de medida e até quando a correção vale;
   - a **corrigida** indexa a curva da OMS enquanto a correção vale;
   - a **pós-menstrual** indexa as curvas INTERGROWTH-21st e decide se elas ainda valem.
48. **Correção de prematuridade (RN-15/RN-16, p. 86):** desconto de `40 semanas − IG ao nascer`, ativo até **1.095 dias** quando a IG ao nascer for menor que 28 semanas, e até **730** nos demais casos; a partir de 37 semanas ao nascer a criança é a termo e nenhuma correção se aplica. **IG ausente não é pré-termo**: a criança é tratada como termo e a premissa sai **declarada** no resultado, nunca silenciada.
49. **Escolha da régua (`padrao.ts`, D-01, RN-17/RN-18, p. 87):** entre **27 e 64 semanas pós-menstruais** vale o INTERGROWTH-21st; passadas as 64, a OMS sobre idade corrigida. A escolha é **por criança, não por índice**: uma criança não pode ter o peso lido numa régua e o comprimento noutra.

### 7.3 As fronteiras

50. **Duas espécies de recusa**, novidade que esta unit acrescenta ao molde do risco cardiovascular:
   - **global** (idade cronológica acima de 3.682 dias, ou pós-menstrual abaixo de 27 semanas): nenhum índice é calculado;
   - **parcial** (perímetro cefálico acima de 730 dias): só aquele índice sai de escopo, e os demais seguem válidos. A recusa parcial devolve a variante de **índice**, e é isso que a mantém incapaz de derrubar o resultado.
51. **Duas fronteiras dos 5 anos que de propósito não coincidem:** a de **tabela** aos 1.856 dias (`oms/leitura.ts`) e a de **rótulo** aos 1.826 (`classificacao.ts`, `FRONTEIRAS.cincoAnosEmDias`). Entre elas vale a tabela de 0–5 anos com os rótulos de 5–10. Alinhá-las produziria ora rótulo trocado, ora buraco de cobertura de 30 dias.
52. **A fronteira dos 2 anos (730 dias, D-16)** governa três coisas ao mesmo tempo: a posição de medida, o escopo do perímetro cefálico e o substantivo do índice de comprimento.

### 7.4 A classificação

53. **Rótulo literal por índice e faixa etária (RN-04 a RN-07, pp. 88–97):** cinco conjuntos de cortes congelados, modelados como dado (`acimaDe`, `aPartirDe`, `abaixoDeTudo`) e não como cadeia de `if`, porque `> +2` e `≥ −2` são coisas diferentes e é aí que a transcrição de faixas costuma errar.
54. **O IMC troca de nomenclatura aos 5 anos:** os três rótulos superiores **deslizam um degrau**, de modo que o mesmo z = +2,5 é "Sobrepeso" aos 4 anos e "Obesidade" aos 6. É a armadilha central da fonte.
55. **O comprimento troca de substantivo aos 2 anos** ("Comprimento" → "Estatura"), na mesma fronteira em que troca a posição de medida. Achado da transcrição, que o plano não previa.
56. **Sem categoria superior no comprimento/estatura:** a caderneta não classifica estatura acima de +2, e inventar rótulo para ela seria inventar fonte.
57. **Transcrição fiel, com exceção declarada (`MD-0015`, princípio IX):** dois desvios de **concordância** da fonte impressa são exibidos corrigidos, e o afastamento é declarado ao leitor em `NOTA_CORRECAO_DE_CONCORDANCIA`, que nomeia as formas impressas. A lista é fechada: a elipse do artigo em "para idade" e os demais vinte e três rótulos permanecem byte a byte.
58. **O rótulo clínico é do domínio; a tela nomeia o índice pela forma neutra** (`MD-0012`), para que a interface não reimplemente a fronteira dos dois anos.

### 7.5 A medida e a validação

59. **Conversão de posição (RN-09, p. 85):** ±0,7 cm entre deitado e em pé, **declarada e nunca silenciosa**, e o aviso acompanha os **dois** índices que consomem a medida convertida, estatura e IMC; pendurá-lo só no primeiro esconderia que o IMC também mudou. O IMC se calcula sobre a medida **já convertida**.
60. **Validação, coleta total (RN-11), com dez códigos de ofensor.** As faixas de plausibilidade são 🟡 de bom senso clínico e não da fonte, porque a caderneta não publica limites de digitação: peso 0–150 kg, comprimento 20–200 cm, perímetro cefálico 20–70 cm, IG ao nascer 22–42 semanas e 0–6 dias. Existem para barrar erro grosseiro, não para julgar o caso extremo.

---

## 8. 🆕 Regras de domínio — Puericultura, consulta em SOAP (`models/puericultura/consulta`, feature 020) 🟢

Segunda fachada sobre a mesma caderneta, em outra seção do impresso (pp. 66–75). O produto aqui não é número, e sim texto de registro.

61. **A ficha é sugerida pela idade CRONOLÓGICA**, inclusive no pré-termo, porque é ela que rege o calendário de acompanhamento e o vacinal. Não contradiz a regra 47: escolher a ficha não é medir o corpo nem ler a curva. A espécie de idade volta **declarada** no resultado.
   - 🟡 Idade entre duas consultas previstas cai na ficha imediatamente **anterior**, premissa registrada porque a fonte não diz o que fazer com a criança de sete meses. O custo de errar é um clique: **a troca é livre** (o motor informa, não escolhe).
   - Faixa não coberta por ficha alguma é **bug interno** e lança `ErroDeInvariante`, porque o índice cobre de zero ao infinito por construção.
62. **A aplicabilidade por sexo mora no dado (`MD-0026`), não em condicional de tela.** Campo sem `sexos` declarado vale para os dois: a restrição é a exceção, e por isso é ela que se escreve. Hoje a lista tem **um item só**, "Criptorquidia", que a caderneta imprime nas duas tiragens e o produto exibe apenas na ficha masculina, com a supressão declarada em `NOTA_SUPRESSAO_DE_CAMPO`.
63. **A flexão vem do par de rótulos declarado** (`rotulo` / `rotuloFeminino`), jamais de interpolação, para que o literal exista inteiro no inventário textual. Citação que o guarda não enxerga é pior que citação nenhuma, porque parece protegida.
64. **RN-10, a regra que governa a montagem:** campo sem resposta não aparece, e **seção que fique sem item some inteira, cabeçalho incluído**. Cabeçalho solto afirmaria averiguação que não houve, o que é pior que a omissão: é a diferença entre não ter olhado e ter registrado que olhou.
65. **Onde cada coisa entra no SOAP (RN-09b):** os escores ocupam a **objetiva**, que é onde a medida mora; a classificação nutricional ocupa a **avaliação**, porque é juízo da própria fonte e não conclusão que o produto tenha formado. O estado nutricional sai do IMC/I e, na falta dele, do peso/I, com o índice que produziu o juízo dito no próprio valor.
   - 🟡 O critério que reparte os "sinais de alerta" entre S e O é decisão do produto (`MD-0028`): vai para **O** o campo cuja constatação exige exame ou medição pelo profissional, e para **S** o que a mãe ou o cuidador refere.
66. **O motor não recalcula escore algum (RN-11).** O `ResultadoAvaliacao` chega pronto da fachada da 017 e é **transposto** com a referência que aquele motor já carimbou. Recalcular criaria segunda fonte de escore z dentro da mesma unit.
67. **O domínio devolve estrutura, nunca texto pronto (D-03).** A projeção em cadeia é da interface, e é uma função com **dois consumidores**, o `<pre>` que exibe e o comando que copia. A identidade entre o que se vê e o que se copia é estrutural, e não uma promessa a conferir.
68. **A ordem das seções é fixa** (`S`, `O`, `A`, `P`), e nenhum campo aparece em duas.
69. **Quatro notas declaradas**, cada uma constante própria, porque o que o produto fez e a fonte não fez precisa estar dito: a **organização em SOAP** é editorial e não da caderneta; **três registros das mesmas páginas ficaram fora** desta entrega (Pré-Natal/Parto/Nascimento, Triagens Neonatais e Outras Medidas, esta com a tabela de pressão arterial); o **campo suprimido** por sexo; e que **nada é salvo**.
70. **O nome neutro de cada índice é declarado no próprio submódulo**, e não reusado da tela da 017, porque `models/` não importa `interface/`. A direção das dependências é o que mantém o domínio puro (ADR 0003), e furá-la por economia de quatro linhas sairia caro no lugar errado.

---

## 9. 🆕 Regras de domínio — Contribuição (`models/contribuicao`, feature 019) 🟢 — não clínico

Primeiro unit sem fonte clínica, isento por escrito (`MD-0022`, ADR 0016) dos invariantes de fonte, referência e catálogo congelado, e sujeito a todos os demais.

71. **BR Code do PIX estático:** campos EMV em TLV, montados na ordem do padrão, com `br.gov.bcb.pix` como GUI, categoria de estabelecimento `0000` ("não especificado", porque a contribuição não é venda de categoria alguma), moeda `986`, país `BR` e `***` como identificação de transação ausente.
72. **A verificação se calcula sobre a cadeia que já contém `6304`**, e só os quatro dígitos do valor ficam de fora. Calcular sem esse sufixo produz código que nenhum aplicativo aceita.
73. **CRC16-CCITT/FALSE** em arquivo próprio: polinômio `0x1021`, inicial `0xFFFF`, sem reflexão nem xor final, saída em quatro dígitos hexadecimais maiúsculos. É a parte mais fácil de errar e a mais fácil de provar isolada, porque meia dúzia de variantes compartilha o polinômio e todas produzem quatro dígitos plausíveis; o vetor conhecido (`"123456789"` → `29B1`) é o que distingue esta das outras.
74. **Recusa em vez de truncamento:** nome acima de 25 caracteres ou cidade acima de 15 fazem o painel exibir erro, e não um beneficiário errado na câmera. Os limites são medidos sobre o texto **já normalizado** para ASCII.
75. **Erro é valor e a coleta é total:** a fachada nunca lança, e o ramo de erro traz todos os ofensores de uma vez.
76. **Contrato externo emitido sem canal de erro:** o BR Code é lido por software de terceiros sob especificação do Banco Central, e payload malformado falha na mão de quem contribui, sem retorno para a plataforma. Daí a verificação em duas pontas, uma automatizada contra decodificador independente e outra humana com o consumidor real (`MD-0025`).

---

## 10. Invariantes transversais 🟢

O que torna as units reconhecíveis como uma família, agora com o **alcance de cada invariante explicitado** — porque a família deixou de ser homogênea e ausência não declarada se lê como esquecimento.

| # | Invariante | Alcance |
|---|---|---|
| 1 | **Domínio puro**: sem `import` de framework, sem leitura de relógio (ADR 0003) | Os 7 units; desde a 017 **verificado por teste** em `models/puericultura/**` |
| 2 | **Erro esperado é valor**; `ErroDeInvariante` só para bug (ADR 0004) | Os 7 units |
| 3 | **Toda saída carrega `ReferenciaClinica`** | Só os 6 units clínicos (`MD-0022` isenta a contribuição) |
| 4 | **Coleta total de ofensores** na validação | Os 7 units |
| 5 | **Constantes clínicas congeladas** em `fonte-clinica.ts`, comentadas com o RN/quadro de origem | Só os 6 units clínicos |
| 6 | **O motor informa, não escolhe** (ADR 0005) | Os 7 units; na consulta, a ficha sugerida é trocável |
| 7 | **Uma fonte por unit** (ADR 0011) | Os 6 units clínicos, e **não** uma fachada por unit (ADR 0017) |
| 8 | **Privacidade por construção** (ADR 0002) | Toda a plataforma, domínio e telas |

🟢 **Sobre o invariante 8:** nenhum domínio nem tela faz `fetch` ou `storage` de dado clínico. O único `localStorage` é a preferência de tema (`aps-inteligente:tema`). O único acesso a rede é o healthcheck `GET /api/v1/status`, que **desde a feature 022 é acesso real e não hipotético**, e que não recebe nem devolve dado clínico; a denylist do teste de contrato foi estendida a host, URL de conexão e trecho de SQL, aferida sobre o corpo serializado nos **dois** estados do banco. O painel de contribuição não faz requisição externa, não cria durável novo e não sabe se alguém contribuiu. `EventoDeErro` transporta só o nome da classe do erro.

### 10.1 Regras da interface com força de domínio

9. **Invalidação por edição:** qualquer edição de formulário marca o resultado como `desatualizado`. Vale nas cinco telas de cálculo; na insulina, desfaz também o ritual de revisão. **A ficha de consulta é a exceção declarada** (regra 12 abaixo).
10. **A UI espelha as faixas do domínio** importando as constantes; não há segunda fonte de números em nenhuma tela.
11. **Ritual de revisão só na insulina** (ADR 0012, D-08): datar, estratificar, estimar risco, avaliar crescimento e preencher ficha não prescrevem dose.
12. **A ficha de consulta não invalida por edição**, porque ali a edição **é** o preenchimento, e um aviso de "desatualizado" acusaria como defeito o comportamento normal da tela. Em lugar da invalidação vale a derivação: o registro é recalculado a cada tecla e sai do mesmo cálculo para a tela e para a área de transferência.
13. **O escore é formatado, jamais recalculado na tela** (D-13 da 017): uma casa decimal, sinal sempre explícito.

### 10.2 Regras da interface com força de navegação e enquadramento

14. **Comando de início só nas calculadoras, nunca na home**, e o mecanismo é a prop dedicada **`comInicio`** (default `false`). A prop `logoComoTitulo`, que governava duas preocupações ortogonais na feature 009, **foi removida na feature 016**: a logo é **sempre** marca decorativa (`aria-hidden`, `alt=""`) acima de um `h1` **sempre textual**, em toda tela. *Esta regra encerra a dívida **L-07**, que a extração nº 3 carregava.*
15. **O alternador de tema exibe o tema-ALVO** (011): `SunIcon` quando o vigente é escuro, `MoonIcon` quando é claro. A preferência e sua semântica (`data-tema`) são as da feature 004.
16. **A `Moldura` é dona do enquadramento horizontal de toda tela** (feature 021, `MD-0029`): a coluna do corpo mora no `<main>`, governada pelo `data-apresentacao` que o componente já emitia, com 1.180px na variante `padrao` e 720px na `destaque`, e recuo de 32px que cai para 16px nos respectivos pontos de quebra. Não é preferência estética: é a referência contra a qual o cabeçalho foi calibrado na feature 013, e tela cujo corpo saia dela desalinha o próprio cabeçalho. O corolário é obrigação, e vale para toda tela nova: **quem declarava a coluna deixa de declará-la**, sob pena de coluna aninhada. Sobe para a `Moldura` só o eixo horizontal; o vertical permanece na folha de cada tela, porque varia com legitimidade.
17. **O cabeçalho tem altura igual em todas as rotas por construção** (016), sem `min-height` nem px chumbado, e alinha os controles ao topo por regra única (015).
18. **O comando de apoio fica fora do fluxo de decisão clínica** (019, `MD-0022`): nenhuma calculadora exibe pedido de contribuição ao lado de conduta recomendada, e o bloco vive **fora** do `map` do `CATALOGO`, porque um item que não calcula nada dentro dele corromperia os dois papéis do catálogo.

### 10.3 🆕 A norma de redação (princípio IX, feature 018)

19. **Todo literal exibido pertence a exatamente uma de três classes** — autoral, citação ou identificador —, e a classe é **declarada** em `scripts/textos/classes/`, jamais inferida do diretório onde o literal mora. Literal novo sem entrada **faz o gerador do inventário parar**, nomeando arquivo e linha.
20. **A revisão de estilo alcança só a classe autoral.** A citação permanece byte a byte, com a exceção estrita da regra 57: só desvio de concordância, sobre lista fechada, e inseparável da declaração ao leitor.
21. **O eixo expressivo fica fora da prosa autoral** (`MD-0020`): nenhum travessão, nenhuma reticência, nenhuma exclamação, em régua única para tela, metadado, manifesto e `README.md`. A razão é de eixo e não de dose, porque uma ferramenta que informa dose, escore e probabilidade não tem subjetividade a marcar. **A exceção única é o nome pelo qual a fonte se publica**, e ele chega à tela pelo domínio, por `NOME_PUBLICADO` em cada `fonte-clinica.ts` (`MD-0021`). O verificador confere contra o domínio e não contra lista escrita no teste, e foi essa escolha que expôs o drift de três nomes no `README.md`.
22. **A descrição da plataforma é verificada contra o `CATALOGO`**, e não mantida à mão. O catálogo, que já era fonte única da home, acumulou o papel de **oráculo da descrição**, o que corrigiu um defeito real de exatidão.

---

## 11. Fronteiras de escopo (o que o sistema recusa por design) 🟢

- **Insulinas fora de NPH/Regular** → `ForaDoEscopoDaFonte` (MD-0009).
- **Idade fora de 30–69** na cardiopatia → recusa sem extrapolar (RN-06).
- **Idade fora de 40–79 ou DCV prévia** no risco cardiovascular → recusa sem estimar (RN-02 da 014).
- **3.º trimestre na comparação DUM×USG** → `sem-parametro-na-fonte`.
- 🆕 **Puericultura, recusa global:** idade cronológica acima de 3.682 dias, ou pós-menstrual abaixo de 27 semanas.
- 🆕 **Puericultura, recusa parcial:** perímetro cefálico acima de 730 dias sai de escopo **sem derrubar** os demais índices. É a segunda espécie de recusa que a plataforma passou a ter.
- 🆕 **Puericultura, o que não se estima:** nenhum valor do cálculo é interpolado, e a divergência contra o software oficial da OMS vai declarada.
- 🆕 **Consulta, cobertura parcial declarada:** três registros das páginas verdes ficaram fora, e a nota diz quais, porque quem confere a tela contra a caderneta precisa saber que ela não cobre as páginas inteiras.
- 🆕 **Contribuição estática:** sem transação, sem confirmação e sem saber quem contribuiu. Não é limitação a contornar, e sim propriedade do arranjo escolhido, coerente com a telemetria nula da ADR 0007.
- **Orientações ao paciente:** excluídas da fase 1; o resultado dirige-se ao prescritor (MD-0009).
- **Persistência de dado clínico:** excluída por arquitetura (MD-0003); a rota de API não recebe nem devolve dado clínico (MD-0011), e a consulta que ela faz ao banco é `SELECT $1::int AS ok`.
- **Mescla de fontes clínicas:** proibida, uma fonte por unit (ADR 0011). Nova edição de qualquer guia é gatilho de revisão registrado (MD-0008).
- **Ajuste pós-prandial (insulina):** o guia não parametriza; o motor apenas recomenda a aferição (NG-07).
- **Calibração das PCE ao Brasil:** não há; declarada como limitação de transportabilidade, não corrigida no cálculo (RN-09 da 014).

---

## 12. Estado das intenções e das dívidas (reconciliação) 🟢

| Item | Estado em 2026-07-28 |
|---|---|
| Intenções da extração 1 (metformina, TFG, sulfonilureia, glicemias por momento, API v1, infra, domínio próprio) | 🟢 Todas **realizadas** entre as features 001 e 012, conforme a re-extração nº 3 registrou |
| **L-07** — `domain.md` §7.2 citava `logoComoTitulo`, prop removida na feature 016 | 🟢 **Encerrada nesta passagem**: a regra 14 da §10.2 descreve `comInicio` |
| **L-11** — cifra de testes defasada | 🟢 **Encerrada nesta passagem**, com número **aferido** e não transcrito (`MD-0033`): 67 arquivos e 816 testes em 28/07 |
| Rota `/api/v1/status` descrita como sem I/O | 🟢 **Corrigida**: o invariante 8 e a §10 descrevem a chamada real; ADR 0020 registra por que ela responde 200 com o banco caído |
| Dívida de `globais.css` no teto de 400 linhas | 🟢 Folgou mais: 367 linhas, e a regra nova da 021 nasceu em folha própria para não a reabrir |
| Verificação da fronteira de camadas por teste | 🟡 **Parcial**: `models/puericultura/**` tem guarda executável; os outros cinco units seguem confiados à disciplina |
| Acoplamento `interface/comum → interface/calculadora` (`preferencia-de-tema.ts`) | 🟡 Aberto, sem movimento há oito features |
| `scripts/textos/classes/interface.mts` em 684 linhas | 🟡 Acima do teto, sem exceção nominal que o alcance; a saída natural é parti-lo por camada de tela |
| Isenção nominal do verificador de citação (`MD-0027`) | 🟡 Tomada na execução e **declaradamente aberta a revisão** enquanto a lista tiver uma entrada só |

🟡 **Premissas de projeto a validar pelo prescritor** (não são bugs; são decisões marcadas para confirmação clínica). Às treze herdadas de gestação, cardiopatia e risco cardiovascular, esta janela acrescenta: os **1.095 dias** do limite estendido de correção; a **idade cronológica governando a posição de medida**; a **exibição em uma casa decimal**; as **faixas de plausibilidade** de peso, comprimento, perímetro e IG ao nascer; a **ficha imediatamente anterior** para idade entre duas consultas; e o **critério que reparte os sinais de alerta entre S e O** (`MD-0028`). Correspondem às observações O-07-*, O-10-*, O-14-*, O-17-* e O-20-* dos regression-watch, sem peso de regressão.

---

## 13. Lacunas 🔴

1. Os PDFs e guidelines das fontes clínicas estão fora do versionamento (MD-0008); a conferência das constantes depende de o usuário fornecê-los. A lacuna está **mitigada em dois domínios**: no risco cardiovascular, por concordância cruzada com os pacotes R; na puericultura, por `sha256` no manifesto das 14 tabelas e por oráculo congelado no git (356 casos da OMS e 1.596 células do INTERGROWTH-21st). Permanece sem conferência página a página nos demais.
2. Não há logs de produção nem telemetria além do healthcheck (ADR 0007). O que a plataforma passou a saber de si é o estado do próprio deploy e do banco, e nada sobre uso.
3. As premissas 🟡 dos cinco domínios clínicos seguem pendentes de validação clínica formal: registradas, não resolvidas.
4. **`ehEstouroDeTempo` reconhece o estouro por uma frase que o driver `pg` emite**, e precisa reconhecê-la antes do erro de conexão, que casaria com o prefixo comum. Atualização do driver é gatilho de revisão (watch W007 da feature 022). É o acoplamento mais frágil da plataforma.
5. **O inventário textual não alcança literal montado por interpolação em tempo de execução** (recusas de `elegibilidade.ts`, aviso de `medidas.ts`): limitação declarada do extrator, e o congelamento não a cobre.
6. **O BR Code e o registro em SOAP são contratos que a plataforma emite para consumo de terceiros**, e nenhum artefato da extração lhes dava lugar até aqui. Os contratos de forma vivem em `_reversa_forward/019-*/interfaces/br-code.md` e `_reversa_forward/020-*/interfaces/registro-soap.md`; a re-extração nº 4 os registra aqui e no `architecture.md`, e a estabilidade de ambos é promessa a quem os consome.
