# Investigação técnica — Contribuição voluntária via PIX

> Identificador: `019-contribuicao-voluntaria-pix` · Data: 2026-07-28
> Acompanha: `roadmap.md`

## 1. O padrão do BR Code, e o que dele importa aqui

O BR Code é a aplicação brasileira do padrão EMV **QRCPS-MPM** (*QR Code Payment
Specification, Merchant Presented Mode*), especificada pelo Banco Central no *Manual de Padrões
para Iniciação do PIX*. A cadeia é uma sequência de triplas **identificador, comprimento,
valor**, cada uma com identificador de dois dígitos, comprimento de dois dígitos e o valor em
seguida. Não há delimitador entre campos: o comprimento é o que diz onde o próximo começa, e é
por isso que um comprimento errado corrompe tudo o que vem depois dele em vez de falhar no
lugar do erro.

Campos que a feature emite, na ordem em que aparecem:

| ID | Nome | Conteúdo aqui | Obrigatório |
|----|------|---------------|-------------|
| `00` | Payload Format Indicator | `01` | sim |
| `26` | Merchant Account Information | subtemplate com `00` = `br.gov.bcb.pix` e `01` = a chave | sim |
| `52` | Merchant Category Code | `0000`, que é o valor para "não especificado" | sim |
| `53` | Transaction Currency | `986`, real brasileiro, pela ISO 4217 | sim |
| `54` | Transaction Amount | ausente por padrão; presente só com valor sugerido | não |
| `58` | Country Code | `BR` | sim |
| `59` | Merchant Name | nome do beneficiário, até 25 caracteres | sim |
| `60` | Merchant City | cidade do beneficiário, até 15 caracteres | sim |
| `62` | Additional Data Field Template | subtemplate com `05` = txid; `***` no estático sem identificação | sim na prática |
| `63` | CRC16 | quatro dígitos hexadecimais maiúsculos | sim, sempre por último |

Duas armadilhas conhecidas, e ambas viram teste:

**O CRC se calcula sobre a cadeia que já contém `6304`.** O identificador e o comprimento do
próprio campo de verificação entram no cálculo; só o valor de quatro dígitos fica de fora.
Quem calcula sobre a cadeia sem esse sufixo produz um código que nenhum aplicativo aceita, e o
erro é silencioso do lado de cá.

**O parâmetro do CRC é CCITT/FALSE.** Polinômio `0x1021`, valor inicial `0xFFFF`, sem reflexão
de entrada nem de saída, sem `xor` final. Há pelo menos meia dúzia de variantes de CRC16 com o
mesmo polinômio e resultados diferentes, e a confusão entre elas é o defeito mais comum em
implementação caseira. O vetor de teste que desfaz a dúvida é conhecido: `123456789` produz
`29B1` nesta variante.

## 2. Como o payload será provado

A suíte sozinha não basta, e o motivo é a assimetria do erro: um payload errado passa em todo
teste que nós mesmos escrevemos a partir da mesma leitura da especificação, e falha só na
câmera de quem tenta contribuir. Três camadas de prova, em ordem de independência crescente:

1. **Vetor conhecido do CRC**, que prova a variante do algoritmo em isolamento.
2. **Propriedades sobre payloads gerados** com `fast-check`, ferramenta que a suíte já usa nos
   domínios clínicos: o comprimento declarado de cada campo confere com o comprimento real do
   valor; a cadeia inteira é reanalisável em triplas sem sobra; o CRC recalculado sobre a
   cadeia sem os quatro dígitos finais reproduz esses quatro dígitos; e a montagem é
   determinística.
3. **Oráculo externo**, que é a única camada que não compartilha da nossa leitura da
   especificação: decodificar o payload de exemplo em um decodificador independente e, antes do
   encerramento, ler o QR real com um aplicativo de banco, conferindo que o beneficiário
   apresentado é o esperado. Está no critério de pronto do roadmap, e não como sugestão.

A terceira camada é a que a disciplina deste projeto já pratica em outro domínio: `MD-0010`
fixou que o oráculo do escore z é a fonte primária, e não uma segunda implementação dela. Aqui
vale o mesmo, com a fonte primária sendo o ecossistema que vai ler o código.

## 3. A dependência do QR, e o que a inspeção mostrou

A decisão de usar biblioteca foi tomada na sessão de esclarecimento. A inspeção posterior da
árvore acrescentou dois fatos que o plano registra por honestidade, sem que nenhum deles reverta
a escolha.

**A árvore real tem três pacotes, não um.** `react-qr-code@2.2.0` depende de `prop-types` e de
`qrcode-generator`. O primeiro é resíduo da era anterior aos tipos do TypeScript e não faz nada
de útil sob React 19, além de ocupar espaço. O segundo é quem de fato codifica o QR.

**O motor por baixo está parado, e isso não é o mesmo que abandonado.** `qrcode-generator@2.0.4`
teve a última publicação em agosto de 2025, o que o coloca **fora** do critério de "release há
menos de seis meses" do filtro de longevidade. O envoltório `react-qr-code`, esse sim, foi
publicado em junho de 2026 e está dentro do filtro. A leitura correta do conjunto é que o
critério dos seis meses mede sinal de manutenção viva, e vale menos para código cujo problema
está congelado: a codificação de QR é a norma ISO/IEC 18004, que não muda, e uma biblioteca que
a implementa corretamente não tem por que publicar versão. O que restaria a manter seria
compatibilidade com o ecossistema, e é justamente disso que o envoltório mantido cuida.

**Alternativa avaliada e descartada:** usar `qrcode-generator` diretamente e desenhar o SVG à
mão, iterando a matriz de módulos. Elimina `prop-types`, reduz a árvore a um pacote e deixa o
desenho sob nosso controle, ao custo de assumir a manutenção do desenho e de ancorar a feature
justamente no pacote que está fora do filtro, agora sem envoltório mantido entre nós e ele. O
saldo é negativo para um mantenedor intermitente: troca-se uma dependência a mais por um pedaço
de código a mais, e código nosso custa mais caro que dependência alheia quando ninguém olha
para o repositório por três meses.

Fica anotado para o futuro: se `react-qr-code` parar, o caminho de saída é curto, porque D-05
confina a dependência a um arquivo de envoltório.

## 4. Modal acessível: por que não reimplementar

O `Dialog` de `@primer/react` resolve quatro coisas que costumam ser feitas pela metade em
implementação própria: prender o foco dentro do painel enquanto ele está aberto, devolver o foco
ao elemento que o abriu ao fechar, fechar por `Esc` e marcar o resto da página como inerte para
a árvore de acessibilidade. A plataforma mantém `e2e/axe-baseline.json` em zero violações por
rota desde a feature 002, e essa baseline é o tipo de coisa que se perde por descuido e se
recupera com dificuldade.

O `<dialog>` nativo do HTML entrega parte disso, e hoje com bom suporte, mas o retorno de foco e
a interação com o resto da árvore ainda pedem código próprio. Como o Primer já é dependência do
projeto desde a feature 004 e fornece o componente, reimplementar seria assumir custo sem ganho.

## 5. O que já existe e será reaproveitado

| Peça | Onde vive | Como entra aqui |
|------|-----------|-----------------|
| Adaptador de área de transferência | `interface/calculadora/area-de-transferencia.ts` | Sem alteração de assinatura. Já devolve `{ok: false}` em vez de lançar, que é exatamente o que RF-07 pede |
| Padrão de cópia com confirmação | `interface/calculadora/resultado.tsx:57` (`AcaoCopiarPlano`) | Molde do estado de três valores e das duas variantes de `Flash`, com `role="status"` no sucesso e `role="alert"` na falha |
| Injeção da função de cópia por prop | mesmo arquivo, linha 245 | Permite dublar a área de transferência no teste de integração sem tocar em `navigator` |
| Constante congelada como fonte única | `interface/inicio/catalogo.ts` | Molde de `beneficiario.ts`: `Object.freeze`, tipo explícito, comentário dizendo o que muda ao editar |
| Erro como valor com coleta total | os quatro domínios de `models/` | Molde da validação do módulo puro |
| Declaração de classe textual | `scripts/textos/classes/` | Duas entradas novas, uma por camada tocada |

## 6. Fontes

- Banco Central do Brasil, *Manual de Padrões para Iniciação do PIX*, que especifica o BR Code
  sobre o EMV QRCPS-MPM e fixa os campos obrigatórios do PIX estático.
- EMVCo, *EMV QR Code Specification for Payment Systems: Merchant-Presented Mode*, origem da
  estrutura de triplas e da definição do campo `63`.
- ISO/IEC 18004, norma da simbologia QR, que é o que a biblioteca implementa e a razão de o
  problema estar congelado.
- ISO 4217, de onde vem o `986` do campo `53`.
- Registro do pacote `react-qr-code`: versão 2.2.0, publicada em 2026-06-09, licença MIT,
  dependências `prop-types` e `qrcode-generator`.
- Registro do pacote `qrcode-generator`: versão 2.0.4, publicada em 2025-08-07, licença MIT.
- `MD-0010` deste projeto, pela doutrina de oráculo externo em vez de segunda implementação.
- `MD-0022` deste projeto, pela isenção declarada do módulo não clínico.
