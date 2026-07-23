# Análise de Código — aps-inteligente

> Regenerado pelo Reversa Archaeologist em 2026-07-23 (**re-extração nº 3** — absorve as features 011–014 sobre a base 001–010).
> Delta desta passagem: novo domínio `models/risco-cardiovascular` (PCE, feature 014) e tela `interface/risco-cardiovascular`; cabeçalho refatorado em `interface/comum` e `interface/estilos` (features 011/013). Os três domínios anteriores permanecem intocados (reconfirmados por leitura).
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA
> Módulos: `models/insulina`, `models/gestacao`, `models/cardiopatia-isquemica`, `models/risco-cardiovascular`, `interface/comum`, `interface/calculadora`, `interface/gestacao`, `interface/cardiologia`, `interface/risco-cardiovascular`, `interface/inicio`, `interface/estilos`, `pages`, `pages/api/v1/status`, `infra`.

## Visão de conjunto

🟢 O sistema é uma **plataforma de calculadoras clínicas de apoio à decisão para a Atenção Primária à Saúde**, 100% client-side no cálculo clínico. Nasceu como calculadora única de insulinização no DM2 e, pelas features 007, 010 e 014, tornou-se uma plataforma guarda-chuva com **quatro domínios clínicos independentes**, cada um com **uma fonte clínica única** (padrão do ADR 0001):

| Domínio | Calculadora | Fonte única | Feature |
|---|---|---|---|
| `models/insulina` | Insulina DM2 (início, titulação, intensificação) | Guia Rápido Diabetes Mellitus — SMS-Rio, 2.ª ed. atualizada, 2023 | 001+ |
| `models/gestacao` | Idade gestacional, DPP, trimestre (DUM × USG) | Guia Rápido Pré-Natal — SMS-Rio, 4.ª ed., 2025 | 007 |
| `models/cardiopatia-isquemica` | Dor torácica e probabilidade pré-teste de DAC | TeleCondutas — Cardiopatia Isquêmica, TelessaúdeRS-UFRGS, 2017 | 010 |
| `models/risco-cardiovascular` | Risco de ASCVD em 10 anos (Pooled Cohort Equations) | 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk (Goff et al., 2014) | 014 |

🟢 A arquitetura tem **três camadas com dependência estritamente unidirecional**:

```
pages (shell Next.js, rotas, PWA)
  → interface/* (React + Primer: telas, formulários, painéis, home)
    → models/* (três domínios puros, TypeScript sem framework)
infra (pool pg) — usada SÓ pelo healthcheck /api/v1/status; nunca toca dado clínico
```

🟢 **Invariantes arquiteturais compartilhados pelos três domínios** (o que os torna reconhecíveis como "família"):
1. **Domínio puro:** nenhum `import` de React, Next ou biblioteca externa; só TypeScript (ADR 0003).
2. **Erros esperados são valores** (union discriminada por `tipo`), nunca exceção; exceção (`ErroDeInvariante`) é reservada a bug interno (ADR 0004).
3. **Toda saída carrega referência clínica** (`ReferenciaClinica`); resultado sem referência é invariante violado (property-based verifica).
4. **Coleta total de ofensores** na validação: nunca para no primeiro erro (regra 15 do `domain.md`).
5. **Constantes clínicas congeladas** (`Object.freeze`) em `fonte-clinica.ts`, comentadas com o RN/Quadro de origem — fonte numérica única anti-drift.
6. **O motor informa, não escolhe** entre condutas clinicamente equivalentes (ADR 0005): insulina devolve `condutasAlternativas`; gestação devolve `veredito` de comparação, não a datação vencedora.

🟢 **Privacidade por construção:** nenhum domínio nem tela faz `fetch` ou `storage` de dado clínico. O único `localStorage` é a preferência de tema (`aps-inteligente:tema`). O único acesso a rede é o healthcheck `/api/v1/status`, que não recebe nem devolve dado clínico. O `EventoDeErro` do relator carrega **somente o nome da classe** do erro — vazamento de payload clínico é estruturalmente impossível.

---

# Camada de Domínio (`models/`)

## Módulo 1 — `models/insulina` 🟢

**Propósito:** motor de cálculo de insulina DM2 — início de insulinização, titulação basal, fracionamento, intensificação e regra transversal de antidiabéticos orais — com validação defensiva e rastreabilidade clínica por resultado.

### Arquitetura interna

| Arquivo | Papel |
|---|---|
| `tipos.ts` | Contratos readonly, unions discriminadas de saída, value objects com invariante (`Peso`, `Glicemia`, `DoseUi`) |
| `fonte-clinica.ts` | Catálogo imutável `REFERENCIAS` + constantes clínicas `CONSTANTES` |
| `validacao.ts` | Coleta total de ofensores + `motivoForaDoEscopo` (insulina fora de NPH/Regular) |
| `regra-inicio.ts` | `RegraInicio` — modo início |
| `regra-titulacao-basal.ts` | `RegraTitulacaoBasal` — titulação da NPH pelo jejum + fracionamento |
| `regra-intensificacao.ts` | `RegraIntensificacao` — braços AA/AJ/AD e titulação da Regular |
| `regra-metformina.ts` | `RegraMetformina` — antidiabéticos orais (metformina × TFG), transversal aos dois modos |
| `calculadora.ts` | `CalculadoraInsulinaDM2` — fachada que orquestra o pipeline |

🟢 **Padrões:** Facade (`CalculadoraInsulinaDM2`), Strategy informal (regras compostas sobre o estado mutável `AjusteEmCurso`), Value Objects (`Peso`/`Glicemia`/`DoseUi` com `Object.freeze` + invariante no construtor), Result type (`SaidaCalculo = ResultadoCalculo | ErroValidacao | ForaDoEscopoDaFonte`).

### Fluxo da fachada (`calculadora.ts:69`)
1. `validarEntrada` — coleta todos os ofensores → `erro-validacao` se houver.
2. `motivoForaDoEscopo` — insulina fora do catálogo NPH/Regular → `fora-do-escopo` com orientação.
3. `new Peso(...)` — invariante de plausibilidade.
4. Despacho por modo: `inicio` → `RegraInicio.calcular` + `comAntidiabeticosOrais`; `titulacao` → pipeline `RegraTitulacaoBasal.aplicar` → `fracionarSeIndicado` → `suspenderSulfonilureiaSeJaFracionado` → `RegraIntensificacao.aplicar` → `RegraMetformina.avaliar`.
5. Pós: alerta de faixa plena (> 1,0 UI/kg/dia → alerta + compartilhamento de cuidados), reavaliar em 3 dias se houve ajuste, invariante `DoseUi` por aplicação, ordenação de alertas por `SEVERIDADE` (HIPOGLICEMIA=0 … METFORMINA_NAO_OTIMIZADA=5), deduplicação de recomendações (por `tipo`) e referências (por `localizacao`).

### Regras embutidas (inalteradas na re-extração, exceto onde marcado)
- **Início:** alerta `INDICACAO_INSULINA` quando HbA1c ≥ 10% **ou** jejum ≥ 300; devolve **faixa** (10–15 UI/dia e 0,1–0,2 UI/kg), nunca dose única (AMB-01); sugestão fixa NPH ao deitar; manter metformina/sulfonilureia; aferir jejum 3×/semana por 15 dias.
- **Titulação basal:** agrega jejum por **média**, mas hipoglicemia (≤ 70) **prevalece** (AMB-06); tabela hipo→−4/≥180→+4/≥130→+2/71–129→delta 0; incide na NPH "mais noturna"; clamp físico 1–60 UI (`TETO_POR_APLICACAO`); **fracionamento** (NPH única > 30 UI **ou** > 0,4 UI/kg): ½ café + ½ deitar (principal) e ⅔/⅓ (alternativa, AMB-10).
- **Intensificação:** gate de HbA1c (R-13/R-18); três braços com mapeamento aferição→aplicação deslocado (AA→café, AJ→almoço, AD→jantar); **caso AJ (AMB-03):** duas condutas equivalentes devolvidas como `condutasAlternativas` (o motor não escolhe); **NG-07** pós-prandial.
- 🟢 **`regra-metformina.ts` (feature 005 — MUDANÇA sobre a extração 1):** a regra de antidiabéticos orais, antes embutida, foi extraída para arquivo próprio e reordenada. Precedência clínica: `SUSPENDER_METFORMINA_TFG` quando TFG < 30; `REDUZIR_METFORMINA_TFG` quando 30 ≤ TFG ≤ 45; e o alerta `METFORMINA_NAO_OTIMIZADA` (otimizar dose) é **suprimido** quando a TFG está em faixa de ajuste renal (`!tfgEmFaixaDeAjuste`) — "otimizar" contradiria a conduta renal do próprio guia. A fachada ainda remove `MANTER_METFORMINA` quando há suspensão (`semManterMetforminaSeSuspensa`).

**Complexidade:** média-alta. **Nenhum arquivo > 400 linhas** (maior: `regra-intensificacao.ts`, 250).

---

## Módulo 2 — `models/gestacao` 🟢 (feature 007)

**Propósito:** datação gestacional pura — idade gestacional (IG), data provável do parto (DPP por Naegele) e trimestre, a partir de DUM, ultrassom, ou **ambos** (entrada dupla arbitrada pela margem da USG).

### Arquitetura interna

| Arquivo | Papel |
|---|---|
| `tipos.ts` | Contratos; `SaidaDatacao = ResultadoDatacao \| ErroValidacao`; `VereditoComparacao` |
| `datas.ts` | Aritmética de datas civis em **dias epoch UTC** (sem fuso local); data inválida é `null` |
| `datacao.ts` | Regras puras: `igEntre`, `dppPorNaegele`, `dumEquivalente`, `trimestreDaIg` |
| `validacao.ts` | Coleta total de ofensores (DUM futura, > 44 sem, exame futuro, laudo fora de faixa, USG incompleta, nenhuma datação) |
| `fonte-clinica.ts` | `REFERENCIAS` (pp. 31–32, 113) + `CONSTANTES` + `TEXTO_NOTAS` |
| `calculadora.ts` | `CalculadoraIdadeGestacional` — fachada |

🟢 **Decisão de projeto central (D-02):** toda a aritmética de datas roda sobre `Date.UTC` convertido a dias epoch inteiros — fusos e horário de verão tornariam "diferença de dias" ambígua. `paraDiasEpoch` rejeita calendário impossível (ex.: 30 de fevereiro) devolvendo `null`, nunca normalizando em silêncio.

### Algoritmos (`datacao.ts`)
- **IG (RN-01, p. 31):** `Math.floor(dias/7)` semanas + `dias % 7` dias, entre DUM e data de referência.
- **DPP (RN-02, p. 32, regra de Naegele — D-03):** `somarMeses(somarDias(dum, +7), +9)` — calendárica, dia excedente transborda ao mês seguinte.
- **DUM equivalente do USG (RN-03):** `dataExame − (semanas×7 + dias)`.
- **Trimestre (RN-04, premissa 🟡):** cortes convencionais **13+6 / 27+6** (`< 14×7` → 1.º; `< 28×7` → 2.º; senão 3.º). O guia usa os trimestres sem defini-los numericamente.

### Comparação DUM × USG (`calculadora.ts:127`) — RN-11, D-04/D-05
🟢 Com as duas datações presentes, o motor compara pela **margem do trimestre no dia do exame**: 7 dias no 1.º trimestre, 14 no 2.º; **o 3.º trimestre não tem parâmetro na fonte** → veredito `sem-parametro-na-fonte`. Se a diferença excede a margem → `dum-fora-da-margem` (a USG passa a referência, conforme a fonte); senão → `dum-confirmada`. O motor **informa o veredito, não escolhe** a datação (ADR 0005).

🟡 **Premissas a validar pelo prescritor** (herdadas do roadmap 007): cortes de trimestre 13+6/27+6, limites de plausibilidade (DUM ≤ 44 sem, laudo 0–42 sem e 0–6 dias).

**Data de referência:** injetada pela UI (data do dispositivo); o motor **não lê o relógio** (RN-07). **Complexidade:** média.

---

## Módulo 3 — `models/cardiopatia-isquemica` 🟢 (feature 010)

**Propósito:** classificar a dor torácica pelas três características do Quadro 1, estimar a probabilidade pré-teste de DAC pelo Quadro 2 (matriz 24 células), ajustar por fatores de risco, traduzir em conduta de investigação e advertir na angina instável.

### Arquitetura interna

| Arquivo | Papel |
|---|---|
| `tipos.ts` | Contratos; `SaidaAvaliacao = ResultadoAvaliacao \| ForaDoEscopoDaFonte \| EntradaInvalida` |
| `classificacao.ts` | `classificarDor` — conta as 3 características (3→típica, 2→atípica, ≤1→não anginosa) |
| `probabilidade.ts` | `faixaEtariaDe`, `probabilidadeBasePct`, `ajustarPorFatoresDeRisco`, `estratoDe` |
| `conduta.ts` | `exameRecomendado`, `condutaPara`, `advertenciasPara` |
| `validacao.ts` | Coleta total de ofensores (idade, sexo, fator de risco desconhecido) |
| `fonte-clinica.ts` | `REFERENCIAS` + `PROBABILIDADE_PRE_TESTE` (matriz congelada) + `CONSTANTES` + `CAUSAS_NAO_CARDIACAS` + textos |
| `calculadora.ts` | `CalculadoraCardiopatiaIsquemica` — fachada |

### Algoritmos e regras
- 🟢 **Classificação (RN-01, Quadro 1):** contagem booleana das 3 características → `tipica`/`atipica`/`nao-anginosa`.
- 🟢 **Probabilidade-base (RN-02, Quadro 2):** lookup na matriz congelada `PROBABILIDADE_PRE_TESTE[classificacao][sexo][faixaEtaria]` — **24 células** (3 classes × 2 sexos × 4 faixas), transcrição fiel de DUNCAN et al., 2013. Faixas etárias `30-39`/`40-49`/`50-59`/`60-69`.
- 🟢 **Ajuste por fatores de risco (RN-03, nota * do Quadro 2, D-03):** sem fator → sem ajuste (`undefined`); com ≥ 1 fator → faixa `base×2`–`base×3`, capada em **99%** (`PCT_MAX_EXIBIVEL`) para não exibir > 100%; `excedeAlta` sinaliza extremo > 90% (redação ">90%").
- 🟢 **Estrato (RN-04, nota ** do Quadro 2):** decisão descritiva, não puramente numérica — `"baixa"` ⟺ dor **não anginosa E sem fatores** (uma dor não anginosa pode tabelar até 27%, mas a conduta "não investigar" vem da descrição clínica); `"alta"` ⟺ probabilidade efetiva > 90% (base sem fatores, ou piso da faixa com fatores); o resto é `"intermediaria"`. **Qualquer fator de risco impede o estrato "baixa".**
- 🟢 **Conduta (RN-04/RN-05):** `baixa` → exame não indicado + causas não cardíacas; `intermediaria` → exame não invasivo; `alta` → estratificação + encaminhamento. O exame padrão é **ergometria**, salvo `impedimentoErgometria` (ECG basal altera interpretação ou paciente não pode exercitar) → **método não invasivo alternativo**.
- 🟢 **Fora de escopo (RN-06):** idade plausível (0–120, ofensor de validação) mas fora de **30–69** → `ForaDoEscopoDaFonte` com `IDADE_FORA_DA_TABELA`, **sem número estimado** — recusa honesta em vez de extrapolar.
- 🟢 **Advertência (RN-07):** `sinaisInstabilidade` → `Advertencia` de angina instável (encaminhamento emergencial, fora do fluxo eletivo).

**Complexidade:** média (lógica ramificada, bem fatorada em 6 arquivos pequenos). **Sem ritual de revisão na tela** (D-08): estratificar não é prescrever dose.

---

## Módulo 4 — `models/risco-cardiovascular` 🟢 (feature 014)

**Propósito:** estimar o risco de doença cardiovascular aterosclerótica (ASCVD) "hard" em 10 anos pelas **Pooled Cohort Equations** (Goff et al., 2013), classificar em categoria de risco e informar a limitação de transportabilidade — sem emitir conduta (ADR 0005). Quarto membro da "família" de domínios: mesmos seis invariantes arquiteturais.

### Arquitetura interna

| Arquivo | LOC | Papel |
|---|---|---|
| `tipos.ts` | 109 | Contratos; `SaidaEstimativa = ResultadoEstimativa \| ForaDoEscopoDaFonte \| EntradaInvalida`; `Aviso` (clamp) distinto de `Ofensor` (validação) |
| `equacao.ts` | 56 | `grupoDe(sexo,raca)` + `riscoAscvdPct(grupo,v)` — núcleo de Cox log-linear (função pura) |
| `categoria.ts` | 12 | `categoriaDe(riscoPct)` — cortes 5 / 7,5 / 20% |
| `elegibilidade.ts` | 39 | `foraDoEscopo` — DCV prévia ou idade fora de 40–79 → `ForaDoEscopoDaFonte` |
| `validacao.ts` | 163 | Coleta total de ofensores + `clamparEntrada` (faixa fisiológica → `Aviso`) |
| `fonte-clinica.ts` | 168 | `COEFICIENTES` (4 modelos), `BASELINE_SURVIVAL`, `MEANS`, `FAIXAS`, `CATEGORIAS`, `REFERENCIAS`, `NOTA_PROVENIENCIA` — tudo `Object.freeze` |
| `calculadora.ts` | 53 | `CalculadoraRiscoCardiovascular.estimar` — fachada: validar → escopo → clamp → equação → categoria |

### Algoritmos e regras
- 🟢 **Equação PCE (RF-06/RN-03/RN-05):** `Risco₁₀ = 1 − S₀^exp(Σ(β·X) − mean_grupo)`. Variáveis contínuas (idade, colesterol total, HDL, PAS) entram como **logaritmo natural**, com termos de interação `ln(idade)×X`; a PAS entra por **um** de dois coeficientes mutuamente exclusivos (tratada × não-tratada). Quatro modelos de Cox sexo×raça (`homem-branco`, `homem-negro`, `mulher-branca`, `mulher-negra`), estrutura de coeficientes uniforme (termo ausente = 0).
- 🟢 **Grupo PCE (RN-05, D-05):** `raca="outra"` adota os coeficientes de **branco**, como o ASCVD Risk Estimator Plus oficial; só `afro-americano` usa o modelo negro.
- 🟢 **Precisão dos coeficientes:** `BASELINE_SURVIVAL`, `MEANS` e o modelo de mulher-negra em **precisão estendida** validada contra os pacotes R `CVrisk` e `PooledCohort` (investigation §4.1). Nota explícita no código: o `mean` de homens negros é 19.5425 (o requirements citou de memória um valor trocado, corrigido em D-04).
- 🟢 **Dois níveis de entrada inválida (D-07):** ofensor **trava** (sexo/raça inválidos, idade não-inteira ou fora de 0–120, valor não positivo — coleta total, RN-08); valor fora da faixa fisiológica **não trava** — é **clampado** ao limite e sinalizado por `Aviso` com a direção do viés ("pode subestimar/superestimar o risco"). Faixas: colesterol 130–320, HDL 20–100, PAS 90–200 mg/dL·mmHg.
- 🟢 **Fora de escopo (RF-05/RN-02, D-06):** DCV prévia (prevenção secundária) ou idade fora de **40–79** → `ForaDoEscopoDaFonte` com motivo distinto (`DCV_PREVIA` / `IDADE_FORA_DA_FAIXA`), sem número — recusa honesta, mesmo molde da cardiopatia.
- 🟢 **Categoria (RF-07):** cortes do 2019 ACC/AHA Primary Prevention — `baixo` < 5%, `limítrofe` 5–<7,5%, `intermediário` 7,5–<20%, `alto` ≥ 20%.
- 🟢 **Proveniência (RF-10/RN-09, D-09):** `NOTA_PROVENIENCIA` é texto único congelado no domínio — coorte dos EUA, categorias raciais norte-americanas, sem calibração para o Brasil. Anti-drift: a tela lê essa constante, não duplica o texto.

**Complexidade:** média-alta na `equacao.ts` (aritmética densa, mas linear e pura). **Sem ritual de revisão** (D-08): estimar risco não prescreve dose.

---

# Camada de Interface (`interface/`)

## Módulo 5 — `interface/comum` 🟢 (features 007, 011, 013)

🟢 **`moldura.tsx` (`Moldura`)** — casca visual comum das quatro telas + home, extraída byte a byte da tela da insulina na feature 007. Renderiza cabeçalho (identidade + logo APSi por tema), selo "Nada é salvo nem enviado" e a barra de ações (via `useSyncExternalStore` sobre `preferencia-de-tema`). Props opcionais acumuladas por feature:
- `apresentacao?: "padrao" | "destaque"` (feature 008) — só CSS via `data-apresentacao`; a home usa `destaque`.
- `logoComoTitulo?: boolean` (feature 009) — na home, a logo é uma `<img alt={titulo}>` **dentro** do `h1` (nome acessível preservado); nas calculadoras, a logo é marca decorativa (`aria-hidden`, `alt=""`) fora do heading, sem criar segundo `h1` nem link.

🟢 **Cabeçalho refatorado (features 011/013, ajuste de 23/07):**
- O alternador de tema deixou de ser botão textual e virou **`IconButton` do tema-alvo** — `SunIcon` quando o tema vigente é escuro (acionar clareia), `MoonIcon` quando é claro —, com nome acessível "Ativar tema claro/escuro" (D-01/D-02).
- Novo **comando de início** (`IconButton as={Link} href="/"`, `HomeIcon`) na barra de ações, renderizado **só quando `logoComoTitulo` é falso** — isto é, nas calculadoras, nunca na home, onde seria redundante (D-03/D-04). É o único link do cabeçalho da calculadora (a logo segue não-link).
- O **selo de privacidade** saiu da barra de ações e desceu para a zona de identidade, sob o subtítulo, agora com `ShieldLockIcon` (`className="cabecalho-selo"`). Só apresentação: mesmo texto e nome acessível; a barra de ações fica coesa com os dois botões irmãos (início + tema).
- Proporções do cabeçalho `padrao` alinhadas à coluna do corpo e à logo da home (feature 013) — só CSS em `cabecalho.css`, `moldura.tsx` intocado nessa parte.

🟡 **Nota de dívida (comentada no próprio arquivo):** `preferencia-de-tema.ts` permanece em `interface/calculadora/` porque o provedor e sua suíte apontam para lá; realocação adiada para re-extração futura. Acoplamento residual `comum → calculadora`.

## Módulo 6 — `interface/calculadora` 🟢 (insulina; features 004–006)

**Propósito:** UI da calculadora de insulina — formulário controlado, painel com **ritual de revisão explícita** e o botão **Copiar plano** (feature 006). Nenhuma regra clínica própria; faixas de validação vêm de `CONSTANTES` do domínio.

| Arquivo | Papel |
|---|---|
| `tela.tsx` | Composição fina: `Moldura` + `CalculadoraApp` (nenhum estado clínico) |
| `calculadora-app.tsx` | Contêiner com `EstadoResultado` e ciclo calcular/invalidar/limpar |
| `formulario.tsx` | Formulário controlado com linhas dinâmicas, validação no blur (313 linhas — abaixo do teto) |
| `resultado.tsx` | Painel em ordem fixa: alertas → dose → fonte → revisão → disclaimer (353 linhas) |
| `esquema-atual.tsx`, `glicemias-por-momento.tsx`, `antidiabeticos-orais.tsx` | Subcomponentes do formulário |
| `agrupar-recomendacoes.ts`, `rotulos.ts` | Extração anti-drift de rótulos e hierarquia de recomendações |
| `formatar-plano.ts` | 🟢 (feature 006) projeta `ResultadoCalculo` → texto do Plano: esquema/dose → recomendações → fonte → linha de contexto. Alertas e condutas alternativas **ficam fora** (D-04) |
| `area-de-transferencia.ts` | 🟢 (feature 006) adaptador de clipboard com **erro como valor** (`{ok:false}` em contexto inseguro/permissão negada) |
| `preferencia-de-tema.ts`, `provedor-tema.tsx` | Tema claro/escuro via `useSyncExternalStore` sobre localStorage |
| `relator-de-erros.ts` | Contrato `RelatorDeErros`; única implementação é a nula (fase 1) |
| `erro-de-campo.tsx`, `validacao-campos.ts` | Mensagem de erro por campo + espelho da validação |

🟢 **Máquina de estados** (`EstadoResultado`): `vazio → sucesso | erro | falha-inesperada`, com flags ortogonais `desatualizado` (qualquer edição invalida o resultado vigente) e `revisaoConfirmada` (checkbox "Revisei a dose e a fonte" habilita o bloco "Pronto para prescrever" com o botão **Copiar plano**; edição posterior desmarca). O `AcaoCopiarPlano` só monta com `revisaoValida`; o desmonte na invalidação zera o retorno por construção.
🟢 **Falha inesperada (EC-07):** exceção fora do contrato → painel honesto + evento anônimo (só nome da classe).
🟡 **Ponto de atenção residual:** `let proximoId` módulo-global mutável para ids de linhas dinâmicas — frágil sob HMR/StrictMode, funcional.

## Módulo 7 — `interface/gestacao` 🟢 (feature 007)

🟢 Molde do `calculadora-app` da insulina, **sem ritual de revisão** (D-08: datação não prescreve). `app.tsx` (`AppIdadeGestacional`) injeta a data do dispositivo (`dataLocalDoDispositivo`), com `motor`/`dataDeHoje` injetáveis para teste. `formulario.tsx` valida semanas (0–42) e dias (0–6) do laudo no blur, espelhando `CONSTANTES` do domínio; DUM e USG opcionais, entrada dupla permitida. `resultado.tsx` exibe IG/DPP/trimestre por método e a comparação. Estado `EstadoIg`: `vazio → sucesso | erro | falha-inesperada`.

## Módulo 8 — `interface/cardiologia` 🟢 (feature 010)

🟢 Molde do `app.tsx` da gestação, também **sem ritual de revisão** (D-08). `app.tsx` (`AppCardiologia`): estado `EstadoCardiologia` com variante extra `fora-do-escopo` (`vazio → sucesso | fora-do-escopo | erro | falha-inesperada`). `formulario.tsx`: idade, sexo (radio), 3 características (checkbox), 4 fatores de risco (checkbox, `Set<FatorDeRisco>`), dois desvios (impedimento, instabilidade); valida idade 0–120 no blur. `resultado.tsx`: classificação, `BlocoProbabilidade` (base + faixa ajustada com "pode ultrapassar 90%"), estrato com `Label` de variante (`success`/`attention`/`danger`), conduta, causas não cardíacas e advertências em `Flash` `danger`. `referencias.tsx`: material complementar consultável (CCS I–IV, tratamento, seguimento, manejo agudo) em `<details>`, **fora do cálculo** (RF-10).

## Módulo 9 — `interface/risco-cardiovascular` 🟢 (feature 014)

🟢 Molde do `app.tsx` da cardiologia, também **sem ritual de revisão** (D-08: estimar risco não prescreve). `tela.tsx` compõe a `Moldura` (título "Risco Cardiovascular em 10 anos (Pooled Cohort Equations)") com `AppRiscoCardiovascular`. `app.tsx`: estado `EstadoRiscoCardiovascular` com a variante `fora-do-escopo` (`vazio → sucesso | fora-do-escopo | erro | falha-inesperada`), invalidação por edição (`desatualizado`) e reinício por `key` de geração; motor injetável para teste, real por padrão. `formulario.tsx`: sexo, raça, idade, colesterol total, HDL, PAS, e os toggles tratamento anti-hipertensivo / diabetes / tabagismo / DCV prévia. `resultado.tsx`: risco em %, categoria com `Label` de variante, e os `Aviso` de clamp fisiológico. **Novo componente `proveniencia.tsx`:** `NotaDeProveniencia` (`Flash` warning com `NOTA_PROVENIENCIA` do domínio — texto único, anti-drift) e `ContextoDaFonte` (seção consultável "Por que Pooled Cohort Equations, e não a AHA PREVENT?", com link `<a>` nativo à PREVENT — navegação do usuário, não requisição de rede; ADR 0002 preservado), **fora do painel de resultado** e sem emitir conduta (ADR 0005).

## Módulo 10 — `interface/inicio` 🟢 (features 007, 008, 014)

🟢 **`catalogo.ts`** — fonte única tipada das seções e rotas (D-07, anti-drift): três seções (`dm2`, `pre-natal`, `cardiologia`); a seção **`cardiologia` passou a ter duas** `FichaCalculadora` (dor torácica + risco cardiovascular, feature 014), as demais uma. Toda calculadora nova entra **aqui primeiro**. `Object.freeze` profundo.
🟢 **`tela.tsx`** (`TelaInicio`) — home por seções sobre a `Moldura` (`destaque`, `logoComoTitulo`); cartões clicáveis por inteiro (stretched link — um `<a>` por cartão via `next/link`, sem JavaScript), grade `inicio-cartoes`.
🟢 **`icones.tsx`** (`IconeDaSecao`) — mapa `id → Octicon` (`dm2`→Beaker, `pre-natal`→Calendar, `cardiologia`→Heart); decorativos (`aria-hidden`); seção sem entrada → fallback `null`. `@primer/octicons-react` pinada, tree-shaken.

## Módulo 11 — `interface/estilos` 🟢 (features 004–013)

🟢 **Cinco** folhas CSS, todas **sobre tokens Primer** (`var(--*)`), zero cor própria, importadas por `_app.tsx` na ordem: `globais.css` (**364 linhas**), `inicio.css` (feature 008, 188), `cabecalho.css` (116, consolidada nas features 011/013), `cardiologia.css` (47), `risco-cardiovascular.css` (8, feature 014). Cada folha nova em vez de crescer `globais.css` é decisão deliberada de manter o teto.
🟢 **Dívida resolvida:** na re-extração 2, `globais.css` estava **em exatamente 400 linhas** (no teto do mantenedor, item amarelo da regressão). A consolidação do cabeçalho em `cabecalho.css` (features 011/013) reduziu `globais.css` para **364** — abaixo do teto, sem folha alguma acima de 400.

---

# Camada de Shell e Infraestrutura

## Módulo 12 — `pages` 🟢 (shell Next.js, Pages Router)

🟢 **`_app.tsx`** — importa a fundação Primer (primitives: motion, size, typography, temas light/dark) + as **5 folhas** próprias, na ordem, e envolve tudo em `ProvedorTemaPrimer` dentro de `.app-raiz`. Tipografia é a pilha de fontes do **sistema do próprio Primer** — nenhum arquivo de fonte baixado (D-04), sob a CSP sem terceiros.
🟢 **`_document.tsx`** (feature 009) — `<Html lang="pt-BR">` + `<Head>` com favicon (`/apsi-tile-192.png`), apple-touch-icon, `manifest.webmanifest` (PWA instalável) e `theme-color` `#0969da`. Ativos same-origin sob a CSP.
🟢 **`index.tsx`** — raiz serve a home (`TelaInicio`) diretamente, sem redirecionamento (decisão de 2026-07-23); metadados enfatizam "nada é salvo nem enviado".
🟢 **Rotas:** `dm2/insulina.tsx` → `TelaCalculadora`; `pre-natal/idade-gestacional.tsx` → tela IG; `cardiologia/dor-toracica.tsx` → `TelaCardiologia`; **`cardiologia/risco-cardiovascular.tsx` → `TelaRiscoCardiovascular`** (feature 014 — a seção cardiologia passa a ter duas rotas, nomeadas pela calculadora, não pela seção). Cada rota é uma casca `<Head>` + tela.

🟢 **Correção sobre a extração 1:** a "rota de API vazia" (`api/v1/index.js`) não existe mais; o handler real é `api/v1/status.ts` (abaixo).

## Módulo 13 — `pages/api/v1/status` 🟢 (feature 002)

🟢 `GET /api/v1/status` — observabilidade mínima do deploy, **contrato fixo**: público, sem autenticação, sem estado, sem dado clínico (ADR 0008). Discrimina o método (405 + `Allow: GET` se não-GET, RN-04), `Cache-Control: no-store` (RN-05 — status cacheado mentiria), e devolve `{ atualizado_em, versao (do package.json), commit (VERCEL_GIT_COMMIT_SHA ?? "local") }`. Mudança incompatível do corpo exigiria `/api/v2`.

## Módulo 14 — `infra` 🟢 (feature 003)

🟢 **`database.ts`** — único ponto de acesso ao banco, usado **só** pelo healthcheck. Pool `pg` **preguiçoso** (`obterPool` lazy singleton, `max=5`, timeouts 5 s), consultas sempre parametrizadas (`query<Linha>`), erros nomeados `ErroDeBanco` com `causa` (`conexao`/`consulta`/`configuracao`) e causa original preservada (`{cause}`). Log estruturado JSON **sem URL nem credencial** — host sempre mascarado (`hostMascarado`: 4 primeiros chars + `•••`). Sem retentativa automática (falha barulhenta; retry é do chamador). `saude()` roda `SELECT 1`; `encerrar()` drena o pool.
🟢 **`compose.yaml`** — `postgres:17.10-alpine` local (porta 5433 nesta máquina); produção via integração Neon (Vercel Marketplace).

---

## Testes (contexto para o Detetive)

🟢 Suíte com **37 arquivos de teste** (Vitest + Playwright + fast-check + axe-core). Cobertura por domínio via property-based (fast-check): toda saída referenciada, doses sempre realizáveis, determinismo, e — na cardiopatia — oráculo das 24 células do Quadro 2. No **risco cardiovascular** (feature 014): `equacao.test.ts` (valores conhecidos das PCE contra o ASCVD Estimator) e `invariantes.test.ts` (property-based: risco em 0–100, categoria monotônica, referência não vazia). Integração via Testing Library cobre formulários/painéis das quatro telas (incl. `risco-cardiovascular.test.tsx`); e2e Playwright + axe-baseline (0/0) por rota, com `cabecalho.spec.ts` guardando geometria das features 011/013. Contrato do `/api/v1/status` em suíte própria (`vitest.api.config.ts`).

## Síntese de riscos e lacunas

1. 🟡 **Premissas clínicas 🟡 a validar pelo prescritor** herdadas das features: gestação (cortes de trimestre 13+6/27+6, limites de plausibilidade DUM/laudo); cardiopatia (leitura descritiva do estrato "baixa", cap da faixa por fatores); **risco cardiovascular** (faixas fisiológicas de clamp 130–320/20–100/90–200; cortes de categoria 5/7,5/20%; adoção dos coeficientes de branco para `raca="outra"`; transportabilidade das PCE ao Brasil — declarada na `NOTA_PROVENIENCIA`). São premissas de projeto, não bugs — o Detetive deve registrá-las como ADR/observações.
2. 🟡 **Acoplamento residual `interface/comum` → `interface/calculadora`** (`preferencia-de-tema.ts` não realocado) — comentado no próprio código, dívida declarada; a refatoração do cabeçalho (011/013) não o resolveu.
3. 🟢 **`globais.css` fora do teto:** a dívida amarela da re-extração 2 (globais em 400 linhas) foi **resolvida** — a consolidação em `cabecalho.css` baixou para 364; nenhuma folha acima de 400.
4. 🟡 **`proximoId` módulo-global** em `formulario.tsx` da insulina — resíduo funcional, frágil sob StrictMode.
5. 🟢 **Sem lacunas 🔴 estruturais nesta passagem:** o novo domínio (feature 014) chega com fonte única, referências e testes; os artefatos SDD das features vivem em `_reversa_sdd/` e `_reversa_forward/`. Os adendos 011–014 serão reconciliados na fase de regressão.
