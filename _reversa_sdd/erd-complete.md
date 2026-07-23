# ERD Completo — aps-inteligente

> Regenerado pelo Reversa Architect em 2026-07-23 (re-extração nº 3).
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

🟢 **Não há persistência de dado clínico** (ADR 0002). O banco PostgreSQL existe (feature 003) mas responde só `SELECT 1` — não tem esquema clínico. Os ERDs abaixo modelam as **entidades em memória** dos quatro domínios (`models/*/tipos.ts`), efêmeras por cálculo: não há PK/FK, as "relações" são composição de objetos imutáveis, e as cardinalidades refletem os contratos TypeScript.

## Domínio 1 — `models/insulina`

```mermaid
erDiagram
    ENTRADA_CALCULO {
        string modo "inicio | titulacao"
        number pesoKg "0 < p <= 350"
        number hba1cPercent "opcional; 3-20"
        boolean usoSulfonilureia "opcional"
        number doseMetforminaMgDia "opcional (feature 001)"
        number tfg "opcional; mL/min/1.73m2 (feature 001/005)"
    }
    GLICEMIA_AFERIDA { number valorMgDl "10-1000" string momento "jejum|antes_almoco|antes_jantar|ao_deitar" }
    ESQUEMA_INSULINA { string tipo "basal | basal-plus | basal-bolus" }
    APLICACAO_INSULINA { string insulina "NPH | Regular" string momento "antes_cafe|antes_almoco|antes_jantar|ao_deitar" number doseUi "inteira 1-60" }
    SAIDA_CALCULO { string tipo "resultado | erro-validacao | fora-do-escopo" }
    RESULTADO_TITULACAO { number doseTotalDiaUi number deltaTotalUi "pode ser negativo" boolean naMeta }
    ALERTA { string tipo "6 valores; ordenados por SEVERIDADE" }
    RECOMENDACAO { string tipo "14 valores; chave de dedupe" }
    REFERENCIA_CLINICA { string fonteId "guia-rapido-dm-sms-rio" string localizacao "pagina/figura; dedupe" }
    OFENSOR { string campo string codigo "9 valores" }

    ENTRADA_CALCULO ||--o{ GLICEMIA_AFERIDA : "glicemias (>=1 na titulacao)"
    ENTRADA_CALCULO ||--o| ESQUEMA_INSULINA : "esquemaAtual (titulacao)"
    ESQUEMA_INSULINA ||--|{ APLICACAO_INSULINA : "aplicacoes"
    SAIDA_CALCULO ||--o| RESULTADO_TITULACAO : "variante"
    RESULTADO_TITULACAO ||--|{ APLICACAO_INSULINA : "esquemaSugerido"
    RESULTADO_TITULACAO ||--o{ ALERTA : "alertas"
    RESULTADO_TITULACAO ||--o{ RECOMENDACAO : "recomendacoes"
    RESULTADO_TITULACAO ||--|{ REFERENCIA_CLINICA : "referencias (>=1)"
    SAIDA_CALCULO ||--o{ OFENSOR : "erro-validacao (>=1)"
    ALERTA ||--|| REFERENCIA_CLINICA : "referencia"
    RECOMENDACAO ||--|| REFERENCIA_CLINICA : "referencia"
```

## Domínio 2 — `models/gestacao` (feature 007)

```mermaid
erDiagram
    ENTRADA_DATACAO { string dataReferencia "AAAA-MM-DD; injetada pela UI (RN-07)" string dum "opcional*" }
    DATACAO_ULTRASSOM { string dataExame "opcional*" number semanas "0-42" number dias "0-6" }
    SAIDA_DATACAO { string tipo "resultado | erro-validacao" }
    DATACAO_CALCULADA { number igSemanas number igDias string dpp "Naegele" number trimestre "1|2|3" }
    DATACAO_POR_ULTRASSOM { string dumEquivalente "dataExame - IG do laudo" }
    COMPARACAO_DATACOES { number diferencaDias number trimestreDaUsg number margemDias "7|14|ausente" string veredito }
    NOTA_AO_PRESCRITOR { string tipo "CONFIABILIDADE_DUM | ESTIMATIVA_NA_DATA_DE_REFERENCIA" }
    REFERENCIA_CLINICA { string fonteId "guia-rapido-pre-natal-sms-rio" string localizacao "pp. 31-32, 113" }
    OFENSOR { string codigo "7 valores" }

    ENTRADA_DATACAO ||--o| DATACAO_ULTRASSOM : "ultrassom (*DUM ou USG, RN-05)"
    SAIDA_DATACAO ||--o| DATACAO_CALCULADA : "porDum (opcional)"
    SAIDA_DATACAO ||--o| DATACAO_POR_ULTRASSOM : "porUltrassom (opcional)"
    SAIDA_DATACAO ||--o| COMPARACAO_DATACOES : "comparacao (só com ambas)"
    DATACAO_POR_ULTRASSOM ||--|| DATACAO_CALCULADA : "estende"
    SAIDA_DATACAO ||--o{ NOTA_AO_PRESCRITOR : "notas"
    SAIDA_DATACAO ||--|{ REFERENCIA_CLINICA : "referencias (>=1)"
    SAIDA_DATACAO ||--o{ OFENSOR : "erro-validacao (>=1)"
    COMPARACAO_DATACOES ||--|| REFERENCIA_CLINICA : "referencia"
```

🟢 **Veredito** ∈ `dum-confirmada` / `dum-fora-da-margem` / `sem-parametro-na-fonte`. O 3.º trimestre não tem margem na fonte → `sem-parametro-na-fonte`.

## Domínio 3 — `models/cardiopatia-isquemica` (feature 010)

```mermaid
erDiagram
    ENTRADA_AVALIACAO { number idadeAnos "0-120 valida; 30-69 coberta" string sexo "masculino | feminino" boolean impedimentoErgometria "opcional" boolean sinaisInstabilidade "opcional" }
    CARACTERISTICAS_DOR { boolean retroesternal boolean provocadaPorEsforcoOuEstresse boolean aliviaComRepousoOuNitrato }
    FATOR_DE_RISCO { string valor "diabetes|tabagismo|hipertensao|dislipidemia" }
    SAIDA_AVALIACAO { string tipo "resultado | fora-do-escopo | entrada-invalida" }
    RESULTADO_AVALIACAO { string classificacaoDor "tipica|atipica|nao-anginosa" string faixaEtaria "30-39..60-69" number probabilidadeBasePct string estrato "baixa|intermediaria|alta" }
    FAIXA_PROBABILIDADE { number minPct "capado 99" number maxPct "capado 99" boolean excedeAlta "extremo >90%" }
    CONDUTA { string tipo "4 valores" string exame "nenhum|ergometria|metodo-nao-invasivo-alternativo" }
    ADVERTENCIA { string tipo "ANGINA_INSTAVEL" }
    REFERENCIA_CLINICA { string fonteId "telecondutas-cardiopatia-isquemica" }
    OFENSOR { string codigo "3 valores" }

    ENTRADA_AVALIACAO ||--|| CARACTERISTICAS_DOR : "caracteristicas (3 booleanos)"
    ENTRADA_AVALIACAO ||--o{ FATOR_DE_RISCO : "fatoresDeRisco (pode vazio)"
    SAIDA_AVALIACAO ||--o| RESULTADO_AVALIACAO : "variante"
    RESULTADO_AVALIACAO ||--o| FAIXA_PROBABILIDADE : "probabilidadeAjustada (só com fator)"
    RESULTADO_AVALIACAO ||--|| CONDUTA : "conduta"
    RESULTADO_AVALIACAO ||--o{ ADVERTENCIA : "advertencias"
    RESULTADO_AVALIACAO ||--|{ REFERENCIA_CLINICA : "referencias (>=1)"
    SAIDA_AVALIACAO ||--o{ OFENSOR : "entrada-invalida (>=1)"
```

🟢 **Matriz `PROBABILIDADE_PRE_TESTE`** (Quadro 2, 24 células %, congelada): não anginosa M `4/13/20/27`, F `2/3/7/14`; atípica M `34/51/65/72`, F `12/22/31/51`; típica M `76/87/93/94`, F `26/55/73/86` (faixas `30-39/40-49/50-59/60-69`). Detalhe no `data-dictionary.md`.

## Domínio 4 — `models/risco-cardiovascular` (feature 014)

```mermaid
erDiagram
    ENTRADA_ESTIMATIVA { string sexo "masculino | feminino" string raca "branco | afro-americano | outra" number idadeAnos "0-120 valida; 40-79 coberta" number colesterolTotalMgDl "clamp 130-320" number hdlMgDl "clamp 20-100" number pasMmHg "clamp 90-200" boolean emTratamentoAntiHipertensivo boolean diabetes boolean tabagismoAtual boolean dcvPrevia "true = fora do escopo" }
    SAIDA_ESTIMATIVA { string tipo "resultado | fora-do-escopo | erro-validacao" }
    RESULTADO_ESTIMATIVA { number riscoPct "ASCVD 10 anos" string categoria "baixo|limitrofe|intermediario|alto" string notaProveniencia }
    AVISO { string campo string codigo "COLESTEROL|HDL|PAS_FORA_DA_FAIXA" }
    FORA_DO_ESCOPO { string motivo "IDADE_FORA_DA_FAIXA | DCV_PREVIA" }
    REFERENCIA_CLINICA { string fonteId "pce-acc-aha-2013" }
    OFENSOR { string codigo "6 valores" }

    SAIDA_ESTIMATIVA ||--o| RESULTADO_ESTIMATIVA : "variante"
    SAIDA_ESTIMATIVA ||--o| FORA_DO_ESCOPO : "variante"
    SAIDA_ESTIMATIVA ||--o{ OFENSOR : "erro-validacao (>=1, coleta total)"
    RESULTADO_ESTIMATIVA ||--o{ AVISO : "avisos (clamp; pode vazio)"
    RESULTADO_ESTIMATIVA ||--|{ REFERENCIA_CLINICA : "referencias (>=1)"
```

🟢 **Coeficientes PCE congelados** (`COEFICIENTES` 4×13, `BASELINE_SURVIVAL`, `MEANS`): quatro modelos de Cox sexo×raça, precisão estendida validada contra `CVrisk`/`PooledCohort`. Detalhe no `data-dictionary.md` §"Domínio 4".

## Infraestrutura — banco (sem dado clínico)

🟢 O PostgreSQL não tem esquema clínico. A única "entidade" relevante à extração é o **erro de infraestrutura**, não uma tabela:

```mermaid
erDiagram
    ERRO_DE_BANCO { string causa "conexao | consulta | configuracao" string message string cause "erro original preservado" }
    LOG_ESTRUTURADO { string nivel string origem string host "MASCARADO (4 chars + bullets)" number duracao_ms }
    ERRO_DE_BANCO ||--o| LOG_ESTRUTURADO : "emitido como (sem URL/credencial)"
```

## Invariantes estruturais (verificados por property-based testing)

1. 🟢 Toda saída dos quatro domínios carrega ao menos uma `ReferenciaClinica` — nenhuma conduta, datação, estrato ou risco sem fonte.
2. 🟢 `AplicacaoInsulina.doseUi` é sempre inteira 1–60 (value object `DoseUi`) — esquemas sempre realizáveis na caneta do SUS.
3. 🟢 Os quatro motores são determinísticos: mesma entrada → mesma saída (gestação recebe a data de referência como entrada, não lê o relógio).
4. 🟢 A cardiopatia recusa idade fora de 30–69, e o risco CV recusa idade fora de 40–79 ou DCV prévia, com `ForaDoEscopoDaFonte`, **sem número estimado** — não extrapolam a fonte.
5. 🟢 O risco CV é sempre 0–100% e sua categoria é monotônica no risco; valor fora da faixa fisiológica é clampado e sinalizado, nunca travado (invariantes property-based).

## View models da interface (fora do domínio)

`EstadoResultado`/`EstadoIg`/`EstadoCardiologia`, `EventoDeErro`, `Tema` — descritos em `data-dictionary.md` e `state-machines.md`; não participam do contrato dos motores.
