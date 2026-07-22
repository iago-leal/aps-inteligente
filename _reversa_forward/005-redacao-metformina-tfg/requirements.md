# Requirements: Leitura coerente das recomendações de metformina sob ajuste renal

> Identificador: `005-redacao-metformina-tfg`
> Data: `2026-07-22`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Quando a TFG (taxa de filtração glomerular) informada cai na faixa de 30–45 mL/min/1,73 m², a tela de resultado exibe hoje duas recomendações que, lidas em sequência, parecem se contradizer: "Manter a metformina ao iniciar a insulina NPH" e, ao final da lista, "TFG entre 30 e 45 mL/min/1,73 m²: reduzir a dose de metformina em 50%". A lógica clínica subjacente está correta e validada pelo prescritor (manter o fármaco, porém com dose reduzida); o problema é exclusivamente de apresentação, que abre margem à interpretação de manter a dose plena. Esta feature elimina a leitura contraditória por proximidade e subordinação: o item de ajuste por TFG passa a ser exibido imediatamente após o de manutenção, como subitem dele, com os textos preservados byte a byte e sem alterar regra, precedência, tipos ou contrato do motor. Beneficiário: o médico prescritor da APS (Atenção Primária à Saúde), que passa a ler uma conduta única e inequívoca sobre a insulina NPH (Neutral Protamine Hagedorn) e os antidiabéticos orais.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/domain.md#3.1` (regra 3) | Recomendações fixas do início: manter metformina, manter sulfonilureia (salvo negação explícita), aferição de jejum 3×/semana por 15 dias | 🟢 |
| `_reversa_sdd/domain.md#3.4` (regras transversais, via adendo 001) | RN de antidiabéticos orais: TFG 30–45 → recomendar redução de 50% da metformina; TFG < 30 → suspender (Guia p. 28/58) | 🟢 |
| `_reversa_sdd/addenda/001-integrar-design-claude.md` | Precedência vigente: `SUSPENDER_METFORMINA_TFG` suprime `MANTER_METFORMINA`; a recomendação de redução (30–45) coexiste com a de manutenção — coexistência agora validada clinicamente pelo usuário (2026-07-22) | 🟢 |
| `_reversa_sdd/code-analysis.md#módulo-1` (fachada) | Pós-processamento da fachada aplica supressões e ordenação antes da entrega à interface; as mensagens nascem nas regras de domínio | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico prescritor da APS | Ler recomendações inequívocas ao iniciar ou titular insulina NPH em paciente com função renal reduzida | Informa TFG 40 mL/min/1,73 m² e recebe uma orientação única e coerente sobre a metformina: manter, com dose reduzida em 50% |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Quando `MANTER_METFORMINA` e `REDUZIR_METFORMINA_TFG` coexistirem na mesma saída (TFG entre 30 e 45 mL/min/1,73 m²), a recomendação de redução passa a ser exibida imediatamente após a de manutenção, subordinada a ela como subitem, de modo que a redução se leia como qualificação da manutenção — uma conduta única: manter, com dose reduzida. Os textos das duas mensagens permanecem byte a byte os atuais; sem coexistência, a lista permanece como hoje. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#3.1` (regra 3), alterada pelo adendo 001
   - Tipo: alterada
2. **RN-02:** Nenhuma lógica muda: tipos de recomendação, precedências (inclusive a supressão de `MANTER_METFORMINA` por `SUSPENDER_METFORMINA_TFG`), ordenação, referências ao guia e contrato de saída do motor permanecem exatamente como estão. A alteração é restrita ao texto exibido. Validação registrada: o usuário confirmou em 2026-07-22 que "a lógica ficou perfeita", encerrando a pendência de validação clínica da precedência metformina×TFG anotada no adendo 001. 🟢
   - Origem no legado: `_reversa_sdd/addenda/001-integrar-design-claude.md` (decisão de precedência)
   - Tipo: alterada (apenas o status da validação; comportamento preservado)
3. **RN-03:** A subordinação deve ser perceptível na leitura, não apenas posicional: o item de redução aparece visualmente vinculado ao de manutenção (subitem, com recuo), preservando em ambos as citações de fonte já existentes (p. 60/62 para a manutenção; p. 58 para a redução). 🟢
   - Origem no legado: n/a — decisão do prescritor na sessão de esclarecimentos de 2026-07-22
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | No modo início, quando a saída contiver `MANTER_METFORMINA` e `REDUZIR_METFORMINA_TFG`, o item de redução por TFG é exibido imediatamente após o de manutenção, subordinado como subitem | Must | Cálculo com TFG 40 exibe o par adjacente e subordinado, com textos idênticos aos atuais; cálculo com TFG 60 (ou sem TFG) exibe a lista vigente, byte a byte e na ordem atual | 🟢 |
| RF-02 | No modo titulação com fracionamento ("Manter a metformina ao fracionar a NPH"), a mesma adjacência subordinada se aplica quando houver coexistência com `REDUZIR_METFORMINA_TFG` | Must | Titulação que fraciona com TFG 40 exibe o par adjacente e subordinado; sem TFG na faixa, lista vigente preservada | 🟡 |
| RF-03 | Fora do reposicionamento do par, o comportamento é invariante: mesmos tipos, mesma quantidade de recomendações, mesmos textos (byte a byte), mesmas referências e mesmas supressões de precedência | Must | Suíte existente permanece verde, com ajustes restritos a asserções de ordem ou estrutura da lista; nenhuma asserção de texto de mensagem é alterada | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Fonte clínica | Nenhum texto clínico muda: mensagens e citações do guia (p. 60/62 para o início; p. 58 para TFG) permanecem intocadas; nenhum conteúdo novo é introduzido | ADR 0001 (fonte clínica única — Guia SMS-Rio) | 🟢 |
| Privacidade | Sem impacto: nenhum dado novo é coletado, transmitido ou persistido | ADR 0002 (privacidade por arquitetura, client-side) | 🟢 |
| Consistência visual | A mudança não introduz componente nem estilo novo; a lista de recomendações continua renderizada pelos componentes vigentes | Adendo 004 (identidade Primer integral) | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: TFG em faixa de redução aproxima e subordina as recomendações no início
  Dado um cálculo de início com TFG igual a 40 mL/min/1,73 m²
  Quando o resultado é exibido
  Então a recomendação de reduzir a dose de metformina em 50% aparece imediatamente após a de manter a metformina, como subitem dela
  E os textos das duas recomendações são idênticos aos exibidos antes desta feature

Cenário: TFG normal preserva a redação vigente
  Dado um cálculo de início com TFG igual a 60 mL/min/1,73 m²
  Quando o resultado é exibido
  Então a recomendação exibida é "Manter a metformina ao iniciar a insulina NPH."
  E nenhuma recomendação de ajuste renal aparece

Cenário: TFG abaixo de 30 mantém a supressão vigente (caso negativo)
  Dado um cálculo de início com TFG igual a 25 mL/min/1,73 m²
  Quando o resultado é exibido
  Então a recomendação de manter a metformina não aparece
  E a recomendação de suspensão por TFG aparece, com a redação atual inalterada

Cenário: TFG ausente não altera nada (caso negativo)
  Dado um cálculo de início sem TFG informada
  Quando o resultado é exibido
  Então a lista exibida é idêntica, em texto e ordem, à vigente antes desta feature
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | É a queixa direta do prescritor: risco de interpretação de dose plena em paciente com função renal reduzida |
| RF-02 | Must | A mesma contradição existe no modo titulação; corrigir só o início deixaria o defeito vivo na outra metade do motor |
| RF-03 | Must | Garantia explícita de que a feature é de apresentação, não de lógica nem de texto clínico — condição imposta pelo próprio pedido |

## 9. Esclarecimentos

### Sessão 2026-07-22

- **Q:** Qual redação integrada deve valer quando a manutenção da metformina coexistir com a redução por TFG?
  **R:** Nenhuma. O prescritor preferiu preservar os dois textos e resolver a contradição por posição: o item de TFG exibido logo após o de manutenção, subordinado como subitem (proposta dele, com exemplo indentado). A versão inicial desta spec, que previa mensagem integrada, foi substituída por essa abordagem nas RN-01/RN-03 e nos RF-01/RF-03.
- **Q:** O item separado "TFG entre 30 e 45 mL/min/1,73 m²: reduzir a dose de metformina em 50%" continua na lista?
  **R:** Continua, com texto e citação (p. 58) intocados; muda apenas a posição, agora adjacente e subordinada ao item de manutenção. Nada é suprimido.
- **Q:** A mudança vale também para o modo titulação com fracionamento?
  **R:** Sem resposta direta; adotada por derivação (🟡, refletida no RF-02): a regra é disparada pela coexistência dos dois tipos de recomendação, independentemente do modo, e o prescritor não restringiu a proposta ao início. Se ele discordar, a reversão é localizada.

## 10. Lacunas

- Nenhuma lacuna aberta. As duas dúvidas da versão inicial foram resolvidas na sessão de esclarecimentos de 2026-07-22.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-22 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-22 | Sessão de esclarecimentos: solução muda de redação integrada para adjacência com subordinação, textos preservados byte a byte; dúvidas zeradas | reversa |
