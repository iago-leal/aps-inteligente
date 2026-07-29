# `interface/puericultura` — Design Técnico

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `017-puericultura-crescimento`.
> Cinco arquivos, 774 LOC. Componentes React sobre o Primer (ADR da feature 004).

## Interface

| Símbolo | Assinatura | Observação |
|---------|-----------|------------|
| `TelaCrescimento` | `()` | Composição da `Moldura` com o app. Consome `NOME_PUBLICADO` do domínio. |
| `AppCrescimento` | `({ relator?, motor?, dataDeHoje? })` | Máquina de estado e orquestração. |
| `FormularioCrescimento` | `({ onAvaliar, onAlteracao, dataDeHoje })` | Coleta e submissão. |
| `PainelCrescimento` | `({ estado, desatualizado, onNovaAvaliacao })` | Exibição do resultado. |
| `ProvenienciaDoCrescimento` | `()` | Notas de proveniência e correção de concordância. |

### A máquina `EstadoCrescimento`

```
vazio ──avaliar──▶ sucesso | fora-do-escopo | erro | falha-inesperada
  ▲                         │
  └────nova avaliação───────┘
```

| Estado | Origem | O que a tela mostra |
|--------|--------|---------------------|
| `vazio` | inicial, ou após nova avaliação | formulário sem painel |
| `sucesso` | saída `resultado` | quatro índices, notas, referências |
| `fora-do-escopo` | saída `fora-do-escopo` | motivo e referência, sem número algum |
| `erro` | saída `erro-validacao` | ofensores junto dos campos |
| `falha-inesperada` | exceção do motor | mensagem genérica; o relator registra o nome |

`desatualizado` é sinalizador à parte, e não estado: ele se combina com `sucesso`,
`fora-do-escopo` e `erro` sem multiplicar a máquina. 🟢

## Fluxo Principal

1. `AppCrescimento` instancia o motor uma vez, por `useMemo`, e resolve a data de hoje.
2. O formulário coleta e chama `onAvaliar` com a `EntradaAvaliacao` montada.
3. `estadoDaSaida` traduz a união do domínio na união da tela — tradução direta, sem regra.
4. Qualquer alteração posterior chama `onAlteracao`, que marca desatualização se já houver
   resultado.
5. "Nova avaliação" zera o estado e incrementa a geração do formulário, o que o remonta.

## Dependências

- `models/puericultura` — a fachada e os tipos. Único acoplamento ao domínio.
- `interface/comum/moldura` — enquadramento da plataforma, com `comInicio`.
- `interface/calculadora/relator-de-erros` — contrato de relato, com implementação nula por
  omissão. Reúso da primeira tela, não duplicação.
- Primer React, para os componentes de formulário e painel.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| O escore é formatado, nunca recalculado na tela. | `resultado.tsx` | 🟢 |
| A tela usa a forma neutra do índice; o rótulo clínico vem do domínio. | `MD-0012` | 🟢 |
| Desatualização como sinalizador, não como estado. | `app.tsx` | 🟢 |
| Nova avaliação remonta o formulário por chave. | `app.tsx:geracaoFormulario` | 🟢 |
| O subtítulo é concatenação, não template, para o extrator do inventário textual enxergar o literal. | `tela.tsx`; `MD-0021` | 🟢 |
| A data do dispositivo entra por prop com padrão, o que mantém o teste determinístico sem falsear o relógio. | `app.tsx:dataLocalDoDispositivo` | 🟢 |
| Sem ritual de revisão: ele existe só onde há prescrição de dose (ADR 0012). | ausência deliberada | 🟢 |

## Estado Interno

Três peças de estado local: a máquina, o sinalizador de desatualização e a geração do
formulário. Nada persiste entre recarregamentos. 🟢

## Observabilidade

Somente o relator de erros, injetado e nulo por omissão. Nenhum log em produção, nenhuma
métrica, coerente com a telemetria nula (ADR 0007). 🟢

## Riscos e Lacunas

- 🟡 A acessibilidade herda o que o Primer oferece; não há auditoria própria desta tela além
  do teste de integração.
- 🟡 A data do dispositivo é a data local do navegador. Relógio errado no aparelho produz
  idade errada, e a tela não tem como saber.
- 🟢 Nenhuma chamada de rede, nenhum armazenamento.
