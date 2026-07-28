# Roadmap: A ficha de consulta encaixa na coluna do corpo

> Identificador: `021-coluna-da-ficha-de-consulta`
> Data: `2026-07-28`
> Requirements: `_reversa_forward/021-coluna-da-ficha-de-consulta/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A coluna do corpo sobe para o `<main>` da `Moldura` (`interface/comum/moldura.tsx:115`),
governada pelo atributo `data-apresentacao` que o componente já emite, e ali fica **só o eixo
horizontal**: largura máxima, centralização e recuo lateral. O eixo vertical permanece na folha
de cada tela, porque varia com legitimidade. As folhas que hoje declaram a coluna perdem as três
propriedades horizontais e nada mais; `.consulta-regioes`, que nunca as teve, passa a recebê-las
por herança do elemento que já a envolve. A regra nova vive em `moldura.css`, folha própria, pela
mesma razão que a 020 criou `consulta-puericultura.css`: `globais.css` está em 364 linhas e o
teto de 400 é dívida que a re-extração 3 acabou de encerrar.

Os declarantes da coluna são **três**, e não dois: além de `.calc-regioes` e `.inicio-secoes`,
`.contribuicao-bloco` a declara por conta própria e vive dentro do mesmo `<main>` da home. O
terceiro foi apurado pela auditoria de 2026-07-28 e é a diferença entre uma subtração completa e
uma coluna aninhada em outra.

A guarda geométrica da feature 013 troca as suas duas âncoras: percorre as rotas que
`interface/inicio/catalogo.ts` declarar e mede o `<main>`, que existe em toda tela por
construção. Pela ordem do princípio VII, ela é a **primeira** ação da implementação, escrita
para reprovar em `/puericultura/consulta` antes de existir correção alguma de CSS.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. Invariante-mãe: a spec é a fonte de verdade | As duas queixas de uso surgidas na sessão de esclarecimento (vacinação na avaliação, notas dentro do texto copiado) foram deixadas **fora** desta feature justamente por mexerem em regra e em contrato da 020; corrigi-las aqui alteraria artefato sem reconciliar spec. A reconciliação deste roadmap com o `requirements.md` reescrito após a auditoria obedece ao mesmo princípio, na direção que ele determina: mudou a spec, o plano a segue | respeita |
| II. Cadeia de derivação: nada nasce sem origem validada | RN-01b nasce da leitura do código na sessão de clarify, com origem citada por arquivo e linha; `MD-0029` registra a derivação e as seis alternativas descartadas. D-09 existe para amparar a ação T012, que a decomposição criou antes de haver decisão que a sustentasse — a inversão da cadeia apontada em A002 fica desfeita aqui | respeita |
| III. Clarificação precede qualquer solução | As três `[DÚVIDA]` foram resolvidas antes deste plano existir, e a segunda sessão de clarify arbitrou os cinco achados de consistência da auditoria antes desta reescrita | respeita |
| IV. Portão G1: nenhuma solução antes de `/travar` | O `requirements.md` fecha com zero `[DÚVIDA]`; este roadmap é posterior às duas sessões | respeita |
| V. Fase 2 (`/spec`): a única que escreve, e proporcional | Feature de apresentação, categoria Aplicação: roadmap, investigation, data-delta e onboarding; `interfaces/` omitido por não haver contrato externo tocado | respeita |
| VI. Rastreabilidade bidirecional | Cada decisão abaixo aponta o RF que serve, e o critério de pronto amarra RF a teste nomeado. A rastreabilidade tem uma falha **conhecida e externa a esta feature**, registrada no risco 7: a 021 corrige um defeito da 020, e `_reversa_sdd/addenda/` ainda não registra a 020 | respeita, com dívida declarada |
| VII. Testes: metade da fonte de verdade, em dois papéis | A guarda generalizada é **teste de regressão** e vem primeiro, escrita para falhar; os demais são de validação. A regressão que motiva a feature é a de 013, que existia e não pegou o defeito, o que é o argumento empírico de D-05 | respeita |
| VIII. Proporcionalidade | Nenhuma camada nova, nenhuma dependência nova; o delta é uma folha de estilo de ~30 linhas, subtrações em três folhas, uma linha numa quarta e um roteiro e2e reescrito | respeita |
| IX. A prosa do produto tem norma declarada | A feature **não cria literal exibido**. RF-07 mantém o portão do inventário mesmo assim, porque a promessa vale por feature e não por intenção | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | A coluna do corpo mora no `<main>` da `Moldura`, por `data-apresentacao`: 1180px na variante `padrao`, 720px na `destaque` | O par cabeçalho-corpo já é calibrado por essa chave em `cabecalho.css` (`calc(50% - 558px)`) e em `inicio.css:28` (`calc(50% - 328px)`); só o corpo não sabia disso, e obedecia por coincidência de nome de classe. Ver `MD-0029` | token em `globais.css`; classe `.coluna` no JSX das seis telas; correção pontual em `.consulta-regioes` | 🟢 |
| D-02 | Sobe apenas o eixo **horizontal**; o vertical fica na folha da tela | O recuo vertical varia com legitimidade entre telas (`28px/56px` nas calculadoras, `40px/64px` na home, `32px/64px` no bloco de apoio), ao passo que o horizontal é o que o cabeçalho calibra. Separar os eixos é o que torna RF-04 verificável em vez de esperançoso | mover o `padding` inteiro e reintroduzir o vertical por variante | 🟢 |
| D-03 | A regra nova vive em `interface/estilos/moldura.css`, **nona** folha do diretório, importada em `_app.tsx` logo após `globais.css` | `globais.css` está em 364 linhas, e o teto de 400 é a dívida amarela que a re-extração 3 encerrou. Precedente direto: a 020 criou `consulta-puericultura.css` pelo mesmo argumento. A ordem de importação importa: a coluna precisa vir antes das folhas de tela, que declaram o eixo vertical sobre ela | acrescentar a `globais.css`, onde `.pagina` já mora; acrescentar a `cabecalho.css` | 🟢 |
| D-04 | O ponto de quebra do recuo lateral continua **por variante**: 900px nas calculadoras, 544px na home | São os breakpoints que hoje existem em `globais.css:346` e `inicio.css:161`. Unificá-los mudaria o comportamento de telas que RF-04 manda não mover | um breakpoint único para as duas variantes | 🟢 |
| D-05 | A guarda geométrica percorre as rotas de `interface/inicio/catalogo.ts` e mede o `<main>`; o `GUTTER` deixa de ser constante e passa a ser lido do estilo computado | O catálogo já é fonte única anti-drift (D-07 da 007) e declara **seis** rotas, conferidas na leitura. O `<main>` existe por construção. Sobra chumbada só a tolerância de 2px, que é o que a guarda de fato afirma | lista de rotas à mão; lista à mão com teste cruzado contra o catálogo; seletor de classe parametrizado por rota | 🟢 |
| D-06 | `.consulta-identificacao` sobe o piso do `minmax` de `12rem` para `22rem`, mantendo `auto-fit` | Produz três colunas em 1280px e uma no telefone sem media query nova. `repeat(3, 1fr)` exigiria a media query de acompanhamento, que é dívida pela porta dos fundos | `repeat(3, 1fr)` com breakpoint; deixar `12rem` | 🟡 |
| D-07 | A ordem de execução é a do princípio VII: a guarda generalizada é escrita **antes** de qualquer correção de CSS, e precisa ser vista reprovando | É o que separa uma guarda de regressão de uma lista de verificação manual, e o critério de aceite de RF-03 exige a reprovação demonstrada | corrigir o CSS e generalizar a guarda depois | 🟢 |
| D-08 | `.consulta-ficha` e o resto de `consulta-puericultura.css` ficam intocados | RF-08b: a feature ganha em ser exatamente o que promete ser. A mudança, se o uso a pedir, é de uma linha e não terá arrastado a feature consigo | redispor as seções em coluna única; largura total para as seções de sinais de alerta | 🟢 |
| D-09 | `.contribuicao-bloco` (`contribuicao.css:22`) é o **terceiro** declarante e cede a coluna como os outros dois. A conversão do eixo vertical é `padding-block: 32px 64px`, e não `0 64px`, porque a regra hoje declara `padding: 0 32px 64px` e logo abaixo `padding-top: 32px`, que sobrescreve o zero do atalho | Sem a subtração, o bloco de apoio da home ficaria com recuo lateral de 64px, o dobro do resto da página, dentro de uma coluna de 720px aninhada em outra de 720px. A guarda, por medir o `<main>`, não veria o defeito: é precisamente o ponto cego que a auditoria encontrou (A002). Ver o corolário de RN-01b | manter a folha como está e aceitar a coluna aninhada; excetuar o bloco da regra do `<main>` por especificidade | 🟢 |
| D-10 | O escopo de `consulta-puericultura.css` é verificado por **guarda de escopo**, e não pela leitura do revisor: o diff daquela folha há de restringir-se à linha do `minmax` de `.consulta-identificacao` | D-08 e RF-08b afirmam que a folha da tela fica intocada fora daquela linha, e nenhuma ação verificava a afirmação (A006). Promessa de escopo sem verificação é intenção, não critério | conferência visual do diff durante a revisão | 🟢 |
| D-11 | O seletor da coluna é `.pagina[data-apresentacao="…"] > main`, sem classe nova no JSX | O `<main>` de `moldura.tsx:115` é emitido sem atributo algum, e assim permanece: acrescentar-lhe classe tocaria o `.tsx`, que RN-03 mantém fora do alcance da feature. O filho direto de `.pagina` é inequívoco, e a chave de variante já está no pai | dar classe `.moldura-corpo` ao `<main>`; estilizar `main` sem qualificação | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| Três colunas na identificação da consulta leem melhor que cinco, e `22rem` é o piso que as produz em 1280px | §5, RF-08; D-06 | Baixo, e visível no primeiro uso. O valor do piso é uma constante numa folha; corrigi-lo custa uma linha e nenhum teste muda, porque nenhuma asserção o afirma |
| Nenhuma tela legítima da plataforma precisa sair da coluna sem ser home nem calculadora | §4, RN-01b; `MD-0029` | Médio se errada. A resposta prevista não é exceção na folha, e sim variante nova de `apresentacao`, com o par cabeçalho-corpo calibrado num lugar só |
| Alinhar o bloco de apoio ao que está acima dele, na home, é correção e não perda | D-09; §5, RF-04 | Baixo, e a mudança é **visível em toda largura**, não só no telefone. São dois efeitos, e ambos ficam declarados aqui para que quem confira não os reporte como regressão. No telefone, o bloco mantém hoje 32px de recuo onde as seções acima dele já caíram para 16px, porque `.contribuicao-bloco` não tem media query própria; a subtração iguala os dois. Em qualquer largura, a régua de `border-top` (`contribuicao.css:29`) mede hoje os 720px da caixa, ao passo que o texto acima e abaixo dela alinha em 656px, por `box-sizing: border-box` (`globais.css:10`); cedida a coluna ao `<main>`, o bloco passa a ocupar a largura de conteúdo do `<main>` e a régua encolhe para 656px, alinhando-se ao texto. O segundo efeito foi apurado na decomposição, e é consequência de D-09, não escopo acrescentado |

Nenhuma destas premissas vem de `[DÚVIDA]` não resolvida: a feature entra no plano com a
seção de lacunas zerada. As duas questões abertas do `requirements.md` são da feature 020 e
estão declaradas `Won't` no MoSCoW desta.

## 5. Delta arquitetural

As âncoras abaixo citam `_reversa_sdd/architecture.md` pela **seção numerada**, e não por
cabeçalho de componente: o documento descreve `interface/comum` e `interface/estilos` em prosa
na seção 2, sem cabeçalho próprio para cada um, e a forma anterior de citá-los não resolvia
(A007).

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `interface/comum` (`Moldura`) | `_reversa_sdd/architecture.md` §2; `interface/comum/moldura.tsx:115` | regra-alterada | O `<main>` passa a ser a sede da coluna do corpo; o componente `.tsx` **não muda**, só ganha a regra de estilo que o alcança pelo atributo que o pai já emite (D-11) |
| `interface/estilos` | `_reversa_sdd/architecture.md` §2; `interface/estilos/` | componente-novo | Nasce `moldura.css`, **nona** folha do diretório, com as duas variantes da coluna e os dois breakpoints |
| `interface/estilos/globais.css` | `globais.css:33` (`.calc-regioes`) | regra-alterada | Perde `max-width`, `margin: 0 auto` e o recuo lateral, na regra-base e na media query de 900px; conserva o vertical em `padding-block` |
| `interface/estilos/inicio.css` | `inicio.css:34` (`.inicio-secoes`) | regra-alterada | Mesma subtração, na regra-base e na media query de 544px |
| `interface/estilos/contribuicao.css` | `contribuicao.css:21` (`.contribuicao-bloco`) | regra-alterada | Mesma subtração (D-09). Não tem media query própria, e é por isso que a subtração muda o recuo do telefone |
| `interface/puericultura/consulta` | `consulta-puericultura.css` (`.consulta-identificacao`); feature 020 | regra-alterada | Só o piso do `minmax`; nenhum `.tsx` da tela muda, e o restante da folha é vigiado por D-10 |
| Guarda geométrica e2e | `e2e/plataforma.spec.ts:372` (T002 da 013) | regra-alterada | Deixa de medir uma rota fixa e uma classe fixa; passa a percorrer o catálogo, somar a home e medir o `<main>` |
| `models/*`, `interface/inicio/catalogo.ts`, `pages/api/*` | — | inalterado | RF-09: o catálogo é **lido** pelo teste, jamais escrito |
| `puericultura.css`, `cardiologia.css`, `risco-cardiovascular.css`, `cabecalho.css` | — | inalterado | Nomeadas por RF-04 como as folhas que hão de permanecer sem diff |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma**. A feature não toca `models/`, não cria campo, não altera
  ficha, não muda o formato do registro nem o inventário textual.
- Detalhe completo em: `_reversa_forward/021-coluna-da-ficha-de-consulta/data-delta.md`

## 7. Delta de contratos externos

Nenhum. O contrato `interfaces/registro-soap.md` da feature 020 permanece válido byte a byte,
e `openapi/status.yaml` não é tocado. O diretório `interfaces/` é omitido nesta feature por
não haver contrato afetado.

Registre-se, porque a sessão de esclarecimento o levantou: a queixa sobre as notas de
proveniência dentro do texto copiado **é** matéria da regra 7 daquele contrato, e por isso não
cabe aqui.

## 8. Plano de migração

Não se aplica no sentido de dados. A ordem de execução, porém, não é livre, e é ela que
protege RF-04:

1. Escrever a guarda generalizada, com as rotas vindas do catálogo e o alvo em `<main>`,
   acrescentar-lhe o caso da home e **executá-la** para vê-la passar nas cinco telas antigas e
   na home e reprovar em `/puericultura/consulta`. Sem esta reprovação registrada, RF-03 não
   tem critério de aceite.
2. Criar `moldura.css` com as duas variantes e os dois breakpoints, e importá-la em `_app.tsx`
   logo após `globais.css`.
3. Subtrair `max-width`, `margin: 0 auto` e o recuo lateral dos **três** declarantes —
   `.calc-regioes`, `.inicio-secoes` e `.contribuicao-bloco` —, convertendo o recuo remanescente
   em `padding-block` explícito em cada um, inclusive dentro das duas media queries que existem.
   O bloco de apoio não tem media query, e o seu `padding-block` é `32px 64px` por D-09.
4. Rodar a guarda de novo: os sete casos passam. Rodar a suíte e2e inteira e a varredura axe.
5. Só então o ajuste de `.consulta-identificacao` (D-06), que é independente e pode ser
   descartado sem afetar o resto.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Mover propriedades entre folhas altera a cascata e desloca uma tela antiga | alto | média | A guarda de D-05 mede os sete casos nas duas pontas, e a suíte e2e das telas anteriores roda sem alteração de asserção (RF-04). O passo 1 do plano existe para que a linha de base seja medida antes da mudança |
| A home muda de largura ao perder `max-width` de `.inicio-secoes` | alto | baixa | A variante `destaque` recebe os mesmos 720px no `<main>`; a guarda passa a medir a home também, contra `calc(50% - 328px)` |
| O bloco de apoio da home fica com coluna aninhada e recuo dobrado | alto | nula, uma vez adotada D-09 | Era o ponto cego de A002, e a guarda não o veria por medir o `<main>`. D-09 o resolve na origem, e a conferência do onboarding o inspeciona a olho nas duas larguras |
| O recuo lateral do telefone regride por unificação de breakpoint | médio | baixa | D-04 preserva os dois breakpoints existentes; RF-02 mede 375px explicitamente |
| `padding-block` esquecido numa media query, produzindo respiro vertical errado | médio | média | O passo 3 converte as duas media queries junto com as regras-base, e a revisão do diff cobre as cinco ocorrências: três regras-base e duas media queries |
| A folha nova aproxima `globais.css` do teto de 400 linhas | baixo | nula | D-03 evita `globais.css` justamente por isso; a folha nova nasce com ~30 linhas, e `globais.css` **encolhe** ao ceder as três propriedades |
| O ajuste de `.consulta-identificacao` desagradar em uso | baixo | média | É o último passo, isolado, e nenhuma asserção depende do valor do piso |
| A rastreabilidade não fecha, porque a extração não registra a feature que esta corrige | médio | certa, enquanto os adendos não existirem | Achado A003: `_reversa_sdd/addenda/` termina em `018`, e as features 019 e 020 seguem pendentes de `/reversa-sync`. Não afeta a execução, que lê o código; afeta quem ler a extração daqui a seis meses e encontrar a correção sem encontrar o que foi corrigido. Os três adendos são a mesma dívida e se pagam em sequência |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] RF-01 e RF-02 verificados por guarda geométrica em 1280px e por medição em 375px
- [ ] RF-03 com a **reprovação demonstrada**: desfeita a correção, a guarda reprova nomeando `/puericultura/consulta`
- [ ] RF-03 com a guarda cobrindo **sete casos**: as seis rotas do catálogo mais `/` na variante `destaque`
- [ ] RF-04 na forma que ele afirma desde a segunda sessão de clarify: **invariância verificada**, e não ausência de diff. As cinco telas anteriores passam sem alteração de asserção nos roteiros de comportamento, excetuada nominalmente a guarda geométrica, que é objeto de RF-03; `globais.css`, `inicio.css` e `contribuicao.css` mudam por RN-01b e D-09, `consulta-puericultura.css` por RF-08, e `puericultura.css`, `cardiologia.css` e `risco-cardiovascular.css` permanecem sem diff
- [ ] RF-05 com o registro do 1.º Mês inteiro preenchido, sem rolagem horizontal em 1280px nem em 375px
- [ ] RF-06 com `e2e/axe-baseline.json` sem diff
- [ ] RF-07 com `node scripts/inventariar-textos.mts --gerar` idempotente e sem candidato órfão
- [ ] RF-08b com a guarda de escopo de D-10: o diff de `consulta-puericultura.css` restrito à linha do `minmax` de `.consulta-identificacao`
- [ ] RF-09 com `git diff` vazio em `models/`, `interface/inicio/catalogo.ts` e `pages/api/`
- [ ] `typecheck`, `lint`, suíte de unidade e integração, e2e: verdes
- [ ] `regression-watch.md` gerado
- [ ] `/reversa-sync` executado, com adendo `021`, e a dívida do risco 7 quitada com os adendos `019` e `020`

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial gerada por `/reversa-plan`, sobre o `requirements.md` com lacunas zeradas e a decisão `MD-0029` já fichada | reversa |
| 2026-07-28 | Emenda pontual da terceira premissa, sobre achado da decomposição em `/reversa-to-do`: a subtração de `.contribuicao-bloco` muda a home em **toda largura**, e não só em 375px, porque a régua de `border-top` encolhe de 720px para 656px e passa a alinhar-se ao texto. Consequência de D-09, que a premissa não declarava. Edição pontual, e não `/reversa-plan`, pela mesma razão que a auditoria deu para A002: regerar o documento inteiro seria desproporcional ao ajuste | reversa |
| 2026-07-28 | `/reversa-plan`, reconciliação com o `requirements.md` reescrito após `audit/cross-check.md`. Nascem D-09 (terceiro declarante da coluna, que ampara a ação T012 e desfaz a inversão da cadeia apontada em A002), D-10 (guarda de escopo de `consulta-puericultura.css`, A006) e D-11 (seletor `> main` sem classe nova). Corrigidos três erros factuais apurados na leitura do código: `moldura.css` é a **nona** folha e não a sexta; a conversão de `.contribuicao-bloco` é `padding-block: 32px 64px`, porque `padding-top: 32px` sobrescreve o zero do atalho; o bloco não tem media query própria, de modo que a subtração muda o recuo do telefone de 32px para 16px — mudança visível, declarada como terceira premissa. A contagem passa de "seis rotas" a **sete casos** em §8, §9 e §10 (A005); o critério de pronto absorve RF-04 na forma de invariância verificada (A001, A004); as âncoras de `architecture.md` passam a citar a seção 2 (A007); a dívida dos adendos 019 e 020 entra como risco 7 (A003) | reversa |
