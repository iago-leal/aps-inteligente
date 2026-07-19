# Dicionário de Dados — aps-inteligente

> Gerado pelo Reversa Archaeologist em 2026-07-19. Fonte: `models/insulina/tipos.ts` e `interface/calculadora/*`.
> Não há banco de dados: todas as estruturas são efêmeras, em memória, no navegador.

## Tipos primitivos de domínio (unions literais)

| Tipo | Valores | Uso |
|---|---|---|
| `MomentoAfericao` | `jejum`, `antes_almoco`, `antes_jantar`, `ao_deitar` | Quando a glicemia foi medida |
| `MomentoAplicacao` | `antes_cafe`, `antes_almoco`, `antes_jantar`, `ao_deitar` | Quando a insulina é aplicada |
| `NomeInsulina` | `NPH`, `Regular` | Catálogo coberto pela fonte (p. 59) |
| `TipoEsquema` | `basal`, `basal-plus`, `basal-bolus` | Classificação do esquema atual |
| `TipoAlerta` | `HIPOGLICEMIA`, `DOSE_ACIMA_FAIXA_PLENA`, `FRACIONAR_DOSE`, `TETO_POR_APLICACAO`, `INDICACAO_INSULINA` | Severidade decrescente nesta ordem (`SEVERIDADE`, `calculadora.ts:27`) |
| `TipoRecomendacao` | 11 valores (`MANTER_METFORMINA`, `MANTER_SULFONILUREIA`, `SUSPENDER_SULFONILUREIA`, `AFERIR_JEJUM_3X_SEMANA_15_DIAS`, `REPETIR_HBA1C_3_MESES`, `REPETIR_HBA1C_6_MESES`, `AFERIR_PRE_PRANDIAIS`, `AFERIR_POS_PRANDIAL`, `AVALIAR_ENCAMINHAMENTO_ENDOCRINO`, `COMPARTILHAR_CUIDADO_ESPECIALISTA`, `REAVALIAR_EM_3_DIAS`) | Chave de deduplicação das recomendações |
| `CodigoErro` | `PESO_FORA_DE_FAIXA`, `GLICEMIA_FORA_DE_FAIXA`, `HBA1C_FORA_DE_FAIXA`, `HBA1C_OBRIGATORIA`, `ESQUEMA_OBRIGATORIO`, `GLICEMIAS_AUSENTES`, `DOSE_FORA_DE_FAIXA` | Códigos de validação |

## Entidades de entrada

### `EntradaCalculo`

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `modo` | `"inicio" \| "titulacao"` | sim | Despacho da fachada |
| `pesoKg` | `number` | sim | 0 < p ≤ 350 (plausibilidade RF-05) |
| `glicemias` | `GlicemiaAferida[]` | sim (pode ser vazia no modo início) | ≥ 1 no modo titulação |
| `hba1cPercent` | `number` | não | 3–20% se presente; obrigatória no cenário EC-10 |
| `usoSulfonilureia` | `boolean` | não | `undefined` = não informado (início trata como "manter") |
| `esquemaAtual` | `EsquemaInsulina` | só na titulação | Obrigatório e não vazio |

### `GlicemiaAferida` — `valorMgDl: number` (10–1000), `momento: MomentoAfericao`.
### `AplicacaoInsulina` — `insulina: NomeInsulina`, `momento: MomentoAplicacao`, `doseUi: number` (inteira, 1–60).
### `EsquemaInsulina` — `tipo: TipoEsquema`, `aplicacoes: AplicacaoInsulina[]`.

## Entidades de saída

### `SaidaCalculo` (union discriminada por `tipo`)

| Variante | Discriminante | Quando |
|---|---|---|
| `ResultadoInicio` | `tipo: "resultado"`, `modo: "inicio"` | Cálculo de início bem-sucedido |
| `ResultadoTitulacao` | `tipo: "resultado"`, `modo: "titulacao"` | Cálculo de titulação bem-sucedido |
| `ErroValidacao` | `tipo: "erro-validacao"` | Um ou mais ofensores de entrada |
| `ForaDoEscopoDaFonte` | `tipo: "fora-do-escopo"` | Cenário que a fonte não cobre (ex.: insulina fora de NPH/Regular) |

### `ResultadoInicio`

| Campo | Tipo | Observação |
|---|---|---|
| `faixaDoseUi` | `FaixaUi` | Sempre 10–15 UI/dia (constante da fonte) |
| `faixaPorPesoUi` | `FaixaUi` | `round(0,1×kg)`–`round(0,2×kg)` |
| `aplicacaoSugerida` | `{ insulina: "NPH", momento: "ao_deitar" }` | Fixa por tipo |
| `alertas` | `Alerta[]` | Ex.: `INDICACAO_INSULINA` |
| `recomendacoesAoPrescritor` | `Recomendacao[]` | Metformina, sulfonilureia, monitorização |
| `referencias` | `ReferenciaClinica[]` | Sempre ≥ 1 |

### `ResultadoTitulacao`

| Campo | Tipo | Observação |
|---|---|---|
| `esquemaSugerido` | `AplicacaoInsulina[]` | Esquema ajustado completo |
| `doseTotalDiaUi` | `number` | Soma das aplicações |
| `deltaTotalUi` | `number` | Total novo − total anterior (pode ser negativo) |
| `naMeta` | `boolean` | Jejum agregado em 71–129 mg/dL |
| `condutasAlternativas` | `CondutaAlternativa[]` | Opcional; presente só quando há ≥ 1 (fracionamento ⅔+⅓, braço AJ) |
| `alertas` | `Alerta[]` | Ordenados por `SEVERIDADE` |
| `recomendacoesAoPrescritor` | `Recomendacao[]` | Deduplicadas por `tipo` |
| `referencias` | `ReferenciaClinica[]` | Deduplicadas por `localizacao` |

### Estruturas de apoio

| Entidade | Campos | Observação |
|---|---|---|
| `ReferenciaClinica` | `fonteId`, `versaoEdicao`, `localizacao` | `fonteId` sempre `"guia-rapido-dm-sms-rio"`; catálogo congelado em `REFERENCIAS` (20 entradas) |
| `Alerta` | `tipo`, `mensagem`, `referencia` | — |
| `Recomendacao` | `tipo`, `mensagem`, `referencia` | — |
| `CondutaAlternativa` | `rotulo`, `esquemaSugerido`, `referencia` | O motor não escolhe entre condutas equivalentes (AMB-03/AMB-10) |
| `FaixaUi` | `minUi`, `maxUi` | — |
| `Ofensor` | `campo`, `codigo: CodigoErro`, `mensagem` | `campo` usa path notation (ex.: `esquemaAtual.aplicacoes[0].doseUi`) |

## Value objects (invariantes no construtor, `Object.freeze`)

| Classe | Invariante | Violação |
|---|---|---|
| `Peso` | finito, > 0, ≤ 350 kg | `ErroDeInvariante` |
| `Glicemia` | finita, 10–1000 mg/dL | `ErroDeInvariante` |
| `DoseUi` | inteira, 1–60 UI (caneta SUS, R-20/D-08) | `ErroDeInvariante` |

`ErroDeInvariante extends Error` — sinaliza bug interno, nunca fluxo esperado (RNF-05); na UI dispara o painel de falha inesperada (EC-07).

## Constantes clínicas (`CONSTANTES`, `fonte-clinica.ts:73`)

| Constante | Valor | Regra de origem |
|---|---|---|
| `inicioFaixaAbsolutaUi` | 10–15 UI | R-02 (AMB-01) |
| `inicioPorPesoUiPorKg` | 0,1–0,2 | R-02 |
| `limiarIndicacaoHba1cPercent` | 10% | R-04 (AMB-08) |
| `limiarIndicacaoJejumMgDl` | 300 | R-04 |
| `limiarHipoglicemiaMgDl` | 70 | R-05 |
| `metaJejumMgDl` | 71–129 | AMB-02/05 |
| `limiarAumentoMenorMgDl` / `limiarAumentoMaiorMgDl` | 130 / 180 | R-06..R-07 (AMB-09) |
| `ajusteBasalUi` | +4 maior, +2 menor, −4 redução | R-05..R-07 |
| `gatilhoFracionamentoUi` / `gatilhoFracionamentoUiPorKgDia` | 30 UI / 0,4 | R-08 |
| `faixaPlenaUiPorKgDia` | 0,5–1,0 | R-11/R-12 (AMB-04) |
| `metaHba1cPercent` | 7,0% | R-13 |
| `limiarPrePrandialMgDl` | 130 | R-14..R-17 |
| `doseInicialRegularUi` / `ajusteRegularUi` | 4 / 2 UI | R-14..R-19 |
| `dosePorAplicacaoUi` | 1–60 UI | R-20 (D-08) |
| `cadenciaDias` | 3 | Figura 4 |
| `plausibilidade` | peso ≤ 350; glicemia 10–1000; HbA1c 3–20 | RF-05 |

## Estruturas da interface (view models)

| Estrutura | Arquivo | Campos | Uso |
|---|---|---|---|
| `EstadoResultado` | `resultado.tsx:16` | union: `vazio` \| `sucesso{saida}` \| `erro{saida}` \| `falha-inesperada` | Máquina de estados do painel |
| `LinhaGlicemia` | `formulario.tsx:23` | `id`, `valorBruto: string`, `momento` | Linha dinâmica antes do parse |
| `LinhaAplicacao` | `formulario.tsx:29` | `id`, `insulina`, `momento`, `doseBruta: string` | Idem para o esquema |
| `EventoDeErro` | `relator-de-erros.ts:6` | somente `nome: string` | Estruturalmente impede vazar dado clínico |
| `Tema` | `preferencia-de-tema.ts:4` | `"claro" \| "escuro"` | Persistido em `localStorage["aps-inteligente:tema"]` |
| `AjusteEmCurso` | `regra-titulacao-basal.ts:15` | `aplicacoes`, `alertas`, `recomendacoes`, `referencias`, `condutasAlternativas`, `houveAjuste`, `naMeta` | Estado de trabalho compartilhado entre as três regras durante um cálculo |
