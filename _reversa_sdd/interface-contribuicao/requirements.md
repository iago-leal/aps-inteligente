# `interface/contribuicao` — Requisitos

> Unit de interface gerada pelo Reversa Writer na re-extração nº 4 (2026-07-28), a partir da
> feature `019-contribuicao-voluntaria-pix`.
> Não é tela: é um **painel** aberto a partir da página inicial, e fica deliberadamente
> **fora** do catálogo de calculadoras.

## Visão Geral

O painel exibe a chave PIX do mantenedor, o código copia e cola e o QR correspondente, para
quem quiser apoiar o projeto. Não processa nada: a transferência ocorre no aplicativo do
banco, e a plataforma não fica sabendo se ela aconteceu. 🟢

A fronteira entre o clínico e o não clínico se marca aqui, na segunda camada: o bloco de apoio
vive **fora** do `map` do catálogo, de modo que nenhuma leitura da página inicial confunda
contribuição com ferramenta clínica. 🟢

## Responsabilidades

- Oferecer o gatilho de apoio na página inicial, fora do catálogo. 🟢
- Montar o payload chamando o domínio, e exibi-lo em duas formas: copia e cola, e QR. 🟢
- Declarar, antes de qualquer código, o que a contribuição **não** compra. 🟢
- Manter os dados do beneficiário em ponto único de configuração. 🟢
- Prender o foco no painel e devolvê-lo ao gatilho ao fechar. 🟢

Fora de escopo: iniciar cobrança, confirmar recebimento, registrar contribuinte, contabilizar
qualquer coisa.

## Regras de Negócio

| ID | Regra | Confiança |
|----|-------|-----------|
| RN-01 | **Ordem do DOM deliberada:** os dois comandos de cópia vêm **antes** do QR. Quem abre a plataforma no próprio celular não tem como apontar a câmera do aparelho para a tela do mesmo aparelho — copiar é o caminho principal, não a conveniência secundária. | 🟢 |
| RN-02 | O painel declara, em prosa e antes do código, que a contribuição é voluntária, não compra funcionalidade, prioridade, suporte nem acesso, e que a plataforma continua gratuita para quem não contribuir. | 🟢 |
| RN-03 | O painel declara que nada é processado nem confirmado ali. | 🟢 |
| RN-04 | Os dados do beneficiário moram em `beneficiario.ts`, na apresentação e não no domínio, porque são dado de instalação e não regra. | 🟢 |
| RN-05 | A chave é pública por natureza — existe para ser exibida — e por isso fica no repositório, e não em variável `NEXT_PUBLIC_*`, que num produto client-side terminaria no mesmo bundle sem proteger nada. | 🟢 |
| RN-06 | O `EXEMPLO` permanece no código como **oráculo**: a suíte reprova enquanto o beneficiário real for igual a ele. | 🟢 |
| RN-07 | Payload inválido faz o painel exibir erro em vez do QR — nunca um beneficiário errado na câmera. | 🟢 |
| RN-08 | O QR entra atrás de envoltório próprio, e a biblioteca não aparece fora dele (`MD-0024`). | 🟢 |
| RN-09 | O QR tem papel de imagem e rótulo acessível descritivo. | 🟢 |
| RN-10 | A dependência não essencial não governa o código HTTP da plataforma (ADR 0020). | 🟢 |

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|--------------------|
| RF-01 | Exibir o gatilho de apoio na página inicial, fora do catálogo. | Must | Teste de integração da home. |
| RF-02 | Abrir o painel como diálogo, com foco preso e fechamento por Esc. | Must | Teste de integração do painel. |
| RF-03 | Montar o payload pelo domínio e exibi-lo como código copia e cola. | Must | Mesmo teste. |
| RF-04 | Exibir a chave PIX em texto, com comando de cópia próprio. | Must | Mesmo teste. |
| RF-05 | Exibir o QR do payload, depois dos comandos de cópia. | Must | Mesmo teste, conferindo a ordem no DOM. |
| RF-06 | Exibir as três declarações do que a contribuição não é. | Must | Mesmo teste. |
| RF-07 | Exibir erro quando o payload não puder ser montado. | Must | Mesmo teste, com beneficiário inválido. |
| RF-08 | Devolver o foco ao gatilho ao fechar. | Should | `returnFocusRef`. |
| RF-09 | Aceitar a função de cópia injetada. | Should | Prop `copiar`. |
| RF-10 | Reprovar a suíte enquanto o beneficiário for o de exemplo. | Must | Guarda contra `EXEMPLO`. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Nenhum dado de quem contribui é coletado; não há chamada de rede. | `painel.tsx` — só `montarBrCode` | 🟢 |
| Acessibilidade | O QR declara `role="img"` e rótulo; o diálogo é o do Primer. | `codigo-qr.tsx`, `painel.tsx` | 🟢 |
| Tamanho do bundle | `react-qr-code@2.2.0` é a primeira dependência de runtime desde a feature 010, e entra atrás de envoltório. | `dependencies.md` | 🟡 |
| Configurabilidade | Ponto único para chave, nome e cidade. | `beneficiario.ts` | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: abertura do painel
  Dado a página inicial
  Quando o usuário aciona o apoio
  Então o painel abre com foco preso
  E as três declarações aparecem antes de qualquer código

Cenário: ordem dos meios
  Dado o painel aberto
  Então o comando de copiar o código copia e cola vem antes do QR no DOM
  E o comando de copiar a chave também

Cenário: beneficiário inválido
  Dado um nome de beneficiário acima de 25 caracteres
  Quando o painel monta o código
  Então o painel mostra erro, e nenhum QR é exibido

Cenário: guarda do exemplo
  Dado o beneficiário igual ao EXEMPLO
  Quando a suíte roda
  Então ela reprova, porque publicar o exemplo seria publicar uma chave que não recebe
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Código copia e cola antes do QR | Must | É o caminho de quem usa no celular, que é a maioria. |
| Declarações do que a contribuição não é | Must | Sem elas, o painel sugeriria compra de vantagem. |
| Erro em vez de QR quando o payload falha | Must | QR errado dirige dinheiro a beneficiário errado. |
| Guarda do exemplo | Must | Falha silenciosa com consequência financeira. |
| Foco preso e devolvido | Should | Acessibilidade do diálogo. |
| QR | Should | Conveniência para quem lê de outro aparelho. |

## Rastreabilidade de Código

| Arquivo | Função / Componente | Cobertura |
|---------|---------------------|-----------|
| `interface/contribuicao/bloco-de-apoio.tsx` | `BlocoDeApoio` — gatilho na home | 🟢 |
| `interface/contribuicao/painel.tsx` | `PainelContribuicao` | 🟢 |
| `interface/contribuicao/acao-copiar.tsx` | `AcaoCopiar` | 🟢 |
| `interface/contribuicao/codigo-qr.tsx` | `CodigoQr` — envoltório de `react-qr-code` | 🟢 |
| `interface/contribuicao/beneficiario.ts` | `BENEFICIARIO`, `EXEMPLO` | 🟢 |

**Cobertura de testes:** testes de integração do painel e da home, mais
`e2e/contribuicao.spec.ts` (abertura do diálogo, ordem dos meios no DOM, foco e
acessibilidade).
