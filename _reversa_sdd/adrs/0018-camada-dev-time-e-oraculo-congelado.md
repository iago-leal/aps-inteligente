# ADR 0018 — Camada dev-time: geradores idempotentes e oráculo congelado

> Retroativo, reconstruído pelo Reversa Detective (2026-07-28, re-extração nº 4) a partir das features 017 a 020 e 022, dos adendos correspondentes e das fichas `MD-0004`, `MD-0007`, `MD-0008`, `MD-0010` e `MD-0018`. Confiança: 🟢

## Contexto

Até a feature 016, todo dado clínico da plataforma cabia em constantes escritas à mão e conferidas por leitura: 24 células da matriz de dor torácica, algumas dezenas de coeficientes das Pooled Cohort Equations, faixas e cortes. A puericultura mudou a escala. Os escores z exigem **12.964 linhas L/M/S** publicadas pela OMS em planilhas, e as curvas do pré-termo exigem outro conjunto, de outra fonte. Transcrever à mão está fora de questão, e importar em tempo de execução violaria o ADR 0002 e o ADR 0003.

Surgiu, junto, um segundo problema, de natureza oposta: se o mesmo código que **produz** as tabelas também as **verificasse**, a suíte estaria julgando o motor com números que vieram dele.

## Decisão

Nasce uma **quarta camada, acima das três de aplicação**: `scripts/**`, executada em tempo de desenvolvimento, que **não entra no bundle e não é importada** por `models/`, `interface/` nem `pages/`. Roda no Node declarado em `engines`, que executa TypeScript nativamente, e por isso não acrescenta dependência ao manifesto.

A camada abriga duas cadeias de propósito oposto:

- **Geradores**, que produzem artefatos versionados a partir das fontes primárias: as 14 tabelas da OMS com `sha256` no manifesto, as fichas da caderneta, o inventário da superfície textual e o conferidor da produção.
- **Congeladores de oráculo**, que extraem das **mesmas fontes originais**, por caminho independente, os casos contra os quais a suíte julga o motor: 356 casos da OMS e 1.596 células do INTERGROWTH-21st (`MD-0010`).

Três promessas valem para toda a camada, e são elas que a fazem instrumento de auditoria em vez de utilitário:

1. **Nenhuma escrita parcial.** Tudo é lido, verificado e emitido em memória; o primeiro byte só chega ao disco quando o último passou. Uma falha na décima quarta tabela não deixa treze módulos novos ao lado de um antigo.
2. **Falha ruidosa e localizada.** A mensagem diz qual arquivo e em que verificação parou. Avisar e seguir seria o pior modo de falha possível.
3. **Idempotência byte a byte.** Rodar duas vezes sobre as mesmas origens produz arquivos idênticos, e o **`git diff` vazio é a prova de que a origem não mudou**.

Uma quarta regra separa o que se regera do que jamais se regera: `inventario-textual.json` é **regerado** ao fim de toda revisão, e `citacao-linha-de-base.json` **nunca**, porque é congelamento, e regerá-lo apagaria justamente o que ele existe para comparar (`MD-0018`).

## Alternativas consideradas

- **Buscar as tabelas em runtime**, de CDN ou API: descartada de saída. Violaria a privacidade por construção (ADR 0002) ao introduzir requisição de rede na tela clínica, tornaria o cálculo dependente de disponibilidade alheia e faria o resultado variar sem que ninguém tivesse mudado o código.
- **Transcrever à mão**, como nas fontes anteriores: inviável no volume, e pior no risco. Erro de digitação em uma linha de 12.964 é indetectável por leitura.
- **Gerar em tempo de build**, dentro do `next build`: descartada porque tornaria o build dependente de rede e de fonte externa, e porque o artefato deixaria de ser versionado, retirando do git a única prova de procedência que temos.
- **Oráculo pela segunda implementação da mesma equação**: descartada por `MD-0010`. Duas implementações da mesma leitura erram junto; o oráculo tem de vir da fonte primária, por caminho que não passe pelo motor.
- **Regerar a linha de base de citação quando ela reprova**: descartada por `MD-0018`. É o desfecho que o artefato existe para impedir, e o mais fácil de tomar sob pressão de suíte vermelha.

## Consequências

- **5.517 linhas em 23 arquivos** que não servem ao usuário e existem para que o dado que serve tenha procedência verificável. O volume é comparável ao de um domínio inteiro, e a re-extração anterior não a conhecia de todo.
- O acervo tabular embarcado (344 kB) **não é persistência**: são módulos estáticos importados, e "nenhum dado clínico é persistido" continua exato.
- A leitura de rede da plataforma inteira, fora do healthcheck, cabe em **um** script (`baixar-tabelas-oms.mts`), e roda quando um humano manda.
- O custo de bundle fica confinado: só a rota que usa as tabelas as paga, por `next/dynamic` no painel de crescimento.
- O extrator de textos distingue literal exibido de trivia de comentário por **árvore sintática**, e não por expressão regular, porque este repositório é denso em comentário longo e a regex confundiria as duas coisas.
- 🟡 Dívida conhecida: `scripts/textos/classes/interface.mts` está em 684 linhas, acima do teto, e a exceção nominal concedida às tabelas geradas não o alcança.

## Status

Ativa. Gatilho de revisão: nova edição de qualquer fonte tabular (o `sha256` do manifesto acusa), ou o dia em que um gerador precisar rodar em CI, momento em que a promessa 1 passa a valer contra concorrência e não só contra falha.
