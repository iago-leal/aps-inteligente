# Requirements: Calculadora de dor torácica e probabilidade pré-teste de cardiopatia isquêmica

> Identificador: `010-dor-toracica-pre-teste`
> Data: `2026-07-23`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Terceira calculadora clínica da plataforma guarda-chuva, para o médico da APS diante de um paciente com dor torácica. A ferramenta operacionaliza a cascata do TeleCondutas *Cardiopatia Isquêmica* (TelessaúdeRS-UFRGS, 2017): classifica a dor em **típica**, **atípica** ou **não anginosa** a partir de três características; estima a **probabilidade pré-teste de doença arterial coronariana (DAC)** por idade, sexo e presença de fatores de risco; e traduz essa probabilidade (baixa / intermediária / alta) na **conduta de investigação** — quando *não* indicar exame funcional, quando solicitar exame não invasivo e quando encaminhar. Resolve a hesitação recorrente na APS sobre pedir ou não teste ergométrico, com toda saída referenciada ao guia. Estende o padrão da feature 007 (segunda calculadora), sem tocar os motores existentes.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#1-estilo-arquitetural` | Domínio clínico puro em `models/`, isolado de framework (ADR 0003); três camadas `pages → interface → models` com dependência unidirecional; determinismo sem feature flag | 🟢 |
| `_reversa_sdd/domain.md#6-fronteiras-de-escopo` | "A calculadora cobre exatamente o que o guia cobre, nada além" (MD-0009); insulina fora de escopo vira `ForaDoEscopoDaFonte`; orientações ao paciente excluídas | 🟢 |
| `_reversa_sdd/domain.md#3.5-regras-da-interface-com-força-de-domínio` | Privacidade por construção (sem fetch, sem storage de dado clínico); invalidação por edição; UI espelha faixas de validação do domínio via `CONSTANTES` | 🟢 |
| `_reversa_sdd/addenda/007-idade-gestacional-e-home.md` | Precedente direto: segunda calculadora como `models/gestacao/` no molde de `models/insulina`; catálogo tipado `interface/inicio/catalogo.ts` como fonte única de navegação; "uma fonte por unit", sem mescla; sem ritual de revisão quando a saída não prescreve | 🟢 |
| `interface/inicio/catalogo.ts` | Catálogo congelado por seções (`dm2`, `pre-natal`); nova calculadora entra aqui primeiro e a rota em `pages/` referencia a entrada | 🟢 |
| `_reversa_sdd/domain.md#3.4` / ADR 0004 (`_reversa_sdd/adrs/0004-*`) | Validação coleta **todos** os ofensores; erros esperados são valores (union types); exceção só sinaliza bug interno → painel honesto | 🟢 |
| ADR 0005/0006 (`_reversa_sdd/adrs/0005-*`, `0006-*`) | "Apoio à decisão, não decisão": condutas equivalentes devolvidas sem escolher; limites como alerta, não trava | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico da APS (prescritor) | Decidir a investigação de um paciente com dor torácica | Informa características da dor, idade, sexo e fatores de risco; recebe classificação da dor, probabilidade pré-teste e conduta de investigação referenciada, decidindo com apoio se solicita ergometria, outro exame ou encaminha |
| Médico da APS (prescritor) | Não superinvestigar dor de baixa probabilidade | Em dor não anginosa sem fatores de risco, a ferramenta sinaliza que exame funcional **não** está indicado e aponta as causas não cardíacas a investigar |
| Enfermeiro(a) da APS | Reconhecer sinal de alerta | Identifica na leitura da ferramenta os padrões de angina instável / dor aguda que exigem encaminhamento emergencial, não manejo eletivo |

## 4. Regras de negócio novas ou alteradas

> Fonte clínica primária: **TeleCondutas — Cardiopatia Isquêmica, TelessaúdeRS-UFRGS, 2017** (terceira fonte da plataforma). Cada saída deve carregar referência (quadro/página), no invariante já vigente `_reversa_sdd/domain.md#3.4` (R-20 análogo). Nenhuma regra mescla-se às fontes de DM2 ou pré-natal.

1. **RN-01 — Classificação clínica da dor torácica** (Quadro 1, p. 4; fonte CESAR et al. 2014) 🟢
   - Três características: (a) desconforto/dor retroesternal; (b) provocada por exercício ou estresse emocional; (c) alívio rápido (≈1 min) com repouso ou nitrato.
   - **Angina típica** = 3 características; **angina atípica** = 2; **dor não anginosa** = 1 ou nenhuma.
   - Tipo: nova.

2. **RN-02 — Probabilidade pré-teste de DAC por idade e sexo** (Quadro 2, p. 5; fonte DUNCAN et al. 2013 — Diamond/Forrester e Registro CASS) 🟢
   - Tabela de valor-base (%) cruzando classificação da dor × sexo × faixa etária (30–39, 40–49, 50–59, 60–69). Valores exatos do Quadro 2 são a única fonte numérica (congelados, análogo a `CONSTANTES`).
   - Tipo: nova.

3. **RN-03 — Ajuste por fatores de risco** (nota * do Quadro 2, p. 5) 🟢
   - Fatores de risco considerados pelo guia: diabetes, tabagismo, hipertensão, dislipidemia. Sua presença "aumenta em 2 a 3 vezes" a estimativa-base.
   - **Decisão (2026-07-23):** exibir o valor-base do Quadro 2 e, havendo ≥ 1 fator de risco, a **faixa** `valor×2` a `valor×3`, **capada em ">90% / alta"** quando extrapolar 100%. Mostra o número assumindo o intervalo do guia — "apoio à decisão, não decisão" (ADR 0005).
   - **Decisão (2026-07-23):** qualquer fator de risco **impede o estrato "baixa"** (o guia define baixa como dor não anginosa **e** sem fatores de risco); logo, com fator de risco a conduta nunca é "exame não indicado".
   - Tipo: nova.

4. **RN-04 — Estratos de probabilidade e conduta de investigação** (p. 4 e notas do Quadro 2, p. 5) 🟢
   - Estratos: **baixa** < 10%, **intermediária** 10–90%, **alta** > 90%.
   - **Baixa** (definida no guia como dor não anginosa **e** sem fatores de risco): exame funcional **não** indicado na avaliação inicial; investigar causas não cardíacas — musculoesquelética, psiquiátrica (ansiedade/pânico), gastrointestinal (DRGE, cólica biliar, espasmo esofágico), pulmonar (pneumonia, neoplasia, pneumotórax).
   - **Intermediária**: exame não invasivo para confirmar/afastar suspeita (quadro clínico duvidoso).
   - **Alta**: exame não invasivo para estratificação prognóstica e identificação de candidatos à revascularização; probabilidade > 90% requer estratificação por método invasivo → encaminhamento ao cardiologista.
   - Tipo: nova.

5. **RN-05 — Escolha do exame funcional** (Exames complementares, p. 6; Quadro 4 interpretação, p. 7) 🟢
   - ECG de repouso + **teste ergométrico** são os exames iniciais. Quando o paciente não pode exercitar-se **ou** o ECG basal impede a interpretação (BRE, sobrecarga VE com alteração de repolarização, marca-passo, pré-excitação), indicar método não invasivo alternativo (eco de estresse, cintilografia miocárdica, RM cardiovascular). Esta é a regra que responde diretamente à queixa "pedir ou não ergometria".
   - Tipo: nova.

6. **RN-06 — Fora do escopo da fonte** (limites do Quadro 2) 🟢
   - O Quadro 2 cobre apenas 30–69 anos. Idade fora dessa faixa não é extrapolada: saída honesta `ForaDoEscopoDaFonte` (molde de `_reversa_sdd/domain.md#6`), sem número inventado, em coerência com MD-0009 ("a calculadora cobre o que o guia cobre").
   - Tipo: nova.

7. **RN-07 — Sinais de alerta / angina instável como saída não eletiva** (p. 6) 🟢
   - Apresentações de angina instável (dor em repouso; início recente CCS III/IV; padrão em crescendo) e dor aguda têm alta probabilidade de evento agudo e exigem **encaminhamento emergencial**, não a cascata eletiva de investigação. **Decisão (2026-07-23):** na fase 1 a ferramenta entra com **advertência textual** de desvio de fluxo (encaminhar à emergência), sem triagem interativa.
   - Tipo: nova.

8. **RN-08 — Conteúdo de referência complementar** (Quadro 3 CCS p. 5; acompanhamento p. 8-9; tratamento e Tabela 1 p. 9-11; manejo agudo p. 12) 🟢
   - O material traz classificação funcional CCS (I–IV), seguimento na APS, tratamento farmacológico e manejo da doença arterial aguda. **Decisão (2026-07-23):** entram na página como **blocos de referência exibíveis** — texto consultável referenciado ao guia, **fora do núcleo calculado**, sem cálculo nem interação; cada bloco cita quadro/página da fonte.
   - Tipo: nova.

9. **RN-09 — Toda saída referenciada e privacidade preservada** (invariantes `_reversa_sdd/domain.md#3.4`, `#3.5`; ADR 0001/0002) 🟢
   - Cada resultado carrega referência ao quadro/página do guia; nenhum dado clínico é persistido ou transmitido (100% client-side); edição de qualquer campo invalida o resultado anterior.
   - Tipo: nova (aplicação de invariante existente à unit nova).

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Classificar a dor torácica a partir das três características do Quadro 1 | Must | Marcadas 3 características → "angina típica"; 2 → "angina atípica"; 0–1 → "dor não anginosa"; classificação exibida com referência ao Quadro 1 | 🟢 |
| RF-02 | Estimar a probabilidade pré-teste-base por idade, sexo e classificação da dor (Quadro 2) | Must | Para cada célula do Quadro 2, a saída reproduz exatamente o valor tabelado (property/oráculo por tabela congelada) | 🟢 |
| RF-03 | Sinalizar o efeito dos fatores de risco (diabetes, tabagismo, HAS, dislipidemia) sobre a estimativa | Must | Com ≥1 fator, a saída reflete o aumento de ×2–×3 conforme a decisão da §10; sem fatores, exibe o valor-base | 🟡 |
| RF-04 | Classificar a probabilidade em baixa (<10%) / intermediária (10–90%) / alta (>90%) e apresentar a conduta de investigação correspondente (RN-04) | Must | Cada estrato exibe a conduta do guia, incluindo, na baixa, a lista de causas não cardíacas | 🟢 |
| RF-05 | Orientar a escolha do exame funcional: ergometria como inicial vs. método não invasivo quando o ECG basal/impossibilidade de exercício contraindica (RN-05) | Must | A saída de conduta explicita ergometria e as condições que a substituem por exame alternativo, referenciadas à p. 6 | 🟢 |
| RF-06 | Recusar honestamente idade fora de 30–69 anos, sem extrapolar (RN-06) | Must | Idade < 30 ou > 69 → saída `ForaDoEscopoDaFonte` explicando o limite do Quadro 2; nenhum número estimado | 🟡 |
| RF-07 | Advertir para encaminhamento emergencial diante de padrão de angina instável / dor aguda (RN-07) | Should | Presente um marcador de instabilidade, a ferramenta desvia do fluxo eletivo e orienta emergência, referenciada à p. 6 | 🟡 |
| RF-08 | Publicar a calculadora na home por seções: seção **"Cardiologia"**, ficha "Calculadora de probabilidade pré-teste de cardiopatia isquêmica", rota **`/cardiologia/dor-toracica`** | Must | Nova seção `cardiologia` em `interface/inicio/catalogo.ts` com a ficha; rota `pages/cardiologia/dor-toracica.tsx` referenciando a entrada; home lista a ferramenta; motores de insulina e gestação byte a byte intocados (`git diff models/insulina models/gestacao` vazio) | 🟢 |
| RF-09 | Coletar todos os ofensores de validação de entrada, sem parar no primeiro (RN-09 / ADR 0004) | Should | Entrada com múltiplos campos inválidos retorna a lista completa de ofensores; o domínio revalida sem confiar na UI | 🟢 |
| RF-10 | Exibir os blocos de referência complementar (CCS I–IV, tratamento farmacológico + Tabela 1, seguimento na APS, manejo agudo) como texto consultável referenciado, sem cálculo (RN-08) | Could | Cada bloco aparece na página com referência ao quadro/página do guia; nenhum participa do cálculo nem da validação | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Privacidade | Zero fetch e zero persistência de dado clínico; único localStorage é o tema | Invariante `_reversa_sdd/domain.md#3.5`; ADR 0002 | 🟢 |
| Determinismo | Motor puro, sem feature flag nem parâmetro de ambiente; tabela do Quadro 2 congelada como constante única | `_reversa_sdd/architecture.md#1`; molde `fonte-clinica.ts` | 🟢 |
| Rastreabilidade clínica | Toda saída carrega `ReferenciaClinica` (quadro/página) | ADR 0001; `_reversa_sdd/domain.md#3.4` | 🟢 |
| Manutenibilidade | Domínio novo isolado em `models/` (nova unit), sem dependência entre motores; sem arquivo > 400 linhas | Precedente 007; sinal 5.6 CLAUDE.md | 🟢 |
| Testabilidade | Unidade com property-based para o invariante "toda saída referenciada" e oráculo por célula do Quadro 2; integração da UI; cobertura ≥ 90% em `models/**` | Princípio VII; `_reversa_sdd/architecture.md#5` | 🟢 |
| Fonte editorial | PDF do guia em `referencias/` fora do versionamento (estende MD-0008 à terceira fonte) | Adendo 007 (`.gitignore`) | 🟢 |
| Desempenho | Não aumentar o first-load além do gate vigente (< 100 kB gzip por rota), medido no build | Gate D-08 herdado das features 008/009 | 🟡 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Angina típica em homem de 55 anos com fatores de risco
  Dado um paciente masculino, 55 anos, com dor retroesternal provocada por esforço e aliviada por nitrato em 1 minuto
  E a marcação de hipertensão e diabetes como fatores de risco
  Quando o médico solicita o cálculo
  Então a dor é classificada como "angina típica" (Quadro 1)
  E a probabilidade-base do Quadro 2 (homem, 50-59, típica) é apresentada
  E o efeito dos fatores de risco é sinalizado conforme a decisão de §10
  E a conduta indica probabilidade alta com estratificação e encaminhamento ao cardiologista

Cenário: Dor não anginosa sem fatores de risco (probabilidade baixa)
  Dado um paciente com apenas uma das três características e nenhum fator de risco
  Quando o médico solicita o cálculo
  Então a dor é classificada como "dor não anginosa"
  E a conduta informa que exame funcional NÃO está indicado na avaliação inicial
  E são listadas as causas não cardíacas a investigar (musculoesquelética, psiquiátrica, gastrointestinal, pulmonar)

Cenário: ECG basal que contraindica ergometria
  Dado um paciente com probabilidade intermediária ou alta
  E a informação de bloqueio de ramo esquerdo (ou impossibilidade de exercício)
  Quando a ferramenta apresenta a conduta de investigação
  Então indica método não invasivo alternativo (eco de estresse, cintilografia ou RM), não a ergometria, referenciando a p. 6

Cenário negativo: Idade fora do intervalo da fonte
  Dado um paciente com 74 anos
  Quando o médico solicita o cálculo da probabilidade pré-teste
  Então a ferramenta devolve "fora do escopo da fonte", explicando que o Quadro 2 cobre 30 a 69 anos
  E não apresenta número estimado

Cenário negativo: Entrada inválida com múltiplos ofensores
  Dado um formulário com idade não numérica e sexo não informado
  Quando o médico solicita o cálculo
  Então a ferramenta retorna todos os ofensores de uma vez, sem prescrever a partir de dados inválidos
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01, RF-02, RF-04 | Must | Núcleo pedido: classificar a dor, estimar probabilidade e traduzir em conduta |
| RF-03, RF-05 | Must | Sem o ajuste por fatores de risco e a regra ergometria×alternativa, a conduta não responde à demanda de fundo |
| RF-06, RF-08, RF-09 | Must | Honestidade de escopo, publicação no catálogo e validação total são invariantes do projeto |
| RF-07 | Should | Segurança clínica (red flag); na fase 1, advertência textual de encaminhamento emergencial |
| RF-10 (blocos de referência: CCS, tratamento + Tabela 1, seguimento, manejo agudo) | Could | "Podemos incluir, referenciando"; entram como texto consultável fora do núcleo calculado (decisão de 2026-07-23) |
| RNF privacidade, determinismo, rastreabilidade | Must | Invariantes herdados, não negociáveis |
| RNF desempenho (gate de bundle) | Should | Guarda de regressão, não bloqueia a entrega |

## 9. Esclarecimentos

### Sessão 2026-07-23

- **Q:** Até onde vai a fase 1 — só o núcleo calculado ou também o conteúdo adicional do material?
  **R:** Núcleo calculado (classificação → probabilidade → conduta de investigação) **mais** os blocos de referência complementar (CCS, tratamento farmacológico + Tabela 1, seguimento, manejo agudo) exibidos como texto consultável, sem cálculo; angina instável entra como advertência textual (RN-07, RN-08, RF-10).
- **Q:** Como tratar o efeito dos fatores de risco ("aumenta 2 a 3 vezes")?
  **R:** Exibir o valor-base e a faixa `valor×2`–`valor×3`, capada em ">90% / alta"; qualquer fator de risco impede o estrato "baixa" (RN-03, RF-03).
- **Q:** Nome da seção da home e rota da calculadora?
  **R:** Seção "Cardiologia"; ficha "Calculadora de probabilidade pré-teste de cardiopatia isquêmica"; rota `/cardiologia/dor-toracica` (RF-08).

## 10. Lacunas

- Nenhuma lacuna aberta. As três dúvidas iniciais (escopo, ajuste por fatores de risco e nomenclatura) foram resolvidas na sessão de esclarecimentos de 2026-07-23 — ver §9.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-23 | Sessão de esclarecimentos: escopo, ajuste por fatores de risco e nomenclatura resolvidos; RN-03/06/07/08 promovidas a 🟢, RF-08 concretizado, RF-10 acrescentado (`/reversa-clarify`) | reversa |
