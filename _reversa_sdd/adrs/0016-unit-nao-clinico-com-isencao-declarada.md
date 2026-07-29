# ADR 0016 — Matéria não clínica entra em `models/` com isenção declarada

> Retroativo, reconstruído pelo Reversa Detective (2026-07-28, re-extração nº 4) a partir da feature 019 (`019-contribuicao-voluntaria-pix`), do adendo 019 e da ficha `MD-0022`. Confiança: 🟢

## Contexto

Até a feature 019, toda pasta sob `models/` era um domínio clínico, e a extração descrevia a família por uma tabela de invariantes que o Reversa confere linha a linha a cada passagem: domínio puro, erro como valor, coleta total de ofensores, uma fonte clínica única, `ReferenciaClinica` em toda saída e constantes congeladas em `fonte-clinica.ts`.

A contribuição voluntária via PIX não é matéria clínica. O módulo que monta o BR Code obedece a uma especificação do Banco Central, não a um guia clínico; não tem página a citar, não emite referência bibliográfica e não pertence ao catálogo congelado. Colocá-lo em `models/` sem dizer nada faria a re-extração seguinte ler **três violações** onde havia uma decisão, e o revisor gastaria a sessão descobrindo que a ausência era intencional.

## Decisão

O unit não clínico **entra pela porta normal da arquitetura**, e não por uma porta lateral, com a isenção escrita em **duas camadas**.

Na camada de código, `models/contribuicao` é lógica pura fora do framework, na disciplina do ADR 0003, e conserva os invariantes de **disciplina**: pureza, erro como valor, coleta total de ofensores, ausência de relógio e de aleatoriedade. Fica **explicitamente isento** dos invariantes de **fonte**: não tem fonte clínica única (ADR 0001/0011), não emite `ReferenciaClinica` e não participa do catálogo congelado nem da linha de base de citação. A isenção mora no cabeçalho da própria fachada e na spec, e não na cabeça de quem escreveu.

Na camada de tela, o comando de apoio fica **fora do fluxo de decisão clínica**: nenhuma calculadora exibe pedido de contribuição ao lado de conduta recomendada, e o bloco vive na home, fora do `map` do `CATALOGO`.

Em consequência, a tabela de invariantes da família passa a declarar o **alcance** de cada linha, em vez de generalizar para toda pasta de `models/`.

## Alternativas consideradas

- **Pasta irmã fora de `models/`** (por exemplo `apoio/` ou `integracoes/`): descartada porque criaria uma segunda casa para lógica pura, com regras próprias a inventar, sem que o módulo tivesse qualquer diferença de natureza técnica em relação aos demais. O que ele dispensa é a fonte clínica, não a disciplina.
- **Cumprir os invariantes formalmente**, emitindo uma `ReferenciaClinica` apontando para a especificação do Banco Central: descartada por ser pior que a exceção. A `ReferenciaClinica` existe para dizer ao prescritor onde conferir uma conduta; usá-la para outra coisa esvaziaria o invariante justamente naquilo que ele protege.
- **Isentar em silêncio**, confiando em que a próxima passagem entenderia: descartada por experiência do próprio projeto. Ausência não declarada se lê como esquecimento, e o custo de dizer é de dois parágrafos, contra o de uma investigação inteira depois.

## Consequências

- A família `models/*` deixa de ser homogênea, e a extração passa a descrevê-la com alcance por invariante (`domain.md` §10).
- O watch **W001** da feature 019 vigia o **texto da extração**, e não o código: se uma re-extração reportar `models/contribuicao` como violação de fonte clínica única, o defeito está na generalização, e não no que foi entregue.
- Abre precedente controlado para matéria não clínica futura, com o preço declarado: quem trouxer a próxima escreve a isenção, ou a próxima passagem a reporta como defeito.
- A fronteira de tela vira regra de domínio com força de navegação: apoio e conduta não dividem a mesma superfície.

## Status

Ativa. Reavaliar se um segundo unit não clínico entrar, momento em que vale conferir se a isenção continua sendo exceção nomeada e não regra geral por omissão.
