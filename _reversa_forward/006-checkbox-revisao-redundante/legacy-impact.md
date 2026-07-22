# Legacy Impact — 006-checkbox-revisao-redundante

> Data: `2026-07-22`
> Âncora: extração de legado (`_reversa_sdd/architecture.md` + `domain.md`), adendos 001–005 vigentes.

## 1. Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `interface/calculadora/resultado.tsx` | Painel de resultado (`_reversa_sdd/architecture.md#2`, unit `interface-calculadora`) | regra-alterada | MEDIUM | O ritual de revisão ganha consequência funcional: `AcaoCopiarPlano` montado sob `revisaoValida`; RN-02/RN-03 da unit estendidas |
| `interface/calculadora/rotulos.ts` | — (novo, extraído de `resultado.tsx`) | componente-novo | LOW | Rótulos de apresentação compartilhados; conteúdo movido byte a byte |
| `interface/calculadora/formatar-plano.ts` | — (novo) | componente-novo | MEDIUM | Projeção textual da `ResultadoCalculo` exibida (quatro partes do RF-02); nova superfície de texto clínico derivado |
| `interface/calculadora/area-de-transferencia.ts` | — (novo) | componente-novo | LOW | Adaptador de API de navegador com erro como valor (ADR 0004); terceiro exemplar da família `preferencia-de-tema`/`relator-de-erros` |
| `tests/unit/interface/formatar-plano.test.ts` | pirâmide de testes | componente-novo | LOW | 8 casos de unidade do formatador |
| `tests/integration/interface/resultado.test.tsx` | pirâmide de testes | regra-alterada | LOW | +5 casos (dublê do adaptador); nenhum caso pré-existente alterado |
| `e2e/calculadora.spec.ts` | pirâmide de testes | regra-alterada | LOW | +1 caso com leitura real da área de transferência; axe inalterado |

## 2. Diff conceitual por componente

**Painel de resultado.** O bloco "Pronto para prescrever" deixa de ser texto estático revelado pelo checkbox e passa a conter, quando `revisaoValida`, o botão "Copiar plano" com retorno de sucesso (`role="status"`) ou falha honesta (`role="alert"`, orientação de transcrição manual). A invalidação por edição segue intacta e ganha efeito adicional gratuito: o desmonte do componente de cópia zera qualquer retorno anterior. Máquina `EstadoResultado` sem estados novos — apenas a sub-máquina da revisão (state-machines §1) ganha efeito no estado `confirmada`.

**Formatador do plano.** Novo módulo puro na camada de interface que serializa a saída exibida em texto simples: esquema/dose → recomendações (com a hierarquia da feature 005, via o mesmo `agruparRecomendacoes`) → fonte clínica → linha de contexto. Alertas e condutas alternativas ficam fora por decisão D-04 (🟡, vigiada).

**Adaptador de área de transferência.** Única fronteira nova com API de plataforma; sem rede, sem storage, acionada por gesto do usuário — a privacidade por arquitetura (ADR 0002/0007) não muda de natureza.

## 3. Preservadas (regras 🟢 do legado intactas)

- Motor clínico integral: `models/` com diff vazio; R-01..R-20, AMB-01..10, precedência metformina×TFG (features 001/005) intocados.
- RN-01 da unit (privacidade): zero fetch; storage restrito ao tema — verificado por grep e pelo teste e2e de origem externa.
- RN-04 (honestidade): painel de falha inesperada, erros de validação e fora-de-escopo com textos byte a byte.
- RN-05 (reset por reconstrução), RN-06 (entrada tolerante), RN-07 (classificação de esquema): não tocadas.
- Ordem fixa do painel (alertas → dose → fonte → revisão → disclaimer) e disclaimer permanente: asserções pré-existentes seguem verdes.
- Agrupamento de recomendações da feature 005: reutilizado, não alterado.

## 4. Modificadas (regras 🟢 do legado alteradas — reconciliar por adendo)

- **`domain.md` §2, glossário "Ritual de revisão":** de "checkbox que habilita o bloco 'Pronto para prescrever'" para "checkbox que habilita o bloco e a ação de copiar o plano ao prontuário; qualquer edição o desfaz e zera a cópia".
- **Unit `interface-calculadora`, RN-03:** "Pronto para prescrever" só com revisão e resultado atual **e agora oferece a ação de cópia** nessas mesmas condições.
- **Unit `interface-calculadora`, RN-02:** a invalidação por edição passa a também retirar a ação e o retorno de cópia.
- **`state-machines.md` §1:** sub-máquina da revisão ganha efeito colateral no estado `confirmada` (ação de cópia disponível); estados e transições inalterados.
