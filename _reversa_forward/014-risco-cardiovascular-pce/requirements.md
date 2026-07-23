# Requirements: Calculadora de risco cardiovascular (Pooled Cohort Equations — ACC/AHA)

> Identificador: `014-risco-cardiovascular-pce`
> Data: `2026-07-23`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Adiciona à seção **Cardiologia** uma segunda calculadora: a estimativa de risco cardiovascular pelas **Pooled Cohort Equations** (PCE, *2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk*, Goff et al.), voltada à prevenção primária em adultos de 40 a 79 anos sem doença cardiovascular prévia. O motor devolve o risco percentual de **ASCVD "hard" em 10 anos** (IAM não-fatal, morte por doença coronariana, AVC fatal ou não-fatal), calculado inteiramente no navegador. A escolha das PCE — e não da AHA PREVENT — é deliberada: a recomendação de estatina em prevenção primária da **USPSTF (2022)** assenta-se nas PCE, e adotar uma calculadora cujo resultado divergisse do limiar que fundamenta a conduta produziria incoerência entre risco estimado e recomendação. A ferramenta **apenas informa o risco**, sem prescrever conduta (ADR 0005). A feature nasce **aditiva**, no molde da calculadora de dor torácica (feature 010).

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#1` | Plataforma de calculadoras clínicas com domínio embarcado no cliente; três domínios independentes sob casca comum; camadas unidirecionais `pages → interface → models`; checklist de invariantes que toda unit nova replica | 🟢 |
| `_reversa_sdd/adrs/0011-uma-fonte-clinica-por-unit-de-dominio.md` | Uma fonte clínica por unit; toda calculadora nova nasce declarando a fonte no catálogo (`interface/inicio/catalogo.ts`) antes do código; adição aditiva e isolada (`git diff` dos outros motores vazio) | 🟢 |
| `_reversa_sdd/adrs/0001-fonte-clinica-unica-guia-sms-rio.md` | Toda saída carrega `ReferenciaClinica` congelada; PDF/fonte editorial fora do git | 🟢 |
| `_reversa_sdd/adrs/0003-dominio-puro-fora-do-framework.md` | Domínio puro, independente de framework; specs por módulo 1:1 com a fronteira | 🟢 |
| `_reversa_sdd/adrs/0004-erros-como-valores-excecao-so-invariante.md` | Saída como union discriminada por `tipo`; `ErroDeInvariante` só para bug interno; coleta total de ofensores | 🟢 |
| `_reversa_sdd/adrs/0005-motor-nao-escolhe-condutas-equivalentes.md` | O motor informa, não escolhe conduta pelo prescritor — base da decisão de **não** emitir recomendação de estatina | 🟢 |
| `_reversa_sdd/adrs/0006-teto-como-alerta-limites-inviolaveis.md` | Padrão "limite clínico é alerta, não trava" | 🟢 |
| `_reversa_sdd/adrs/0009-escopo-fase-1-o-que-o-guia-cobre.md` | Escopo = o que a fonte clínica cobre; fora dela → `ForaDoEscopoDaFonte` | 🟢 |
| `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md` · `0007-telemetria-nula-fase-1.md` · `0012-ritual-de-revisao-so-na-prescricao-de-dose.md` | Privacidade por construção (sem fetch/storage de dado clínico); telemetria nula; ritual de revisão só na insulina | 🟢 |
| `_reversa_sdd/domain.md#6` · `#6.1` | Invariantes transversais aos três domínios; a UI espelha faixas importando `CONSTANTES` (fonte única de números); invalidação por edição marca resultado `desatualizado` | 🟢 |
| `_reversa_sdd/addenda/010-dor-toracica-pre-teste.md` | Molde mais próximo: calculadora de cardiologia puramente aditiva; tabela "Impacto por artefato" enumera tudo que uma calculadora nova toca (unit, tela, rota, catálogo, ícones, CSS, testes, README, e2e, axe) | 🟢 |
| `interface/inicio/catalogo.ts` | Seção `cardiologia` já existe com uma ficha; ícone `cardiologia → HeartIcon` já mapeado; a nova calculadora entra como segunda `FichaCalculadora` | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico de APS / prescritor | Estimar o risco de ASCVD de 10 anos de um adulto em consulta de rotina, para embasar a decisão de prevenção primária (inclusive estatina, à luz da USPSTF) | Preenche as variáveis clínicas e lê o percentual de risco com a referência da fonte |
| Médico em revisão de conduta | Reavaliar o risco após mudança de fator (controle pressórico, cessação de tabagismo) | Reabre a calculadora, ajusta uma variável e obtém o novo percentual, ciente de que o resultado é atualizado a cada edição |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A fonte clínica única desta unit são as **Pooled Cohort Equations** (*2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk*, Goff et al.; coeficientes na Tabela A do guideline; base da recomendação de estatina da USPSTF 2022). Nenhuma outra fonte é mesclada. 🟢
   - Origem no legado: `_reversa_sdd/adrs/0011-uma-fonte-clinica-por-unit-de-dominio.md`
   - Tipo: nova
2. **RN-02:** Elegibilidade de prevenção primária: idade **40–79 anos** e ausência de DCV prévia (declarada pelo usuário). Idade plausível fora de 40–79 → `ForaDoEscopoDaFonte`; DCV prévia declarada → a calculadora não estima. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#7` (padrão `ForaDoEscopoDaFonte`)
   - Tipo: nova
3. **RN-03:** Variáveis de entrada das PCE: sexo; **raça** (branco / afro-americano / outra); idade; colesterol total; HDL; PAS; tratamento anti-hipertensivo em uso (sim/não); diabetes (sim/não); tabagismo atual (sim/não). Faixas fisiológicas validadas, congeladas em `fonte-clinica.ts` e espelhadas pela UI: colesterol total **130–320 mg/dL**; HDL **20–100 mg/dL**; PAS **90–200 mmHg** [confirmar contra a fonte no plano]. 🟢
   - Tipo: nova
4. **RN-04:** Desfecho único: **ASCVD "hard" em 10 anos** — primeiro evento de IAM não-fatal, morte por doença coronariana, ou AVC fatal/não-fatal. Não há "DCV total", insuficiência cardíaca nem horizonte de 30 anos (conceitos da PREVENT, fora desta feature). 🟢
   - Tipo: nova
5. **RN-05:** A **raça** é variável obrigatória das PCE, que são raça-específicas (equações distintas para branco e afro-americano); a categoria **"outra" usa os coeficientes de referência (branco)**, como no *ASCVD Risk Estimator* oficial do ACC (tratamento decidido — ver Esclarecimentos). Limitação declarada: a categorização racial das PCE é norte-americana e mal se traduz à população brasileira miscigenada; a nota de proveniência (RN-09) a explicita. 🟢
   - Tipo: nova
6. **RN-06:** O motor informa o percentual e sua categoria de risco, **não prescreve conduta**; a ferramenta **não** emite recomendação de estatina (decisão do solicitante: apenas o risco). A interpretação terapêutica fica com o médico. 🟢
   - Origem no legado: `_reversa_sdd/adrs/0005-motor-nao-escolhe-condutas-equivalentes.md`
   - Tipo: nova (herda invariante)
7. **RN-07:** Valor numérico fora da faixa validada é tratado como o padrão do projeto: **alerta, não trava** — estima com o valor-limite mais próximo e sinaliza possível sub/superestimativa. 🟡
   - Origem no legado: `_reversa_sdd/adrs/0006-teto-como-alerta-limites-inviolaveis.md`
   - Tipo: nova
8. **RN-08:** Toda saída carrega `ReferenciaClinica` congelada apontando para as PCE (ACC/AHA 2013); lista de referências nunca vazia (invariante verificado por teste). 🟢
   - Origem no legado: `_reversa_sdd/adrs/0001-fonte-clinica-unica-guia-sms-rio.md`
   - Tipo: nova (herda invariante)
9. **RN-09:** Proveniência (decidida): adota-se as PCE **com nota de proveniência visível** ao médico. As equações derivam de coortes norte-americanas (ARIC, CHS, CARDIA, Framingham), incluem raça como preditor e não foram calibradas para o Brasil; a nota registra essa dupla limitação (calibração americana + categoria racial não traduzível). 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Coletar as variáveis das PCE: sexo, raça, idade, colesterol total, HDL, PAS, tratamento anti-hipertensivo (sim/não), diabetes (sim/não), tabagismo atual (sim/não) | Must | Formulário aceita e valida as entradas; ausência de obrigatória é reportada como ofensor | 🟢 |
| RF-02 | Calcular o risco percentual de **ASCVD "hard" em 10 anos** pelas PCE, sexo- e raça-específicas | Must | Para casos de referência do *ASCVD Risk Estimator* oficial, o percentual bate dentro de tolerância definida no plano | 🟢 |
| RF-03 | Aplicar elegibilidade de idade 40–79; fora da faixa → `ForaDoEscopoDaFonte` com mensagem e referência | Must | Idade 35 ou 85 → saída `fora-do-escopo`, sem número estimado | 🟢 |
| RF-04 | Validar entradas com **coleta total de ofensores** e faixas fisiológicas da RN-03 | Must | Entrada com dois campos inválidos retorna os dois ofensores de uma vez | 🟢 |
| RF-05 | Registrar a ausência de DCV prévia (prevenção primária); DCV prévia declarada impede a estimativa com mensagem própria | Must | Marcador de DCV prévia → calculadora não devolve percentual, explica a limitação | 🟡 |
| RF-06 | Tratar a **raça** como variável obrigatória (branco / afro-americano / outra→referência), conforme RN-05, exibindo a limitação | Must | O cálculo usa a equação racial correspondente; a categoria "outra" usa os coeficientes de referência | 🟢 |
| RF-07 | Apresentar o percentual e a **categoria de risco** (baixo <5%, limítrofe 5–<7,5%, intermediário 7,5–<20%, alto ≥20%), sem prescrever conduta | Should | Resultado mostra número e rótulo de categoria; nenhuma recomendação de tratamento é emitida | 🟡 |
| RF-08 | Cada saída carrega `ReferenciaClinica` das PCE; lista nunca vazia | Must | Toda saída de resultado inclui ≥ 1 referência; invariante coberto por teste property-based | 🟢 |
| RF-09 | Registrar a calculadora no catálogo (`interface/inicio/catalogo.ts`) como segunda ficha da seção `cardiologia` e criar a rota `pages/cardiologia/<slug>.tsx` | Must | Home lista a nova calculadora na seção Cardiologia; rota renderiza a tela sob `<Head>` com aviso de cálculo local; fichas antigas byte a byte | 🟢 |
| RF-10 | Exibir **nota de proveniência** junto ao resultado/referências: as PCE derivam de coortes dos EUA, incluem raça e não foram calibradas para o Brasil (RN-09) | Should | O resultado exibe a nota de proveniência de forma visível e não intrusiva | 🟢 |
| RF-11 | Cálculo 100% no navegador: nada salvo nem enviado (privacidade por construção) | Must | Nenhuma requisição de rede com dado clínico; `<meta>` da rota reafirma o cálculo local | 🟢 |
| RF-12 | A calculadora **não** tem ritual de revisão (checkbox só existe na insulina); a edição de qualquer campo marca o resultado como desatualizado | Must | Editar um campo após o cálculo invalida o resultado exibido; ausência de checkbox de revisão | 🟢 |

### Fora de escopo (não-objetivos) v1

- **Recomendação de conduta / indicação de estatina:** a ferramenta informa o risco, não decide a terapia (RN-06, ADR 0005).
- **AHA PREVENT, "DCV total", insuficiência cardíaca, horizonte de 30 anos:** pertencem ao "mundo" da PREVENT; não fazem parte desta feature (candidatos a uma calculadora futura, sinalizada como fonte distinta).
- **Risco lifetime / estimativa para 20–39 anos:** as PCE de 10 anos cobrem 40–79.

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Correção clínica | Os coeficientes das PCE vivem congelados em `fonte-clinica.ts`, comentados com a origem; a validação usa **casos de referência (golden cases)** do *ASCVD Risk Estimator* oficial | Princípio VII (testes como fonte de verdade); `_reversa_sdd/domain.md#6` (constantes congeladas anti-drift) | 🟢 |
| Coerência clínica | A calculadora usa a **mesma métrica** (PCE) que fundamenta a recomendação de estatina da USPSTF, evitando descasar risco estimado e limiar de conduta | Decisão do solicitante (ver Esclarecimentos) | 🟢 |
| Desempenho | Cálculo síncrono no cliente, resposta imediata; sem chamada de rede | `_reversa_sdd/c4-containers.md#Comunicação` (motor roda no cliente) | 🟢 |
| Segurança / Privacidade | Sem fetch, sem storage de dado clínico; único `localStorage` da plataforma é o tema | `_reversa_sdd/adrs/0002` · `0007` | 🟢 |
| Observabilidade | Erros de invariante como `ErroDeInvariante` nomeado → painel honesto; nunca falha silenciosa | `_reversa_sdd/adrs/0004` | 🟢 |
| Isolamento | Padrão aditivo: `git diff` dos motores insulina/gestação/dor-torácica vazio; nova folha CSS em vez de crescer `globais.css` (no teto de 400 linhas) | `_reversa_sdd/addenda/010-dor-toracica-pre-teste.md#Impacto-por-artefato` | 🟢 |
| Proveniência | A tela declara a fonte (PCE, ACC/AHA 2013) e exibe a nota de proveniência decidida (coorte dos EUA, variável raça, sem calibração para o Brasil) — RN-09/RF-10 | `_reversa_sdd/adrs/0001` | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: risco de ASCVD em 10 anos para adulto elegível
  Dado um paciente de 55 anos, sexo masculino, raça branca, sem DCV prévia
  E colesterol total 213 mg/dL, HDL 50 mg/dL, PAS 120 mmHg, sem anti-hipertensivo
  E sem diabetes, não tabagista
  Quando o médico solicita o cálculo
  Então o sistema exibe o risco percentual de ASCVD em 10 anos e sua categoria
  E a saída inclui a referência às Pooled Cohort Equations e a nota de proveniência

Cenário: idade fora da faixa da fonte
  Dado um paciente de 35 anos com dados válidos
  Quando o médico solicita o cálculo
  Então o sistema devolve "fora do escopo da fonte" sem número estimado
  E explica que as PCE cobrem 40 a 79 anos

Cenário: coleta total de entradas inválidas
  Dado colesterol total 900 mg/dL e HDL 5 mg/dL
  Quando o médico solicita o cálculo
  Então o sistema reporta os dois valores fora de faixa de uma só vez

Cenário: a ferramenta não prescreve conduta
  Dado um resultado de risco alto (≥ 20%)
  Quando o resultado é exibido
  Então o sistema apresenta o percentual e a categoria
  E não recomenda estatina nem qualquer terapia (decisão do médico)
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01, RF-02, RF-03, RF-04, RF-06, RF-08, RF-09, RF-11, RF-12 | Must | Núcleo funcional e invariantes herdados; a raça (RF-06) é intrínseca às PCE |
| RF-05 | Must | Prevenção primária é premissa das PCE; DCV prévia sai do escopo |
| RF-07, RF-10 | Should | Categoria de risco e nota de proveniência ampliam valor e transparência sem prescrever conduta |
| Recomendação de estatina / PREVENT / IC / 30 anos | Won't (v1) | Fora de escopo; PREVENT seria fonte distinta, em feature própria |
| RNF de correção e coerência clínica | Must | Reproduzir as PCE exige validação por casos de referência e a mesma métrica da recomendação |
| RNF de proveniência | Must | Decisão travada: a nota de proveniência (coorte dos EUA + raça) é exibida ao médico |

## 9. Esclarecimentos

### Sessão 2026-07-23

- **Q:** Quais desfechos e horizontes estimar?
  **R:** *(revisto pelo pivô abaixo)* Inicialmente DCV total + ASCVD em 10 anos pela PREVENT; após a decisão de fonte, colapsa para **ASCVD "hard" 10 anos**, o desfecho único das PCE.
- **Q:** Incluir preditores opcionais (UACR, HbA1c, SDI)?
  **R:** *(superado pelo pivô)* Aplicava-se ao modelo estendido da PREVENT; as PCE não têm esses preditores.
- **Q:** A calculadora deve usar uma única forma de cálculo, coerente com a recomendação de conduta?
  **R:** **Sim — Pooled Cohort Equations (mundo clássico).** Raciocínio do solicitante: a recomendação de estatina em prevenção primária da USPSTF (2022) baseia-se nas PCE; adotar a PREVENT, que **diverge sistematicamente** das PCE (estima risco menor; a troca mantendo os limiares reduziria a indicação de estatina em ~14–17 milhões de adultos nos EUA, `[F]`), descasaria o risco estimado do limiar que fundamenta a conduta. Não se cruza a métrica de uma calculadora com o limiar derivado de outra. **Consequência:** a fonte da feature passa de PREVENT para PCE (RN-01); idade 40–79 (RN-02); desfecho ASCVD único (RN-04); reintrodução da variável raça (RN-05).
- **Q:** A ferramenta deve emitir a recomendação de conduta (estatina) ou apenas o risco?
  **R:** **Apenas o risco %** — mantém o invariante "o motor informa, não escolhe" (ADR 0005/RN-06); a decisão terapêutica fica com o médico.
- **Q:** Como tratar a variável raça no contexto brasileiro?
  **R:** **Seguir o *ASCVD Risk Estimator* oficial:** campo com branco / afro-americano / outra, sendo "outra" mapeada aos coeficientes de referência (branco). A limitação (categorização racial americana, mal traduzível à miscigenação brasileira) é exibida na nota de proveniência (RN-09/RF-10). Resolve a última `[DÚVIDA]`.

## 10. Lacunas

> Nenhuma lacuna aberta. Todas as dúvidas foram resolvidas nas sessões de esclarecimento de 2026-07-23. Pronto para `/reversa-plan`.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-requirements` (fonte: AHA PREVENT) | reversa |
| 2026-07-23 | `/reversa-clarify` (1ª/2ª rodadas): escopo e proveniência da PREVENT travados | reversa |
| 2026-07-23 | `/reversa-clarify` (3ª rodada): **pivô de fonte PREVENT → Pooled Cohort Equations** por coerência com a recomendação de estatina da USPSTF; ferramenta só informa o risco (ADR 0005); feature renomeada para `014-risco-cardiovascular-pce`; nova lacuna sobre a variável raça | reversa |
| 2026-07-23 | `/reversa-clarify` (4ª rodada): variável raça resolvida (branco / afro-americano / outra→referência, molde do estimador oficial; limitação na nota de proveniência); zero dúvidas abertas | reversa |
