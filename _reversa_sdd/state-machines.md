# Máquinas de Estado — aps-inteligente

> Regenerado pelo Reversa Detective em 2026-07-23 (**re-extração nº 3** — cobre as quatro telas e a cascata clínica da cardiopatia).
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

Não há entidades persistidas (sistema 100% client-side). As máquinas de estado vivem na memória da UI e, implicitamente, na progressão clínica de cada domínio. As quatro telas compartilham o mesmo **esqueleto de estado** (`vazio → sucesso | erro | falha-inesperada`), variando pelas flags e variantes que cada domínio exige — cardiopatia e risco cardiovascular acrescentam a variante `fora-do-escopo`.

## 1. `EstadoResultado` — tela da insulina (`interface/calculadora`) 🟢

Painel de resultado com duas flags ortogonais: `desatualizado` (edição invalida o resultado vigente — RN-06/EC-03) e `revisaoConfirmada` (checkbox que habilita "Pronto para prescrever" + **Copiar plano**, feature 006).

```mermaid
stateDiagram-v2
    [*] --> vazio
    vazio --> sucesso: calcular → "resultado"
    vazio --> erro: calcular → "erro-validacao" | "fora-do-escopo"
    vazio --> falha_inesperada: exceção fora do contrato (EC-07)
    sucesso --> sucesso: editar (desatualizado=true; revisão desfeita)
    sucesso --> erro: recalcular inválido
    erro --> sucesso: recalcular válido
    sucesso --> vazio: "Novo cálculo"
    erro --> vazio: "Novo cálculo"
    falha_inesperada --> vazio: "Novo cálculo"
    erro --> falha_inesperada: exceção no recálculo
    sucesso --> falha_inesperada: exceção no recálculo
```

| Estado | Significado |
|---|---|
| `vazio` | Nenhum cálculo; inicial e pós-"Novo cálculo" |
| `sucesso` | `ResultadoInicio`/`ResultadoTitulacao`; só aqui existem as flags |
| `erro` | `ErroValidacao` ou `ForaDoEscopoDaFonte` (erros como valores) |
| `falha-inesperada` | `ErroDeInvariante`/exceção desconhecida → painel honesto + evento anônimo |

🟢 **Sub-máquina da revisão** (dentro de `sucesso`): `não-confirmada → confirmada` (checkbox) e `confirmada → não-confirmada` (qualquer edição). "Pronto para prescrever" e o botão **Copiar plano** (`AcaoCopiarPlano`) só montam em `confirmada` **e não** `desatualizado`; o desmonte na invalidação zera o retorno por construção.

## 2. `EstadoIg` — tela da gestação (`interface/gestacao`) 🟢 (feature 007)

Mesmo esqueleto, **sem flag de revisão** (ADR 0012, D-08: datação não prescreve) e sem variante `fora-do-escopo` (a comparação DUM×USG resolve a divergência com um veredito interno, não com uma variante de saída).

```mermaid
stateDiagram-v2
    [*] --> vazio
    vazio --> sucesso: calcular → "resultado" (IG/DPP/trimestre por método + comparação)
    vazio --> erro: calcular → "erro-validacao" (coleta total de ofensores)
    vazio --> falha_inesperada: exceção fora do contrato
    sucesso --> sucesso: editar (desatualizado=true)
    sucesso --> erro: recalcular inválido
    erro --> sucesso: recalcular válido
    sucesso --> vazio: "Novo cálculo"
    erro --> vazio: "Novo cálculo"
    falha_inesperada --> vazio: "Novo cálculo"
```

🟢 O `veredito` da comparação (`dum-confirmada` / `dum-fora-da-margem` / `sem-parametro-na-fonte`) é conteúdo do estado `sucesso`, não um estado de UI: o motor informa a divergência dentro do resultado bem-sucedido.

## 3. `EstadoCardiologia` — tela da cardiopatia (`interface/cardiologia`) 🟢 (feature 010)

Mesmo esqueleto **sem ritual de revisão** (ADR 0012), com a variante extra `fora-do-escopo` — porque a recusa por idade fora de 30–69 (RN-06) é uma saída de primeira classe do domínio (`ForaDoEscopoDaFonte`), distinta do erro de validação.

```mermaid
stateDiagram-v2
    [*] --> vazio
    vazio --> sucesso: avaliar → "resultado"
    vazio --> fora_do_escopo: avaliar → "fora-do-escopo" (idade 0–120 mas fora de 30–69)
    vazio --> erro: avaliar → "entrada-invalida" (coleta total de ofensores)
    vazio --> falha_inesperada: exceção fora do contrato
    sucesso --> sucesso: editar (desatualizado=true)
    fora_do_escopo --> sucesso: recalcular com idade coberta
    sucesso --> fora_do_escopo: recalcular com idade fora da tabela
    sucesso --> erro: recalcular inválido
    erro --> sucesso: recalcular válido
    sucesso --> vazio: "Novo cálculo"
    fora_do_escopo --> vazio: "Novo cálculo"
    erro --> vazio: "Novo cálculo"
    falha_inesperada --> vazio: "Novo cálculo"
```

🟢 A **advertência de angina instável** (RN-07) não é estado: é conteúdo em destaque (`Flash danger`) dentro de `sucesso`, disparado pela flag de entrada `sinaisInstabilidade`.

## 4. `EstadoRiscoCardiovascular` — tela do risco cardiovascular (`interface/risco-cardiovascular`) 🟢 (feature 014)

Idêntico ao esqueleto da cardiopatia — **sem ritual de revisão** (ADR 0012, D-08) e com a variante `fora-do-escopo`, aqui disparada por **dois** motivos distintos (idade fora de 40–79 ou DCV prévia). Molde do `AppCardiologia`.

```mermaid
stateDiagram-v2
    [*] --> vazio
    vazio --> sucesso: estimar → "resultado"
    vazio --> fora_do_escopo: estimar → "fora-do-escopo" (idade fora de 40–79 OU DCV prévia)
    vazio --> erro: estimar → "erro-validacao" (coleta total de ofensores)
    vazio --> falha_inesperada: exceção fora do contrato (EC-07)
    sucesso --> sucesso: editar (desatualizado=true)
    fora_do_escopo --> sucesso: recalcular elegível
    sucesso --> fora_do_escopo: recalcular fora do escopo
    sucesso --> erro: recalcular inválido
    erro --> sucesso: recalcular válido
    sucesso --> vazio: "Nova estimativa"
    fora_do_escopo --> vazio: "Nova estimativa"
    erro --> vazio: "Nova estimativa"
    falha_inesperada --> vazio: "Nova estimativa"
```

🟢 Os **avisos de clamp fisiológico** (RN-07) não são estado: são conteúdo dentro de `sucesso` (o valor foi cortado à faixa e o risco, calculado), sinalizando o viés. A **nota de proveniência** e o `ContextoDaFonte` são conteúdo estático, presentes fora do painel de resultado em qualquer estado.

## 5. Cascata clínica da cardiopatia (`models/cardiopatia-isquemica`) 🟢

Não é máquina de estado persistida, mas um pipeline determinístico de decisão que vale documentar como fluxo — cada etapa é pura e testada por property-based (oráculo das 24 células).

```mermaid
stateDiagram-v2
    [*] --> classificar
    classificar --> checar_idade: 3→típica | 2→atípica | ≤1→não anginosa
    checar_idade --> fora_do_escopo: idade fora de 30–69
    checar_idade --> base: idade 30–69 → lookup Quadro 2 (24 células)
    base --> ajustar: ≥ 1 fator de risco → faixa base×2–base×3 (cap 99%, ">90%")
    base --> estrato: sem fator (ajuste = undefined)
    ajustar --> estrato
    estrato --> conduta: baixa | intermediária | alta
    conduta --> exame: ergometria (padrão) | não-invasivo (impedimento) | nenhum (baixa)
    conduta --> advertencia: sinaisInstabilidade → angina instável
    fora_do_escopo --> [*]
    advertencia --> [*]
    exame --> [*]
```

🟡 **Nota descritiva do estrato** (RN-04, nota ** do Quadro 2): `"baixa"` só se a dor for **não anginosa E sem fatores de risco** — qualquer fator impede "baixa", mesmo que o número tabele baixo. É decisão descritiva, não puramente numérica, marcada 🟡 para validação (O-10-03).

## 6. Progressão clínica do esquema de insulina (`TipoEsquema`) 🟡

O domínio não modela transições explicitamente — `derivaTipoEsquema` (UI) classifica pelo número de aplicações de Regular —, mas as regras do motor implicam a progressão do guia:

```mermaid
stateDiagram-v2
    [*] --> sem_insulina
    sem_insulina --> basal: início (NPH ao deitar, faixa 10–15 UI)
    basal --> basal: titulação do jejum (+4/+2/0/−4)
    basal --> basal_fracionada: NPH > 30 UI ou > 0,4 UI/kg/dia
    basal_fracionada --> basal_plus: gate HbA1c > 7% + pré-prandial ≥ 130 → Regular 4 UI
    basal --> basal_plus: idem
    basal_plus --> basal_bolus: segundo braço dispara nova Regular
    basal_plus --> basal_plus: titulação da Regular (±2)
    basal_bolus --> basal_bolus: titulação por braço (AA/AJ/AD)
```

🟡 `basal_fracionada` não é `TipoEsquema` próprio (continua `basal`); está no diagrama porque o fracionamento tem gatilho e conduta próprios. Transições "para trás" (retirar Regular) não existem: reduzir é o máximo da titulação (−2/−4); a desintensificação está fora do guia. 🔴 O guia não parametriza ajuste pós-prandial (NG-07) — a máquina para nos braços pré-prandiais.

## 7. Tema (`preferencia-de-tema.ts`) 🟢

Trivial e transversal às três telas: `claro ⇄ escuro`, persistido em `localStorage["aps-inteligente:tema"]`, com degradação graciosa se o storage estiver bloqueado. **Único dado durável do sistema.** Sem valor clínico.
