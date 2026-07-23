# Adendo — Dar função ao ritual de revisão: copiar o Plano ao prontuário

> Feature: `006-checkbox-revisao-redundante` (`_reversa_forward/006-checkbox-revisao-redundante/`)
> Data: `2026-07-22`
> Cenário: legado

## Vigência

Vigente desde 2026-07-22.

Superado pela re-extração de 2026-07-23.

## Resumo da entrega

A queixa original — o checkbox "Revisei a dose e a fonte" parecia redundante por habilitar apenas texto estático — foi resolvida por ressignificação, não remoção: com revisão confirmada e resultado atual (`revisaoValida`), o bloco "Pronto para prescrever" passa a oferecer a ação **Copiar plano**, que põe na área de transferência o plano completo em texto simples (esquema/dose → recomendações com a hierarquia da feature 005 → fonte clínica → linha de contexto de responsabilidade), sem cabeçalho "Plano:", para colar no campo Plano do prontuário. A cópia é local, por gesto explícito, sem rede e sem storage; falha degrada com orientação de transcrição manual. O motor (`models/`) permanece byte a byte intocado. Entrega: 9 de 9 ações concluídas (`progress.jsonl`), suítes 215/215 + contrato 16/16 + e2e 5/5 com axe na linha de base 0.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/domain.md` | §2 Glossário, "Ritual de revisão" | regra-alterada | Leia como: o checkbox habilita o bloco "Pronto para prescrever" **e a ação de copiar o plano**; qualquer edição desfaz revisão, ação e retorno de cópia |
| `_reversa_sdd/interface-calculadora/requirements.md` | Regras de Negócio, RN-03 | regra-alterada | "Pronto para prescrever" só com revisão confirmada e resultado atual — e, nessas mesmas condições, oferece o botão "Copiar plano" |
| `_reversa_sdd/interface-calculadora/requirements.md` | Regras de Negócio, RN-02 | regra-alterada | A invalidação por edição também retira a ação de cópia e zera o retorno ("Plano copiado" não sobrevive à invalidação) |
| `_reversa_sdd/interface-calculadora/requirements.md` | Requisitos Funcionais, RF-05 | regra-alterada | O "ritual de revisão + invalidação" segue Must, agora com consequência funcional (gate da cópia) — o Must foi fortalecido, não removido |
| `_reversa_sdd/state-machines.md` | §1 `EstadoResultado`, sub-máquina da revisão | regra-alterada | Estados e transições inalterados; o estado `confirmada` (com resultado atual) ganha efeito: ação de cópia disponível, zerada por desmonte na invalidação |
| `_reversa_sdd/architecture.md` | §2 Containers e componentes (unit `interface-calculadora`) | componente-novo | `interface/calculadora/formatar-plano.ts`: função pura `ResultadoCalculo → string` com as quatro partes do plano copiável; reutiliza `agruparRecomendacoes` e os rótulos compartilhados |
| `_reversa_sdd/architecture.md` | §2 Containers e componentes (unit `interface-calculadora`) | componente-novo | `interface/calculadora/area-de-transferencia.ts`: adaptador de clipboard com erro como valor (ADR 0004), terceiro exemplar da família `preferencia-de-tema`/`relator-de-erros` |
| `_reversa_sdd/architecture.md` | §2 Containers e componentes (unit `interface-calculadora`) | componente-novo | `interface/calculadora/rotulos.ts`: rótulos de apresentação extraídos de `resultado.tsx` (byte a byte) para uso comum de tela e formatador — fonte única anti-drift |
| `_reversa_sdd/architecture.md` | §1 Estilo arquitetural (privacidade por arquitetura) | regra-alterada | A promessa "nada é salvo nem enviado" permanece; nova fronteira local: a área de transferência do dispositivo, acionada por gesto do usuário, sem rede e sem retenção pela página |
| `_reversa_sdd/interface-calculadora/requirements.md` | Rastreabilidade de Código | componente-novo | A tabela ganha três linhas (`rotulos.ts`, `formatar-plano.ts`, `area-de-transferencia.ts`) e `resultado.tsx` passa a incluir `AcaoCopiarPlano`; testes: +8 unidade, +5 integração, +1 e2e |

Nenhum `delta-de-dados` (entidades do domínio intactas; único tipo novo é estado efêmero de UI) e nenhum `delta-de-contrato-externo` (clipboard é API do dispositivo, não rede).

## Regras sob vigilância

W001, W002, W003, W004, W005 — detalhe em `_reversa_forward/006-checkbox-revisao-redundante/regression-watch.md`, que também registra três observações 🟡 sem peso de regressão (D-04: alertas e condutas alternativas fora do texto copiado, aguardando validação do prescritor em uso real; drift formatador×tela; premissa de contexto seguro do clipboard).

## Fontes

- `_reversa_forward/006-checkbox-revisao-redundante/legacy-impact.md`
- `_reversa_forward/006-checkbox-revisao-redundante/regression-watch.md`
- `_reversa_forward/006-checkbox-revisao-redundante/requirements.md`
- `_reversa_forward/006-checkbox-revisao-redundante/progress.jsonl`
- `_reversa_forward/006-checkbox-revisao-redundante/relatorio.md`
