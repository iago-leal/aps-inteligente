# `scripts` — Tarefas de Implementação

> Reversa Writer, re-extração nº 4 (2026-07-28). Camada dev-time, ADR 0018.

## Pré-requisitos

- [ ] Node na versão declarada em `engines`, com execução nativa de TypeScript.
- [ ] Acesso às fontes fora do git: planilhas da OMS, PDFs da caderneta e do INTERGROWTH-21st.
- [ ] Nenhuma dependência nova: se a implementação exigir uma, a decisão precisa ser
      reexaminada, porque a ausência delas é parte do contrato desta camada.

## Tarefas

- [ ] T-01, Implementar a biblioteca comum de emissão atômica: ler, verificar, emitir em
      memória, escrever no fim.
  - Origem no legado: `scripts/lib/`
  - Critério de pronto: falha no meio do processo não deixa arquivo algum alterado.
  - Confiança: 🟢

- [ ] T-02, Implementar o download das planilhas da OMS, com registro de `url`, tamanho e
      `sha256`.
  - Origem no legado: `scripts/baixar-tabelas-oms.mts`
  - Critério de pronto: única leitura de rede da cadeia de geração.
  - Confiança: 🟢

- [ ] T-03, Implementar a geração dos 14 módulos de tabelas, conferindo `sha256` contra o
      manifesto antes de emitir.
  - Origem no legado: `scripts/gerar-tabelas-oms.mts`, `scripts/oms/`
  - Critério de pronto: reexecução produz `git diff` vazio; origem alterada faz parar.
  - Confiança: 🟢

- [ ] T-04, Implementar o congelamento dos casos-oráculo das duas réguas.
  - Origem no legado: `scripts/congelar-casos-oraculo.mts`, `scripts/oraculo/`
  - Critério de pronto: a suíte roda em clone limpo, sem rede e sem as fontes.
  - Confiança: 🟢

- [ ] T-05, Implementar o congelamento dos rótulos das dez páginas verdes, em duas passagens e
      duas tiragens.
  - Origem no legado: `scripts/congelar-fichas-caderneta.mts`
  - Critério de pronto: divergência entre as tiragens do menino e da menina é reportada, não
    silenciada.
  - Confiança: 🟢

- [ ] T-06, Implementar o extrator de literais por árvore sintática, distinguindo literal,
      template sem substituição e texto JSX de trivia de comentário.
  - Origem no legado: `scripts/inventariar-textos.mts`, `scripts/textos/`
  - Critério de pronto: sequência idêntica dentro de comentário não entra no inventário.
  - Confiança: 🟢

- [ ] T-07, Implementar a exigência de classe declarada, com parada nomeando arquivo e linha.
  - Origem no legado: `scripts/textos/classes/`, `scripts/textos/classificacao.mts`
  - Critério de pronto: literal novo sem entrada faz o processo parar; nenhuma classe é
    inferida por diretório.
  - Confiança: 🟢

- [ ] T-08, Implementar o conferidor de produção, com leitura do SHA, da idade do deploy e do
      estado do banco.
  - Origem no legado: `scripts/conferir-producao.mts`
  - Critério de pronto: `--exigir-saudavel` promove degradado a saída não-zero sem tocar na
    semântica dos códigos de defasagem.
  - Confiança: 🟢

- [ ] T-09, **Dívida:** partir `scripts/textos/classes/interface.mts` por camada de tela.
  - Origem no legado: arquivo em 684 linhas, acima do teto de 400
  - Critério de pronto: nenhum arquivo da camada acima do teto, e a exceção nominal do README
    permanece restrita às tabelas geradas.
  - Confiança: 🟡

## Tarefas de Teste

- [ ] TT-01, Idempotência: rodar cada gerador duas vezes e conferir `git diff` vazio.
- [ ] TT-02, Origem alterada: `sha256` divergente faz parar sem escrever.
- [ ] TT-03, Literal sem classe declarada faz o inventário parar, nomeando arquivo e linha.
- [ ] TT-04, Trivia de comentário não entra no inventário.
- [ ] TT-05, Escrita atômica: falha no meio não deixa arquivo pela metade.
- [ ] TT-06, Conferidor de produção nos três estados: em dia, defasado e degradado.

## Ordem Sugerida

1. T-01 antes de qualquer gerador: a atomicidade é comum a todos.
2. T-02 e T-03 formam a cadeia das tabelas; T-04 depende das mesmas fontes.
3. T-06 e T-07 formam a cadeia do inventário, e T-07 é o que lhe dá valor.
4. T-05 e T-08 são independentes.
5. T-09 é dívida, e pode ser feita a qualquer momento — quanto antes, menos declarações
   acumuladas para mover.

## Lacunas Pendentes (🔴)

- **Literal montado por interpolação em tempo de execução fica fora do inventário**, por
  desenho do extrator. As recusas de `elegibilidade.ts` e o aviso de `medidas.ts` estão nessa
  situação, e nenhuma guarda automática cobre a revisão deles. Decidir se vale estender o
  extrator ou se a cobertura manual basta é decisão pendente.
