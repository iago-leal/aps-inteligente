# Regression Watch — Calculadora de risco cardiovascular (PCE)

> Feature `014-risco-cardiovascular-pce` · 2026-07-23

Itens que a próxima re-extração (`/reversa`) deve reconfirmar. A feature é aditiva: uma regra de catálogo mudou de cardinalidade (W002); os demais itens vigiam invariantes de domínio 🟢 que a unit nova precisa continuar honrando e o isolamento dos motores existentes.

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-------------------------------|---------------------|-------------------|
| W001 | `models/{insulina,gestacao,cardiopatia-isquemica}` (architecture.md #1) | Os três motores existentes permanecem **byte a byte**; a unit nova não os importa nem os altera | ausência (de diff) | `git diff` de qualquer um dos três motores deixa de ser vazio |
| W002 | `interface/inicio/catalogo.ts` (addendum 010, seção `cardiologia`) | A seção `cardiologia` expõe **duas** calculadoras (dor torácica + risco cardiovascular); a ficha da dor torácica preservada byte a byte | presença | A seção volta a ter só uma ficha, ou a ficha da dor torácica muda título/descrição/rota |
| W003 | `models/risco-cardiovascular/calculadora.ts` (ADR 0005) | O motor apenas **informa** risco % + categoria; nenhuma conduta emitida (nada de estatina/prescrição) | presença/redação | Surge campo de conduta na `ResultadoEstimativa` ou texto de recomendação na tela |
| W004 | `models/risco-cardiovascular/fonte-clinica.ts` (ADR 0011) | Fonte clínica **única** da unit: coeficientes PCE (Goff 2013) congelados, sem mesclar com a cardiopatia | presença | A unit passa a importar de outra fonte clínica ou a duplicar coeficientes de outra unit |
| W005 | `tests/unit/dominio-risco-cardiovascular/` (RF-06/RF-08) | *Golden cases* das PCE dentro de ±0,1 pp e invariante "toda saída de resultado carrega ≥1 referência" | presença (teste verde) | Qualquer golden case diverge > 0,1 pp ou o invariante de referência falha |
| W006 | `_reversa_sdd/architecture.md §3` · `e2e/axe-baseline.json` | Contrato externo intocado: `GET /api/v1/status` byte a byte, zero requisição de rede na tela nova, axe 0/0 na rota | ausência | Aparece requisição de rede na rota nova, o status muda, ou o axe da rota excede zero |

## Histórico de re-extrações


### Re-extração 2026-07-23 21:40 (nº 3 — absorve features 011–014)

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | `git diff 51168cf..4f2a334` só toca `interface/inicio/catalogo.ts` (+6); os três motores existentes byte a byte |
| W002 | 🟢 verde | `catalogo.ts` seção `cardiologia` com 2 fichas; ficha da dor torácica preservada; nova ficha de risco adicionada |
| W003 | 🟢 verde | `ResultadoEstimativa` não tem campo de conduta; motor informa risco % + categoria (ADR 0005) |
| W004 | 🟢 verde | `fonte-clinica.ts` só importa `./tipos`; coeficientes PCE (Goff 2013) congelados, sem mesclar |
| W005 | 🟢 verde | `vitest run tests/unit/dominio-risco-cardiovascular` → 31/31 passaram (golden cases + invariante de referência) |
| W006 | 🟢 verde | tela sem `fetch`/`storage`; link à PREVENT é `<a>` nativo; `status.ts` intocado; e2e/axe verde no coding |
<!-- Preenchido pelo agente reverso quando `/reversa` rodar de novo. -->

## Arquivadas

<!-- Vazio nesta rodada. -->

## Observações (sem peso de regressão)

- **D-07 (🟡):** valor fora da faixa fisiológica (colesterol 130–320, HDL 20–100, PAS 90–200) é **clampado ao limite e sinalizado por aviso**, não travado. Comportamento reversível, alinhado ao ASCVD Estimator oficial (ADR 0006); validar em uso.
- **D-06 (🟡):** DCV prévia é tratada como `fora-do-escopo` (motivo `DCV_PREVIA`), com precedência sobre idade fora da faixa. Reagrupável numa variante própria se a UX pedir mensagem mais rica.
- **Proveniência (RF-10):** a nota de limitação (coorte dos EUA + categorias raciais norte-americanas, sem calibração para o Brasil) é fonte textual única congelada no domínio; reconfirmar que a tela a exibe.
- **Coeficientes (ressalva de verificação):** a Tabela A não foi lida do PDF primário (paywall, MD-0008); os valores vêm de duas implementações R independentes que a reproduzem e concordam. Conferir contra o Work Group Report Supplement quando disponível.
- **D-10 (contexto PCE × PREVENT):** a tela exibe um bloco metodológico, fora do painel de resultado, com link `<a>` externo para `professional.heart.org` (calculadora PREVENT). É navegação do usuário, **não** requisição de rede — não viola W006; a menção à estatina é metodológica (justifica a escolha da fonte), não conduta ao paciente (ADR 0005). Uma futura extração deve ler esse link como referência editorial, não como dependência de rede.
