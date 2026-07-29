# `interface/puericultura` — Requisitos

> Unit de interface gerada pelo Reversa Writer na re-extração nº 4 (2026-07-28), a partir da
> feature `017-puericultura-crescimento`. Quinta tela de calculadora da plataforma.
> Rota: `/puericultura/crescimento`.

## Visão Geral

A tela recebe as medidas de uma criança, entrega-as ao motor `models/puericultura` e exibe os
quatro índices com escore, classificação, régua usada e proveniência. Não calcula nada: o
escore é **formatado**, jamais recalculado. 🟢

## Responsabilidades

- Compor a moldura da plataforma com o formulário, o painel de resultado e o bloco de
  proveniência. 🟢
- Coletar sexo, datas, medidas, posição da medição e idade gestacional ao nascer. 🟢
- Injetar a data do dispositivo, porque o motor não lê o relógio. 🟢
- Traduzir a saída do motor na máquina de estado da tela. 🟢
- Sinalizar resultado desatualizado quando um campo muda depois do cálculo. 🟢
- Formatar o escore com uma casa decimal e sinal explícito. 🟢
- Nomear o índice pela forma neutra, deixando o rótulo clínico vir do domínio. 🟢

Fora de escopo: ritual de revisão (não há prescrição de dose aqui), persistência, impressão e
qualquer recálculo.

## Regras de Negócio

| ID | Regra | Confiança |
|----|-------|-----------|
| RN-01 | A máquina da tela tem cinco estados: `vazio`, `sucesso`, `fora-do-escopo`, `erro` e `falha-inesperada`. | 🟢 |
| RN-02 | `falha-inesperada` só ocorre quando o motor lança, o que significa violação de invariante, e o erro é reportado pelo relator injetado. | 🟢 |
| RN-03 | Editar qualquer campo depois de avaliar marca o resultado como desatualizado; avaliar de novo limpa a marca. | 🟢 |
| RN-04 | "Nova avaliação" remonta o formulário por troca de chave, e não por limpeza campo a campo. | 🟢 |
| RN-05 | O escore é exibido com uma casa decimal e sinal explícito; o valor exato permanece no domínio. | 🟢 |
| RN-06 | A tela nomeia o índice pela forma neutra; o rótulo clínico é o que o domínio devolveu, sem reescrita (`MD-0012`). | 🟢 |
| RN-07 | A data de hoje entra por parâmetro com valor padrão do dispositivo, de modo que o teste possa fixá-la. | 🟢 |
| RN-08 | O subtítulo cita o nome publicado da fonte lido do domínio, por concatenação e não por template, para que o extrator do inventário textual enxergue o literal (`MD-0021`). | 🟢 |
| RN-09 | A moldura recebe `comInicio`; `logoComoTitulo` não existe mais desde a feature 016. | 🟢 |
| RN-10 | Nenhum dado sai do navegador (ADR 0002). | 🟢 |

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|--------------------|
| RF-01 | Compor a tela com moldura, formulário, painel e proveniência. | Must | `tests/integration/interface/puericultura.test.tsx`. |
| RF-02 | Coletar a entrada completa do motor, com as três medidas opcionais. | Must | Mesmo teste. |
| RF-03 | Exibir os quatro índices, incluindo os ausentes e os fora de escopo, com o motivo. | Must | Mesmo teste, no caso do perímetro cefálico acima de dois anos. |
| RF-04 | Exibir as notas do resultado e a nota de proveniência. | Must | Mesmo teste. |
| RF-05 | Exibir os ofensores de validação junto dos campos. | Must | Mesmo teste. |
| RF-06 | Sinalizar desatualização e oferecer nova avaliação. | Should | Mesmo teste. |
| RF-07 | Aceitar motor e data injetados, para teste determinístico. | Should | Props `motor` e `dataDeHoje`. |
| RF-08 | Exibir a declaração da correção de concordância dos dois rótulos. | Must | Constante `NOTA_CORRECAO_DE_CONCORDANCIA` renderizada na proveniência. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Nenhuma chamada de rede; tudo ocorre no cliente. | `interface/puericultura/app.tsx` — sem `fetch` | 🟢 |
| Acessibilidade | Componentes do Primer, com rótulo associado a cada campo e erro anunciado. | `formulario.tsx` | 🟡 |
| Testabilidade | Motor e data injetáveis por prop, com padrão real. | `app.tsx:PropsAppCrescimento` | 🟢 |
| Observabilidade | Falha inesperada passa por relator injetado, nulo por omissão. | `interface/calculadora/relator-de-erros` | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: avaliação bem-sucedida
  Dado sexo, datas e peso preenchidos
  Quando o usuário avalia
  Então o painel mostra o índice de peso com escore de uma casa decimal e o rótulo da fonte
  E mostra a régua usada e a página da caderneta

Cenário: edição depois do resultado
  Dado um resultado em tela
  Quando o usuário altera o peso sem avaliar de novo
  Então o painel indica que o resultado está desatualizado

Cenário: recusa global
  Dado uma criança acima da cobertura da fonte
  Quando o usuário avalia
  Então nenhum escore aparece, e a tela mostra o motivo com a referência

Cenário: falha inesperada
  Dado um motor que lança
  Quando o usuário avalia
  Então a tela entra em falha-inesperada e o relator recebe o nome do erro
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Exibir escore, classificação e proveniência | Must | É o produto da tela. |
| Exibir índice ausente e fora de escopo com motivo | Must | Sem o motivo, a ausência parece defeito. |
| Formatação com uma casa e sinal | Must | Conferência contra o gráfico impresso. |
| Desatualização por edição | Should | Evita ler resultado que não corresponde ao formulário. |
| Nova avaliação por remontagem | Should | Alternativa: limpar campo a campo, mais frágil. |
| Injeção de motor e data | Should | Testabilidade. |

## Rastreabilidade de Código

| Arquivo | Função / Componente | Cobertura |
|---------|---------------------|-----------|
| `interface/puericultura/tela.tsx` | `TelaCrescimento` | 🟢 |
| `interface/puericultura/app.tsx` | `AppCrescimento`, máquina de estado | 🟢 |
| `interface/puericultura/formulario.tsx` | `FormularioCrescimento` | 🟢 |
| `interface/puericultura/resultado.tsx` | `PainelCrescimento`, `EstadoCrescimento` | 🟢 |
| `interface/puericultura/proveniencia.tsx` | `ProvenienciaDoCrescimento` | 🟢 |

**Cobertura de testes:** `tests/integration/interface/puericultura.test.tsx` e
`e2e/puericultura.spec.ts` (fluxo em navegador, com verificação de acessibilidade contra
`e2e/axe-baseline.json`).
