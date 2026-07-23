# Investigação — dor torácica e probabilidade pré-teste

> Feature `010-dor-toracica-pre-teste` · 2026-07-23
> Pesquisa de fundo e alternativas avaliadas para o roadmap.

## 1. Fonte clínica

- **TeleCondutas — Cardiopatia Isquêmica.** TelessaúdeRS-UFRGS, versão digital 2017. Material de apoio à decisão para médicos e enfermeiros da APS. Terceira fonte clínica da plataforma (após o *Guia Rápido Diabetes Mellitus* SMS-Rio 2023 e o *Guia Rápido Pré-Natal* SMS-Rio 2025). PDF a guardar em `referencias/`, fora do versionamento (MD-0008, estendido pela feature 007).
- Fontes primárias citadas pelo material, relevantes para rastreabilidade:
  - **Quadro 1 (classificação da dor):** CESAR et al., *Diretriz de doença coronária estável*, Arq. Bras. Cardiol. 103(2, supl. 2), 2014.
  - **Quadro 2 (probabilidade pré-teste):** DUNCAN et al., *Medicina Ambulatorial*, 4ª ed., Artmed, 2013 — dados combinados de **Diamond/Forrester** e **Registro CASS**.
  - **Quadro 3 (classificação funcional CCS):** CESAR et al., 2014.
  - **Quadro 4 (interpretação do teste ergométrico):** adaptado de GRIFFIN, *Manual of cardiovascular medicine*, 4ª ed., 2013.

## 2. Conteúdo mapeado (página → uso na feature)

| Trecho | Página do PDF | Uso |
|--------|---------------|-----|
| Quadro 1 — classificação clínica da dor (3 características) | p. 4 | RN-01 (núcleo) |
| Quadro 2 — probabilidade pré-teste por idade/sexo (24 células) | p. 5 | RN-02 (núcleo) |
| Nota * — fatores de risco aumentam 2–3× | p. 5 | RN-03 (núcleo) |
| Estratos < 10% / 10–90% / > 90% e conduta; causas não cardíacas | p. 4-5 | RN-04 (núcleo) |
| Exames complementares: ergometria vs. método não invasivo | p. 6 | RN-05 (núcleo) |
| Angina instável (repouso / recente CCS III-IV / crescendo) | p. 6 | RN-07 (advertência) |
| Quadro 3 — CCS I-IV | p. 5 | RN-08/RF-10 (referência) |
| Acompanhamento e periodicidade na APS | p. 8-9 | RN-08/RF-10 (referência) |
| Tratamento farmacológico + Tabela 1 de medicamentos | p. 9-11 | RN-08/RF-10 (referência) |
| Manejo da doença arterial aguda; encaminhamento | p. 12 | RN-08/RF-10 (referência) |

## 3. Alternativas avaliadas

| Questão | Opção escolhida | Descartadas e porquê |
|---------|-----------------|----------------------|
| Origem do número de probabilidade | **Tabela do Quadro 2 congelada** (lookup por classe × sexo × faixa) | Calcular pelo escore de Diamond-Forrester: introduz fórmula não presente no material, viola "a calculadora cobre o que o guia cobre" (MD-0009) e abre divergência com a fonte |
| Ajuste por fatores de risco | **Faixa base×2–base×3 capada** (D-03) | Multiplicador único (×2,5): esconde a incerteza que o guia declara. Ignorar o ajuste: contraria a nota do Quadro 2 e a regra de estrato "baixa" |
| Idade fora de 30–69 | **`ForaDoEscopoDaFonte`** honesto | Extrapolar a tabela: inventa número sem lastro na fonte |
| Estrutura do domínio | **Unit própria espelhando `models/gestacao`** | Reaproveitar `models/insulina`: acoplaria motores clínicos distintos, contra ADR 0003 |
| Ritual de revisão na tela | **Sem ritual** (D-08), como a IG | Portar o checkbox "Revisei" da insulina: a saída não prescreve dose; atrito sem ganho — reversível se o prescritor pedir |
| Material adicional (CCS, tratamento) | **Blocos de referência textual** (RF-10) | Operacionalizar tratamento farmacológico agora: amplia escopo além do pedido; fica para feature futura |

## 4. Padrões aplicáveis do legado

- **Erros como valores** (ADR 0004): entrada inválida e fora-de-escopo são variantes de união, não exceções; exceção só para bug interno (`ErroDeInvariante` → painel honesto).
- **Toda saída referenciada** (`_reversa_sdd/domain.md#3.4`, invariante R-20 análogo): cada resultado carrega `ReferenciaClinica` com quadro/página; verificável por property-based.
- **Validação com coleta total de ofensores** (`validacao.ts` do legado): nunca parar no primeiro erro; o domínio revalida sem confiar na UI (EC-08).
- **Fonte única de navegação** (adendo 007): a ficha nasce no `catalogo.ts`; a rota apenas a referencia.
- **Espelhamento de constantes UI↔domínio** (`_reversa_sdd/domain.md#3.5`): faixas de validação importadas do domínio, sem segunda fonte de números.

## 5. Pontos a validar com o prescritor (viram watch no coding)

1. Transcrição fiel das 24 células do Quadro 2.
2. Mecânica e redação do *cap* da faixa de fatores de risco (D-03).
3. Conforto com a ausência de ritual de revisão (D-08).
4. Rótulos finais da seção/ficha e da rota (§9 do requirements: "Cardiologia" / `/cardiologia/dor-toracica`).
