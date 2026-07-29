# `interface/contribuicao` — Design Técnico

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `019-contribuicao-voluntaria-pix`.
> Cinco arquivos, 324 LOC.

## Interface

| Símbolo | Assinatura | Observação |
|---------|-----------|------------|
| `BlocoDeApoio` | `()` | Gatilho na página inicial, fora do `map` do catálogo. |
| `PainelContribuicao` | `({ aoFechar, copiar?, refDeRetorno? })` | `Dialog` do Primer. |
| `AcaoCopiar` | `({ rotulo, texto, confirmacao, copiar? })` | Comando de cópia parametrizado, reusado duas vezes no painel. |
| `CodigoQr` | `({ valor, descricao })` | Envoltório único de `react-qr-code`. |
| `BENEFICIARIO` / `EXEMPLO` | `Beneficiario` | Ponto único de configuração e o seu oráculo. |

## Fluxo Principal

1. A página inicial renderiza o `BlocoDeApoio` **fora** do catálogo de calculadoras.
2. Acionado, o gatilho abre o `PainelContribuicao`.
3. O painel chama `montarBrCode` com os dados do beneficiário.
4. Com `ok`, exibe as declarações, o comando de cópia do payload, a chave em texto com o seu
   próprio comando, e por fim o QR.
5. Com `ParametroInvalido`, exibe erro, e nenhum QR aparece.
6. Ao fechar, o foco volta ao gatilho.

## A ordem do DOM

O painel é um dos poucos lugares da plataforma em que a **ordem dos elementos é requisito**, e
não estética. Quem abre a plataforma no próprio celular não consegue apontar a câmera do
aparelho para a tela do mesmo aparelho; para essa pessoa, o QR é inútil e o copia e cola é o
único caminho. Pôr o QR primeiro, por ser mais vistoso, empurraria a maioria dos usuários para
o meio que não funciona no aparelho que estão usando. 🟢

## Dependências

- `models/contribuicao` — `montarBrCode`. Único acoplamento ao domínio.
- `interface/calculadora/area-de-transferencia` — adaptador de cópia, reusado das telas
  anteriores.
- `react-qr-code@2.2.0` — **primeira dependência de runtime desde a feature 010**, e entra
  atrás do envoltório `CodigoQr`, sem aparecer em nenhum outro arquivo (`MD-0024`).
- Primer React — `Dialog`, `Flash`, `Heading`, `Text`.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| O bloco de apoio fica fora do `map` do catálogo, o que marca a fronteira do não clínico na camada de interface. | `interface/inicio` | 🟢 |
| Os dados do beneficiário moram na apresentação, por serem dado de instalação e não regra. | `beneficiario.ts` | 🟢 |
| A chave fica no repositório, e não em `NEXT_PUBLIC_*`: num produto client-side a variável terminaria no mesmo bundle sem proteger nada, com a desvantagem de sumir da revisão de código. | `beneficiario.ts` | 🟢 |
| O `EXEMPLO` permanece como oráculo da guarda que reprova a suíte. | `beneficiario.ts` | 🟢 |
| A biblioteca de QR entra atrás de envoltório, para poder ser trocada num arquivo só. | `codigo-qr.tsx`; `MD-0024` | 🟢 |
| O comando de cópia é parametrizado e reusado, em vez de duplicado. | `acao-copiar.tsx` | 🟢 |
| Erro em vez de QR quando o payload falha. | `painel.tsx`, ramo `ParametroInvalido` | 🟢 |
| A dependência não essencial não governa o código HTTP da plataforma. | ADR 0020 | 🟢 |

## Estado Interno

Apenas a abertura do painel, mantida pelo gatilho, e a referência de retorno de foco. O
payload é recalculado a cada abertura, o que é barato e evita cache de algo que muda com a
configuração. 🟢

## Observabilidade

Nenhuma. A plataforma não sabe se alguém contribuiu, e essa ignorância é característica: não
há como cruzar contribuição com uso. 🟢

## Riscos e Lacunas

- 🟡 **Contrato emitido sem canal de erro.** Ver `contracts.md` de `models/contribuicao`. A
  conferência com aplicativo bancário real é humana e não roda em CI.
- 🟡 **`react-qr-code` acrescentou peso ao bundle** e encerrou a afirmação de zero dependência
  nova desde a feature 010. O envoltório limita o custo de trocá-la.
- 🟡 **A chave versionada exige disciplina de rotação:** trocar de chave é editar um arquivo e
  publicar, sem migração, mas quem tiver o código antigo salvo continuará a transferir para a
  chave antiga.
- 🟢 Nenhum dado de contribuinte transita pela plataforma.
