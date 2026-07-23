# models/cardiopatia-isquemica — Tarefas de Implementação

> `tasks.md` · Sequência para reimplementar a unit a partir do legado. Re-extração 2.

## Pré-requisitos

- [ ] Domínio puro TypeScript, sem framework nem banco
- [ ] Fonte clínica disponível (*TeleCondutas — Cardiopatia Isquêmica*, TelessaúdeRS-UFRGS, 2017, pp. 4–6)
- [ ] Transcrição verificada das 24 células do Quadro 2 (oráculo de teste)

## Tarefas

- [ ] **T-01** Definir contratos de tipo, três variantes de saída e `ErroDeInvariante`
  - Origem no legado: `models/cardiopatia-isquemica/tipos.ts`
  - Critério de pronto: `EntradaAvaliacao`, `SaidaAvaliacao` (resultado | fora-do-escopo | erro-validacao), `FaixaProbabilidade`, `Conduta`, `Advertencia` compilando com `readonly`
  - Confiança: 🟢

- [ ] **T-02** Congelar a fonte clínica: matriz do Quadro 2, constantes, referências e textos
  - Origem no legado: `models/cardiopatia-isquemica/fonte-clinica.ts`
  - Critério de pronto: `PROBABILIDADE_PRE_TESTE` com as 24 células idênticas ao Quadro 2; `Object.freeze` em toda a árvore; causas não cardíacas e textos de conduta/advertência presentes
  - Confiança: 🟢

- [ ] **T-03** Classificar a dor pela contagem das três características
  - Origem no legado: `models/cardiopatia-isquemica/classificacao.ts`
  - Critério de pronto: 3→típica, 2→atípica, 0–1→não anginosa
  - Confiança: 🟢

- [ ] **T-04** Probabilidade: faixa etária, lookup base, ajuste por fatores e estrato
  - Origem no legado: `models/cardiopatia-isquemica/probabilidade.ts`
  - Critério de pronto: `faixaEtariaDe` retorna `null` fora de 30–69; ajuste base×2–base×3 capado em 99% com `excedeAlta`; estrato "baixa" ⟺ não anginosa e sem fator
  - Confiança: 🟢

- [ ] **T-05** Conduta por estrato e advertência de angina instável
  - Origem no legado: `models/cardiopatia-isquemica/conduta.ts`
  - Critério de pronto: mapa estrato→conduta; ergometria × método não invasivo por impedimento; advertência `ANGINA_INSTAVEL` só com instabilidade
  - Confiança: 🟢

- [ ] **T-06** Validação com coleta total de ofensores
  - Origem no legado: `models/cardiopatia-isquemica/validacao.ts`
  - Critério de pronto: IDADE_INVALIDA (não inteira ou fora de 0–120), SEXO_INVALIDO, FATOR_DE_RISCO_INVALIDO; idade fora de 30–69 NÃO é ofensor
  - Confiança: 🟢

- [ ] **T-07** Montar a fachada `CalculadoraCardiopatiaIsquemica`
  - Origem no legado: `models/cardiopatia-isquemica/calculadora.ts`
  - Critério de pronto: orquestra validação → escopo → classificação → probabilidade → conduta; deduplica referências; garante `referencias` não vazia (RN-09)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] **TT-01** Oráculo das 24 células: cada combinação classe×sexo×faixa devolve o valor tabelado
- [ ] **TT-02** Classificação: as quatro contagens (0,1,2,3) mapeiam corretamente
- [ ] **TT-03** Ajuste por fatores: faixa base×2–base×3, cap em 99%, `excedeAlta`
- [ ] **TT-04** Estrato: "baixa" só para não anginosa sem fator; qualquer fator impede baixa
- [ ] **TT-05** Conduta: ergometria × método não invasivo por `impedimentoErgometria`
- [ ] **TT-06** Fora-do-escopo: idade < 30 ou > 69 dentro de 0–120
- [ ] **TT-07** Coleta total de ofensores; advertência de angina instável
- [ ] **TT-08** Property-based: `referencias` nunca vazia em qualquer resultado

## Tarefas de Migração de Dados

Não aplicável: unit sem persistência.

## Ordem Sugerida

1. T-01 e T-02 primeiro (tipos e fonte numérica são base).
2. T-03, T-04, T-06 em paralelo; T-05 depois de T-02.
3. T-07 fecha, dependendo de todas as anteriores.
4. Testes acompanham cada tarefa (TDD; a entrega original teve +81 testes de unidade com property-based e o oráculo das 24 células).

## Lacunas Pendentes (🔴)

Nenhuma lacuna 🔴. Pendências 🟡 (semântica do estrato "baixa", conferência das 24 células, cap por fatores) estão em `questions.md`; são de validação clínica, não bloqueiam a reimplementação.
