# `models/contribuicao` — Requisitos

> Unit de domínio gerada pelo Reversa Writer na re-extração nº 4 (2026-07-28), a partir da
> feature `019-contribuicao-voluntaria-pix`.
> **Primeiro unit de domínio não clínico da plataforma** (ADR 0016, `MD-0022`): entra com
> isenção declarada de fonte clínica única, de `ReferenciaClinica` e de catálogo congelado,
> conservando todos os demais invariantes da família `models/`.
> Fonte normativa: **Manual do BR Code** do Banco Central do Brasil, sobre o padrão EMV®QRCPS.

## Visão Geral

A unit monta o payload do BR Code de um PIX estático, para que a página inicial possa exibir
chave e QR sem transação, sem confirmação e sem que a plataforma saiba se alguém contribuiu.
É função pura de parâmetros para cadeia de caracteres, com validação por coleta total. 🟢

O que a torna singular no conjunto: é a primeira matéria que a plataforma trata sem fonte
clínica. A fronteira entre o clínico e o não clínico se marca em duas camadas — no domínio,
pela isenção escrita; na interface, pelo painel que fica fora do catálogo de calculadoras. 🟢

## Responsabilidades

- Validar os parâmetros do beneficiário, coletando todos os ofensores de uma vez. 🟢
- Normalizar os textos para ASCII imprimível, removendo acentos e colapsando espaços. 🟢
- Montar os campos EMV na ordem do padrão, no formato TLV. 🟢
- Calcular a verificação CRC16-CCITT/FALSE sobre a cadeia que já contém o identificador e o
  comprimento do próprio campo de verificação. 🟢
- Recusar, em vez de truncar, o que exceder os limites do padrão. 🟢

Fora de escopo: iniciar cobrança, confirmar pagamento, consultar saldo, gerar QR (isso é da
interface) e persistir qualquer coisa. A plataforma não tem como saber se houve contribuição,
e isso é característica, não limitação. 🟢

## Regras de Negócio

| ID | Regra | Confiança |
|----|-------|-----------|
| RN-01 | O payload segue o formato TLV: identificador de dois dígitos, comprimento de dois dígitos com zero à esquerda, valor. | 🟢 |
| RN-02 | A ordem dos campos é a do padrão: `00` formato, `26` conta do PIX, `52` categoria, `53` moeda, `54` valor (opcional), `58` país, `59` nome, `60` cidade, `62` dados adicionais, `63` verificação. | 🟢 |
| RN-03 | O subtemplate `26` traz o identificador global `br.gov.bcb.pix` em `00` e a chave em `01`. | 🟢 |
| RN-04 | CRC16-CCITT/FALSE: polinômio `0x1021`, valor inicial `0xFFFF`, sem reflexão de entrada ou saída, sem xor final, resultado em quatro dígitos hexadecimais maiúsculos. | 🟢 |
| RN-05 | A verificação se calcula sobre a cadeia que **já contém** `6304`: só os quatro dígitos do valor ficam de fora. Calcular sem esse sufixo produz código que nenhum aplicativo aceita. | 🟢 |
| RN-06 | Recusa em vez de truncamento. Nome acima de 25 caracteres ou cidade acima de 15 fazem o painel exibir erro, e não um beneficiário errado na câmera de quem contribui. | 🟢 |
| RN-07 | Os limites se medem sobre o texto **já normalizado**, porque é o normalizado que vai no payload. | 🟢 |
| RN-08 | A normalização decompõe, remove diacríticos, descarta tudo fora de ASCII imprimível, colapsa espaços e apara as pontas. | 🟢 |
| RN-09 | Sem identificação informada, o campo `05` do subtemplate `62` recebe `***`, como manda o padrão para transação sem identificador. | 🟢 |
| RN-10 | Valor sugerido é opcional. Presente, entra com duas casas decimais; ausente, o campo `54` não existe e quem contribui escolhe quanto dar. | 🟢 |
| RN-11 | Validação por coleta total: todos os ofensores de uma vez, cada um com campo, código e mensagem acionável. São sete códigos. | 🟢 |
| RN-12 | O ofensor de limite excedido carrega `limite` e `observado`, para que a mensagem possa dizer o quanto sobrou. | 🟢 |
| RN-13 | Erro esperado é valor de retorno (`ParametroInvalido`), nunca exceção (ADR 0004). | 🟢 |
| RN-14 | A unit é isenta de fonte clínica única, de `ReferenciaClinica` e de catálogo congelado, e a isenção é escrita, não silenciosa (`MD-0022`). | 🟢 |
| RN-15 | Os dados do beneficiário não moram no domínio: chegam por parâmetro, e a interface os declara em arquivo próprio. | 🟢 |

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|--------------------|
| RF-01 | Expor `montarBrCode(parametros) → SaidaBrCode`, união discriminada de `ok` e `ParametroInvalido`. | Must | `tests/unit/dominio-contribuicao/`. |
| RF-02 | Produzir payload aceito por decodificador independente. | Must | Verificação em duas pontas: contra decodificador de terceiro e contra aplicativo bancário real. |
| RF-03 | Calcular o CRC16 na variante correta, distinguindo-a das demais que compartilham o polinômio. | Must | Vetor conhecido: `"123456789"` → `29B1`. |
| RF-04 | Validar chave, nome, cidade, identificação e valor, com coleta total. | Must | Teste com três parâmetros inválidos devolve três ofensores. |
| RF-05 | Normalizar acentos e caracteres não imprimíveis antes de medir e de emitir. | Must | "São Paulo" vira "Sao Paulo"; a medição usa o resultado. |
| RF-06 | Omitir o campo de valor quando não houver valor sugerido. | Must | Payload sem `54`. |
| RF-07 | Emitir `***` como identificação quando ela não for informada. | Must | Subtemplate `62` com `05` igual a `***`. |
| RF-08 | Recusar valor sugerido não finito ou não positivo. | Should | Ofensor `VALOR_INVALIDO`. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Nenhum dado de quem contribui é coletado, transmitido ou armazenado; a plataforma não sabe se houve contribuição. | Toda a unit é função pura; não há chamada de rede. | 🟢 |
| Determinismo | Mesma entrada, mesmo payload, sempre. Nenhum relógio, nenhuma aleatoriedade, nenhum identificador gerado. | `br-code.ts:montarBrCode` | 🟢 |
| Corretude verificável | O CRC tem vetor de teste conhecido, o que permite distinguir a variante correta das próximas. | `crc16.ts`; teste de vetor | 🟢 |
| Robustez | Testada também por propriedade, com `fast-check`. | `tests/unit/dominio-contribuicao/` | 🟢 |
| Manutenibilidade | 336 LOC em cinco arquivos; o CRC vive isolado por ser a parte mais fácil de errar e a mais fácil de provar sozinha. | `models/contribuicao/*` | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: payload completo
  Dado chave, nome do beneficiário e cidade válidos
  Quando o BR Code é montado
  Então a saída tem tipo "ok"
  E o payload começa por "000201" e termina em quatro dígitos hexadecimais
  E os quatro dígitos finais conferem com o CRC16 da cadeia que os precede, "6304" incluído

Cenário: sem valor sugerido
  Dado parâmetros sem valorSugerido
  Quando o BR Code é montado
  Então o payload não traz o campo 54
  E quem lê o código escolhe o valor no próprio aplicativo

Cenário: nome acima do limite
  Dado um nome de beneficiário com 30 caracteres após a normalização
  Quando o BR Code é montado
  Então a saída tem tipo "ParametroInvalido"
  E o ofensor NOME_ACIMA_DO_LIMITE traz limite 25 e observado 30
  E nenhum payload truncado é produzido

Cenário: acentuação
  Dado a cidade "Goiânia"
  Quando o BR Code é montado
  Então o payload traz "Goiania", sem diacrítico
  E o comprimento declarado no TLV é o do texto já normalizado

Cenário: coleta total
  Dado chave vazia, cidade vazia e valor sugerido negativo
  Quando o BR Code é montado
  Então os três ofensores voltam de uma vez

Cenário: vetor conhecido do CRC
  Dado a cadeia "123456789"
  Quando o CRC16 é calculado
  Então o resultado é "29B1"
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Montagem dos campos na ordem do padrão | Must | Sem ela não há código legível por aplicativo algum. |
| CRC16 na variante correta | Must | Meia dúzia de variantes compartilham o polinômio e todas produzem quatro dígitos plausíveis. |
| Verificação calculada sobre a cadeia com `6304` | Must | O erro mais fácil de cometer e o mais difícil de perceber por inspeção. |
| Recusa em vez de truncamento | Must | Truncar produziria código válido com beneficiário errado. |
| Normalização para ASCII | Must | O padrão não admite diacrítico nos campos de texto. |
| Valor sugerido | Should | Opcional por decisão: contribuição voluntária não arbitra quantia. |
| Identificação da contribuição | Could | Hoje sempre `***`; o campo existe para uso futuro. |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `models/contribuicao/br-code.ts` | `montarBrCode` | 🟢 |
| `models/contribuicao/campo.ts` | `campo`, `subtemplate` | 🟢 |
| `models/contribuicao/crc16.ts` | `crc16` | 🟢 |
| `models/contribuicao/validacao.ts` | `validarParametros`, `normalizarTexto` | 🟢 |
| `models/contribuicao/tipos.ts` | `ParametrosPix`, `LIMITES`, `OfensorPix`, `SaidaBrCode` | 🟢 |

**Cobertura de testes:** `tests/unit/dominio-contribuicao/`, com teste de vetor conhecido e
teste por propriedade (`fast-check`).
