# Registro de Qualidade de Código (Reversa Refactor)

> GENERATED / MANAGED pelo time Code Quality do Reversa. Este README guarda as políticas do registro.
> As pastas de contexto e os artefatos de transformação nascem sob demanda.

## Políticas

- `control_mode`: **autonomous** (decisão de iago em 2026-07-30)
  - Aplica automaticamente o que estiver 🟢 e provado. Mesmo aqui têm gate obrigatório:
    remover código, alterar spec efetiva, enviar material a harness externo, operação
    destrutiva.
  - Corolário neste projeto: o que sustenta o modo autônomo é a rede de segurança, não a
    pressa. Oportunidade 🟡 ou 🔴 continua parando no gate, porque a política de rede é
    `require-characterization` e ela é quem manda no que pode correr sozinho.
- `safety_net_policy`: **require-characterization** (padrão)
  - Transformação que altera estrutura ou lógica exige rede de segurança (testes existentes
    + caracterização) verde antes e depois.

## Invariante do registro

Nenhuma transformação altera comportamento observável. O que não prova preservação, para no
gate. Toda transformação aplicada é revertível pelo diff guardado.

## Fronteira com o ciclo forward

Este registro não é caminho alternativo para entregar funcionalidade. Pedido que muda o que
o usuário vê ou pode fazer sai daqui e entra em `/reversa-requirements`, ainda que tenha
chegado junto com um pedido de refatoração. O que o Code Quality faz por uma feature futura
é preparar o terreno em que ela vai pousar, e dizer com todas as letras onde a fronteira
passa.

## Estrutura

```
_reversa_refactor/
  README.md                         (este arquivo)
  <contexto>/                        (feature, módulo ou caso de uso)
    opportunities/                   (oportunidades detectadas, uma por arquivo)
    transformations/
      OPP-<data>-<sufixo>-<slug>/
        plan.html                    (relatório visual do plano, antes de tocar arquivo)
        safety-net/                  (testes de caracterização + resultado verde/vermelho)
        before-after/                (evidência: medição, prova de equivalência, prova de morte)
        CHG-NNN.diff                 (diffs aplicados, fonte de reversão)
        transformation.md            (registro conforme opportunity-schema.md)
    generated/                       (index e catalog regeneráveis, nunca editados à mão)
```

## Contextos

| Contexto | Aberto em | Oportunidades | Estado |
|----------|-----------|---------------|--------|
| `pagina-inicial` | 2026-07-30 | 6 | 2 aplicadas (R8FJ, P2WH), 4 propostas |
