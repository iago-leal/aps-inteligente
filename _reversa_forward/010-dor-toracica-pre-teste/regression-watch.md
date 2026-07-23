# Regression watch — feature 010-dor-toracica-pre-teste

> Data: 2026-07-23 · Cenário: legado

## Watch principal

Nenhum item. A feature é aditiva e **não alterou nem removeu regra 🟢** do `domain.md`
(ver `legacy-impact.md#modificadas`): não há regra a vigiar contra regressão na próxima
re-extração. As regras 🟢 preservadas seguem asseridas pelas suítes existentes (unidade,
integração, contrato 16/16, e2e, axe na linha de base).

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-----------------------------|---------------------|-------------------|
| — | — | — | — | — |

## Observações (sem peso de regressão)

Decisões 🟡 e pontos de leitura clínica a promover a 🟢 (ou revisar) na re-extração e na
validação pelo prescritor. IDs estáveis.

| ID | Ponto | Natureza | Como resolver |
|----|-------|----------|---------------|
| O-10-01 | Matriz `PROBABILIDADE_PRE_TESTE` (24 células do Quadro 2) nasce como constante desta feature; oráculo de teste célula a célula | fórmula/dado a confirmar | Conferência humana do prescritor contra o PDF; na re-extração, promover a 🟢 |
| O-10-02 | Ajuste por fatores de risco como faixa base×2–base×3 capada em 99% com sinal ">90%" (D-03) | inferência de implementação | Validar leitura/redação com o prescritor; ajustar o *cap* se necessário |
| O-10-03 | Estrato "baixa" definido pela descrição clínica (não anginosa **e** sem fatores), não pelo corte numérico isolado (nota ** do Quadro 2) | leitura clínica da fonte | Confirmar com o prescritor que a conduta "não investigar" segue o descritor, não o número |
| O-10-04 | Ausência de ritual de revisão na tela (D-08), espelhando a IG | decisão de design | Confirmar conforto em uso; reversível (portar o checkbox se pedido) |
| O-10-05 | Escopo da fase 1: CCS, tratamento, seguimento e manejo agudo entram como referência textual (RF-10), não calculados | escopo decidido em §9 | Reabrir como feature futura se o prescritor quiser operacionalizar parte |

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso ao rodar /reversa novamente. -->

## Arquivadas

<!-- Vazio. -->
