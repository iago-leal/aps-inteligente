# interface/cardiologia — Tela da avaliação de dor torácica

> `requirements.md` · Re-extração 2 (2026-07-23). Feature 010-dor-toracica-pre-teste.

## Visão Geral

Camada de apresentação da terceira calculadora: formulário das características da dor, fatores de risco e idade/sexo; painel de resultado com as quatro variantes de saída (sucesso, fora-do-escopo, erro, falha inesperada); advertência de angina instável em destaque; e os blocos de referência complementar consultáveis. Compõe a Moldura comum, **sem ritual de revisão** — estratificar não é prescrever dose (D-08). 🟢

## Responsabilidades

- Coletar a entrada da avaliação e submetê-la ao motor `models/cardiopatia-isquemica`. 🟢
- Gerir estado efêmero com invalidação por edição (painel "desatualizado"). 🟢
- Renderizar as quatro variantes de estado, incluindo o painel honesto de falha inesperada. 🟢
- Destacar a advertência de angina instável quando presente. 🟢
- Expor os blocos de referência complementar em `<details>` fora do cálculo (RF-10). 🟢
- Não emitir rede nem storage de dado clínico. 🟢

## Regras de Negócio

- **RN-09** Nenhum dado clínico sai da tela: sem rede, sem storage; o `relator` só transporta o nome da classe de erro. 🟢
- **D-08** Sem ritual de revisão (diferente da insulina): a conduta é orientação de investigação, não prescrição de dose. 🟢
- **Invalidação** Editar após um resultado marca `desatualizado`; "nova avaliação" remonta o formulário limpo (`key`). 🟢
- **RN-08/RF-10** Material de referência (CCS, tratamento + Tabela 1, seguimento, manejo agudo) é consultável, cada bloco cita a página da fonte. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Formulário de avaliação | Must | Coleta as 3 características, fatores, idade, sexo, impedimento e instabilidade |
| RF-02 | Painel com 4 variantes | Must | sucesso / fora-do-escopo / erro / falha-inesperada renderizados distintamente |
| RF-07 | Advertência de angina instável em destaque | Must | Com instabilidade, mensagem de encaminhamento emergencial aparece |
| RF-08 | Composição sobre a Moldura | Must | `TelaCardiologia` monta `Moldura` + `AppCardiologia` |
| RF-10 | Blocos de referência consultáveis | Should | 4 `<details>` com página da fonte, fora do cálculo |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Sem rede/storage; relator só nome de erro | `interface/cardiologia/app.tsx:3-5,48-53` | 🟢 |
| Acessibilidade | `<details>` nativo, seções rotuladas | `referencias.tsx:70-97` | 🟢 |
| Robustez | Painel honesto em exceção fora do contrato (EC-07) | `app.tsx:47-54` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma avaliação válida submetida
Quando o motor retorna resultado
Então o painel mostra classificação, probabilidade, estrato e conduta

Dado idade fora de 30–69
Quando avaliar
Então o painel mostra a variante fora-do-escopo, sem número estimado

Dado o usuário edita o formulário após um resultado
Quando altera qualquer campo
Então o painel fica marcado como desatualizado

Dado sinais de instabilidade
Quando avaliar
Então a advertência de encaminhamento emergencial aparece em destaque
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Formulário + painel de 4 variantes (RF-01/RF-02) | Must | Núcleo da tela |
| Composição sobre a Moldura (RF-08) | Must | Coerência da plataforma |
| Advertência de instabilidade (RF-07) | Must | Segurança clínica |
| Blocos complementares (RF-10) | Should | Material de consulta |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `interface/cardiologia/tela.tsx` | `TelaCardiologia` | 🟢 |
| `interface/cardiologia/app.tsx` | `AppCardiologia` | 🟢 |
| `interface/cardiologia/formulario.tsx` | `FormularioCardiologia` | 🟢 |
| `interface/cardiologia/resultado.tsx` | `PainelCardiologia` `EstadoCardiologia` | 🟢 |
| `interface/cardiologia/referencias.tsx` | `ReferenciasComplementares` | 🟢 |
