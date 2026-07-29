# `models/contribuicao` — Design Técnico

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `019-contribuicao-voluntaria-pix`.
> Unit não clínico, com isenção declarada (ADR 0016). Domínio puro, sem I/O.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `montarBrCode` | `(parametros: ParametrosPix)` | `SaidaBrCode` | Fachada da unit. Pura. |
| `campo` | `(id: string, valor: string)` | `string` | Primitiva TLV: `id` + comprimento em dois dígitos + valor. |
| `subtemplate` | `(id: string, internos: readonly string[])` | `string` | Concatena os filhos e os embrulha num `campo`. |
| `crc16` | `(cadeia: string)` | `string` | Quatro dígitos hexadecimais maiúsculos. |
| `validarParametros` | `(parametros: ParametrosPix)` | `readonly OfensorPix[]` | Coleta total; lista vazia significa válido. |
| `normalizarTexto` | `(valor: string)` | `string` | NFD, remove diacríticos, filtra para ASCII imprimível, colapsa espaços, apara. |

### Entrada

`ParametrosPix` tem chave, nome do beneficiário e cidade obrigatórios, mais valor sugerido e
identificação opcionais. Os valores concretos **não moram no domínio**: chegam por parâmetro, e
quem os declara é `interface/contribuicao/beneficiario.ts`.

### Saída

`SaidaBrCode` é união discriminada: `ok` com o `payload`, ou `ParametroInvalido` com a lista
de ofensores. O ofensor de limite excedido carrega `limite` e `observado`, para que a mensagem
possa dizer o quanto sobrou.

## Fluxo Principal

1. **Validar.** Havendo ofensor, retorna `ParametroInvalido` e nada é montado.
2. **Normalizar** chave, nome, cidade e identificação.
3. **Montar os campos** na ordem do padrão, concatenados sem separador.
4. **Anexar `6304`** à cadeia montada — o identificador do campo de verificação e o seu
   comprimento.
5. **Calcular o CRC16** sobre essa cadeia inteira e concatenar os quatro dígitos.

```
montarBrCode → validar → normalizar → campos EMV → + "6304" → + crc16(tudo) → payload
```

### Os campos emitidos

| ID | Conteúdo | Origem |
|----|----------|--------|
| `00` | `01` — versão do formato | constante |
| `26` | subtemplate: `00` = `br.gov.bcb.pix`, `01` = chave | parâmetro |
| `52` | `0000` — categoria do estabelecimento | constante |
| `53` | `986` — moeda, real brasileiro | constante |
| `54` | valor com duas casas decimais | opcional |
| `58` | `BR` — país | constante |
| `59` | nome do beneficiário, até 25 | parâmetro |
| `60` | cidade, até 15 | parâmetro |
| `62` | subtemplate: `05` = identificação, ou `***` | opcional |
| `63` | verificação CRC16, quatro dígitos | calculado |

### O algoritmo da verificação

Registro de 16 bits inicializado em `0xFFFF`. Para cada octeto da codificação UTF-8 da cadeia,
o octeto entra por xor no byte alto; em seguida, oito deslocamentos à esquerda, aplicando xor
com `0x1021` sempre que o bit mais significativo estava ligado antes do deslocamento. Sem
reflexão de entrada ou de saída, sem xor final. 🟢

O arquivo é próprio porque esta é a parte mais fácil de errar e a mais fácil de provar em
isolamento: meia dúzia de variantes compartilham o polinômio, e todas produzem quatro dígitos
plausíveis. O vetor `"123456789"` → `29B1` é o que distingue esta das outras. 🟢

## Fluxos Alternativos

- **Sem valor sugerido.** O campo `54` simplesmente não é emitido, e quem lê o código escolhe
  a quantia no aplicativo. É o comportamento desejado numa contribuição voluntária.
- **Sem identificação.** O campo `05` recebe `***`, como o padrão determina para transação sem
  identificador.
- **Texto acima do limite.** Recusa. Nenhum payload é produzido, e o painel mostra o erro em
  vez do QR.
- **Texto que a normalização esvazia.** Cadeia só com acentos e caracteres de controle vira
  vazia e cai no ofensor de ausência, e não no de limite.

## Dependências

- Nenhuma, de runtime. `TextEncoder` é do próprio ambiente.
- A geração do QR a partir do payload é da interface, e usa `react-qr-code@2.2.0` atrás de
  envoltório próprio (`MD-0024`). O domínio não conhece essa biblioteca.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Unit não clínico com isenção escrita, e não silenciosa. | ADR 0016; `MD-0022` | 🟢 |
| O CRC vive em arquivo próprio, por ser o ponto mais fácil de errar. | `crc16.ts` | 🟢 |
| As primitivas TLV são duas funções de uma linha, sem construtor de payload. | `campo.ts` | 🟢 |
| A validação mede sobre o texto normalizado, porque é ele que vai no payload. | `validacao.ts:verificarTexto` | 🟢 |
| Recusa em vez de truncamento, com o motivo dito na mensagem ao desenvolvedor. | `validacao.ts` | 🟢 |
| Os dados do beneficiário ficam na interface, não no domínio. | `interface/contribuicao/beneficiario.ts` | 🟢 |
| O ofensor carrega `limite` e `observado`, e não só a mensagem. | `tipos.ts:OfensorPix` | 🟢 |

## Estado Interno

Nenhum. A unit é um conjunto de funções puras, sem instância e sem cache. 🟢

## Observabilidade

Nenhuma, e aqui a ausência tem consequência prática: como não há canal de retorno, um payload
malformado falha silenciosamente na mão de quem contribui. É a razão de a verificação ocorrer
em duas pontas antes de publicar — decodificador independente e conferência humana com o
aplicativo real. 🟢

## Riscos e Lacunas

- 🟡 **Contrato externo sem canal de erro.** O BR Code é lido por software de terceiros sob
  especificação do Banco Central; se a forma quebrar, quem descobre é quem tenta contribuir.
  Ver `contracts.md`.
- 🟡 **A conferência com aplicativo real é manual** e não roda em CI. O que roda é o vetor
  conhecido do CRC e a decodificação do payload.
- 🟡 **`MD-0027` continua em aberto** quanto à isenção nominal no verificador de citação: a
  decisão foi tomada na execução da feature 020 e permanece revisável enquanto a lista tiver
  uma entrada só.
- 🟢 A unit não trata dado pessoal de quem contribui, porque não recebe nenhum.
