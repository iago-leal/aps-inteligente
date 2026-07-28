# Dicionário de Dados — aps-inteligente

> Regenerado pelo Reversa Archaeologist em 2026-07-28 (**re-extração nº 4** — inclui o Domínio 5, puericultura / crescimento e consulta SOAP, features 017 e 020, e o Domínio 6, contribuição, feature 019).
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA
> Não há persistência de dado clínico: todas as entidades abaixo são **estruturas em memória** (TypeScript), efêmeras por request de cálculo. O único dado durável do sistema é a preferência de tema em `localStorage`. O banco (`infra`) guarda **nada de clínico** — serve só ao healthcheck.
> 🆕 **Uma classe de dado nova entrou nesta passagem, e não é persistência:** as 14 tabelas LMS da OMS (12.964 linhas `L/M/S`, 376 kB) são **módulos estáticos importados** por `models/puericultura/oms/`, com procedência versionada por `sha256` em `manifesto.json`. Somam-se a dois artefatos de apoio em `tests/apoio/`, de propósito oposto no tempo: `inventario-textual.json` (regerado a cada revisão) e `citacao-linha-de-base.json` (**jamais** regerado).

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

# Domínio 5 — `models/puericultura` (feature 017) 🟢

### Entrada — `EntradaAvaliacao` 🟢

> **Nenhum campo identifica a criança:** sem nome, prontuário ou documento. Os campos opcionais realizam RF-06 já na entrada — a falta de uma medida suprime **só** o índice que dela depende.

| Campo | Tipo | Obrigatório | Faixa / valores | Nota |
|---|---|---|---|---|
| `sexo` | `"masculino" \| "feminino"` | sim | — | eixo de toda tabela |
| `dataDeNascimento` | `DataIso` (`AAAA-MM-DD`) | sim | não futura | dias epoch UTC (ADR 0013) |
| `dataDaMedicao` | `DataIso` | sim | ≥ nascimento | injetada pela UI; o motor não lê o relógio |
| `pesoKg` | number | não* | positivo | *ao menos uma medida (RN-11) |
| `comprimentoCm` | number | não* | positivo | consumido por estatura **e** IMC |
| `posicaoDaMedicao` | `"deitado" \| "em-pe"` | condicional | — | **obrigatória quando há comprimento** (RN-09): sem default silencioso |
| `perimetroCefalicoCm` | number | não* | positivo | fora de escopo acima de 730 dias |
| `idadeGestacionalAoNascer` | `IdadeGestacional{semanas,dias}` | não | — | ausente = tratada como termo, **e isso é declarado na saída** |

### `IdadesDerivadas` — as três idades 🟢

| Campo | Tipo | Significado |
|---|---|---|
| `diasDeVida` | number | cronológica; governa escopo, posição de medida e validade da correção |
| `descontoDeSemanas` | number | `40 − IG ao nascer`; zero no nascido a termo |
| `diasCorrigidos` | number | corrigida enquanto vale; a cronológica depois |
| `correcaoAtiva` | boolean | até 730 dias, ou 1.095 quando IG < 28 semanas |
| `semanasPosMenstruais` | `number \| null` | `IG + tempo de vida`; `null` para quem é tratado como termo |

### Saída — `SaidaAvaliacao = ResultadoAvaliacao | ForaDoEscopoDaFonte | ErroValidacao` 🟢

> **Nota de leitura:** o discriminante da **saída** é `tipo`, como nos quatro domínios anteriores; o do **índice** é `estado` — para que um resultado com quatro índices não tenha cinco campos `tipo` de significados distintos.

| Entidade | Campos |
|---|---|
| `ResultadoAvaliacao` | `idades`, `indices` (um por índice de RN-01), `notas`, `notaProveniencia`, `referencias` (nunca vazia) |
| `IndiceCalculado` | `estado:"calculado"`, `indice`, `escoreZ` (sem arredondar), `classificacao` (rótulo literal), `padrao`, `idadeUsada`, `avisos`, `referencia` |
| `IndiceAusente` | `estado:"ausente"`, `indice`, `motivo: MEDIDA_NAO_INFORMADA \| IMC_INEXISTENTE_NO_PRETERMO` |
| `IndiceForaDoEscopo` | `estado:"fora-do-escopo"`, `indice`, `motivo:"PC_ACIMA_DE_2_ANOS"`, `mensagem`, `referencia` — **recusa parcial**, não derruba os demais |
| `IdadeUsada` | `especie: cronologica\|corrigida\|pos-menstrual`, `valor`, `unidade: dia\|semana`, `descontoDeSemanas?` |
| `Aviso` | `campo`, `codigo:"CONVERSAO_DE_POSICAO_APLICADA"`, `mensagem` |
| `NotaAoPrescritor` | `tipo: PREMISSA_DE_TERMO \| NASCIDO_A_TERMO_SEM_CORRECAO`, `mensagem`, `referencia` |
| `ForaDoEscopoDaFonte` | `motivo: IDADE_FORA_DA_COBERTURA \| ABAIXO_DA_CURVA_DE_PRETERMO` — **recusa global** |

`Indice` (4): `peso-idade`, `comprimento-estatura-idade`, `imc-idade`, `perimetro-cefalico-idade`.
`PadraoDeReferencia`: `OMS` · `INTERGROWTH-21st`.
`CodigoOfensor` (10): SEXO_INVALIDO, DATA_DE_NASCIMENTO_INVALIDA, DATA_DE_NASCIMENTO_FUTURA, DATA_DA_MEDICAO_INVALIDA, NENHUMA_MEDIDA_INFORMADA, PESO_INVALIDO, COMPRIMENTO_INVALIDO, PERIMETRO_CEFALICO_INVALIDO, POSICAO_DA_MEDICAO_AUSENTE, IDADE_GESTACIONAL_INVALIDA.

### Acervo tabular — `TabelaLms` 🟢

| Campo | Tipo | Nota |
|---|---|---|
| `unidade` | `"dia" \| "mes"` | dia até 5 anos, mês de 5 a 10 |
| `inicio`, `fim` | number | faixa inclusiva; a busca é `posição = chave − inicio` |
| `l`, `m`, `s` | `readonly number[]` | arrays paralelos indexados por posição |

**14 combinações** (4 peso, 4 estatura, 4 IMC, 2 perímetro cefálico — este só por dia). Conferidas na montagem do acervo: unidade trocada ou array mais curto que a faixa declarada lançam `ErroDeInvariante`, porque produziriam escore silenciosamente errado.

### Fronteiras numéricas (`FRONTEIRAS` e `oms/leitura.ts`, `Object.freeze`) 🟢

| Constante | Valor | Papel |
|---|---|---|
| `doisAnosEmDias` | 730 | posição de medida; troca "Comprimento"→"Estatura"; fim do perímetro cefálico |
| `cincoAnosEmDias` | 1826 | fronteira de **rótulo** do IMC |
| `ULTIMO_DIA_DA_TABELA_POR_DIA` | 1856 | fronteira de **tabela** — de propósito ≠ 1826 |
| `ULTIMO_DIA_COBERTO` | 3682 | fim da cobertura (mês 120) |
| `correcaoAteEmDias` / `correcaoEstendidaAteEmDias` | 730 / 1095 | validade da correção de prematuridade |
| `igDeTermoEmSemanas` / `igQueEstendeACorrecaoEmSemanas` | 37 / 28 | define pré-termo e correção estendida |
| `JANELA_PRETERMO_EM_SEMANAS` | 27 a 64 | validade das curvas INTERGROWTH-21st |
| `CONVERSAO_DE_POSICAO_EM_CM` | 0,7 | conversão deitado ⇄ em pé |
| `FRONTEIRA_DA_CAUDA` | 3 | além dela, extrapolação linear (só peso e IMC) |
| `DIAS_POR_MES` | 30,4375 | mês médio (365,25/12) |

---

# Domínio 5b — `models/puericultura/consulta` (feature 020) 🟢 — segunda fachada

### Acervo — `Ficha` e `Campo` 🟢

| Entidade | Campos |
|---|---|
| `Ficha` | `id`, `titulo` (citação), `pagina`, `faixaEmDias{de,ate}` (inclusiva), `secoes` |
| `SecaoDaFicha` | `numero` (impresso na fonte), `titulo` (citação), `campos` |
| `CampoBase` | `id` (nunca chega à tela), `rotulo` (citação byte a byte), `rotuloFeminino?`, `secaoSoap`, `pagina`, `orientacao?`, `sexos?` |
| `CampoDeMarcacao` | `natureza:"marcacao"` — o `( ) Não ( ) Sim` da fonte |
| `CampoDeEscolha` | `natureza:"escolha"`, `opcoes` (citação, na ordem impressa), `aceitaComplemento?` |
| `CampoDeMedida` | `natureza:"medida"`, `unidade: g \| cm \| kg/m²`, `vinculoAntropometrico?` |
| `CampoDeTexto` | `natureza:"texto"` |

> 🟢 **O peso vem em GRAMAS**, como a caderneta o imprime; a conversão para quilos é do produto. O `kg/m²` do IMC é a única unidade que a fonte **não** imprime — as fichas do 24.º e do 36.º mês pedem "IMC****: ______" sem unidade, e escrevê-la diz em que escala o número se lê, sem acrescentar campo que a página não tem.
> 🟢 **`sexos` presente só quando o campo NÃO se aplica aos dois** — a restrição é a exceção, e por isso é ela que se escreve. Hoje: um item ("Criptorquidia").

### Entrada e saída 🟢

| Entidade | Campos |
|---|---|
| `ContextoDaConsulta` | `sexo`, `dataDeNascimento`, `dataDaConsulta`, `idadeGestacionalAoNascer?`, `idades` (reuso integral da 017), `posicaoDaMedicao?` (**campo autoral**: a caderneta não pergunta, e o motor da 017 se recusa a supor) |
| `Preenchimento` | `ReadonlyMap<idDoCampo, Resposta>` — **chave ausente É campo não preenchido**; não há valor sentinela |
| `Resposta` | união por natureza: `{valor:"sim"\|"nao"}` · `{opcao, complemento?}` · `{bruto}` (o número como digitado) · `{texto}` |
| `EntradaDoRegistro` | `ficha`, `contexto`, `preenchimento`, `avaliacao?` (chega **pronta** da fachada da 017) |
| `RegistroDaConsulta` | `tipo:"registro"`, `ficha`, `idadeDeclarada`, `secoes` (só as que têm item), `notas`, `referencias` (nunca vazia) |
| `ItemDoRegistro` | `rotulo` (na flexão do sexo), `valor`, `origem: ficha \| calculadora-de-crescimento`, `referencia?` |
| `SugestaoDeFicha` | `ficha`, `especieDeIdade` (sempre `cronologica`), `diasDeVida` |

`SecaoSoap`: `S` · `O` · `A` · `P` (ordem fixa; seção sem item é **omitida inteira**).
`TipoDeNotaDoRegistro` (3): ORGANIZACAO_EM_SOAP, FICHAS_AUSENTES, SUPRESSAO_DE_CAMPO.
🟡 **Três fichas fora do escopo da fonte** vão declaradas em `NOTA_FICHAS_AUSENTES`.

---

# Domínio 6 — `models/contribuicao` (feature 019) 🟢 — não clínico

> 🟢 **Isenção declarada (`MD-0022`):** este unit não tem fonte clínica única, não emite `ReferenciaClinica` e não participa do catálogo congelado nem da linha de base de citação. Conserva os demais invariantes da família: domínio puro, erro como valor, coleta total de ofensores.

### Entrada — `ParametrosPix` 🟢

| Campo | Tipo | Obrigatório | Limite (sobre o texto **já normalizado**) |
|---|---|---|---|
| `chave` | string | sim | não vazia |
| `nomeBeneficiario` | string | sim | 25 caracteres |
| `cidade` | string | sim | 15 caracteres |
| `valorSugerido` | number | não | ausente = à escolha de quem contribui |
| `identificacao` | string | não | 25; ausente vira `***` no campo 62/05 |

### Saída — `SaidaBrCode` 🟢

| Variante | Campos |
|---|---|
| `{tipo:"ok"}` | `payload: string` — cadeia EMV completa, com CRC16 nos quatro dígitos finais |
| `{tipo:"ParametroInvalido"}` | `ofensores: OfensorPix[]` — **todos** de uma vez |

`OfensorPix`: `campo`, `codigo`, `mensagem`, `limite?`, `observado?` — os dois últimos só quando o motivo é comprimento, porque a mensagem precisa dizer **o que fazer**, e não apenas que algo está errado.
`CodigoOfensorPix` (7): CHAVE_AUSENTE, NOME_AUSENTE, NOME_ACIMA_DO_LIMITE, CIDADE_AUSENTE, CIDADE_ACIMA_DO_LIMITE, IDENTIFICACAO_ACIMA_DO_LIMITE, VALOR_INVALIDO.

### Constantes do padrão (Banco Central) 🟢

`GUI_PIX = "br.gov.bcb.pix"` · formato `01` · categoria do estabelecimento `0000` ("não especificado": a contribuição não é venda) · moeda `986` (ISO 4217, real) · país `BR` · sem identificação `***` · campo de verificação `63`, comprimento `04`.
**CRC16-CCITT/FALSE:** polinômio `0x1021`, inicial `0xFFFF`, sem reflexão nem xor final, quatro dígitos hexadecimais maiúsculos. Vetor conhecido: `"123456789"` → `29B1`.

### Configuração do beneficiário (`interface/contribuicao/beneficiario.ts`) 🟢

Vive na **apresentação**, não no domínio, porque é dado de instalação e não regra: `models/contribuicao` recebe os valores por parâmetro e não sabe que a constante existe. A chave é pública por natureza e mora no repositório. `EXEMPLO` permanece no código como **oráculo** da guarda que reprova a suíte enquanto o beneficiário real for igual a ele.

---

# Estado de UI (não persistido)

| Módulo | Estado | Valores | Nota |
|---|---|---|---|
| `interface/calculadora` | `EstadoResultado` | `vazio → sucesso \| erro \| falha-inesperada` + flags `desatualizado`, `revisaoConfirmada` | ritual de revisão (insulina) |
| `interface/gestacao` | `EstadoIg` | `vazio → sucesso \| erro \| falha-inesperada` | sem ritual |
| `interface/cardiologia` | `EstadoCardiologia` | `vazio → sucesso \| fora-do-escopo \| erro \| falha-inesperada` | sem ritual |
| `interface/risco-cardiovascular` | `EstadoRiscoCardiovascular` | `vazio → sucesso \| fora-do-escopo \| erro \| falha-inesperada` + flag `desatualizado` | sem ritual (D-08) |
| 🆕 `interface/puericultura` | `EstadoCrescimento` | `vazio → sucesso \| fora-do-escopo \| erro \| falha-inesperada` | sem ritual; invalidação por edição (017) |
| 🆕 `interface/puericultura/consulta` | — (**sem máquina de estados**) | registro derivado por `useMemo` a cada tecla | **sem ritual e sem invalidação**: aqui a edição *é* o preenchimento (020) |
| 🆕 `interface/contribuicao` | `painelAberto: boolean` | — | abrir e fechar não cria durável algum (019) |
| Tema (`preferencia-de-tema`) | `"claro" \| "escuro"` | — | **único dado durável**: `localStorage["aps-inteligente:tema"]` |
| `RelatorDeErros` | `EventoDeErro{ nome: string }` | só nome da classe | vazamento de payload impossível por tipo |

---

# Infraestrutura — `infra/` (sem dado clínico) 🟢 (feature 022)

| Entidade | Campos | Nota |
|---|---|---|
| `ErroDeBanco` | `causa: "conexao" \| "consulta" \| "configuracao" \| "tempo_esgotado"`, `message`, `cause?` | 🆕 **quarta causa**: `tempo_esgotado` **retira casos** das outras duas — `57014` deixa de cair em `consulta`, e o estouro na espera por conexão deixa de cair em `conexao` |
| `EstadoDoBanco` (`saude.ts`) | `{estado:"integro"}` \| `{estado:"degradado", causa}` | 🆕 erro convertido em **valor**; único importador de `saude()` em produção |
| Config do pool | `max=5`, `connectionTimeoutMillis` e `statement_timeout` = `APS_TIMEOUT_SAUDE_MS` (padrão **3.000 ms**) | 🆕 teto imposto **no servidor**; malformado cai no padrão **registrando log** |
| `query(texto, valores, {tetoMs?})` | emite `set_config` só quando o teto difere do padrão; restaura no `finally`; descarta o cliente no estouro | 🆕 |
| Log estruturado | `{nivel, origem, causa, erro, host (mascarado), duracao_ms?, teto_ms?}` | JSON, **sem URL/credencial** |

# API — `GET /api/v1/status` (ADR 0008) 🟢 (features 002 e **022**)

Resposta **200 em todo estado do banco**, inclusive degradado (`MD-0031`) — as calculadoras são integralmente cliente e seguem servindo com o banco fora; um 503 afirmaria queda que não houve.

| Campo | Tipo | Origem |
|---|---|---|
| `atualizado_em` | ISO 8601 | instante da requisição (002) |
| `versao` | string | `package.json` (002) |
| `commit` | string | `VERCEL_GIT_COMMIT_SHA ?? "local"` (002) |
| 🆕 `publicado_em` | ISO 8601 \| `null` | carimbo do **build**, substituído estaticamente por `next.config.ts` |
| 🆕 `ambiente` | `"producao" \| "pre-visualizacao" \| "local"` | vocabulário **do produto**, não do provedor |
| 🆕 `banco` | `{estado:"integro"}` \| `{estado:"degradado", causa}` | `verificarBanco()`; a consulta segue `SELECT $1::int AS ok` |

`Cache-Control: no-store`. 405 + `Allow: GET` para não-GET, **antes de qualquer I/O** — método errado não desperta a instância do banco. Mudança incompatível exigiria `/api/v2`; os três campos da 002 permanecem intocados em nome, tipo e semântica, de modo que o acréscimo cabe em `/api/v1` pela regra que o próprio contrato escreveu para si.
