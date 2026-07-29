# `models/contribuicao` — Tarefas de Implementação

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `019-contribuicao-voluntaria-pix`.

## Pré-requisitos

- [ ] Manual do BR Code do Banco Central, para conferir a ordem e os identificadores dos campos.
- [ ] Um decodificador de BR Code independente, para a verificação de ponta.
- [ ] Aplicativo bancário real e uma chave PIX de teste, para a conferência humana.
- [ ] `fast-check` disponível como dependência de desenvolvimento.

## Tarefas

- [ ] T-01, Declarar os contratos: `ParametrosPix`, `LIMITES`, os sete códigos de ofensor,
      `OfensorPix` com `limite` e `observado` opcionais, e `SaidaBrCode`.
  - Origem no legado: `models/contribuicao/tipos.ts`
  - Critério de pronto: nenhum valor de beneficiário chumbado no domínio.
  - Confiança: 🟢

- [ ] T-02, Implementar as duas primitivas TLV.
  - Origem no legado: `models/contribuicao/campo.ts`
  - Critério de pronto: comprimento sempre com dois dígitos e zero à esquerda; `subtemplate`
    concatena os filhos antes de medir.
  - Confiança: 🟢

- [ ] T-03, Implementar o CRC16-CCITT/FALSE em arquivo próprio.
  - Origem no legado: `models/contribuicao/crc16.ts`
  - Critério de pronto: `"123456789"` produz `29B1`; sem reflexão, sem xor final; saída em
    maiúsculas com quatro dígitos.
  - Confiança: 🟢

- [ ] T-04, Implementar a normalização de texto para ASCII imprimível.
  - Origem no legado: `models/contribuicao/validacao.ts:normalizarTexto`
  - Critério de pronto: "Goiânia" vira "Goiania"; espaços múltiplos colapsam; pontas aparadas.
  - Confiança: 🟢

- [ ] T-05, Implementar a validação por coleta total, medindo os limites sobre o texto já
      normalizado e recusando em vez de truncar.
  - Origem no legado: `models/contribuicao/validacao.ts:validarParametros`
  - Critério de pronto: três parâmetros inválidos devolvem três ofensores; o ofensor de limite
    traz `limite` e `observado`.
  - Confiança: 🟢

- [ ] T-06, Montar os campos EMV na ordem do padrão, com valor e identificação opcionais.
  - Origem no legado: `models/contribuicao/br-code.ts`
  - Critério de pronto: sem valor sugerido, o campo `54` não existe; sem identificação, o `05`
    é `***`.
  - Confiança: 🟢

- [ ] T-07, Anexar `6304` antes de calcular a verificação, e concatenar o resultado.
  - Origem no legado: `models/contribuicao/br-code.ts`
  - Critério de pronto: o payload termina em `6304` seguido dos quatro dígitos; recalcular o
    CRC sobre o payload sem os quatro últimos dígitos reproduz exatamente esses dígitos.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Vetor conhecido do CRC (`"123456789"` → `29B1`), que distingue esta variante das
      demais que compartilham o polinômio.
- [ ] TT-02, Payload completo decodificado por decodificador independente.
- [ ] TT-03, Os sete códigos de ofensor, e a coleta total com mais de um simultâneo.
- [ ] TT-04, Normalização: acento, caractere de controle, espaço múltiplo, texto que esvazia.
- [ ] TT-05, Opcionalidade: sem valor, sem identificação, com ambos.
- [ ] TT-06, Propriedade (`fast-check`): para qualquer parâmetro válido, o payload é
      autoconsistente — o CRC dos últimos quatro dígitos confere com o cálculo sobre o resto.
- [ ] TT-07, Recusa por limite: nome de 26 e cidade de 16 caracteres normalizados.

## Tarefas de Migração de Dados

Não se aplica.

## Verificação fora da suíte

- [ ] V-01, Conferência humana com aplicativo bancário real, lendo o QR gerado a partir do
      payload. É a única prova de que o contrato emitido funciona na ponta, e não roda em CI.

## Ordem Sugerida

1. T-01 e T-02, que são a base.
2. T-03 isolado, com TT-01 antes de qualquer montagem: um CRC errado passaria despercebido
   sob um payload aparentemente bem formado.
3. T-04 antes de T-05, porque a medição depende da normalização.
4. T-06 e T-07 fecham a fachada; V-01 é o último gesto antes de publicar.

## Lacunas Pendentes (🔴)

Nenhuma. As duas premissas em aberto — a ausência de canal de erro no contrato emitido e a
conferência humana fora do CI — estão registradas em `design.md` e `contracts.md`, e nenhuma
delas impede a reimplementação.
