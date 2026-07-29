# `interface/puericultura/consulta` — Design Técnico

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `020-consulta-puericultura-soap`.
> Nove arquivos, 1.055 LOC.

## Interface

| Símbolo | Assinatura | Observação |
|---------|-----------|------------|
| `TelaConsulta` | `()` | Moldura com título, subtítulo citando pp. 66–75 e `comInicio`. |
| `AppConsulta` | `({ copiar?, dataDeHoje?, motorDeCrescimento? })` | Orquestração e derivação. |
| `IdentificacaoDaConsulta` | `({ sexo, nascimento, consulta, igSemanas, igDias, on*, contexto })` | Coleta e devolve o contexto derivado ao usuário. |
| `SeletorDeFicha` | `({ fichas, fichaEscolhida, fichaSugerida, onEscolher })` | Troca livre, com a sugerida assinalada. |
| `FichaPreenchivel` | `({ ficha, sexo, preenchimento, onResposta })` | Renderiza seções e campos. |
| `BlocoDoRegistro` | `({ texto, copiar })` | Exibe e copia o mesmo valor. |
| `formatarRegistro` | `(registro: RegistroDaConsulta) → string` | Projeção pura; ver `contracts.md` do domínio. |
| `PainelDeCrescimento` | `({ ficha, preenchimento, contexto, posicao, ... })` | Carregado por `next/dynamic`. |

## As três diferenças em relação às cinco telas anteriores

Cada uma tem razão registrada, e juntas explicam por que esta tela não segue o molde:

1. **Sem ritual de revisão.** O ritual existe onde há prescrição de dose (ADR 0012).
   Preencher ficha não prescreve nada.
2. **Sem invalidação por edição.** Nas calculadoras, editar depois de calcular marca o
   resultado como desatualizado. Aqui a edição **é** o preenchimento, e o aviso acusaria
   como defeito o comportamento normal.
3. **Registro derivado, não submetido.** Um `useMemo` produz a cadeia que a tela exibe e o
   comando de cópia entrega. Não há botão de gerar, e não há estado de "resultado".

## Fluxo Principal

1. A identificação alimenta o `contexto`, derivado por `useMemo`. Entrada incompleta ou datas
   impossíveis produzem `null`, e a tela permanece utilizável.
2. Com contexto, a fachada sugere a ficha. A escolha do usuário, quando existe, prevalece
   sobre a sugestão.
3. `FichaPreenchivel` renderiza os campos aplicáveis ao sexo — o filtro é o do domínio,
   invocado, e não reimplementado.
4. Cada resposta atualiza um `Map` imutável: gravar quando há valor, remover quando não há.
5. `textoDoRegistro` recompõe a projeção a cada mudança de ficha, contexto, preenchimento ou
   avaliação.
6. O painel de crescimento, quando aberto, avalia e devolve o `ResultadoAvaliacao`, que entra
   na próxima derivação.

```
identificação → contexto → ficha sugerida ─┐
                                            ├→ montar → formatar → texto ─┬→ exibir
preenchimento ──────────────────────────────┤                             └→ copiar
avaliação de crescimento (opcional) ────────┘
```

## Dependências

- `models/puericultura/consulta` — fachada, tipos e filtro por sexo.
- `models/puericultura/idades` — `derivarIdades`, para montar o contexto.
- `interface/comum/moldura`, `interface/calculadora/area-de-transferencia` — reúso.
- `next/dynamic` — carregamento sob demanda do painel.
- Primer React — controles e diálogo.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Uma função, uma variável, dois consumidores: a identidade entre exibido e copiado é da construção. | `app.tsx:textoDoRegistro`; `formatar-registro.ts` | 🟢 |
| Importação dinâmica do painel, com `ssr: false`. | `app.tsx` | 🟢 |
| O contexto nulo é estado normal, e não erro: a tela funciona incompleta. | `app.tsx:contexto` | 🟢 |
| A troca de ficha é estado próprio, e a sugestão continua visível. | `app.tsx:fichaTrocada` | 🟢 |
| O aviso de não persistência abre a tela. | `app.tsx`, primeiro filho | 🟢 |
| O filtro por sexo é invocado do domínio, jamais duplicado aqui. | `ficha.tsx` chama `camposAplicaveis` | 🟢 |
| A referência ao botão do painel existe para devolver o foco ao fechar. | `app.tsx:refDoPainel` | 🟢 |

## Estado Interno

Sete peças de estado local: os cinco campos da identificação mais posição, o mapa de
preenchimento, a ficha trocada, a abertura do painel e a avaliação. Nada persiste. O mapa é
substituído a cada resposta, nunca mutado. 🟢

## Observabilidade

Nenhuma. Sem relator, porque não há chamada que possa lançar por invariante: a fachada da
consulta não lança em uso normal, e o painel de crescimento tem o seu próprio caminho. 🟡

## Riscos e Lacunas

- 🟡 **A ficha sugerida pode não ser a esperada** entre duas consultas previstas, e a premissa
  está declarada no domínio. A troca é de um clique, o que torna o custo do erro pequeno.
- 🟡 **Acessibilidade herdada do Primer**, com o diálogo prendendo foco e devolvendo-o ao
  gatilho. Não há auditoria própria além do teste de integração.
- 🟡 **O registro some ao recarregar.** É decisão, e a tela avisa; ainda assim é a queixa mais
  provável de quem usa em consulta longa.
- 🟢 Nenhuma chamada de rede, nenhum armazenamento, nenhum identificador de paciente.
