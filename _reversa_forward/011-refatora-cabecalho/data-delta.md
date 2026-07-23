# Data Delta: Refatoração do cabeçalho

> Feature: `011-refatora-cabecalho` · Data: `2026-07-23`

## Resumo

**Nenhum delta de dados.** A feature é puramente de apresentação e navegação.

## Detalhe

- Nenhuma tabela, coluna, índice ou constraint criada, alterada ou removida — o banco (feature 003) não guarda dado clínico e não é tocado.
- Nenhum campo novo em memória ou em contrato.
- A única preferência persistida — o tema — já é gravada/lida por `interface/calculadora/preferencia-de-tema` (localStorage no cliente), e seu formato **não muda**. A refatoração troca apenas o controle de UI que dispara `gravarTema`.
- Nenhuma migração necessária.

## Regressão de dados a vigiar

- `GET /api/v1/status` permanece byte a byte (nenhum campo novo, mesmo shape).
- `data-tema` continua sendo o marcador observável de preferência, com os mesmos valores `"claro"`/`"escuro"`.
