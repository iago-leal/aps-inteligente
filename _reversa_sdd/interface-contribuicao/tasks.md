# `interface/contribuicao` — Tarefas de Implementação

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `019-contribuicao-voluntaria-pix`.

## Pré-requisitos

- [ ] `models/contribuicao` implementada, com `montarBrCode`.
- [ ] Adaptador de área de transferência disponível para reúso.
- [ ] `react-qr-code@2.2.0` instalada, com versão pinada e lock commitado.
- [ ] Chave PIX real do mantenedor, e uma conta para a conferência humana.

## Tarefas

- [ ] T-01, Declarar o ponto único de configuração do beneficiário, com o exemplo ao lado.
  - Origem no legado: `interface/contribuicao/beneficiario.ts`
  - Critério de pronto: `EXEMPLO` e `BENEFICIARIO` congelados; nenhum outro arquivo declara
    chave, nome ou cidade.
  - Confiança: 🟢

- [ ] T-02, Implementar a guarda que reprova a suíte enquanto o beneficiário for o exemplo.
  - Origem no legado: teste da unit
  - Critério de pronto: trocar o beneficiário real pelo exemplo faz a suíte falhar.
  - Confiança: 🟢

- [ ] T-03, Implementar o envoltório do QR, único ponto que conhece a biblioteca.
  - Origem no legado: `codigo-qr.tsx`
  - Critério de pronto: `react-qr-code` não aparece em nenhum outro arquivo; o QR tem papel de
    imagem e rótulo descritivo.
  - Confiança: 🟢

- [ ] T-04, Implementar o comando de cópia parametrizado, com confirmação própria.
  - Origem no legado: `acao-copiar.tsx`
  - Critério de pronto: o mesmo componente serve o payload e a chave, sem duplicação.
  - Confiança: 🟢

- [ ] T-05, Implementar o painel, com as três declarações antes de qualquer código e a ordem
      copia e cola → chave → QR.
  - Origem no legado: `painel.tsx`
  - Critério de pronto: a ordem no DOM é verificável por teste; `ParametroInvalido` exibe erro
    e nenhum QR.
  - Confiança: 🟢

- [ ] T-06, Implementar o gatilho na página inicial, fora do `map` do catálogo.
  - Origem no legado: `bloco-de-apoio.tsx`; `interface/inicio`
  - Critério de pronto: o bloco não é item do catálogo, e nenhuma leitura da home o confunde
    com calculadora.
  - Confiança: 🟢

- [ ] T-07, Prender e devolver o foco.
  - Origem no legado: `painel.tsx:returnFocusRef`
  - Critério de pronto: Esc fecha; o foco volta ao gatilho.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Abertura do painel e presença das três declarações.
- [ ] TT-02, Ordem no DOM: cópias antes do QR.
- [ ] TT-03, Payload inválido exibindo erro sem QR.
- [ ] TT-04, Guarda do exemplo.
- [ ] TT-05, Cópia do payload e da chave, com a função injetada.
- [ ] TT-06, Foco preso e devolvido.

## Verificação fora da suíte

- [ ] V-01, Ler o QR e colar o código num aplicativo bancário real, conferindo nome e cidade
      do beneficiário na tela de confirmação. É a única prova de ponta, e não roda em CI.

## Ordem Sugerida

1. T-01 e T-02 antes de tudo: sem a guarda, o risco de publicar o exemplo permanece aberto.
2. T-03 e T-04, independentes entre si.
3. T-05 compõe; T-06 e T-07 fecham.
4. V-01 antes de publicar, sempre que a chave mudar.

## Lacunas Pendentes (🔴)

Nenhuma. As três premissas 🟡 — contrato sem canal de erro, peso da dependência nova e
disciplina de rotação da chave — estão em `design.md`.
