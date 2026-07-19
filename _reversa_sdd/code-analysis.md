# Análise de Código — aps-inteligente

> Gerado pelo Reversa Archaeologist em 2026-07-19.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA
> Módulos analisados: `models/insulina`, `interface/calculadora`, `pages`.

## Visão de conjunto

🟢 O sistema é uma **calculadora de apoio à decisão para insulinização no DM2**, 100% client-side, cuja fonte clínica única é o *Guia Rápido Diabetes Mellitus — SMS-Rio, 2.ª ed. atualizada, 2023*. A arquitetura tem três camadas com dependência unidirecional:

```
pages (shell Next.js) → interface/calculadora (React) → models/insulina (domínio puro)
```

🟢 O domínio não importa React, Next nem biblioteca externa alguma — apenas TypeScript puro. Toda saída clínica carrega referência à fonte (`ReferenciaClinica`), e erros esperados são **valores** (union types), nunca exceções; exceção (`ErroDeInvariante`) é reservada a bug interno.

🟢 O código referencia uma rastreabilidade rica de specs anteriores: identificadores `RF-xx`, `RN-xx`, `RNF-xx`, `EC-xx`, `R-01..R-20`, `AMB-01..10`, `MD-xxxx`, `NG-xx`, apontando para `_reversa_sdd/sdd/motor-calculo-insulina.md` (v2.0) e `_reversa_forward/001-calculadora-insulina-dm2/requirements.md` — 🔴 esses artefatos não existem no working tree atual (foram removidos na refundação); os comentários são o único vestígio.

---

## Módulo 1 — `models/insulina` (domínio)

**Propósito:** motor de cálculo de insulina DM2 — início de insulinização, titulação basal, fracionamento e intensificação — com validação defensiva e rastreabilidade clínica por resultado.

### Arquitetura interna

| Arquivo | Papel |
|---|---|
| `tipos.ts` | Contratos (interfaces readonly), unions discriminadas de saída e value objects com invariantes |
| `fonte-clinica.ts` | Catálogo imutável de referências (`REFERENCIAS`) e constantes clínicas (`CONSTANTES`) |
| `validacao.ts` | Validação de entrada com coleta de todos os ofensores + detecção de fora-de-escopo |
| `regra-inicio.ts` | `RegraInicio` — modo início |
| `regra-titulacao-basal.ts` | `RegraTitulacaoBasal` — titulação da NPH pelo jejum + fracionamento |
| `regra-intensificacao.ts` | `RegraIntensificacao` — braços AA/AJ/AD e titulação da Regular |
| `calculadora.ts` | `CalculadoraInsulinaDM2` — fachada que orquestra o pipeline |

🟢 **Padrões:** Facade (`CalculadoraInsulinaDM2`), Strategy informal (três regras compostas sobre o estado mutável `AjusteEmCurso`), Value Objects (`Peso`, `Glicemia`, `DoseUi` com `Object.freeze` e invariante no construtor), Result type (union `SaidaCalculo = ResultadoCalculo | ErroValidacao | ForaDoEscopoDaFonte`).

### Fluxo de controle da fachada (`calculadora.ts:52`)

1. `validarEntrada` — coleta **todos** os ofensores; se houver algum, retorna `erro-validacao` (`calculadora.ts:53-56`).
2. `motivoForaDoEscopo` — insulina fora do catálogo NPH/Regular → `fora-do-escopo` com orientação (`calculadora.ts:58-66`).
3. `new Peso(...)` — invariante de plausibilidade.
4. Despacho por modo: `inicio` → `RegraInicio.calcular`; `titulacao` → pipeline `RegraTitulacaoBasal.aplicar` → `fracionarSeIndicado` → `RegraIntensificacao.aplicar` (`calculadora.ts:90-92`).
5. Pós-processamento: alerta de faixa plena (> 1,0 UI/kg/dia), recomendação de reavaliar em 3 dias se houve ajuste, invariante `DoseUi` por aplicação, ordenação de alertas por severidade fixa (`SEVERIDADE`, `calculadora.ts:27-33`), deduplicação de recomendações (por `tipo`) e referências (por `localizacao`).

### Algoritmos e regras embutidas

**Início (`regra-inicio.ts`)** 🟢
- Alerta `INDICACAO_INSULINA` quando HbA1c ≥ 10% **ou** jejum ≥ 300 mg/dL.
- Recomendações: manter metformina; manter sulfonilureia (exceto se `usoSulfonilureia === false` — ausência de informação conta como "manter"); aferir jejum 3×/semana por 15 dias.
- Devolve **faixa**, nunca dose única (decisão AMB-01): absoluta 10–15 UI/dia e por peso `Math.round(0,1..0,2 × kg)`; sugestão fixa NPH ao deitar.

**Titulação basal (`regra-titulacao-basal.ts`)** 🟢
- Agrega glicemias de jejum por **média**, mas hipoglicemia (qualquer valor ≤ 70) **prevalece** sobre a média (AMB-06).
- Tabela de ajuste: hipo → −4 UI + alerta; média ≥ 180 → +4; média ≥ 130 → +2; 71–129 → na meta, delta 0.
- O ajuste incide na **NPH "mais noturna"** — primeira encontrada na ordem `ao_deitar → antes_jantar → antes_almoco → antes_cafe` (`indiceDaNphNoturna`). Esquema sem NPH: jejum não titula nada.
- `contemDoseLimitada` — clamp de qualquer dose em 1–60 UI (limite físico da caneta SUS), com alerta `TETO_POR_APLICACAO` quando o clamp atua.
- **Fracionamento** (gatilho: NPH única > 30 UI **ou** > 0,4 UI/kg/dia): principal ½ café (`Math.ceil(total/2)`) + ½ ao deitar; alternativa rotulada ⅔ café (`Math.round(2total/3)`) + ⅓ ao deitar (AMB-10). Ao fracionar com sulfonilureia em uso explícito: recomendar suspendê-la; sempre manter metformina.

**Intensificação (`regra-intensificacao.ts`)** 🟢
- Gate de HbA1c (R-13/R-18): HbA1c ≤ 7% sem Regular → manter conduta, repetir HbA1c em 6 meses (só se nada foi ajustado antes); com Regular → ajustar e avaliar encaminhamento ao endócrino. HbA1c > 7% → pode iniciar Regular; sem pré-prandiais aferidas → recomendar aferir AA/AJ/AD e parar. HbA1c ausente: só prossegue se já intensificado **e** com pré-prandiais (recomendando repetir HbA1c em 3 meses); caso contrário retorna silenciosamente (a validação já exigiu HbA1c no cenário EC-10).
- Três braços com mapeamento aferição→aplicação deslocado (R-14..R-17): AA (aferida antes do almoço) → Regular antes do **café**; AJ (antes do jantar) → Regular antes do **almoço**; AD (ao deitar) → Regular antes do **jantar**.
- Por braço: hipo ≤ 70 → alerta + reduzir Regular −2 se existir; média < 130 → manter; média ≥ 130 com Regular existente → +2; sem Regular e gate aberto → iniciar Regular 4 UI.
- **Caso especial AJ (AMB-03):** se existe NPH antes do café, o guia oferece duas condutas equivalentes — o motor **não escolhe**: devolve ambas como `condutasAlternativas` (aumentar NPH do café +2 vs. iniciar Regular 4 UI antes do almoço).
- **NG-07:** intensificado, HbA1c acima da meta e nada ajustado → recomendar aferição pós-prandial, explicitando que o guia não parametriza esse ajuste.

**Validação (`validacao.ts`)** 🟢
- Coleta **todos** os ofensores (nunca para no primeiro): peso (0 < p ≤ 350), glicemias (10–1000), HbA1c se presente (3–20), e no modo titulação: esquema obrigatório e não vazio, doses inteiras 1–60, ao menos uma glicemia, e **EC-10**: pré-prandiais + esquema sem Regular exigem HbA1c.
- Defesa em profundidade: o motor revalida tudo, sem confiar na UI (EC-08).

### Metadados e configuração

🟢 Todas as constantes clínicas vivem em `CONSTANTES` (`fonte-clinica.ts:73-108`), congeladas e comentadas com o R-xx/AMB-xx de origem. Não há feature flags nem parâmetros de ambiente — coerente com o design determinístico e client-side.

**Complexidade:** média-alta (lógica clínica ramificada, mas bem fatorada; nenhuma função > 50 linhas exceto `aplicarBraco` ~90 e o gate `aplicar` ~70 da intensificação).

---

## Módulo 2 — `interface/calculadora` (apresentação)

**Propósito:** UI React da calculadora — formulário controlado, painel de resultado com ritual de revisão explícita e infraestrutura mínima de tema e relato de erros. Nenhuma regra clínica própria: as faixas de validação vêm de `CONSTANTES` do domínio.

### Componentes e fluxo

| Arquivo | Papel |
|---|---|
| `tela.tsx` | Moldura: cabeçalho, selo "Nada é salvo nem enviado", alternador de tema |
| `calculadora-app.tsx` | Contêiner com o estado `EstadoResultado` e o ciclo calcular/invalidar/limpar |
| `formulario.tsx` | Formulário controlado com linhas dinâmicas e validação no blur |
| `resultado.tsx` | Painel de resultado em ordem fixa: alertas → dose → fonte → revisão → disclaimer |
| `preferencia-de-tema.ts` | Tema claro/escuro via `useSyncExternalStore` sobre localStorage |
| `relator-de-erros.ts` | Contrato `RelatorDeErros`; única implementação é nula (fase 1, MD-0010) |

🟢 **Máquina de estados do resultado** (`EstadoResultado`): `vazio → sucesso | erro | falha-inesperada`, com flags ortogonais `desatualizado` (qualquer edição no formulário invalida o resultado vigente — RN-06/EC-03) e `revisaoConfirmada` (checkbox "Revisei a dose e a fonte" que habilita o bloco "Pronto para prescrever"; edição posterior desmarca e desabilita).

🟢 **Falha inesperada (EC-07):** exceção fora do contrato do motor → painel honesto ("Não prescreva a partir desta tela") + evento anônimo ao `RelatorDeErros` contendo **somente o nome da classe do erro** — o tipo `EventoDeErro` torna estruturalmente impossível vazar payload clínico.

🟢 **"Novo cálculo"** remonta o formulário via `key={geracaoFormulario}` (RF-10) — reset por reconstrução, não por limpeza campo a campo.

🟢 **Privacidade por construção (RN-02):** nenhum fetch, nenhum storage de dados clínicos; o único localStorage é a preferência de tema (`aps-inteligente:tema`), com degradação graciosa se bloqueado.

### Validação da UI (espelho do motor)

🟢 `formulario.tsx` valida no blur com as **mesmas faixas** do domínio (importa `CONSTANTES`): peso, glicemia, HbA1c opcional, dose inteira 1–60. `interpretaDecimal` aceita vírgula ou ponto (EC-01). `derivaTipoEsquema` classifica o esquema por contagem de Regular: 0 → `basal`, 1 → `basal-plus`, ≥ 2 → `basal-bolus`.

🟡 **Ponto de atenção:** `let proximoId = 1` é módulo-global mutável (`formulario.tsx:114`) — ids de linhas dinâmicas sobrevivem entre remontagens; funcional, mas estado global em módulo React é frágil sob HMR/StrictMode.

⚠️ `formulario.tsx` tem 532 linhas — acima do limite de 400 do mantenedor; candidato a extração de subcomponentes (linha de glicemia, linha de aplicação).

**Complexidade:** média.

---

## Módulo 3 — `pages` (shell Next.js)

**Propósito:** casca mínima do Pages Router.

🟢 `_app.tsx` — carrega fontes IBM Plex Sans (texto) e IBM Plex Mono (números clínicos, variável `--fonte-dados`) via `next/font`, importa o CSS global e envolve tudo em `.app-raiz`.
🟢 `_document.tsx` — `<Html lang="pt-BR">`.
🟢 `index.tsx` — metadados (title/description enfatizando "nada é salvo nem enviado") e monta `TelaCalculadora`.
🔴 `pages/api/v1/index.js` — **vazio**. Rota `/api/v1` declarada sem handler; requisições a ela falham. Intenção futura de API não realizada (par com `tests/integration/api/v1/index.js`, também vazio).

**Complexidade:** baixa.

---

## Testes (contexto para o Detetive)

🟢 7 suítes de unidade cobrem o domínio (início, titulação, intensificação, validação, tipos, invariantes com **fast-check**, referências) com threshold de 90% em `models/**`; 3 suítes de integração cobrem formulário, resultado e relator via Testing Library; `tests/apoio/construtores.ts` fornece builders. A suíte de invariantes por propriedade sugere contratos fortes: toda saída referenciada, doses sempre realizáveis, determinismo.

## Síntese de riscos e lacunas

1. 🔴 Specs referenciadas nos comentários (`motor-calculo-insulina.md` v2.0, requirements da feature 001) não existem mais no repo — esta re-extração os reconstruirá.
2. 🔴 Rota de API vazia e scripts de teste quebrados (`test:api`, `test:e2e`) — dívida declarada.
3. 🟡 Memória do projeto registra **quatro divergências clínicas aprovadas no design que ainda não existem no domínio** — o Detetive deve compará-las com o código atual.
4. 🟡 `proximoId` global em `formulario.tsx`; arquivos acima de 400 linhas (`formulario.tsx`, `globais.css`).
