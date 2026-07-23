# Regression watch: Leitura coerente das recomendações de metformina sob ajuste renal

> Identificador: `005-redacao-metformina-tfg`
> Data: `2026-07-22`

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|------------------------------|----------------------|-------------------|
| W001 | `_reversa_sdd/interface-calculadora/requirements.md` (painel de resultado); `interface/calculadora/agrupar-recomendacoes.ts` | Quando `MANTER_METFORMINA` e `REDUZIR_METFORMINA_TFG` coexistem na saída, a UI renderiza a redução como subitem (lista aninhada) imediatamente sob a manutenção; sem coexistência, lista plana idêntica à anterior | presença | Re-extração descreve a lista como plana nesse cenário, ou o subitem some/vira item de topo com o pai presente |
| W002 | `_reversa_sdd/domain.md#3.1` (regra 3) e `#3.4` (transversais, adendo 001) | A reestruturação é só de apresentação: textos das mensagens, referências (p. 58; p. 60/62), ordem de saída do motor e supressão `SUSPENDER_METFORMINA_TFG` → `MANTER_METFORMINA` permanecem byte a byte | redação | Qualquer diff em `models/insulina/` atribuído a esta feature; mensagem do par com texto diferente do catálogo `fonte-clinica.ts` |
| W003 | `interface/calculadora/agrupar-recomendacoes.ts` (fallback D-02) | `REDUZIR_METFORMINA_TFG` sem `MANTER_METFORMINA` na mesma saída (titulação sem fracionamento) permanece item de topo, nunca é ocultada | presença | Recomendação de redução ausente da lista quando o motor a emitiu |

## Observações (sem peso de regressão)

- A aplicação do agrupamento ao modo titulação com fracionamento (RF-02) deriva de premissa 🟡 (roadmap §4): o prescritor não a confirmou diretamente. Se a validação em uso real a derrubar, remover o par do mapa `SUBORDINACOES` condicionado ao modo e atualizar o requirements — não é regressão, é decisão pendente.

## Histórico de re-extrações

### Re-extração 2026-07-23 14:10

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | `agrupar-recomendacoes.ts`: `REDUZIR_METFORMINA_TFG` como subitem sob `MANTER_METFORMINA` quando coexistem (`interface-calculadora/design.md` §Fluxos Alternativos) |
| W002 | 🟢 verde | só apresentação; `models/insulina/` intocado byte a byte (git); textos, referências e supressão preservados (`domain.md` §3.4) |
| W003 | 🟢 verde | `REDUZIR_METFORMINA_TFG` sem `MANTER_METFORMINA` permanece item de topo (fallback D-02, design) |

## Arquivadas

<!-- Vazio na criação. -->
