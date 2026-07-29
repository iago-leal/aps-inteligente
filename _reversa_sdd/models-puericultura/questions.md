# `models/puericultura` — Perguntas ao domínio clínico

> Premissas que o código assume e a fonte não decide, reunidas na re-extração nº 4
> (2026-07-28). Nenhuma delas impede a reimplementação; todas mudam número ou redação em
> tela se a resposta for outra.
> Convenção da plataforma: 🟡 é premissa em uso, não erro conhecido.

## Q-P1 · O limite estendido da correção de idade 🟡

**O que o código faz.** A correção de prematuridade vale até 730 dias de vida e, quando a
idade gestacional ao nascer é inferior a 28 semanas, até 1.095 (`fonte-clinica.ts:FRONTEIRAS`).

**Por que é premissa.** A caderneta ensina a corrigir a idade (p. 86) sem publicar o limite em
dias. Os números vieram da prática corrente — dois anos, três no muito prematuro — convertidos
em dias pela ficha `MD-0006`, porque sem número não há teste.

**O que muda se a resposta for outra.** A criança entre os dois limites passa a ser lida na
idade cronológica, e o escore muda de faixa em parte dos casos.

## Q-P2 · O ano de 365 dias corridos 🟡

**O que o código faz.** As fronteiras da correção contam 365 dias corridos, e não a data civil
de aniversário.

**Por que é premissa.** A escolha uniformiza a unidade das duas fronteiras da mesma regra. Em
compensação, uma criança nascida em ano bissexto atinge o limite um dia antes do aniversário.

## Q-P3 · A idade cronológica governa a posição de medida 🟡

**O que o código faz.** A posição esperada da medição segue `diasDeVida`, não `diasCorrigidos`
(`medidas.ts:posicaoEsperadaEm`). Um prematuro com dois anos de vida mede-se em pé, ainda que
a sua curva seja lida na idade corrigida.

**Por que é premissa.** A leitura é que a posição é propriedade do corpo da criança, não da
curva. A fonte não trata do caso.

**O que muda se a resposta for outra.** A conversão de 0,7 cm passaria a incidir noutro
conjunto de crianças, com efeito nos índices de estatura e de IMC.

## Q-P4 · As faixas de plausibilidade da digitação 🟡

**O que o código faz.** Recusa peso fora de (0; 150] kg, comprimento fora de (20; 200] cm,
perímetro cefálico fora de (20; 70] cm e IG fora de 22 a 42 semanas
(`fonte-clinica.ts:FAIXAS_DE_PLAUSIBILIDADE`).

**Por que é premissa.** A caderneta não publica limites de entrada. As faixas existem para
barrar erro grosseiro de digitação, não para julgar o caso extremo — e o caso extremo é
justamente o que mais interessa clinicamente.

## Q-P5 · A meia prova da correção de cauda 🟡

**O que o código faz.** Aplica a correção de cauda só a `peso-idade` e `imc-idade`.

**Por que é premissa.** Nas 14 tabelas embarcadas, os outros dois índices trazem `L = 1`, e
com `L = 1` a LMS já é linear: corrigir e não corrigir diferem em 1e-14. A prova de que a
cauda **não** se aplica a eles vive em acervo sintético com `L ≠ 1`; o dado real é silencioso.

**O que muda se a resposta for outra.** Nada nos valores de hoje. A premissa vale como guarda
contra tabela futura em que aqueles índices deixem de ter `L = 1`.

## Q-P6 · A exibição em uma casa decimal 🟡

**O que o código faz.** O motor devolve o escore sem arredondamento, e a tela o exibe com uma
casa decimal.

**Por que é premissa.** A caderneta trabalha com faixas, não com o valor pontual. Uma casa
decimal foi julgada suficiente para conferência contra o gráfico impresso, e a decisão é da
camada de interface — o número exato permanece disponível no domínio.

## Q-P7 · As duas fronteiras dos cinco anos 🟢, com a consequência 🟡

**O que o código faz.** Fronteira de tabela aos 1.856 dias, de rótulo aos 1.826.

**Por que está aqui.** Os dois números são da fonte e estão confirmados; o que é premissa é
aceitar a faixa de trinta dias em que se lê a tabela de 0–5 anos com os rótulos de 5–10.
Alinhá-las produziria ora rótulo trocado, ora buraco de cobertura. A escolha foi pelo mal
menor, e ela precisa continuar sendo a leitura clínica correta.

---

**Encaminhamento.** Todas foram mantidas como 🟡 por decisão do usuário nas passagens
anteriores. Q-P1 e Q-P3 são as que mais alteram resultado em tela; Q-P4 é a que mais aparece
em uso comum, por barrar digitação legítima em prematuro extremo de muito baixo peso.
