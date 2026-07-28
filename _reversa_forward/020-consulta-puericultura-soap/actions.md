# Actions: Ficha de consulta de puericultura, da caderneta ao SOAP

> Identificador: `020-consulta-puericultura-soap`
> Data: `2026-07-28`
> Roadmap: `_reversa_forward/020-consulta-puericultura-soap/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 46 |
| Paralelizáveis (`[//]`) | 29 |
| Maior cadeia de dependência | 9 (T004 → T005 → T007 → T017 → T027 → T033 → T035 → T039 → T046) |

**A ordem que importa, e por quê.** O oráculo de transcrição (T007) precede as dez fichas de
propósito: o guarda existe primeiro, e a transcrição nasce sob ele. Transcrever antes e conferir
depois faria de trezentos e cinquenta rótulos uma única auditoria no fim, que é o modo mais caro e
menos confiável de descobrir um erro de digitação numa página impressa.

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Escrever o contrato do submódulo: `Ficha`, `SecaoDaFicha`, `Campo` (união por `natureza`), `Resposta`, `ContextoDaConsulta`, `RegistroDaConsulta`, `SecaoDoRegistro`, `ItemDoRegistro`, com cabeçalho citando os RF/RN que os originam | - | `[//]` | `models/puericultura/consulta/tipos.ts` | 🟢 | `[ ]` |
| T002 | Declarar `REFERENCIAS_DA_CONSULTA` para as pp. 66 a 75, reusando `referencia()` e `FONTE_ID` de `models/puericultura/fonte-clinica.ts`, sem redeclarar a fonte | - | `[//]` | `models/puericultura/consulta/fonte-clinica.ts` | 🟢 | `[ ]` |
| T003 | Escrever as quatro notas do domínio — organização em SOAP autoral, fichas ausentes das pp. 67/68/75, supressão de "Criptorquidia" e não persistência —, cada uma como constante própria, no molde de `NOTA_CORRECAO_DE_CONCORDANCIA` | T002 | - | `models/puericultura/consulta/fonte-clinica.ts` | 🟢 | `[ ]` |
| T004 | Escrever o script dev-time que extrai as pp. 66 a 75 das duas tiragens em **duas** passagens (`-layout` e fluxo de leitura) e emite o congelado, no molde de `scripts/congelar-casos-oraculo.mts` | - | `[//]` | `scripts/congelar-fichas-caderneta.mts` | 🟢 | `[ ]` |
| T005 | Executar o congelamento e versionar o artefato; o PDF permanece fora do git por `MD-0008` | T004 | - | `tests/apoio/fichas-caderneta-congeladas.json` | 🟢 | `[ ]` |
| T006 | Criar a sétima folha de estilo com a estrutura de regiões da ficha longa e importá-la em `_app.tsx`, sem tocar `puericultura.css` nem `globais.css` | - | `[//]` | `interface/estilos/consulta-puericultura.css` | 🟢 | `[ ]` |

## Fase 2, Testes

<!-- Escritos antes do núcleo: o projeto pratica TDD por princípio VII, e aqui o teste de transcrição é o que torna a transcrição possível. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Oráculo de transcrição: para cada campo declarado, afirmar que o rótulo ocorre no texto congelado da página que o próprio campo aponta, em ao menos uma das duas extrações; exceções de layout em lista fechada e declarada, com o motivo de cada uma | T001, T005 | `[//]` | `tests/unit/dominio-puericultura/consulta-transcricao.test.ts` | 🟡 | `[ ]` |
| T008 | Testes da seleção por idade: faixa de cada uma das dez fichas, idade entre duas consultas caindo na anterior, e a espécie de idade devolvida junto com a sugestão | T001 | `[//]` | `tests/unit/dominio-puericultura/consulta-selecao.test.ts` | 🟢 | `[ ]` |
| T009 | Testes da montagem do registro: ordem S/O/A/P, campo não preenchido ausente, seção sem item omitida com cabeçalho, e a regra RN-09b de que a avaliação só recebe campo que a ficha imprime como juízo | T001 | `[//]` | `tests/unit/dominio-puericultura/consulta-registro.test.ts` | 🟢 | `[ ]` |
| T010 | Testes property-based dos invariantes: referência nunca vazia, nenhum campo não preenchido no registro, mesma entrada produzindo o mesmo registro | T001 | `[//]` | `tests/unit/dominio-puericultura/consulta-invariantes.test.ts` | 🟢 | `[ ]` |
| T011 | Testes de aplicabilidade por sexo: "Criptorquidia" ausente na ficha feminina do 2.º Mês e presente na masculina; rótulos de flexão vindo do par declarado, jamais de interpolação | T001 | `[//]` | `tests/unit/dominio-puericultura/consulta-sexo.test.ts` | 🟢 | `[ ]` |
| T012 | Testes do formatador: forma do contrato de `interfaces/registro-soap.md`, com cabeçalho, seções, notas e linha de fonte | T001 | `[//]` | `tests/unit/interface/formatar-registro.test.ts` | 🟢 | `[ ]` |
| T013 | Teste de que a cadeia exibida na tela e a entregue à área de transferência são a mesma, com o clipboard dublado no molde de `AcaoCopiar` | T001 | `[//]` | `tests/integration/interface/consulta-puericultura.test.tsx` | 🟢 | `[ ]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T014 | Implementar a seleção da ficha pela idade cronológica, devolvendo a ficha sugerida e a espécie de idade que governou | T008 | - | `models/puericultura/consulta/selecao.ts` | 🟢 | `[ ]` |
| T015 | Implementar a montagem do registro: percorrer a ficha na ordem impressa, descartar o não preenchido, agrupar por seção do SOAP, omitir seção vazia e anexar notas e referências | T009, T010 | - | `models/puericultura/consulta/registro.ts` | 🟢 | `[ ]` |
| T016 | Implementar a fachada `RegistroDeConsultaPuericultura.montar`, segunda fachada da unit, recebendo o `ResultadoAvaliacao` da 017 já pronto e sem recalcular nada | T014, T015 | - | `models/puericultura/consulta/calculadora.ts` | 🟢 | `[ ]` |
| T017 | Transcrever a ficha da **1.ª Semana** (p. 68) campo a campo, com seção do SOAP e página por campo, verde no oráculo antes de seguir | T007 | `[//]` | `models/puericultura/consulta/fichas/primeira-semana.ts` | 🟢 | `[ ]` |
| T018 | Transcrever a ficha do **1.º Mês** (p. 69), inclusive o quadro de triagem neonatal e a classificação do desenvolvimento em três níveis | T007 | `[//]` | `models/puericultura/consulta/fichas/primeiro-mes.ts` | 🟢 | `[ ]` |
| T019 | Transcrever a ficha do **2.º Mês** (p. 70), com "Criptorquidia" declarada `sexos: ["masculino"]` conforme `MD-0026` | T007 | `[//]` | `models/puericultura/consulta/fichas/segundo-mes.ts` | 🟢 | `[ ]` |
| T020 | Transcrever a ficha do **4.º Mês** (p. 71) | T007 | `[//]` | `models/puericultura/consulta/fichas/quarto-mes.ts` | 🟢 | `[ ]` |
| T021 | Transcrever a ficha do **6.º Mês** (p. 72) | T007 | `[//]` | `models/puericultura/consulta/fichas/sexto-mes.ts` | 🟢 | `[ ]` |
| T022 | Transcrever a ficha do **9.º Mês** (p. 72) | T007 | `[//]` | `models/puericultura/consulta/fichas/nono-mes.ts` | 🟢 | `[ ]` |
| T023 | Transcrever a ficha do **12.º Mês** (p. 73) | T007 | `[//]` | `models/puericultura/consulta/fichas/decimo-segundo-mes.ts` | 🟢 | `[ ]` |
| T024 | Transcrever a ficha do **18.º Mês** (p. 73) | T007 | `[//]` | `models/puericultura/consulta/fichas/decimo-oitavo-mes.ts` | 🟢 | `[ ]` |
| T025 | Transcrever a ficha do **24.º Mês** (p. 74) | T007 | `[//]` | `models/puericultura/consulta/fichas/vigesimo-quarto-mes.ts` | 🟢 | `[ ]` |
| T026 | Transcrever a ficha do **36.º Mês** (p. 74) | T007 | `[//]` | `models/puericultura/consulta/fichas/trigesimo-sexto-mes.ts` | 🟢 | `[ ]` |
| T027 | Reunir as dez fichas num índice congelado por `Object.freeze`, com a faixa de idade em dias de cada uma, no molde do `CATALOGO` | T017, T018, T019, T020, T021, T022, T023, T024, T025, T026 | - | `models/puericultura/consulta/fichas/indice.ts` | 🟢 | `[ ]` |
| T028 | Escrever o módulo de classes textuais que deriva as declarações do próprio catálogo: rótulo é `citacao` com `origem` na página que o campo declara, `id` e `natureza` são `identificador`, e os literais autorais vão declarados à mão | T027, T011 | - | `scripts/textos/classes/models-puericultura-consulta.mts` | 🟡 | `[ ]` |
| T029 | Registrar o módulo novo em `MODULOS`, com predicado `models/puericultura/consulta/` **antes** do de `models/puericultura/`, de modo que a mensagem de erro aponte o módulo certo | T028 | - | `scripts/textos/classificacao.mts` | 🟢 | `[ ]` |
| T030 | Rodar `node scripts/inventariar-textos.mts --gerar`, fechar todo candidato órfão e conferir que a segunda execução deixa `git diff` vazio | T029 | - | `tests/apoio/inventario-textual.json` | 🟢 | `[ ]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T031 | Implementar a projeção pura do registro em texto, conforme `interfaces/registro-soap.md`, no molde de `formatar-plano.ts` | T016, T012 | `[//]` | `interface/puericultura/consulta/formatar-registro.ts` | 🟢 | `[ ]` |
| T032 | Implementar a identificação da consulta: sexo, data de nascimento, data da consulta e idade gestacional ao nascer, exibindo as duas idades rotuladas quando houver pré-termo | T016 | `[//]` | `interface/puericultura/consulta/identificacao.tsx` | 🟢 | `[ ]` |
| T033 | Implementar a renderização da ficha, com um componente por natureza de campo (marcação, escolha, medida, texto), seções em `fieldset`/`legend` e cabeçalhos na hierarquia da fonte | T027, T032 | - | `interface/puericultura/consulta/ficha.tsx` | 🟢 | `[ ]` |
| T034 | Implementar o seletor de ficha, com a sugestão vinda da idade e a troca livre entre as dez, sem recarregar a página | T014, T033 | - | `interface/puericultura/consulta/seletor-de-ficha.tsx` | 🟢 | `[ ]` |
| T035 | Implementar o bloco do registro: texto visível para conferência e comando de cópia sobre a mesma cadeia, reusando `AcaoCopiar` da 019 sem alterar assinatura | T031, T033, T013 | - | `interface/puericultura/consulta/registro.tsx` | 🟢 | `[ ]` |
| T036 | Implementar o painel da calculadora de crescimento sob demanda: `next/dynamic` no molde de `bloco-de-apoio.tsx`, `Dialog` do Primer, montagem da `EntradaAvaliacao` a partir da ficha com conversão de gramas para quilos e o campo autoral de posição da medição | T033 | - | `interface/puericultura/consulta/painel-crescimento.tsx` | 🟢 | `[ ]` |
| T037 | Incorporar ao registro os escores z na seção objetiva e a classificação nutricional na avaliação, com a `ReferenciaClinica` que a fachada da 017 emite | T036, T015 | - | `interface/puericultura/consulta/app.tsx` | 🟢 | `[ ]` |
| T038 | Implementar o bloco de proveniência e o aviso de não persistência, ambos lendo as constantes do domínio, visíveis desde o primeiro carregamento e sem rolagem em viewport de telefone | T003, T033 | - | `interface/puericultura/consulta/proveniencia.tsx` | 🟢 | `[ ]` |
| T039 | Criar a rota com metadados próprios e acrescentar a segunda ficha à seção Puericultura do catálogo, sem tocar as entradas existentes | T033 | - | `pages/puericultura/consulta.tsx` | 🟢 | `[ ]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T040 | Teste de integração do fluxo inteiro: identificar, escolher ficha, preencher, abrir o painel, copiar; mais o teste negativo de que a tela não tem `checkbox` de ritual de revisão | T039 | `[//]` | `tests/integration/interface/consulta-puericultura.test.tsx` | 🟢 | `[ ]` |
| T041 | Teste e2e da rota nova com varredura `axe`, mantendo `e2e/axe-baseline.json` intocado, e a ficha longa percorrível por teclado sem armadilha de foco no painel | T039 | `[//]` | `e2e/consulta-puericultura.spec.ts` | 🟢 | `[ ]` |
| T042 | Guarda de privacidade em ponta a ponta: zero requisição externa e nenhuma chave nova em `localStorage` ou `sessionStorage` durante preenchimento, avaliação e cópia | T039 | `[//]` | `e2e/consulta-puericultura.spec.ts` | 🟢 | `[ ]` |
| T043 | Medir o custo de bundle no molde de `medicao-bundle.md` da 019, comprovando que as oito rotas existentes não pagam nada e que a rota nova não carrega o painel de crescimento no primeiro carregamento | T039 | `[//]` | `_reversa_forward/020-consulta-puericultura-soap/medicao-bundle.md` | 🟢 | `[ ]` |
| T044 | Fechar os estilos da ficha longa sobre tokens Primer, com a folha nova abaixo do teto de 400 linhas | T039 | `[//]` | `interface/estilos/consulta-puericultura.css` | 🟢 | `[ ]` |
| T045 | Acrescentar a linha da calculadora nova à tabela do README e uma nota sobre onde vive o dado das fichas | T039 | `[//]` | `README.md` | 🟢 | `[ ]` |
| T046 | Conferir os sinais de dívida sob o volume desta feature: nenhum arquivo acima de 400 linhas, nenhuma função acima de 50, cobertura de `models/**` preservada, e a lista de exceções do oráculo ainda fechada | T040, T041, T042, T043, T044, T045 | - | `_reversa_forward/020-consulta-puericultura-soap/regression-watch.md` | 🟡 | `[ ]` |

## Notas de execução

<!-- Reservado para /reversa-coding. -->

Duas advertências que valem antes da primeira ação:

1. **T007 antes de T017.** Se a ordem se inverter, trezentos e cinquenta rótulos chegam ao fim da
   feature sem nenhuma conferência, e a auditoria única que restaria é a que `MD-0010` recusa.
2. **A lista de exceções de layout do oráculo é fechada.** Se ela passar de dez itens, parar e
   reabrir a decisão D-12 em vez de crescer a exceção em silêncio: uma exceção que cresce sob
   demanda deixa de ser exceção e vira o comportamento.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial gerada por `/reversa-to-do` | reversa |
