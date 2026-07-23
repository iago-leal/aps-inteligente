# models/gestacao — Tarefas de Implementação

> `tasks.md` · Sequência para reimplementar a unit a partir do legado, com rastreabilidade ao código original. Re-extração 2.

## Pré-requisitos

- [ ] Nenhuma dependência externa: domínio puro TypeScript, sem framework nem banco
- [ ] Fonte clínica disponível para conferência (*Guia Rápido Pré-Natal* SMS-Rio 4.ª ed. 2025, pp. 31–32 e 113)
- [ ] Convenção de datas ISO `AAAA-MM-DD` acordada com a camada de interface

## Tarefas

- [ ] **T-01** Definir os contratos de tipo e o `ErroDeInvariante`
  - Origem no legado: `models/gestacao/tipos.ts`
  - Critério de pronto: `EntradaDatacao`, `SaidaDatacao` (união discriminada), `Ofensor`/`CodigoOfensor`, `VereditoComparacao` e `ErroDeInvariante` compilando com `readonly`
  - Confiança: 🟢

- [ ] **T-02** Implementar a aritmética de datas em dias epoch UTC
  - Origem no legado: `models/gestacao/datas.ts`
  - Critério de pronto: `paraDiasEpoch` devolve `null` para calendário impossível; `somarDias`/`somarMeses` corretos; round-trip `deDiasEpoch(paraDiasEpoch(x)) === x`
  - Confiança: 🟢

- [ ] **T-03** Centralizar constantes e referências na fonte clínica
  - Origem no legado: `models/gestacao/fonte-clinica.ts`
  - Critério de pronto: `CONSTANTES`, `REFERENCIAS` e `TEXTO_NOTAS` congelados (`Object.freeze`); referências com `fonteId`/`versaoEdicao`/`localizacao`
  - Confiança: 🟢

- [ ] **T-04** Implementar as regras puras de datação
  - Origem no legado: `models/gestacao/datacao.ts`
  - Critério de pronto: `igEntre` (RN-01), `dppPorNaegele` (RN-02), `dumEquivalente` (RN-03), `trimestreDaIg` (RN-04); pré-condição de datas válidas com `ErroDeInvariante` em intervalo impossível
  - Confiança: 🟢

- [ ] **T-05** Implementar a validação com coleta total de ofensores
  - Origem no legado: `models/gestacao/validacao.ts`
  - Critério de pronto: acumula todos os ofensores (nunca só o primeiro); cobre DATA_INVALIDA, DUM_FUTURA, DUM_ALEM_DE_44_SEMANAS, DATA_EXAME_FUTURA, IG_LAUDO_FORA_DE_FAIXA, DATACAO_ULTRASSOM_INCOMPLETA, NENHUMA_DATACAO_INFORMADA
  - Confiança: 🟢

- [ ] **T-06** Montar a fachada `CalculadoraIdadeGestacional`
  - Origem no legado: `models/gestacao/calculadora.ts`
  - Critério de pronto: orquestra validação → datação por método presente → comparação; deduplica referências; garante `referencias` não vazia (RN-06); spread condicional dos blocos
  - Confiança: 🟢

- [ ] **T-07** Implementar a comparação DUM × USG com veredito informativo
  - Origem no legado: `models/gestacao/calculadora.ts:126-171`
  - Critério de pronto: margem por trimestre do exame (7/14 dias; 3.º sem parâmetro); vereditos `dum-confirmada` / `dum-fora-da-margem` / `sem-parametro-na-fonte`
  - Confiança: 🟢

## Tarefas de Teste

- [ ] **TT-01** Happy path por DUM: IG/DPP/trimestre e referências não vazias (ver `requirements.md`, Critérios de Aceitação)
- [ ] **TT-02** Happy path por ultrassom: retroprojeção da DUM equivalente e datação coerente
- [ ] **TT-03** Entrada dupla: os três vereditos (dentro da margem, fora, 3.º trimestre)
- [ ] **TT-04** Coleta total: entrada com múltiplos erros retorna todos os ofensores de uma vez
- [ ] **TT-05** Property-based: `referencias` nunca vazia em qualquer resultado; `paraDiasEpoch` rejeita calendário impossível; invariante da datação
- [ ] **TT-06** Nenhuma datação informada → ofensor `NENHUMA_DATACAO_INFORMADA`

## Tarefas de Migração de Dados

Não aplicável: unit sem persistência.

## Ordem Sugerida

1. T-01 e T-02 primeiro (tipos e aritmética são base de tudo).
2. T-03 (constantes) antes de T-04 e T-05, que a consomem.
3. T-04 e T-05 em paralelo; T-06 depois de ambas; T-07 fecha, dependendo de T-04.
4. Testes acompanham cada tarefa (TDD, como na entrega original: 42 testes de unidade com property-based).

## Lacunas Pendentes (🔴)

Nenhuma lacuna 🔴. Pendências 🟡 (cortes de trimestre e limites de plausibilidade) estão em `questions.md`; não bloqueiam a reimplementação, mas devem ser confirmadas pelo prescritor antes de uso clínico.
