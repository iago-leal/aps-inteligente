# interface/risco-cardiovascular — Tela da calculadora de risco cardiovascular

> `requirements.md` · Foca no QUE a unit faz. Re-extração 3 (2026-07-23), feature `014-risco-cardiovascular-pce`.
> Camada de apresentação sobre `models/risco-cardiovascular` e a `Moldura` comum. Nenhuma regra clínica própria.

## Visão Geral

Quarta tela da plataforma, no molde de `interface/cardiologia`: formulário controlado, painel de resultado honesto e um bloco de proveniência. Compõe a `Moldura` comum (D-09) com o `AppRiscoCardiovascular`. **Sem ritual de revisão** (D-08): estimar risco não prescreve dose. Nenhum dado clínico sai da tela — sem rede, sem storage (ADR 0002). 🟢

## Responsabilidades

- Coletar sexo, raça, idade, colesterol total, HDL, PAS e os toggles (tratamento anti-HAS, diabetes, tabagismo, DCV prévia). 🟢
- Delegar o cálculo à fachada `CalculadoraRiscoCardiovascular` (motor injetável para teste). 🟢
- Exibir risco em %, categoria com `Label` de variante e os `Aviso` de clamp fisiológico. 🟢
- Renderizar a nota de proveniência e o contexto metodológico (por que PCE, não PREVENT) fora do painel de resultado. 🟢
- Invalidar o resultado a cada edição (`desatualizado`) e permitir nova estimativa. 🟢
- Exibir painel honesto em falha inesperada (EC-07) reportando só o nome da classe do erro. 🟢

## Regras de Negócio

- **RF-01** A tela não calcula nada: toda regra vem do domínio; as faixas do formulário espelham as `FAIXAS` do motor. 🟢
- **RF-08** Composição sobre a `Moldura`: título "Risco Cardiovascular em 10 anos (Pooled Cohort Equations)", subtítulo com a fonte. 🟢
- **RN-09** A nota de proveniência lê `NOTA_PROVENIENCIA` do domínio (texto único, anti-drift), nunca duplica o texto. 🟢
- **D-10** `ContextoDaFonte` explica por que PCE e não a AHA PREVENT, com link `<a>` nativo à PREVENT (navegação do usuário, não requisição de rede — ADR 0002). 🟢
- **D-08** Sem checkbox de revisão nem botão "Copiar plano": estimar risco não é prescrever dose. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Formulário controlado com todos os campos da entrada | Must | 6 campos numéricos/categóricos + 4 toggles; validação no blur espelhando o domínio |
| RF-02 | Delegar ao motor e exibir resultado | Must | Resultado válido → risco %, categoria com `Label`, avisos de clamp |
| RF-03 | Tratar as três saídas do motor | Must | `resultado`/`fora-do-escopo`/`erro-validacao` renderizados distintamente |
| RF-04 | Invalidação por edição | Must | Editar após um resultado marca `desatualizado` |
| RF-05 | Nota de proveniência e contexto metodológico | Must | `NotaDeProveniencia` (Flash warning) + `ContextoDaFonte` (seção consultável) presentes |
| RF-06 | Painel honesto em falha inesperada | Should | Exceção → estado `falha-inesperada` + evento anônimo (nome da classe) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Sem `fetch`/`storage` de dado clínico; link à PREVENT é navegação, não requisição | `app.tsx`, `proveniencia.tsx` | 🟢 |
| Acessibilidade | axe-baseline 0/0 na rota; seção `aria-labelledby` no contexto | `e2e/`, `proveniencia.tsx` | 🟢 |
| Anti-drift | Proveniência e faixas lidas do domínio | `proveniencia.tsx`, `formulario.tsx` | 🟢 |
| Robustez | Motor injetável; painel honesto em exceção (EC-07) | `app.tsx:29-60` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o formulário preenchido com dados válidos de um adulto de 40–79 anos
Quando calcular
Então o painel exibe o risco em %, a categoria com Label colorido e a nota de proveniência

Dado um resultado exibido
Quando o usuário edita qualquer campo
Então o resultado é marcado como desatualizado

Dado idade fora de 40–79 ou DCV prévia
Quando calcular
Então o painel exibe a recusa de escopo, sem número

Dado o motor lança uma exceção fora do contrato
Quando calcular
Então o painel honesto aparece e um evento anônimo (só nome da classe) é reportado
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Formulário + delegação + resultado (RF-01/RF-02) | Must | Núcleo da tela |
| Três saídas do motor (RF-03) | Must | Contrato do domínio |
| Proveniência + contexto (RF-05) | Must | Limitação clínica declarada ao prescritor |
| Painel honesto (RF-06) | Should | Segurança; caso raro |

## Rastreabilidade de Código

| Arquivo | Função / Componente | Cobertura |
|---------|---------------------|-----------|
| `interface/risco-cardiovascular/tela.tsx` | `TelaRiscoCardiovascular` (Moldura + App) | 🟢 |
| `interface/risco-cardiovascular/app.tsx` | `AppRiscoCardiovascular`, `estadoDaSaida` | 🟢 |
| `interface/risco-cardiovascular/formulario.tsx` | `FormularioRiscoCardiovascular` | 🟢 |
| `interface/risco-cardiovascular/resultado.tsx` | `PainelRiscoCardiovascular`, `EstadoRiscoCardiovascular` | 🟢 |
| `interface/risco-cardiovascular/proveniencia.tsx` | `NotaDeProveniencia`, `ContextoDaFonte` | 🟢 |
