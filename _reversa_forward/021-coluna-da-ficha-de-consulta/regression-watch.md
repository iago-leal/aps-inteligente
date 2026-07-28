# Regression watch: 021-coluna-da-ficha-de-consulta

> Feature: `021-coluna-da-ficha-de-consulta`
> Criado em: `2026-07-28`
> Origem: `legacy-impact.md` §4 (Modificadas)

O que segue precisa continuar verdadeiro nas próximas extrações. Cada item nomeia o sinal pelo
qual a violação se reconhece, de modo que a verificação não dependa de quem lembra do contexto.

Uma observação vale para o conjunto: **esta feature existe porque uma guarda de regressão falhou
em regredir**. A de 013 vigiava esta mesma invariante e não pegou o defeito da 020, por estar
presa a uma rota. Os itens W002, W003 e W007 são, por isso, os de maior valor da lista: eles
vigiam a própria rede, e não só o que ela protege.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-------------------------------|---------------------|-------------------|
| W001 | `interface/estilos/moldura.css`; RN-01b, D-01 | A coluna do corpo mora no `<main>` da `Moldura`, governada por `data-apresentacao`: 1180px na variante `padrao`, 720px na `destaque` | presença | A regra sumir da folha, ou o seletor deixar de casar com `.pagina[data-apresentacao="…"] > main`; o cabeçalho voltar a desalinhar do corpo em qualquer tela |
| W002 | `e2e/plataforma.spec.ts`; RN-04, RF-03, D-05 | A guarda geométrica deriva as rotas de `CATALOGO` e mede o `<main>`, lendo o recuo do estilo computado | presença | Rota escrita à mão no roteiro; `page.locator(".calc-regioes")` ou qualquer seletor de classe voltando ao teste; constante de recuo chumbada de novo |
| W003 | `e2e/plataforma.spec.ts`; RN-04, T004 | A home entra na guarda como sétimo caso, à parte da lista do catálogo, por ser a única tela da variante `destaque` | presença | A lista de casos perder o `"/"`; a variante `destaque` ficar sem cobertura geométrica |
| W004 | `interface/estilos/moldura.css`; RN-01b, D-02 | Só o eixo **horizontal** vive nesta folha; o vertical fica na folha de cada tela | ausência | Qualquer `padding-block`, `margin-block`, `gap` ou altura aparecer em `moldura.css` — o sinal de que a folha começou a virar folha-ônibus |
| W005 | `interface/estilos/{globais,inicio,contribuicao}.css`; corolário de RN-01b, D-09 | Nenhuma folha de tela redeclara a coluna: as três cederam `max-width`, `margin: 0 auto` e o recuo lateral, conservando o vertical em `padding-block` | ausência | `max-width` de 1180px ou 720px reaparecer numa folha de tela; recuo lateral acompanhado de `margin: 0 auto`. O efeito é coluna **aninhada**, e a guarda do `<main>` não a vê |
| W006 | `interface/estilos/moldura.css`; D-04 | Os dois pontos de quebra permanecem **distintos** por variante: 900px na `padrao`, 544px na `destaque` | redação | Um breakpoint único para as duas variantes. Unificá-los move telas que RF-04 manda não mover |
| W007 | `interface/comum/moldura.tsx:115`; RN-03, D-11 | O `<main>` permanece sem classe e sem atributo próprio; a regra o alcança pela chave do pai | ausência | Classe ou `data-*` novo no `<main>`. Reintroduz no JSX o acoplamento a nome que é a causa raiz do defeito |
| W008 | `interface/inicio/catalogo.ts`; RF-09, D-05 | O catálogo é **lido** pela guarda e jamais escrito por ela | ausência | Entrada de catálogo criada, alterada ou filtrada dentro de `e2e/`; rota de teste que não exista no produto |

## Observações

Sem peso de regressão: o que segue nasceu 🟡, ou é dívida declarada, ou é matéria de outra
feature. Fica registrado para que a próxima extração não o descubra como surpresa.

- **O-21-01 · o piso de `22rem` é premissa, não medida (🟡).** D-06 escolheu o valor por produzir
  três colunas em 1280px e uma no telefone; nenhuma asserção o afirma, e corrigi-lo custa uma
  linha. Só o uso arbitra. As capturas de T021 mostram o resultado nas duas larguras.
- **O-21-02 · a régua do bloco de apoio encolheu, em toda largura.** O `border-top` de
  `.contribuicao-bloco` media os 720px da caixa e passa a medir a largura de conteúdo da coluna,
  alinhando-se ao texto. É consequência de D-09, apurada na decomposição e declarada na terceira
  premissa do roadmap depois de emenda. Não confundir com regressão.
- **O-21-03 · T005 não era satisfazível como redigida, e T024 nasceu na execução.** A ação previa
  que a guarda, escrita antes da correção, passasse nas telas antigas; com o alvo no `<main>`
  (D-05), ela reprova em todas. O critério de RF-03 migrou para T024, verificado depois de T013
  pelo procedimento do `onboarding.md` §6. Lição para a próxima feature que inverta a ordem
  TDD sobre um alvo de medição novo: a guarda generalizada não tem linha de base verde antes da
  generalização que ela pressupõe.
- **O-21-04 · os adendos 019 e 020 continuam pendentes (achado A003).** `_reversa_sdd/addenda/`
  termina em `018`. A 021 corrige um defeito da 020, e a extração não registra a 020. São três
  adendos a rodar em sequência, e é a dívida de rastreabilidade mais antiga em aberto.
- **O-21-05 · `_reversa_sdd/domain.md:196` cita `logoComoTitulo`, prop que a `Moldura` não tem
  mais** — hoje é `comInicio` (achado A009). A 021 não depende dela, mas apoia-se no mesmo
  componente, e a próxima re-extração há de corrigir a afirmação.
- **O-21-06 · `e2e/plataforma.spec.ts` reprova `prettier --check`, e já reprovava no HEAD.**
  Conferido antes de decidir: aplicar `--write` reformataria asserções de idade gestacional,
  cardiologia e risco cardiovascular que nada devem a esta feature, violando T015 e RF-04. Fica
  como dívida pré-existente, da mesma família de `O-20-10`. O código novo da entrega está
  formatado.
- **O-21-07 · T001 era 🟡 e resolveu-se sozinha.** O Playwright 1.61.1 resolveu o alias
  `interface/*` do `tsconfig.json` sem ajuste algum; `playwright.config.ts` não foi tocado.
- **O-21-08 · o custo de bundle ficou negativo.** Medido por build nos dois estados: o CSS de
  produção passou de 54.175 B para 53.766 B gzip, **−409 B**, apesar de crescer 278 B em bruto. A
  consolidação de três declarações repetidas numa regra só comprime melhor do que o que
  acrescenta. O requisito projetava algo abaixo de +1 kB por rota.

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso ao rodar /reversa novamente. -->

| Re-extração | Data | Veredito por item | Observações |
|-------------|------|-------------------|-------------|
| — | — | — | — |

## Arquivadas

<!-- Itens superados por decisão posterior, com a superação declarada (MD-0017). -->

Nenhuma.
