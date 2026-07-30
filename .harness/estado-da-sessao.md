---
commit: 2bf7fcc5a958fcd4e8e152e998096c3e0a5dadf5
feature: default_feature
start_time: '2026-07-30T16:57:48.442630+00:00'
status: inactive
---

## O que foi feito
- **Sessão de implementação: a feature `023-saude-do-idoso-gds` foi do `actions.md` ao código, por `/reversa-coding`.** 32 das 34 ações concluídas, nenhuma falhou; as duas restantes esperam por pessoa. Commit `0f5e897` pushado para `aps-inteligente/main`.
- **Quinta seção e sétima calculadora da plataforma**, sob `/saude-do-idoso/depressao-gds`: a Escala de Depressão Geriátrica em quinze itens, na redação das Linhas de Cuidado do Ministério da Saúde. Sexto unit clínico, no molde da cardiopatia isquêmica.
- **O domínio novo é o primeiro sem `ForaDoEscopoDaFonte`**, e a ausência vai declarada no cabeçalho de `tipos.ts` para não se ler como esquecimento. A fonte não publica faixa etária, de modo que não há recusa a modelar; o que ocupa o lugar da regra é **uma frase**, e por isso ela vive no domínio e não na tela.
- **A chave de pontuação ganhou cadeia de conferência própria, e foi o miolo técnico da entrega.** Dez itens pontuam com "Sim" e cinco com "Não" (1, 5, 7, 11 e 13), e a fonte publica isso **pela cor da célula**, não pelo texto. `scripts/congelar-fonte-gds.mts` extrai a chave da cópia datada e a congela; `transcricao.test.ts` julga o domínio contra o congelado. **Visto reprovar** por inversão deliberada do item 7: três testes falharam, e o primeiro nomeou o item.
- **A porta que `MD-0027` abriu foi usada pela primeira vez por quem não a abriu.** `models/depressao-geriatrica/` é a segunda entrada de `SUBARVORES_COM_ORACULO_PROPRIO`. Três coisas **não** aconteceram, e é isso que mantém o gate de pé: a linha de base da citação não foi tocada, `AFASTAMENTOS_AUTORIZADOS` não foi alargada, e a isenção segue alcançando só o **surgimento**.
- **Dois achados de execução mudaram o change set previsto, ambos por oráculo que já existia.** A `description` da home enumera as seções, e `descricao-plataforma.test.ts` reprovou a entrega até a quinta entrar — única alteração de literal preexistente da feature. E o travessão da linha nova do `README.md` reprovou `norma.test.ts`, porque o eixo expressivo só é lícito no **nome publicado**, e o desta fonte não o traz.
- **`MD-0041` registra a decisão não óbvia da sessão:** "Sim" e "Não" da tela entraram como **autorais**, embora a tabela da fonte os imprima. A classe `citacao` é consequência operacional, não observação sobre a origem das palavras, e declará-los citação poria duas palavras do português corrente sob o oráculo da transcrição.
- **A dívida 3 encolheu em vez de crescer.** Os literais da tela foram para `scripts/textos/classes/interface-saude-do-idoso.mts`, e `interface.mts` permanece em 684 linhas.
- **Ruído de formatação desfeito de propósito.** O `prettier --write` reformatou três arquivos existentes que a feature apenas emendava; as três reformatações foram revertidas, de modo que o diff de `catalogo.ts` ficou **estritamente aditivo** — 15 inserções, zero remoções. O repositório inteiro reprova `prettier --check` (655 arquivos), e não só o `README.md` da dívida 10.
- **Provas:** vitest **920/920** em 73 arquivos; cobertura de `models/**` em 97,2% de linhas (unit novo em 97,6%, com 87,5% de ramos); inventário textual em **1.245** literais sem parar; e2e **60/60**, com `axe` em zero na rota nova por asserção direta.
- **Nota do vault atualizada**, com a seção da 023 e o próximo passo reescrito.

## Próximos passos
- **`/reversa-sync` da feature 023**, que é a dívida imediata do ciclo forward: a entrega está codada e pushada, e o adendo ainda não existe. Será o primeiro a convergir sobre a re-extração nº 4.
- **T033 e T034 do `actions.md`**, que esperam por pessoa e são baratas: abrir a fonte ao lado da tela, conferir os quinze itens e a frase do público, dar o aval estético, e registrar o desfecho com a data. Capturas geradas nesta sessão ficaram no scratchpad.
- **`/reversa-debugger-fix BUG-20260728-C6LN`**, o único bug aberto, herdado sem movimento. A decisão pela frente continua sendo se `ficha.tsx` ganha ponto de extensão ou se a projeção da fonte se acopla a um comando de aplicação.
- **Triar `018/W021`** e **chancelar as premissas 🟡**, ambos herdados.

## Pendências / bloqueios
- **A feature 023 está sem adendo.** Nenhum `/reversa-sync` rodou, e a extração ainda não conhece o sexto domínio clínico nem a quinta seção.
- **A conferência clínica da GDS não aconteceu.** T033 e T034 seguem `[ ]` de propósito: marcar como feito o que ninguém conferiu transformaria o gate em formalidade. Enquanto isso, a transcrição está garantida por oráculo, mas a **indicação clínica** do instrumento não foi vista por médico.
- **Produção não tem o SHA desta entrega.** O push saiu em `0f5e897`; CI e deploy a confirmar em `/api/v1/status` na retomada. A conferência anterior parou em `a422b60`, e `13c87d6` também ficou por confirmar.
- **Cobertura de ramos do unit novo em 87,5%**, abaixo dos 90 que o limiar exige **por projeto** — que passa, porque é global (95,0%). O ramo descoberto é o `throw` inalcançável pela fachada, mesmo padrão de `cardiopatia-isquemica/calculadora.ts:76`.
- Herdados e sem movimento: um bug aberto, `MD-0027` a arbitrar, `README.md` e mais 654 arquivos reprovando `prettier --check`, `interface.mts` em 684 linhas, **L-10** sem dono, as duas lacunas 🔴 de `gaps.md`, o Codex indisponível, e o rastreamento preventivo pausado sem resposta da AHRQ há uma semana.

## Ponteiros
- **O que separa citação de vocabulário comum, quando os dois coincidem:** a pergunta não é "a fonte escreve isto?", e sim "este literal está na tela porque a fonte o diz, ou porque a interface precisa dele?". Se a página imprimisse "S" e "N", a tela continuaria dizendo "Sim" e "Não" — e é essa assimetria que a classe registra. Tratamento em `MD-0041`.
- **A propriedade de teclado que o e2e prova, e que ninguém escreveu:** enquanto nenhuma opção do item está marcada, as duas são tabuláveis; marcada uma, a outra sai da ordem de tabulação. Por isso um Space e um Tab por item bastam para percorrer os quinze, e é justamente isso que o roteiro afirma.
- **Como se lê o congelado da fonte:** `node -e` sobre `tests/apoio/gds-fonte-congelada.json` imprime itens, chave, faixas e providência em vinte linhas. Foi assim que a conferência de T002 correu, item a item, contra a fonte aberta ao lado.
- **Onde ler o resultado:** `_reversa_forward/023-saude-do-idoso-gds/` — `legacy-impact.md` (32 arquivos, com os dois HIGH/MEDIUM que importam), `regression-watch.md` (W001–W018 e seis observações) e as notas de execução no fim do `actions.md`.
- Microdecisões em `.harness/decisoes/`: `MD-0001` a **`MD-0041`**.
- **Um adendo vigente**, ainda: `bug-BUG-20260728-ZAHV-v001.md`. Os adendos 015 a 022 seguem marcados como superados, e o da 023 falta escrever.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status` · SHA `a422b60` na última conferência; `13c87d6` e `0f5e897` a confirmar.
