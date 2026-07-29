# `interface/puericultura` — Tarefas de Implementação

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `017-puericultura-crescimento`.

## Pré-requisitos

- [ ] `models/puericultura` implementada e exportando a fachada e os tipos.
- [ ] `interface/comum/moldura` com a prop `comInicio`.
- [ ] `interface/calculadora/relator-de-erros` disponível para reúso.
- [ ] Primer React instalado, com os tokens já em uso na plataforma.

## Tarefas

- [ ] T-01, Compor a tela: moldura com título, subtítulo citando a fonte e `comInicio`.
  - Origem no legado: `interface/puericultura/tela.tsx`
  - Critério de pronto: o subtítulo é concatenação de literais, não template interpolado.
  - Confiança: 🟢

- [ ] T-02, Declarar a máquina `EstadoCrescimento` e a tradução da saída do domínio.
  - Origem no legado: `interface/puericultura/app.tsx`
  - Critério de pronto: cinco estados; a tradução não contém regra clínica.
  - Confiança: 🟢

- [ ] T-03, Implementar o formulário com os campos e a montagem da entrada.
  - Origem no legado: `interface/puericultura/formulario.tsx`
  - Critério de pronto: medidas opcionais; posição da medição exigida quando há comprimento;
    cada campo com rótulo associado.
  - Confiança: 🟢

- [ ] T-04, Implementar o painel de resultado, com os quatro índices em seus três estados.
  - Origem no legado: `interface/puericultura/resultado.tsx`
  - Critério de pronto: escore com uma casa e sinal; índice ausente e fora de escopo mostram o
    motivo; nenhum recálculo.
  - Confiança: 🟢

- [ ] T-05, Implementar o bloco de proveniência, com a nota do domínio e a declaração da
      correção de concordância.
  - Origem no legado: `interface/puericultura/proveniencia.tsx`
  - Critério de pronto: os textos vêm de constantes do domínio, não reescritos aqui.
  - Confiança: 🟢

- [ ] T-06, Implementar desatualização por edição e nova avaliação por remontagem.
  - Origem no legado: `interface/puericultura/app.tsx`
  - Critério de pronto: alterar campo após resultado marca desatualizado; avaliar limpa.
  - Confiança: 🟢

- [ ] T-07, Injetar motor, relator e data de hoje por prop, com padrões reais.
  - Origem no legado: `interface/puericultura/app.tsx`
  - Critério de pronto: o teste fixa a data sem falsear o relógio global.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Avaliação bem-sucedida, conferindo escore formatado e rótulo do domínio.
- [ ] TT-02, Recusa global e recusa parcial, cada uma com o seu motivo em tela.
- [ ] TT-03, Erro de validação, com os ofensores junto dos campos.
- [ ] TT-04, Falha inesperada, com motor que lança, verificando a chamada ao relator.
- [ ] TT-05, Desatualização e nova avaliação.
- [ ] TT-06, Presença das notas de proveniência e da correção de concordância.

## Ordem Sugerida

1. T-02 antes de tudo: a máquina define o que o painel precisa saber.
2. T-03 e T-04 em paralelo.
3. T-01 e T-05 são rápidas e independentes.
4. T-06 e T-07 fecham o comportamento e a testabilidade.

## Lacunas Pendentes (🔴)

Nenhuma. As duas premissas 🟡 — acessibilidade herdada do Primer e confiança no relógio do
dispositivo — estão em `design.md`.
