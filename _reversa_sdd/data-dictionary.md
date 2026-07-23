# Dicionário de Dados — aps-inteligente

> Regenerado pelo Reversa Archaeologist em 2026-07-23 (re-extração nº 3 — inclui o Domínio 4, risco cardiovascular / PCE, feature 014).
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA
> Não há persistência de dado clínico: todas as entidades abaixo são **estruturas em memória** (TypeScript), efêmeras por request de cálculo. O único dado durável do sistema é a preferência de tema em `localStorage`. O banco (`infra`) guarda **nada de clínico** — serve só ao healthcheck.

---

# Domínio 1 — `models/insulina`

### Entrada — `EntradaCalculo` 🟢
| Campo | Tipo | Obrigatório | Faixa / valores | Nota |
|---|---|---|---|---|
| `modo` | `"inicio" \| "titulacao"` | sim | — | discrimina o pipeline |
| `pesoKg` | number | sim | 0 < p ≤ 350 | value object `Peso` |
| `glicemias` | `GlicemiaAferida[]` | sim | ver abaixo | ≥ 1 no modo titulação |
| `hba1cPercent` | number | condicional | 3–20 | obrigatória em EC-10 (pré-prandiais sem Regular) |
| `usoSulfonilureia` | boolean | não | — | ausência conta como "manter" |
| `esquemaAtual` | `EsquemaInsulina` | condicional | — | obrigatório no modo titulação |
| `doseMetforminaMgDia` | number | não | — | RN-01 (feature 001); ausente = não informado |
| `tfg` | number | não | mL/min/1,73 m² | RN-02; ausente = não informado |

### `GlicemiaAferida` / `AplicacaoInsulina` / `EsquemaInsulina` 🟢
| Entidade | Campos |
|---|---|
| `GlicemiaAferida` | `valorMgDl: number` (10–1000), `momento: MomentoAfericao` (`jejum`/`antes_almoco`/`antes_jantar`/`ao_deitar`) |
| `AplicacaoInsulina` | `insulina: "NPH" \| "Regular"`, `momento: MomentoAplicacao` (`antes_cafe`/`antes_almoco`/`antes_jantar`/`ao_deitar`), `doseUi: number` (inteiro 1–60) |
| `EsquemaInsulina` | `tipo: "basal" \| "basal-plus" \| "basal-bolus"`, `aplicacoes: AplicacaoInsulina[]` |

### Value objects (invariante no construtor, `Object.freeze`) 🟢
`Peso` (0 < kg ≤ 350) · `Glicemia` (10–1000 mg/dL) · `DoseUi` (inteiro 1–60 UI). Violação → `ErroDeInvariante` (bug).

### Saída — `SaidaCalculo = ResultadoInicio | ResultadoTitulacao | ErroValidacao | ForaDoEscopoDaFonte` 🟢
| Variante | Campos-chave |
|---|---|
| `ResultadoInicio` | `faixaDoseUi`, `faixaPorPesoUi` (`FaixaUi{minUi,maxUi}`), `aplicacaoSugerida{insulina:"NPH",momento:"ao_deitar"}`, `alertas`, `recomendacoesAoPrescritor`, `referencias` |
| `ResultadoTitulacao` | `esquemaSugerido`, `doseTotalDiaUi`, `deltaTotalUi`, `naMeta`, `condutasAlternativas?`, `alertas`, `recomendacoesAoPrescritor`, `referencias` |
| `ErroValidacao` | `ofensores: Ofensor[]` (`campo`, `codigo: CodigoErro`, `mensagem`) |
| `ForaDoEscopoDaFonte` | `motivo: string`, `orientacao: string` |

`TipoAlerta` (6): HIPOGLICEMIA, DOSE_ACIMA_FAIXA_PLENA, FRACIONAR_DOSE, TETO_POR_APLICACAO, INDICACAO_INSULINA, METFORMINA_NAO_OTIMIZADA.
`TipoRecomendacao` (14): MANTER/SUSPENDER metformina·sulfonilureia, REDUZIR/SUSPENDER_METFORMINA_TFG, AFERIR_*, REPETIR_HBA1C_*, DOSAR_HBA1C, AVALIAR_ENCAMINHAMENTO_ENDOCRINO, COMPARTILHAR_CUIDADO_ESPECIALISTA, REAVALIAR_EM_3_DIAS.
`CodigoErro` (9): PESO/GLICEMIA/HBA1C/DOSE/METFORMINA/TFG_FORA_DE_FAIXA, HBA1C_OBRIGATORIA, ESQUEMA_OBRIGATORIO, GLICEMIAS_AUSENTES.

---

# Domínio 2 — `models/gestacao`

### Entrada — `EntradaDatacao` 🟢
| Campo | Tipo | Obrigatório | Nota |
|---|---|---|---|
| `dataReferencia` | `DataIso` (`AAAA-MM-DD`) | sim | injetada pela UI; motor não lê o relógio (RN-07) |
| `dum` | `DataIso` | não* | *DUM ou USG — ao menos uma (RN-05) |
| `ultrassom` | `DatacaoUltrassom` | não* | parcial é ofensor |

`DatacaoUltrassom`: `dataExame?: DataIso`, `semanas?: number` (0–42), `dias?: number` (0–6) — os três juntos ou nenhum.

### Saída — `SaidaDatacao = ResultadoDatacao | ErroValidacao` 🟢
| Entidade | Campos |
|---|---|
| `ResultadoDatacao` | `dataReferencia`, `porDum?`, `porUltrassom?`, `comparacao?`, `notas: NotaAoPrescritor[]`, `referencias` (nunca vazia) |
| `DatacaoCalculada` | `ig: IdadeGestacional{semanas,dias}`, `dpp: DataIso`, `trimestre: 1\|2\|3`, `referencia` |
| `DatacaoPorUltrassom` | `DatacaoCalculada` + `dumEquivalente: DataIso` |
| `ComparacaoDatacoes` | `diferencaDias`, `trimestreDaUsg`, `margemDias?` (7/14/ausente), `veredito`, `mensagem`, `referencia` |
| `NotaAoPrescritor` | `tipo: CONFIABILIDADE_DUM \| ESTIMATIVA_NA_DATA_DE_REFERENCIA`, `mensagem`, `referencia` |

`VereditoComparacao`: `dum-confirmada` · `dum-fora-da-margem` · `sem-parametro-na-fonte`.
`CodigoOfensor` (7): DATA_INVALIDA, DUM_FUTURA, DUM_ALEM_DE_44_SEMANAS, DATA_EXAME_FUTURA, IG_LAUDO_FORA_DE_FAIXA, DATACAO_ULTRASSOM_INCOMPLETA, NENHUMA_DATACAO_INFORMADA.

### Constantes 🟢
`diasPorSemana=7` · Naegele `+7 dias / +9 meses` · trimestre `<14×7` / `<28×7` · margem USG `7`(1.º)/`14`(2.º)/ausente(3.º) · plausibilidade `dumRetroativaMaxSemanas=44`, `igLaudoSemanas 0–42`, `igLaudoDias 0–6`.

---

# Domínio 3 — `models/cardiopatia-isquemica`

### Entrada — `EntradaAvaliacao` 🟢
| Campo | Tipo | Obrigatório | Faixa / valores |
|---|---|---|---|
| `idadeAnos` | number | sim | inteiro 0–120 (validação); 30–69 = coberto pela fonte |
| `sexo` | `"masculino" \| "feminino"` | sim | eixo do Quadro 2 |
| `caracteristicas` | `CaracteristicasDor` | sim | 3 booleanos (retroesternal, provocadaPorEsforcoOuEstresse, aliviaComRepousoOuNitrato) |
| `fatoresDeRisco` | `FatorDeRisco[]` | sim (pode vazio) | diabetes/tabagismo/hipertensao/dislipidemia |
| `impedimentoErgometria` | boolean | não | ECG basal altera interpretação ou não pode exercitar (RN-05) |
| `sinaisInstabilidade` | boolean | não | angina instável → desvio do fluxo (RN-07) |

### Saída — `SaidaAvaliacao = ResultadoAvaliacao | ForaDoEscopoDaFonte | EntradaInvalida` 🟢
| Entidade | Campos |
|---|---|
| `ResultadoAvaliacao` | `classificacaoDor`, `faixaEtaria`, `probabilidadeBasePct`, `probabilidadeAjustada?`, `estrato`, `conduta`, `advertencias`, `referencias` (nunca vazia) |
| `FaixaProbabilidade` | `minPct`, `maxPct` (capados em 99), `excedeAlta: boolean` (extremo > 90%) |
| `Conduta` | `tipo: TipoConduta`, `texto`, `exame: ExameRecomendado`, `causasNaoCardiacas?`, `referencia` |
| `Advertencia` | `tipo: "ANGINA_INSTAVEL"`, `mensagem`, `referencia` |
| `ForaDoEscopoDaFonte` | `motivo: "IDADE_FORA_DA_TABELA"`, `mensagem`, `referencia` |

`ClassificacaoDor`: `tipica`/`atipica`/`nao-anginosa`. `FaixaEtaria`: `30-39`/`40-49`/`50-59`/`60-69`. `Estrato`: `baixa`/`intermediaria`/`alta`. `TipoConduta`: encaminhamento-emergencial, exame-nao-indicado, exame-nao-invasivo, estratificacao-e-encaminhamento. `ExameRecomendado`: nenhum, ergometria, metodo-nao-invasivo-alternativo. `CodigoOfensor` (3): IDADE_INVALIDA, SEXO_INVALIDO, FATOR_DE_RISCO_INVALIDO.

### Matriz `PROBABILIDADE_PRE_TESTE` (Quadro 2, p. 5 — 24 células, %) 🟢
| Classe | Sexo | 30-39 | 40-49 | 50-59 | 60-69 |
|---|---|---|---|---|---|
| não anginosa | masculino | 4 | 13 | 20 | 27 |
| não anginosa | feminino | 2 | 3 | 7 | 14 |
| atípica | masculino | 34 | 51 | 65 | 72 |
| atípica | feminino | 12 | 22 | 31 | 51 |
| típica | masculino | 76 | 87 | 93 | 94 |
| típica | feminino | 26 | 55 | 73 | 86 |

Constantes: cobertura idade `30–69` · plausibilidade `0–120` · estrato `baixa < 10`, `alta > 90` · fator de risco `×2–×3`.

---

# Domínio 4 — `models/risco-cardiovascular` (feature 014) 🟢

### Entrada — `EntradaEstimativa` 🟢
| Campo | Tipo | Obrigatório | Faixa / valores |
|---|---|---|---|
| `sexo` | `"masculino" \| "feminino"` | sim | eixo do modelo de Cox |
| `raca` | `"branco" \| "afro-americano" \| "outra"` | sim | `"outra"` → coeficientes de branco (RN-05) |
| `idadeAnos` | number | sim | inteiro 0–120 (validação); 40–79 = coberto pelas PCE |
| `colesterolTotalMgDl` | number | sim | positivo; faixa fisiológica 130–320 (fora → clamp + aviso) |
| `hdlMgDl` | number | sim | positivo; faixa fisiológica 20–100 (fora → clamp + aviso) |
| `pasMmHg` | number | sim | positivo; faixa fisiológica 90–200 (fora → clamp + aviso) |
| `emTratamentoAntiHipertensivo` | boolean | sim | seleciona o coeficiente de PAS tratada × não-tratada |
| `diabetes` | boolean | sim | termo `diabetes` do modelo |
| `tabagismoAtual` | boolean | sim | termo `tabagismo` do modelo |
| `dcvPrevia` | boolean | sim | true → prevenção secundária, fora do escopo das PCE |

### Saída — `SaidaEstimativa = ResultadoEstimativa | ForaDoEscopoDaFonte | EntradaInvalida` 🟢
| Entidade | Campos |
|---|---|
| `ResultadoEstimativa` | `riscoPct` (ASCVD hard em 10 anos), `categoria`, `avisos` (clamp; pode vazio), `notaProveniencia`, `referencias` (nunca vazia) |
| `Aviso` | `campo`, `codigo: COLESTEROL/HDL/PAS_FORA_DA_FAIXA`, `mensagem` (com direção do viés) |
| `ForaDoEscopoDaFonte` | `motivo: "IDADE_FORA_DA_FAIXA" \| "DCV_PREVIA"`, `mensagem`, `referencia` |
| `EntradaInvalida` | `ofensores: Ofensor[]` (coleta total, RN-08) |

`CategoriaRisco`: `baixo`/`limitrofe`/`intermediario`/`alto` (cortes 5/7,5/20%). `GrupoPce`: `homem-branco`/`homem-negro`/`mulher-branca`/`mulher-negra`. `CodigoOfensor` (6): SEXO_INVALIDO, RACA_INVALIDA, IDADE_INVALIDA, COLESTEROL_INVALIDO, HDL_INVALIDO, PAS_INVALIDA.

### Constantes clínicas (`fonte-clinica.ts`, `Object.freeze`) 🟢
- **`COEFICIENTES`** — 4 registros de β (13 termos cada) da Tabela A de Goff 2013; termo ausente = 0.
- **`BASELINE_SURVIVAL`** — S₀ em 10 anos por grupo: 0.91436 / 0.89536 / 0.96652 / 0.95334.
- **`MEANS`** — mean(β·X) por grupo: 61.1816 / 19.5425 / −29.1817 / 86.6081 (precisão estendida; mean do homem-negro corrigido em D-04).
- **`FAIXAS`** — cobertura 40–79; plausibilidade 0–120; colesterol 130–320; HDL 20–100; PAS 90–200.
- **`CATEGORIAS`** — limítrofe 5, intermediário 7,5, alto 20 (%).

---

# Estado de UI (não persistido)

| Módulo | Estado | Valores | Nota |
|---|---|---|---|
| `interface/calculadora` | `EstadoResultado` | `vazio → sucesso \| erro \| falha-inesperada` + flags `desatualizado`, `revisaoConfirmada` | ritual de revisão (insulina) |
| `interface/gestacao` | `EstadoIg` | `vazio → sucesso \| erro \| falha-inesperada` | sem ritual |
| `interface/cardiologia` | `EstadoCardiologia` | `vazio → sucesso \| fora-do-escopo \| erro \| falha-inesperada` | sem ritual |
| `interface/risco-cardiovascular` | `EstadoRiscoCardiovascular` | `vazio → sucesso \| fora-do-escopo \| erro \| falha-inesperada` + flag `desatualizado` | sem ritual (D-08) |
| Tema (`preferencia-de-tema`) | `"claro" \| "escuro"` | — | **único dado durável**: `localStorage["aps-inteligente:tema"]` |
| `RelatorDeErros` | `EventoDeErro{ nome: string }` | só nome da classe | vazamento de payload impossível por tipo |

---

# Infraestrutura — `infra/database.ts` (sem dado clínico)

| Entidade | Campos | Nota |
|---|---|---|
| `ErroDeBanco` | `causa: "conexao" \| "consulta" \| "configuracao"`, `message`, `cause?` | erro nomeado, causa preservada |
| Config do pool | `max=5`, `connectionTimeoutMillis=5000`, `query_timeout=5000` | lazy singleton |
| Log estruturado | `{nivel, origem, causa, erro, host (mascarado), duracao_ms?}` | JSON, **sem URL/credencial** |

# API — `GET /api/v1/status` (contrato fixo, ADR 0008)
Resposta 200: `{ atualizado_em: ISO8601, versao: string (package.json), commit: string (VERCEL_GIT_COMMIT_SHA ?? "local") }`. `Cache-Control: no-store`. 405 + `Allow: GET` para não-GET.
