# Domínio — aps-inteligente

> Gerado pelo Reversa Detective em 2026-07-19.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA
> Fontes: código em `models/insulina/` e `interface/calculadora/`; histórico git atual; histórico pré-refundação recuperado do bundle `~/dev/aps-inteligente-backup.bundle` (microdecisões MD-0001..0011, requirements da feature 001 com as decisões AMB-01..10).

## 1. O sistema em uma frase

🟢 Calculadora de apoio à decisão para **insulinização no DM2 na APS**, dirigida ao médico prescritor, 100% client-side, cuja única fonte clínica é o *Guia Rápido Diabetes Mellitus — SMS-Rio, 2.ª ed. atualizada, 2023* (MD-0008): a calculadora cobre exatamente o que o guia cobre, nada além (MD-0009).

## 2. Glossário

| Termo | Significado |
|---|---|
| **DM2** | Diabetes mellitus tipo 2, condição-alvo da calculadora |
| **APS** | Atenção Primária à Saúde, contexto assistencial do produto (SUS) |
| **NPH** | Insulina humana de ação intermediária; a insulina **basal** do guia |
| **Regular** | Insulina humana de ação rápida; a insulina **prandial** do guia |
| **Início (modo)** | Primeira prescrição de insulina para paciente virgem de insulinização |
| **Titulação (modo)** | Ajuste de esquema existente a partir de glicemias aferidas |
| **Titulação basal** | Ajuste da NPH pela glicemia de **jejum** (+4 / +2 / 0 / −4 UI) |
| **Fracionamento** | Divisão da NPH única em duas aplicações quando a dose cresce (> 30 UI ou > 0,4 UI/kg/dia) |
| **Intensificação** | Introdução/ajuste da Regular guiada pelas glicemias pré-prandiais (braços AA/AJ/AD) |
| **AA / AJ / AD** | Momentos de aferição pré-prandial: **A**ntes do **A**lmoço / do **J**antar / ao **D**eitar |
| **Braço** | Ramo da Figura 4 do guia que liga um momento de aferição a uma aplicação de Regular deslocada (AA→café, AJ→almoço, AD→jantar) |
| **Esquema** | Conjunto de aplicações de insulina do paciente; classificado em `basal` (0 Regular), `basal-plus` (1), `basal-bolus` (≥ 2) |
| **NPH "mais noturna"** | A aplicação de NPH que recebe o ajuste do jejum: primeira na ordem `ao_deitar → antes_jantar → antes_almoco → antes_cafe` |
| **Faixa plena** | Insulinização plena de 0,5–1,0 UI/kg/dia (p. 61); acima de 1,0 gera alerta, não trava (AMB-04) |
| **Caneta SUS** | Dispositivo de aplicação disponível no SUS: 1–60 UI por aplicação, graduação de 1 UI (R-20/D-08) |
| **Conduta alternativa** | Par de condutas clinicamente equivalentes segundo o guia, que o motor devolve **sem escolher** (AMB-03, AMB-10) |
| **Fora do escopo da fonte** | Saída honesta quando o cenário não é coberto pelo guia (ex.: insulina que não é NPH/Regular) |
| **Painel honesto** | Tela de falha inesperada (EC-07): "não prescreva a partir desta tela" |
| **Ritual de revisão** | Checkbox "Revisei a dose e a fonte" que habilita o bloco "Pronto para prescrever"; qualquer edição o desfaz |
| **Ofensor** | Violação de validação de entrada; a validação coleta **todos**, nunca para no primeiro |
| **Fonte clínica** | O Guia Rápido DM; toda saída carrega `ReferenciaClinica` com página/figura |
| **R-01..R-20** | Tabela canônica de regras extraída do guia página a página (spec do motor v2.0, recuperável no bundle) |
| **AMB-01..10** | Ambiguidades do guia decididas pelo usuário médico em 2026-07-17/18 (ver §5) |

## 3. Regras de domínio por modo

As regras abaixo estão 🟢 confirmadas no código (`models/insulina/`) e conferidas contra as constantes de `fonte-clinica.ts`, todas citando página/figura do guia.

### 3.1 Início de insulinização (`regra-inicio.ts`)

1. A saída é **faixa, nunca dose única** (AMB-01): 10–15 UI/dia absoluta **e** `round(0,1×kg)`–`round(0,2×kg)` por peso; sugestão fixa de NPH ao deitar. O médico fixa o número.
2. Alerta `INDICACAO_INSULINA` quando HbA1c ≥ 10% (AMB-08: "≥", leitura conservadora) **ou** jejum ≥ 300 mg/dL.
3. Recomendações fixas: manter metformina; manter sulfonilureia — exceto se `usoSulfonilureia === false` (ausência de informação conta como "manter"); aferir jejum 3×/semana por 15 dias.

### 3.2 Titulação basal (`regra-titulacao-basal.ts`)

4. Glicemias de jejum agregam-se por **média**, mas **hipoglicemia prevalece**: qualquer valor ≤ 70 mg/dL dispara −4 UI + alerta, independentemente da média (AMB-06).
5. Tabela de ajuste sobre o jejum agregado: ≤ 70 → −4; ≥ 180 → +4 (AMB-09: em exatamente 180 vale +4); ≥ 130 e < 180 → +2; 71–129 → na meta, delta 0 (AMB-02/05: meta como faixa explícita, com piso de segurança).
6. O ajuste incide na **NPH mais noturna**; esquema sem NPH: o jejum não titula nada.
7. Toda dose é **clampada em 1–60 UI** (caneta SUS); quando o clamp atua, alerta `TETO_POR_APLICACAO`.
8. **Fracionamento** quando NPH única > 30 UI ou > 0,4 UI/kg/dia: principal ½ café (`ceil`) + ½ ao deitar; alternativa rotulada ⅔ café (`round`) + ⅓ ao deitar (AMB-10 — o motor não escolhe). Ao fracionar com sulfonilureia em uso explícito: recomendar suspendê-la; sempre manter metformina.

### 3.3 Intensificação (`regra-intensificacao.ts`)

9. **Gate de HbA1c** (R-13/R-18): ≤ 7% sem Regular → manter conduta, repetir HbA1c em 6 meses; ≤ 7% com Regular → ajustar e avaliar encaminhamento ao endócrino; > 7% → pode iniciar Regular, mas sem pré-prandiais aferidas → recomendar aferir AA/AJ/AD e parar; HbA1c ausente → só prossegue se já intensificado **e** com pré-prandiais (recomendando repetir HbA1c em 3 meses).
10. Mapeamento **deslocado** aferição→aplicação (R-14..R-17): AA → Regular antes do **café**; AJ → antes do **almoço**; AD → antes do **jantar**.
11. Por braço: hipo ≤ 70 → alerta + Regular −2 se existir; média < 130 → manter; ≥ 130 com Regular → +2; sem Regular e gate aberto → iniciar Regular 4 UI.
12. **Caso especial AJ** (AMB-03): existindo NPH antes do café, o guia oferece duas condutas equivalentes; o motor devolve ambas como `condutasAlternativas` — a escolha é do prescritor.
13. A titulação da Regular espelha a lógica do jejum (AMB-07) — **inferência espelhada**, citada como tal na referência: o guia só explicita "ajustar 2 UI a cada 3 dias".
14. **NG-07**: intensificado, HbA1c acima da meta e nada ajustado → recomendar aferição pós-prandial, explicitando que o guia não parametriza esse ajuste.

### 3.4 Regras transversais (fachada e validação)

15. Validação coleta **todos os ofensores**: peso 0 < p ≤ 350 kg; glicemias 10–1000 mg/dL; HbA1c 3–20% se presente; na titulação, esquema obrigatório e não vazio, doses inteiras 1–60, ≥ 1 glicemia; **EC-10**: pré-prandiais + esquema sem Regular exigem HbA1c. O motor revalida tudo, sem confiar na UI (EC-08).
16. Insulina fora do catálogo NPH/Regular → `ForaDoEscopoDaFonte` com orientação, nunca cálculo parcial.
17. Dose total > 1,0 UI/kg/dia → alerta `DOSE_ACIMA_FAIXA_PLENA` + recomendação de compartilhar cuidado com especialista (AMB-04: alerta, não trava).
18. Houve ajuste → recomendar reavaliar em 3 dias (cadência da Figura 4).
19. Alertas ordenados por severidade fixa (`HIPOGLICEMIA > DOSE_ACIMA_FAIXA_PLENA > FRACIONAR_DOSE > TETO_POR_APLICACAO > INDICACAO_INSULINA`); recomendações deduplicadas por `tipo`; referências por `localizacao`.
20. **Toda saída carrega referência à fonte** (invariante verificado por property-based testing); erros esperados são valores (union types); exceção (`ErroDeInvariante`) sinaliza bug interno e leva ao painel honesto na UI.

### 3.5 Regras da interface com força de domínio

21. 🟢 **Privacidade por construção** (RN-02/MD-0003): nenhum fetch, nenhum storage de dado clínico; único localStorage é o tema. O tipo `EventoDeErro` (só o nome da classe do erro) torna vazamento estruturalmente impossível.
22. 🟢 **Invalidação por edição** (RN-06/EC-03): qualquer edição no formulário marca o resultado como `desatualizado` e desfaz a revisão confirmada.
23. 🟢 A UI espelha as faixas de validação do domínio importando `CONSTANTES` — não há segunda fonte de números.

## 4. Constantes clínicas

🟢 Catálogo único, congelado, em `fonte-clinica.ts:73` (`CONSTANTES`), cada grupo comentado com a regra R-xx/AMB-xx de origem. Dicionário completo em `data-dictionary.md`. Não há feature flag nem parâmetro de ambiente: o motor é determinístico por design.

## 5. Decisões de ambiguidade (AMB-01..10) — o "porquê" clínico

🟢 Recuperadas do requirements da feature 001 (§9, no bundle), decididas pelo usuário médico em 2026-07-17/18. São a camada de conhecimento mais difícil de reconstruir sem o histórico:

| ID | Ambiguidade no guia | Decisão |
|---|---|---|
| AMB-01 | Dose inicial: texto (p. 60) vs. Figura 4 (p. 62) | Exibir a **faixa** do texto (10–15 UI ou 0,1–0,2 UI/kg); o médico fixa a dose |
| AMB-02 | Braço implícito 71–129 mg/dL da Figura 4 | Manter a dose, informando "na meta" |
| AMB-03 | Braço AJ ≥ 130 com NPH no café: duas condutas | Devolver **ambas rotuladas**; escolha do prescritor |
| AMB-04 | Teto de dose (p. 61) | **Sem trava numérica**: acima de 1,0 UI/kg/dia, alerta + "compartilhar cuidado com especialista"; invioláveis só o incremento por ajuste e 1–60 UI/aplicação |
| AMB-05 | Meta do jejum: p. 60 vs. Figura 4 | Faixa-alvo explícita **71–129**, destacando o piso de segurança |
| AMB-06 | Múltiplas glicemias de jejum | **Média**, com **hipoglicemia prevalecendo** (qualquer ≤ 70 → −4 + alerta) |
| AMB-07 | Titulação da Regular já iniciada | **Espelhar a lógica do jejum** no momento correspondente; registrada como inferência espelhada |
| AMB-08 | Indicação de insulina: "> 10%" (texto) vs. "≥ 10%" (figura) | **≥ 10%**, leitura conservadora do fluxograma |
| AMB-09 | Sobreposição em exatamente 180 mg/dL | Em 180 vale **+4** (prioridade ao braço "≥ 180") |
| AMB-10 | Proporções do fracionamento: ½+½ vs. ⅔+⅓ | **½+½ principal** (preferencial do guia), ⅔+⅓ alternativa rotulada |

## 6. Fronteiras de escopo (o que o sistema recusa por design)

- 🟢 Insulinas fora de NPH/Regular → `ForaDoEscopoDaFonte` (MD-0009: "o que o guia cobre, a calculadora cobre").
- 🟢 Orientações ao paciente: **excluídas** da fase 1; o resultado dirige-se somente ao prescritor (MD-0009).
- 🟢 Persistência de dado clínico: excluída por arquitetura (MD-0003); rotas de API são permitidas apenas sem dado clínico (MD-0011).
- 🟢 Segunda fonte clínica: excluída (NG-04 do motor); nova edição do guia é gatilho de revisão registrado (MD-0008).
- 🟢 Ajuste pós-prandial: o guia não parametriza; o motor apenas recomenda a aferição (NG-07).

## 7. Intenções declaradas e não realizadas

- 🔴 **Quatro divergências clínicas aprovadas no design e ausentes do domínio** (memória do projeto, 19/07/2026): (1) capturar dose de metformina e alertar quando não otimizada; (2) capturar TFG para ajustar/contraindicar metformina; (3) `SUSPENDER_SULFONILUREIA` ampliada (uso "não informado" com redação condicional; esquema que já chega fracionado); (4) entrada de glicemias por momento em 4 campos. Itens 1–2 dependem de conteúdo do guia ainda não extraído. Cada uma exige spec antes do código (Princípios I, II e VI).
- 🔴 **API v1**: `pages/api/v1/index.js` vazio. O histórico antigo revela a intenção: a feature 002 (`/api/v1/status`, observabilidade do deploy, MD-0011) chegou a ser implementada no repo pré-refundação e não foi reconstituída; os placeholders atuais são o vestígio.
- 🔴 **Infra**: `infra/compose.yaml` vazio; scripts `test:api` e `test:e2e` referenciam configs inexistentes (existiam antes da refundação: `vitest.api.config.ts` e `playwright.config.ts` estão no bundle).
- 🟡 Único TODO-like no código é o cabeçalho de `validacao.ts` ("coleta de TODOS os ofensores"), que é descrição, não pendência. Não há FIXMEs.

## 8. Rastreabilidade órfã

🟢 O código cita RF-xx, RN-xx, RNF-xx, EC-xx, R-01..R-20, AMB-01..10, MD-xxxx, NG-xx e D-xx apontando para `_reversa_sdd/sdd/motor-calculo-insulina.md` (v2.0) e `_reversa_forward/001-.../requirements.md` — artefatos removidos na refundação, porém **integralmente recuperáveis** no bundle `~/dev/aps-inteligente-backup.bundle` (clone de trabalho desta extração no scratchpad da sessão). Enquanto a re-extração não os reconstituir, os identificadores no código são referências pendentes.

## 9. Lacunas 🔴

1. O PDF do guia (`referencias/…`) está fora do versionamento (MD-0008) — a verificação página a página das constantes depende de o usuário fornecê-lo novamente.
2. Não há logs de produção nem telemetria (MD-0010, `RelatorDeErros` nulo): nenhuma evidência de comportamento em uso real.
3. As specs v2.0 do motor ainda não foram reconstituídas no repo atual; até lá, a matriz de rastreabilidade não fecha (Princípio VI).
