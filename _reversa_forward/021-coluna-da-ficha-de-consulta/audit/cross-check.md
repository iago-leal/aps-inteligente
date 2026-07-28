# Cross-check: 021-coluna-da-ficha-de-consulta

> Data: `2026-07-28`
> Feature: `021-coluna-da-ficha-de-consulta`
> Artefatos analisados:
> - `_reversa_forward/021-coluna-da-ficha-de-consulta/requirements.md`
> - `_reversa_forward/021-coluna-da-ficha-de-consulta/roadmap.md`
> - `_reversa_forward/021-coluna-da-ficha-de-consulta/actions.md`
> Consultados como referência, sem alteração: `data-delta.md`, `investigation.md`,
> `onboarding.md`, `_reversa_sdd/{architecture,domain}.md`, `_reversa_sdd/addenda/`,
> e o código-fonte citado pelos três artefatos.

Auditoria estritamente leitora. **Nenhum dos três artefatos foi alterado**, nem qualquer
outro arquivo da feature além deste relatório.

## 1. Resumo

| Severidade | Quantidade |
|------------|------------|
| CRITICAL | 0 |
| HIGH | 3 |
| MEDIUM | 3 |
| LOW | 3 |
| **Total** | **9** |

Nenhum achado toca regra 🟢 do domínio, contrato externo ou ciclo de dependência. Os três
achados HIGH têm a mesma raiz: o `requirements.md` fixou RF-04 quando a solução ainda era
pontual, e a sessão de `/reversa-clarify` mudou a solução sem que aquele critério fosse
reconciliado.

## 2. Achados

| ID | Severidade | Eixo | Descrição | Onde está |
|----|-----------|------|-----------|-----------|
| A001 | HIGH | Consistência | RF-04 exige "nenhum diff" em `globais.css`, mas RN-01b, o passo 3 do plano de migração e a ação T010 alteram `.calc-regioes` nessa folha por necessidade estrutural | `requirements.md` §5 RF-04 × `roadmap.md` §8.3 × `actions.md` T010 |
| A002 | HIGH | Cobertura | `.contribuicao-bloco` é o terceiro dono da coluna horizontal e vive dentro do `<main>` da home, mas não aparece no roadmap; e RF-04 proíbe diff em `contribuicao.css`. A ação T012 existe sem decisão que a ampare | `interface/estilos/contribuicao.css:22` × `roadmap.md` §5 e §8.3 × `actions.md` T012 |
| A003 | HIGH | Consistência | RN-03 e o delta arquitetural citam "adendo 020" como origem no legado, e o adendo não existe: `_reversa_sdd/addenda/` termina em `018`. Os adendos 019 e 020 seguem pendentes de `/reversa-sync` | `requirements.md` §4 RN-03 × `roadmap.md` §5 × `_reversa_sdd/addenda/` |
| A004 | MEDIUM | Consistência | RF-04 pede que a suíte das telas anteriores passe "sem alteração de asserção", ao passo que RF-03 manda reescrever a guarda de 013, que hoje afere `/dm2/insulina`. Os dois requisitos incidem sobre o mesmo bloco de código sem que o limite entre eles esteja escrito | `requirements.md` §5 RF-03 e RF-04 × `actions.md` T003, T004, T015 |
| A005 | MEDIUM | Cobertura | O critério de pronto do roadmap fala em "seis rotas", contagem do catálogo, mas a mitigação do risco 2 exige medir também a home, que o catálogo não declara. São sete casos, e a diferença só aparece na leitura cruzada | `roadmap.md` §8.4, §9 e §10 × `actions.md` T004 |
| A006 | MEDIUM | Cobertura | D-08 e RF-08b afirmam que `consulta-puericultura.css` fica intocado fora de `.consulta-identificacao`, e nenhuma ação verifica isso. T016 confere `models/`, catálogo e `pages/api/`, e a folha da tela fica fora da guarda de escopo | `roadmap.md` §3 D-08 × `requirements.md` §5 RF-08b × `actions.md` T016, T018 |
| A007 | LOW | Consistência | As âncoras `_reversa_sdd/architecture.md#interface/comum` e `#interface/estilos` não resolvem: o documento não tem cabeçalhos com esses nomes; os componentes existem, mas descritos na seção 2 em prosa | `requirements.md` §2 × `roadmap.md` §5 × `_reversa_sdd/architecture.md` |
| A008 | LOW | Cobertura | O cenário Gherkin "desfaço a correção" descreve um ato que a ordem de D-07 torna desnecessário, já que T005 mede antes de a correção existir. O procedimento literal só existe fora dos três artefatos, na seção 6 do `onboarding.md` | `requirements.md` §7 × `actions.md` T005 × `onboarding.md` §6 |
| A009 | LOW | Coerência com o legado | A extração descreve a `Moldura` governada por `logoComoTitulo`, prop que o componente não tem mais: hoje é `comInicio`. A 021 não depende dessa prop, mas apoia-se no mesmo componente | `_reversa_sdd/domain.md:196` × `interface/comum/moldura.tsx:60-66` |

## 3. Impacto dos achados HIGH

### A001 — RF-04 proíbe o que RN-01b exige

RF-04 nasceu na primeira redação do `requirements.md`, quando a correção prevista era pontual,
em `.consulta-regioes`. A sessão de esclarecimento mudou a solução de lugar: a coluna sobe para
o `<main>` da `Moldura`, e a consequência inevitável é que `.calc-regioes` **perca** as três
propriedades horizontais, sob pena de a coluna existir duas vezes, aninhada. O `roadmap.md` já
opera sob a solução nova e o `actions.md` a decompõe; só o critério de aceite ficou para trás.

O risco prático é de leitura, não de código: quem executar RF-04 ao pé da letra concluirá que a
feature falhou justamente onde ela acertou. Vale distinguir, no texto do requisito, o que a
feature promete de fato — **nenhuma mudança visível** nas cinco telas anteriores — do que RF-04
hoje diz, que é ausência de diff em arquivos. A primeira formulação é verificável pela guarda
geométrica; a segunda contradiz o plano.

Direção sugerida: `/reversa-clarify` para reescrever RF-04 em termos de invariância visual e
comportamental, nomeando explicitamente as folhas que a feature altera.

### A002 — o terceiro dono da coluna não está no plano

`interface/estilos/contribuicao.css:22` declara `max-width: 720px`, `margin: 0 auto` e
`padding: 0 32px 64px` em `.contribuicao-bloco`, e `interface/inicio/tela.tsx:58` põe o
`BlocoDeApoio` dentro da `Moldura`, logo dentro do mesmo `<main>` que passará a ser a sede da
coluna. Sem subtração, o bloco de apoio da home fica com recuo lateral de 64px, o dobro do
resto da página, dentro de uma coluna de 720px aninhada em outra de 720px.

O roadmap enumera dois donos da coluna, `.calc-regioes` e `.inicio-secoes`, e o levantamento da
investigação também. A omissão é do plano, não do código: a busca por `max-width` nas seis
folhas devolve os três. Como a home tem guarda geométrica apenas no `<main>` (T004), e não no
bloco de apoio, o defeito passaria pela suíte.

O `actions.md` registra T012 para cobrir a lacuna e a declara na nota de execução, mas a ação
existe sem decisão que a ampare, o que inverte a cadeia de derivação do princípio II.

Direção sugerida: `/reversa-clarify` para incorporar `.contribuicao-bloco` a RN-01b e a RF-04, e
edição manual do roadmap para acrescentar a folha ao passo 3 do plano de migração — o
`/reversa-plan` regeraria o documento inteiro, o que aqui é desproporcional.

### A003 — os adendos citados ainda não existem

RN-03 cita "addendum 020" como origem no legado e o delta arquitetural aponta "adendo `020`"
como arquivo de origem da tela da consulta. A pasta `_reversa_sdd/addenda/` termina em `018`:
nem a feature 019 nem a 020 passaram por `/reversa-sync`, embora ambas tenham fechado com todas
as ações concluídas.

O impacto não é sobre a execução desta feature, que lê o código e não o adendo, e sim sobre a
rastreabilidade: a 021 corrige um defeito da 020, e a extração não registra a 020. Quem ler
`_reversa_sdd/` daqui a seis meses encontrará a correção sem encontrar o que foi corrigido.

Direção sugerida: `/reversa-sync` da 019 e da 020 antes do `/reversa-coding` desta, ou logo
depois dele, com o da 021 na sequência. Os três adendos pendentes são a mesma dívida.

## 4. Verificado e conforme

### Cobertura

- Os nove requisitos funcionais têm decisão ou ação correspondente: RF-01 e RF-02 em D-01, D-02
  e D-04; RF-03 em D-05 e D-07; RF-05 em T007; RF-06 em T014; RF-07 em T017; RF-08 em D-06 e
  T018; RF-08b em D-08; RF-09 em T016.
- As oito decisões do roadmap têm ação: D-01 e D-02 em T008; D-03 em T002; D-04 em T009; D-05
  em T001 e T003; D-06 em T018; D-07 na ordem imposta entre T005 e T008; D-08 como escopo
  negativo, com a ressalva de A006.
- Os cinco cenários Gherkin estão cobertos: o do encaixe em T003 e T013; o do telefone em T006;
  o do registro longo em T007; o da guarda em T005, com a ressalva de A008; o das telas
  anteriores em T014, T015 e T016.
- O `data-delta.md` declara delta nulo, e a verificação que ele propõe é exatamente a de T016.

### Consistência

- As dez referências `arquivo:linha` citadas pelos três artefatos foram conferidas uma a uma e
  **todas apontam para o que afirmam**: `moldura.tsx:72` e `:115`, `globais.css:33` e `:346`,
  `inicio.css:28`, `:35` e `:161`, `cabecalho.css:31`, `plataforma.spec.ts:372` e `:378`,
  `consulta-puericultura.css:11`, `:19`, `:21` e `:42`, `contribuicao.css:22`, `app.tsx:118` e
  `:170`, `seletor-de-ficha.tsx:55`.
- Os dois números de calibração do cabeçalho conferem com a aritmética declarada: `558` para a
  coluna de 1180px e `328` para a de 720px, ambos com recuo de 32px.
- Nenhum identificador `RF-`, `RN-` ou `D-` citado é fantasma, à exceção dos adendos de A003.
- A terminologia é estável nos três documentos: "coluna do corpo", "eixo horizontal", "guarda
  geométrica", "variante `padrao`" e "variante `destaque`" aparecem sempre com o mesmo sentido.
- `interfaces/` foi legitimamente omitido: nenhum contrato externo é tocado, e o
  `interfaces/registro-soap.md` da 020 permanece válido.

### Coerência com o legado

- Nenhuma decisão contradiz regra 🟢 do `domain.md`. A feature não toca domínio, e ADR 0002
  (privacidade por arquitetura) e ADR 0003 (domínio puro) permanecem intactos por construção.
- Os componentes citados existem: `interface/comum` com a `Moldura`, `interface/estilos` com as
  oito folhas, `interface/puericultura/consulta` com a tela da 020.
- A afirmação de que `data-apresentacao` já é emitido e já governa o cabeçalho nas duas
  variantes foi confirmada no código, e é o que torna D-01 viável sem tocar `.tsx` algum.

### Sanidade do `actions.md`

- As 21 ações têm dependências que apontam para IDs existentes, sem referência para fora da
  lista.
- Não há ciclo: a ordenação topológica fecha em dez níveis, e a cadeia mais longa declarada no
  resumo confere.
- As onze ações `[//]` não compartilham arquivo alvo: T001 e T002 tocam
  `playwright.config.ts` e `moldura.css`; T003 e T006 tocam roteiros distintos; T010, T011 e
  T012 tocam três folhas distintas; T016 e T017 verificam árvores distintas; T019 e T020 não
  escrevem.
- A ordem das fases realiza D-07 sem atalho: nenhuma ação que altere largura precede T005.

## 5. Histórico

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial gerada por `/reversa-audit` sobre os três artefatos da feature 021 | reversa |
