# interface/gestacao — Tela da calculadora de idade gestacional

> `requirements.md` · Re-extração 2 (2026-07-23). Feature 007-idade-gestacional-e-home.

## Visão Geral

Camada de apresentação da segunda calculadora: formulário de DUM e/ou ultrassom, com a data de referência injetada pela UI (dispositivo), e painel de resultado com IG, DPP, trimestre, veredito da comparação DUM×USG e notas ao prescritor. Compõe a Moldura comum, **sem ritual de revisão** — datar não prescreve (D-08). 🟢

## Responsabilidades

- Coletar DUM e/ou ultrassom e submeter ao motor `models/gestacao`. 🟢
- Fornecer a data de referência do dispositivo (o motor não lê o relógio), injetável para teste. 🟢
- Gerir estado efêmero com invalidação por edição. 🟢
- Renderizar resultado, erro de validação e falha inesperada (painel honesto). 🟢
- Não emitir rede nem storage de dado clínico. 🟢

## Regras de Negócio

- **RN-07** A data de referência vem da UI (`dataLocalDoDispositivo`), passada ao motor; injetável via prop `dataDeHoje` para teste. 🟢
- **RN-09** Nenhum dado clínico sai da tela: sem rede, sem storage; relator só nome de erro. 🟢
- **D-08** Sem ritual de revisão: datação é estimativa, não prescrição. 🟢
- **Invalidação** Editar após resultado marca `desatualizado`; "novo cálculo" remonta o formulário limpo. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Formulário DUM / ultrassom / ambos | Must | Aceita cada modo; entrada dupla habilita comparação |
| RF-02 | Composição sobre a Moldura | Must | `TelaIdadeGestacional` monta `Moldura` + `AppIdadeGestacional` |
| RF-03 | Painel com resultado, erro e falha | Must | Três variantes distintas + vazio |
| RF-04 | Data de referência do dispositivo | Must | Sem `dataDeHoje`, usa a data local; com prop, usa a injetada |
| RF-09 | Exibir notas e veredito | Should | Notas ao prescritor e veredito da comparação exibidos |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Sem rede/storage; relator só nome de erro | `interface/gestacao/app.tsx:5-6,58-62` | 🟢 |
| Determinismo de teste | `dataDeHoje` injetável desacopla do relógio | `app.tsx:28-44` | 🟢 |
| Robustez | Painel honesto em exceção (EC-07) | `app.tsx:57-63` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma DUM válida no formulário
Quando calcular
Então o painel mostra IG, DPP e trimestre com as referências

Dado DUM e ultrassom divergentes
Quando calcular
Então o painel mostra o veredito da comparação (confirmada / fora da margem / sem parâmetro)

Dado o usuário edita após um resultado
Quando altera um campo
Então o painel fica desatualizado

Dado nenhuma datação informada
Quando calcular
Então o painel mostra o erro NENHUMA_DATACAO_INFORMADA
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Formulário + painel (RF-01/RF-03) | Must | Núcleo da tela |
| Data de referência da UI (RF-04/RN-07) | Must | Contrato do motor (não lê relógio) |
| Composição sobre a Moldura (RF-02) | Must | Coerência da plataforma |
| Notas e veredito (RF-09) | Should | Ressalvas ao prescritor |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `interface/gestacao/tela.tsx` | `TelaIdadeGestacional` | 🟢 |
| `interface/gestacao/app.tsx` | `AppIdadeGestacional` `dataLocalDoDispositivo` | 🟢 |
| `interface/gestacao/formulario.tsx` | `FormularioIdadeGestacional` | 🟢 |
| `interface/gestacao/resultado.tsx` | `PainelIdadeGestacional` `EstadoIg` | 🟢 |
