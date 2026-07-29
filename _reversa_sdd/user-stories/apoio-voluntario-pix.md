# User Story — Apoio voluntário por PIX

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `019-contribuicao-voluntaria-pix`.
> Units: `models/contribuicao`, `interface/contribuicao`, `interface/inicio`.
> **A única história da plataforma que não é clínica** (ADR 0016, `MD-0022`).

## História

**Como** pessoa que usa a plataforma e a considera útil,
**quero** contribuir voluntariamente por PIX,
**para** ajudar a manter o projeto — sabendo que a contribuição não me compra nada.

## Contexto de uso

A plataforma é gratuita e mantida por uma pessoa só. A contribuição existe para custear o
domínio e o tempo, e não para criar camada paga. Daí a forma da tela: as três declarações do
que a contribuição **não** é vêm antes de qualquer código, e não depois, em letra miúda.

Há um detalhe de uso que decidiu o desenho: a maioria abre a plataforma no celular, e **não dá
para apontar a câmera do aparelho para a tela do mesmo aparelho**. Por isso o código copia e
cola vem antes do QR na ordem do DOM. O QR serve a quem lê de outro aparelho, e é o caminho
secundário.

## Fluxo principal

1. Na página inicial, o usuário encontra o bloco de apoio — **fora** do catálogo de
   calculadoras.
2. Aciona o bloco; o painel abre com o foco preso.
3. Lê as três declarações: a contribuição é voluntária, não compra funcionalidade nem
   prioridade, e a plataforma continua gratuita para quem não contribuir.
4. Copia o código copia e cola, ou a chave, ou lê o QR de outro aparelho.
5. Conclui a transferência **no aplicativo do banco**. A plataforma não fica sabendo.

## Fluxos alternativos

- **Dados do beneficiário inválidos.** O painel mostra erro em vez do QR — nunca um
  beneficiário errado na câmera de quem contribui.
- **Beneficiário ainda igual ao exemplo.** A suíte reprova antes de qualquer publicação.
- **Usuário fecha o painel.** O foco volta ao gatilho.

## Critérios de aceitação

```gherkin
Dado a página inicial
Quando o usuário aciona o apoio
Então as três declarações aparecem antes de qualquer código

Dado o painel aberto
Então o comando de copiar o código vem antes do QR no DOM

Dado um nome de beneficiário acima de 25 caracteres
Então o painel mostra erro, e nenhum QR é exibido
```

## Valor entregue

Quem quer apoiar consegue fazê-lo em dois toques, no aparelho que já tem na mão, sem sair para
procurar chave em outro lugar. Quem não quer não é interpelado: o bloco fica ao fim da home, e
nada na plataforma muda por causa dele.

## O que a história **não** cobre

- **Confirmação.** A plataforma não sabe se houve contribuição, e não tem como saber. Não há
  contabilidade, recibo nem agradecimento automático.
- **Vantagem.** Nenhuma funcionalidade é destravada, agora ou depois.
- **Identificação.** Nenhum dado de quem contribui transita pela plataforma.

## Por que ela vive fora do catálogo

O catálogo significa "as calculadoras da plataforma", e desde a feature 018 essa afirmação é
aferida contra ele para produzir a descrição do produto. Um item que não calcula nada dentro do
catálogo corromperia as duas coisas ao mesmo tempo: a navegação e o oráculo da descrição. A
fronteira entre o clínico e o não clínico se marca em duas camadas — a isenção declarada no
domínio, e a posição do bloco na interface.
