# `models/contribuicao` — Contrato emitido

> Reversa Writer, re-extração nº 4 (2026-07-28).
> **Primeiro dos dois contratos que a plataforma emite**, e o primeiro contrato externo de
> qualquer espécie que ela produz sem canal de erro. O outro é o registro SOAP de
> `models/puericultura/consulta`.
> Norma de origem: **Manual do BR Code** (Banco Central do Brasil), sobre o padrão EMV®QRCPS.

## Por que este contrato existe

Tudo o que a plataforma consumia até aqui era contrato de entrada: tabelas, equações, rótulos.
Este é de saída, e a assimetria muda o modo de verificar. O payload é lido por software de
terceiros — aplicativos bancários — sob especificação de um regulador. Se ele estiver
malformado, a falha ocorre na câmera de quem tenta contribuir, e nós **não ficamos sabendo**.
Não há resposta, não há código de erro, não há registro. 🟢

Daí a verificação em duas pontas antes de publicar: uma contra decodificador independente,
outra humana, com o consumidor real na mão.

## Forma do payload

Concatenação de campos TLV, sem separador:

```
000201                                  formato
26<len>0014br.gov.bcb.pix01<len><chave> conta do PIX
52040000                                categoria do estabelecimento
5303986                                 moeda: real
54<len><valor>                          valor sugerido (opcional)
5802BR                                  país
59<len><nome>                           beneficiário, até 25
60<len><cidade>                         cidade, até 15
62<len>05<len><identificação ou ***>     dados adicionais
6304<CRC>                               verificação
```

### Regras da forma

| # | Regra | Confiança |
|---|-------|-----------|
| 1 | Cada campo é identificador de dois dígitos, comprimento de dois dígitos com zero à esquerda, e valor. | 🟢 |
| 2 | A ordem dos campos é a do padrão, e o campo de verificação é sempre o último. | 🟢 |
| 3 | O comprimento declarado é o do valor **já normalizado**, em caracteres. | 🟢 |
| 4 | Os textos são ASCII imprimível: sem diacrítico, sem caractere de controle, espaços colapsados. | 🟢 |
| 5 | O CRC16 se calcula sobre a cadeia inteira **incluindo `6304`**, e só os quatro dígitos do valor ficam de fora. | 🟢 |
| 6 | O resultado do CRC vai em quatro dígitos hexadecimais maiúsculos, com zero à esquerda quando preciso. | 🟢 |
| 7 | Sem identificação, o campo `05` do subtemplate `62` recebe `***`. | 🟢 |
| 8 | Sem valor sugerido, o campo `54` não é emitido — e não é emitido vazio. | 🟢 |

## Como se verifica

| Verificação | Onde | Roda em CI |
|-------------|------|------------|
| Vetor conhecido do CRC (`"123456789"` → `29B1`) | `tests/unit/dominio-contribuicao/` | sim |
| Autoconsistência do payload, por propriedade | mesma pasta, com `fast-check` | sim |
| Decodificação por decodificador independente | conferência de ponta | não |
| Leitura por aplicativo bancário real | conferência humana | não |

A tabela é o ponto: **as duas verificações que provam o contrato na ponta não rodam em CI**, e
não há como automatizá-las sem uma conta de teste e um leitor real. É dívida assumida, e a
razão de o payload ter também prova por propriedade dentro da suíte.

## Riscos

- 🟡 **Sem canal de erro.** A falha aparece para quem contribui, não para nós.
- 🟡 **Mudança na norma do BR Code** não dispara alarme algum: o payload continuaria a ser
  gerado e a suíte continuaria verde. A revisão depende de acompanhamento humano da norma.
- 🟡 **Truncamento seria pior que recusa**, e por isso a unit recusa. Nome cortado geraria
  código válido apontando para beneficiário errado — falha silenciosa com consequência
  financeira.
- 🟢 O payload não carrega dado de quem contribui, apenas do beneficiário, que é público por
  natureza no PIX estático.
