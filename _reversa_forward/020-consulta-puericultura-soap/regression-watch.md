# Regression Watch — 020-consulta-puericultura-soap

> Feature: ficha de consulta de puericultura, da caderneta ao SOAP
> Data: `2026-07-28`
> O que este arquivo é: a lista do que precisa **continuar verdadeiro** nas próximas
> extrações. O agente reverso o consulta ao rodar `/reversa` de novo e preenche o histórico.

## Watch principal

Um único item herda regra 🟢 modificada (§7 do `legacy-impact.md`). Os demais nascem de regras
novas que a feature acrescentou ao `domain.md` e que uma re-extração precisa reencontrar.

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo | Sinal de violação |
|----|--------------------------|-------------------------------|------|-------------------|
| W001 | `tests/unit/textos/citacao.test.ts`, `SUBARVORES_COM_ORACULO_PROPRIO` | A isenção do verificador de citação é **nominal**, com uma entrada só (`models/puericultura/consulta/`), e cada entrada declara o oráculo que a guarda | presença | A lista ganhar entrada sem oráculo declarado, ou virar regra genérica do tipo "arquivo novo é isento". Aí o verificador de RF-07 da 018 deixa de reprovar sem produzir sinal |
| W002 | `tests/apoio/citacao-linha-de-base.json` | O arquivo permanece **byte a byte** como emitido em 27/07, e o gerador continua se recusando a sobrescrevê-lo | ausência (de mudança) | Qualquer diff nele. Regerado, a comparação passa a ser do estado corrente consigo mesmo: verde para sempre, incapaz de reprovar (`MD-0018`) |
| W003 | `tests/unit/dominio-puericultura/consulta-transcricao.test.ts`, `EXCECOES_DE_LAYOUT` | A lista de exceções de layout tem **4 entradas**, cada uma com o motivo escrito, e o teto de 10 continua asserido por teste | presença | Passar de dez, ou entrada sem motivo. Exceção que cresce sob demanda deixa de ser exceção e vira o comportamento (D-12) |
| W004 | `models/puericultura/consulta/fichas/segundo-mes.ts` e `fonte-clinica.ts` | "Criptorquidia" continua declarada `sexos: ["masculino"]` **e** `NOTA_SUPRESSAO_DE_CAMPO` continua existindo e nomeando o campo | presença | A supressão sem a nota, ou a nota sem a supressão. `MD-0026` autorizou a **omissão declarada**, e as duas metades são inseparáveis |
| W005 | `models/puericultura/consulta/fichas/**` | Nenhum rótulo é montado por crase interpolada; a flexão por sexo entra como par `rotulo`/`rotuloFeminino` | ausência | `rotulo: \`…${…}\`` em qualquer módulo de ficha. Texto montado em tempo de execução sai do inventário textual sem que ninguém perceba (D-06) |
| W006 | `models/puericultura/consulta/registro.ts` | Campo não preenchido não aparece no registro, e seção sem item é omitida inteira, cabeçalho incluído (RN-10) | presença | Linha em branco, "não informado" ou cabeçalho de seção vazia no texto copiado |
| W007 | `interface/puericultura/consulta/app.tsx` | O texto exibido e o entregue à área de transferência saem do **mesmo** `useMemo`, sem segunda montagem da cadeia (RF-08, D-03) | presença | Duas chamadas a `formatarRegistro`, ou o comando de cópia recebendo valor que não seja o exibido. É o defeito que faz conferir uma coisa e colar outra |
| W008 | `models/puericultura/consulta/selecao.ts` | A sugestão da ficha usa `idades.diasDeVida`, a **cronológica**, inclusive no pré-termo, e devolve a espécie junto (RN-04, RN-05) | presença | Uso de `diasCorrigidos` na seleção. Não contraria `MD-0011`: aquela ficha repartiu medir o corpo e ler a curva, e escolher a ficha não é nenhum dos dois |
| W009 | `models/puericultura/consulta/registro.ts` | A seção **A** só recebe item de origem `ficha` cujo campo declare `secaoSoap: "A"`; o motor não forma juízo (RN-09b, ADR 0005) | presença | Item na avaliação sem campo correspondente na ficha, ou conclusão sintetizada pelo produto |
| W010 | `models/puericultura/consulta/calculadora.ts` | A fachada recebe `ResultadoAvaliacao` **pronto** e não recalcula escore algum (RN-11) | ausência | Importação de `oms/`, `intergrowth/` ou `escoreZ` no submódulo da consulta. Seria uma segunda fonte de escore z dentro da mesma unit |
| W011 | `interface/inicio/catalogo.ts` | A seção `puericultura` tem duas fichas, e as cinco entradas anteriores do catálogo permanecem byte a byte | presença | Alteração em qualquer entrada anterior. O diff da 020 é aditivo, e `inicio.test.tsx` o prova por lista ordenada exaustiva |
| W012 | `interface/puericultura/consulta/app.tsx` | O painel de crescimento entra por `next/dynamic`, e a rota nova não carrega as tabelas da OMS no primeiro acesso (RF-11) | presença | `import` estático de `painel-crescimento`. O sinal objetivo está em `medicao-bundle.md`: valores `L/M/S` nos chunks do primeiro carregamento de `/puericultura/consulta` |
| W013 | `interface/puericultura/consulta/proveniencia.tsx` | Proveniência e aviso de não persistência leem as constantes do **domínio**, sem texto próprio na tela (RF-12, RF-13) | presença | Literal de proveniência escrito na tela. É o mecanismo anti-drift da 017: motor e apresentação não podem divergir sobre o que se promete |
| W014 | `interface/puericultura/consulta/**` | A tela não tem `checkbox` de ritual de revisão, e o comando de cópia fica sempre disponível (RN-14, ADR 0012) | ausência | Confirmação antes de copiar. Cerimônia onde não há prescrição de dose é o que faz a cerimônia necessária virar hábito |
| W015 | `e2e/consulta-puericultura.spec.ts` | A rota nova mantém `axe` em **zero**, por asserção direta, e não por entrada em `e2e/axe-baseline.json` | ausência | Entrada nova na baseline para esta rota. Tela que nasce limpa não precisa de tolerância; registrar zero num arquivo de exceções só cria onde afrouxá-la |

## Observações (sem peso de regressão)

Nascem de premissas 🟡 ou de dívida declarada, e por isso ficam fora do watch principal.

| ID | O que observar | Por que não é watch |
|----|----------------|---------------------|
| O-20-01 | A ficha sugerida entre duas consultas previstas é a **anterior** (criança de sete meses → 6.º Mês) | Premissa 🟡 do roadmap §4. O sinal de que está errada é o prescritor trocar a ficha com frequência, e a troca custa um clique |
| O-20-02 | "Laços de afeto" e "Sinais de violências/negligências" em **O**, "Acidentes domésticos" em **P** | Premissa 🟡 do requirements §10. Só a leitura do registro pronto confirma; corrigir custa uma linha do mapa |
| O-20-03 | O critério de repartição dos sinais de alerta: vai para **O** o que exige exame ou medição, para **S** o sintoma relatado | Decidido na execução, e declarado no cabeçalho de `primeira-semana.ts`. É colocação editorial, não regra clínica da fonte |
| O-20-04 | `scripts/textos/classes/interface.mts` foi de 589 para **684 linhas**, e já estava acima do teto de 400 | Dívida herdada da 018, agravada. É mapa de declarações, não lógica, e a exceção do README não o alcança nominalmente |
| O-20-05 | Cobertura de **ramos** do submódulo em 82,8%, contra 95,2% do conjunto | O limiar contratual é global e continua satisfeito. Os ramos descobertos são de apresentação por natureza de campo |
| O-20-06 | O `Dialog` do Primer tem o comando de fechar com nome acessível em inglês | Herdado de `O-19-03`: o componente não é localizado, e a 020 usa o mesmo painel |
| O-20-07 | A fonte imprime "Orelhinha - Exame autidivo" (p. 69), com a troca de letras, e a transcrição a reproduz | Desvio de digitação da fonte, fora da exceção de `MD-0015`, que alcança só concordância. Fica como a página traz, e o oráculo confirma a procedência |
| O-20-08 | As duas tiragens divergem no espaço antes da interrogação de "Parou de amamentar" (pp. 70 e 71) | Resolvido pelo par de rótulos de D-06, sem corrigir nenhuma das duas formas |
| O-20-09 | Os módulos das fichas usam extensão `.ts` explícita nos imports de valor | Exigido para que o módulo dev-time de classes as importe pelo Node. Autorizado desde a 017 por `allowImportingTsExtensions`, e o build de produção foi conferido |
| O-20-10 | `format:check` reprova 587 arquivos no estado anterior a esta feature | Dívida pré-existente, não regressão. Os arquivos novos desta entrega estão formatados |

## Histórico de re-extrações

### Re-extração 2026-07-28 23:50

> Re-extração nº 4 · 15 watch items verificados contra o SDD regenerado e contra o código.

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | `SUBARVORES_COM_ORACULO_PROPRIO` com **uma entrada**, e ela declara o oráculo que a guarda |
| W002 | 🟢 verde | `citacao-linha-de-base.json` com **um único commit**, o da feature 018 |
| W003 | 🟢 verde | `EXCECOES_DE_LAYOUT` com **4 entradas**, teto de 10 asserido (`toBeLessThanOrEqual(TETO_DE_EXCECOES)`) e motivo exigido por teste próprio |
| W004..W009, W011, W013..W015 | 🟢 verde | supressão e nota inseparáveis; zero rótulos por crase interpolada; omissão de campo e de seção vazia; um `useMemo` único para exibir e copiar; sugestão pela idade cronológica; sem ritual de revisão |
| W010 | 🟢 verde | **nenhum import de `oms/` ou `intergrowth/` no submódulo**: as três ocorrências de `escoreZ` são a função local de formatação e a leitura do campo do resultado já pronto |
| W012 | 🟢 verde | `next/dynamic` presente no painel de crescimento |

Vazio. Será preenchido pelo agente reverso quando `/reversa` rodar de novo.

## Arquivadas

Vazio.
