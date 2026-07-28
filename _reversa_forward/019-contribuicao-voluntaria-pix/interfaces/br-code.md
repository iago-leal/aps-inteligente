# Contrato externo — BR Code (PIX estático)

> Identificador: `019-contribuicao-voluntaria-pix` · Data: 2026-07-28
> Tipo: cadeia de texto emitida por nós e interpretada por software de terceiros
> Acompanha: `roadmap.md` §7

## 1. Por que isto é um contrato externo

Nada aqui trafega por HTTP, e mesmo assim é contrato. A cadeia que emitimos é lida por
aplicativos de banco que não escrevemos, sob especificação que não controlamos, e o consumidor
não pode negociar nem pedir esclarecimento: ou entende, ou recusa. É o único artefato desta
plataforma com essa propriedade. `/api/v1/status`, por comparação, é contrato nosso com nós
mesmos.

A consequência prática governa o plano de testes: erro aqui não aparece na nossa suíte, aparece
na câmera de quem tentou contribuir.

## 2. Formato

Sequência de triplas, sem delimitador, cada uma na forma:

```
<ID: 2 dígitos><COMPRIMENTO: 2 dígitos><VALOR: N caracteres>
```

O comprimento é decimal, com zero à esquerda quando menor que dez, e conta caracteres do valor.
Subtemplates repetem a mesma estrutura dentro do próprio valor.

### 2.1 Campos emitidos

| Ordem | ID | Nome | Valor | Origem |
|-------|----|------|-------|--------|
| 1 | `00` | Payload Format Indicator | `01` | fixo |
| 2 | `26` | Merchant Account Information | subtemplate: `00` = `br.gov.bcb.pix`, `01` = chave | `BENEFICIARIO.chave` |
| 3 | `52` | Merchant Category Code | `0000` | fixo, "não especificado" |
| 4 | `53` | Transaction Currency | `986` | fixo, ISO 4217 |
| 5 | `54` | Transaction Amount | valor com duas casas e ponto decimal | **omitido** por padrão |
| 6 | `58` | Country Code | `BR` | fixo |
| 7 | `59` | Merchant Name | até 25 caracteres | `BENEFICIARIO.nome` |
| 8 | `60` | Merchant City | até 15 caracteres | `BENEFICIARIO.cidade` |
| 9 | `62` | Additional Data Field Template | subtemplate: `05` = txid, `***` quando ausente | `BENEFICIARIO.identificacao` |
| 10 | `63` | CRC16 | quatro dígitos hexadecimais maiúsculos | calculado |

A ordem acima é a de emissão e é estável. O campo `63` é sempre o último, por exigência do
padrão.

### 2.2 Exemplo de forma, com valores fictícios

```
00020126580014br.gov.bcb.pix0136<chave-aleatoria-de-36-caracteres>5204000053039865802BR5913<nome>6008<cidade>62070503***6304<CRC>
```

O exemplo serve para reconhecer a forma, não para copiar: os comprimentos dependem dos valores
reais e são calculados, jamais escritos à mão.

## 3. Verificação (CRC16)

| Parâmetro | Valor |
|-----------|-------|
| Variante | CCITT/FALSE |
| Polinômio | `0x1021` |
| Valor inicial | `0xFFFF` |
| Reflexão de entrada | não |
| Reflexão de saída | não |
| `xor` final | nenhum |
| Saída | quatro dígitos hexadecimais **maiúsculos** |

**A entrada do cálculo inclui `6304`.** O identificador e o comprimento do próprio campo de
verificação entram; apenas os quatro dígitos do valor ficam de fora. Calcular sobre a cadeia sem
esse sufixo produz um código que nenhum aplicativo aceita.

Vetor de teste que fixa a variante: a entrada `123456789` produz `29B1`. Está na suíte como
teste próprio, porque distingue esta variante de meia dúzia de outras com o mesmo polinômio.

## 4. Erros

O contrato não tem canal de erro: o consumidor recusa em silêncio ou exibe mensagem própria. Por
isso toda a detecção acontece **antes** da emissão, na validação do módulo, e devolve erro como
valor ao chamador nosso.

| Condição | Resposta do módulo |
|----------|--------------------|
| Chave vazia | `ParametroInvalido`, ofensor `chave`, motivo `ausente` |
| Nome vazio ou acima de 25 caracteres | `ParametroInvalido`, ofensor `nomeBeneficiario`, com limite e comprimento observado |
| Cidade vazia ou acima de 15 caracteres | `ParametroInvalido`, ofensor `cidade`, idem |
| Identificação acima de 25 caracteres | `ParametroInvalido`, ofensor `identificacao`, idem |
| Valor sugerido menor ou igual a zero, ou não finito | `ParametroInvalido`, ofensor `valorSugerido` |

Todos os ofensores presentes voltam juntos, jamais o primeiro apenas. Truncamento silencioso é
proibido: um nome cortado no meio geraria código válido apresentando beneficiário errado, que é
o pior desfecho possível.

## 5. Idempotência, tempo e estado

**Idempotente por construção.** Mesmos parâmetros, mesma cadeia, byte a byte, sempre. Não há
relógio, aleatoriedade nem contador na montagem, e isso é propriedade verificada em teste.

**Sem tempo limite e sem retentativa.** Nada aqui é operação de rede. A montagem é síncrona, e a
única falha possível no navegador é a recusa da área de transferência pelo sistema, tratada na
camada de apresentação.

**Sem estado e sem sessão.** O PIX estático não gera retorno ao emissor: não há webhook, não há
confirmação, não há como o site saber se alguém contribuiu. Isso é propriedade do arranjo
escolhido, e não limitação a contornar. A interface não afirma nem sugere confirmação (RN-02).

## 6. Versionamento

O contrato é do Banco Central, e não nosso: não temos como versioná-lo. O que fica registrado é
a data desta leitura da especificação, 2026-07-28, e o compromisso de que mudança no padrão se
detecta pela via externa, quando um decodificador independente ou um aplicativo de banco
recusar um código que antes aceitava. É mais uma razão para o oráculo externo do critério de
pronto ser refeito a cada alteração no módulo, e não apenas na primeira entrega.
