# `interface/puericultura/consulta` — Requisitos

> Unit de interface gerada pelo Reversa Writer na re-extração nº 4 (2026-07-28), a partir da
> feature `020-consulta-puericultura-soap`. Sexta tela da plataforma, e a **primeira cujo
> produto não é um número**.
> Rota: `/puericultura/consulta`.

## Visão Geral

A tela apresenta a ficha da consulta de puericultura correspondente à idade da criança,
recebe o preenchimento e exibe, ao lado, o registro em SOAP pronto para colar num prontuário.
O registro é **derivado** do preenchimento, e não submetido: não há botão de gerar. 🟢

## Responsabilidades

- Coletar a identificação mínima da consulta: sexo, data de nascimento, data da consulta e,
  opcionalmente, idade gestacional ao nascer. 🟢
- Sugerir a ficha pela idade e permitir a troca livre por qualquer das dez. 🟢
- Renderizar os campos da ficha conforme a natureza de cada um. 🟢
- Derivar o texto do registro a cada mudança, e entregar o mesmo texto à área de
  transferência. 🟢
- Abrir, sob demanda, o painel que avalia o crescimento e devolve o resultado ao registro. 🟢
- Avisar, antes de tudo, que nada do que se preenche é salvo. 🟢

Fora de escopo: persistir, imprimir, exportar em arquivo, e submeter o registro a qualquer
lugar.

## Regras de Negócio

| ID | Regra | Confiança |
|----|-------|-----------|
| RN-01 | **Não há ritual de revisão.** Ele existe onde se prescreve dose (ADR 0012), e preencher ficha não prescreve. | 🟢 |
| RN-02 | **Não há invalidação por edição.** Aqui a edição **é** o preenchimento, e um aviso de "desatualizado" acusaria como defeito o comportamento normal da tela. | 🟢 |
| RN-03 | O registro é derivado por memorização a cada mudança, e não submetido por comando. | 🟢 |
| RN-04 | O texto exibido e o texto copiado são **a mesma variável**, e a identidade é estrutural. | 🟢 |
| RN-05 | Sem identificação suficiente — sexo, nascimento ou data da consulta em falta — não há contexto, e a ficha não é oferecida. | 🟢 |
| RN-06 | Data em ordem impossível derruba o contexto para nulo, sem quebrar a tela. | 🟢 |
| RN-07 | A ficha sugerida vem da idade cronológica; a troca é livre e o seletor mostra qual era a sugerida. | 🟢 |
| RN-08 | O painel de crescimento carrega sob demanda, por importação dinâmica: quem não o abre não paga as tabelas antropométricas no primeiro carregamento. | 🟢 |
| RN-09 | Responder um campo grava a resposta no mapa; limpar a resposta a remove, e o campo deixa de existir no registro. | 🟢 |
| RN-10 | O aviso de não persistência aparece antes de qualquer campo, e não ao final. | 🟢 |
| RN-11 | A moldura recebe `comInicio`, e o subtítulo cita a fonte por concatenação (`MD-0021`). | 🟢 |
| RN-12 | Nenhum dado sai do navegador (ADR 0002). | 🟢 |

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|--------------------|
| RF-01 | Compor a tela com moldura, aviso, identificação, seletor, ficha, painel e registro. | Must | `tests/integration/interface/consulta-puericultura.test.tsx`. |
| RF-02 | Derivar o contexto a partir da identificação, tolerando entrada incompleta. | Must | Mesmo teste. |
| RF-03 | Sugerir e permitir trocar a ficha. | Must | Mesmo teste. |
| RF-04 | Renderizar as quatro naturezas de campo com o controle adequado a cada uma. | Must | Mesmo teste. |
| RF-05 | Filtrar os campos por sexo, sem condicional própria: o filtro é o do domínio. | Must | Mesmo teste, na ficha do 2.º mês. |
| RF-06 | Exibir o registro derivado, atualizado a cada resposta. | Must | Mesmo teste. |
| RF-07 | Copiar exatamente o texto exibido. | Must | Mesmo teste, com a função de cópia injetada. |
| RF-08 | Abrir o painel de crescimento e incorporar o resultado ao registro. | Should | Mesmo teste. |
| RF-09 | Exibir o aviso de que nada é salvo. | Must | Mesmo teste. |
| RF-10 | Carregar o painel sob demanda. | Should | `next/dynamic` com `ssr: false`. |
| RF-11 | Aceitar a função de cópia e a data de hoje injetadas. | Should | Props `copiar` e `dataDeHoje`. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Nada é salvo nem enviado; o preenchimento vive em memória e some ao recarregar. | `app.tsx` — estado em `useState`; sem `fetch`, sem armazenamento | 🟢 |
| Desempenho | O painel de crescimento, que arrasta o acervo tabular, só carrega quando aberto. | `app.tsx:next/dynamic` | 🟢 |
| Acessibilidade | Controles do Primer; foco preso no painel e retorno ao gatilho. | `painel-crescimento.tsx`, `refDoPainel` | 🟡 |
| Testabilidade | Cópia e data injetáveis. | `app.tsx:PropsAppConsulta` | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: preenchimento e registro derivado
  Dado sexo, nascimento e data da consulta preenchidos
  Quando o usuário responde três campos da ficha
  Então o registro exibido traz esses três itens, nas seções corretas
  E responder mais um campo atualiza o registro sem qualquer comando

Cenário: identidade entre exibido e copiado
  Dado um registro em tela
  Quando o usuário aciona a cópia
  Então o texto entregue é idêntico ao exibido, caractere por caractere

Cenário: identificação incompleta
  Dado apenas o sexo preenchido
  Então nenhuma ficha é oferecida, e a tela permanece utilizável

Cenário: troca de ficha
  Dado a ficha do 6.º mês sugerida
  Quando o usuário escolhe a do 9.º mês
  Então a ficha aberta é a escolhida, e o seletor continua indicando qual era a sugerida

Cenário: avaliação de crescimento incorporada
  Dado peso e comprimento preenchidos na ficha
  Quando o usuário abre o painel e avalia
  Então o registro passa a trazer os escores na seção Objetivo e a classificação na Avaliação
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Registro derivado e copiável | Must | É o produto da tela. |
| Identidade entre exibido e copiado | Must | Um registro clínico diferente do que se leu seria falha grave. |
| Sugestão e troca de ficha | Must | A sugestão é premissa 🟡; a troca é o que a torna barata. |
| Filtro por sexo delegado ao domínio | Must | Duplicá-lo na tela criaria segunda fonte da regra. |
| Aviso de não persistência | Must | O usuário precisa saber antes de digitar, não depois. |
| Painel sob demanda | Should | Ganho de carregamento; sem ele a tela ainda funciona. |
| Injeção de cópia e data | Should | Testabilidade. |

## Rastreabilidade de Código

| Arquivo | Função / Componente | Cobertura |
|---------|---------------------|-----------|
| `interface/puericultura/consulta/tela.tsx` | `TelaConsulta` | 🟢 |
| `interface/puericultura/consulta/app.tsx` | `AppConsulta` | 🟢 |
| `interface/puericultura/consulta/identificacao.tsx` | `IdentificacaoDaConsulta` | 🟢 |
| `interface/puericultura/consulta/seletor-de-ficha.tsx` | `SeletorDeFicha` | 🟢 |
| `interface/puericultura/consulta/ficha.tsx` | `FichaPreenchivel` | 🟢 |
| `interface/puericultura/consulta/registro.tsx` | `BlocoDoRegistro` | 🟢 |
| `interface/puericultura/consulta/formatar-registro.ts` | `formatarRegistro` | 🟢 |
| `interface/puericultura/consulta/painel-crescimento.tsx` | `PainelDeCrescimento` | 🟢 |
| `interface/puericultura/consulta/proveniencia.tsx` | `ProvenienciaDaConsulta`, `AvisoDeNaoPersistencia` | 🟢 |

**Cobertura de testes:** `tests/integration/interface/consulta-puericultura.test.tsx` e
`e2e/consulta-puericultura.spec.ts` (fluxo em navegador, incluindo a cópia real do registro e a
verificação de acessibilidade).
