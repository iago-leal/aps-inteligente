# Oráculo externo do BR Code

> Identificador: `019-contribuicao-voluntaria-pix` · Data: 2026-07-28
> Ações: `T027` (decodificador independente) e `T033` (aplicativo de banco), ambas concluídas
> Motivo: `interfaces/br-code.md` §1 e §6; critério de pronto de `roadmap.md` §10

## 1. Por que este arquivo existe

A suíte prova que o payload obedece à **nossa leitura** da especificação. Não prova que a
leitura estava certa. Um BR Code sintaticamente válido e semanticamente errado passa em todo
teste que escrevemos a partir dela, e o erro aparece na câmera de quem tenta contribuir, não no
nosso terminal. Daí a exigência de duas verificações fora do nosso código, no espírito da
`MD-0010`.

## 2. Verificação 1: decodificador independente (T027, feita)

**Ferramenta:** `pix-utils@2.8.2`, biblioteca de terceiro que interpreta BR Code e valida o
CRC16 por conta própria. Instalada **fora do repositório**, em diretório temporário, de modo que
nenhuma dependência nova entrou no `package.json` por causa desta conferência.

**Payload conferido**, agora com os **valores reais** de
`interface/contribuicao/beneficiario.ts`, recebidos em 28/07/2026:

```
00020126580014br.gov.bcb.pix01363bd85538-97ca-416d-8529-e3854b3394ff5204000053039865802BR5909Iago Leal6007Goiania62070503***6304DBD8
```

A conferência foi feita duas vezes: primeiro com os valores de exemplo, que devolveram
verificação `A816`, e depois com os reais, que devolvem `DBD8`. A mudança da verificação com a
mudança do conteúdo é ela própria um sinal de que o cálculo não está congelado por engano.

**Leitura devolvida pelo terceiro**, campo a campo:

| Campo lido | Valor | Confere com a configuração |
|------------|-------|-----------------------------|
| `type` | `STATIC` | sim, é o arranjo escolhido |
| `pixKey` | `3bd85538-97ca-416d-8529-e3854b3394ff` | sim, a chave aleatória do mantenedor |
| `merchantName` | `Iago Leal` | sim |
| `merchantCity` | `Goiania` | sim, a forma sem diacrítico de "Goiânia", como o padrão exige |
| `merchantCategoryCode` | `0000` | sim |
| `transactionCurrency` | `986` | sim |
| `countryCode` | `BR` | sim |
| `transactionAmount` | `0` | sim, o campo `54` foi omitido de propósito |
| `txid` | `***` | sim, sem identificação de transação |

**O CRC foi verificado pelo terceiro, e a verificação é severa.** Duas conferências negativas
confirmam que a aceitação não é complacência da biblioteca:

- payload com os quatro dígitos finais trocados por `FFFF`: **recusado**;
- payload com uma letra alterada no nome, sem recalcular a verificação: **recusado**.

Ou seja, o `DBD8` que emitimos é o único valor que aquele conteúdo admite, calculado sobre a
cadeia que já contém `6304`, que é a armadilha registrada em `interfaces/br-code.md` §3.

**Limite honesto desta verificação.** A independência é de implementação, não de leitura da
especificação: quem conferiu foi outro código, escrito por outra pessoa, com outra
implementação do CRC e do parser. É bem mais do que a nossa suíte oferece, e ainda assim não
substitui a verificação 2, que é a única em que o consumidor real do contrato se manifesta.

## 3. Verificação 2: aplicativo de banco real (T033, feita)

**Desbloqueada em 28/07/2026**, quando os três valores reais chegaram, e **concluída no mesmo
dia**. Deixou de depender de dado e passou a depender apenas de alguém apontar uma câmera, que é
a única parte desta feature que não se automatiza: é o consumidor real do contrato se
manifestando.

Procedimento:

1. Abrir o painel em um computador, com `beneficiario.ts` já contendo os valores reais.
2. Apontar a câmera de um telefone com o aplicativo do banco.
3. Conferir que a tela de confirmação exibe **o nome do beneficiário correto**.
4. **Não concluir a transferência.** Ver o beneficiário certo já prova o que precisa ser provado.
5. Registrar aqui a data, o aplicativo usado e o que a tela exibiu.

O que a tela do aplicativo deve exibir: **Iago Leal**. Se exibir outra coisa, ou se recusar o
código, o defeito está no módulo puro, e o ponto de partida é `models/contribuicao/crc16.ts` e
o comprimento declarado dos campos.

| Data | Via | Aplicativo | Resultado |
|------|-----|------------|-----------|
| 2026-07-28 | leitura do QR pela câmera | não registrado pelo mantenedor | aceito, sem concluir a transferência |
| 2026-07-28 | código copia e cola, colado no aplicativo | não registrado pelo mantenedor | aceito, sem concluir a transferência |

**O que este registro afirma, e o que não afirma.** Afirma o que o mantenedor relatou: as duas
vias funcionaram. Não afirma o nome exibido na tela de confirmação nem o aplicativo usado, porque
nenhum dos dois foi informado, e transcrever aqui um valor que ninguém ditou transformaria o
oráculo externo em eco da nossa própria expectativa, que é exatamente o que a seção 1 recusa. O
essencial, ainda assim, ficou provado: o aplicativo aceitou o payload, e um CRC errado ou um
comprimento declarado a mais teria feito a leitura falhar antes de qualquer tela.

**As duas vias verificam coisas diferentes**, e é por isso que valem as duas linhas: o QR prova o
desenho da matriz sobre a cadeia, e o copia e cola prova a cadeia sozinha, sem o intermediário
gráfico. Coincidirem afasta a hipótese de defeito no envoltório de `react-qr-code`.

## 4. Quando refazer

A cada alteração no módulo `models/contribuicao`, e não apenas na primeira entrega. O contrato é
do Banco Central e não temos como versioná-lo: mudança no padrão se detecta pela via externa,
quando um decodificador ou um aplicativo recusar um código que antes aceitava.
